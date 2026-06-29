import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail } from 'lucide-react';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PageWrapper from '../components/common/PageWrapper';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Something went wrong');
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
              Reset Password
            </h2>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-teal-600" />
              Secure Identity Verification
            </p>
          </div>

          <p className="text-slate-500 text-xs text-center leading-relaxed max-w-sm mx-auto">
            Provide your email below and we will deliver a secure authentication link to reset your account credentials.
          </p>

          {message && (
            <div className="bg-blue-50/50 border border-blue-100 text-blue-750 text-xs font-semibold p-3.5 rounded-xl text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-1">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <div className="pt-3">
              <Button type="submit" isLoading={loading} className="w-full flex items-center justify-center gap-2">
                <Mail size={13} />
                Send Reset Link
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

export default ForgotPassword;