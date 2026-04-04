export interface TransactionItem {
  id: number;
  date: string;
  settledDate?: string;
  rawDescription: string;
  merchant: { id: number; name: string } | null;
  amount: number;
  currency: string;
  accountAmount: number;
  fee: number;
  bankCategory: string;
  direction: 'income' | 'expense';
  card?: string;
  isBlocked: boolean;
}

export interface OverviewData {
  totalIncome: number;
  totalExpense: number;
  netChange: number;
  transactionCount: number;
}

export interface MerchantSummary {
  merchantId: number;
  merchantName: string;
  icon?: string;
  totalAmount: number;
  transactionCount: number;
  avgAmount: number;
  lastTransaction: string;
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  transactionCount: number;
}

export interface TrendPoint {
  period: string;
  income: number;
  expense: number;
  transactionCount: number;
}

export interface ImportResult {
  status: 'success' | 'duplicate' | 'error';
  statementId?: number;
  period?: { from: string; to: string };
  transactionsImported?: number;
  transactionsSkipped?: number;
  newMerchants?: number;
  aiTokensUsed?: number;
  aiModel?: string;
  processingMs?: number;
  error?: string;
}

export interface UploadRecord {
  id: number;
  filename: string;
  status: string;
  txnCount?: number;
  aiTokensUsed?: number;
  aiModel?: string;
  processingMs?: number;
  createdAt: string;
  errorMessage?: string;
}
