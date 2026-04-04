import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { TransactionItem } from '@common/types';

interface TransactionFilters {
  from?: string;
  to?: string;
  merchantId?: string;
  category?: string;
  direction?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}

interface TransactionResult {
  items: TransactionItem[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTransactions(filters: TransactionFilters): TransactionResult {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string> = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.merchantId) params.merchantId = filters.merchantId;
    if (filters.category) params.category = filters.category;
    if (filters.direction) params.direction = filters.direction;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
    if (filters.sort) params.sort = filters.sort;
    if (filters.order) params.order = filters.order;

    api
      .getTransactions(params)
      .then((res) => {
        const payload = res.data || res;
        setItems(payload.data || payload);
        const meta = payload.meta || res.meta;
        if (meta) {
          setTotal(meta.total);
          setPage(meta.page);
          setTotalPages(meta.totalPages);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [
    filters.from,
    filters.to,
    filters.merchantId,
    filters.category,
    filters.direction,
    filters.search,
    filters.page,
    filters.limit,
    filters.sort,
    filters.order,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { items, total, page, totalPages, loading, error, refetch: fetchData };
}
