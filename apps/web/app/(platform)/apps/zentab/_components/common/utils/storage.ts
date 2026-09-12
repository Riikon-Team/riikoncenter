/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safely parse values from LocalStorage with a generic validator
 */
export function safeGetLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage:`, error);
  }
  return defaultValue;
}
