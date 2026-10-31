import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { AuthProvider, RequireAuth } from './lib/auth.jsx';
import Landing from './pages/Landing.jsx';
import Inquiry from './pages/Inquiry.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';

const Page = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();
  return (
    // reducedMotion="user": Framer Motion skips movement when the OS has "reduce motion" turned on
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <AnimatePresence mode="wait" initial={false}>
          {/* Keyed by pathname only, so changing dashboard filters (query string) does not replay the page transition */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page><Landing /></Page>} />
            <Route path="/inquiry" element={<Page><Inquiry /></Page>} />
            <Route path="/admin/login" element={<Page><Login /></Page>} />
            <Route path="/admin" element={<RequireAuth><Page><Dashboard /></Page></RequireAuth>} />
            <Route path="*" element={<Page><NotFound /></Page>} />
          </Routes>
        </AnimatePresence>
        <Toaster position="top-center" closeButton toastOptions={{ style: { fontFamily: 'Figtree, system-ui, sans-serif', fontSize: '15px' } }} />
      </AuthProvider>
    </MotionConfig>
  );
}
