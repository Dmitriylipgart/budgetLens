import { useState, useEffect } from 'react';
import { api } from '@api/client';
import { AmountDisplay } from '../shared/AmountDisplay';
import { formatDateTime } from '@common/utils/';

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getRecent()
      .then((res) => setTransactions((res.data || res).slice(0, 10)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
        <div className="h-4 w-40 rounded bg-gray-200 mb-4" />
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Recent Transactions</h3>
      <div className="space-y-2">
        {transactions.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {txn.merchant?.displayName ||
                  txn.merchant?.name ||
                  txn.rawDescription?.substring(0, 40)}
              </p>
              <p className="text-xs text-gray-400">{formatDateTime(txn.date)}</p>
            </div>
            <AmountDisplay amount={txn.accountAmount} className="ml-3 text-sm" />
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            No transactions yet. Upload a CSV to get started.
          </p>
        )}
      </div>
    </div>
  );
}
