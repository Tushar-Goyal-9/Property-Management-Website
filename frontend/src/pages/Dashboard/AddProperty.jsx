import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import ImageUpload from '../../components/common/ImageUpload';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    propertyType: 'Apartment',
    listingType: 'Sale',
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (images.length === 0) {
    alert('Please upload at least one image');
    return;
  }
  setLoading(true);
  try {
    const payload = {
      ...formData,
      price: Number(formData.price),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: Number(formData.area),
      images,
    };
    await api.post('/properties', payload);
    navigate('/dashboard/agent');
  } catch (error) {
    console.error('Failed to create property:', error);
    alert(error.response?.data?.message || 'Failed to create property');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Property</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
          <Input label="Price" name="price" type="number" value={formData.price} onChange={handleChange} required />
          <Input label="Address" name="address" value={formData.address} onChange={handleChange} required />
          <Input label="City" name="city" value={formData.city} onChange={handleChange} required />
          <Input label="State" name="state" value={formData.state} onChange={handleChange} />
          <Input label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleChange} />
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
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Property
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;