import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, Star, Flame } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';

const PropertyCard = ({ property }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <Link to={`/property/${property._id}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images?.[0] || '/placeholder.jpg'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {property.featured && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Star size={12} /> Featured
            </span>
          )}
          {property.hot && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Flame size={12} /> Hot
            </span>
          )}
          <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
            {property.listingType === 'Sale' ? 'For Sale' : 'For Rent'}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate">{property.title}</h3>
          <p className="text-teal-600 font-bold text-xl mt-1">{formatPrice(property.price)}</p>
          <p className="text-gray-500 text-sm mt-1 truncate">{property.address}, {property.city}</p>
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Bed size={16} /> {property.bedrooms}</span>
            <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms}</span>
            <span className="flex items-center gap-1"><Maximize size={16} /> {property.area} sqft</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;