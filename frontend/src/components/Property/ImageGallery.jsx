import { useState } from 'react';

const ImageGallery = ({ images, title }) => {
  const [mainImage, setMainImage] = useState(images?.[0] || '/placeholder.jpg');

  if (!images || images.length === 0) {
    return (
      <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-96 overflow-hidden rounded-lg">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setMainImage(img)}
            className={`h-20 rounded-md overflow-hidden border-2 ${
              mainImage === img ? 'border-teal-600' : 'border-transparent'
            }`}
          >
            <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;