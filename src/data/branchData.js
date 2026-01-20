/**
 * Dữ liệu các chi nhánh VinFast Đông Sài Gòn
 * Đồng bộ từ Google Sheet - Thông tin chi nhánh
 */

// Branch lookup cache
const branchCache = new Map();

export const branches = [
  {
    id: 1,
    maDms: "S00501",
    displayName: "VinFast Đông Sài Gòn-Thủ Đức",
    shortName: "Thủ Đức",
    name: "CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN",
    // Tên viết tắt cho header biểu mẫu
    headerName: "CÔNG TY CP ĐT TM\nDỊCH VỤ Ô TÔ\nĐÔNG SÀI GÒN",
    address: "391 Võ Nguyên Giáp, Phường An Khánh, Thành Phố Thủ Đức, Thành Phố Hồ Chí Minh",
    taxCode: "0316801817",
    bankName: "VP Bank",
    bankAccount: "275582875",
    bankBranch: "Chi Nhánh Đông Sài Gòn",
    accountHolder: "CT CP DT TM DV OTO DONG SAI GON",
    representativeName: "Nguyễn Thành Trai",
    position: "Tổng Giám Đốc",
  },
  {
    id: 2,
    maDms: "S00901",
    displayName: "VinFast Đông Sài Gòn-Chi Nhánh Trường Chinh",
    shortName: "Trường Chinh",
    name: "CHI NHÁNH TRƯỜNG CHINH - CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN",
    // Tên viết tắt cho header biểu mẫu
    headerName: "CÔNG TY CP ĐT TM\nDỊCH VỤ Ô TÔ\nĐÔNG SÀI\nGÒN-CN TRƯỜNG\nCHINH",
    address: "682A Trường Chinh, Phường Tân Bình, Thành Phố Hồ Chí Minh",
    taxCode: "0316801817-002",
    bankName: "VP Bank",
    bankAccount: "288999",
    bankBranch: "Chi Nhánh Đông Sài Gòn",
    accountHolder: "CN TRUONG CHINH CTCP DONG SAI GON",
    representativeName: "Nguyễn Thành Trai",
    position: "Tổng Giám Đốc",
  },
  {
    id: 3,
    maDms: "S41501",
    displayName: "VinFast Đông Sài Gòn-Chi Nhánh Âu Cơ",
    shortName: "Âu Cơ",
    name: "CHI NHÁNH ÂU CƠ - CÔNG TY CỔ PHẦN ĐẦU TƯ THƯƠNG MẠI VÀ DỊCH VỤ Ô TÔ ĐÔNG SÀI GÒN",
    // Tên viết tắt cho header biểu mẫu
    headerName: "CÔNG TY CP ĐT TM\nDỊCH VỤ Ô TÔ\nĐÔNG SÀI\nGÒN-CN ÂU CƠ",
    address: "616 Âu Cơ, Phường Bảy Hiền, Thành Phố Hồ Chí Minh",
    taxCode: "0316801817-003",
    bankName: "VP Bank",
    bankAccount: "390009078",
    bankBranch: "Chi Nhánh Đông Sài Gòn",
    accountHolder: "CN AU CO CTCP DONG SAI GON",
    representativeName: "Nguyễn Thành Trai",
    position: "Tổng Giám Đốc",
  },
];

/**
 * Tìm chi nhánh theo ID
 * @param {number} id - ID của chi nhánh
 * @returns {Object|null} Thông tin chi nhánh hoặc null nếu không tìm thấy
 */
export const getBranchById = (id) => {
  return branches.find((branch) => branch.id === id) || null;
};

/**
 * Tìm chi nhánh theo mã DMS
 * @param {string} maDms - Mã DMS của chi nhánh (ví dụ: S00501)
 * @returns {Object|null} Thông tin chi nhánh hoặc null nếu không tìm thấy
 */
export const getBranchByMaDms = (maDms) => {
  if (!maDms) return null;
  return branches.find((branch) => branch.maDms === maDms) || null;
};

/**
 * Tìm chi nhánh theo tên (không phân biệt hoa thường)
 * @param {string} name - Tên chi nhánh (có thể là tên đầy đủ hoặc tên ngắn)
 * @returns {Object|null} Thông tin chi nhánh hoặc null nếu không tìm thấy
 */
export const getBranchByName = (name) => {
  if (!name) return null;
  const searchName = name.toLowerCase().trim();
  return (
    branches.find(
      (branch) =>
        branch.name.toLowerCase().includes(searchName) ||
        branch.shortName.toLowerCase().includes(searchName) ||
        branch.displayName.toLowerCase().includes(searchName)
    ) || null
  );
};

/**
 * Tìm chi nhánh theo tên showroom (hỗ trợ các tên thường dùng) - with caching
 * @param {string} showroomName - Tên showroom (ví dụ: "Chi Nhánh Trường Chinh", "TRƯỜNG CHINH", "Trường Chinh")
 * @returns {Object|null} Thông tin chi nhánh hoặc null nếu không tìm thấy
 */
export const getBranchByShowroomName = (showroomName) => {
  if (!showroomName) return null;
  const searchName = showroomName.toLowerCase().trim();

  // Check cache first
  if (branchCache.has(searchName)) {
    return branchCache.get(searchName);
  }
  
  // Mapping các tên thường dùng
  const nameMapping = {
    // Thủ Đức (ID 1) - Showroom chính
    "thủ đức": 1,
    "thu duc": 1,
    "thuduc": 1,
    "s00501": 1,
    "vinfast đông sài gòn-thủ đức": 1,
    "vinfast dong sai gon-thu duc": 1,
    "đông sài gòn": 1,
    "dong sai gon": 1,
    "showroom thủ đức": 1,
    "sr thủ đức": 1,
    "võ nguyên giáp": 1,
    "an khánh": 1,

    // Trường Chinh (ID 2)
    "trường chinh": 2,
    "truong chinh": 2,
    "truongchinh": 2,
    "trường chính": 2,
    "chi nhánh trường chinh": 2,
    "chi nhanh truong chinh": 2,
    "cn trường chinh": 2,
    "cn truong chinh": 2,
    "s00901": 2,
    "vinfast đông sài gòn-chi nhánh trường chinh": 2,
    "vinfast dong sai gon-chi nhanh truong chinh": 2,
    "showroom trường chinh": 2,
    "sr trường chinh": 2,
    "682a trường chinh": 2,

    // Âu Cơ (ID 3)
    "âu cơ": 3,
    "au co": 3,
    "auco": 3,
    "chi nhánh âu cơ": 3,
    "chi nhanh au co": 3,
    "cn âu cơ": 3,
    "cn au co": 3,
    "s41501": 3,
    "vinfast đông sài gòn-chi nhánh âu cơ": 3,
    "vinfast đông sài gòn- chi nhánh âu cơ": 3,
    "vinfast dong sai gon-chi nhanh au co": 3,
    "showroom âu cơ": 3,
    "sr âu cơ": 3,
    "616 âu cơ": 3,
  };

  // Kiểm tra mapping trước (exact match)
  const mappedId = nameMapping[searchName];
  if (mappedId) {
    const branch = getBranchById(mappedId);
    branchCache.set(searchName, branch);
    return branch;
  }

  // Kiểm tra partial match - ưu tiên theo thứ tự
  let branch = null;

  // Âu Cơ trước (vì "âu cơ" không có trong tên khác)
  if (searchName.includes("âu cơ") || searchName.includes("au co") || searchName.includes("s41501")) {
    branch = getBranchById(3);
  }
  // Trường Chinh
  else if (searchName.includes("trường chinh") || searchName.includes("truong chinh") || searchName.includes("s00901")) {
    branch = getBranchById(2);
  }
  // Thủ Đức / Đông Sài Gòn chính
  else if (searchName.includes("thủ đức") || searchName.includes("thu duc") ||
      searchName.includes("s00501") || searchName.includes("võ nguyên giáp") ||
      (searchName.includes("đông sài gòn") && !searchName.includes("chi nhánh"))) {
    branch = getBranchById(1);
  }
  // Tìm theo tên (fallback)
  else {
    branch = getBranchByName(showroomName);
  }

  // Cache result
  branchCache.set(searchName, branch);
  return branch;
};

/**
 * Lấy chi nhánh mặc định (Chi Nhánh Trường Chinh)
 * @returns {Object} Thông tin chi nhánh mặc định
 */
export const getDefaultBranch = () => {
  return getBranchById(2); // Chi Nhánh Trường Chinh
};

/**
 * Lấy danh sách tất cả chi nhánh
 * @returns {Array} Danh sách các chi nhánh
 */
export const getAllBranches = () => {
  return branches;
};

/**
 * Clear branch cache (for testing)
 */
export const clearBranchCache = () => branchCache.clear();

export default {
  branches,
  getBranchById,
  getBranchByMaDms,
  getBranchByName,
  getBranchByShowroomName,
  getDefaultBranch,
  getAllBranches,
  clearBranchCache,
};
