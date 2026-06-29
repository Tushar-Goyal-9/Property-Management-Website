import { useState } from 'react';
import { Search, MapPin, DollarSign, Home, Bed, Filter, RefreshCw } from 'lucide-react';

const PropertyFilter = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    city: initialFilters.city || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    bedrooms: initialFilters.bedrooms || '',
    propertyType: initialFilters.propertyType || '',
    listingType: initialFilters.listingType || '',
    sortBy: initialFilters.sortBy || 'newest',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleClear = () => {
    const cleared = {
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      propertyType: '',
      listingType: '',
      sortBy: 'newest',
    };
    setFilters(cleared);
    onFilter(cleared);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] mb-8"
    >
      <div className="flex items-center gap-2 mb-4 text-slate-800">
        <Filter size={16} className="text-teal-600" />
        <span className="font-outfit text-sm font-bold tracking-wide uppercase">Refine Search</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* City Input */}
        <div className="relative flex items-center">
          <MapPin size={15} className="absolute left-3.5 text-slate-400" />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={filters.city}
            onChange={handleChange}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/70 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-teal-500/10"
          />
        </div>

        {/* Min Price Input */}
        <div className="relative flex items-center">
          <DollarSign size={15} className="absolute left-3.5 text-slate-400" />
          <input
            type="number"
            name="minPrice"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={handleChange}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/70 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-teal-500/10"
          />
        </div>

        {/* Max Price Input */}
        <div className="relative flex items-center">
          <DollarSign size={15} className="absolute left-3.5 text-slate-400" />
          <input
            type="number"
            name="maxPrice"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleChange}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/70 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-teal-500/10"
          />
        </div>

        {/* Bedrooms Select */}
        <div className="relative flex items-center">
          <Bed size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleChange}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/70 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:ring-4 focus:ring-teal-500/10 cursor-pointer appearance-none"
          >
            <option value="">Any Beds</option>
            <option value="1">1+ Bed</option>
            <option value="2">2+ Beds</option>
            <option value="3">3+ Beds</option>
            <option value="4">4+ Beds</option>
            <option value="5">5+ Beds</option>
          </select>
        </div>

        {/* Property Type Select */}
        <div className="relative flex items-center">
          <Home size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleChange}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/70 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:ring-4 focus:ring-teal-500/10 cursor-pointer appearance-none"
          >
            <option value="">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Office">Office</option>
          </select>
        </div>

        {/* Listing Type Select */}
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <select
            name="listingType"
            value={filters.listingType}
            onChange={handleChange}
            className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200/70 focus:border-teal-500 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-700 outline-none transition-all focus:ring-4 focus:ring-teal-500/10 cursor-pointer appearance-none"
          >
            <option value="">Buy/Rent</option>
            <option value="Sale">For Sale</option>
            <option value="Rent">For Rent</option>
          </select>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Sort By Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Sort By</span>
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold outline-none cursor-pointer hover:bg-slate-100/80 transition-colors"
          >
            <option value="newest">Newest Listed</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 active:scale-95 text-slate-500 hover:text-slate-700 font-bold text-xs rounded-xl transition-all duration-150"
          >
            <RefreshCw size={13} />
            Reset
          </button>
          <button
            type="submit"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all duration-150 shadow-md shadow-teal-600/5"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </form>
  );
};

export default PropertyFilter;