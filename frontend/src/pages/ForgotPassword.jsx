import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Forgot Password</h2>
        <p className="text-gray-600 text-center mb-6">Enter your email and we'll send you a reset link.</p>
        {message && <div className="bg-blue-50 text-blue-600 p-3 rounded mb-4">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Button type="submit" isLoading={loading} className="w-full">
            Send Reset Link
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to="/login" className="text-teal-600 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;