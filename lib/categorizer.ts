import { Category, TransactionType, BusinessCategoryRule } from "@prisma/client";

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
  'sales': /pos settlement|payout|stripe|checkout|sale|opay|moniepoint|palmpay|paystack|flutterwave/i,
  'interest': /interest|dividend|yield/i,
  'services': /service|consulting|freelance/i,
};

export type CategorizationResult = {
  categoryId: string | null;
  reviewStatus: "AUTO_CATEGORIZED" | "PENDING_REVIEW" | "HUMAN_RESOLVED";
};

/**
 * Three-pass auto-categorization pipeline:
 * 1. Tenant-specific saved rules (from human resolutions)
 * 2. Standard regex rules
 * 3. Flag as PENDING_REVIEW (no guessing)
 */
export function autoCategorize(
  description: string,
  transactionType: TransactionType,
  dbCategories: Category[],
  businessRules: BusinessCategoryRule[] = []
): CategorizationResult {

  const descLower = description.toLowerCase().trim();

  // --- PASS 1: Tenant-specific saved rules ---
  for (const rule of businessRules) {
    if (descLower.includes(rule.pattern.toLowerCase())) {
      return { categoryId: rule.categoryId, reviewStatus: "HUMAN_RESOLVED" };
    }
  }

  // --- PASS 2: Standard regex rules ---
  const rulesToUse = transactionType === 'INCOME' ? incomeRules : expenseRules;

  for (const [slug, regex] of Object.entries(rulesToUse)) {
    if (regex.test(description)) {
      const foundCat = dbCategories.find(c => c.slug === slug);
      if (foundCat) {
        return { categoryId: foundCat.id, reviewStatus: "AUTO_CATEGORIZED" };
      }
    }
  }

  // --- PASS 3: No match — flag for human review ---
  return { categoryId: null, reviewStatus: "PENDING_REVIEW" };
}
