# Hướng Dẫn Tính Năng Lọc Ưu Đãi Theo Dòng Xe

## Tổng Quan

Tính năng này cho phép **mỗi dòng xe có các chương trình ưu đãi riêng**. Khi người dùng chọn dòng xe nào, hệ thống sẽ chỉ hiển thị các ưu đãi áp dụng cho dòng xe đó.

## Các Thay Đổi Chính

### 1. Cấu Trúc Dữ Liệu Ưu Đãi Mới

Mỗi ưu đãi giờ đây có thêm trường `dongXe` (array) để xác định dòng xe áp dụng:

```javascript
{
  id: 'promo_vf3_1',
  name: 'Giảm trực tiếp 5.000.000 VNĐ cho VF 3',
  type: 'fixed',
  value: 5000000,
  dongXe: ['vf_3'], // Chỉ áp dụng cho VF 3
  createdAt: '2024-12-11T...',
  createdBy: 'admin'
}
```

### 2. Danh Sách Dòng Xe Hỗ Trợ

- `vf_3` - VF 3
- `vf_5` - VF 5  
- `vf_6` - VF 6
- `vf_7` - VF 7
- `vf_8` - VF 8
- `vf_9` - VF 9
- `minio` - Minio
- `herio` - Herio
- `nerio` - Nerio
- `limo` - Limo
- `ec` - EC
- `ec_nang_cao` - EC Nâng Cao

### 3. Logic Lọc Ưu Đãi

- **Ưu đãi không có trường `dongXe`**: Hiển thị cho tất cả dòng xe (backward compatibility)
- **Ưu đãi có `dongXe = []`**: Hiển thị cho tất cả dòng xe
- **Ưu đãi có `dongXe = ['vf_3', 'vf_5']`**: Chỉ hiển thị khi chọn VF 3 hoặc VF 5

## Cách Sử Dụng

### 1. Trang Báo Giá (CalculatorPage)

1. Chọn dòng xe từ dropdown
2. Nhấn nút "Thêm chương trình ưu đãi"
3. Hệ thống sẽ chỉ hiển thị ưu đãi áp dụng cho dòng xe đã chọn
4. Có thông báo "Lọc theo dòng xe: [Tên dòng xe]"

### 2. Trang Hợp Đồng (HopDongPage)

1. Nhấn nút "Quản lý chương trình ưu đãi" (chỉ admin)
2. Sử dụng dropdown "Lọc theo dòng xe" để xem ưu đãi của từng dòng xe
3. Khi thêm ưu đãi mới, có thể chọn dòng xe áp dụng
4. Danh sách ưu đãi hiển thị thông tin dòng xe áp dụng

### 3. Trang Form Hợp Đồng (ContractFormPage)

1. Chọn dòng xe trong form hợp đồng
2. Nhấn nút "Chọn ưu đãi"
3. Modal sẽ hiển thị ưu đãi được lọc theo dòng xe đã chọn
4. Có thông báo "Lọc theo dòng xe: [Tên dòng xe]"

### 4. Thêm Ưu Đãi Mới

Khi thêm ưu đãi mới (trong CalculatorPage hoặc HopDongPage), có thể:

1. **Chọn dòng xe cụ thể**: Tick vào các checkbox dòng xe muốn áp dụng
2. **Không chọn dòng xe nào**: Ưu đãi sẽ áp dụng cho tất cả dòng xe

### 5. Xem Ưu Đãi Theo Dòng Xe

Trong HopDongPage, admin có thể:

1. Sử dụng dropdown "Lọc theo dòng xe" để xem ưu đãi của từng dòng xe
2. Xem thông tin "Dòng xe áp dụng" trong mỗi ưu đãi
3. Quản lý ưu đãi theo từng phân khúc xe

## Migration Dữ Liệu Cũ

Để cập nhật dữ liệu ưu đãi hiện có, chạy script:

```bash
node scripts/migrate-promotions.js
```

Script này sẽ:
- Thêm trường `dongXe` cho các ưu đãi chưa có
- Mặc định áp dụng cho tất cả dòng xe (backward compatibility)

## Test Tính Năng

Có thể test tính năng bằng trang test:
- File: `src/pages/TestPromotionFilterPage.jsx`
- Hiển thị so sánh giữa tất cả ưu đãi và ưu đãi được lọc

## Ví Dụ Ưu Đãi Mẫu

```javascript
// Ưu đãi chỉ cho VF 3
{
  name: 'Giảm trực tiếp 5.000.000 VNĐ cho VF 3',
  dongXe: ['vf_3']
}

// Ưu đãi cho VF 7 và VF 8
{
  name: 'Ưu đãi cao cấp VF 7-8',
  dongXe: ['vf_7', 'vf_8']
}

// Ưu đãi cho tất cả dòng xe
{
  name: 'Ưu đãi Lái xe Xanh - Tất cả dòng xe',
  dongXe: ['vf_3', 'vf_5', 'vf_6', 'vf_7', 'vf_8', 'vf_9']
}
```

## Lưu Ý Kỹ Thuật

1. **Function lọc**: `filterPromotionsByDongXe(promotions, selectedDongXe)`
2. **Backward compatibility**: Ưu đãi cũ không có `dongXe` vẫn hoạt động bình thường
3. **Performance**: Lọc được thực hiện ở client-side, nhanh và mượt
4. **UI/UX**: Có thông báo rõ ràng về việc lọc theo dòng xe

## Troubleshooting

### Ưu đãi không hiển thị
- Kiểm tra trường `dongXe` của ưu đãi
- Đảm bảo dòng xe đã chọn có trong array `dongXe`

### Ưu đãi cũ không hoạt động
- Chạy migration script để thêm trường `dongXe`
- Hoặc thêm thủ công trường `dongXe: []` để áp dụng cho tất cả

### Lỗi khi thêm ưu đãi mới
- Kiểm tra quyền ghi Firebase
- Đảm bảo đã chọn ít nhất một dòng xe hoặc để trống (áp dụng tất cả)