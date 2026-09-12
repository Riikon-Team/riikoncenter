/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Zap } from 'lucide-react';
import { AppSettings, FocusTranslation } from '../types';
import { useTranslation } from 'react-i18next';

interface FocusWidgetProps {
  settings: AppSettings;
}

type TimerMode = 'work' | 'short_break' | 'long_break';

// Module-level state tracking that persists when component mounts/unmounts
// but resets only when the browser page is refreshed.
let globalSessionCompletedCount = 0;

// Pure utility functions placed outside the component to prevent recreation on every render
const getModeDuration = (m: TimerMode) => {
  switch (m) {
    case 'work': return 25 * 60;
    case 'short_break': return 5 * 60;
    case 'long_break': return 15 * 60;
  }
};

const formatTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
};

export default function FocusWidget({ settings }: FocusWidgetProps) {
  const { t: tHook } = useTranslation();
  const t = tHook('focus', { returnObjects: true }) as unknown as FocusTranslation;
  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [streakCount, setStreakCount] = useState(() => {
    return Number(localStorage.getItem('serene_pomodoro_streak') || '0');
  });
  const [sessionCompletedCount, setSessionCompletedCount] = useState(globalSessionCompletedCount);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSecondsLeft(getModeDuration(mode));
    // Stop timer when changing mode
    setIsActive(false);
  }, [mode]);

  const handleTimerCompleteRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            if (handleTimerCompleteRef.current) {
              handleTimerCompleteRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, mode]);

  // Update the ref to the latest handleTimerComplete on every render safely
  useEffect(() => {
    handleTimerCompleteRef.current = handleTimerComplete;
  });

  const handleTimerComplete = () => {
    if (soundEnabled) {
      // Play a soft synthetic elegant beep
      try {
        const audioCtxClass = window.AudioContext || (window as unknown as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (audioCtxClass) {
          const audioCtx = new audioCtxClass();
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(660, audioCtx.currentTime); // Mi note
          gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 1.2);
        }
      } catch (e) {
        console.warn("Audio Context init blocked or unavailable", e);
      }
    }

    if (mode === 'work') {
      const nextStreak = streakCount + 1;
      setStreakCount(nextStreak);
      localStorage.setItem('serene_pomodoro_streak', String(nextStreak));
      
      // Increment browser-session-only counter and update state
      globalSessionCompletedCount += 1;
      setSessionCompletedCount(globalSessionCompletedCount);

      // Auto transition to short break as a smart default
      setMode('short_break');
    } else {
      setMode('work');
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    // Soft click feedback
    if (soundEnabled) {
      try {
        const audioCtxClass = window.AudioContext || (window as unknown as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (audioCtxClass) {
          const audioCtx = new audioCtxClass();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.05);
        }
      } catch {}
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(getModeDuration(mode));
  };

  // Listen to keyboard shortcut event trigger Pomodoro toggle
  useEffect(() => {
    const handleToggleEvent = () => {
      toggleTimer();
    };
    window.addEventListener('serene-toggle-pomodoro', handleToggleEvent);
    return () => {
      window.removeEventListener('serene-toggle-pomodoro', handleToggleEvent);
    };
  }, [isActive, soundEnabled]);

  const totalDuration = getModeDuration(mode);
  const percentage = (secondsLeft / totalDuration) * 100;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="glass-card rounded-[16px] p-6 flex flex-col justify-between h-full min-h-[180px] relative overflow-hidden"
      id="focus-widget-container"
    >
      <div className="flex justify-between items-center" id="focus-widget-header">
        <div className="flex items-center gap-1.5 flex-wrap" id="focus-widget-title-area">
          <span className="font-display text-[11px] font-semibold text-slate-400 tracking-wider uppercase" id="focus-title-label">
            {t.title}
          </span>
          {streakCount > 0 && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/10 font-mono text-[10px]"
              id="streak-indicator"
              title={tHook('focus.completedToday', { count: streakCount })}
            >
              <Flame size={10} /> {streakCount}
            </span>
          )}
          {sessionCompletedCount > 0 && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-mono text-[10px]"
              id="session-completed-indicator"
              title={tHook('focus.sessionCount', { count: sessionCompletedCount })}
            >
              <Zap size={10} /> {sessionCompletedCount}
            </span>
          )}
        </div>

        <div className="flex gap-1" id="focus-top-controls">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors border border-white/5 ${
              soundEnabled ? 'text-amber-300 bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={soundEnabled ? t.muteAlert : t.unmuteAlert}
            id="focus-sound-toggle-btn"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-5 my-0.5" id="focus-timer-body">
        {/* Circle Progress */}
        <div className="relative w-[80px] h-[80px] flex items-center justify-center" id="focus-circle-progress-container">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-white/5 fill-none"
              strokeWidth="5"
            />
            {isActive && (
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-amber-400/20 fill-none pulse-ring-active"
                strokeWidth="5"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeOffset}
                style={{ transformOrigin: '40px 40px' }}
              />
            )}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="stroke-white/80 fill-none transition-[stroke-dashoffset] duration-300"
              strokeWidth="5"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              style={{ transformOrigin: '40px 40px' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display text-[15px] font-bold text-white tracking-tight" id="focus-time-display-sm">
            {formatTime(secondsLeft)}
          </div>
        </div>

        {/* Text Actions */}
        <div className="flex-1 flex flex-col justify-center text-left" id="focus-action-controls-area">
          <div className="flex items-center gap-2" id="focus-play-reset-row">
            <button
              onClick={toggleTimer}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-sans text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              id="focus-play-pause-btn"
            >
              {isActive ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              <span>{isActive ? t.pause : t.start}</span>
            </button>
            <button
              onClick={resetTimer}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={t.reset}
              id="focus-reset-btn"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-sans mt-2" id="focus-current-phase-text">
            {mode === 'work' ? t.phases.work : mode === 'short_break' ? t.phases.shortBreak : t.phases.longBreak}
          </span>
          
          {/* Ongoing session state counter */}
          <div className="text-[10px] text-slate-500 font-sans mt-0.5" id="focus-session-completed-status">
            {tHook('focus.sessionCount', { count: sessionCompletedCount })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 border-t border-white/5 pt-2 mt-1" id="focus-mode-switches">
        <button
          onClick={() => setMode('work')}
          className={`py-1 text-[10px] font-sans font-semibold rounded transition-colors ${
            mode === 'work' ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:text-slate-200'
          }`}
          id="focus-mode-work"
        >
          {t.modes.work}
        </button>
        <button
          onClick={() => setMode('short_break')}
          className={`py-1 text-[10px] font-sans font-semibold rounded transition-colors ${
            mode === 'short_break' ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:text-slate-200'
          }`}
          id="focus-mode-short"
        >
          {t.modes.shortBreak}
        </button>
        <button
          onClick={() => setMode('long_break')}
          className={`py-1 text-[10px] font-sans font-semibold rounded transition-colors ${
            mode === 'long_break' ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:text-slate-200'
          }`}
          id="focus-mode-long"
        >
          {t.modes.longBreak}
        </button>
      </div>
    </div>
  );
}
