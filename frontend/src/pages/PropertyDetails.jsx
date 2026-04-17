import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import api from '../services/api';
import useAuthStore from '../store/authStore';
import ImageGallery from '../components/property-temp/ImageGallery';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { formatPrice, formatDate } from '../utils/formatters';
import PageWrapper from '../components/common/PageWrapper';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryForm, setInquiryForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // ✅ Sync inquiry form with user data when it becomes available
  useEffect(() => {
    if (user) {
      setInquiryForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // ✅ Correct spelling: checkWishlistStatus
  const checkWishlistStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/users/wishlist'); // ✅ Correct endpoint
      setIsWishlisted(data.some(p => p._id?.toString() === id));
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  }, [user, id]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data);
        if (user) 
          checkWishlistStatus();

      } catch (error) {
        console.error('Failed to fetch property:', error);
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, navigate, user, checkWishlistStatus]); // ✅ Added missing dependency

  // ✅ Handle wishlist toggle
  const handleWishlistToggle = async () => {
  if (!user) {
    toast.error("Please login first");
    navigate('/login', { state: { from: { pathname: `/property/${id}` } } });
    return;
  }

  try {
    if (isWishlisted) {
      await api.delete(`/users/wishlist/${id}`);
      setIsWishlisted(false);
      toast.info("Removed from wishlist");
    } else {
      await api.post(`/users/wishlist/${id}`);
      setIsWishlisted(true);
      toast.success("Added to wishlist ❤️");
    }
  } catch (error) {
    console.error('Wishlist toggle failed:', error);
    toast.error("Something went wrong");
  }
};

  const handleInquiryChange = (e) => {
    setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/property/${id}` } } });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/inquiries', {
        propertyId: id,
        ...inquiryForm,
      });
      alert('Inquiry sent successfully!');
      setInquiryForm({ ...inquiryForm, message: '' });
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      alert('Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!property) return null;

  return (
    <PageWrapper>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-teal-600">Home</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/properties" className="text-gray-500 hover:text-teal-600">Properties</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{property.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={property.images} title={property.title} />

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>
                <p className="text-gray-600 mt-1">{property.address}, {property.city}, {property.state}</p>
              </div>
              <button
  onClick={handleWishlistToggle}
  className={`p-2 rounded-full transition transform ${
    isWishlisted
      ? 'text-red-500 scale-110'
      : 'text-gray-400 hover:text-red-500'
  }`}
  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
>
  <svg
    className="h-7 w-7 transition"
    fill={isWishlisted ? 'currentColor' : 'none'}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
</button>
            </div>

            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold text-teal-600">{formatPrice(property.price)}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                property.listingType === 'Sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                For {property.listingType}
              </span>
              {property.featured && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">Featured</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-semibold">{property.bedrooms}</p>
                <p className="text-gray-500 text-sm">Bedrooms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{property.bathrooms}</p>
                <p className="text-gray-500 text-sm">Bathrooms</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{property.area}</p>
                <p className="text-gray-500 text-sm">Sq. Ft.</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Agent & Inquiry */}
        <div className="space-y-6">
          {/* Agent Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Listed by</h2>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-semibold text-lg">
                  {property.owner?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="font-medium">{property.owner?.name || 'Agent'}</p>
                <p className="text-sm text-gray-500">{property.owner?.agencyName || 'Property Dunia'}</p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Agent</h2>
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={inquiryForm.name}
                onChange={handleInquiryChange}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={inquiryForm.email}
                onChange={handleInquiryChange}
                required
              />
              <Input
                label="Phone"
                type="tel"
                name="phone"
                value={inquiryForm.phone}
                onChange={handleInquiryChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  name="message"
                  value={inquiryForm.message}
                  onChange={handleInquiryChange}
                  rows="4"
                  placeholder="I'm interested in this property..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              <Button type="submit" isLoading={submitting} className="w-full">
                Send Inquiry
              </Button>
            </form>
          </div>

          {/* Property Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Posted: {formatDate(property.createdAt)}</span>
              <span>Views: {property.views || 0}</span>
              <span>Inquiries: {property.inquiries || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default PropertyDetails;