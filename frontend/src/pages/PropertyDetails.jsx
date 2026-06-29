import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MapPin, Heart, Bed, Bath, Maximize2, Sparkles, Send,
  Calendar, Eye, ClipboardList, Shield, User, Building
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import ImageGallery from '../components/property/ImageGallery';
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

  const checkWishlistStatus = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/users/wishlist');
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
        if (user) checkWishlistStatus();
      } catch (error) {
        console.error('Failed to fetch property:', error);
        navigate('/not-found');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, navigate, user, checkWishlistStatus]);

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please log in first to use wishlist');
      navigate('/login', { state: { from: { pathname: `/property/${id}` } } });
      return;
    }

    try {
      if (isWishlisted) {
        await api.delete(`/users/wishlist/${id}`);
        setIsWishlisted(false);
        toast.info('Removed from wishlist');
      } else {
        await api.post(`/users/wishlist/${id}`);
        setIsWishlisted(true);
        toast.success('Saved to wishlist ❤️');
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
      toast.error('Something went wrong');
    }
  };

  const handleInquiryChange = (e) => {
    setInquiryForm({ ...inquiryForm, [e.target.name]: e.target.value });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to contact agents');
      navigate('/login', { state: { from: { pathname: `/property/${id}` } } });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/inquiries', {
        propertyId: id,
        ...inquiryForm,
      });
      toast.success('Inquiry sent successfully!');
      setInquiryForm({ ...inquiryForm, message: '' });
    } catch (error) {
      console.error('Failed to send inquiry:', error);
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;
  if (!property) return null;

  return (
    <PageWrapper>
      <div className="bg-slate-50/50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Elegant Breadcrumbs */}
          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/properties" className="hover:text-teal-600 transition-colors">Properties</Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-[200px]">{property.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Title, Images & Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Image Gallery */}
              <ImageGallery images={property.images} title={property.title} />

              {/* Core Details Content Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
                
                {/* Header Information */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                        property.listingType === 'Sale' 
                          ? 'bg-blue-50 border border-blue-100 text-blue-700' 
                          : 'bg-green-50 border border-green-100 text-green-700'
                      }`}>
                        For {property.listingType === 'Sale' ? 'Sale' : 'Rent'}
                      </span>
                      {property.featured && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                          <Sparkles size={10} className="fill-amber-500/20 text-amber-600" /> Featured
                        </span>
                      )}
                    </div>
                    
                    <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {property.title}
                    </h1>

                    <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                      <MapPin size={15} className="text-slate-400 shrink-0" />
                      <span>{property.address}, {property.city}, {property.state}</span>
                    </div>
                  </div>

                  {/* Circle Wishlist button */}
                  <button
                    onClick={handleWishlistToggle}
                    className={`h-11 w-11 rounded-full border flex items-center justify-center transition-all duration-200 shadow-sm shrink-0 hover:bg-slate-50 active:scale-95 ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-50/80'
                        : 'border-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                    title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart size={18} className={isWishlisted ? 'fill-rose-500' : ''} />
                  </button>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="text-3xl sm:text-4xl font-outfit font-extrabold text-teal-600 tracking-tight">
                    {formatPrice(property.price)}
                    {property.listingType === 'Rent' && (
                      <span className="text-sm font-semibold text-slate-400 ml-1">/ month</span>
                    )}
                  </div>
                </div>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100">
                  <div className="bg-slate-50/50 border border-slate-200/50 rounded-xl p-3.5 text-center">
                    <Bed size={18} className="text-slate-400 mx-auto mb-1.5" />
                    <p className="font-outfit text-lg font-bold text-slate-900 leading-none">{property.bedrooms}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bedrooms</p>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-200/50 rounded-xl p-3.5 text-center">
                    <Bath size={18} className="text-slate-400 mx-auto mb-1.5" />
                    <p className="font-outfit text-lg font-bold text-slate-900 leading-none">{property.bathrooms}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bathrooms</p>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-200/50 rounded-xl p-3.5 text-center">
                    <Maximize2 size={18} className="text-slate-400 mx-auto mb-1.5" />
                    <p className="font-outfit text-lg font-bold text-slate-900 leading-none">{property.area}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sq. Ft.</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="font-outfit text-lg font-bold text-slate-900 mb-3">About this space</h2>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Sidebar with Agent Info & Inquiry */}
            <div className="space-y-6 lg:sticky lg:top-24">
              
              {/* Agent Details Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  <Shield size={12} className="text-teal-600" />
                  <span>Authorized Representative</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm shrink-0">
                    {property.owner?.avatar ? (
                      <img src={property.owner.avatar} alt="Agent" className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <User size={20} strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-outfit font-bold text-slate-900 truncate leading-snug">
                      {property.owner?.name || 'Authorized Broker'}
                    </p>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5 font-medium truncate">
                      <Building size={11} className="shrink-0" />
                      <span>{property.owner?.agencyName || 'Property Dunia'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <h3 className="font-outfit text-base font-bold text-slate-900 mb-4">Inquire About Listing</h3>
                
                <form onSubmit={handleInquirySubmit} className="space-y-1">
                  <Input
                    label="Full Name"
                    name="name"
                    value={inquiryForm.name}
                    onChange={handleInquiryChange}
                    required
                    placeholder="Enter your name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={inquiryForm.email}
                    onChange={handleInquiryChange}
                    required
                    placeholder="Enter your email"
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={inquiryForm.phone}
                    onChange={handleInquiryChange}
                    required
                    placeholder="Enter your phone number"
                  />
                  <Input
                    label="Inquiry Message"
                    as="textarea"
                    name="message"
                    value={inquiryForm.message}
                    onChange={handleInquiryChange}
                    rows="3"
                    placeholder="I am interested in this listing. Please contact me."
                    required
                  />

                  <Button 
                    type="submit" 
                    isLoading={submitting} 
                    className="w-full mt-4 flex items-center justify-center gap-2"
                  >
                    <Send size={13} />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* View / Activity Statistics */}
              <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="space-y-1">
                    <Calendar size={13} className="text-slate-400 mx-auto" />
                    <p className="leading-none pt-0.5">{formatDate(property.createdAt)}</p>
                    <p className="text-[8px] font-bold text-slate-400">Created</p>
                  </div>
                  <div className="space-y-1 border-x border-slate-150">
                    <Eye size={13} className="text-slate-400 mx-auto" />
                    <p className="text-slate-700 leading-none pt-0.5">{property.views || 0}</p>
                    <p className="text-[8px] font-bold text-slate-400">Page Views</p>
                  </div>
                  <div className="space-y-1">
                    <ClipboardList size={13} className="text-slate-400 mx-auto" />
                    <p className="text-slate-700 leading-none pt-0.5">{property.inquiries || 0}</p>
                    <p className="text-[8px] font-bold text-slate-400">Inquiries</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PropertyDetails;