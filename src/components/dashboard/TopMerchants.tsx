import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatAmount } from '../../utils/formatters';
import type { MerchantSummary } from '../../types';

interface Props {
  data: MerchantSummary[];
  loading: boolean;
}

export function TopMerchants({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
        <div className="h-4 w-32 rounded bg-gray-200 mb-4" />
        <div className="h-64 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  const chartData = data.slice(0, 10).map((m) => ({
    name: m.merchantName.length > 18 ? m.merchantName.substring(0, 16) + '…' : m.merchantName,
    amount: m.totalAmount,
    fullName: m.merchantName,
  }));

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Top Merchants</h3>
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
            width={120}
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <Tooltip
            formatter={(value: number) => [`${formatAmount(value)} BYN`, 'Spent']}
            labelFormatter={(label, payload) =>
              payload?.[0]?.payload?.fullName || label
            }
          />
          <Bar dataKey="amount" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
