/**
 * Siro Tax Engine — Computes taxable income and company tax per CITA brackets.
 *
 * Formula:
 *   Gross Income = Sum of all INCOME transactions
 *   Allowable Deductions = Sum of EXPENSE transactions with a resolved category
 *     (AUTO_CATEGORIZED + HUMAN_RESOLVED — excludes PENDING_REVIEW)
 *   Taxable Income = Gross Income - Allowable Deductions
 *   Company Tax = Taxable Income × Rate (based on user-selected bracket)
 */

export type TaxBracket = "SMALL" | "MEDIUM" | "LARGE";

const TAX_RATES: Record<TaxBracket, number> = {
  SMALL: 0.0,    // Turnover < ₦25M — 0% CIT
  MEDIUM: 0.20,  // Turnover ₦25M–₦100M — 20% CIT
  LARGE: 0.30,   // Turnover > ₦100M — 30% CIT
};

export interface TaxComputationInput {
  transactions: Array<{
    type: "INCOME" | "EXPENSE";
    amount: number | string;
    categoryId: string | null;
    reviewStatus: "AUTO_CATEGORIZED" | "PENDING_REVIEW" | "HUMAN_RESOLVED";
  }>;
  taxBracket: TaxBracket;
}

export interface TaxComputationResult {
  grossIncome: number;
  totalDeductions: number;
  pendingDeductions: number; // deductions stuck in review (not applied)
  taxableIncome: number;
  taxRate: number;
  companyTax: number;
  effectiveRate: number;
}

export function computeTax({ transactions, taxBracket }: TaxComputationInput): TaxComputationResult {
  let grossIncome = 0;
  let totalDeductions = 0;
  let pendingDeductions = 0;

  for (const tx of transactions) {
    const amount = typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount;
    if (isNaN(amount)) continue;

    if (tx.type === "INCOME") {
      grossIncome += amount;
    } else if (tx.type === "EXPENSE") {
      // Only count as deduction if categorized (resolved by auto or human)
      if (tx.categoryId && tx.reviewStatus !== "PENDING_REVIEW") {
        totalDeductions += amount;
      } else {
        pendingDeductions += amount;
      }
    }
  }

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const taxRate = TAX_RATES[taxBracket] ?? TAX_RATES.SMALL;
  const companyTax = taxableIncome * taxRate;
  const effectiveRate = grossIncome > 0 ? companyTax / grossIncome : 0;

  return {
    grossIncome,
    totalDeductions,
    pendingDeductions,
    taxableIncome,
    taxRate,
    companyTax,
    effectiveRate,
  };
}
