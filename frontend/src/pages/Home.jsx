import { useEffect, useState } from "react";
import API from "../services/api";
import PropertyCard from "../components/PropertyCard";

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await API.get("/properties");
        setProperties(response.data);
      } catch (error) {
        console.error("Error fetching properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <div>
      {/* ===== HERO SECTION ===== */}
     {/* ===== HERO SECTION ===== */}
<section className="relative rounded-2xl overflow-hidden mb-20 h-[420px]">
  
  {/* Background Image */}
  <img
    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
    alt="Luxury Home"
    className="absolute inset-0 w-full h-full object-cover"
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10"></div>

  {/* Content */}
  <div className="relative z-10 h-full flex items-center">
    <div className="px-10 max-w-3xl">
      <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4">
        Find Your Dream Property
      </h1>
      <p className="text-gray-200 text-lg leading-relaxed">
        Discover handpicked luxury properties across prime locations,
        designed for modern and comfortable living.
      </p>
    </div>
  </div>
</section>


      {/* ===== PROPERTY SECTION ===== */}
      <section>
        <div className="mb-8">
          <h2 className="text-2xl font-medium mb-2">
            Featured Properties
          </h2>
          <p className="text-gray-600">
            Explore our latest premium listings
          </p>
        </div>

        {loading && (
          <p className="text-gray-500">Loading properties...</p>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
