import { useState } from 'react';

const ImageGallery = ({ images, title }) => {
  const [mainImage, setMainImage] = useState(images?.[0] || '/placeholder.jpg');

  if (!images || images.length === 0) {
    return (
      <div className="h-[420px] bg-slate-100 rounded-2xl border border-slate-200/60 flex items-center justify-center">
        <span className="text-slate-400 text-sm font-semibold">No images available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Viewport */}
      <div className="relative h-[420px] overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <img
          src={mainImage}
          alt={title}
          className="w-full h-full object-cover cursor-zoom-in hover:scale-[1.02] transition-transform duration-500 ease-out"
        />
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setMainImage(img)}
              className={`relative aspect-square rounded-xl overflow-hidden bg-slate-50 border-2 transition-all duration-200 outline-none ${
                mainImage === img
                  ? 'border-teal-500 ring-2 ring-teal-500/20 scale-95 shadow-sm'
                  : 'border-slate-200/60 hover:border-slate-300'
              }`}
              aria-label={`View image thumbnail ${index + 1}`}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;