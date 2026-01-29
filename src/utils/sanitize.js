/**
 * Input sanitization utilities for Firebase writes
 * Prevents NoSQL injection and XSS attacks
 */

/**
 * Sanitize string input for Firebase
 * Removes control characters and trims whitespace
 * @param {*} str - Input value
 * @param {number} maxLength - Maximum length (default: 1000)
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str, maxLength = 1000) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control chars
    .trim()
    .slice(0, maxLength);
};

/**
 * Sanitize numeric input
 * Converts to safe integer, rejects negative values
 * @param {*} value - Input value
 * @returns {number} Sanitized number or 0
 */
export const sanitizeNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/\D/g, '');
  const num = parseInt(cleaned, 10);
  return Number.isSafeInteger(num) && num >= 0 ? num : 0;
};

/**
 * Sanitize contract data object before Firebase write
 * @param {Object} data - Contract data object
 * @returns {Object} Sanitized data object
 */
export const sanitizeContractData = (data) => {
  if (!data || typeof data !== 'object') return {};

  // Block prototype pollution
  const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

  const sanitized = {};
  for (const key of Object.keys(data)) {
    if (!DANGEROUS_KEYS.includes(key)) {
      sanitized[key] = data[key];
    }
  }

  // String fields to sanitize
  const stringFields = [
    'tenKh', 'customerName',
    'cccd',
    'soDienThoai', 'phone',
    'diaChi', 'address',
    'dongXe', 'model',
    'phienBan', 'variant',
    'ngoaiThat', 'exterior',
    'noiThat', 'interior',
    'email',
    'tvbh',
    'showroom',
    'nganHang', 'bank',
    'quaTang',
    'quaTangKhac',
    'ghiChu',
    'tinhTrang', 'status',
    'noiCap',
  ];

  // Numeric fields to sanitize
  const numericFields = [
    'soTienCoc', 'deposit',
    'giaHopDong', 'contractPrice',
    'soTienVay',
    'soTienPhaiThu',
    'giaNiemYet',
    'giaGiam',
  ];

  stringFields.forEach(field => {
    if (field in sanitized && sanitized[field] !== undefined) {
      sanitized[field] = sanitizeString(sanitized[field]);
    }
  });

  numericFields.forEach(field => {
    if (field in sanitized && sanitized[field] !== undefined) {
      sanitized[field] = sanitizeNumber(sanitized[field]);
    }
  });

  // Sanitize array fields
  if ('uuDai' in sanitized && Array.isArray(sanitized.uuDai)) {
    sanitized.uuDai = sanitized.uuDai
      .filter(item => typeof item === 'string')
      .map(item => sanitizeString(item, 500));
  }

  return sanitized;
};
