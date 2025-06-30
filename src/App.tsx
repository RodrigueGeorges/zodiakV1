import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import React, { Suspense, useEffect, startTransition } from 'react';
import { AstrologyService } from './lib/astrology';
import { GuidanceService } from './lib/services/GuidanceService';
import { OpenAIService } from './lib/services/OpenAIService';
import { SMSService } from './lib/sms';
import { StorageService } from './lib/storage';
import { SuperAuthService } from './lib/auth';
import { SupabaseOptimizationService } from './lib/services/SupabaseOptimizationService';
import { TrialExpiryService } from './lib/services/TrialExpiryService';
import { BrevoService } from './lib/services/BrevoService';
import { ApiService } from './lib/api';
import { PerformanceMonitor } from './lib/performance/PerformanceMonitor';
import { Logger } from './lib/logging/Logger';
console.log('AstrologyService loaded:', AstrologyService);
console.log('GuidanceService loaded:', GuidanceService);
console.log('OpenAIService loaded:', OpenAIService);
console.log('SMSService loaded:', SMSService);
console.log('StorageService loaded:', StorageService);
console.log('AuthService loaded:', SuperAuthService);
console.log('SupabaseOptimizationService loaded:', SupabaseOptimizationService);
console.log('TrialExpiryService loaded:', TrialExpiryService);
console.log('BrevoService loaded:', BrevoService);
console.log('ApiService loaded:', ApiService);
console.log('PerformanceMonitor loaded:', PerformanceMonitor);
console.log('Logger loaded:', Logger);
// Lazy load des pages principales
const Home = React.lazy(() => import('./pages/Home'));
const Register = React.lazy(() => import('./pages/Register'));
const Guidance = React.lazy(() => import('./pages/Guidance'));
const Subscribe = React.lazy(() => import('./pages/Subscribe'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Natal = React.lazy(() => import('./pages/Natal'));
const Test = React.lazy(() => import('./pages/Test'));
const Admin = React.lazy(() => import('./pages/Admin'));
import Login from './pages/Login';
import RegisterComplete from './pages/RegisterComplete';
import { StarryBackground } from './components/StarryBackground';
import { LoadingScreen } from './components/LoadingScreen';
import { useGuidanceScheduler } from './lib/hooks/useGuidanceScheduler';
import { usePreview } from './lib/hooks/usePreview';
import { CosmicPageTransition } from './components/CosmicPageTransition';
import { useAuth } from './lib/hooks/useAuth.tsx';
import { BottomNavBar } from './components/BottomNavBar';
import { Header } from './components/Header';
import Tabs from './components/Tabs';
import { MagicButtonX } from './components/MagicButtonX';
console.log('MagicButtonX loaded:', MagicButtonX);

// Router component to encapsulate routing logic
function AppRouter() {
  const { session, profile, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const isAuthPage = ['/login', '/register'].includes(location.pathname);
    const isRegisterCompletePage = location.pathname === '/register/complete';
    const isProtectedPage = ['/profile', '/natal', '/guidance', '/admin'].includes(location.pathname);

    if (session) {
      if (!profile && !isRegisterCompletePage) {
        navigate('/register/complete', { replace: true });
      }
      else if (profile && !profile.natal_chart && !isRegisterCompletePage) {
        navigate('/register/complete', { replace: true });
      } 
      else if (profile?.natal_chart && (isAuthPage || location.pathname === '/')) {
        navigate('/guidance', { replace: true });
      }
    } else {
      const isPublicPage = isAuthPage || isRegisterCompletePage || location.pathname === '/';
      if (!isPublicPage) {
        navigate('/login', { replace: true });
      }
    }
  }, [session, profile, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <LoadingScreen message="Vérification de la session..." />;
  }
  
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/complete" element={<RegisterComplete />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/guidance" element={
          <PrivateRoute>
            <Guidance />
          </PrivateRoute>
        } />
        <Route path="/admin" element={
          <PrivateRoute>
            <Admin />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/natal" element={
          <PrivateRoute>
            <Natal />
          </PrivateRoute>
        } />
        {import.meta.env.DEV && <Route path="/test" element={<Test />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  usePreview();
  useGuidanceScheduler();

  // Déterminer si le header doit être affiché
  const hideHeaderRoutes = ['/', '/login', '/register', '/register/complete'];
  const showHeader = !hideHeaderRoutes.includes(location.pathname);

  // Définir les onglets globaux
  const tabs = [
    { key: 'profile', label: 'Profil' },
    { key: 'natal', label: 'Thème Natal' },
    { key: 'guidance', label: 'Guidance' }
  ];
  // Déduire l'onglet actif selon la route
  let activeTab = 'profile';
  if (location.pathname.startsWith('/natal')) activeTab = 'natal';
  else if (location.pathname.startsWith('/guidance')) activeTab = 'guidance';
  else if (location.pathname.startsWith('/profile')) activeTab = 'profile';

  // Handler de navigation
  const handleTabChange = (key: string) => {
    if (key === 'profile') navigate('/profile');
    else if (key === 'natal') navigate('/natal');
    else if (key === 'guidance') navigate('/guidance');
  };

  return (
    <div className="min-h-screen bg-cosmic-900 text-white relative">
      <StarryBackground />
      {/* Header unifié Zodiak */}
      {showHeader && <Header />}
      {/* Onglets globaux desktop - supprimés, ils sont maintenant dans le header */}
      <div className="relative z-10">
        <CosmicPageTransition locationKey={location.key}>
          <AppRouter />
        </CosmicPageTransition>
      </div>
      <BottomNavBar />
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default App;