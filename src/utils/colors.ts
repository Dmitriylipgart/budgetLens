const CATEGORY_COLORS: Record<string, string> = {
  'Магазины продуктовые': '#10b981',
  'Ресторация / бары / кафе': '#f59e0b',
  'Переводы с карты на карту': '#6366f1',
  'Денежные переводы': '#8b5cf6',
  'Поставщик  услуг': '#3b82f6',
  'Магазины одежды': '#ec4899',
  'Магазины обуви': '#f43f5e',
  Аптеки: '#14b8a6',
  'Медицинский сервис': '#06b6d4',
  'Ветеринарный сервис': '#22d3ee',
  Развлечения: '#a855f7',
  'Снятие наличных': '#64748b',
  'Различные магазины': '#f97316',
  'Интернет-магазины': '#fb923c',
  'Цифровые товары': '#38bdf8',
  'Магазины хозтоваров': '#84cc16',
  'Бизнес услуги': '#78716c',
  'Автозапчасти / ремонт авто': '#71717a',
  Прочее: '#94a3b8',
};

const FALLBACK_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

let fallbackIdx = 0;

export function getCategoryColor(category: string): string {
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  const color = FALLBACK_COLORS[fallbackIdx % FALLBACK_COLORS.length];
  fallbackIdx++;
  return color;
}

export { CATEGORY_COLORS };
