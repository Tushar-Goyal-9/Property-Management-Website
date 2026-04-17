import { useState, useEffect } from 'react';
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
        setProperties(data);
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      {properties.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No properties in your wishlist yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      )}
    </div>
    </PageWrapper>
  );
};

export default Wishlist;