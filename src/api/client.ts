const BASE_URL = '/api';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Upload
  uploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE_URL}/upload/csv`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || 'Upload failed');
    }
    return res.json();
  },

  getUploads: () => request<any>('/upload/uploads'),

  // Transactions
  getTransactions: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/transactions${qs}`);
  },

  // Analytics
  getOverview: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString() ? '?' + params.toString() : '';
    return request<any>(`/analytics/overview${qs}`);
  },

  getByMerchant: (from?: string, to?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (limit) params.set('limit', String(limit));
    return request<any>(`/analytics/by-merchant?${params}`);
  },

  getByCategory: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return request<any>(`/analytics/by-category?${params}`);
  },

  getTrends: (from?: string, to?: string, granularity?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (granularity) params.set('granularity', granularity);
    return request<any>(`/analytics/trends?${params}`);
  },

  getRecent: () => request<any>('/analytics/recent'),

  // Merchants
  getMerchants: () => request<any>('/merchants'),
  getMerchant: (id: number) => request<any>(`/merchants/${id}`),
  updateMerchant: (id: number, data: any) =>
    request<any>(`/merchants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  mergeMerchants: (sourceId: number, targetId: number) =>
    request<any>('/merchants/merge', {
      method: 'POST',
      body: JSON.stringify({ sourceId, targetId }),
    }),

  // Statements
  getStatements: () => request<any>('/statements'),
  deleteStatement: (id: number) =>
    request<any>(`/statements/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request<any>('/settings'),
  setSetting: (key: string, value: string) =>
    request<any>(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    }),
};
