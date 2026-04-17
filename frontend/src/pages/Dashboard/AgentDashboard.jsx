import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const AgentDashboard = () => {
  const { user } = useAuthStore();
  const [myProperties, setMyProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, views: 0, inquiries: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch agent's own properties
  const fetchMyProperties = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const { data } = await api.get(`/properties?owner=${user._id}`);
      const properties = data.properties || [];
      setMyProperties(properties);
      
      const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
      const totalInquiries = properties.reduce((acc, p) => acc + (p.inquiries || 0), 0);
      setStats({
        total: properties.length,
        views: totalViews,
        inquiries: totalInquiries,
      });
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  }, [user]);

  // Fetch inquiries for agent's properties
  const fetchInquiries = useCallback(async () => {
    try {
      const { data } = await api.get('/inquiries');
      console.log('Inquiries fetched:', data); // Added this 
      setInquiries(data || []);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMyProperties(), fetchInquiries()]);
      setLoading(false);
    };
    if (user?._id) {
      loadData();
    }
  }, [fetchMyProperties, fetchInquiries, user]);

  // Delete property
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }
    try {
      await api.delete(`/properties/${id}`);
      await fetchMyProperties();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete property');
    }
  };

  // Mark inquiry as read
  const handleMarkAsRead = async (inquiryId) => {
    try {
      await api.patch(`/inquiries/${inquiryId}/read`);
      await fetchInquiries();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Dashboard</h1>
        <Link
          to="/dashboard/add-property"
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          + Add New Property
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <dt className="text-sm font-medium text-gray-500">Total Listings</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <dt className="text-sm font-medium text-gray-500">Total Views</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.views}</dd>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <dt className="text-sm font-medium text-gray-500">Total Inquiries</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.inquiries}</dd>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Listings Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">My Listings</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {myProperties.length > 0 ? (
                myProperties.map((property) => (
                  <div key={property._id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={property.images?.[0] || '/placeholder.jpg'}
                        alt={property.title}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div>
                        <Link
                          to={`/property/${property._id}`}
                          className="font-medium text-gray-900 hover:text-teal-600"
                        >
                          {property.title}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {property.status === 'pending' && '⏳ Pending Approval'}
                          {property.status === 'approved' && '✅ Approved'}
                          {property.status === 'rejected' && '❌ Rejected'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Views: {property.views || 0} | Inquiries: {property.inquiries || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        to={`/dashboard/edit-property/${property._id}`}
                        className="text-teal-600 hover:text-teal-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-gray-500 text-center">
                  No listings yet. Click "Add New Property" to create one.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Inquiries Section */}
        <div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Inquiries</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {inquiries.length > 0 ? (
                inquiries.slice(0, 10).map((inquiry) => (
                  <div key={inquiry._id} className={`p-4 ${!inquiry.isRead ? 'bg-blue-50' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{inquiry.name}</p>
                        <p className="text-sm text-gray-600">{inquiry.email}</p>
                        <p className="text-sm text-gray-600">{inquiry.phone}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{inquiry.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Property: {inquiry.property?.title || 'Unknown'}
                        </p>
                      </div>
                      {!inquiry.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(inquiry._id)}
                          className="ml-2 text-xs text-teal-600 hover:text-teal-800"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-gray-500 text-center">No inquiries yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;