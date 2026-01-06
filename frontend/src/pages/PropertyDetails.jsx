import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      const res = await API.get(`/properties/${id}`);
      setProperty(res.data);
    };
    fetchProperty();
  }, [id]);

  if (!property) return <p>Loading...</p>;

  const images =
    property.images && property.images.length > 0
      ? property.images
      : ["https://via.placeholder.com/1200x600"];

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8">

      {/* IMAGE SLIDER */}
      <div className="relative rounded-xl overflow-hidden bg-gray-100">
        <img
          src={images[currentImage]}
          alt="Property"
          className="w-full h-[420px] object-cover bg-black"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 px-3 py-1 rounded-full shadow"
            >
              ‹
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 px-3 py-1 rounded-full shadow"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* TITLE + PRICE */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{property.title}</h1>
          <p className="text-gray-500 mt-1">📍 {property.location}</p>
        </div>

        <div className="text-2xl font-bold text-blue-600">
          ₹ {property.price.toLocaleString()}
        </div>
      </div>

      {/* PROPERTY STATS */}
    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
  <div className="text-center">
    <div className="text-xl font-semibold">0</div>
    <div className="text-gray-500 text-sm">Beds</div>
  </div>
  <div className="text-center">
    <div className="text-xl font-semibold">2</div>
    <div className="text-gray-500 text-sm">Baths</div>
  </div>
  <div className="text-center">
    <div className="text-xl font-semibold">200</div>
    <div className="text-gray-500 text-sm">Sqft</div>
  </div>
</div>


      {/* DESCRIPTION */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-medium mb-2">Description</h2>
        <p className="text-gray-700">
          {property.description || "No description provided."}
        </p>
      </div>

      {/* CONTACT DETAILS */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h2 className="text-lg font-medium mb-3">Contact Details</h2>
        <p><strong>Name:</strong> {property.contactName}</p>
        <p><strong>Phone:</strong> {property.contactPhone}</p>
        <p><strong>Email:</strong> {property.contactEmail}</p>
      </div>
    </div>
  );
};

export default PropertyDetails;
