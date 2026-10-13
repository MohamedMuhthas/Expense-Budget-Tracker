import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';

export default function useTransactions(filters) {
  const [result, setResult] = useState({ data: [], page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const queryString = useMemo(() => new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined && value !== null),
  ).toString(), [filters]);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/transactions${queryString ? `?${queryString}` : ''}`, { signal: controller.signal });
        setResult(data);
      } catch (requestError) {
        if (requestError.name !== 'CanceledError' && requestError.code !== 'ERR_CANCELED') {
          setError(requestError.response?.data?.message || 'Could not load transactions. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [queryString, revision]);

  return { ...result, loading, error, refresh };
}
