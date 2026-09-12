/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string; // e.g. Work, Dev, Social, Design, News
  iconName?: string; // Lucide icon identifier
}
