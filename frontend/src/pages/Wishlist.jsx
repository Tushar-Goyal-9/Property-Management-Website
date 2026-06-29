import { useState, useEffect } from 'react';
import { Heart, Inbox, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/property/PropertyCard';
import Spinner from '../components/common/Spinner';
import PageWrapper from '../components/common/PageWrapper';

const Wishlist = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await api.get('/users/wishlist');
        setProperties(data || []);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <Spinner />;

  return (
    <PageWrapper>
      <div className="bg-slate-50/50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Row */}
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1 font-semibold flex items-center gap-1">
              <Heart size={12} className="fill-rose-500 text-rose-500" /> Saved Collections
            </p>
            <h1 className="font-outfit text-3xl font-extrabold text-slate-900 tracking-tight">My Wishlist</h1>
          </div>

          {/* List or Empty State */}
          {properties.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md mx-auto">
              <div className="h-12 w-12 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-4">
                <Heart size={20} className="fill-rose-500/10" />
              </div>
              <h3 className="font-outfit font-bold text-slate-900 mb-1">Your Wishlist is Empty</h3>
              <p className="text-slate-400 text-xs mb-6">
                Explore premium properties and tap the heart icon to save listings here.
              </p>
              <Link
                to="/properties"
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/10 transition-all inline-flex items-center gap-1.5"
              >
                <Compass size={14} />
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
};

export default Wishlist;