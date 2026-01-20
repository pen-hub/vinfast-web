export const MUC_DO_OPTIONS = ['Very hot', 'Hot', 'Cool', 'Warm'];

export const TINH_TRANG_OPTIONS = [
  'Mới',
  'Chưa liên hệ được',
  'Đã tư vấn',
  'Đã báo giá',
  'Hẹn lái thử',
  'Đã lái thử',
  'Đã đặt cọc',
  'Đang làm ngân hàng',
  'Không quan tâm',
  'Không mua'
];

export const THANH_TOAN_OPTIONS = ['Trả thẳng', 'Trả góp'];
export const NHU_CAU_OPTIONS = ['Kinh doanh', 'Không kinh doanh'];
export const NGUON_OPTIONS = ['Showroom', 'Facebook', 'Web', 'Giới thiệu', 'Sự kiện'];
export const KHACH_HANG_LA_OPTIONS = ['Cá nhân', 'Công ty'];

export const getMucDoColorClasses = (option, isSelected = false) => {
  const colorMap = {
    'Very hot': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      hover: 'hover:bg-red-200',
      ring: 'ring-red-300',
      selectedBg: 'bg-red-200',
      selectedText: 'text-red-900'
    },
    'Hot': {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      hover: 'hover:bg-orange-200',
      ring: 'ring-orange-300',
      selectedBg: 'bg-orange-200',
      selectedText: 'text-orange-900'
    },
    'Cool': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      hover: 'hover:bg-blue-200',
      ring: 'ring-blue-300',
      selectedBg: 'bg-blue-200',
      selectedText: 'text-blue-900'
    },
    'Warm': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      hover: 'hover:bg-yellow-200',
      ring: 'ring-yellow-300',
      selectedBg: 'bg-yellow-200',
      selectedText: 'text-yellow-900'
    }
  };

  const colors = colorMap[option] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    hover: 'hover:bg-gray-200',
    ring: 'ring-gray-300',
    selectedBg: 'bg-gray-200',
    selectedText: 'text-gray-900'
  };

  if (isSelected) {
    return `${colors.selectedBg} ${colors.selectedText} ring-2 ${colors.ring}`;
  }
  return `${colors.bg} ${colors.text} ${colors.hover}`;
};
