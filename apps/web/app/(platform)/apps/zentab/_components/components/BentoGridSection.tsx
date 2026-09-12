/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { AppSettings, Quote } from '../types';
import WeatherWidget from './WeatherWidget';
import FocusWidget from './FocusWidget';
import NotesWidget from './NotesWidget';

interface BentoGridSectionProps {
  settings: AppSettings;
  widgetSizes: {
    weather: { colSpan: number; height: number };
    focus: { colSpan: number; height: number };
    notes: { colSpan: number; height: number };
  };
  onStartResize: (
    widgetKey: 'weather' | 'focus' | 'notes',
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => void;
  onOpenDetailedWeather: () => void;
  quote: Quote;
  onRefreshQuote: () => void;
}

export default function BentoGridSection({
  settings,
  widgetSizes,
  onStartResize,
  onOpenDetailedWeather,
  quote,
  onRefreshQuote,
}: BentoGridSectionProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3" id="bento-layout-wrapper">
        
        {/* Weather Item */}
        {settings.widgetsVisibility.weather && (
          <div 
            style={{ height: `${widgetSizes.weather.height}px` }}
            className={`bg-slate-950/40 rounded-[16px] relative group/resizer transition-all duration-300 ${
              widgetSizes.weather.colSpan === 2 ? 'md:col-span-2' : 
              widgetSizes.weather.colSpan === 3 ? 'md:col-span-3' : 'md:col-span-1'
            }`}
            id="resizer-box-weather"
          >
            <WeatherWidget
              settings={settings}
              onOpenDetailedWeather={onOpenDetailedWeather}
            />
            <div 
              onMouseDown={(e) => onStartResize('weather', e)}
              onTouchStart={(e) => onStartResize('weather', e)}
              className="absolute bottom-2 right-2 w-5 h-5 cursor-se-resize flex items-end justify-end pointer-events-auto z-25 group-hover/resizer:opacity-80 opacity-0 transition-opacity select-none p-0.5"
              title={t('dragResizeTooltip') as string}
              id="resize-handle-weather"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-white/50 hover:text-white transition-colors">
                <path d="M12 4 L12 6 L6 12 L4 12 Z M12 8 L12 10 L10 12 L8 12 Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        )}

        {/* Focus Pomodoro Item */}
        {settings.widgetsVisibility.focus && (
          <div 
            style={{ height: `${widgetSizes.focus.height}px` }}
            className={`bg-slate-950/40 rounded-[16px] relative group/resizer transition-all duration-300 ${
              widgetSizes.focus.colSpan === 2 ? 'md:col-span-2' : 
              widgetSizes.focus.colSpan === 3 ? 'md:col-span-3' : 'md:col-span-1'
            }`}
            id="resizer-box-focus"
          >
            <FocusWidget settings={settings} />
            <div 
              onMouseDown={(e) => onStartResize('focus', e)}
              onTouchStart={(e) => onStartResize('focus', e)}
              className="absolute bottom-2 right-2 w-5 h-5 cursor-se-resize flex items-end justify-end pointer-events-auto z-25 group-hover/resizer:opacity-80 opacity-0 transition-opacity select-none p-0.5"
              title={t('dragResizeTooltip') as string}
              id="resize-handle-focus"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-white/50 hover:text-white transition-colors">
                <path d="M12 4 L12 6 L6 12 L4 12 Z M12 8 L12 10 L10 12 L8 12 Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        )}

        {/* Quick notepad memo Item */}
        {settings.widgetsVisibility.notes && (
          <div 
            style={{ height: `${widgetSizes.notes.height}px` }}
            className={`bg-slate-950/40 rounded-[16px] relative group/resizer transition-all duration-300 ${
              widgetSizes.notes.colSpan === 2 ? 'md:col-span-2' : 
              widgetSizes.notes.colSpan === 3 ? 'md:col-span-3' : 'md:col-span-1'
            }`}
            id="resizer-box-notes"
          >
            <NotesWidget settings={settings} />
            <div 
              onMouseDown={(e) => onStartResize('notes', e)}
              onTouchStart={(e) => onStartResize('notes', e)}
              className="absolute bottom-2 right-2 w-5 h-5 cursor-se-resize flex items-end justify-end pointer-events-auto z-25 group-hover/resizer:opacity-80 opacity-0 transition-opacity select-none p-0.5"
              title={t('dragResizeTooltip') as string}
              id="resize-handle-notes"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-white/50 hover:text-white transition-colors">
                <path d="M12 4 L12 6 L6 12 L4 12 Z M12 8 L12 10 L10 12 L8 12 Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        )}

      </div>

      {/* Motivational Zen quote trigger */}
      <motion.div 
        className="pt-6 pb-2 text-center select-none" 
        id="stage-banner-motivate"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button
          onClick={onRefreshQuote}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-slate-300 hover:text-white transition-all text-xs font-sans leading-relaxed group select-none cursor-pointer"
          id="motivational-phrase-btn"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-1" />
          <AnimatePresence mode="wait">
            <motion.span 
              key={quote.text}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.4 }}
              className="italic flex items-center gap-1"
            >
              "{quote.text}"
              <span className="text-slate-500 font-medium group-hover:text-amber-400 transition-colors ml-1">• {quote.author}</span>
            </motion.span>
          </AnimatePresence>
        </button>
      </motion.div>
    </>
  );
}
