import { AppManifest } from "./apps";

// This file allows you to define local manifests for external repositories
// that do not have a riikoncenter-manifest.json file in their root.
// The key should be the exact repository name.
// These local configurations have lower priority than the remote manifest,
// but higher priority than the automatic fallback generation.

export const EXTERNAL_MANIFESTS: Record<string, Partial<AppManifest>> = {
  // Example:
  // "my-custom-repo": {
  //   category: "app",
  //   icon: "Rocket",
  //   bannerBg: "from-blue-500/20 to-purple-500/20"
  // }
};
