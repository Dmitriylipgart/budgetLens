import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatAmount, formatDate } from '@common/utils/';
import type { TrendPoint } from '@common/types';

interface Props {
  data: TrendPoint[];
  loading: boolean;
}

export function SpendingTrend({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
        <div className="h-4 w-32 rounded bg-gray-200 mb-4" />
        <div className="h-64 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Spending Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="period"
            tickFormatter={(v) => {
              if (v.length === 10) return formatDate(v).substring(0, 5);
              return v;
            }}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            tickFormatter={(v) => formatAmount(v)}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            width={80}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              `${formatAmount(value)} BYN`,
              name === 'expense' ? 'Expense' : 'Income',
            ]}
            labelFormatter={(label) => (label.length === 10 ? formatDate(label) : label)}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#ef4444"
            fill="url(#expenseGrad)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            fill="url(#incomeGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
