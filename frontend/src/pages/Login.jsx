import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShieldCheck, Key } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PageWrapper from '../components/common/PageWrapper';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, error, clearError, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationError, setValidationError] = useState('');

  const redirect = location.state?.from?.pathname || '/';
  const message = location.state?.message;

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (user) {
      navigate(redirect, { replace: true });
    }
  }, [user, navigate, redirect]);

  const handleChange = (e) => {
    clearError();
    setValidationError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setValidationError('Please fill in all fields');
      return;
    }
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate(redirect, { replace: true });
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2 bg-slate-50/50">

        {/* Left Side: Premium Illustration Area */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-slate-950 text-white overflow-hidden">
          {/* Background Image with opacity */}
          <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2">
            <div className="h-9 w-9 bg-teal-600 rounded-xl flex items-center justify-center">
              <Home size={18} className="text-white" />
            </div>
            <span className="font-outfit text-lg font-bold tracking-tight text-white">Property Dunia</span>
          </div>

          <div className="relative z-10 max-w-md space-y-4">
            <h2 className="font-outfit text-3xl font-extrabold tracking-tight leading-tight">
              Unlock Your Next Masterpiece Home
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Log in to manage your saved properties, view detailed inquiry listings, and get real-time broker alerts.
            </p>
          </div>

          <div className="relative z-10 text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Premium Real Estate Directory
          </div>
        </div>

        {/* Right Side: Glass Login Card Area */}
        <div className="flex items-center justify-center p-8 sm:p-12">
          <div className="max-w-md w-full bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">

            <div className="space-y-1">
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} className="text-teal-600" />
                Secure Portal Access
              </p>
            </div>

            {message && (
              <div className="bg-blue-50/50 border border-blue-100 text-blue-700 text-xs font-semibold p-3.5 rounded-xl">
                {message}
              </div>
            )}
            {error && (
              <div className="bg-rose-50/50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl">
                {error}
              </div>
            )}
            {validationError && (
              <div className="bg-rose-50/50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl">
                {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-1">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />

              <div className="pt-4">
                <Button type="submit" isLoading={isLoading} className="w-full">
                  Sign In
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <Link to="/forgot-password" className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1">
                <Key size={12} />
                Forgot password?
              </Link>
              <p className="text-slate-400 font-semibold">
                New to the platform?{' '}
                <Link to="/register" className="text-teal-600 hover:text-teal-700 font-extrabold ml-1">
                  Create account
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default Login;