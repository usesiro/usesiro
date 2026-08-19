// These values were cross-checked against multiple 2025–2026 legal sources as of Aug 2026,
// but must be reconfirmed against the gazetted Act text or a tax professional before use in real client filings.
export const TAX_CONFIG = {
  SMALL_COMPANY_TURNOVER_THRESHOLD: 50_000_000,
  SMALL_COMPANY_FIXED_ASSET_THRESHOLD: 250_000_000,
  STANDARD_CIT_RATE: 0.30, // TODO: verify — one source cites 25% above threshold, confirm before production
  SMALL_COMPANY_CIT_RATE: 0,
  DEVELOPMENT_LEVY_RATE: 0.04,
  VAT_RATE: 0.075,
  VAT_REGISTRATION_THRESHOLD: 25_000_000,
} as const;

export type TaxTransaction = {
  amount: number | string | { toString(): string };
  type: "INCOME" | "EXPENSE" | string;
  vatStatus?: "TAGGED" | "MISSING_VAT" | "EXEMPT" | string | null;
  description?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
  categoryName?: string | null;
};

export type BusinessTaxProfile = {
  annualTurnover: number;
  fixedAssets: number;
  isProfessionalServices: boolean;
};

const DISALLOWABLE_PATTERNS = [
  /personal|domestic|private expense/i,
  /capital withdrawal|owner withdrawal|drawings?/i,
  /fine|penalt(?:y|ies)/i,
  /non[- ]business|not business related/i,
];

function isDisallowableExpense(transaction: TaxTransaction) {
  const classification = [
    transaction.description,
    transaction.category?.name,
    transaction.category?.slug,
    transaction.categoryName,
  ].filter(Boolean).join(" ");
  return DISALLOWABLE_PATTERNS.some((pattern) => pattern.test(classification));
}

export function calculateTaxMetrics(
  transactions: TaxTransaction[],
  businessProfile: BusinessTaxProfile,
) {
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const expenseTransactions = transactions.filter((transaction) => transaction.type === "EXPENSE");
  const totalExpenses = expenseTransactions.reduce((total, transaction) => total + Number(transaction.amount), 0);
  const allowableExpenses = expenseTransactions
    .filter((transaction) => !isDisallowableExpense(transaction))
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const exemptExpenses = expenseTransactions
    .filter((transaction) => transaction.vatStatus === "EXEMPT")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const taxableProfit = totalIncome - allowableExpenses;
  const isVatRegistered = businessProfile.annualTurnover >= TAX_CONFIG.VAT_REGISTRATION_THRESHOLD;
  const outputVat = isVatRegistered
    ? transactions.filter((transaction) => transaction.type === "INCOME" && transaction.vatStatus === "TAGGED")
      .reduce((total, transaction) => total + Number(transaction.amount) * TAX_CONFIG.VAT_RATE, 0)
    : 0;
  const inputVat = isVatRegistered
    ? expenseTransactions.filter((transaction) => transaction.vatStatus === "TAGGED")
      .reduce((total, transaction) => total + Number(transaction.amount) * TAX_CONFIG.VAT_RATE, 0)
    : 0;
  const netVatPayable = outputVat - inputVat;
  const isSmallCompany =
    businessProfile.annualTurnover <= TAX_CONFIG.SMALL_COMPANY_TURNOVER_THRESHOLD &&
    businessProfile.fixedAssets <= TAX_CONFIG.SMALL_COMPANY_FIXED_ASSET_THRESHOLD &&
    !businessProfile.isProfessionalServices;
  const positiveTaxableProfit = Math.max(0, taxableProfit);
  const cit = isSmallCompany ? 0 : positiveTaxableProfit * TAX_CONFIG.STANDARD_CIT_RATE;
  const developmentLevy = isSmallCompany ? 0 : positiveTaxableProfit * TAX_CONFIG.DEVELOPMENT_LEVY_RATE;

  return {
    totalIncome, totalExpenses, allowableExpenses, exemptExpenses, taxableProfit,
    isVatRegistered, outputVat, inputVat, netVatPayable, isSmallCompany, cit, developmentLevy,
  };
}
