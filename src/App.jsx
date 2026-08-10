import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import CatererProfile from '@/pages/CatererProfile';
import QuoteRequest from '@/pages/QuoteRequest';
import UrgentRequest from '@/pages/UrgentRequest';
import Ranking from '@/pages/Ranking';
import Guides from '@/pages/Guides';
import ProSpace from '@/pages/ProSpace';
import Legal from '@/pages/Legal';
import CookieBanner from '@/components/site/CookieBanner';
import VisitTracker from '@/components/site/VisitTracker';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Admin from '@/pages/Admin';
import ProRegistration from '@/pages/ProRegistration';
import ProDashboard from '@/pages/ProDashboard';
import CatererMap from '@/pages/CatererMap';
import AccountPortal from '@/pages/AccountPortal';
import ProOpportunities from '@/pages/ProOpportunities';
import ProExtras from '@/pages/ProExtras';
import ExtraRegistration from '@/pages/ExtraRegistration';
import ProExtraTracking from '@/pages/ProExtraTracking';
import ExtraOpportunities from '@/pages/ExtraOpportunities';
import ProQuotes from '@/pages/ProQuotes';
import ProPlanning from '@/pages/ProPlanning';
import ProProfile from '@/pages/ProProfile';
import ProHR from '@/pages/ProHR';
import EmployeePortal from '@/pages/EmployeePortal';
import ClientQuotes from '@/pages/ClientQuotes';
import AccountTypeRoute from '@/components/AccountTypeRoute';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?next=/admin" replace />} />}>
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?next=/inscription-traiteur" replace />} />}>
        <Route path="/inscription-traiteur" element={<ProRegistration />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?next=/tableau-de-bord-traiteur" replace />} />}>
        <Route element={<AccountTypeRoute type="caterer" />}>
          <Route path="/tableau-de-bord-traiteur" element={<ProDashboard />} />
          <Route path="/devis-traiteur" element={<ProQuotes />} />
          <Route path="/planning-traiteur" element={<ProPlanning />} />
          <Route path="/profil-traiteur" element={<ProProfile />} />
          <Route path="/rh-traiteur" element={<ProHR />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?next=/espace-employe" replace />} />}>
        <Route element={<AccountTypeRoute type="employee" />}>
          <Route path="/espace-employe" element={<EmployeePortal />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?next=/mon-espace" replace />} />}>
        <Route path="/mon-espace" element={<AccountPortal />} />
        <Route path="/mes-devis" element={<ClientQuotes />} />
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?next=/opportunites-pro" replace />} />}>
        <Route element={<AccountTypeRoute type="caterer" />}>
          <Route path="/opportunites-pro" element={<ProOpportunities />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?next=/extras-pro" replace />} />}>
        <Route element={<AccountTypeRoute type="caterer" />}>
          <Route path="/extras-pro" element={<ProExtras />} />
          <Route path="/suivi-extras" element={<ProExtraTracking />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login?next=/inscription-extra" replace />} />}>
        <Route path="/inscription-extra" element={<ExtraRegistration />} />
        <Route element={<AccountTypeRoute type="extra" />}>
          <Route path="/annonces-extra" element={<ExtraOpportunities />} />
        </Route>
      </Route>
      <Route path="/" element={<Home />} />
      <Route path="/recherche" element={<Search />} />
      <Route path="/carte" element={<CatererMap />} />
      <Route path="/traiteurs/:slug" element={<CatererProfile />} />
      <Route path="/demande-devis" element={<QuoteRequest />} />
      <Route path="/urgence-traiteur" element={<UrgentRequest />} />
      <Route path="/referencement" element={<Ranking />} />
      <Route path="/guides" element={<Guides />} />
      <Route path="/espace-traiteur" element={<ProSpace />} />
      <Route path="/legal/:slug" element={<Legal />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <VisitTracker />
          <AuthenticatedApp />
          <CookieBanner />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App