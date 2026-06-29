import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Building, Trash2, ExternalLink, ShieldAlert, Inbox, Edit2, LayoutGrid, Eye, MessageSquare, Plus, Mail, Phone, Star, ShieldCheck
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
    users: {
      total: 0,
      admins: 0,
      agents: 0,
      users: 0,
      pendingAgentRequests: 0,
    },
    properties: {
      total: 0,
      public: 0,
      private: 0,
      active: 0,
      sold: 0,
      rented: 0,
      archived: 0,
      featured: 0,
      hot: 0,
      totalViews: 0,
      totalInquiries: 0,
    }
  });
  const [allProperties, setAllProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Personal agent console states
  const [personalInquiries, setPersonalInquiries] = useState([]);
  const [myFilterCriteria, setMyFilterCriteria] = useState(null);
  const [mySelectedPropertyId, setMySelectedPropertyId] = useState(null);
  const [myShowAllInquiries, setMyShowAllInquiries] = useState(false);
  const [myInquirySearchName, setMyInquirySearchName] = useState('');
  const [myInquiryStartDate, setMyInquiryStartDate] = useState('');
  const [myInquiryEndDate, setMyInquiryEndDate] = useState('');
  const [myShowStarredOnly, setMyShowStarredOnly] = useState(false);

  // Local storage for admin's starred inquiries
  const [adminStarredInquiryIds, setAdminStarredInquiryIds] = useState(() => {
    try {
      const saved = localStorage.getItem('property_dunia_admin_starred_inquiries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleAdminInquiryStar = (id) => {
    let updated;
    if (adminStarredInquiryIds.includes(id)) {
      updated = adminStarredInquiryIds.filter(item => item !== id);
      toast.success('Inquiry unmarked as important');
    } else {
      updated = [...adminStarredInquiryIds, id];
      toast.success('Inquiry marked as important');
    }
    setAdminStarredInquiryIds(updated);
    localStorage.setItem('property_dunia_admin_starred_inquiries', JSON.stringify(updated));
  };

  // Rejection modal state
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Users filter states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userDateFilter, setUserDateFilter] = useState('');

  // Stats tab filter states
  const [statsSearch, setStatsSearch] = useState('');
  const [statsSortBy, setStatsSortBy] = useState('views-desc');

  // Revoke Agent & User Management states
  const [revokingAgentId, setRevokingAgentId] = useState(null);
  const [revokingAgentName, setRevokingAgentName] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletingUserName, setDeletingUserName] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PER_PAGE = 15;

  const handleDeleteUserClick = (u) => {
    setDeletingUserId(u._id);
    setDeletingUserName(u.name);
  };

  const handleConfirmDeleteUser = async () => {
    try {
      await api.delete(`/users/${deletingUserId}`);
      toast.success('User deleted successfully');
      setDeletingUserId(null);
      setDeletingUserName('');
      await refreshData();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRevokeAgentClick = (u) => {
    setRevokingAgentId(u._id);
    setRevokingAgentName(u.name);
  };

  const handleConfirmRevoke = async () => {
    try {
      const { data } = await api.patch(`/users/${revokingAgentId}/revoke-agent`);
      toast.success(data.message || 'Agent privileges revoked successfully');
      setRevokingAgentId(null);
      setRevokingAgentName('');
      await refreshData();
    } catch (error) {
      console.error('Failed to revoke agent:', error);
      toast.error(error.response?.data?.message || 'Failed to revoke agent privileges');
    }
  };

  // Combined fetch for stats and all properties
  const fetchStatsAndProperties = useCallback(async () => {
    try {
      const [propertiesRes, statsRes] = await Promise.all([
        api.get('/properties/admin'),
        api.get('/properties/admin/dashboard'),
      ]);
      const allProps = propertiesRes.data.properties || [];
      setAllProperties(allProps);
      setStats(statsRes.data || {
        users: { total: 0, admins: 0, agents: 0, users: 0, pendingAgentRequests: 0 },
        properties: { total: 0, public: 0, private: 0, active: 0, sold: 0, rented: 0, archived: 0, featured: 0, hot: 0, totalViews: 0, totalInquiries: 0 }
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  const fetchPendingRequests = useCallback(async () => {
    try {
      const { data } = await api.get('/users/agent-requests');
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  }, []);

  const fetchPersonalInquiries = useCallback(async () => {
    try {
      const { data } = await api.get('/inquiries');
      setPersonalInquiries(data || []);
    } catch (error) {
      console.error('Failed to fetch personal inquiries:', error);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatsAndProperties(), fetchPendingRequests(), fetchUsers(), fetchPersonalInquiries()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStatsAndProperties, fetchPendingRequests, fetchUsers, fetchPersonalInquiries]);

  // Refresh all data after actions
  const refreshData = async () => {
    await Promise.all([fetchStatsAndProperties(), fetchPendingRequests(), fetchUsers(), fetchPersonalInquiries()]);
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
    if (!window.confirm('Delete this property?\nThis action cannot be undone.')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Property deleted successfully');
      await refreshData();
    } catch (error) {
      console.error('Failed to delete property:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      await api.patch(`/users/agent-requests/${id}/approve`);
      toast.success('Agent request approved successfully');
      await refreshData();
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve agent request');
    }
  };

  const handleRejectRequest = (id) => {
    setRejectingRequestId(id);
  };

  const submitRejection = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      toast.error('Rejection reason must be at least 5 characters');
      return;
    }
    try {
      await api.patch(`/users/agent-requests/${rejectingRequestId}/reject`, {
        rejectionReason: rejectionReason.trim()
      });
      toast.success('Agent request rejected successfully');
      setRejectingRequestId(null);
      setRejectionReason('');
      await refreshData();
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject agent request');
    }
  };

  const handleMarkAsRead = async (inquiryId) => {
    try {
      await api.patch(`/inquiries/${inquiryId}/read`);
      toast.success('Inquiry marked as read');
      await fetchPersonalInquiries();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Filtered users array based on search/role/date selectors
  const filteredUsers = useMemo(() => {
    const filtered = users.filter((u) => {
      const nameMatch = u.name?.toLowerCase().includes(userSearch.toLowerCase());
      const emailMatch = u.email?.toLowerCase().includes(userSearch.toLowerCase());
      const matchesSearch = userSearch ? (nameMatch || emailMatch) : true;
      const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
      const matchesDate = userDateFilter ? new Date(u.createdAt) >= new Date(userDateFilter) : true;
      return matchesSearch && matchesRole && matchesDate;
    });
    return filtered;
  }, [users, userSearch, userRoleFilter, userDateFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setUsersPage(1); }, [userSearch, userRoleFilter, userDateFilter]);

  const usersTotalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, usersPage]);

  // Sorted and filtered properties performance stats list
  const sortedStatsProperties = useMemo(() => {
    let list = [...allProperties];

    if (statsSearch) {
      const query = statsSearch.toLowerCase();
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.owner?.name?.toLowerCase().includes(query)
      );
    }

    if (statsSortBy === 'views-desc') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (statsSortBy === 'views-asc') {
      list.sort((a, b) => (a.views || 0) - (b.views || 0));
    } else if (statsSortBy === 'inquiries-desc') {
      list.sort((a, b) => (b.inquiries || 0) - (a.inquiries || 0));
    } else if (statsSortBy === 'price-desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (statsSortBy === 'price-asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return list;
  }, [allProperties, statsSearch, statsSortBy]);

  // Admin's personal listings calculation
  const myPersonalProperties = useMemo(() => {
    return allProperties.filter(p => p.owner?._id === _user?._id || p.owner === _user?._id);
  }, [allProperties, _user]);

  // Local calculation of personal stats
  const myStats = useMemo(() => {
    let views = 0;
    let inquiriesCount = 0;
    let active = 0;
    let publicCount = 0;
    let privateCount = 0;
    let sold = 0;
    let rented = 0;
    let archived = 0;
    let featured = 0;
    let hot = 0;

    myPersonalProperties.forEach(p => {
      views += p.views || 0;
      inquiriesCount += p.inquiries || 0;
      if (p.listingStatus === 'active') active++;
      if (p.listingStatus === 'sold') sold++;
      if (p.listingStatus === 'rented') rented++;
      if (p.listingStatus === 'archived') archived++;
      if (p.visibility === 'public') publicCount++;
      if (p.visibility === 'private') privateCount++;
      if (p.featured) featured++;
      if (p.hot) hot++;
    });

    return {
      totalProperties: myPersonalProperties.length,
      public: publicCount,
      private: privateCount,
      active,
      sold,
      rented,
      archived,
      featured,
      hot,
      totalViews: views,
      totalInquiries: inquiriesCount
    };
  }, [myPersonalProperties]);

  // Filtered personal properties
  const displayedMyProperties = useMemo(() => {
    return myPersonalProperties.filter((property) => {
      if (!myFilterCriteria) return true;
      if (myFilterCriteria === 'active') return property.listingStatus === 'active';
      if (myFilterCriteria === 'sold') return property.listingStatus === 'sold';
      if (myFilterCriteria === 'rented') return property.listingStatus === 'rented';
      if (myFilterCriteria === 'archived') return property.listingStatus === 'archived';
      if (myFilterCriteria === 'public') return property.visibility === 'public';
      if (myFilterCriteria === 'private') return property.visibility === 'private';
      if (myFilterCriteria === 'featured') return property.featured === true;
      if (myFilterCriteria === 'hot') return property.hot === true;
      return true;
    });
  }, [myPersonalProperties, myFilterCriteria]);

  // Filtered personal inquiries
  const displayedMyInquiries = useMemo(() => {
    let list = personalInquiries;

    if (mySelectedPropertyId) {
      list = list.filter(inq => inq.property?._id === mySelectedPropertyId);
    }

    if (myShowAllInquiries) {
      if (myInquirySearchName) {
        const query = myInquirySearchName.toLowerCase();
        list = list.filter(inq =>
          inq.name?.toLowerCase().includes(query) ||
          inq.email?.toLowerCase().includes(query) ||
          inq.message?.toLowerCase().includes(query)
        );
      }
      if (myInquiryStartDate) {
        list = list.filter(inq => {
          if (!inq.createdAt) return false;
          const createDate = new Date(inq.createdAt);
          createDate.setHours(0, 0, 0, 0);
          return createDate >= new Date(myInquiryStartDate);
        });
      }
      if (myInquiryEndDate) {
        list = list.filter(inq => {
          if (!inq.createdAt) return false;
          const createDate = new Date(inq.createdAt);
          createDate.setHours(23, 59, 59, 999);
          return createDate <= new Date(myInquiryEndDate);
        });
      }
      if (myShowStarredOnly) {
        list = list.filter(inq => adminStarredInquiryIds.includes(inq._id));
      }
      return list;
    } else {
      list = list.filter(inq => !inq.isRead);
      return list.slice(0, 3);
    }
  }, [personalInquiries, mySelectedPropertyId, myShowAllInquiries, myInquirySearchName, myInquiryStartDate, myInquiryEndDate, myShowStarredOnly, adminStarredInquiryIds]);

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
              {['overview', 'admin workspace', 'properties', 'users', 'stats'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 font-outfit font-bold text-sm capitalize transition-all outline-none ${
                    activeTab === tab
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {tab === 'admin workspace' ? 'Admin Workspace' : tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* SaaS Metrics - Updated to 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Metric 1 */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Properties</p>
                    <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-none">{stats.properties.total}</p>
                  </div>
                  <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                    <Building size={18} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Accounts</p>
                    <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-none">{stats.users.total}</p>
                  </div>
                  <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                    <Users size={18} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Agent Requests</p>
                    <p className="font-outfit text-3xl font-extrabold text-amber-600 leading-none">{stats.users.pendingAgentRequests}</p>
                  </div>
                  <div className="h-11 w-11 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                    <Inbox size={18} strokeWidth={1.5} />
                  </div>
                </div>

              </div>

              {/* Pending Agent Requests Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">Pending Agent Requests</h3>
                  <span className="text-[10px] font-bold bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                    Action Required
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {pendingRequests.length > 0 ? (
                    pendingRequests.map((req) => (
                      <div key={req._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                        <div className="space-y-1">
                          <p className="font-outfit text-sm font-bold text-slate-900 leading-snug">{req.name}</p>
                          <p className="text-slate-400 text-xs font-semibold">{req.email} • {req.phone || 'No phone'}</p>
                          {req.agencyName && (
                            <p className="text-[10px] text-teal-600 font-extrabold uppercase tracking-wider">Agency: {req.agencyName}</p>
                          )}
                          <p className="text-[10px] text-slate-400 font-bold">
                            Requested: {req.agentRequest?.requestedAt ? new Date(req.agentRequest.requestedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <button
                            onClick={() => handleApproveRequest(req._id)}
                            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl active:scale-95 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(req._id)}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl active:scale-95 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs font-semibold leading-relaxed">
                      No pending agent requests.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Personal Agent Console Tab */}
          {activeTab === 'admin workspace' && (
            <div className="space-y-6">
              
              {/* Add Listing Shortcut Row */}
              <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.008)]">
                <div>
                  <h3 className="font-outfit text-base font-extrabold text-slate-900">Personal Console Inventory</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Manage listings you own and view received client leads.</p>
                </div>
                <Link
                  to="/dashboard/add-property"
                  className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-600/10 transition-all shrink-0"
                >
                  <Plus size={14} />
                  <span>Add Property Listing</span>
                </Link>
              </div>

              {/* Core Stats - Premium 4 Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Properties */}
                <div
                  onClick={() => setMyFilterCriteria(null)}
                  className={`bg-white rounded-2xl border p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-teal-400 hover:shadow-md active:scale-[0.98] ${
                    !myFilterCriteria ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1 min-w-0 z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">My Listings</p>
                    <p className="font-outfit text-2xl font-extrabold text-slate-900 leading-none">{myStats.totalProperties}</p>
                  </div>
                  <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600 shrink-0 z-10">
                    <LayoutGrid size={16} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Active Listings */}
                <div
                  onClick={() => setMyFilterCriteria(myFilterCriteria === 'active' ? null : 'active')}
                  className={`bg-white rounded-2xl border p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-teal-400 hover:shadow-md active:scale-[0.98] ${
                    myFilterCriteria === 'active' ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1 min-w-0 z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Active Listings</p>
                    <p className="font-outfit text-2xl font-extrabold text-slate-900 leading-none">{myStats.active}</p>
                  </div>
                  <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 z-10">
                    <span className="text-xs">🟢</span>
                  </div>
                </div>

                {/* Total Views */}
                <div
                  onClick={() => setMyFilterCriteria(null)}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-teal-400 hover:shadow-md active:scale-[0.98]"
                >
                  <div className="space-y-1 min-w-0 z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Total Views</p>
                    <p className="font-outfit text-2xl font-extrabold text-slate-900 leading-none">{myStats.totalViews}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 z-10">
                    <Eye size={16} strokeWidth={1.5} />
                  </div>
                </div>

                {/* Total Inquiries */}
                <div
                  onClick={() => {
                    setMySelectedPropertyId(null);
                    setMyFilterCriteria(null);
                    setMyShowAllInquiries(true);
                    toast.info("Showing my inquiries archive with search filters");
                  }}
                  className={`bg-white rounded-2xl border p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-teal-400 hover:shadow-md active:scale-[0.98] ${
                    myShowAllInquiries ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1 min-w-0 z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">My Leads</p>
                    <p className="font-outfit text-2xl font-extrabold text-slate-900 leading-none">{myStats.totalInquiries}</p>
                  </div>
                  <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0 z-10">
                    <MessageSquare size={16} strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Secondary Stats breakdown ribbon */}
              <div className="bg-white border border-slate-200/70 rounded-2xl p-3 px-6 shadow-[0_8px_25px_rgb(0,0,0,0.008)] flex flex-wrap items-center justify-between gap-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Personal Inventory Breakdown</span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
                  
                  <button
                    onClick={() => setMyFilterCriteria(myFilterCriteria === 'public' ? null : 'public')}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                      myFilterCriteria === 'public'
                        ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                        : 'border-transparent hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">🌍</span>
                    <span>Public: <strong className="text-slate-800 font-bold ml-0.5">{myStats.public}</strong></span>
                  </button>

                  <button
                    onClick={() => setMyFilterCriteria(myFilterCriteria === 'private' ? null : 'private')}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                      myFilterCriteria === 'private'
                        ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                        : 'border-transparent hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">🔒</span>
                    <span>Private: <strong className="text-slate-800 font-bold ml-0.5">{myStats.private}</strong></span>
                  </button>

                  <span className="text-slate-250 hidden sm:inline">|</span>

                  <button
                    onClick={() => setMyFilterCriteria(myFilterCriteria === 'sold' ? null : 'sold')}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                      myFilterCriteria === 'sold'
                        ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                        : 'border-transparent hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">🤝</span>
                    <span>Sold: <strong className="text-slate-800 font-bold ml-0.5">{myStats.sold}</strong></span>
                  </button>

                  <button
                    onClick={() => setMyFilterCriteria(myFilterCriteria === 'rented' ? null : 'rented')}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                      myFilterCriteria === 'rented'
                        ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                        : 'border-transparent hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">🔑</span>
                    <span>Rented: <strong className="text-slate-800 font-bold ml-0.5">{myStats.rented}</strong></span>
                  </button>

                  <button
                    onClick={() => setMyFilterCriteria(myFilterCriteria === 'archived' ? null : 'archived')}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                      myFilterCriteria === 'archived'
                        ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                        : 'border-transparent hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">📁</span>
                    <span>Archived: <strong className="text-slate-800 font-bold ml-0.5">{myStats.archived}</strong></span>
                  </button>

                  <span className="text-slate-250 hidden sm:inline">|</span>

                  <button
                    onClick={() => setMyFilterCriteria(myFilterCriteria === 'featured' ? null : 'featured')}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                      myFilterCriteria === 'featured'
                        ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                        : 'border-transparent hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] text-amber-500 font-bold">★</span>
                    <span>Featured: <strong className="text-slate-800 font-bold ml-0.5">{myStats.featured}</strong></span>
                  </button>

                  <button
                    onClick={() => setMyFilterCriteria(myFilterCriteria === 'hot' ? null : 'hot')}
                    className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                      myFilterCriteria === 'hot'
                        ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                        : 'border-transparent hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px]">🔥</span>
                    <span>Hot: <strong className="text-slate-800 font-bold ml-0.5">{myStats.hot}</strong></span>
                  </button>

                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Col: My Listings Table/Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                    <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">My Properties</h3>
                        {myFilterCriteria && (
                          <button
                            onClick={() => setMyFilterCriteria(null)}
                            className="text-[9px] bg-rose-50 border border-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-md hover:bg-rose-100 transition-all flex items-center gap-1 active:scale-95"
                          >
                            <span>Clear Filter: {myFilterCriteria}</span>
                            <span>×</span>
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full">
                        {displayedMyProperties.length} listed
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {displayedMyProperties.length > 0 ? (
                        displayedMyProperties.map((property) => (
                          <div key={property._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors">
                            <div className="flex items-center gap-4">
                              <img
                                src={property.images?.[0] || '/placeholder.jpg'}
                                alt={property.title}
                                className="h-16 w-20 object-cover rounded-xl border border-slate-200/60 shadow-sm shrink-0 bg-slate-100"
                              />
                              <div className="truncate">
                                <Link
                                  to={`/property/${property._id}`}
                                  className="font-outfit text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors flex items-center gap-1 leading-snug"
                                >
                                  <span>{property.title}</span>
                                  <ExternalLink size={11} className="text-slate-400" />
                                </Link>
                                
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-semibold text-slate-500">
                                  
                                  {/* Visibility Badge */}
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                    property.visibility === 'private'
                                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                      : 'bg-teal-50 text-teal-700 border border-teal-100/50'
                                  }`}>
                                    <span>{property.visibility === 'private' ? '🔒 Private' : '🌍 Public'}</span>
                                  </span>

                                  {/* Listing Status Badge */}
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                    property.listingStatus === 'sold'
                                      ? 'bg-rose-50 text-rose-700 border border-rose-100/50'
                                      : property.listingStatus === 'rented'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100/50'
                                      : property.listingStatus === 'archived'
                                      ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                                  }`}>
                                    <span>
                                      {property.listingStatus === 'sold' ? '🔴 Sold' :
                                       property.listingStatus === 'rented' ? '🟠 Rented' :
                                       property.listingStatus === 'archived' ? '⚫ Archived' : '🟢 Active'}
                                    </span>
                                  </span>
                                  
                                  <span className="text-slate-300">|</span>
                                  <span>Views: {property.views || 0}</span>
                                  <span className="text-slate-300">|</span>
                                  
                                  {/* Clickable inquiries count text button */}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setMySelectedPropertyId(mySelectedPropertyId === property._id ? null : property._id);
                                    }}
                                    className={`transition-all font-semibold outline-none hover:text-teal-600 focus:outline-none ${
                                      mySelectedPropertyId === property._id ? 'text-teal-600 underline underline-offset-2 font-bold' : 'text-slate-500'
                                    }`}
                                  >
                                    Inquiries: {property.inquiries || 0}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <Link
                                to={`/dashboard/edit-property/${property._id}`}
                                className="h-9 w-9 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-all active:scale-95"
                                title="Edit listing"
                              >
                                <Edit2 size={13} />
                              </Link>
                              <button
                                onClick={() => handleDeleteProperty(property._id)}
                                className="h-9 w-9 bg-slate-50 border border-slate-200 hover:border-red-250 hover:bg-red-55 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-655 transition-all active:scale-95"
                                title="Delete listing"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center text-slate-400 text-xs font-semibold leading-relaxed">
                          No listed properties match the selected criteria.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Col: Recent Inquiries Feed */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                    <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">
                        {myShowAllInquiries ? 'All Inquiries Archive' : mySelectedPropertyId ? 'Filtered Inquiries' : 'Recent Inquiries'}
                      </h3>
                      <div className="flex items-center gap-2">
                        {mySelectedPropertyId && (
                          <button
                            onClick={() => setMySelectedPropertyId(null)}
                            className="text-[9px] text-rose-500 font-bold hover:underline"
                          >
                            Clear Property
                          </button>
                        )}
                        {myShowAllInquiries ? (
                          <button
                            onClick={() => {
                              setMyShowAllInquiries(false);
                              setMyInquirySearchName('');
                              setMyInquiryStartDate('');
                              setMyInquiryEndDate('');
                              setMyShowStarredOnly(false);
                            }}
                            className="text-[9px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-0.5 rounded-md transition-all active:scale-95"
                          >
                            Unread Only
                          </button>
                        ) : (
                          <button
                            onClick={() => setMyShowAllInquiries(true)}
                            className="text-[9px] bg-teal-50 border border-teal-150 text-teal-600 font-bold px-2 py-0.5 rounded-md hover:bg-teal-100/50 transition-all active:scale-95"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search & Date Range filters for Archive mode */}
                    {myShowAllInquiries && (
                      <div className="p-3.5 bg-slate-50 border-b border-slate-100 space-y-3">
                        <input
                          type="text"
                          placeholder="Search name, email, or message..."
                          value={myInquirySearchName}
                          onChange={(e) => setMyInquirySearchName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none focus:border-teal-500 bg-white placeholder-slate-400 font-semibold"
                        />
                        
                        {/* Date Range selectors */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex items-center gap-1 flex-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">From:</label>
                            <input
                              type="date"
                              value={myInquiryStartDate}
                              onChange={(e) => setMyInquiryStartDate(e.target.value)}
                              className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded-lg outline-none bg-white text-slate-700 font-semibold cursor-pointer"
                            />
                          </div>
                          <div className="flex items-center gap-1 flex-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">To:</label>
                            <input
                              type="date"
                              value={myInquiryEndDate}
                              onChange={(e) => setMyInquiryEndDate(e.target.value)}
                              className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded-lg outline-none bg-white text-slate-700 font-semibold cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                          {/* Starred filter button */}
                          <button
                            onClick={() => setMyShowStarredOnly(!myShowStarredOnly)}
                            className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md transition-all active:scale-95 border flex items-center gap-1 ${
                              myShowStarredOnly
                                ? 'bg-amber-500 border-amber-600 text-white'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <Star size={9} className={myShowStarredOnly ? 'fill-white' : ''} />
                            <span>Starred Only</span>
                          </button>

                          {(myInquirySearchName || myInquiryStartDate || myInquiryEndDate || myShowStarredOnly) && (
                            <button
                              onClick={() => {
                                setMyInquirySearchName('');
                                setMyInquiryStartDate('');
                                setMyInquiryEndDate('');
                                setMyShowStarredOnly(false);
                              }}
                              className="text-[10px] text-rose-500 font-bold hover:underline"
                            >
                              Reset Filters
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                      {displayedMyInquiries.length > 0 ? (
                        displayedMyInquiries.map((inquiry) => (
                          <div key={inquiry._id} className={`p-5 space-y-3 transition-colors ${!inquiry.isRead ? 'bg-teal-50/10' : ''}`}>
                            <div className="flex justify-between items-start gap-2">
                              <div className="truncate">
                                <p className="font-outfit text-sm font-bold text-slate-900 truncate leading-snug">{inquiry.name}</p>
                                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-1 font-semibold">
                                  <Mail size={10} />
                                  <span className="truncate">{inquiry.email}</span>
                                </div>
                                {inquiry.phone && (
                                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] mt-0.5 font-semibold">
                                    <Phone size={10} />
                                    <span>{inquiry.phone}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-1.5 items-end shrink-0">
                                {/* Star / Important Action */}
                                <button
                                  onClick={() => toggleAdminInquiryStar(inquiry._id)}
                                  className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all active:scale-95 flex items-center gap-1 ${
                                    adminStarredInquiryIds.includes(inquiry._id)
                                      ? 'bg-amber-50 border border-amber-200 text-amber-600'
                                      : 'bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600'
                                  }`}
                                  title={adminStarredInquiryIds.includes(inquiry._id) ? "Starred" : "Mark Important"}
                                >
                                  <Star size={10} className={adminStarredInquiryIds.includes(inquiry._id) ? 'fill-amber-500 text-amber-500' : ''} />
                                  <span>{adminStarredInquiryIds.includes(inquiry._id) ? 'Saved' : 'Save'}</span>
                                </button>

                                {/* Mark Read Action */}
                                {!inquiry.isRead && (
                                  <button
                                    onClick={() => handleMarkAsRead(inquiry._id)}
                                    className="text-[9px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/70 border border-teal-100 px-2 py-1 rounded-md transition-colors"
                                  >
                                    Mark Read
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-xl">
                              <p className="text-slate-600 text-xs italic leading-relaxed whitespace-pre-wrap">
                                "{inquiry.message}"
                              </p>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              <ShieldCheck size={11} className="text-teal-600" />
                              <span className="truncate">Target: {inquiry.property?.title || 'Inactive Listing'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-12 text-center text-slate-400 text-xs font-semibold leading-relaxed">
                          {mySelectedPropertyId ? 'No matching inquiries on target property.' : 'No matching inquiries found.'}
                        </div>
                      )}
                    </div>
                  </div>
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
                      <th className="px-6 py-4 text-left">Visibility & Status</th>
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
                                <div className="text-[10px] text-slate-400 space-y-0.5 mt-0.5 font-semibold">
                                  <span>City: {property.city}</span>
                                  <span className="block text-teal-600">Agent: {property.owner?.name || 'Unknown Agent'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4 whitespace-nowrap text-slate-950 font-bold">
                            {formatPrice(property.price)}
                          </td>

                          {/* Visibility & Status badges */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                property.visibility === 'private'
                                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                  : 'bg-teal-50 text-teal-700 border border-teal-100/50'
                              }`}>
                                <span>{property.visibility === 'private' ? '🔒 Private' : '🌍 Public'}</span>
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                property.listingStatus === 'sold'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100/50'
                                  : property.listingStatus === 'rented'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100/50'
                                  : property.listingStatus === 'archived'
                                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                              }`}>
                                <span>
                                  {property.listingStatus === 'sold' ? '🔴 Sold' :
                                   property.listingStatus === 'rented' ? '🟠 Rented' :
                                   property.listingStatus === 'archived' ? '⚫ Archived' : '🟢 Active'}
                                </span>
                              </span>
                            </div>
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
                              {property.featured ? '★ FEATURED' : '★ HIGHLIGHT'}
                            </button>
                          </td>

                          {/* Action controls */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <Link
                                to={`/dashboard/edit-property/${property._id}`}
                                className="h-8 w-8 bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-950 transition-all active:scale-95"
                                title="Edit listing"
                              >
                                <Edit2 size={12} />
                              </Link>
                              <Link
                                to={`/property/${property._id}`}
                                className="h-8 w-8 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-950 transition-all active:scale-95"
                                title="View listing page"
                              >
                                <ExternalLink size={12} />
                              </Link>
                              <button
                                onClick={() => handleDeleteProperty(property._id)}
                                className="h-8 w-8 bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-655 transition-all active:scale-95"
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
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((u, i) => (
                        <tr
                          key={u._id}
                          className={`group transition-colors ${
                            i !== paginatedUsers.length - 1 ? 'border-b border-slate-100/80' : ''
                          } hover:bg-slate-50/40`}
                        >
                          {/* Avatar + Name */}
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                                u.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : u.role === 'agent'
                                  ? 'bg-teal-100 text-teal-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {(u.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-bold text-slate-900">{u.name}</span>
                            </div>
                          </td>

                          <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-500 font-medium">{u.email}</td>

                          {/* Role Badge */}
                          <td className="px-6 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                                : u.role === 'agent'
                                ? 'bg-teal-50 text-teal-700 border border-teal-200/60'
                                : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                u.role === 'admin' ? 'bg-purple-500' : u.role === 'agent' ? 'bg-teal-500' : 'bg-slate-400'
                              }`} />
                              {u.role || 'user'}
                            </span>
                          </td>

                          {/* Joined Date */}
                          <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-400 font-medium">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-3.5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              {u.role === 'agent' && (
                                <button
                                  onClick={() => handleRevokeAgentClick(u)}
                                  title="Revoke agent privileges"
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 hover:text-amber-800 transition-all active:scale-95"
                                >
                                  <ShieldAlert size={11} />
                                  Revoke
                                </button>
                              )}
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUserClick(u)}
                                  title="Delete user account"
                                  className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all active:scale-95"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Users size={28} className="text-slate-300" />
                            <p className="text-slate-400 text-xs font-semibold">No matching registered members found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {usersTotalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Showing <span className="text-slate-700">{(usersPage - 1) * USERS_PER_PAGE + 1}–{Math.min(usersPage * USERS_PER_PAGE, filteredUsers.length)}</span> of <span className="text-slate-700">{filteredUsers.length}</span> members
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                      disabled={usersPage === 1}
                      className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 text-xs font-bold"
                    >
                      ‹
                    </button>
                    {Array.from({ length: usersTotalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === usersTotalPages || Math.abs(p - usersPage) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '...' ? (
                          <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-slate-400">…</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setUsersPage(item)}
                            className={`w-7 h-7 rounded-lg border text-[11px] font-bold transition-all active:scale-95 ${
                              usersPage === item
                                ? 'bg-slate-900 border-slate-900 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )
                    }
                    <button
                      onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                      disabled={usersPage === usersTotalPages}
                      className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 text-xs font-bold"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab Content */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Premium Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Platform Views */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Views</p>
                    <p className="font-outfit text-2xl font-extrabold text-slate-900 leading-none">{stats.properties.totalViews}</p>
                  </div>
                  <span className="text-sm">👁️</span>
                </div>

                {/* Total Platform Inquiries */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
                    <p className="font-outfit text-2xl font-extrabold text-slate-900 leading-none">{stats.properties.totalInquiries}</p>
                  </div>
                  <span className="text-sm">✉️</span>
                </div>

                {/* Featured Listings count */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Featured Items</p>
                    <p className="font-outfit text-2xl font-extrabold text-slate-900 leading-none">{stats.properties.featured}</p>
                  </div>
                  <span className="text-sm">⭐</span>
                </div>

                {/* Hot items count */}
                <div className="bg-white rounded-2xl border border-slate-200/85 p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hot Items</p>
                    <p className="font-outfit text-2xl font-extrabold text-slate-900 leading-none">{stats.properties.hot}</p>
                  </div>
                  <span className="text-sm">🔥</span>
                </div>

              </div>

              {/* Stats Listing Panel */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">Listing Rankings & Performance</h3>
                  
                  {/* Search and Sort controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search title, agent, or city..."
                      value={statsSearch}
                      onChange={(e) => setStatsSearch(e.target.value)}
                      className="px-3.5 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50/50 text-slate-800 w-52 placeholder-slate-400 font-semibold"
                    />
                    <select
                      value={statsSortBy}
                      onChange={(e) => setStatsSortBy(e.target.value)}
                      className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none bg-slate-50/50 text-slate-700 font-bold cursor-pointer w-40"
                    >
                      <option value="views-desc">Highest Views 👁️</option>
                      <option value="views-asc">Lowest Views 👁️</option>
                      <option value="inquiries-desc">Most Inquiries ✉️</option>
                      <option value="price-desc">Highest Price 💰</option>
                      <option value="price-asc">Lowest Price 💰</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4 text-center w-16">Rank</th>
                        <th className="px-6 py-4 text-left">Property Title</th>
                        <th className="px-6 py-4 text-left">Listing Agent</th>
                        <th className="px-6 py-4 text-center">Views</th>
                        <th className="px-6 py-4 text-center">Inquiries</th>
                        <th className="px-6 py-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 bg-white text-xs text-slate-655 font-semibold">
                      {sortedStatsProperties.length > 0 ? (
                        sortedStatsProperties.map((p, idx) => (
                          <tr key={p._id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 text-center text-slate-400 font-bold">
                              #{idx + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link
                                to={`/property/${p._id}`}
                                className="font-outfit font-bold text-slate-900 hover:text-teal-600 flex items-center gap-1"
                              >
                                <span>{p.title}</span>
                                <ExternalLink size={11} className="text-slate-400" />
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-slate-900 font-bold">{p.owner?.name || 'Unknown Agent'}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5">{p.owner?.email || ''}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-800 font-bold">{p.views || 0}</td>
                            <td className="px-6 py-4 text-center text-slate-800 font-bold">{p.inquiries || 0}</td>
                            <td className="px-6 py-4 text-right text-slate-950 font-bold">{formatPrice(p.price)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
                            No properties found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Premium Rejection reason popup modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-outfit text-base font-extrabold text-slate-900">Rejection Feedback</h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Provide a descriptive reason explaining why this broker registration request is being rejected.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
              placeholder="Reason (must be at least 5 characters)..."
              className="w-full px-3 py-2 text-xs border border-slate-250 rounded-xl outline-none focus:border-teal-500 bg-slate-50/50 text-slate-700 font-semibold"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectingRequestId(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 bg-slate-150 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all animate-none"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Revoke Agent Confirmation Modal ── */}
      {revokingAgentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setRevokingAgentId(null); setRevokingAgentName(''); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Accent strip */}
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <ShieldAlert size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-outfit text-base font-bold text-slate-900 mb-1">Revoke Agent?</h3>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    <span className="text-slate-800">{revokingAgentName}</span> will lose agent privileges.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-150 text-[11px] text-slate-500 leading-relaxed space-y-1">
                <p>• Their existing properties will remain.</p>
                <p>• They can request agent access again later.</p>
              </div>

              <div className="mt-5 flex items-center gap-2.5 justify-end">
                <button
                  onClick={() => { setRevokingAgentId(null); setRevokingAgentName(''); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRevoke}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <ShieldAlert size={12} />
                  Revoke Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete User Confirmation Modal ── */}
      {deletingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setDeletingUserId(null); setDeletingUserName(''); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Accent strip */}
            <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-600" />
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-outfit text-base font-bold text-slate-900 mb-1">Delete Account?</h3>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    You are about to permanently delete <span className="text-slate-800">{deletingUserName}</span>'s account.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3.5 bg-red-50/60 rounded-xl border border-red-100 text-[11px] text-red-500 leading-relaxed font-semibold">
                ⚠️ This action cannot be undone.
              </div>

              <div className="mt-5 flex items-center gap-2.5 justify-end">
                <button
                  onClick={() => { setDeletingUserId(null); setDeletingUserName(''); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteUser}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Trash2 size={12} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default AdminDashboard;