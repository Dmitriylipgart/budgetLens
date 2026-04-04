import { formatAmount } from '@common/utils/';

interface Props {
  amount: number;
  currency?: string;
  showSign?: boolean;
  className?: string;
}

export function AmountDisplay({
  amount,
  currency = 'BYN',
  showSign = false,
  className = '',
}: Props) {
  const color = amount > 0 ? 'text-emerald-600' : amount < 0 ? 'text-red-600' : 'text-gray-700';
  const sign = showSign && amount > 0 ? '+' : '';
  return (
    <span className={`font-medium tabular-nums ${color} ${className}`}>
      {sign}
      {formatAmount(amount)} {currency}
    </span>
  );
}
