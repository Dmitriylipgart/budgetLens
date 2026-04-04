import { useState } from 'react';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { FilterBar } from '../components/transactions/FilterBar';
import { EmptyState } from '../components/shared/EmptyState';
import { useTransactions } from '../hooks/useTransactions';
import { usePeriod } from '../hooks/usePeriod';

export function Transactions() {
  const { period } = usePeriod();
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const [direction, setDirection] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { items, total, totalPages, loading, error } = useTransactions({
    from,
    to,
    direction: direction || undefined,
    search: search || undefined,
    page,
    limit: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Transactions</h1>

      <FilterBar
        from={from}
        to={to}
        direction={direction}
        search={search}
        onFromChange={setFrom}
        onToChange={setTo}
        onDirectionChange={(d) => {
          setDirection(d);
          setPage(1);
        }}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
      />

      {items.length === 0 && !loading ? (
        <EmptyState
          icon="📋"
          title="No transactions found"
          description="Try adjusting your filters or upload a bank statement."
        />
      ) : (
        <TransactionTable transactions={items} loading={loading} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
