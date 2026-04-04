import { useCategories } from '../hooks/useAnalytics';
import { formatAmount } from '../utils/formatters';
import { getCategoryColor } from '../utils/colors';

export function Categories() {
  const { data, loading } = useCategories();

  const total = data.reduce((sum, c) => sum + c.totalAmount, 0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Categories</h1>

      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">%</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Transactions</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 rounded bg-gray-200 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-10 rounded bg-gray-200 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-10 rounded bg-gray-200 ml-auto" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-full rounded bg-gray-200" />
                    </td>
                  </tr>
                ))
              : data.map((c) => {
                  const pct = total > 0 ? (c.totalAmount / total) * 100 : 0;
                  return (
                    <tr key={c.category} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: getCategoryColor(c.category) }}
                          />
                          {c.category}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-700">
                        {formatAmount(c.totalAmount)} BYN
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">{pct.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right text-gray-500">{c.transactionCount}</td>
                      <td className="px-4 py-3">
                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: getCategoryColor(c.category),
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
