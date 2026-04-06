import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import { ToastProvider, useToast } from './context/ToastContext';
import TabBar from './components/TabBar';
import DiaryFAB from './components/DiaryFAB';
import AnimatedOnboarding from './pages/AnimatedOnboarding';
import Register from './pages/Register';
import OnboardingFlow from './pages/Onboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import BabyDev from './pages/BabyDev';
import ArticleHub from './pages/ArticleHub';
import ArticleDetail from './pages/ArticleDetail';
import Notifications from './pages/Notifications';
import Tools from './pages/Tools';
import TipDetail from './pages/TipDetail';
import TipListView from './pages/TipListView';
import DueDateCalculator from './pages/DueDateCalculator';
import HospitalBag from './pages/HospitalBag';
import BirthPlan from './pages/BirthPlan';
import Diary from './pages/Diary';
import Agenda from './pages/Agenda';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import StickyBackButton from './components/StickyBackButton';
import './styles/global.css';

// Mostra toast quando arriva una notifica dal partner
function PartnerNotifToast() {
  const { realtimeNotifications } = useUser();
  const { showToast } = useToast();
  const lastIdRef = useRef(null);

  useEffect(() => {
    if (!realtimeNotifications?.length) return;
    const latest = realtimeNotifications[0];
    if (!latest || latest.id === lastIdRef.current) return;
    if (!['partner_note', 'partner_visit', 'partner_task'].includes(latest.type)) return;
    lastIdRef.current = latest.id;
    showToast({
      title: latest.title,
      subtitle: latest.message,
      type: 'partner',
      duration: 4500,
    });
  }, [realtimeNotifications, showToast]);

  return null;
}

// Guard: redirige a / se l'utente non è autenticato
function ProtectedRoute({ children }) {
  const { onboardingDone } = useUser();
  if (!onboardingDone) return <Navigate to="/" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const subViewsNoBars = ['/diary', '/tools', '/notifications', '/tip', '/tips-list', '/article/', '/tools/due-date', '/tools/hospital-bag', '/tools/birth-plan', '/login', '/register', '/onboarding'];
  const hideGlobalBars = location.pathname === '/' || subViewsNoBars.some(path => location.pathname.startsWith(path));

  return (
    <div className="app-shell">
      <PartnerNotifToast />
      <ScrollToTop />
      <StickyBackButton />
      <Routes>
        {/* Pubbliche */}
        <Route path="/" element={<AnimatedOnboarding />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/login" element={<Login />} />

        {/* Protette */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/baby" element={<ProtectedRoute><BabyDev /></ProtectedRoute>} />
        <Route path="/article" element={<ProtectedRoute><ArticleHub /></ProtectedRoute>} />
        <Route path="/article/:id" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
        <Route path="/tools/due-date" element={<ProtectedRoute><DueDateCalculator /></ProtectedRoute>} />
        <Route path="/tools/hospital-bag" element={<ProtectedRoute><HospitalBag /></ProtectedRoute>} />
        <Route path="/tools/birth-plan" element={<ProtectedRoute><BirthPlan /></ProtectedRoute>} />
        <Route path="/tip" element={<ProtectedRoute><TipDetail /></ProtectedRoute>} />
        <Route path="/tips-list" element={<ProtectedRoute><TipListView /></ProtectedRoute>} />
        <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
        <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideGlobalBars && <TabBar />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
