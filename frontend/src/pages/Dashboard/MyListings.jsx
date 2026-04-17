import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';

const MyListings = () => {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProperties = async () => {
      if (!user?._id) return;
      try {
        const { data } = await api.get(`/properties?owner=${user._id}`);
        setProperties(data.properties || []);
      } catch (error) {
        console.error('Failed to fetch properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProperties();
  }, [user]); // ✅ Correct dependency

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`); // ✅ Fixed template literal
      setProperties(properties.filter(p => p._id !== id)); // ✅ Fixed _id
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete property');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link
          to="/dashboard/add-property"
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700"
        >
          + Add New
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No listings yet. Click "Add New" to create one.
        </p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((prop) => (
                <tr key={prop._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={prop.images?.[0] || '/placeholder.jpg'}
                        alt=""
                        className="h-10 w-10 rounded mr-3 object-cover"
                      />
                      <span>{prop.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">₹{prop.price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        prop.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : prop.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {prop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{prop.views || 0}</td>
                  <td className="px-6 py-4 space-x-2">
                    <Link
                      to={`/dashboard/edit-property/${prop._id}`}
                      className="text-teal-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(prop._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyListings;