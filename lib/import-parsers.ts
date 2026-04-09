/**
 * Robust utility for parsing messy transaction data.
 */

/**
 * Parses a date string from various common formats, especially those with 
 * commas, dots, or dashes common in Nigerian spreadsheets.
 * Handles: DD,MM,YYYY | DD-MM-YYYY | DD/MM/YYYY | MM/DD/YYYY | ISO
 */
export function parseFlexibleDate(val: any): Date | null {
  if (!val) return null;
  
  let s = String(val).trim();
  if (!s) return null;

  // 1. Is it purely a numeric timestamp/excel serial?
  if (/^\d+$/.test(s)) {
    const num = Number(s);
    if (num < 100000) {
      // Excel dates are number of days since Dec 30, 1899
      const excelDate = new Date((num - 25569) * 86400 * 1000);
      if (!isNaN(excelDate.getTime())) return excelDate;
    } else {
      // Unix timestamp (ms or seconds)
      const unixDate = new Date(num > 1e11 ? num : num * 1000);
      if (!isNaN(unixDate.getTime())) return unixDate;
    }
  }

  // 2. Try standard Date constructor next
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  // 2. Handle common "messy" separators: commas and dots
  // 8,04,2020 -> 8/04/2020
  s = s.replace(/[,.]/g, '/');

  // 3. Try parsing DD/MM/YYYY specifically (Common in many parts of the world)
  const parts = s.split('/');
  if (parts.length === 3) {
    const p1 = parseInt(parts[0]);
    const p2 = parseInt(parts[1]);
    const p3 = parseInt(parts[2]);

    // Check if it's DD/MM/YYYY or YYYY/MM/DD
    if (p1 > 31 && p3 <= 31) {
      // Likely YYYY/MM/DD
      d = new Date(p1, p2 - 1, p3);
    } else {
      // Assume DD/MM/YYYY
      // Note: JavaScript Date treats year < 100 specially, so we handle it
      const year = p3 < 100 ? 2000 + p3 : p3;
      d = new Date(year, p2 - 1, p1);
    }

    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Parses a numeric value from a string, handling currency symbols, 
 * commas, and spaces.
 */
export function parseFlexibleAmount(val: any): number {
  if (val === undefined || val === null || val === "") return 0;
  
  const s = String(val).trim();
  if (!s) return 0;

  // Remove everything except numbers, dots, and minus signs
  // e.g. "NGN 400,000.00" -> "400000.00"
  const cleaned = s.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
}
