import { PeriodSelector } from './PeriodSelector';

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />
      <PeriodSelector />
    </header>
  );
}
