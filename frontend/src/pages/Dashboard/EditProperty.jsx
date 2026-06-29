import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clipboard, SlidersHorizontal, MapPin, Film, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';
import Spinner from '../../components/common/Spinner';
import PageWrapper from '../../components/common/PageWrapper';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    propertyType: 'Apartment',
    listingType: 'Sale',
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          address: data.address,
          city: data.city,
          state: data.state || '',
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          area: data.area,
          propertyType: data.propertyType,
          listingType: data.listingType,
        });
        setImages(data.images || []);
      } catch (error) {
        console.error('Failed to fetch property:', error);
        toast.error('Failed to load property');
        navigate('/dashboard/agent');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/properties/${id}`, { ...formData, images });
      toast.success('Listing updated successfully!');
      navigate('/dashboard/agent');
    } catch (error) {
      console.error('Failed to update property:', error);
      toast.error('Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <PageWrapper>
      <div className="bg-slate-50/50 min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header Row */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-9 w-9 bg-white border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center text-slate-600 transition-colors"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest leading-none">Console Manager</p>
              <h1 className="font-outfit text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Edit Property Listing</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Basic Information */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
                <Clipboard size={15} className="text-teal-600" />
                <span className="font-outfit text-xs font-bold tracking-wide uppercase">1. Basic Details</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Listing Title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Luxurious Penthouse" />
                <Input label="Pricing (INR)" name="price" type="number" value={formData.price} onChange={handleChange} required placeholder="Enter price" />
                
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Property Type</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200/80 rounded-lg outline-none bg-white text-slate-900 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Villa">Villa</option>
                    <option value="Office">Office</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Listing Type</label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-slate-200/80 rounded-lg outline-none bg-white text-slate-900 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Property Specifications */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
                <SlidersHorizontal size={15} className="text-teal-600" />
                <span className="font-outfit text-xs font-bold tracking-wide uppercase">2. Architectural Specifications</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Bedrooms Count" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} required placeholder="No. of beds" />
                <Input label="Bathrooms Count" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} required placeholder="No. of baths" />
                <Input label="Area size (sqft)" name="area" type="number" value={formData.area} onChange={handleChange} required placeholder="e.g. 1500" />
              </div>
            </div>

            {/* Section 3: Geographic Location */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
                <MapPin size={15} className="text-teal-600" />
                <span className="font-outfit text-xs font-bold tracking-wide uppercase">3. Location Info</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Street Address" name="address" value={formData.address} onChange={handleChange} required placeholder="Street address details" />
                <Input label="City" name="city" value={formData.city} onChange={handleChange} required placeholder="City name" />
                <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="State name" />
              </div>
            </div>

            {/* Section 4: Details & Media */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
                <Film size={15} className="text-teal-600" />
                <span className="font-outfit text-xs font-bold tracking-wide uppercase">4. Listing Media & Details</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Provide comprehensive details about amenities, features, proximity, etc."
                  className="w-full px-3 py-2 text-sm border border-slate-200/80 rounded-lg outline-none bg-white text-slate-900 transition-all focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Upload Photos</label>
                {/* Fixed Image Overwrite bug by supplying initialImages={images} */}
                <ImageUpload onUpload={setImages} initialImages={images} maxFiles={5} />
              </div>
            </div>

            {/* Actions Form row */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={saving}>
                Save Changes
              </Button>
            </div>

          </form>

        </div>
      </div>
    </PageWrapper>
  );
};

export default EditProperty;