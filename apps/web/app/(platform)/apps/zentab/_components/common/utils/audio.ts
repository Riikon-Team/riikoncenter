/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Extracts a friendly name from a custom audio web stream url
 */
export function parseCustomMusicName(urlStr: string): string {
  if (!urlStr) return '';
  try {
    const url = new URL(urlStr);
    const name = url.pathname.split('/').pop() || url.hostname;
    return name || 'Custom Stream';
  } catch {
    return 'Custom Link';
  }
}
