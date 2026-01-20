/**
 * Formatting utilities for currency and dates
 */

/**
 * Format number as Vietnamese currency
 * @param {number|string} value - Amount to format
 * @param {boolean} withSuffix - Include "VNĐ" suffix
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, withSuffix = false) => {
  if (value === undefined || value === null || value === '' || value === 0) return '';

  const num = typeof value === 'string'
    ? parseInt(value.replace(/\D/g, ''), 10)
    : value;

  if (isNaN(num) || num === 0) return '';

  const formatted = new Intl.NumberFormat('vi-VN').format(num);
  return withSuffix ? `${formatted} VNĐ` : formatted;
};

/**
 * Format date for display
 * @param {string|Date} dateStr - Date to format
 * @returns {string} DD/MM/YYYY format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      return dateStr;
    }
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
  } catch {
    return '';
  }
};

/**
 * Format date with blank placeholder for print
 * @param {string|Date} dateStr - Date to format
 * @param {string} placeholder - Placeholder if date is empty
 * @returns {string} Formatted date or placeholder
 */
export const formatDateOrPlaceholder = (dateStr, placeholder = '___/___/______') => {
  const formatted = formatDate(dateStr);
  return formatted || placeholder;
};
