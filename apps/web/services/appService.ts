import { AppManifest } from "../lib/apps";

export async function fetchAppsService(): Promise<AppManifest[]> {
  const res = await fetch('/api/apps');
  if (!res.ok) {
    throw new Error('Failed to fetch apps');
  }
  const data = await res.json();
  return data.apps || [];
}
