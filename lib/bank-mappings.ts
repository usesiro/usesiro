/**
 * Dictionary of column names used by major Nigerian banks for bank statements.
 * Matches these varied names to Siro's internal transaction fields.
 */
export const BANK_COLUMN_MAP: Record<string, string[]> = {
  date: [
    "date",
    "transaction date",
    "trans date",
    "value date",
    "txn date",
    "post date",
    "booking date",
    "trn date"
  ],
  description: [
    "description",
    "narration",
    "remarks",
    "transaction description",
    "trans particulars",
    "transaction narrative",
    "details",
    "payment details",
    "particulars",
    "item bought",
    "items"
  ],
  amount: [
    "amount",
    "transaction amount",
    "sum",
    "value",
    "tran_amt",
    "total amount"
  ],
  debit: [
    "debit",
    "withdrawals",
    "dr",
    "outcome",
    "payment",
    "debited",
    "debit amount"
  ],
  credit: [
    "credit",
    "deposits",
    "cr",
    "income",
    "receipt",
    "credited",
    "credit amount"
  ],
  balance: [
    "balance",
    "running balance",
    "outstanding balance",
    "closing balance",
    "bal",
    "book balance"
  ],
  reference: [
    "reference",
    "ref number",
    "doc number",
    "txn id",
    "transaction id",
    "ref",
    "instrument number",
    "reference id",
    "external id"
  ],
  notes: [
    "notes",
    "memo",
    "description",
    "comments"
  ],
  transaction_type: [
    "transaction type",
    "money in/out",
    "in/out",
    "direction",
    "movement",
    "type"
  ],
  category: [
    "category",
    "classification",
    "label"
  ]
};

/**
 * Standard Siro transaction fields that we try to map to.
 */
export type SiroField = keyof typeof BANK_COLUMN_MAP;

export const SIRO_FIELDS: SiroField[] = Object.keys(BANK_COLUMN_MAP) as SiroField[];
