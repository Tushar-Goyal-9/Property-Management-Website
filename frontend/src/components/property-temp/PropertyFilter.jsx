import { useState } from 'react';

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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <input
          type="text"
          name="city"
          placeholder="City"
          value={filters.city}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
        />
        <select
          name="bedrooms"
          value={filters.bedrooms}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">Any Beds</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
          <option value="5">5+</option>
        </select>
        <select
          name="propertyType"
          value={filters.propertyType}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">All Types</option>
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
          <option value="Villa">Villa</option>
          <option value="Office">Office</option>
        </select>
        <select
          name="listingType"
          value={filters.listingType}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="">Sale/Rent</option>
          <option value="Sale">For Sale</option>
          <option value="Rent">For Rent</option>
        </select>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </form>
  );
};

export default PropertyFilter;