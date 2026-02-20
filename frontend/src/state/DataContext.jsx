import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async ({signal} = {}) => {
    const res = await fetch('/api/items?limit=500', { signal }); // Intentional bug: backend ignores limit 
    const json = await res.json();
    if (signal?.aborted) return;
    setItems(json);
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);