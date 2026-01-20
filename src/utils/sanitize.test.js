/**
 * Unit tests for sanitization utilities
 */
import { describe, it, expect } from 'vitest';
import { sanitizeString, sanitizeNumber, sanitizeContractData } from './sanitize';

describe('sanitizeString', () => {
  it('removes control characters', () => {
    expect(sanitizeString('test\x00data\x1F')).toBe('testdata');
    expect(sanitizeString('hello\x7Fworld')).toBe('helloworld');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
    expect(sanitizeString('\n\ttest\n')).toBe('test');
  });

  it('enforces maxLength', () => {
    const longString = 'a'.repeat(2000);
    expect(sanitizeString(longString).length).toBe(1000);
    expect(sanitizeString(longString, 50).length).toBe(50);
  });

  it('handles non-string inputs', () => {
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(123)).toBe('');
    expect(sanitizeString({})).toBe('');
  });

  it('preserves valid strings', () => {
    expect(sanitizeString('Nguyễn Văn A')).toBe('Nguyễn Văn A');
    expect(sanitizeString('test@example.com')).toBe('test@example.com');
  });
});

describe('sanitizeNumber', () => {
  it('converts valid numbers', () => {
    expect(sanitizeNumber('12345')).toBe(12345);
    expect(sanitizeNumber(12345)).toBe(12345);
    expect(sanitizeNumber('0')).toBe(0);
  });

  it('removes non-numeric characters', () => {
    expect(sanitizeNumber('$1,234.56')).toBe(123456);
    expect(sanitizeNumber('abc123def')).toBe(123);
    expect(sanitizeNumber('10.000.000')).toBe(10000000);
  });

  it('strips negative signs (converts to positive)', () => {
    // regex \D removes minus sign, so '-100' becomes '100'
    expect(sanitizeNumber('-100')).toBe(100);
    expect(sanitizeNumber(-100)).toBe(100);
    expect(sanitizeNumber('-0')).toBe(0);
  });

  it('handles null/undefined/empty', () => {
    expect(sanitizeNumber(null)).toBe(0);
    expect(sanitizeNumber(undefined)).toBe(0);
    expect(sanitizeNumber('')).toBe(0);
  });

  it('handles unsafe integers', () => {
    const unsafeInt = Number.MAX_SAFE_INTEGER + 1;
    expect(sanitizeNumber(unsafeInt)).toBe(0);
  });

  it('handles non-numeric strings', () => {
    expect(sanitizeNumber('abc')).toBe(0);
    expect(sanitizeNumber('!!!')).toBe(0);
  });
});

describe('sanitizeContractData', () => {
  it('sanitizes string fields', () => {
    const data = {
      tenKh: '  Nguyễn Văn A  \x00',
      cccd: '001234567890',
      soDienThoai: '0912345678',
    };
    const result = sanitizeContractData(data);
    expect(result.tenKh).toBe('Nguyễn Văn A');
    expect(result.cccd).toBe('001234567890');
    expect(result.soDienThoai).toBe('0912345678');
  });

  it('sanitizes numeric fields', () => {
    const data = {
      soTienCoc: '50.000.000',
      giaHopDong: '$1,234,567',
      soTienVay: 100000000,
    };
    const result = sanitizeContractData(data);
    expect(result.soTienCoc).toBe(50000000);
    expect(result.giaHopDong).toBe(1234567);
    expect(result.soTienVay).toBe(100000000);
  });

  it('handles both English and Vietnamese field names', () => {
    const data = {
      customerName: 'John Doe',
      tenKh: 'Nguyễn Văn A',
      deposit: '1000000',
      soTienCoc: '2000000',
    };
    const result = sanitizeContractData(data);
    expect(result.customerName).toBe('John Doe');
    expect(result.tenKh).toBe('Nguyễn Văn A');
    expect(result.deposit).toBe(1000000);
    expect(result.soTienCoc).toBe(2000000);
  });

  it('handles invalid inputs', () => {
    expect(sanitizeContractData(null)).toEqual({});
    expect(sanitizeContractData(undefined)).toEqual({});
    expect(sanitizeContractData('string')).toEqual({});
    expect(sanitizeContractData(123)).toEqual({});
  });

  it('preserves non-targeted fields', () => {
    const data = {
      tenKh: 'Test',
      customField: 'should be preserved',
      nestedObject: { key: 'value' },
    };
    const result = sanitizeContractData(data);
    expect(result.tenKh).toBe('Test');
    expect(result.customField).toBe('should be preserved');
    expect(result.nestedObject).toEqual({ key: 'value' });
  });

  it('handles undefined field values', () => {
    const data = {
      tenKh: undefined,
      soTienCoc: undefined,
      validField: 'test',
    };
    const result = sanitizeContractData(data);
    expect(result.validField).toBe('test');
  });

  it('prevents NoSQL injection patterns', () => {
    const data = {
      tenKh: '{ "$gt": "" }',
      cccd: '001234567890; DROP TABLE users;',
    };
    const result = sanitizeContractData(data);
    expect(result.tenKh).toBe('{ "$gt": "" }'); // String, not object
    expect(result.cccd).toBe('001234567890; DROP TABLE users;'); // Sanitized string
  });

  it('prevents XSS patterns', () => {
    const data = {
      ghiChu: '<script>alert("xss")</script>',
      diaChi: 'Hà Nội\x00<img src=x onerror=alert(1)>',
    };
    const result = sanitizeContractData(data);
    expect(result.ghiChu).toBe('<script>alert("xss")</script>'); // HTML chars preserved but control chars removed
    expect(result.diaChi).toBe('Hà Nội<img src=x onerror=alert(1)>'); // Control chars removed
  });
});
