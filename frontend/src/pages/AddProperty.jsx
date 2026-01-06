import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const AddProperty = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    description: "",
    images: "", // comma separated URLs
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/properties", {
        title: formData.title,
        description: formData.description,
        location: formData.location,

        // 🔢 convert string → number
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),

        // ✅ REQUIRED by backend schema
        status: "sale",

        // 🖼️ Convert image input → array
        images: formData.images
          ? formData.images.split(",").map((img) => img.trim())
          : ["https://via.placeholder.com/600"],

        // 📞 Contact Details
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
      });

      alert("Property added successfully");
      navigate("/");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Failed to add property");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6">
        Add New Property
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input name="title" placeholder="Property Title" onChange={handleChange} className="input" required />
        <input name="price" type="number" placeholder="Price" onChange={handleChange} className="input" required />
        <input name="location" placeholder="Location" onChange={handleChange} className="input" required />

        <div className="grid grid-cols-3 gap-4">
          <input name="bedrooms" type="number" placeholder="Bedrooms" onChange={handleChange} className="input" required />
          <input name="bathrooms" type="number" placeholder="Bathrooms" onChange={handleChange} className="input" required />
          <input name="area" type="number" placeholder="Area (sqft)" onChange={handleChange} className="input" required />
        </div>

        <textarea
          name="description"
          placeholder="Property Description"
          rows="4"
          onChange={handleChange}
          className="input"
        />

        {/* 🖼️ IMAGE INPUT */}
        <input
          name="images"
          placeholder="Image URLs (comma separated)"
          onChange={handleChange}
          className="input"
        />
        <p className="text-xs text-gray-500">
          Example: https://img1.jpg, https://img2.jpg
        </p>

        <h2 className="text-lg font-medium pt-4">
          Contact Details
        </h2>

        <input name="contactName" placeholder="Contact Name" onChange={handleChange} className="input" required />
        <input name="contactPhone" placeholder="Contact Phone" onChange={handleChange} className="input" required />
        <input name="contactEmail" type="email" placeholder="Contact Email" onChange={handleChange} className="input" required />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Add Property
        </button>
      </form>
    </div>
  );
};

export default AddProperty;
