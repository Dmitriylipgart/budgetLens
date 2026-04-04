import { useState, useRef, useEffect } from 'react';
import { usePeriod } from '../../hooks/usePeriod';
import { getCurrentMonth, getLastMonth, getLastNMonths, formatDate } from '@common/utils/';

const presets = [
  { label: 'This Month', fn: getCurrentMonth },
  { label: 'Last Month', fn: getLastMonth },
  { label: 'Last 3 Months', fn: () => getLastNMonths(3) },
  { label: 'Last 6 Months', fn: () => getLastNMonths(6) },
  {
    label: 'This Year',
    fn: () => {
      const y = new Date().getFullYear();
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    },
  },
];

export function PeriodSelector() {
  const { period, setPeriod } = usePeriod();
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePreset = (label: string, fn: () => { from: string; to: string }) => {
    const { from, to } = fn();
    setPeriod(from, to, label);
    setOpen(false);
  };

  const handleCustom = () => {
    if (customFrom && customTo) {
      setPeriod(customFrom, customTo, 'Custom');
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
      >
        <span>📅</span>
        <span>{period.label}</span>
        <span className="text-xs text-gray-400">
          {formatDate(period.from)} — {formatDate(period.to)}
        </span>
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="space-y-1">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => handlePreset(p.label, p.fn)}
                className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                  period.label === p.label
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <p className="mb-2 text-xs font-medium text-gray-500">Custom range</p>
            <div className="flex gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </div>
            <button
              onClick={handleCustom}
              disabled={!customFrom || !customTo}
              className="mt-2 w-full rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
