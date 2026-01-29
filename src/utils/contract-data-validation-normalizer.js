/**
 * Contract validation utilities for VinFast Dealer Management System
 * Handles type normalization and validation for contracts
 */

// ============================================
// VALIDATION CONSTANTS
// ============================================

export const VALID_THANH_TOAN = ['trả góp', 'trả thẳng'];
export const VALID_TRANG_THAI = ['mới', 'xuất', 'hủy', 'hoàn thành'];

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate contract data
 * @param {Object} data - Contract data object
 * @returns {{ isValid: boolean, errors: string[] }} Validation result
 */
export function validateContract(data) {
  const errors = [];

  // Required fields validation
  if (!data.customerName?.trim()) {
    errors.push('Tên khách hàng là bắt buộc');
  }

  if (!data.cccd?.trim()) {
    errors.push('CCCD là bắt buộc');
  }

  if (!data.dongXe?.trim() && !data.model?.trim()) {
    errors.push('Dòng xe là bắt buộc');
  }

  // Numeric field validation
  const numericFields = ['soTienCoc', 'giaHD', 'giamGia', 'soTienVay'];
  numericFields.forEach((field) => {
    if (data[field] !== undefined && data[field] !== '' && data[field] !== null) {
      const value = typeof data[field] === 'string'
        ? parseInt(data[field].replace(/[^\d]/g, ''), 10)
        : data[field];

      if (isNaN(value) || value < 0) {
        errors.push(`${field} phải là số không âm`);
      }
    }
  });

  // Enum validation - thanhToan
  if (data.thanhToan && typeof data.thanhToan === 'string') {
    const normalized = data.thanhToan.toLowerCase().trim();
    if (!VALID_THANH_TOAN.includes(normalized)) {
      errors.push(`Phương thức thanh toán không hợp lệ: ${data.thanhToan}`);
    }
  }

  // Enum validation - trangThai
  if (data.trangThai && typeof data.trangThai === 'string') {
    const normalized = data.trangThai.toLowerCase().trim();
    if (!VALID_TRANG_THAI.includes(normalized)) {
      errors.push(`Trạng thái không hợp lệ: ${data.trangThai}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize contract data before saving to Firebase
 * Converts string numbers to actual numbers and normalizes enum values
 * @param {Object} data - Raw contract data
 * @returns {Object} Normalized contract data
 */
export function normalizeContract(data) {
  const normalized = { ...data };

  // Normalize numeric fields
  const numericFields = ['soTienCoc', 'giaHD', 'giamGia', 'soTienVay', 'deposit', 'contractPrice', 'loanAmount', 'soTienPhaiThu'];

  numericFields.forEach((field) => {
    if (normalized[field] !== undefined && normalized[field] !== null && normalized[field] !== '') {
      const value = typeof normalized[field] === 'string'
        ? parseInt(normalized[field].replace(/[^\d]/g, ''), 10)
        : normalized[field];

      normalized[field] = isNaN(value) ? 0 : value;
    } else {
      // Convert empty strings to 0 for numeric fields
      normalized[field] = 0;
    }
  });

  // Normalize thanhToan field
  if (normalized.thanhToan && typeof normalized.thanhToan === 'string') {
    const lowercased = normalized.thanhToan.toLowerCase().trim();

    // Map variations to standard values
    if (['trả góp', 'tra gop', 'TRẢ GÓP', 'Trả góp'].includes(lowercased) || lowercased.includes('góp')) {
      normalized.thanhToan = 'trả góp';
    } else if (['trả thẳng', 'tra thang', 'TRẢ THẲNG', 'Trả thẳng'].includes(lowercased) || lowercased.includes('thẳng')) {
      normalized.thanhToan = 'trả thẳng';
    } else {
      // Default to 'trả thẳng' if invalid
      normalized.thanhToan = 'trả thẳng';
    }
  } else {
    normalized.thanhToan = 'trả thẳng';
  }

  // Normalize trangThai field
  if (normalized.trangThai && typeof normalized.trangThai === 'string') {
    const lowercased = normalized.trangThai.toLowerCase().trim();

    // Ensure it's one of the valid values
    if (VALID_TRANG_THAI.includes(lowercased)) {
      normalized.trangThai = lowercased;
    } else {
      // Default to 'mới' if invalid
      normalized.trangThai = 'mới';
    }
  } else {
    normalized.trangThai = 'mới';
  }

  // Normalize payment field (alias for thanhToan)
  if (normalized.payment && typeof normalized.payment === 'string') {
    const lowercased = normalized.payment.toLowerCase().trim();

    if (['trả góp', 'tra gop', 'TRẢ GÓP', 'Trả góp'].includes(lowercased) || lowercased.includes('góp')) {
      normalized.payment = 'trả góp';
    } else if (['trả thẳng', 'tra thang', 'TRẢ THẲNG', 'Trả thẳng'].includes(lowercased) || lowercased.includes('thẳng')) {
      normalized.payment = 'trả thẳng';
    } else {
      normalized.payment = 'trả thẳng';
    }
  }

  // Normalize status field (alias for trangThai)
  if (normalized.status && typeof normalized.status === 'string') {
    const lowercased = normalized.status.toLowerCase().trim();

    if (VALID_TRANG_THAI.includes(lowercased)) {
      normalized.status = lowercased;
    } else {
      normalized.status = 'mới';
    }
  }

  return normalized;
}

/**
 * Parse currency string to number
 * @param {string|number} value - Currency value
 * @returns {number} Parsed number or 0
 */
export function parseCurrencyValue(value) {
  if (typeof value === 'number') {
    return value >= 0 ? value : 0;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
  }

  return 0;
}

export default {
  validateContract,
  normalizeContract,
  parseCurrencyValue,
  VALID_THANH_TOAN,
  VALID_TRANG_THAI,
};
