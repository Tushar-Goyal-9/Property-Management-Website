import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import PropertyCard from '../components/property/PropertyCard';
import Spinner from '../components/common/Spinner';
import PageWrapper from '../components/common/PageWrapper';

const Home = () => {
  const { user } = useAuthStore();
  
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [hotProperties, setHotProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState({ city: '', listingType: '' });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, hotRes] = await Promise.all([
          api.get('/properties?featured=true&limit=6'),
          api.get('/properties?hot=true&limit=6'),
        ]);
        setFeaturedProperties(featuredRes.data.properties || []);
        setHotProperties(hotRes.data.properties || []);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchQuery).toString();
    window.location.href = `/properties?${params}`;
  };

  if (loading) return <Spinner />;

  return (
    <PageWrapper>

    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Dream Property with Property Dunia
            </h1>
            <p className="text-lg md:text-xl mb-8 text-teal-100">
              Discover thousands of properties for sale and rent across India
            </p>

            {/* Search Bar */}
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded-lg shadow-lg">
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city, locality or project"
                  value={searchQuery.city}
                  onChange={handleSearchChange}
                  className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                />
                <select
                  name="listingType"
                  value={searchQuery.listingType}
                  onChange={handleSearchChange}
                  className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                >
                  <option value="">Buy / Rent</option>
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                </select>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-md font-medium transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Properties</h2>
            <Link to="/properties?featured=true" className="text-teal-600 hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        </section>
      )}

      {/* Hot Properties */}
      {hotProperties.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Hot & Trending</h2>
              <Link to="/properties?hot=true" className="text-teal-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotProperties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only show if NOT logged in as agent or admin */}
      {(!user || user.role === 'user') && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Are You a Property Agent?</h2>
          <p className="text-gray-600 mb-6">
            List your properties with Property Dunia and reach thousands of buyers
          </p>
          <Link
            to="/register?role=agent"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            Register as Agent
          </Link>
        </section>
      )}
    </div>
    </PageWrapper>
  );
};

export default Home;