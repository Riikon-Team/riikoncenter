/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings } from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  primaryFont: 'Inter',
  headingFont: 'Geist',
  accentColor: 'yellow', // gold/yellow for zen warm vibe
  highContrast: false,
  timeFormat12h: false,
  showSeconds: true,
  clockFontWeight: 'medium',
  clockFontFamily: 'sans',
  clockShowAmPm: true,
  clockBlinkDivider: true,
  clockShowDate: true,
  clockDateFormat: 'full',
  weatherCity: 'Hà Nội',
  weatherUnit: 'C',
  weatherRefreshMinutes: 15,
  bgBlurIntensity: 10,
  bgImageIndex: 0,
  customWallpapers: [],
  widgetsVisibility: {
    weather: true,
    focus: true,
    notes: true
  },
  todoStrikeThrough: true,
  todoDensity: 'comfortable',
  todoTrelloMode: false,
  todoAutoDelete: false,
  language: 'vi'
};

export const WALLPAPER_PRESETS = [
  {
    name: "Vũ trụ Slate",
    nameEn: "Slate Universe",
    url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Hồ sương mờ",
    nameEn: "Mist Lake",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Rừng hoàng hôn",
    nameEn: "Sunset Forest",
    url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Sương tuyết trắng",
    nameEn: "White Frost",
    url: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1920&q=80"
  },
  {
    name: "Sa mạc thanh khiết",
    nameEn: "Pure Desert",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1920&q=80"
  }
];

export const ACCENT_COLORS = [
  { id: 'white', bg: 'bg-white', text: 'text-white font-medium', border: 'border-white', hex: '#FFFFFF' },
  { id: 'blue', bg: 'bg-blue-400', text: 'text-blue-400 font-medium', border: 'border-blue-400', hex: '#60A5FA' },
  { id: 'green', bg: 'bg-emerald-400', text: 'text-emerald-400 font-medium', border: 'border-emerald-400', hex: '#34D399' },
  { id: 'yellow', bg: 'bg-amber-300', text: 'text-amber-300 font-medium', border: 'border-amber-300', hex: '#FCD34D' },
  { id: 'pink', bg: 'bg-rose-400', text: 'text-rose-400 font-medium', border: 'border-rose-400', hex: '#F87171' },
  { id: 'violet', bg: 'bg-violet-400', text: 'text-violet-400 font-medium', border: 'border-violet-400', hex: '#A78BFA' }
];
