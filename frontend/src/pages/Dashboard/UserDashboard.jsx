import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [wishlist, setWishlist] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wishlistRes, inquiriesRes] = await Promise.all([
          api.get('/users/wishlist'),
          api.get('/inquiries'),
        ]);
        setWishlist(wishlistRes.data || []);
        setInquiries(inquiriesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name}!</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wishlist Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Wishlist</h2>
            <Link to="/wishlist" className="text-teal-600 hover:underline text-sm">
              View All
            </Link>
          </div>
          {wishlist.length === 0 ? (
            <p className="text-gray-500">No properties saved yet.</p>
          ) : (
            <div className="space-y-3">
              {wishlist.slice(0, 3).map((property) => (
                <Link
                  key={property._id}
                  to={`/property/${property._id}`}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <img
                    src={property.images?.[0] || '/placeholder.jpg'}
                    alt=""
                    className="h-12 w-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium truncate">{property.title}</p>
                    <p className="text-sm text-gray-500">{property.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Inquiries</h2>
          {inquiries.length === 0 ? (
            <p className="text-gray-500">No inquiries sent yet.</p>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inquiry) => (
                <div key={inquiry._id} className="border-b pb-2">
                  <p className="font-medium">{inquiry.property?.title}</p>
                  <p className="text-sm text-gray-500">
                    Sent: {new Date(inquiry.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Agent: {inquiry.agent?.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;