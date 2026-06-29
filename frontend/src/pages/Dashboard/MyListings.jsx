import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Eye, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import PageWrapper from '../../components/common/PageWrapper';
import { formatPrice } from '../../utils/formatters';

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
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await api.delete(`/properties/${id}`);
      toast.success('Listing deleted successfully');
      setProperties(properties.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete property');
    }
  };

  if (loading) return <Spinner />;

  return (
    <PageWrapper>
      <div className="bg-slate-50/50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1 font-semibold">Inventory Manager</p>
              <h1 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">My Listings</h1>
            </div>
            
            <Link
              to="/dashboard/add-property"
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-md shadow-teal-600/10 transition-all"
            >
              <Plus size={14} />
              <span>Add New Listing</span>
            </Link>
          </div>

          {/* Table Container */}
          {properties.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md mx-auto">
              <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                <LayoutGrid size={20} />
              </div>
              <h3 className="font-outfit font-bold text-slate-900 mb-1">No Active Listings</h3>
              <p className="text-slate-400 text-xs mb-6">
                You have not registered any properties yet. Click the button to add a new listing.
              </p>
              <Link
                to="/dashboard/add-property"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all inline-block"
              >
                Create Listing
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 text-left">Property Details</th>
                      <th className="px-6 py-4 text-left">Listing Price</th>
                      <th className="px-6 py-4 text-left">Imprimatur Status</th>
                      <th className="px-6 py-4 text-left">Impressions</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white text-xs text-slate-600 font-semibold">
                    {properties.map((prop) => (
                      <tr key={prop._id} className="hover:bg-slate-50/30 transition-colors">
                        
                        {/* Title & Image */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={prop.images?.[0] || '/placeholder.jpg'}
                              alt=""
                              className="h-11 w-14 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                            />
                            <div className="truncate">
                              <Link
                                to={`/property/${prop._id}`}
                                className="font-outfit font-bold text-slate-900 hover:text-teal-600 transition-colors flex items-center gap-1 leading-snug"
                              >
                                <span className="truncate max-w-[200px]">{prop.title}</span>
                                <ExternalLink size={11} className="text-slate-400" />
                              </Link>
                              <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{prop.city}</span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-slate-950 font-bold">
                          {formatPrice(prop.price)}
                          {prop.listingType === 'Rent' && (
                            <span className="text-[10px] font-semibold text-slate-400 ml-0.5">/mo</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                            prop.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                              : prop.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100/50'
                              : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                          }`}>
                            {prop.status === 'approved' && <CheckCircle2 size={10} />}
                            {prop.status === 'rejected' && <AlertCircle size={10} />}
                            {prop.status === 'pending' && <Clock size={10} />}
                            <span>{prop.status || 'pending'}</span>
                          </span>
                        </td>

                        {/* Views */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                            <Eye size={13} className="text-slate-400" />
                            <span>{prop.views || 0}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4.5 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to={`/dashboard/edit-property/${prop._id}`}
                              className="h-8 w-8 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all active:scale-95"
                              title="Edit listing"
                            >
                              <Edit2 size={12} />
                            </Link>
                            <button
                              onClick={() => handleDelete(prop._id)}
                              className="h-8 w-8 bg-slate-50 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl flex items-center justify-center text-slate-600 hover:text-red-600 transition-all active:scale-95"
                              title="Delete listing"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
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

export default MyListings;