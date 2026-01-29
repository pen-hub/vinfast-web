import { describe, it, expect } from 'vitest';
import { normalizeFieldName, normalizeContract, normalizeContractList } from './field-normalizer';

describe('field-normalizer', () => {
  describe('normalizeFieldName', () => {
    it('should normalize customer name aliases', () => {
      expect(normalizeFieldName('customerName')).toBe('tenKhachHang');
      expect(normalizeFieldName('Tên Kh')).toBe('tenKhachHang');
      expect(normalizeFieldName('Tên KH')).toBe('tenKhachHang');
      expect(normalizeFieldName('tenKhachHang')).toBe('tenKhachHang');
    });

    it('should normalize financial field aliases', () => {
      expect(normalizeFieldName('Số tiền cọc')).toBe('soTienCoc');
      expect(normalizeFieldName('Tiền đặt cọc')).toBe('soTienCoc');
      expect(normalizeFieldName('tienDatCoc')).toBe('soTienCoc');
      expect(normalizeFieldName('soTienCoc')).toBe('soTienCoc');
    });

    it('should normalize contract price aliases', () => {
      expect(normalizeFieldName('Giá Hợp Đồng')).toBe('giaHD');
      expect(normalizeFieldName('Gia Hop Dong')).toBe('giaHD');
      expect(normalizeFieldName('giaHD')).toBe('giaHD');
    });

    it('should return original name if no mapping exists', () => {
      expect(normalizeFieldName('unknownField')).toBe('unknownField');
    });
  });

  describe('normalizeContract', () => {
    it('should normalize all field names in contract', () => {
      const raw = {
        'Tên Kh': 'Nguyễn Văn A',
        'Số tiền cọc': '50000000',
        'Giá Hợp Đồng': 719000000,
        'Địa Chỉ': 'TP.HCM',
      };

      const normalized = normalizeContract(raw);

      expect(normalized.tenKhachHang).toBe('Nguyễn Văn A');
      expect(normalized.soTienCoc).toBe(50000000);
      expect(normalized.giaHD).toBe(719000000);
      expect(normalized.diaChi).toBe('TP.HCM');
    });

    it('should convert numeric string fields to numbers', () => {
      const raw = {
        soTienCoc: '50000000',
        giaHD: '719000000',
        giamGia: '10000000',
      };

      const normalized = normalizeContract(raw);

      expect(normalized.soTienCoc).toBe(50000000);
      expect(normalized.giaHD).toBe(719000000);
      expect(normalized.giamGia).toBe(10000000);
    });

    it('should handle invalid numeric values', () => {
      const raw = {
        soTienCoc: 'invalid',
        giaHD: null,
        giamGia: undefined,
      };

      const normalized = normalizeContract(raw);

      expect(normalized.soTienCoc).toBe(0);
      expect(normalized.giaHD).toBeNull();
      expect(normalized.giamGia).toBeUndefined();
    });

    it('should not overwrite if standard field already exists', () => {
      const raw = {
        tenKhachHang: 'Standard Name',
        'Tên Kh': 'Alias Name', // Should be ignored
      };

      const normalized = normalizeContract(raw);

      expect(normalized.tenKhachHang).toBe('Standard Name');
    });

    it('should return null for null input', () => {
      expect(normalizeContract(null)).toBeNull();
    });

    it('should preserve non-mapped fields', () => {
      const raw = {
        customField: 'custom value',
        'Tên Kh': 'Test',
      };

      const normalized = normalizeContract(raw);

      expect(normalized.customField).toBe('custom value');
      expect(normalized.tenKhachHang).toBe('Test');
    });
  });

  describe('normalizeContractList', () => {
    it('should normalize Firebase object to array', () => {
      const firebaseData = {
        'contract-1': {
          'Tên Kh': 'Nguyễn Văn A',
          'Số tiền cọc': '50000000',
        },
        'contract-2': {
          'Tên Kh': 'Trần Thị B',
          'Số tiền cọc': '30000000',
        },
      };

      const normalized = normalizeContractList(firebaseData);

      expect(normalized).toHaveLength(2);
      expect(normalized[0].id).toBe('contract-1');
      expect(normalized[0].tenKhachHang).toBe('Nguyễn Văn A');
      expect(normalized[0].soTienCoc).toBe(50000000);
      expect(normalized[1].id).toBe('contract-2');
      expect(normalized[1].tenKhachHang).toBe('Trần Thị B');
      expect(normalized[1].soTienCoc).toBe(30000000);
    });

    it('should return empty array for null input', () => {
      expect(normalizeContractList(null)).toEqual([]);
    });

    it('should return empty array for empty object', () => {
      expect(normalizeContractList({})).toEqual([]);
    });
  });
});
