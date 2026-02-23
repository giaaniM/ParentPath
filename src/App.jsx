import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import TabBar from './components/TabBar';
import TopBar from './components/TopBar';
import AnimatedOnboarding from './pages/AnimatedOnboarding';
import Home from './pages/Home';
import BabyDev from './pages/BabyDev';
import ArticleHub from './pages/ArticleHub';
import ArticleDetail from './pages/ArticleDetail';
import Notifications from './pages/Notifications';
import Tools from './pages/Tools';
import TipDetail from './pages/TipDetail';
import './styles/global.css';

function AppContent() {
  const location = useLocation();
  const hideTabBar = location.pathname === '/' || location.pathname === '/tip';

  return (
    <div className="app-shell">
      {!hideTabBar && <TopBar />}
      <Routes>
        <Route path="/" element={<AnimatedOnboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/baby" element={<BabyDev />} />
        <Route path="/article" element={<ArticleHub />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/tip" element={<TipDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideTabBar && <TabBar />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
