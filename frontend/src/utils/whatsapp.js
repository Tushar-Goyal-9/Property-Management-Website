/**
 * Normalizes an Indian phone number to digits only (91xxxxxxxxxx).
 * Accept all common Indian formats: 9876543210, 98765 43210, 98765-43210, +91 9876543210
 * Returns the normalized number string, or empty string if input is invalid.
 */
export const normalizePhoneNumber = (number) => {
  if (!number) return '';
  // Remove all whitespace, dashes, brackets, and leading '+'
  const clean = number.replace(/[\s\-\(\)\+]/g, '');

  if (clean.length === 10 && /^[6-9]\d{9}$/.test(clean)) {
    return '91' + clean;
  } else if (clean.length === 12 && /^91[6-9]\d{9}$/.test(clean)) {
    return clean;
  } else if (clean.length === 11 && /^0[6-9]\d{9}$/.test(clean)) {
    return '91' + clean.slice(1);
  }
  return '';
};

/**
 * Validates whether the given string is a valid Indian mobile number.
 */
export const validatePhoneNumber = (number) => {
  const normalized = normalizePhoneNumber(number);
  return normalized.length === 12;
};

/**
 * Generates the professional property detail sharing message.
 */
export const generateMessage = (property) => {
  if (!property) return '';

  const priceVal = typeof property.price === 'number'
    ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(property.price)
    : property.price;

  return `🏡 PROPERTY DETAILS

${property.title || 'N/A'}

📍 ${property.address || ''}, ${property.city || ''}, ${property.state || ''}

💰 Price: ₹${priceVal}${property.listingType === 'Rent' ? '/mo' : ''}

🛏 Bedrooms: ${property.bedrooms || 0}

🛁 Bathrooms: ${property.bathrooms || 0}

📐 Area: ${property.area || 0} Sq Ft

━━━━━━━━━━━━━━

✨ View complete details, images and amenities:

https://www.gadgetsdunia.com/property/${property._id}

━━━━━━━━━━━━━━

Shared via Property Dunia

https://www.gadgetsdunia.com`;
};

/**
 * Opens WhatsApp in a new tab with the normalized phone number and prefilled message.
 */
export const openWhatsApp = (number, message) => {
  const normalized = normalizePhoneNumber(number);
  if (!normalized) return false;
  
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${normalized}?text=${encodedMessage}`;
  window.open(url, '_blank');
  return true;
};
