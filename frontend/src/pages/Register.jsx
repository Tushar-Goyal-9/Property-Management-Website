import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Home } from 'lucide-react';
import useAuthStore from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PageWrapper from '../components/common/PageWrapper';

const Register = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    clearError();
    setValidationError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <PageWrapper>
      <div 
        className="relative min-h-[calc(100vh-64px)] flex items-center justify-center py-16 px-4 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80')" }}
      >
        {/* Dark luxury glass overlay */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] pointer-events-none" />

        {/* Centered Glass Form Card */}
        <div className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/45 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="h-10 w-10 bg-teal-50 border border-teal-100 text-teal-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
              <Home size={18} />
            </div>
            <div className="space-y-1 pt-1">
              <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-teal-600" />
                Join the Directory
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50/50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}
          {validationError && (
            <div className="bg-rose-50/50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl text-center">
              {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-1">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter name"
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone"
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" isLoading={loading} className="w-full">
                Create Account
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs">
            <p className="text-slate-400 font-semibold">
              Already registered?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-extrabold ml-1">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default Register;