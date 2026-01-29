import { ref, get, set, runTransaction } from 'firebase/database';
import { database } from '../firebase/config';
import { isValidMaDms } from './validation';

// ============================================
// CONSTANTS
// ============================================

/** Maximum sequence number before overflow (9999) */
const MAX_SEQUENCE = 9999;

/** Transaction timeout in milliseconds (10 seconds) */
const TRANSACTION_TIMEOUT = 10000;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate a unique fallback sequence using timestamp + random
 * Reduces collision probability compared to Date.now() % 10000
 * @returns {string} 4-digit padded sequence
 */
const generateFallbackSequence = () => {
  const timestamp = Date.now() % 10000;
  const random = Math.floor(Math.random() * 100);
  const combined = (timestamp + random) % 10000;
  return String(combined).padStart(4, '0');
};

/**
 * Wrap a promise with timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @returns {Promise} Promise that rejects on timeout
 */
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Transaction timeout')), ms);
  });
  return Promise.race([promise, timeout]);
};

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Generate VSO number with format: {maDms}-VSO-{YY}-{MM}-{sequence}
 * Example: S00901-VSO-25-12-0035
 *
 * Edge cases handled:
 * - maDms format validation (S followed by 5 digits)
 * - Transaction timeout (10 seconds)
 * - Sequence overflow (> 9999 uses 5 digits)
 * - Fallback sequence with reduced collision risk
 *
 * @param {string} maDms - Branch code (e.g., S00901, S00501, S41501)
 * @returns {Promise<string>} Generated VSO number
 * @throws {Error} If maDms is missing or invalid format
 */
export const generateVSO = async (maDms) => {
  // Validate maDms format
  if (!maDms) {
    throw new Error('maDms is required');
  }
  if (!isValidMaDms(maDms)) {
    throw new Error(`Invalid maDms format: ${maDms}. Expected format: S00XXX`);
  }

  const now = new Date();
  const year = String(now.getFullYear()).slice(-2); // Last 2 digits: 25
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 01-12

  // Key for sequence counter: e.g., "S00901-25-12"
  const sequenceKey = `${maDms}-${year}-${month}`;
  const counterRef = ref(database, `vsoCounters/${sequenceKey}`);

  try {
    // Use transaction with timeout to safely increment counter
    const transactionPromise = runTransaction(counterRef, (currentValue) => {
      return (currentValue || 0) + 1;
    });

    const result = await withTimeout(transactionPromise, TRANSACTION_TIMEOUT);

    if (result.committed) {
      const sequenceNum = result.snapshot.val();
      // Handle sequence overflow: use appropriate padding
      const padLength = sequenceNum > MAX_SEQUENCE ? 5 : 4;
      const sequence = String(sequenceNum).padStart(padLength, '0');
      return `${maDms}-VSO-${year}-${month}-${sequence}`;
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('Error generating VSO:', error);
    // Fallback: use timestamp + random to reduce collision
    const fallbackSequence = generateFallbackSequence();
    return `${maDms}-VSO-${year}-${month}-${fallbackSequence}`;
  }
};

/**
 * Get the next VSO sequence number without incrementing (for preview)
 * 
 * @param {string} maDms - Branch code
 * @returns {Promise<string>} Preview of next VSO number
 */
export const previewNextVSO = async (maDms) => {
  if (!maDms) return '';

  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const sequenceKey = `${maDms}-${year}-${month}`;
  const counterRef = ref(database, `vsoCounters/${sequenceKey}`);

  try {
    const snapshot = await get(counterRef);
    const currentValue = snapshot.exists() ? snapshot.val() : 0;
    const padLength = (currentValue + 1) > MAX_SEQUENCE ? 5 : 4;
    const nextSequence = String(currentValue + 1).padStart(padLength, '0');
    return `${maDms}-VSO-${year}-${month}-${nextSequence}`;
  } catch (error) {
    console.error('Error previewing VSO:', error);
    return `${maDms}-VSO-${year}-${month}-????`;
  }
};

/**
 * Check if a VSO string has the full format
 *
 * @param {string} vso - VSO string to check
 * @returns {boolean} True if VSO has full format
 */
export const isFullVSOFormat = (vso) => {
  if (!vso) return false;
  // Pattern: S00901-VSO-25-12-0035 or S00901-VSO-25-12-10001
  const pattern = /^S\d{5}-VSO-\d{2}-\d{2}-\d{4,5}$/;
  return pattern.test(vso);
};

/**
 * Extract maDms from a VSO string
 * 
 * @param {string} vso - VSO string
 * @returns {string|null} maDms or null if not found
 */
export const extractMaDmsFromVSO = (vso) => {
  if (!vso) return null;
  const match = vso.match(/^(S\d{5})/);
  return match ? match[1] : null;
};

export default {
  generateVSO,
  previewNextVSO,
  isFullVSOFormat,
  extractMaDmsFromVSO,
};
