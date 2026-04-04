import { formatAmount } from '../../utils/formatters';
import type { OverviewData } from '../../types';

interface Props {
  data: OverviewData | null;
  loading: boolean;
}

export function SummaryCards({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-white p-5 shadow-sm border border-gray-200"
          >
            <div className="h-3 w-20 rounded bg-gray-200 mb-3" />
            <div className="h-7 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Income',
      value: data.totalIncome,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: '↗',
    },
    {
      label: 'Expense',
      value: data.totalExpense,
      color: 'text-red-600',
      bg: 'bg-red-50',
      icon: '↘',
    },
    {
      label: 'Net Change',
      value: data.netChange,
      color: data.netChange >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: data.netChange >= 0 ? 'bg-emerald-50' : 'bg-red-50',
      icon: data.netChange >= 0 ? '📈' : '📉',
    },
    {
      label: 'Transactions',
      value: data.transactionCount,
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      icon: '🔢',
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg} text-sm`}
            >
              {card.icon}
            </span>
          </div>
          <p className={`mt-2 text-2xl font-bold tabular-nums ${card.color}`}>
            {card.isCount ? card.value : `${formatAmount(card.value)} BYN`}
          </p>
        </div>
      ))}
    </div>
  );
}
