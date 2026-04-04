interface Props {
  from: string;
  to: string;
  direction: string;
  search: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onDirectionChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

export function FilterBar({
  from,
  to,
  direction,
  search,
  onFromChange,
  onToChange,
  onDirectionChange,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        {['all', 'expense', 'income'].map((d) => (
          <button
            key={d}
            onClick={() => onDirectionChange(d === 'all' ? '' : d)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              (d === 'all' && !direction) || direction === d
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {d === 'all' ? 'All' : d === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm placeholder-gray-400"
        />
      </div>
    </div>
  );
}
