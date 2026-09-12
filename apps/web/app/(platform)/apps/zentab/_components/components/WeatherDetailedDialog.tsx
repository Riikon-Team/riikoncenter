/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { X, Sun, Cloud, CloudRain, Wind, Eye, Droplets, Compass } from 'lucide-react';
import { AppSettings, WeatherMetrics, WeatherTranslation } from '../types';
import { useTranslation } from 'react-i18next';
import { fetchWeatherFromWttr } from '../common/utils';

interface WeatherDetailedDialogProps {
  settings: AppSettings;
  onClose: () => void;
}

export default function WeatherDetailedDialog({ settings, onClose }: WeatherDetailedDialogProps) {
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

  const displayTemp = (temp: number) => {
    if (settings.weatherUnit === 'F') {
      return Math.round((temp * 9) / 5 + 32) + '°F';
    }
    return temp + '°C';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fade-in" id="weather-det-overlay">
      <div className="glass-dialog w-full max-w-lg rounded-2xl p-6 relative flex flex-col animate-slide-up" id="weather-det-box">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4" id="weather-det-header">
          <div className="text-left">
            <span className="font-display text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{t.localClimate}</span>
            <h3 className="font-heading font-semibold text-lg text-white" id="weather-det-title">
              {settings.weatherCity} — {t.detailedTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Big Temperature Info */}
        <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-xl p-5 mb-4" id="weather-det-temperature-block">
          <div className="text-left" id="weather-det-left">
            <span className="font-display text-[48px] font-extrabold text-white leading-none tracking-tight block">
              {displayTemp(data.temp)}
            </span>
            <span className="text-xs text-slate-300 font-sans mt-2 block">
              ● {t.statusLabel}: {data.condition}
            </span>
          </div>
          <div className="text-right text-xs text-slate-400 font-sans space-y-1 align-middle" id="weather-det-right">
            <div>{t.highTemp}: <strong className="text-white">{displayTemp(data.high)}</strong></div>
            <div>{t.lowTemp}: <strong className="text-white">{displayTemp(data.low)}</strong></div>
            <div className="text-[10px] text-amber-300/80 font-medium pt-1">{t.updatedRealtime}</div>
          </div>
        </div>

        {/* Detailed parameters GRID */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-left" id="weather-det-grid-boxes">
          <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-xl flex items-center gap-3">
            <Wind size={18} className="text-blue-300" />
            <div className="text-left">
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">{t.windSpeedLabel}</span>
              <span className="block font-sans text-xs font-bold text-white mt-0.5">{data.windSpeed} km/h</span>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-xl flex items-center gap-3">
            <Droplets size={18} className="text-teal-300" />
            <div className="text-left">
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">{t.humidityLabel}</span>
              <span className="block font-sans text-xs font-bold text-white mt-0.5">{data.humidity}%</span>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-xl flex items-center gap-3">
            <Eye size={18} className="text-amber-300" />
            <div className="text-left">
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">{t.visibilityLabel}</span>
              <span className="block font-sans text-xs font-bold text-white mt-0.5">{data.visibility} km</span>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-3.5 rounded-xl flex items-center gap-3">
            <Compass size={18} className="text-purple-300" />
            <div className="text-left">
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">{t.uvLabel}</span>
              <span className="block font-sans text-xs font-bold text-white mt-0.5">{data.uvIndex} - {data.uvText}</span>
            </div>
          </div>
        </div>

        {/* Hours forecast */}
        <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl text-left" id="weather-det-hours-section">
          <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">{t.forecastTitle}</span>
          <div className="grid grid-cols-4 gap-2 text-center select-none" id="weather-det-hours-cols">
            {data.forecast.map((fc, i) => (
              <div key={i} className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="block text-[10px] text-slate-400 font-mono">{fc.time}</span>
                <span className="block text-xs font-bold text-white mt-1">{displayTemp(fc.temp)}</span>
                <span className="block text-[9px] text-slate-300 mt-1 uppercase font-mono max-w-full truncate block" title={fc.icon === 'rain' ? t.forecastIcons.rain : fc.icon === 'sunny' ? t.forecastIcons.sunny : t.forecastIcons.cloudy}>
                  {fc.icon === 'rain' ? t.forecastIcons.rain : fc.icon === 'sunny' ? t.forecastIcons.sunny : t.forecastIcons.cloudy}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Close triggers */}
        <button
          onClick={onClose}
          className="mt-5 w-full py-2 bg-white text-slate-950 font-heading font-semibold text-xs rounded-xl shadow hover:bg-slate-100 transition-colors cursor-pointer"
          id="weather-det-btn-close"
        >
          {t.closeLabel}
        </button>

      </div>
    </div>
  );
}
