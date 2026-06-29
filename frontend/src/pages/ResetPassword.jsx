import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PageWrapper from '../components/common/PageWrapper';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50/50 p-6">
        <div className="max-w-md w-full bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
          
          <div className="text-center space-y-1">
            <h2 className="font-outfit text-2xl font-extrabold text-slate-900 tracking-tight">
              New Password
            </h2>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-teal-600" />
              Configure Credentials
            </p>
          </div>

          <p className="text-slate-500 text-xs text-center leading-relaxed max-w-sm mx-auto">
            Provide your secure new authentication password below. It must be at least 6 characters.
          </p>

          {error && (
            <div className="bg-rose-50/50 border border-rose-100 text-rose-700 text-xs font-semibold p-3.5 rounded-xl text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-1">
            <Input
              label="New Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <div className="pt-3">
              <Button type="submit" isLoading={loading} className="w-full flex items-center justify-center gap-2">
                <CheckSquare size={13} />
                Reset Password
              </Button>
            </div>
          </form>

          <p className="pt-4 border-t border-slate-100 text-center text-xs">
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-extrabold">
              Back to Login
            </Link>
          </p>

        </div>
      </div>
    </PageWrapper>
  );
};

export default ResetPassword;