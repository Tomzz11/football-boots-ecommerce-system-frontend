import { clsx } from 'clsx';

/**
 * Combine class names conditionally
 * @param  {...any} inputs - Class names or conditions
 * @returns {string} Combined class names
 */
export function cn(...inputs) {
    return clsx(inputs);
}

/**
 * Format price to Thai Baht
 * @param {number} price - Price in number
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * Format date to Thai locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',    
        month: 'long',
        day: 'numeric',  
    }).format(new Date(date)); 
}

/**
 * Format date with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime
 */
export function formatDateTime(date) {
    return new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated text
 */
export function truncate(text, length = 100) {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
} 

/**
 * Get order status in Thai
 * @param {string} status - Order status
 * @returns {object} Status text and color
 */
export function getOrderStatus(status) {
  const statuses = {
    pending: { text: 'รอดำเนินการ', color: 'warning' },
    confirmed: { text: 'ยืนยันแล้ว', color: 'info' },
    processing: { text: 'กำลังเตรียมสินค้า', color: 'info' },
    shipped: { text: 'จัดส่งแล้ว', color: 'info' },
    delivered: { text: 'ส่งถึงแล้ว', color: 'success' },
    cancelled: { text: 'ยกเลิก', color: 'danger' },
  };
  return statuses[status] || { text: status, color: 'default' };
}

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {number} Discount percentage
 */
export function calculateDiscount(originalPrice, salePrice) {
  if (!originalPrice || !salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}



/**
 * Generate size range display
 * @param {Array} sizes - Array of size objects
 * @returns {string} Size range string
 */
export function getSizeRange(sizes) {
  if (!sizes || sizes.length === 0) return '-';
  const availableSizes = sizes.filter(s => s.stock > 0).map(s => s.size);
  if (availableSizes.length === 0) return 'หมด';
  const min = Math.min(...availableSizes);
  const max = Math.max(...availableSizes);
  return min === max ? `${min}` : `${min} - ${max}`;
}


/**
 * Check if product is in stock
 * @param {Array} sizes - Array of size objects
 * @returns {boolean} Is in stock
 */
export function isInStock(sizes) {
  if (!sizes) return false;
  return sizes.some(s => s.stock > 0);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get image URL or placeholder
 * @param {Array} images - Product images array
 * @returns {string} Image URL
 */
export function getProductImage(images) {
  if (!images || images.length === 0) {
    return '/images/placeholder.jpg';
  }
  const primary = images.find(img => img.isPrimary);
  return primary?.url || images[0]?.url || '/images/placeholder.jpg';
}


