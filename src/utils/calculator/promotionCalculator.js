/**
 * Promotion discount calculation utilities
 */

/**
 * Calculate discount for a single promotion
 * @param {number} basePrice - Vehicle base price
 * @param {Object} promotion - Promotion object with type, value, maxDiscount
 * @returns {number} Discount amount
 */
export function calculatePromotionDiscount(basePrice, promotion) {
  if (!promotion || !promotion.isActive) return 0;

  const { type, value } = promotion;

  if (type === 'fixed') {
    return parseFloat(value) || 0;
  }

  if (type === 'percentage') {
    let percentage = parseFloat(value) || 0;
    // Handle decimal format (e.g., 0.05 -> 5%)
    if (percentage > 0 && percentage < 1) {
      percentage *= 100;
    }
    return (basePrice * percentage) / 100;
  }

  return 0;
}

/**
 * Calculate total discount from multiple promotions
 * @param {number} basePrice - Vehicle base price
 * @param {Array} promotions - Array of promotion objects
 * @returns {number} Total discount amount
 */
export function calculateTotalPromotionDiscount(basePrice, promotions) {
  if (!Array.isArray(promotions)) return 0;

  return promotions.reduce((total, promo) => {
    return total + calculatePromotionDiscount(basePrice, promo);
  }, 0);
}

/**
 * Filter promotions applicable for a vehicle model
 * @param {Array} promotions - All promotions
 * @param {string} dongXe - Vehicle model identifier
 * @returns {Array} Filtered promotions
 */
export function filterPromotionsByModel(promotions, dongXe) {
  if (!Array.isArray(promotions) || !dongXe) return [];

  return promotions.filter((promo) => {
    if (!promo.applicableModels) return true;
    return promo.applicableModels.includes(dongXe);
  });
}

export default {
  calculatePromotionDiscount,
  calculateTotalPromotionDiscount,
  filterPromotionsByModel,
};
