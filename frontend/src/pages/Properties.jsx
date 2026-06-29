import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Search, ChevronLeft, ChevronRight, Inbox,
  Home as HomeIcon, Building2, LayoutGrid, Gem, Map, TreePine,
  SlidersHorizontal, RefreshCw, Sliders
} from 'lucide-react';
import api from '../services/api';
import PropertyCard from '../components/property/PropertyCard';
import Spinner from '../components/common/Spinner';
import PageWrapper from '../components/common/PageWrapper';

/* ─── Static Category Data ──────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'Buy', sub: 'Find your dream home', icon: HomeIcon, params: { listingType: 'Sale' } },
  { label: 'Rent', sub: 'Explore rental options', icon: Building2, params: { listingType: 'Rent' } },
  { label: 'Commercial', sub: 'Office & retail spaces', icon: LayoutGrid, params: { propertyType: 'Office' } },
  { label: 'Luxury', sub: 'Premium lifestyles', icon: Gem, params: { listingType: 'Sale', propertyType: 'Villa' } },
  { label: 'Plots', sub: 'Land & investments', icon: Map, params: { propertyType: 'House' } }, // Using House as fallback
  { label: 'Apartments', sub: 'Modern living spaces', icon: TreePine, params: { propertyType: 'Apartment' } },
];

/* ─── Reusable Custom Dropdown Component ────────────────────────────────── */
const CustomDropdown = ({ label, name, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOpt = options.find(opt => opt.value === value) || { label: placeholder || 'Select option', value: '' };

  return (
    <div ref={dropdownRef} className="relative flex flex-col justify-center border border-slate-200 rounded-xl px-3 py-1 bg-slate-50 hover:bg-slate-100/50 transition-all text-left">
      {label && <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</span>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-xs font-semibold text-slate-700 outline-none text-left py-1 flex items-center justify-between"
      >
        <span>{selectedOpt.label}</span>
        <span className="text-slate-450 text-[8px] ml-2">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-[108%] left-0 right-0 z-50 bg-white border border-slate-200/80 rounded-xl shadow-xl p-1.5 space-y-0.5 max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange({ target: { name, value: opt.value } });
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                value === opt.value
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  });

  // Current active filters from URL search params
  const currentFilters = useMemo(() => ({
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    propertyType: searchParams.get('propertyType') || '',
    listingType: searchParams.get('listingType') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    featured: searchParams.get('featured') || '',
    hot: searchParams.get('hot') || '',
  }), [searchParams]);

  // Form states matching horizontal + vertical inputs
  const [formState, setFormState] = useState({
    city: currentFilters.city,
    minPrice: currentFilters.minPrice,
    maxPrice: currentFilters.maxPrice,
    bedrooms: currentFilters.bedrooms,
    propertyType: currentFilters.propertyType,
    listingType: currentFilters.listingType,
    bathrooms: searchParams.get('bathrooms') || '',
  });

  // Keep form state in sync when URL changes (e.g. category click)
  useEffect(() => {
    setFormState({
      city: currentFilters.city,
      minPrice: currentFilters.minPrice,
      maxPrice: currentFilters.maxPrice,
      bedrooms: currentFilters.bedrooms,
      propertyType: currentFilters.propertyType,
      listingType: currentFilters.listingType,
      bathrooms: searchParams.get('bathrooms') || '',
    });
  }, [currentFilters, searchParams]);

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const bathVal = searchParams.get('bathrooms');
      if (bathVal) params.append('bathrooms', bathVal);

      params.append('page', page);
      params.append('limit', 9);

      const { data } = await api.get(`/properties?${params.toString()}`);
      setProperties(data.properties || []);
      setPagination({
        page: data.page,
        pages: data.pages,
        total: data.total,
      });
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  }, [currentFilters, searchParams]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleInputChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(formState).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    // Preserve sorting
    if (currentFilters.sortBy) {
      params.append('sortBy', currentFilters.sortBy);
    }
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', e.target.value);
    setSearchParams(params);
  };

  const clearFilters = () => {
    const cleared = {
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      propertyType: '',
      listingType: '',
      bathrooms: '',
    };
    setFormState(cleared);
    setSearchParams({});
  };

  const handleCategoryClick = (params) => {
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      newParams.set(key, val);
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    fetchProperties(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dropdown options lists
  const propertyTypeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Apartment', value: 'Apartment' },
    { label: 'House', value: 'House' },
    { label: 'Villa', value: 'Villa' },
    { label: 'Office', value: 'Office' },
  ];

  const listingTypeOptions = [
    { label: 'Buy / Rent', value: '' },
    { label: 'For Sale', value: 'Sale' },
    { label: 'For Rent', value: 'Rent' },
  ];

  const bedroomOptions = [
    { label: 'Any', value: '' },
    { label: '1 Bed', value: '1' },
    { label: '2 Beds', value: '2' },
    { label: '3 Beds', value: '3' },
    { label: '4 Beds', value: '4' },
    { label: '5+ Beds', value: '5' },
  ];

  const bedroomOptionsSidebar = [
    { label: 'Any', value: '' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5+', value: '5' },
  ];

  const bathroomOptions = [
    { label: 'Any', value: '' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4+', value: '4' },
  ];

  return (
    <PageWrapper>
      <div className="bg-slate-50 min-h-screen pb-16">
        
        {/* ─── Premium Dark Hero Header Banner ───────────────────────────── */}
        <section className="relative bg-slate-950 text-white overflow-visible py-16 border-b border-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(13,148,136,0.18),transparent)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h1 className="font-outfit text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Explore Premium Properties
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
              Find your perfect property from verified listings across India
            </p>

            {/* Horizontal Glass Search Bar - Removed Beds & Listing Type */}
            <form onSubmit={applyFilters} className="mt-8 max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-slate-800">
              
              {/* City Input */}
              <div className="relative flex items-center border border-slate-200 rounded-xl px-3 bg-slate-50 hover:bg-slate-100/50 focus-within:ring-2 focus-within:ring-teal-500/25 transition-all">
                <MapPin size={15} className="text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  name="city"
                  placeholder="City, Locality or Project"
                  value={formState.city}
                  onChange={handleInputChange}
                  className="w-full py-2.5 text-xs bg-transparent outline-none font-medium placeholder-slate-400 text-slate-800"
                />
              </div>

              {/* Property Type Dropdown */}
              <CustomDropdown
                label="Property Type"
                name="propertyType"
                value={formState.propertyType}
                onChange={handleInputChange}
                options={propertyTypeOptions}
                placeholder="All Types"
              />

              {/* Min Price Input */}
              <div className="flex flex-col justify-center border border-slate-200 rounded-xl px-3 bg-slate-50 hover:bg-slate-100/50 transition-all text-left">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Min Price</span>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min Price"
                  value={formState.minPrice}
                  onChange={handleInputChange}
                  className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Max Price Input */}
              <div className="flex flex-col justify-center border border-slate-200 rounded-xl px-3 bg-slate-50 hover:bg-slate-100/50 transition-all text-left">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Max Price</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max Price"
                  value={formState.maxPrice}
                  onChange={handleInputChange}
                  className="w-full text-xs font-semibold bg-transparent outline-none text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 active:scale-[0.97] text-white text-xs font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-150 shadow-md shadow-teal-600/10"
              >
                <Search size={14} />
                <span>Search Properties</span>
              </button>

            </form>
          </div>
        </section>

        {/* ─── Categories Row ────────────────────────────────────────────── */}
        <section className="bg-slate-50 border-b border-slate-200/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map(({ label, sub, icon: Icon, params }) => {
                const isActive = Object.entries(params).every(([k, v]) => currentFilters[k] === v);
                return (
                  <button
                    key={label}
                    onClick={() => handleCategoryClick(params)}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-teal-50 border-teal-200 shadow-sm'
                        : 'bg-white border-slate-200/60 hover:border-slate-300 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]'
                    }`}
                  >
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                      isActive
                        ? 'bg-teal-600 border-teal-500 text-white'
                        : 'bg-teal-50/50 border-slate-100 text-teal-600'
                    }`}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <div className="truncate">
                      <p className="font-outfit text-xs font-bold text-slate-900 leading-snug">{label}</p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate leading-none mt-0.5">{sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Main Content Split Layout ──────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Left/Middle: Results list & Grid */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-slate-200/65 pb-4">
                <h2 className="font-outfit text-base font-bold text-slate-900">
                  {loading ? 'Searching...' : `${pagination.total} Properties Found`}
                </h2>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort By</span>
                  <select
                    value={currentFilters.sortBy}
                    onChange={handleSortChange}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Loader or Grid */}
              {loading ? (
                <div className="py-24 flex justify-center">
                  <Spinner />
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md mx-auto">
                  <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                    <Inbox size={20} />
                  </div>
                  <h3 className="font-outfit font-bold text-slate-900 mb-1">No Matches Found</h3>
                  <p className="text-slate-400 text-xs mb-6">
                    Try adjusting your parameters or clear current filter fields.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/10 transition-all"
                  >
                    Reset Directory
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <PropertyCard key={property._id} property={property} />
                    ))}
                  </div>

                  {/* Vercel-like Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="h-10 w-10 border border-slate-200 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:active:scale-100 transition-all shadow-sm"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">
                        {pagination.page} / {pagination.pages}
                      </div>

                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="h-10 w-10 border border-slate-200 rounded-xl bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:hover:bg-white disabled:active:scale-100 transition-all shadow-sm"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Right: Vertical Filter Panel */}
            <div className="lg:col-span-1 lg:sticky lg:top-24">
              <form onSubmit={applyFilters} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <SlidersHorizontal size={14} className="text-teal-600" />
                    <span className="font-outfit text-sm font-bold tracking-wide uppercase">Refine Your Search</span>
                  </div>
                  <Sliders size={13} className="text-slate-400" />
                </div>

                {/* City field */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formState.city}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-teal-500 transition-colors"
                  />
                </div>

                {/* Price fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min Price</label>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min Price"
                      value={formState.minPrice}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Price</label>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max Price"
                      value={formState.maxPrice}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Property Type Custom Dropdown */}
                <CustomDropdown
                  label="Property Type"
                  name="propertyType"
                  value={formState.propertyType}
                  onChange={handleInputChange}
                  options={propertyTypeOptions}
                  placeholder="All Types"
                />

                {/* Listing Type Custom Dropdown */}
                <CustomDropdown
                  label="Listing Type"
                  name="listingType"
                  value={formState.listingType}
                  onChange={handleInputChange}
                  options={listingTypeOptions}
                  placeholder="Buy / Rent"
                />

                {/* Bedrooms & Bathrooms selects */}
                <div className="grid grid-cols-2 gap-2">
                  <CustomDropdown
                    label="Bedrooms"
                    name="bedrooms"
                    value={formState.bedrooms}
                    onChange={handleInputChange}
                    options={bedroomOptionsSidebar}
                    placeholder="Any"
                  />
                  <CustomDropdown
                    label="Bathrooms"
                    name="bathrooms"
                    value={formState.bathrooms}
                    onChange={handleInputChange}
                    options={bathroomOptions}
                    placeholder="Any"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <SlidersHorizontal size={12} />
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 active:scale-[0.98] text-slate-500 hover:text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RefreshCw size={12} />
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

      </div>
    </PageWrapper>
  );
};

export default Properties;