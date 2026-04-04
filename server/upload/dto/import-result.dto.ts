export class ImportResultDto {
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
