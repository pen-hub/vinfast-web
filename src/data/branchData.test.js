import { describe, it, expect, beforeEach } from 'vitest';
import {
  getBranchById,
  getBranchByMaDms,
  getBranchByShowroomName,
  clearBranchCache,
} from './branchData.js';

describe('branchData caching', () => {
  beforeEach(() => {
    clearBranchCache();
  });

  describe('getBranchById', () => {
    it('returns Thu Duc for id 1', () => {
      const branch = getBranchById(1);
      expect(branch?.maDms).toBe('S00501');
      expect(branch?.shortName).toBe('Thủ Đức');
    });

    it('returns Truong Chinh for id 2', () => {
      const branch = getBranchById(2);
      expect(branch?.maDms).toBe('S00901');
      expect(branch?.shortName).toBe('Trường Chinh');
    });

    it('returns Au Co for id 3', () => {
      const branch = getBranchById(3);
      expect(branch?.maDms).toBe('S41501');
      expect(branch?.shortName).toBe('Âu Cơ');
    });

    it('returns null for invalid id', () => {
      expect(getBranchById(999)).toBeNull();
    });
  });

  describe('getBranchByMaDms', () => {
    it('finds branch by exact maDms', () => {
      expect(getBranchByMaDms('S00501')?.shortName).toBe('Thủ Đức');
      expect(getBranchByMaDms('S00901')?.shortName).toBe('Trường Chinh');
      expect(getBranchByMaDms('S41501')?.shortName).toBe('Âu Cơ');
    });

    it('returns null for empty input', () => {
      expect(getBranchByMaDms('')).toBeNull();
      expect(getBranchByMaDms(null)).toBeNull();
    });
  });

  describe('getBranchByShowroomName - caching', () => {
    it('caches exact match lookups', () => {
      const branch1 = getBranchByShowroomName('Trường Chinh');
      const branch2 = getBranchByShowroomName('Trường Chinh');

      expect(branch1?.maDms).toBe('S00901');
      expect(branch2).toBe(branch1); // Same reference from cache
    });

    it('caches case-insensitive lookups', () => {
      const branch1 = getBranchByShowroomName('TRƯỜNG CHINH');
      const branch2 = getBranchByShowroomName('trường chinh');

      expect(branch1?.maDms).toBe('S00901');
      expect(branch2?.maDms).toBe('S00901');
    });

    it('handles maDms lookups', () => {
      expect(getBranchByShowroomName('S00501')?.shortName).toBe('Thủ Đức');
      expect(getBranchByShowroomName('S00901')?.shortName).toBe('Trường Chinh');
      expect(getBranchByShowroomName('S41501')?.shortName).toBe('Âu Cơ');
    });

    it('handles partial matches', () => {
      expect(getBranchByShowroomName('Chi Nhánh Trường Chinh')?.maDms).toBe('S00901');
      expect(getBranchByShowroomName('CN Âu Cơ')?.maDms).toBe('S41501');
    });

    it('handles Vietnamese variations', () => {
      expect(getBranchByShowroomName('truong chinh')?.maDms).toBe('S00901');
      expect(getBranchByShowroomName('au co')?.maDms).toBe('S41501');
      expect(getBranchByShowroomName('thu duc')?.maDms).toBe('S00501');
    });

    it('returns null for invalid input', () => {
      expect(getBranchByShowroomName('')).toBeNull();
      expect(getBranchByShowroomName(null)).toBeNull();
      expect(getBranchByShowroomName('Invalid Branch')).toBeNull();
    });
  });

  describe('clearBranchCache', () => {
    it('clears cache correctly', () => {
      getBranchByShowroomName('Trường Chinh');
      clearBranchCache();

      const branch = getBranchByShowroomName('Trường Chinh');
      expect(branch?.maDms).toBe('S00901'); // Still works after cache clear
    });
  });
});
