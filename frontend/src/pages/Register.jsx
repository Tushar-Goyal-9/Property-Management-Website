import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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
    role: 'user',
    phone: '',
    agencyName: '',
    licenseNumber: '',
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
    const result = await register(formData);
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <PageWrapper>
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Create an Account
        </h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}
        {validationError && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{validationError}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="user">Buyer / Renter</option>
              <option value="agent">Property Agent</option>
            </select>
          </div>

          {formData.role === 'agent' && (
            <>
              <Input
                label="Agency Name"
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
              />
              <Input
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </>
          )}

          <Button type="submit" isLoading={loading} className="w-full">
            Register
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
    </PageWrapper>
  );
};

export default Register;