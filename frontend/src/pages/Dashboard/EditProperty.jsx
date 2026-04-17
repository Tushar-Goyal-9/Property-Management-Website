import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';
import Spinner from '../../components/common/Spinner';

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
        alert('Failed to load property');
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
      alert('Please upload at least one image');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/properties/${id}`, { ...formData, images });
      navigate('/dashboard/agent');
    } catch (error) {
      console.error('Failed to update property:', error);
      alert('Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        {/* Same fields as AddProperty.jsx */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
          <Input label="Price" name="price" type="number" value={formData.price} onChange={handleChange} required />
          <Input label="Address" name="address" value={formData.address} onChange={handleChange} required />
          <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
          <Input label="State" name="state" value={formData.state} onChange={handleChange} />
          <Input label="Bedrooms" name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} required />
          <Input label="Bathrooms" name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} required />
          <Input label="Area (sqft)" name="area" type="number" value={formData.area} onChange={handleChange} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="Apartment">Apartment</option>
              <option value="House">House</option>
              <option value="Villa">Villa</option>
              <option value="Office">Office</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listing Type</label>
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="Sale">For Sale</option>
              <option value="Rent">For Rent</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <ImageUpload onUpload={setImages} maxFiles={5} />
          {images.length > 0 && (
            <div className="mt-2 grid grid-cols-5 gap-2">
              {images.map((url, i) => (
                <img key={i} src={url} alt="" className="h-16 w-full object-cover rounded" />
              ))}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;