/**
 * Robust utility for parsing messy transaction data.
 */

/**
 * Parses a date string from various common formats, especially those with 
 * commas, dots, or dashes common in Nigerian spreadsheets.
 * Handles: DD,MM,YYYY | DD-MM-YYYY | DD/MM/YYYY | MM/DD/YYYY | ISO
 */
/**
 * Parses a date string from various common formats, especially those with 
 * commas, dots, or dashes common in Nigerian spreadsheets.
 * Handles: DD,MM,YYYY | DD-MM-YYYY | DD/MM/YYYY | MM/DD/YYYY | ISO | "Jan 3"
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

  // 2. Handle Month names (e.g. "Jan 3" or "3-Feb-2025")
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const sLower = s.toLowerCase();
  
  const hasMonthName = months.some(m => sLower.includes(m));
  if (hasMonthName) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      // If year is missing (e.g. "Jan 3"), JS might default to 2001 or current year.
      // We assume current year for "messy" entries without year if they are recent.
      if (d.getFullYear() < 2000) {
         d.setFullYear(new Date().getFullYear());
      }
      return d;
    }
  }

  // 3. Try standard Date constructor next
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  // 4. Handle common "messy" separators: commas and dots
  // 8,04,2020 -> 8/04/2020
  s = s.replace(/[,.]/g, '/');

  // 5. Try parsing DD/MM/YYYY specifically (Common in many parts of the world)
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
      const year = p3 < 100 ? (p3 > 50 ? 1900 + p3 : 2000 + p3) : p3;
      d = new Date(year, p2 - 1, p1);
    }

    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Parses a numeric value from a string, handling currency symbols, 
 * commas, spaces, and accounting parentheses.
 */
export function parseFlexibleAmount(val: any): number {
  if (val === undefined || val === null || val === "") return 0;
  
  let s = String(val).trim();
  if (!s) return 0;

  // Handle accounting parentheses: (40,000) -> -40000
  let isNegative = false;
  if (s.startsWith('(') && s.endsWith(')')) {
    isNegative = true;
    s = s.substring(1, s.length - 1);
  }

  // Remove everything except numbers and dots
  const cleaned = s.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) return 0;
  return isNegative ? -parsed : parsed;
}
