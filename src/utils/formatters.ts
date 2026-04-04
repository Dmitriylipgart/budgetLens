/**
 * Format amount as Belarusian locale: "2 912,53"
 */
export function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  const parts = abs.toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${amount < 0 ? '-' : ''}${intPart},${parts[1]}`;
}

/**
 * Format amount with BYN suffix and color hint.
 */
export function formatBYN(amount: number): string {
  return `${formatAmount(amount)} BYN`;
}

/**
 * Format ISO date to DD.MM.YYYY
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = isoDate.substring(0, 10); // YYYY-MM-DD
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

/**
 * Format ISO datetime to DD.MM.YYYY HH:MM
 */
export function formatDateTime(isoDate: string): string {
  if (!isoDate) return '';
  const date = formatDate(isoDate);
  const time = isoDate.substring(11, 16); // HH:MM
  return time ? `${date} ${time}` : date;
}

/**
 * Get start/end of current month as ISO dates.
 */
export function getCurrentMonth(): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * Get start/end of last month.
 */
export function getLastMonth(): { from: string; to: string } {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const y = prev.getFullYear();
  const m = String(prev.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y, prev.getMonth() + 1, 0).getDate();
  return {
    from: `${y}-${m}-01`,
    to: `${y}-${m}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * Get last N months range.
 */
export function getLastNMonths(n: number): { from: string; to: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - n + 1, 1);
  const y1 = start.getFullYear();
  const m1 = String(start.getMonth() + 1).padStart(2, '0');
  const y2 = now.getFullYear();
  const m2 = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(y2, now.getMonth() + 1, 0).getDate();
  return {
    from: `${y1}-${m1}-01`,
    to: `${y2}-${m2}-${String(lastDay).padStart(2, '0')}`,
  };
}
