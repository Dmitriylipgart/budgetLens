import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { getLastMonth } from '../utils/formatters';

interface PeriodState {
  from: string;
  to: string;
  label: string;
}

interface PeriodContextValue {
  period: PeriodState;
  setPeriod: (from: string, to: string, label: string) => void;
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const defaultPeriod = getLastMonth();
  const [period, setPeriodState] = useState<PeriodState>({
    ...defaultPeriod,
    label: 'Last Month',
  });

  const setPeriod = useCallback((from: string, to: string, label: string) => {
    setPeriodState({ from, to, label });
  }, []);

  return <PeriodContext.Provider value={{ period, setPeriod }}>{children}</PeriodContext.Provider>;
}

export function usePeriod() {
  const ctx = useContext(PeriodContext);
  if (!ctx) throw new Error('usePeriod must be used within PeriodProvider');
  return ctx;
}
