/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AppSettings } from '../types';
import { formatDateByLocale } from '../common/utils';

interface ClockSectionProps {
  settings: AppSettings;
  widgetsVisible: boolean;
}

export default function ClockSection({ settings, widgetsVisible }: ClockSectionProps) {
  const [timeStr, setTimeStr] = useState('00:00');
  const [secStr, setSecStr] = useState('');
  const [ampmStr, setAmpmStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  const clockTimeFormat12h = settings.timeFormat12h;
  const clockLanguage = settings.language;
  const clockDateFormat = settings.clockDateFormat;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let ampm = '';

      if (clockTimeFormat12h) {
        ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
      }

      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const hourStr = hours.toString().padStart(2, '0');

      const timeCompiled = `${hourStr}:${minutes}`;
      setTimeStr(prev => prev === timeCompiled ? prev : timeCompiled);
      setSecStr(prev => prev === seconds ? prev : seconds);
      setAmpmStr(prev => prev === ampm ? prev : ampm);

      const dateCompiled = formatDateByLocale(now, clockDateFormat, clockLanguage);
      setDateStr(prev => prev === dateCompiled ? prev : dateCompiled);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [clockTimeFormat12h, clockLanguage, clockDateFormat]);

  const clockFontFamilyClass = 
    settings.clockFontFamily === 'heading' ? 'font-heading' :
    settings.clockFontFamily === 'mono' ? 'font-mono' :
    settings.clockFontFamily === 'space' ? 'font-space tracking-tight' :
    settings.clockFontFamily === 'playfair' ? 'font-playfair serif italic tracking-wide' :
    'font-sans';

  const clockParts = timeStr.split(':');
  const clockHourPart = clockParts[0] || '00';
  const clockMinutePart = clockParts[1] || '00';

  return (
    <motion.section 
      layout
      initial={false}
      animate={{
        scale: widgetsVisible ? 1.0 : 1.25,
        y: widgetsVisible ? 0 : -15,
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 18,
        mass: 0.8
      }}
      className="text-center select-none flex flex-col items-center justify-center origin-center"
      id="primary-clock-section"
    >
      <div className="flex items-baseline justify-center relative group select-none cursor-default" id="primary-display-clock-wrap">
        {settings.timeFormat12h && settings.clockShowAmPm && ampmStr && (
          <span className="font-sans font-semibold text-amber-300 uppercase text-[10px] sm:text-xs mr-2 self-end pb-2 sm:pb-3 animate-fade-in" id="clock-ampm">
            {ampmStr}
          </span>
        )}
        
        <h2
          className={`tracking-tight leading-none text-white text-[75px] sm:text-[105px] md:text-[115px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] transition-all duration-[600ms] flex items-center select-none ${clockFontFamilyClass} ${
            settings.clockFontWeight === 'light' ? 'font-light' :
            settings.clockFontWeight === 'regular' ? 'font-normal' :
            settings.clockFontWeight === 'medium' ? 'font-semibold' : 'font-extrabold'
          }`}
          id="focal-digital-time"
        >
          <span>{clockHourPart}</span>
          <span className={settings.clockBlinkDivider ? "animate-pulse duration-1000 mx-[1px] opacity-80" : "mx-[1px]"}>:</span>
          <span>{clockMinutePart}</span>
        </h2>

        {settings.showSeconds && secStr && (
          <span className="font-mono font-semibold text-xs sm:text-sm text-slate-400 ml-1 select-none self-end pb-2 sm:pb-3 animate-fade-in" id="clock-seconds">
            {secStr}
          </span>
        )}
      </div>

      {settings.clockShowDate && (
        <div
          className={`transition-all duration-700 font-sans block mx-auto select-none animate-fade-in ${
            widgetsVisible 
              ? 'text-xs text-slate-300 tracking-wide mt-2 font-medium opacity-85 hover:opacity-100' 
              : 'text-[10px] sm:text-[11px] text-amber-200 mt-6 tracking-[0.25em] uppercase font-bold bg-black/50 px-8 py-2 rounded-full border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          }`}
          id="clock-display-date"
        >
          {dateStr}
        </div>
      )}
    </motion.section>
  );
}
