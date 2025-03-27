import { useState, useEffect } from 'react';

/**
 * Custom hook for data fetching with loading and error states
 * @param fetchFn The async function to fetch data
 * @param dependencies Optional array of dependencies that trigger a refetch when changed
 * @returns Object containing data, loading state, error state, and a refetch function
 */
export function useFetch<T>(fetchFn: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Unknown error'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
