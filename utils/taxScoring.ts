export function calculateTaxReadinessScore(transactions: any[]) {
  if (!transactions || transactions.length === 0) return 0;

  const totalTxns = transactions.length;

  // 1. Calculate completion counts
  // A transaction is compliant for VAT if it is explicitly TAGGED or EXEMPT
  const vatTaggedCount = transactions.filter(t => t.vatStatus === 'TAGGED' || t.vatStatus === 'EXEMPT').length;
  
  // A transaction is compliant for category if it has a categoryId
  const categorizedCount = transactions.filter(t => t.categoryId).length;
  
  // A transaction is compliant for documentation if it has a document attached OR came directly from the bank
  const documentedCount = transactions.filter(t => t.document || t.source === 'MONO').length;

  // 2. Find the ratios (0.0 to 1.0)
  const vatRatio = vatTaggedCount / totalTxns;
  const catRatio = categorizedCount / totalTxns;
  const docRatio = documentedCount / totalTxns;

  // 3. Apply the Founder's 40-35-25 weights
  let rawScore = (vatRatio * 40) + (catRatio * 35) + (docRatio * 25);

  // 4. Apply the FIRS Penalty "Floor" Rule
  // If they have categorized less than 50% of their VAT, cap the score at 50 max.
  if (vatRatio < 0.50) {
    rawScore = Math.min(rawScore, 50); 
  }

  // Return a clean whole number
  return Math.round(rawScore);
}