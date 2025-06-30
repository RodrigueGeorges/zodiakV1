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
import { ButtonZodiak } from './components/ButtonZodiak';
import { PhoneAuth } from './components/PhoneAuth';
import { SMSTest } from './components/SMSTest';
import { LoginButton } from './components/LoginButton';
import { GuidanceContent } from './components/GuidanceContent';
import { BottomNavBar } from './components/BottomNavBar';
import { Header } from './components/Header';
import { NatalChartTab } from './components/NatalChartTab';
import { InteractiveCard } from './components/InteractiveCard';
import { Toast } from './components/Toast';
import Tabs from './components/Tabs';
import { ProfileTab } from './components/ProfileTab';
import { ShareModal } from './components/ShareModal';
import { NatalChartSVG } from './components/NatalChartSVG';
import { FormattedGuidanceText } from './components/FormattedGuidanceText';
import { PlaceAutocomplete } from './components/PlaceAutocomplete';
import { UserListTest } from './components/UserListTest';
import { PlaceSearchTest } from './components/PlaceSearchTest';
import { PerformanceMonitor as PerformanceMonitorComponent } from './components/PerformanceMonitor';
import { Logo } from './components/Logo';
import { NatalSignature } from './components/NatalSignature';
import { GuidanceMeter } from './components/GuidanceMeter';
import { CosmicPageTransition } from './components/CosmicPageTransition';
import { LoadingScreen } from './components/LoadingScreen';
import { AstrologyTest } from './components/AstrologyTest';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AddressAutocomplete } from './components/AddressAutocomplete';
import { DeliveryStatus } from './components/DeliveryStatus';
import { InboundMessages } from './components/InboundMessages';
import { PageTransition } from './components/PageTransition';
import { StarryBackground } from './components/StarryBackground';
import { StripeSubscription } from './components/StripeSubscription';

// Extend Window interface for test properties
declare global {
  interface Window {
    __testButtonZodiak: any;
    __testAstrologyService: any;
    __testGuidanceService: any;
    __testOpenAIService: any;
    __testSMSService: any;
    __testStorageService: any;
    __testAuthService: any;
    __testSupabaseService: any;
    __testTrialService: any;
    __testBrevoService: any;
    __testApiService: any;
    __testPerformanceMonitor: any;
    __testLogger: any;
  }
}

// Force inclusion of all services and components in the bundle
if (typeof window !== 'undefined') {
  window.__testButtonZodiak = ButtonZodiak;
  window.__testAstrologyService = AstrologyService;
  window.__testGuidanceService = GuidanceService;
  window.__testOpenAIService = OpenAIService;
  window.__testSMSService = SMSService;
  window.__testStorageService = StorageService;
  window.__testAuthService = SuperAuthService;
  window.__testSupabaseService = SupabaseOptimizationService;
  window.__testTrialService = TrialExpiryService;
  window.__testBrevoService = BrevoService;
  window.__testApiService = ApiService;
  window.__testPerformanceMonitor = PerformanceMonitor;
  window.__testLogger = Logger;
}

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

import { useGuidanceScheduler } from './lib/hooks/useGuidanceScheduler';
import { usePreview } from './lib/hooks/usePreview';
import { useAuth } from './lib/hooks/useAuth.tsx';

console.log('ButtonZodiak loaded:', ButtonZodiak);

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

  // Force inclusion of all services and components
  useEffect(() => {
    // Force inclusion of all services
    console.log('Forcing service inclusion:', {
      AstrologyService,
      GuidanceService,
      OpenAIService,
      SMSService,
      StorageService,
      SuperAuthService,
      SupabaseOptimizationService,
      TrialExpiryService,
      BrevoService,
      ApiService,
      PerformanceMonitor,
      Logger
    });

    // Force inclusion of all components
    console.log('Forcing component inclusion:', {
      ButtonZodiak,
      PhoneAuth,
      SMSTest,
      LoginButton,
      GuidanceContent,
      BottomNavBar,
      Header,
      NatalChartTab,
      InteractiveCard,
      Toast,
      Tabs,
      ProfileTab,
      ShareModal,
      NatalChartSVG,
      FormattedGuidanceText,
      PlaceAutocomplete,
      UserListTest,
      PlaceSearchTest,
      PerformanceMonitorComponent,
      Logo,
      NatalSignature,
      GuidanceMeter,
      CosmicPageTransition,
      LoadingScreen,
      AstrologyTest,
      ErrorBoundary,
      AddressAutocomplete,
      DeliveryStatus,
      InboundMessages,
      PageTransition,
      StripeSubscription
    });
  }, []);

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
      
      {/* Force inclusion of all components in the bundle - hidden components */}
      <div className="hidden">
        <ButtonZodiak>Test</ButtonZodiak>
        <PhoneAuth />
        <SMSTest />
        <LoginButton showToast={() => {}} />
        <GuidanceContent profile={{} as any} />
        <BottomNavBar />
        <Header />
        <NatalChartTab profile={{} as any} />
        <InteractiveCard>Test</InteractiveCard>
        <Toast message="Test" onClose={() => {}} />
        <Tabs tabs={[]} activeTab="" onTabChange={() => {}} />
        <ProfileTab profile={{} as any} onLogout={() => {}} />
        <ShareModal isOpen={false} onClose={() => {}} guidance={{} as any} userName="Test" />
        <NatalChartSVG natalChart={{} as any} />
        <FormattedGuidanceText text="Test" />
        <PlaceAutocomplete value="" onChange={() => {}} />
        <UserListTest />
        <PlaceSearchTest />
        <PerformanceMonitorComponent />
        <Logo />
        <NatalSignature sunSign="" moonSign="" ascendantSign="" />
        <GuidanceMeter label="Test" score={50} icon="star" colorClass="text-blue-500" />
        <CosmicPageTransition locationKey="test">
          <div>Test</div>
        </CosmicPageTransition>
        <LoadingScreen />
        <AstrologyTest />
        <ErrorBoundary>
          <div>Test</div>
        </ErrorBoundary>
        <AddressAutocomplete value="" onChange={() => {}} />
        <DeliveryStatus messageId="test" />
        <InboundMessages userId="test" />
        <PageTransition>
          <div>Test</div>
        </PageTransition>
        <StripeSubscription />
      </div>
      
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