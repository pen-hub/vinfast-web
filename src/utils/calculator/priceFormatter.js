/**
 * Price formatting utilities for Vietnamese currency
 */

/**
 * Format number as Vietnamese currency (VND)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

/**
 * Format number as Vietnamese currency without symbol
 * @param {number} amount - Amount to format
 * @returns {string} Formatted number string
 */
export function formatNumber(amount) {
  if (!amount && amount !== 0) return '0';
  return new Intl.NumberFormat('vi-VN').format(amount);
}

/**
 * Parse currency string to number
 * @param {string} str - Currency string
 * @returns {number} Parsed number
 */
export function parseCurrency(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/[^\d]/g, ''), 10) || 0;
}

/**
 * Format as compact currency (e.g., 100M, 1.5B)
 * @param {number} amount - Amount to format
 * @returns {string} Compact formatted string
 */
export function formatCompactCurrency(amount) {
  if (!amount) return '0';

  if (amount >= 1000000000) {
    return (amount / 1000000000).toFixed(1).replace(/\.0$/, '') + ' tỷ';
  }
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + ' triệu';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + ' nghìn';
  }
  return amount.toString();
}

export default {
  formatCurrency,
  formatNumber,
  parseCurrency,
  formatCompactCurrency,
};
