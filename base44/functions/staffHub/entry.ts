import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non autorisé' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '');
    const roleLabels = { responsable:'Responsable',chef_cuisine:'Chef de cuisine',cuisinier:'Cuisinier',commis:'Commis',maitre_hotel:'Maître d’hôtel',serveur:'Serveur',barman:'Barman',plongeur:'Plongeur',logistique:'Logistique',livreur:'Livreur',administratif:'Administratif',autre:'Autre' };
    const ownedProfiles = await base44.asServiceRole.entities.CatererProfile.filter({ created_by_id: user.id }, '-created_date', 1);
    const profile = ownedProfiles[0] || null;
    const requireManager = () => { if (!profile && user.role !== 'admin') throw new Error('Accès réservé aux traiteurs'); };
    const sendNotice = async (to, subject, bodyText) => {
      if (!to) return false;
      try { await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body: bodyText, from_name: profile?.business_name || 'Un Bon Traiteur' }); return true; }
      catch (error) { console.error('staffHub email', to, error.message); return false; }
    };
    const sendAssignmentNotice = async (quote, assignment, personType) => {
      if (!assignment.assignee_email) return false;
      try {
        await base44.functions.invoke('sendN8nWebhook', {
          entity_name: 'QuoteRequest', entity_id: quote.id, event_name: 'staff_assignment_notified', delivery_key: assignment.id,
          context: { recipient_email: assignment.assignee_email, recipient_name: assignment.assignee_name, person_type: personType, caterer_name: profile?.business_name || '', job_role: assignment.job_role, event_date: assignment.event_date, event_time: assignment.start_time || '', location: assignment.location || '', event_label: assignment.event_label || '', assignment_status: assignment.status }
        });
        return true;
      } catch (error) { console.error('staffHub n8n notification', assignment.assignee_email, error.message); return false; }
    };
    const loadQuote = async quoteId => {
      const quote = await base44.asServiceRole.entities.QuoteRequest.get(String(quoteId || ''));
      if (!quote) throw new Error('Devis introuvable');
      if (user.role !== 'admin' && quote.caterer_id !== profile?.id) throw new Error('Accès refusé');
      return quote;
    };

    if (action === 'manager_data') {
      requireManager();
      const [employees, assignments, leaves] = await Promise.all([
        base44.asServiceRole.entities.Employee.filter({ caterer_user_id: user.id }, 'last_name', 300),
        base44.asServiceRole.entities.StaffAssignment.filter({ caterer_user_id: user.id }, '-event_date', 500),
        base44.asServiceRole.entities.LeaveRequest.filter({ caterer_user_id: user.id }, '-created_date', 300)
      ]);
      return Response.json({ profile, employees, assignments, leaves });
    }

    if (action === 'create_employee') {
      requireManager();
      const data = body.data || {};
      const email = String(data.email || '').trim().toLowerCase();
      if (!email || !data.first_name || !data.last_name || !roleLabels[data.job_role]) return Response.json({ error: 'Informations salarié incomplètes' }, { status: 400 });
      const duplicate = await base44.asServiceRole.entities.Employee.filter({ caterer_user_id: user.id, email }, '-created_date', 1);
      if (duplicate.length) return Response.json({ error: 'Ce salarié existe déjà' }, { status: 409 });
      let invitedUser = null;
      try { invitedUser = await base44.users.inviteUser(email, 'user'); } catch (error) { console.info('Employee already invited or registered', email); }
      const users = await base44.asServiceRole.entities.User.filter({ email }, '-created_date', 1);
      const employeeUser = users[0] || invitedUser;
      if (employeeUser?.id) await base44.asServiceRole.entities.User.update(employeeUser.id, { account_type: 'employee', employer_user_id: user.id });
      const employee = await base44.entities.Employee.create({ caterer_id: profile.id, caterer_user_id: user.id, user_id: employeeUser?.id || '', first_name: String(data.first_name).trim(), last_name: String(data.last_name).trim(), email, phone: String(data.phone || '').trim(), birth_date: data.birth_date || undefined, job_role: data.job_role, custom_role: String(data.custom_role || '').trim(), experience_years: Number(data.experience_years || 0), skills: Array.isArray(data.skills) ? data.skills : [], weekly_days: Array.isArray(data.weekly_days) ? data.weekly_days : [], status: employeeUser?.id ? 'active' : 'invited', notes: String(data.notes || '').trim() });
      return Response.json({ employee, invited: true });
    }

    if (action === 'update_employee') {
      requireManager();
      const employee = await base44.asServiceRole.entities.Employee.get(String(body.employee_id || ''));
      if (!employee || (user.role !== 'admin' && employee.caterer_user_id !== user.id)) return Response.json({ error: 'Salarié introuvable' }, { status: 404 });
      const allowed = ['first_name','last_name','phone','birth_date','job_role','custom_role','experience_years','skills','weekly_days','status','notes'];
      const patch = {}; for (const key of allowed) if (body.data?.[key] !== undefined) patch[key] = body.data[key];
      const updated = await base44.asServiceRole.entities.Employee.update(employee.id, patch);
      return Response.json({ employee: updated });
    }

    if (action === 'recommend') {
      requireManager();
      const quote = await loadQuote(body.quote_id);
      const guests = Math.max(1, Number(quote.guest_count || 1));
      const searchable = `${quote.event_type || ''} ${quote.format || ''} ${(quote.services || []).join(' ')}`.toLowerCase();
      const needs = [{ role:'responsable', count:1 }, { role:'cuisinier', count:Math.max(1, Math.ceil(guests / 50)) }, { role:'serveur', count:Math.max(1, Math.ceil(guests / 20)) }];
      if (searchable.includes('cocktail') || searchable.includes('bar') || searchable.includes('boisson')) needs.push({ role:'barman', count:Math.max(1, Math.ceil(guests / 60)) });
      if (guests >= 80) needs.push({ role:'plongeur', count:Math.ceil(guests / 100) });
      const [employees, assignments, leaves, extras, bookings] = await Promise.all([
        base44.asServiceRole.entities.Employee.filter({ caterer_user_id: user.id, status: 'active' }, 'last_name', 300),
        base44.asServiceRole.entities.StaffAssignment.filter({ caterer_user_id: user.id, event_date: quote.event_date, status: { $in: ['pending','accepted'] } }, '-created_date', 500),
        base44.asServiceRole.entities.LeaveRequest.filter({ caterer_user_id: user.id, status: 'approved' }, '-created_date', 300),
        base44.asServiceRole.entities.ExtraProfile.filter({ status: 'approved', active: true, available: true }, '-experience_years', 300),
        base44.asServiceRole.entities.ExtraBooking.filter({ booking_date: quote.event_date, status: { $in: ['pending','confirmed'] } }, '-created_date', 500)
      ]);
      const weekday = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date(`${quote.event_date}T12:00:00`).getDay()];
      const busyEmployees = new Set(assignments.map(item => item.employee_id));
      const unavailable = new Set(leaves.filter(item => item.start_date <= quote.event_date && item.end_date >= quote.event_date).map(item => item.employee_id));
      const busyExtras = new Set(bookings.map(item => item.extra_profile_id));
      const requirements = needs.map(need => {
        const employeeCandidates = employees.filter(item => item.job_role === need.role && !busyEmployees.has(item.id) && !unavailable.has(item.id) && (!(item.weekly_days || []).length || item.weekly_days.includes(weekday))).slice(0, need.count);
        const terms = { responsable:['Maître d’hôtel','Responsable'],cuisinier:['Chef','Cuisinier','Commis de cuisine'],serveur:['Serveur','Maître d’hôtel'],barman:['Barman'],plongeur:['Plongeur'] }[need.role] || [];
        const extraCandidates = extras.filter(item => !busyExtras.has(item.id) && (item.availability_dates || []).includes(quote.event_date) && (item.skills || []).some(skill => terms.includes(skill))).slice(0, Math.max(0, need.count - employeeCandidates.length));
        return { ...need, label: roleLabels[need.role], employeeCandidates, extraCandidates };
      });
      const current = await base44.asServiceRole.entities.StaffAssignment.filter({ quote_id: quote.id }, '-created_date', 200);
      return Response.json({ quote, requirements, current });
    }

    if (action === 'approve_plan') {
      requireManager();
      const quote = await loadQuote(body.quote_id);
      const selections = Array.isArray(body.selections) ? body.selections : [];
      if (!selections.length) return Response.json({ error: 'Sélectionnez au moins une personne' }, { status: 400 });
      const existing = await base44.asServiceRole.entities.StaffAssignment.filter({ quote_id: quote.id, status: { $in: ['pending','accepted'] } }, '-created_date', 300);
      const created = []; let notified = 0;
      for (const selection of selections) {
        if (selection.type === 'employee') {
          if (existing.some(item => item.employee_id === selection.id)) continue;
          const employee = await base44.asServiceRole.entities.Employee.get(selection.id);
          if (!employee || employee.caterer_user_id !== user.id) continue;
          let assignment = await base44.entities.StaffAssignment.create({ quote_id: quote.id, caterer_id: profile.id, caterer_user_id: user.id, assignee_type: 'employee', employee_id: employee.id, assignee_user_id: employee.user_id || '', assignee_email: employee.email, assignee_name: `${employee.first_name} ${employee.last_name}`, job_role: selection.role || employee.job_role, event_date: quote.event_date, start_time: quote.event_time || '', location: quote.location, event_label: `${quote.event_type} · ${quote.reference}`, status: 'pending' });
          if (await sendAssignmentNotice(quote, assignment, 'employee')) { assignment = await base44.asServiceRole.entities.StaffAssignment.update(assignment.id, { notified_at: new Date().toISOString() }); notified++; }
          created.push(assignment);
        }
        if (selection.type === 'extra') {
          if (existing.some(item => item.extra_profile_id === selection.id)) continue;
          const extra = await base44.asServiceRole.entities.ExtraProfile.get(selection.id);
          if (!extra || extra.status !== 'approved') continue;
          const booking = await base44.asServiceRole.entities.ExtraBooking.create({ extra_profile_id: extra.id, extra_user_id: extra.created_by_id, initiated_by: 'caterer', extra_name: `${extra.first_name} ${extra.last_name}`, extra_phone: extra.phone, extra_email: extra.email, extra_city: extra.city, extra_skills: extra.skills || [], extra_experience: `${extra.experience_years || 0} an(s)`, caterer_id: profile.id, caterer_user_id: user.id, caterer_name: profile.business_name, caterer_slug: profile.slug, caterer_contact_name: profile.contact_name, caterer_phone: profile.phone, caterer_email: user.email, caterer_address: profile.address, caterer_city: profile.city, booking_date: quote.event_date, period: 'day', location: quote.location, service_details: `${roleLabels[selection.role] || selection.role} · ${quote.event_type} · ${quote.reference}`, status: 'pending' });
          let assignment = await base44.entities.StaffAssignment.create({ quote_id: quote.id, caterer_id: profile.id, caterer_user_id: user.id, assignee_type: 'extra', extra_profile_id: extra.id, booking_id: booking.id, assignee_user_id: extra.created_by_id, assignee_email: extra.email, assignee_name: `${extra.first_name} ${extra.last_name}`, job_role: selection.role, event_date: quote.event_date, start_time: quote.event_time || '', location: quote.location, event_label: `${quote.event_type} · ${quote.reference}`, status: 'pending' });
          if (await sendAssignmentNotice(quote, assignment, 'extra')) { assignment = await base44.asServiceRole.entities.StaffAssignment.update(assignment.id, { notified_at: new Date().toISOString() }); notified++; }
          created.push(assignment);
        }
      }
      return Response.json({ created, notified });
    }

    if (action === 'employee_portal') {
      let employees = await base44.asServiceRole.entities.Employee.filter({ user_id: user.id }, '-created_date', 5);
      if (!employees.length) employees = await base44.asServiceRole.entities.Employee.filter({ email: user.email }, '-created_date', 5);
      const employee = employees[0];
      if (!employee) return Response.json({ error: 'Aucun compte salarié associé' }, { status: 404 });
      if (employee.user_id !== user.id) await base44.asServiceRole.entities.Employee.update(employee.id, { user_id: user.id, status: 'active' });
      await base44.auth.updateMe({ account_type: 'employee', employer_user_id: employee.caterer_user_id });
      const [assignments, leaves] = await Promise.all([
        base44.asServiceRole.entities.StaffAssignment.filter({ assignee_email: user.email }, 'event_date', 300),
        base44.asServiceRole.entities.LeaveRequest.filter({ employee_email: user.email }, '-created_date', 200)
      ]);
      return Response.json({ employee: { ...employee, user_id: user.id }, assignments, leaves });
    }

    if (action === 'respond_assignment') {
      const assignment = await base44.asServiceRole.entities.StaffAssignment.get(String(body.assignment_id || ''));
      if (!assignment || (assignment.assignee_user_id !== user.id && assignment.assignee_email !== user.email)) return Response.json({ error: 'Affectation introuvable' }, { status: 404 });
      const status = body.status === 'accepted' ? 'accepted' : body.status === 'declined' ? 'declined' : '';
      if (!status) return Response.json({ error: 'Réponse invalide' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.StaffAssignment.update(assignment.id, { status, responded_at: new Date().toISOString(), assignee_user_id: user.id });
      if (assignment.booking_id) await base44.asServiceRole.entities.ExtraBooking.update(assignment.booking_id, { status: status === 'accepted' ? 'confirmed' : 'declined', accepted_at: status === 'accepted' ? new Date().toISOString() : undefined });
      return Response.json({ assignment: updated });
    }

    if (action === 'submit_leave') {
      const employees = await base44.asServiceRole.entities.Employee.filter({ email: user.email }, '-created_date', 1);
      const employee = employees[0]; const data = body.data || {};
      if (!employee) return Response.json({ error: 'Compte salarié introuvable' }, { status: 404 });
      if (!data.start_date || !data.end_date || data.end_date < data.start_date) return Response.json({ error: 'Période de congé invalide' }, { status: 400 });
      const leave = await base44.entities.LeaveRequest.create({ employee_id: employee.id, caterer_user_id: employee.caterer_user_id, employee_user_id: user.id, employee_email: user.email, employee_name: `${employee.first_name} ${employee.last_name}`, start_date: data.start_date, end_date: data.end_date, leave_type: data.leave_type || 'paid_leave', reason: String(data.reason || '').slice(0, 1000), status: 'pending' });
      return Response.json({ leave });
    }

    if (action === 'leave_decision') {
      requireManager(); const leave = await base44.asServiceRole.entities.LeaveRequest.get(String(body.leave_id || ''));
      if (!leave || (user.role !== 'admin' && leave.caterer_user_id !== user.id)) return Response.json({ error: 'Demande introuvable' }, { status: 404 });
      const status = body.status === 'approved' ? 'approved' : body.status === 'declined' ? 'declined' : '';
      if (!status) return Response.json({ error: 'Décision invalide' }, { status: 400 });
      const updated = await base44.asServiceRole.entities.LeaveRequest.update(leave.id, { status, manager_note: String(body.manager_note || '').slice(0, 500) });
      await sendNotice(leave.employee_email, `Votre demande de congé est ${status === 'approved' ? 'acceptée' : 'refusée'}`, `Période du ${leave.start_date} au ${leave.end_date}. ${body.manager_note || ''}`);
      return Response.json({ leave: updated });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    console.error('staffHub', error);
    return Response.json({ error: error.message || 'Action RH impossible' }, { status: 500 });
  }
}