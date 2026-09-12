export type AppManifest = {
  id: string;
  name: string;
  description: string;
  category: 'game' | 'app' | 'utility' | 'misc';
  type: 'builtin' | 'org_app' | 'third-party';
  icon: string;
  iconUrl?: string;
  version: string;
  author: string;
  entryPath: string;
  bannerBg?: string;
  thumbnail?: string;
  screenshots?: string[];
  tags?: string[];
  repoUrl?: string;
  stars?: number;
  forks?: number;
  status?: 'active' | 'deploying' | 'maintenance';
  readme?: string;
}
import zenTabManifest from '../app/(platform)/apps/zentab/riikoncenter-manifest.json';
import galaxyShooterManifest from '../app/(platform)/games/galaxy-shooter/riikoncenter-manifest.json';
import konnnsExtensionManifest from '../app/(platform)/apps/konnns-extension/riikoncenter-manifest.json';
import markdownConverterManifest from '../app/(platform)/apps/markdown-converter/riikoncenter-manifest.json';

// Built-in App Manifests
export const FALLBACK_BUILTIN_APPS: AppManifest[] = [
  zenTabManifest as AppManifest,
  galaxyShooterManifest as AppManifest,
  konnnsExtensionManifest as AppManifest,
  markdownConverterManifest as AppManifest
];

export function getBuiltinApps(): AppManifest[] {
  return FALLBACK_BUILTIN_APPS;
}
