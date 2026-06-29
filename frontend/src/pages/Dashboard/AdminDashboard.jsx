import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building, Inbox, CheckCircle2, Trash2, ExternalLink,
  ShieldAlert, Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import PageWrapper from '../../components/common/PageWrapper';
import Spinner from '../../components/common/Spinner';
import { formatPrice } from '../../utils/formatters';

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

  // Users filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userDateFilter, setUserDateFilter] = useState('');

  // Combined fetch for stats and all properties
  const fetchStatsAndProperties = useCallback(async () => {
    try {
      const [propertiesRes, usersRes] = await Promise.all([
        api.get('/properties/admin'),
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

  // Refresh all data after actions
  const refreshData = async () => {
    await Promise.all([fetchStatsAndProperties(), fetchPendingProperties()]);
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/properties/${id}/status`, { status: 'approved' });
      toast.success('Property approved successfully');
      await refreshData();
    } catch (error) {
      console.error('Failed to approve:', error);
      toast.error('Failed to approve property');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/properties/${id}/status`, { status: 'rejected' });
      toast.success('Property rejected successfully');
      await refreshData();
    } catch (error) {
      console.error('Failed to reject:', error);
      toast.error('Failed to reject property');
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      await api.patch(`/properties/${id}/feature`);
      toast.success('Featured status updated');
      await fetchStatsAndProperties();
    } catch (error) {
      console.error('Failed to toggle feature:', error);
      toast.error('Failed to toggle featured status');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property listing permanently?')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Property deleted successfully');
      await refreshData();
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property');
    }
  };

  // Filtered users array based on search/role/date selectors
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const nameMatch = u.name?.toLowerCase().includes(userSearch.toLowerCase());
      const emailMatch = u.email?.toLowerCase().includes(userSearch.toLowerCase());
      const matchesSearch = userSearch ? (nameMatch || emailMatch) : true;
      const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
      const matchesDate = userDateFilter ? new Date(u.createdAt) >= new Date(userDateFilter) : true;
      return matchesSearch && matchesRole && matchesDate;
    });
  }, [users, userSearch, userRoleFilter, userDateFilter]);

  if (loading) return <Spinner />;

  return (
    <PageWrapper>
      <div className="bg-slate-50/50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1 font-semibold flex items-center gap-1">
              <ShieldAlert size={12} /> Root Administration Console
            </p>
            <h1 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          </div>

          {/* Premium Tab Bar Navigation */}
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-6">
              {['overview', 'properties', 'users'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 font-outfit font-bold text-sm capitalize transition-all outline-none ${
                    activeTab === tab
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* SaaS Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Metric 1 */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Properties</p>
                    <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-none">{stats.totalProperties}</p>
                  </div>
                  <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                    <Building size={18} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</p>
                    <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-none">{stats.totalUsers}</p>
                  </div>
                  <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                    <Users size={18} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Verification</p>
                    <p className="font-outfit text-3xl font-extrabold text-amber-600 leading-none">{stats.pendingProperties}</p>
                  </div>
                  <div className="h-11 w-11 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <Inbox size={18} strokeWidth={1.5} />
                  </div>
                </div>

              </div>

              {/* Pending Approvals Table Panel */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">Pending Property Verifications</h3>
                  <span className="text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                    Action Required
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {pendingProperties.length > 0 ? (
                    pendingProperties.map((property) => (
                      <div key={property._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                        <div className="flex items-center gap-4">
                          <img
                            src={property.images?.[0] || '/placeholder.jpg'}
                            alt={property.title}
                            className="h-14 w-18 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                          />
                          <div className="truncate">
                            <Link
                              to={`/property/${property._id}`}
                              className="font-outfit text-sm font-bold text-slate-900 hover:text-teal-600 flex items-center gap-1"
                            >
                              <span>{property.title}</span>
                              <ExternalLink size={11} className="text-slate-400" />
                            </Link>
                            <p className="text-slate-400 text-xs mt-1 truncate">{property.address}, {property.city}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Broker: {property.owner?.name || 'Broker'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            onClick={() => handleApprove(property._id)}
                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl active:scale-95 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(property._id)}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl active:scale-95 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs font-semibold leading-relaxed">
                      No listings awaiting registration verification checks.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Properties Tab Content */}
          {activeTab === 'properties' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">Property Inventories</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">Property</th>
                      <th className="px-6 py-4 text-left">Listing Price</th>
                      <th className="px-6 py-4 text-left">Visibility</th>
                      <th className="px-6 py-4 text-left">Highlight Type</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white text-xs text-slate-600 font-semibold">
                    {allProperties.length > 0 ? (
                      allProperties.map((property) => (
                        <tr key={property._id} className="hover:bg-slate-50/30 transition-colors">
                          
                          {/* Title & Image */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <img
                                src={property.images?.[0] || '/placeholder.jpg'}
                                alt=""
                                className="h-10 w-12 object-cover rounded-lg border border-slate-250 bg-slate-100 shrink-0"
                              />
                              <div>
                                <Link
                                  to={`/property/${property._id}`}
                                  className="font-outfit font-bold text-slate-900 hover:text-teal-600 flex items-center gap-1"
                                >
                                  <span>{property.title}</span>
                                  <ExternalLink size={11} className="text-slate-400" />
                                </Link>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{property.city}</span>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4 whitespace-nowrap text-slate-950 font-bold">
                            {formatPrice(property.price)}
                          </td>

                          {/* Visibility */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              property.visibility === 'private'
                                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                : 'bg-teal-50 text-teal-700 border border-teal-100/50'
                            }`}>
                              <span>{property.visibility === 'private' ? '🔒 Private' : '🌍 Public'}</span>
                            </span>
                          </td>

                          {/* Featured state toggle */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleFeature(property._id)}
                              className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md border transition-all active:scale-95 ${
                                property.featured
                                  ? 'bg-amber-50 border-amber-100 text-amber-700'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-350'
                              }`}
                            >
                              {property.featured ? '★ Featured' : '☆ Highlight'}
                            </button>
                          </td>

                          {/* Action controls */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                to={`/property/${property._id}`}
                                className="h-8 w-8 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-950 transition-all active:scale-95"
                                title="View listing page"
                              >
                                <ExternalLink size={12} />
                              </Link>
                              <button
                                onClick={() => handleDeleteProperty(property._id)}
                                className="h-8 w-8 bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-600 transition-all active:scale-95"
                                title="Delete listing"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
                          No properties indexed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
              <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">Registered Members</h3>
                
                {/* Users Search & Filter Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50/50 text-slate-800 w-48 placeholder-slate-400"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-slate-50/50 text-slate-700 font-semibold cursor-pointer w-28"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex items-center gap-1.5 bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 font-semibold">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Since:</span>
                    <input
                      type="date"
                      value={userDateFilter}
                      onChange={(e) => setUserDateFilter(e.target.value)}
                      className="bg-transparent outline-none cursor-pointer text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">Full Name</th>
                      <th className="px-6 py-4 text-left">Email Address</th>
                      <th className="px-6 py-4 text-left">Clearance Role</th>
                      <th className="px-6 py-4 text-left">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white text-xs text-slate-600 font-semibold">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4.5 whitespace-nowrap text-slate-900 font-bold">{u.name}</td>
                          <td className="px-6 py-4.5 whitespace-nowrap">{u.email}</td>
                          
                          {/* Role Badge */}
                          <td className="px-6 py-4.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin' 
                                ? 'bg-purple-50 text-purple-700 border border-purple-100/50' 
                                : u.role === 'agent' 
                                ? 'bg-blue-50 text-blue-700 border border-blue-100/50' 
                                : 'bg-slate-50 text-slate-500 border border-slate-150'
                            }`}>
                              {u.role || 'user'}
                            </span>
                          </td>

                          {/* Joined Date */}
                          <td className="px-6 py-4.5 whitespace-nowrap text-slate-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
                          No matching registered members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;