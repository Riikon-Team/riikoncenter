import { useState, useEffect } from 'react';
import { AppManifest } from '../apps';

export function useApps() {
  const [apps, setApps] = useState<AppManifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchApps() {
      try {
        const res = await fetch('/api/apps');
        if (!res.ok) {
          throw new Error('Failed to fetch apps');
        }
        const data = await res.json();
        
        if (isMounted) {
          setApps(data.apps || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(err);
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchApps();

    return () => {
      isMounted = false;
    };
  }, []);

  return { apps, isLoading, error };
}
