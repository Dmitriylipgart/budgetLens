import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PeriodProvider } from '../../hooks/usePeriod';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PeriodProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </PeriodProvider>
  );
}
