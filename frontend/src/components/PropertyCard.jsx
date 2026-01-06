import { Link } from "react-router-dom";

const PropertyCard = ({ property }) => {
  return (
    <Link to={`/property/${property._id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300">
        
        {/* Image */}
        <img
          src={property.images?.[0]}
          alt={property.title}
          className="h-56 w-full object-cover"
        />

        {/* Content */}
        <div className="p-5 space-y-2">
          
          {/* Status + Price */}
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wide text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {property.status}
            </span>
            <span className="text-lg font-semibold text-gray-900">
              ₹ {property.price.toLocaleString()}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-medium text-gray-800">
            {property.title}
          </h3>

          {/* Location */}
          <p className="text-sm text-gray-500 flex items-center gap-1">
            📍 {property.location}
          </p>

          {/* Details */}
          <div className="flex justify-between text-sm text-gray-500 pt-2">
            <span>{property.bedrooms} Beds</span>
            <span>{property.bathrooms} Baths</span>
            <span>{property.area} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
