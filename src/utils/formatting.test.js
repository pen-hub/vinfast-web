import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatDateOrPlaceholder } from './formatting.js';

describe('formatCurrency', () => {
  it('formats number to Vietnamese locale', () => {
    expect(formatCurrency(1000000)).toBe('1.000.000');
    expect(formatCurrency(500000)).toBe('500.000');
  });

  it('adds VNĐ suffix when withSuffix is true', () => {
    expect(formatCurrency(1000000, true)).toBe('1.000.000 VNĐ');
  });

  it('handles string input with commas', () => {
    expect(formatCurrency('1,000,000')).toBe('1.000.000');
  });

  it('returns empty string for zero', () => {
    expect(formatCurrency(0)).toBe('');
  });

  it('returns empty string for null/undefined', () => {
    expect(formatCurrency(null)).toBe('');
    expect(formatCurrency(undefined)).toBe('');
    expect(formatCurrency('')).toBe('');
  });

  it('handles invalid input gracefully', () => {
    expect(formatCurrency('abc')).toBe('');
    expect(formatCurrency(NaN)).toBe('');
  });
});

describe('formatDate', () => {
  it('formats Date object to DD/MM/YYYY', () => {
    const date = new Date('2025-01-20');
    const formatted = formatDate(date);
    expect(formatted).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  });

  it('returns already formatted DD/MM/YYYY unchanged', () => {
    expect(formatDate('20/01/2025')).toBe('20/01/2025');
  });

  it('formats ISO string to DD/MM/YYYY', () => {
    const formatted = formatDate('2025-01-20T00:00:00Z');
    expect(formatted).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  });

  it('returns empty string for null/undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('handles invalid date gracefully', () => {
    expect(formatDate('invalid-date')).toBe('');
  });
});

describe('formatDateOrPlaceholder', () => {
  it('returns formatted date when valid', () => {
    expect(formatDateOrPlaceholder('20/01/2025')).toBe('20/01/2025');
  });

  it('returns default placeholder when date is empty', () => {
    expect(formatDateOrPlaceholder('')).toBe('___/___/______');
    expect(formatDateOrPlaceholder(null)).toBe('___/___/______');
  });

  it('accepts custom placeholder', () => {
    expect(formatDateOrPlaceholder('', '[Chưa có ngày]')).toBe('[Chưa có ngày]');
  });
});
