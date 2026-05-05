import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Sign in to Property Dunia
        </h2>

        {message && (
          <div className="bg-blue-50 text-blue-600 p-3 rounded mb-4">{message}</div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}
        {validationError && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{validationError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-sm text-teal-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-teal-600 hover:underline font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;