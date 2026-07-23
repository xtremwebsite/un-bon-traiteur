import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
      <Route path="/" element={<Home />} />
      <Route path="/recherche" element={<Search />} />
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
          <AuthenticatedApp />
          <CookieBanner />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App