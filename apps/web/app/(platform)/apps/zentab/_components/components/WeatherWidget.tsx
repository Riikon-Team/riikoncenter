/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, Eye, Droplets, Compass, CloudSnow, SunDim } from 'lucide-react';
import { AppSettings, WeatherMetrics, WeatherTranslation } from '../types';
import { useTranslation } from 'react-i18next';
import { fetchWeatherFromWttr } from '../common/utils';

interface WeatherWidgetProps {
  settings: AppSettings;
  onOpenDetailedWeather: () => void;
}

export default function WeatherWidget({ settings, onOpenDetailedWeather }: WeatherWidgetProps) {
  const { t: tHook, i18n } = useTranslation();
  const t = tHook('weather', { returnObjects: true }) as unknown as WeatherTranslation;

  const isEn = settings.language === 'en';
  const [data, setData] = useState<WeatherMetrics | null>(null);

  // Fetch real weather from wttr.in with localStorage cache
  useEffect(() => {
    let active = true;
    fetchWeatherFromWttr(settings.weatherCity, isEn).then(res => {
      if (active) {
        setData(res);
      }
    });

    return () => {
      active = false;
    };
  }, [settings.weatherCity, isEn, i18n.language]);

  if (!data) return null;

  // Convert default celsius if settings is 'F'
  const displayTemp = (temp: number) => {
    if (settings.weatherUnit === 'F') {
      return Math.round((temp * 9) / 5 + 32) + '°F';
    }
    return temp + '°C';
  };

  const getWeatherIcon = (cond: string, isBig = false) => {
    const size = isBig ? 36 : 18;
    const lower = cond.toLowerCase();
    if (lower.includes('nắng rực rỡ') || lower.includes('sunny')) {
      return <Sun size={size} className="text-amber-400 animate-spin-slow" id="weather-sun-icon" />;
    }
    if (lower.includes('nắng nhẹ') || lower.includes('light sun') || lower.includes('sundim')) {
      return <SunDim size={size} className="text-amber-300/80" id="weather-sun-dim-icon" />;
    }
    if (lower.includes('mưa') || lower.includes('showers') || lower.includes('rain')) {
      return <CloudRain size={size} className="text-blue-300 animate-pulse" id="weather-rain-icon" />;
    }
    if (lower.includes('tuyết') || lower.includes('snow') || lower.includes('frost')) {
      return <CloudSnow size={size} className="text-indigo-100" id="weather-snow-icon" />;
    }
    return <Cloud size={size} className="text-slate-300" id="weather-cloud-icon" />;
  };

  return (
    <div
      onClick={onOpenDetailedWeather}
      className="glass-card rounded-[16px] p-6 cursor-pointer flex flex-col justify-between h-full min-h-[180px] group relative overflow-hidden"
      id="weather-widget-container"
    >
      <div className="flex justify-between items-start" id="weather-card-header">
        <div className="text-left">
          <span className="font-display text-[11px] font-semibold text-slate-400 tracking-wider uppercase block" id="weather-title-label">
            {t.titleLabel}
          </span>
          <span className="font-display font-medium text-[20px] text-white mt-1 block group-hover:text-amber-300 transition-colors" id="weather-city-label">
            {settings.weatherCity}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform" id="weather-icon-wrapper">
          {getWeatherIcon(data.condition, false)}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mt-2" id="weather-current-temp-container">
        <span className="font-display text-[48px] font-extrabold text-white leading-none tracking-tight" id="weather-temp-span">
          {displayTemp(data.temp)}
        </span>
        <span className="font-sans text-[13px] text-slate-300 font-medium" id="weather-cond-span">
          • {data.condition}
        </span>
      </div>

      <div className="border-t border-white/5 pt-3 mt-3 flex justify-between text-slate-400 font-sans text-[11px]" id="weather-footer-row">
        <div className="flex gap-4" id="weather-forecast-temps">
          <span id="weather-temp-high">{t.highTemp}: {displayTemp(data.high)}</span>
          <span id="weather-temp-low">{t.lowTemp}: {displayTemp(data.low)}</span>
        </div>
        <span className="text-slate-400 group-hover:text-white transition-all font-medium flex items-center gap-1" id="weather-detail-trigger">
          {t.viewDetails}
        </span>
      </div>
    </div>
  );
}
