import { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();
const DEFAULT_LIMIT = 10;

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async ({ page = 1, limit = DEFAULT_LIMIT, q = '', signal } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (q.trim()) {
      params.set('q', q.trim());
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/items?${params.toString()}`, { signal });
      if (!res.ok) {
        throw new Error(`Failed to fetch items (${res.status})`);
      }
      const json = await res.json();
      if (signal?.aborted) return;
      setItems(Array.isArray(json.items) ? json.items : []);
      setPagination(
        json.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (!signal?.aborted) {
        setError(err.message || 'Failed to load items');
      }
      throw err;
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, pagination, loading, error, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);