// DTOs for validating the Claude API response after parsing a bank CSV.
// These mirror the output schema defined in SKILL.md.

export interface ParsedStatement {
  bank: string;
  period: { from: string; to: string };
  generatedAt?: string;
  contractNumber?: string;
  currency: string;
  openingBalance?: number;
  closingBalance?: number;
  totalIncome?: number;
  totalExpense?: number;
  cardholder?: string;
}

export interface ParsedCard {
  cardNumber: string;
  cardType?: string;
  transactionCount: number;
}

export interface ParsedTransaction {
  id: string;
  date: string;
  settledDate?: string;
  rawDescription: string;
  merchant: string;
  merchantConfidence: 'high' | 'low';
  amount: number;
  currency: string;
  accountAmount: number;
  fee: number;
  bankCategory?: string;
  direction: 'income' | 'expense';
  card?: string;
  isBlocked: boolean;
}

export interface ParsedBlockedTransaction {
  id: string;
  date: string;
  rawDescription: string;
  merchant: string;
  merchantConfidence: 'high' | 'low';
  amount: number;
  currency: string;
  holdAmount: number;
  holdCurrency: string;
  bankCategory?: string;
  card?: string;
}

export interface ParsedMerchantSummary {
  merchant: string;
  totalAmount: number;
  transactionCount: number;
  bankCategories: string[];
}

export interface ParseResult {
  statement: ParsedStatement;
  cards?: ParsedCard[];
  transactions: ParsedTransaction[];
  blockedTransactions?: ParsedBlockedTransaction[];
  merchantSummary?: ParsedMerchantSummary[];
}

/**
 * Validates the parsed result from Claude API response.
 * Returns an array of error messages (empty if valid).
 */
export function validateParseResult(data: any): string[] {
  const errors: string[] = [];

  if (!data) {
    errors.push('Response is null or undefined');
    return errors;
  }

  // Statement validation
  if (!data.statement) {
    errors.push('Missing "statement" object');
  } else {
    if (!data.statement.period?.from || !data.statement.period?.to) {
      errors.push('Missing statement.period.from or period.to');
    }
    if (!data.statement.currency) {
      errors.push('Missing statement.currency');
    }
  }

  // Transactions validation
  if (!Array.isArray(data.transactions)) {
    errors.push('Missing or invalid "transactions" array');
  } else if (data.transactions.length === 0) {
    errors.push('Transactions array is empty');
  } else {
    for (let i = 0; i < data.transactions.length; i++) {
      const txn = data.transactions[i];
      if (!txn.date) errors.push(`Transaction ${i}: missing date`);
      if (!txn.rawDescription) errors.push(`Transaction ${i}: missing rawDescription`);
      if (typeof txn.amount !== 'number') errors.push(`Transaction ${i}: amount is not a number`);
      if (typeof txn.accountAmount !== 'number')
        errors.push(`Transaction ${i}: accountAmount is not a number`);
      if (!txn.direction || !['income', 'expense'].includes(txn.direction))
        errors.push(`Transaction ${i}: invalid direction "${txn.direction}"`);
      if (!txn.merchant) errors.push(`Transaction ${i}: missing merchant`);
    }
  }

  return errors;
}
