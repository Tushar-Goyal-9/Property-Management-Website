import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Eye, MessageSquare, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Clock, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import PageWrapper from '../../components/common/PageWrapper';

const AgentDashboard = () => {
  const { user } = useAuthStore();
  const [myProperties, setMyProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, views: 0, inquiries: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

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

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
        </div>
      </PageWrapper>
    );
  }

  // Filter inquiries based on selected property click
  const filteredInquiries = selectedPropertyId
    ? inquiries.filter(inq => inq.property?._id === selectedPropertyId)
    : inquiries;

  return (
    <PageWrapper>
      <div className="bg-slate-50/50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
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

          {/* SaaS Core Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Stat 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Listings</p>
                <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-tight">{stats.total}</p>
              </div>
              <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                <LayoutGrid size={18} strokeWidth={1.5} />
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Impressions</p>
                <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-tight">{stats.views}</p>
              </div>
              <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                <Eye size={18} strokeWidth={1.5} />
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Inquiries</p>
                <p className="font-outfit text-3xl font-extrabold text-slate-900 leading-tight">{stats.inquiries}</p>
              </div>
              <div className="h-11 w-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                <MessageSquare size={18} strokeWidth={1.5} />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Col: My Listings Table/Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-outfit text-sm font-bold text-slate-900 uppercase tracking-wider">My Listings</h3>
                  <span className="text-[10px] font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full">
                    {myProperties.length} active
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {myProperties.length > 0 ? (
                    myProperties.map((property) => (
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
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                property.status === 'approved' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                                  : property.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-100/50'
                                  : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                              }`}>
                                {property.status === 'approved' && <CheckCircle2 size={10} />}
                                {property.status === 'rejected' && <AlertCircle size={10} />}
                                {property.status === 'pending' && <Clock size={10} />}
                                <span className="capitalize">{property.status || 'pending'}</span>
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
                            className="h-9 w-9 bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-600 transition-all active:scale-95"
                            title="Delete listing"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-slate-400 text-xs font-semibold leading-relaxed">
                      No listings registered yet. Start listing properties to populate metrics.
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
                    {selectedPropertyId ? 'Filtered Inquiries' : 'Recent Inquiries'}
                  </h3>
                  {selectedPropertyId ? (
                    <button
                      onClick={() => setSelectedPropertyId(null)}
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:underline transition-all"
                    >
                      Clear Filter
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold bg-teal-50 border border-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                      Active Feed
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => (
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

                          {!inquiry.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(inquiry._id)}
                              className="text-[10px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/70 border border-teal-100 px-2.5 py-1 rounded-md shrink-0 transition-colors"
                            >
                              Mark Read
                            </button>
                          )}
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
                      No matching inquiries found.
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