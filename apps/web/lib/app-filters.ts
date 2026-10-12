import { AppManifest } from "./apps";

/**
 * List of domains / substrings that should be filtered out from external application listings.
 * Any app whose repoUrl, homepage, or iframeUrl matches one of these rules will be excluded.
 */
export const BLOCKED_URL_PATTERNS: string[] = [
  "npmjs.com",
  "npmjs.org",
  "riikon04.github.io",
];

/**
 * List of repository names or app identifiers that should be excluded.
 */
export const BLOCKED_APP_NAMES_OR_IDS: string[] = [
  "riikon04.github.io",
];

/**
 * Repositories or app IDs that should NOT have an iframe embed / "Use Now" action.
 * For these apps, even if GitHub reports a homepage URL, they will not be assigned an iframeUrl.
 */
export const NO_IFRAME_APP_IDS: string[] = [
  "register",
  "riko-check",
];

/**
 * Checks whether an app should have iframe embedding disabled.
 */
export function isIframeDisabled(appIdOrRepoName?: string | null): boolean {
  if (!appIdOrRepoName) return false;
  const lower = appIdOrRepoName.toLowerCase();
  return NO_IFRAME_APP_IDS.some((id) => lower === id.toLowerCase());
}

/**
 * Checks whether a given URL matches any blocked pattern.
 */
export function isUrlBlocked(url?: string | null): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return BLOCKED_URL_PATTERNS.some((pattern) => lowerUrl.includes(pattern.toLowerCase()));
}

/**
 * Checks whether a repository name or app identifier is blocked.
 */
export function isNameBlocked(nameOrId?: string | null): boolean {
  if (!nameOrId) return false;
  const lower = nameOrId.toLowerCase();
  return BLOCKED_APP_NAMES_OR_IDS.some((pattern) => lower.includes(pattern.toLowerCase()));
}

/**
 * Filter function to check if an app should be excluded based on blocked URLs, names, or IDs.
 */
export function isAppAllowed(app: AppManifest): boolean {
  if (isNameBlocked(app.id) || isNameBlocked(app.name)) return false;
  if (isUrlBlocked(app.repoUrl)) return false;
  if (isUrlBlocked(app.iframeUrl)) return false;
  if (isUrlBlocked(app.entryPath)) return false;
  return true;
}
