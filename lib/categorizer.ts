import { Category, TransactionType } from "@prisma/client";

// Rules for money going OUT (Expenses)
const expenseRules: Record<string, RegExp> = {
  'software-it': /aws|amazon|google workspace|microsoft|vercel|github|netlify|zoom|slack|digitalocean/i,
  'fuel-utilities': /total|nnpc|conoil|mtn|airtel|glo|9mobile|electricity|ikeja electric|ibedc|fuel|diesel|petrol/i,
  'bank-pos-charges': /paystack|flutterwave|mono|moniepoint|opay|palmpay|charge|fee|sms|stamp duty|maintenance|transfer/i,
  'marketing-ads': /facebook|instagram|twitter|linkedin|google ads|meta|print|billboard/i,
  'salary-wages': /salary|payroll|wage|allowance|stipend|bonus/i,
  'rent-office': /rent|lease|furniture|stationery|paper|desk/i,
};

// Rules for money coming IN (Income)
const incomeRules: Record<string, RegExp> = {
  // If someone pays you via Opay/Moniepoint/Paystack, it's a sale
  'sales': /pos settlement|payout|stripe|checkout|sale|opay|moniepoint|palmpay|paystack|flutterwave/i,
  'interest': /interest|dividend|yield/i,
  'services': /service|consulting|freelance/i, 
};

/**
 * Scans a transaction description and returns the matching database Category ID
 */
export function autoCategorize(
  description: string, 
  transactionType: TransactionType, 
  dbCategories: Category[]
): string | null {
  
  let matchedSlug: string | null = null;
  
  // 1. Pick the right rulebook based on INCOME vs EXPENSE
  const rulesToUse = transactionType === 'INCOME' ? incomeRules : expenseRules;
  
  // 2. Scan the description against the chosen rulebook
  for (const [slug, regex] of Object.entries(rulesToUse)) {
    if (regex.test(description)) {
      matchedSlug = slug;
      break;
    }
  }

  // 3. Find the exact Category ID from the database using the matched slug
  if (matchedSlug) {
    const foundCat = dbCategories.find(c => c.slug === matchedSlug);
    if (foundCat) return foundCat.id;
  }

  // 4. If no match is found, apply the correct fallback based on the Type Enum
  const fallbackSlug = transactionType === 'INCOME' ? 'uncategorized-income' : 'uncategorized-expense';
  const fallbackCat = dbCategories.find(c => c.slug === fallbackSlug);
  
  return fallbackCat ? fallbackCat.id : null;
}