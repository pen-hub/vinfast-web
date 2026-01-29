/**
 * Field Normalizer - Standardizes field names from historical data
 *
 * Problem: exportedContracts have inconsistent field naming:
 * - "Tên Kh" vs "customerName" vs "tenKhachHang"
 * - "Số tiền cọc" vs "soTienCoc" vs "Tiền đặt cọc"
 *
 * Solution: Map all aliases to standard camelCase Vietnamese names
 *
 * Usage:
 *   import { normalizeContract } from './field-normalizer';
 *   const normalized = normalizeContract(rawData);
 */

// Map from all possible field names to standard names
const FIELD_MAPPINGS = {
  // Customer name
  customerName: 'tenKhachHang',
  'Tên Kh': 'tenKhachHang',
  'Tên KH': 'tenKhachHang',
  'Tên khách hàng': 'tenKhachHang',
  tenKhachHang: 'tenKhachHang',

  // Address
  address: 'diaChi',
  'Địa Chỉ': 'diaChi',
  'Địa chỉ': 'diaChi',
  diaChi: 'diaChi',

  // CCCD
  cccd: 'cccd',
  CCCD: 'cccd',
  cmnd: 'cccd',
  CMND: 'cccd',

  // Phone
  phone: 'soDienThoai',
  'Số điện thoại': 'soDienThoai',
  soDienThoai: 'soDienThoai',

  // Email
  email: 'email',
  Email: 'email',

  // Deposit amount
  soTienCoc: 'soTienCoc',
  'Số tiền cọc': 'soTienCoc',
  'Tiền đặt cọc': 'soTienCoc',
  tienDatCoc: 'soTienCoc',

  // Contract price
  giaHD: 'giaHD',
  'Giá Hợp Đồng': 'giaHD',
  'Gia Hop Dong': 'giaHD',
  'Giá hợp đồng': 'giaHD',

  // List price
  giaNiemYet: 'giaNiemYet',
  'Giá Niêm Yết': 'giaNiemYet',
  giaNY: 'giaNiemYet',

  // Discount
  giamGia: 'giamGia',
  'Giảm giá': 'giamGia',
  'Giá Giảm': 'giamGia',
  'giảm giá theo xe': 'giamGia',

  // Gifts
  quaTang: 'quaTang',
  'Quà tặng': 'quaTang',
  'quà tặng theo xe': 'quaTang',
  'Quà tặng khác': 'quaTangKhac',
  quaTangKhac: 'quaTangKhac',

  // Loan amount
  soTienVay: 'soTienVay',
  'Số tiền vay': 'soTienVay',

  // Registration fee
  phiTruocBa: 'phiTruocBa',
  'Phí trước bạ': 'phiTruocBa',

  // Vehicle model
  dongXe: 'dongXe',
  'Dòng xe': 'dongXe',

  // Version
  phienBan: 'phienBan',
  'Phiên bản': 'phienBan',

  // Exterior color
  ngoaiThat: 'ngoaiThat',
  'Ngoại Thất': 'ngoaiThat',
  'Màu ngoại thất': 'ngoaiThat',

  // Interior color
  noiThat: 'noiThat',
  'Nội Thất': 'noiThat',
  'Màu nội thất': 'noiThat',

  // VIN
  soKhung: 'soKhung',
  'Số khung': 'soKhung',
  VIN: 'soKhung',

  // Engine number
  soDongCo: 'soDongCo',
  'Số động cơ': 'soDongCo',

  // Status
  trangThai: 'trangThai',
  'Trạng thái': 'trangThai',

  // Payment method
  thanhToan: 'thanhToan',
  'Thanh toán': 'thanhToan',

  // Sales consultant
  tvbh: 'tvbh',
  TVBH: 'tvbh',

  // Showroom
  showroom: 'showroom',
  'Chi nhánh': 'showroom',

  // Created date
  createdDate: 'createdDate',
  created_at: 'createdDate',
  ngayTao: 'createdDate',

  // Export date
  ngayXhd: 'ngayXhd',
  'Ngày xuất hóa đơn': 'ngayXhd',

  // Birth date
  ngaySinh: 'ngaySinh',
  'Ngày sinh': 'ngaySinh',
  dateOfBirth: 'ngaySinh',
};

/**
 * Normalize a single field name to standard format
 * @param {string} fieldName - Original field name
 * @returns {string} Standard field name
 */
export function normalizeFieldName(fieldName) {
  return FIELD_MAPPINGS[fieldName] || fieldName;
}

/**
 * Normalize all fields in a contract object
 * @param {Object} data - Raw contract data
 * @returns {Object} Normalized contract data
 */
export function normalizeContract(data) {
  if (!data) return null;

  const normalized = {};

  Object.entries(data).forEach(([key, value]) => {
    const standardKey = normalizeFieldName(key);
    // Don't overwrite if already set (prefer first occurrence)
    if (normalized[standardKey] === undefined) {
      normalized[standardKey] = value;
    }
  });

  // Ensure numeric fields are numbers
  const numericFields = [
    'soTienCoc',
    'giaHD',
    'giaNiemYet',
    'giamGia',
    'quaTang',
    'quaTangKhac',
    'soTienVay',
    'phiTruocBa',
  ];

  numericFields.forEach((field) => {
    if (normalized[field] !== undefined && normalized[field] !== null) {
      const parsed = parseInt(normalized[field]);
      normalized[field] = isNaN(parsed) ? 0 : parsed;
    }
  });

  return normalized;
}

/**
 * Normalize a list of contracts from Firebase object
 * @param {Object} dataObject - Firebase data object {id: data}
 * @returns {Array} Array of normalized contracts with id
 */
export function normalizeContractList(dataObject) {
  if (!dataObject) return [];

  return Object.entries(dataObject).map(([id, data]) => ({
    id,
    ...normalizeContract(data),
  }));
}
