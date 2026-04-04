import { useMerchants } from '../hooks/useMerchants';
import { formatAmount } from '../utils/formatters';
import { EmptyState } from '../components/shared/EmptyState';
import { useNavigate } from 'react-router-dom';

export function Merchants() {
  const { merchants, loading } = useMerchants();
  const navigate = useNavigate();

  if (!loading && merchants.length === 0) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">Merchants</h1>
        <EmptyState
          icon="🏪"
          title="No merchants yet"
          description="Upload a bank statement to populate merchants."
          action={{ label: 'Upload CSV', onClick: () => navigate('/upload') }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Merchants</h1>

      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Merchant</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Total Spent</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Transactions</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 rounded bg-gray-200 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-10 rounded bg-gray-200 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              : merchants.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {m.icon && <span className="mr-1">{m.icon}</span>}
                        {m.displayName || m.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-red-600">
                      {formatAmount(m.totalAmount)} BYN
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{m.transactionCount}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{m.categoryGroup || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          m.confidence === 'high' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {m.confidence}
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
