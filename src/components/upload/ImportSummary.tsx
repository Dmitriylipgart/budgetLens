import { formatDate, formatAmount } from '../../utils/formatters';
import type { ImportResult } from '../../types';

interface Props {
  result: ImportResult;
}

export function ImportSummary({ result }: Props) {
  if (result.status === 'duplicate') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-800">Duplicate file</p>
        <p className="mt-1 text-sm text-amber-600">
          This statement has already been imported
          {result.period && ` (${formatDate(result.period.from)} — ${formatDate(result.period.to)})`}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-sm font-semibold text-emerald-800">Import successful!</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        {result.period && (
          <div>
            <p className="text-emerald-600">Period</p>
            <p className="font-medium text-emerald-900">
              {formatDate(result.period.from)} — {formatDate(result.period.to)}
            </p>
          </div>
        )}
        <div>
          <p className="text-emerald-600">Transactions</p>
          <p className="font-medium text-emerald-900">
            {result.transactionsImported} imported
            {result.transactionsSkipped ? `, ${result.transactionsSkipped} skipped` : ''}
          </p>
        </div>
        <div>
          <p className="text-emerald-600">New merchants</p>
          <p className="font-medium text-emerald-900">{result.newMerchants}</p>
        </div>
        <div>
          <p className="text-emerald-600">AI cost</p>
          <p className="font-medium text-emerald-900">
            {result.aiTokensUsed?.toLocaleString()} tokens ({result.aiModel})
          </p>
        </div>
        {result.processingMs && (
          <div>
            <p className="text-emerald-600">Processing time</p>
            <p className="font-medium text-emerald-900">
              {(result.processingMs / 1000).toFixed(1)}s
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
