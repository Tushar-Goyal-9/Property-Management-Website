import { useState, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { validatePhoneNumber, generateMessage, openWhatsApp, normalizePhoneNumber } from '../../utils/whatsapp';

const SharePropertyModal = ({ isOpen, onClose, property }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPhoneNumber('');
      setError('');
      setIsSharing(false);
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('WhatsApp number is required');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)');
      return;
    }

    setIsSharing(true);
    setError('');

    // Pre-built loader animation delay to prevent double clicks and improve UX
    setTimeout(() => {
      const message = generateMessage(property);
      const normalized = normalizePhoneNumber(phoneNumber);
      const success = openWhatsApp(normalized, message);
      setIsSharing(false);
      if (success) {
        onClose();
      } else {
        setError('Failed to initiate WhatsApp link');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        {/* Accent Strip - Premium design token matching the theme */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#25D366] to-teal-500" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
        >
          <X size={14} />
        </button>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0">
              <MessageSquare size={20} className="text-[#25D366]" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="font-outfit text-lg font-bold text-slate-900 mb-0.5">Share Property</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Send this property's details through WhatsApp.
              </p>
            </div>
          </div>

          {/* Property Info Preview Card */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-3">
            <img
              src={property.images?.[0] || '/placeholder.jpg'}
              alt={property.title}
              className="h-12 w-16 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
            />
            <div className="min-w-0 flex-1">
              <p className="font-outfit text-xs font-bold text-slate-800 truncate leading-snug">{property.title}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">
                📍 {property.address ? `${property.address}, ` : ''}{property.city || ''}
              </p>
            </div>
          </div>

          {/* Input Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Customer WhatsApp Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-slate-400 select-none">
                +91
              </span>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSharing}
                placeholder="98765 43210"
                className={`w-full pl-12 pr-4 py-2.5 text-sm border rounded-xl outline-none bg-white text-slate-900 transition-all duration-150 ${
                  error
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500'
                }`}
              />
            </div>
            {error && (
              <p className="text-[10px] font-bold text-rose-500 animate-fade-in">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSharing}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSharing}
              className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#25D366]/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <MessageSquare size={13} />
                  <span>Share on WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharePropertyModal;
