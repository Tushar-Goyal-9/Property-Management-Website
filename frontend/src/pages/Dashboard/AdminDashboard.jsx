import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

const AdminDashboard = () => {
  const { user: _user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalUsers: 0,
    pendingProperties: 0,
  });
  const [allProperties, setAllProperties] = useState([]);
  const [pendingProperties, setPendingProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Combined fetch for stats and all properties
  const fetchStatsAndProperties = useCallback(async () => {
    try {
      const [propertiesRes, usersRes] = await Promise.all([
  api.get('/properties/admin'), // ✅ use admin route
  api.get('/users'),
]);
      const allProps = propertiesRes.data.properties || [];
      const pendingCount = allProps.filter(p => p.status === 'pending').length;
      setStats({
        totalProperties: propertiesRes.data.total || allProps.length,
        totalUsers: usersRes.data.length || 0,
        pendingProperties: pendingCount,
      });
      setAllProperties(allProps);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  const fetchPendingProperties = useCallback(async () => {
  try {
    const { data } = await api.get('/properties/admin?status=pending');
    setPendingProperties(data.properties || []);
  } catch (error) {
    console.error('Failed to fetch pending properties:', error);
  }
}, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatsAndProperties(), fetchPendingProperties(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStatsAndProperties, fetchPendingProperties, fetchUsers]);

  // Refresh all data after actions (approve, reject, delete, toggle)
  const refreshData = async () => {
    await Promise.all([fetchStatsAndProperties(), fetchPendingProperties()]);
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/properties/${id}/status`, { status: 'approved' });
      await refreshData();
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('Failed to approve property');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/properties/${id}/status`, { status: 'rejected' });
      await refreshData();
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('Failed to reject property');
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      await api.patch(`/properties/${id}/feature`);
      await fetchStatsAndProperties(); // refresh the list
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      alert('Failed to toggle featured status');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${id}`);
      await refreshData();
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Failed to delete property');
    }
  };

  // ... rest of the component (loading check, JSX) remains identical ...

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'properties', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Properties</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalProperties}</dd>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendingProperties}</dd>
            </div>
          </div>

          {/* Pending Approvals List */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Pending Property Approvals</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {pendingProperties.length > 0 ? (
                pendingProperties.map((property) => (
                  <div key={property._id} className="p-6 flex items-center justify-between">
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
                          {property.address}, {property.city}
                        </p>
                        <p className="text-sm text-gray-500">
                          Owner: {property.owner?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(property._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(property._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-gray-500 text-center">No pending properties</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium">All Properties</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allProperties.length > 0 ? (
                  allProperties.map((property) => (
                    <tr key={property._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={property.images?.[0] || '/placeholder.jpg'}
                            alt=""
                            className="h-10 w-10 rounded mr-3 object-cover"
                          />
                          <div>
                            <Link to={`/property/${property._id}`} className="font-medium hover:text-teal-600">
                              {property.title}
                            </Link>
                            <p className="text-xs text-gray-500">{property.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">₹{property.price?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.status === 'approved' ? 'bg-green-100 text-green-800' :
                          property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {property.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleFeature(property._id)}
                          className={`px-2 py-1 text-xs rounded ${
                            property.featured ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {property.featured ? 'Featured' : 'Not Featured'}
                        </button>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <Link to={`/property/${property._id}`} className="text-teal-600 hover:underline text-sm">
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteProperty(property._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No properties found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;