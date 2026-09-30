import { useState, useEffect } from 'react';
import { AppManifest } from '../apps';
import { fetchAppsService } from '../../services/appService';

export function useApps() {
  const [apps, setApps] = useState<AppManifest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchApps() {
      try {
        const appsData = await fetchAppsService();
        if (isMounted) {
          setApps(appsData);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error(err);
          setError(err instanceof Error ? err.message : 'An error occurred');
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
