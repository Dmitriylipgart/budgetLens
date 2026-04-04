import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatAmount } from '@common/utils/';
import { getCategoryColor } from '@common/utils/';
import type { CategorySummary } from '@common/types';

interface Props {
  data: CategorySummary[];
  loading: boolean;
}

export function TopCategories({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
        <div className="h-4 w-32 rounded bg-gray-200 mb-4" />
        <div className="h-64 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  const chartData = data.slice(0, 8).map((c) => ({
    name: c.category.length > 22 ? c.category.substring(0, 20) + '…' : c.category,
    amount: c.totalAmount,
    fullName: c.category,
  }));

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Top Categories</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
          <XAxis
            type="number"
            tickFormatter={(v) => formatAmount(v)}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <Tooltip
            formatter={(value: number) => [`${formatAmount(value)} BYN`, 'Spent']}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={getCategoryColor(entry.fullName)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
