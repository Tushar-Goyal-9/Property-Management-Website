import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Heart, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import { formatPrice } from '../../utils/formatters';

// Shared memory cache to prevent duplicate requests across multiple card mounts
let wishlistCache = null;
let wishlistPromise = null;

const getCachedWishlist = async (hasUser) => {
  if (!hasUser) return [];
  if (wishlistCache) return wishlistCache;
  if (wishlistPromise) return wishlistPromise;

  wishlistPromise = api.get('/users/wishlist')
    .then((res) => {
      const ids = (res.data || []).map(p => p._id?.toString());
      wishlistCache = ids;
      return ids;
    })
    .catch(() => {
      wishlistPromise = null;
      return [];
    });
  return wishlistPromise;
};

const PropertyCard = ({ property }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (user) {
      getCachedWishlist(true).then((list) => {
        setIsWishlisted(list.includes(property._id?.toString()));
      });
    } else {
      setIsWishlisted(false);
    }
  }, [user, property._id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please log in first to use the wishlist');
      return;
    }
    if (wishlistLoading) return;
    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        await api.delete(`/users/wishlist/${property._id}`);
        setIsWishlisted(false);
        if (wishlistCache) {
          wishlistCache = wishlistCache.filter(id => id !== property._id?.toString());
        }
        toast.info('Removed from wishlist');
      } else {
        await api.post(`/users/wishlist/${property._id}`);
        setIsWishlisted(true);
        if (wishlistCache && !wishlistCache.includes(property._id?.toString())) {
          wishlistCache.push(property._id?.toString());
        }
        toast.success('Added to wishlist ❤️');
      }
    } catch (error) {
      console.error('Wishlist toggle failed:', error);
      toast.error('Something went wrong');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/property/${property._id}`);
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.05)] hover:shadow-[0_20px_35px_-8px_rgba(15,23,42,0.1)] overflow-hidden group hover:-translate-y-1 transition-all duration-300 ease-out flex flex-col h-full">
      
      {/* Floating Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-4 right-4 z-20 h-9 w-9 bg-slate-950/40 hover:bg-slate-950/65 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-200 border border-white/10"
        aria-label="Toggle wishlist"
      >
        <Heart
          size={15}
          className={`transition-all duration-300 ${
            isWishlisted
              ? 'fill-rose-500 text-rose-500 scale-110'
              : 'text-white'
          }`}
        />
      </button>

      <Link to={`/property/${property._id}`} className="block flex-grow flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 shrink-0">
          <img
            src={property.images?.[0] || '/placeholder.jpg'}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />

          {/* Gradients overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-80" />

          {/* Type Badge */}
          <span className={`absolute top-4 left-4 z-10 text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md border text-white shadow-sm ${
            property.listingType === 'Sale' 
              ? 'bg-blue-600/90 border-blue-500/30' 
              : 'bg-emerald-600/90 border-emerald-500/30'
          }`}>
            {property.listingType === 'Sale' ? 'FOR SALE' : 'FOR RENT'}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-grow flex flex-col justify-between">
          <div>
            {/* Location */}
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-2">
              <MapPin size={12} className="shrink-0 text-slate-400" />
              <span className="truncate">{property.city}</span>
            </div>

            {/* Title */}
            <h3 className="font-outfit text-base font-bold text-slate-900 truncate leading-snug group-hover:text-teal-600 transition-colors duration-150">
              {property.title}
            </h3>

            {/* Address */}
            <p className="text-slate-400 text-xs mt-1 truncate">
              {property.address}
            </p>

            {/* Price */}
            <div className="mt-3.5 flex items-baseline gap-1">
              <span className="font-outfit text-lg font-extrabold text-teal-600 tracking-tight">
                {formatPrice(property.price)}
              </span>
              {property.listingType === 'Rent' && (
                <span className="text-[11px] font-semibold text-slate-400">/month</span>
              )}
            </div>

            {/* Features Specs */}
            <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500 font-semibold border-t border-slate-100 pt-4">
              <span className="flex items-center gap-1">
                <Bed size={13} className="text-slate-400" />
                {property.bedrooms} Beds
              </span>
              <span className="flex items-center gap-1">
                <Bath size={13} className="text-slate-400" />
                {property.bathrooms} Baths
              </span>
              <span className="flex items-center gap-1">
                <Maximize size={13} className="text-slate-400" />
                {property.area} sqft
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {/* Contact Agent Button */}
            <button
              onClick={handleContactClick}
              className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-[0.98] text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl shadow-sm transition-all duration-150"
            >
              Contact Agent
            </button>

            {/* Agent Info Row */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-2.5 truncate">
                <div className="h-7 w-7 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs shrink-0">
                  {property.owner?.name?.charAt(0) || 'A'}
                </div>
                <div className="truncate">
                  <p className="text-slate-700 truncate leading-tight font-bold">{property.owner?.name || 'Agent'}</p>
                  <p className="text-slate-400 text-[10px] truncate leading-none mt-0.5">{property.owner?.agencyName || 'Broker'}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-amber-500 shrink-0">
                <Star size={12} className="fill-amber-500 text-amber-500" />
                <span className="text-[11px] font-bold mt-0.5 text-slate-600">4.5</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;