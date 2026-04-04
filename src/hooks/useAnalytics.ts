import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { usePeriod } from './usePeriod';
import type { OverviewData, MerchantSummary, CategorySummary, TrendPoint } from '../types';

export function useOverview() {
  const { period } = usePeriod();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getOverview(period.from, period.to)
      .then((res) => setData(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period.from, period.to]);

  return { data, loading };
}

export function useTopMerchants(limit = 10) {
  const { period } = usePeriod();
  const [data, setData] = useState<MerchantSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getByMerchant(period.from, period.to, limit)
      .then((res) => setData(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period.from, period.to, limit]);

  return { data, loading };
}

export function useCategories() {
  const { period } = usePeriod();
  const [data, setData] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getByCategory(period.from, period.to)
      .then((res) => setData(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period.from, period.to]);

  return { data, loading };
}

export function useTrends(granularity: 'day' | 'week' | 'month' = 'day') {
  const { period } = usePeriod();
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTrends(period.from, period.to, granularity)
      .then((res) => setData(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period.from, period.to, granularity]);

  return { data, loading };
}
