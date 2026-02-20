import { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, pagination, loading, error, fetchItems } = useData();
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const controller = new AbortController();

    // Intentional bug: setState called after component unmount if request is slow
    fetchItems({ page, limit, q: query, signal: controller.signal }).catch((err) => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });

    // Clean‑up to avoid memory leak (candidate should implement)
    return () => {
      controller.abort();
    };
  }, [fetchItems, page, limit, query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setQuery(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    setQuery('');
    setPage(1);
  };

  const handleLimitChange = (e) => {
    setLimit(Number.parseInt(e.target.value, 10));
    setPage(1);
  };
  const canPrev = pagination.page > 1;
  const canNext = pagination.page < pagination.totalPages;
  return (
    <div style={{ padding: 16 }}>
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by typing..."
          aria-label="Search items"
        />
        <button type="submit">Search</button>
        <button type="button" onClick={handleClear}>Clear</button>

        <label htmlFor="items-limit" style={{ marginLeft: 8 }}>Per page:</label>
        <select id="items-limit" value={limit} onChange={handleLimitChange}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && <p>No items found.</p>}

      {!error && items.length > 0 && (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link to={'/items/' + item.id}>{item.name}</Link>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="button" onClick={() => setPage((p) => p - 1)} disabled={!canPrev || loading}>
          Prev
        </button>
        <span>
          Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
        </span>
        <button type="button" onClick={() => setPage((p) => p + 1)} disabled={!canNext || loading}>
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;