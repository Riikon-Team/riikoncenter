/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppSettings {
  primaryFont: string;
  headingFont: string;
  accentColor: string; // 'white' | 'blue' | 'green' | 'yellow' | 'pink'
  highContrast: boolean;
  timeFormat12h: boolean;
  showSeconds: boolean;
  clockFontWeight: 'light' | 'regular' | 'medium' | 'bold';
  clockFontFamily: 'sans' | 'heading' | 'mono' | 'space' | 'playfair';
  clockShowAmPm: boolean;
  clockBlinkDivider: boolean;
  clockShowDate: boolean;
  clockDateFormat: 'full' | 'short' | 'numeric';
  weatherCity: string;
  weatherUnit: 'C' | 'F';
  weatherRefreshMinutes: number;
  bgBlurIntensity: number; // in px
  bgImageIndex: number;
  customBgUrl?: string;
  customWallpapers: string[]; // Stores custom URLs and base64 uploaded images
  widgetsVisibility: {
    weather: boolean;
    focus: boolean;
    notes: boolean;
  };
  todoStrikeThrough: boolean;
  todoDensity: 'comfortable' | 'compact' | 'spacious';
  todoTrelloMode: boolean;
  todoAutoDelete: boolean;
  language: 'vi' | 'en';
}
