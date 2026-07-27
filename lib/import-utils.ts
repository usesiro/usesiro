import Fuse from 'fuse.js';
import { BANK_COLUMN_MAP, SiroField, SIRO_FIELDS } from './bank-mappings';
import crypto from 'crypto';

/**
 * Uses Fuzzy Matching (Fuse.js) to guess which Siro field a 
 * bank statement header most likely belongs to.
 */
export function detectColumnMapping(headers: string[]): Record<string, SiroField | null> {
  const mapping: Record<string, SiroField | null> = {};

  // Flatten the dictionary for Fuse.js
  const searchItems = SIRO_FIELDS.flatMap(field => 
    BANK_COLUMN_MAP[field].map(alias => ({ field, alias }))
  );

  const fuse = new Fuse(searchItems, {
    keys: ['alias'],
    threshold: 0.3, // Adjust for sensitivity
    includeScore: true
  });

  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim();
    
    // 1. Try Exact Match first (fast)
    let foundField: SiroField | null = null;
    for (const field of SIRO_FIELDS) {
      if (BANK_COLUMN_MAP[field].includes(normalizedHeader)) {
        foundField = field;
        break;
      }
    }

    // 2. If no exact match, try Fuzzy Match
    if (!foundField) {
      const results = fuse.search(normalizedHeader);
      if (results.length > 0) {
        foundField = results[0].item.field;
      }
    }

    mapping[header] = foundField;
  }

  return mapping;
}

/**
 * Generates a unique signature for a transaction to prevent duplicates.
 * Uses amount + date + description + businessId + reference + balance + rowIndex
 * The rowIndex ensures that same-day, same-amount, same-description transactions
 * (e.g. multiple VAT charges of ₦0.75) each get a unique fingerprint.
 */
export function generateTransactionIdempotencyKey(
  amount: number | string,
  date: Date | string,
  description: string,
  businessId: string,
  reference?: string,
  balance?: number | string,
  rowIndex?: number
): string {
  const d = new Date(date).toISOString().split('T')[0];
  const normalizedDesc = description.trim().toLowerCase();

  // Create a fingerprint string
  let fingerprint = `${Number(amount).toFixed(2)}|${d}|${normalizedDesc}|${businessId}`;

  // Add optional but stable fields for better uniqueness
  if (reference && String(reference).trim().length > 0) {
    fingerprint += `|ref:${String(reference).trim().toLowerCase()}`;
  }

  const numBalance = Number(balance);
  if (balance !== undefined && balance !== "" && !isNaN(numBalance)) {
    fingerprint += `|bal:${numBalance.toFixed(2)}`;
  }

  // Row index tiebreaker: ensures identical-looking transactions
  // on the same day (e.g. multiple ₦0.75 VAT charges) get distinct keys
  if (rowIndex !== undefined) {
    fingerprint += `|idx:${rowIndex}`;
  }

  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

/**
 * Creates a unique hash for a set of headers to identify the file format.
 */
export function generateHeaderHash(headers: string[]): string {
  const sortedHeaders = [...headers].sort().join('|').toLowerCase();
  return crypto.createHash('md5').update(sortedHeaders).digest('hex');
}
