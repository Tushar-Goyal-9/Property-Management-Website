import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';  // ✅ Added useLocation
import { AnimatePresence } from 'framer-motion';                 // ✅ Added AnimatePresence
import useAuthStore from './store/authStore';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Chatbot
import Chatbot from './components/Chatbot';

// Route Guards
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

// Dashboard Pages
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import AgentDashboard from './pages/Dashboard/AgentDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard';
import AddProperty from './pages/Dashboard/AddProperty';
import EditProperty from './pages/Dashboard/EditProperty';
import MyListings from './pages/Dashboard/MyListings';
import Wishlist from './pages/Wishlist';

// Spinner
import Spinner from './components/common/Spinner';

function App() {
  const location = useLocation();  // ✅ Get current location for key
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* ✅ AnimatePresence for page transitions */}
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['agent', 'admin']} />}>
              <Route path="/dashboard/agent" element={<AgentDashboard />} />
              <Route path="/dashboard/add-property" element={<AddProperty />} />
              <Route path="/dashboard/edit-property/:id" element={<EditProperty />} />
              <Route path="/dashboard/my-listings" element={<MyListings />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;