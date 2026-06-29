import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Inbox, Compass, ArrowRight, ShieldCheck, Calendar, User, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import Spinner from '../../components/common/Spinner';
import PageWrapper from '../../components/common/PageWrapper';

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
    <PageWrapper>
      <div className="bg-slate-50/50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Welcome Message banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(13,148,136,0.12),transparent_40%)]" />
            <div className="relative z-10 space-y-1.5">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <ShieldCheck size={12} /> Registered Buyer Profile
              </span>
              <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || 'Home Seeker'}!
              </h1>
              <p className="text-slate-400 text-xs font-medium">
                Manage your saved properties, track active inquiries, and navigate the directory.
              </p>
            </div>

            <Link
              to="/properties"
              className="relative z-10 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-teal-600/10 shrink-0"
            >
              <Compass size={14} />
              <span>Explore Listings</span>
            </Link>
          </div>

          {/* Become a Verified Agent Application Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.04),transparent_70%)] pointer-events-none" />
            
            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-teal-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <UserPlus size={10} /> Partner Program
              </div>
              <h2 className="font-outfit text-lg font-extrabold text-slate-900 tracking-tight">
                Become a Verified Agent
              </h2>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Apply for agent access to list properties, manage listings, and grow your real estate business. Applications are reviewed by our administrators.
              </p>
            </div>

            <button
              onClick={() => toast.info("Agent application feature is coming soon!")}
              className="relative z-10 bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              Request Agent Access
            </button>
          </div>

          {/* Grid panel cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Wishlist Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2 text-slate-800">
                  <Heart size={15} className="text-rose-500 fill-rose-500/10" />
                  <span className="font-outfit text-sm font-bold tracking-wide uppercase">My Wishlist</span>
                </div>
                <Link to="/wishlist" className="group text-teal-600 hover:text-teal-700 font-bold text-xs flex items-center gap-1">
                  View All <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  No properties saved to your wishlist yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {wishlist.slice(0, 3).map((property) => (
                    <Link
                      key={property._id}
                      to={`/property/${property._id}`}
                      className="flex items-center justify-between gap-4 py-3.5 hover:bg-slate-50/40 rounded-xl px-2 -mx-2 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={property.images?.[0] || '/placeholder.jpg'}
                          alt=""
                          className="h-11 w-14 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-outfit text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                            {property.title}
                          </p>
                          <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">{property.city}</p>
                        </div>
                      </div>
                      <ArrowRight size={13} className="text-slate-300 group-hover:text-teal-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Inquiries Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2 text-slate-800">
                  <Inbox size={15} className="text-teal-600" />
                  <span className="font-outfit text-sm font-bold tracking-wide uppercase">Sent Inquiries</span>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full">
                  {inquiries.length} total
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                  No inquiries sent yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {inquiries.slice(0, 4).map((inquiry) => (
                    <div key={inquiry._id} className="py-3.5 space-y-1.5">
                      <div className="flex justify-between items-start gap-3">
                        <Link
                          to={`/property/${inquiry.property?._id}`}
                          className="font-outfit text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors truncate leading-snug"
                        >
                          {inquiry.property?.title || 'Unknown Property'}
                        </Link>
                        
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-150 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                          <Calendar size={9} />
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <User size={11} className="text-teal-600" />
                        <span>Owner Broker: {inquiry.agent?.name || 'Agent'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </PageWrapper>
  );
};

export default UserDashboard;