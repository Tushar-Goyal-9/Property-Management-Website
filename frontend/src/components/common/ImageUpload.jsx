import { useState, useRef, useEffect } from 'react';
import { UploadCloud, X, Film, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

const ImageUpload = ({ onUpload, initialImages = [], multiple = true, maxFiles = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Sync with initialImages when they load (e.g. on EditProperty fetch)
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages);
    }
  }, [initialImages]);

  const uploadToCloudinary = async (file) => {
    // Get signature from backend
    const { data: signatureData } = await api.get('/upload/signature');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    formData.append('folder', 'property-dunia');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();
    return data.secure_url;
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > maxFiles) {
      alert(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onUpload(newImages);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Box */}
      <div
        onClick={() => !uploading && fileInputRef.current.click()}
        className={`border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-teal-50/5 ${
          uploading ? 'opacity-60 pointer-events-none' : ''
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple={multiple}
          accept="image/*"
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto text-slate-400">
            <UploadCloud size={20} strokeWidth={1.5} />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-3 w-3 border-b border-teal-600" />
                Uploading assets to media storage...
              </span>
            ) : (
              <>
                <p className="text-slate-800 font-bold">Select property photos to upload</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                  PNG, JPG up to 10MB (Max {maxFiles} images)
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-sm">
              <img src={url} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-1.5 right-1.5 h-6 w-6 bg-slate-900/60 hover:bg-rose-600 backdrop-blur-sm text-white rounded-lg flex items-center justify-center transition-colors shadow-md"
                title="Remove image"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;