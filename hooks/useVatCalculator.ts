import { useMemo } from 'react';

export function useVatCalculator(transactions: any[]) {
  // Standard Nigerian VAT rate
  const VAT_RATE = 0.075; 

  return useMemo(() => {
    let totalOutputVat = 0; // VAT collected from customers (Income)
    let totalInputVat = 0;  // VAT paid on purchases (Expenses)

    transactions.forEach((t) => {
      // We ONLY calculate VAT for transactions explicitly marked as TAGGED
      if (t.vatStatus === 'TAGGED') {
        
        // Gap Handling: If your backend sends an exact 'vatAmount', we use it. 
        // Otherwise, we dynamically calculate 7.5% of the total amount.
        const vatAmount = t.vatAmount ? Number(t.vatAmount) : Number(t.amount) * VAT_RATE;

        if (t.type === 'INCOME') {
          totalOutputVat += vatAmount;
        } else if (t.type === 'EXPENSE') {
          totalInputVat += vatAmount;
        }
      }
    });

    // Net VAT payable = Output VAT - Input VAT
    const netVatPayable = totalOutputVat - totalInputVat;

    return {
      totalOutputVat,
      totalInputVat,
      netVatPayable
    };
  }, [transactions]); // Re-runs instantly whenever the transactions array changes
}