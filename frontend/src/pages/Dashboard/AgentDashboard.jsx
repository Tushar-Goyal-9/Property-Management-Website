import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Eye, MessageSquare, Plus, Edit2, Trash2, Mail, Phone, ExternalLink, ShieldCheck, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import PageWrapper from '../../components/common/PageWrapper';

const AgentDashboard = () => {
  const { user } = useAuthStore();
  const [myProperties, setMyProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
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
  });
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState(null);

  // Archive & search states for inquiries
  const [showAllInquiries, setShowAllInquiries] = useState(false);
  const [inquirySearchName, setInquirySearchName] = useState('');
  const [inquiryStartDate, setInquiryStartDate] = useState('');
  const [inquiryEndDate, setInquiryEndDate] = useState('');
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Local storage backup for Starred/Important inquiries
  const [starredInquiryIds, setStarredInquiryIds] = useState(() => {
    try {
      const saved = localStorage.getItem('property_dunia_starred_inquiries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toggle important star status
  const toggleImportant = (id) => {
    let updated;
    if (starredInquiryIds.includes(id)) {
      updated = starredInquiryIds.filter(item => item !== id);
      toast.success('Inquiry unmarked as important');
    } else {
      updated = [...starredInquiryIds, id];
      toast.success('Inquiry marked as important');
    }
    setStarredInquiryIds(updated);
    localStorage.setItem('property_dunia_starred_inquiries', JSON.stringify(updated));
  };

  // Fetch agent's own properties and dashboard statistics
  const fetchMyProperties = useCallback(async () => {
    if (!user?._id) return;
    try {
      const [propertiesRes, statsRes] = await Promise.all([
        api.get(`/properties?owner=${user._id}`),
        api.get('/properties/dashboard/stats'),
      ]);
      setMyProperties(propertiesRes.data.properties || []);
      setStats(statsRes.data || {
        totalProperties: 0,
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
      });
    } catch (error) {
      console.error('Failed to fetch properties and stats:', error);
    }
  }, [user]);

  // Fetch inquiries for agent's properties
  const fetchInquiries = useCallback(async () => {
    try {
      const { data } = await api.get('/inquiries');
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
    if (!window.confirm('Are you sure you want to delete this property listing permanently?')) {
      return;
    }
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Listing deleted successfully');
      await fetchMyProperties();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete property listing');
    }
  };

  // Mark inquiry as read
  const handleMarkAsRead = async (inquiryId) => {
    try {
      await api.patch(`/inquiries/${inquiryId}/read`);
      toast.success('Inquiry marked as read');
      await fetchInquiries();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Filter properties based on the clicked filter criteria
  const displayedProperties = useMemo(() => {
    return myProperties.filter((property) => {
      if (!filterCriteria) return true;
      if (filterCriteria === 'active') return property.listingStatus === 'active';
      if (filterCriteria === 'sold') return property.listingStatus === 'sold';
      if (filterCriteria === 'rented') return property.listingStatus === 'rented';
      if (filterCriteria === 'archived') return property.listingStatus === 'archived';
      if (filterCriteria === 'public') return property.visibility === 'public';
      if (filterCriteria === 'private') return property.visibility === 'private';
      if (filterCriteria === 'featured') return property.featured === true;
      if (filterCriteria === 'hot') return property.hot === true;
      return true;
    });
  }, [myProperties, filterCriteria]);

  // Filter inquiries based on unread selection, search queries, star toggles, and date range filters
  const displayedInquiries = useMemo(() => {
    let list = inquiries;

    // Filter by target property if clicked
    if (selectedPropertyId) {
      list = list.filter(inq => inq.property?._id === selectedPropertyId);
    }

    if (showAllInquiries) {
      // Archive: show all read/unread matching name or date search
      if (inquirySearchName) {
        const query = inquirySearchName.toLowerCase();
        list = list.filter(inq =>
          inq.name?.toLowerCase().includes(query) ||
          inq.email?.toLowerCase().includes(query) ||
          inq.message?.toLowerCase().includes(query)
        );
      }
      if (inquiryStartDate) {
        list = list.filter(inq => {
          if (!inq.createdAt) return false;
          const createDate = new Date(inq.createdAt);
          createDate.setHours(0, 0, 0, 0);
          return createDate >= new Date(inquiryStartDate);
        });
      }
      if (inquiryEndDate) {
        list = list.filter(inq => {
          if (!inq.createdAt) return false;
          const createDate = new Date(inq.createdAt);
          createDate.setHours(23, 59, 59, 999);
          return createDate <= new Date(inquiryEndDate);
        });
      }
      if (showStarredOnly) {
        list = list.filter(inq => starredInquiryIds.includes(inq._id));
      }
      return list;
    } else {
      // Recent feed: unread only, limited to 3 items
      list = list.filter(inq => !inq.isRead);
      return list.slice(0, 3);
    }
  }, [inquiries, selectedPropertyId, showAllInquiries, inquirySearchName, inquiryStartDate, inquiryEndDate, showStarredOnly, starredInquiryIds]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="bg-slate-50/50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Manager Access</p>
              <h1 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">Agent Dashboard</h1>
            </div>
            
            <Link
              to="/dashboard/add-property"
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-600/10 transition-all"
            >
              <Plus size={14} />
              <span>Add New Property</span>
            </Link>
          </div>

          {/* SaaS Core Stats - Premium 4 Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Properties */}
            <div
              onClick={() => setFilterCriteria(null)}
              className={`bg-white rounded-2xl border p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-teal-400 hover:shadow-md active:scale-[0.98] ${
                !filterCriteria ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-1 min-w-0 z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Total Listings</p>
                <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-none">{stats.totalProperties}</p>
              </div>
              <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600 shrink-0 z-10">
                <LayoutGrid size={18} strokeWidth={1.5} />
              </div>
            </div>

            {/* Active Listings */}
            <div
              onClick={() => setFilterCriteria(filterCriteria === 'active' ? null : 'active')}
              className={`bg-white rounded-2xl border p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-teal-400 hover:shadow-md active:scale-[0.98] ${
                filterCriteria === 'active' ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-1 min-w-0 z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Active Listings</p>
                <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-none">{stats.active}</p>
              </div>
              <div className="h-11 w-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 z-10">
                <span className="text-sm">🟢</span>
              </div>
            </div>

            {/* Total Views */}
            <div
              onClick={() => setFilterCriteria(null)}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-teal-400 hover:shadow-md active:scale-[0.98]"
            >
              <div className="space-y-1 min-w-0 z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Impressions</p>
                <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-none">{stats.totalViews}</p>
              </div>
              <div className="h-11 w-11 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0 z-10">
                <Eye size={18} strokeWidth={1.5} />
              </div>
            </div>

            {/* Total Inquiries */}
            <div
              onClick={() => {
                setSelectedPropertyId(null);
                setFilterCriteria(null);
                setShowAllInquiries(true);
                toast.info("Showing all inquiries archive with search filters");
              }}
              className={`bg-white rounded-2xl border p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden transition-all duration-200 cursor-pointer hover:border-teal-400 hover:shadow-md active:scale-[0.98] ${
                showAllInquiries ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-1 min-w-0 z-10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Leads / Inquiries</p>
                <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-none">{stats.totalInquiries}</p>
              </div>
              <div className="h-11 w-11 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0 z-10">
                <MessageSquare size={18} strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Secondary Stats breakdown ribbon */}
          <div className="bg-white border border-slate-200/70 rounded-2xl p-3 px-6 shadow-[0_8px_25px_rgb(0,0,0,0.008)] flex flex-wrap items-center justify-between gap-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Inventory Breakdown</span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
              
              <button
                onClick={() => setFilterCriteria(filterCriteria === 'public' ? null : 'public')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                  filterCriteria === 'public'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px]">🌍</span>
                <span>Public: <strong className="text-slate-800 font-bold ml-0.5">{stats.public}</strong></span>
              </button>

              <button
                onClick={() => setFilterCriteria(filterCriteria === 'private' ? null : 'private')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                  filterCriteria === 'private'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px]">🔒</span>
                <span>Private: <strong className="text-slate-800 font-bold ml-0.5">{stats.private}</strong></span>
              </button>

              <span className="text-slate-250 hidden sm:inline">|</span>

              <button
                onClick={() => setFilterCriteria(filterCriteria === 'sold' ? null : 'sold')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                  filterCriteria === 'sold'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px]">🤝</span>
                <span>Sold: <strong className="text-slate-800 font-bold ml-0.5">{stats.sold}</strong></span>
              </button>

              <button
                onClick={() => setFilterCriteria(filterCriteria === 'rented' ? null : 'rented')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                  filterCriteria === 'rented'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px]">🔑</span>
                <span>Rented: <strong className="text-slate-800 font-bold ml-0.5">{stats.rented}</strong></span>
              </button>

              <button
                onClick={() => setFilterCriteria(filterCriteria === 'archived' ? null : 'archived')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                  filterCriteria === 'archived'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px]">📁</span>
                <span>Archived: <strong className="text-slate-800 font-bold ml-0.5">{stats.archived}</strong></span>
              </button>

              <span className="text-slate-250 hidden sm:inline">|</span>

              <button
                onClick={() => setFilterCriteria(filterCriteria === 'featured' ? null : 'featured')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                  filterCriteria === 'featured'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px] text-amber-500 font-bold">★</span>
                <span>Featured: <strong className="text-slate-800 font-bold ml-0.5">{stats.featured}</strong></span>
              </button>

              <button
                onClick={() => setFilterCriteria(filterCriteria === 'hot' ? null : 'hot')}
                className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all active:scale-95 ${
                  filterCriteria === 'hot'
                    ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                    : 'border-transparent hover:bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-[10px]">🔥</span>
                <span>Hot: <strong className="text-slate-800 font-bold ml-0.5">{stats.hot}</strong></span>
              </button>

            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Col: My Listings Table/Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">My Listings</h3>
                    {filterCriteria && (
                      <button
                        onClick={() => setFilterCriteria(null)}
                        className="text-[9px] bg-rose-50 border border-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-md hover:bg-rose-100 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <span>Clear Filter: {filterCriteria}</span>
                        <span>×</span>
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full">
                    {displayedProperties.length} listed
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {displayedProperties.length > 0 ? (
                    displayedProperties.map((property) => (
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
                                  setSelectedPropertyId(selectedPropertyId === property._id ? null : property._id);
                                }}
                                className={`transition-all font-semibold outline-none hover:text-teal-600 focus:outline-none ${
                                  selectedPropertyId === property._id ? 'text-teal-600 underline underline-offset-2 font-bold' : 'text-slate-500'
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
                            onClick={() => handleDelete(property._id)}
                            className="h-9 w-9 bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-655 transition-all active:scale-95"
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
                    {showAllInquiries ? 'All Inquiries Archive' : selectedPropertyId ? 'Filtered Inquiries' : 'Recent Inquiries'}
                  </h3>
                  <div className="flex items-center gap-2">
                    {selectedPropertyId && (
                      <button
                        onClick={() => setSelectedPropertyId(null)}
                        className="text-[9px] text-rose-500 font-bold hover:underline"
                      >
                        Clear Property
                      </button>
                    )}
                    {showAllInquiries ? (
                      <button
                        onClick={() => {
                          setShowAllInquiries(false);
                          setInquirySearchName('');
                          setInquiryStartDate('');
                          setInquiryEndDate('');
                          setShowStarredOnly(false);
                        }}
                        className="text-[9px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-0.5 rounded-md transition-all active:scale-95"
                      >
                        Unread Only
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowAllInquiries(true)}
                        className="text-[9px] bg-teal-50 border border-teal-150 text-teal-600 font-bold px-2 py-0.5 rounded-md hover:bg-teal-100/50 transition-all active:scale-95"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>

                {/* Search & Date Range filters for Archive mode */}
                {showAllInquiries && (
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 space-y-3">
                    <input
                      type="text"
                      placeholder="Search name, email, or message..."
                      value={inquirySearchName}
                      onChange={(e) => setInquirySearchName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg outline-none focus:border-teal-500 bg-white placeholder-slate-400 font-semibold"
                    />
                    
                    {/* Date Range selectors */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex items-center gap-1 flex-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">From:</label>
                        <input
                          type="date"
                          value={inquiryStartDate}
                          onChange={(e) => setInquiryStartDate(e.target.value)}
                          className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded-lg outline-none bg-white text-slate-700 font-semibold cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center gap-1 flex-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">To:</label>
                        <input
                          type="date"
                          value={inquiryEndDate}
                          onChange={(e) => setInquiryEndDate(e.target.value)}
                          className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded-lg outline-none bg-white text-slate-700 font-semibold cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                      {/* Starred filter button */}
                      <button
                        onClick={() => setShowStarredOnly(!showStarredOnly)}
                        className={`text-[9px] font-extrabold px-2.5 py-1 rounded-md transition-all active:scale-95 border flex items-center gap-1 ${
                          showStarredOnly
                            ? 'bg-amber-500 border-amber-600 text-white'
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <Star size={9} className={showStarredOnly ? 'fill-white' : ''} />
                        <span>Starred Only</span>
                      </button>

                      {(inquirySearchName || inquiryStartDate || inquiryEndDate || showStarredOnly) && (
                        <button
                          onClick={() => {
                            setInquirySearchName('');
                            setInquiryStartDate('');
                            setInquiryEndDate('');
                            setShowStarredOnly(false);
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
                  {displayedInquiries.length > 0 ? (
                    displayedInquiries.map((inquiry) => (
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
                              onClick={() => toggleImportant(inquiry._id)}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all active:scale-95 flex items-center gap-1 ${
                                starredInquiryIds.includes(inquiry._id)
                                  ? 'bg-amber-50 border border-amber-200 text-amber-600'
                                  : 'bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600'
                              }`}
                              title={starredInquiryIds.includes(inquiry._id) ? "Starred" : "Mark Important"}
                            >
                              <Star size={10} className={starredInquiryIds.includes(inquiry._id) ? 'fill-amber-500 text-amber-500' : ''} />
                              <span>{starredInquiryIds.includes(inquiry._id) ? 'Saved' : 'Save'}</span>
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
                      {selectedPropertyId ? 'No matching inquiries on target property.' : 'No matching inquiries found.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default AgentDashboard;