import { useState, useEffect } from 'react';
import { api } from '../api/client';

export function useMerchants() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMerchants = () => {
    setLoading(true);
    api.getMerchants()
      .then((res) => setMerchants(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  return { merchants, loading, refetch: fetchMerchants };
}
