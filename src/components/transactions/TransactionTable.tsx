import { AmountDisplay } from '../shared/AmountDisplay';
import { formatDateTime } from '../../utils/formatters';
import type { TransactionItem } from '../../types';

interface Props {
  transactions: TransactionItem[];
  loading: boolean;
}

export function TransactionTable({ transactions, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <div className="animate-pulse p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Merchant</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Description</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                  {formatDateTime(txn.date)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{txn.merchant?.name || '—'}</td>
                <td
                  className="px-4 py-3 max-w-xs truncate text-gray-500"
                  title={txn.rawDescription}
                >
                  {txn.rawDescription}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <AmountDisplay amount={txn.accountAmount} currency="BYN" />
                </td>
                <td className="px-4 py-3 text-gray-500">
                  <span className="inline-block max-w-[180px] truncate text-xs">
                    {txn.bankCategory || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
