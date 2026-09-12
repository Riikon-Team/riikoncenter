"use client";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import zenTabI18n from './i18n';

// Constants
import { DEFAULT_SETTINGS, WALLPAPER_PRESETS } from './common/constants';
import { getRandomQuoteByLanguage } from './common/constants/quotes';

// Types
import { AppSettings, Quote } from './types';

// Custom Components
import ClockSection from './components/ClockSection';
import SearchSection from './components/SearchSection';
import BackgroundLayers from './components/BackgroundLayers';
import HeaderNavigation, { DialogID } from './components/HeaderNavigation';
import BentoGridSection from './components/BentoGridSection';

// Dialog Components (Lazy Loaded for performance)
const KanbanDialog = React.lazy(() => import('./components/KanbanDialog'));
const GitHubDialog = React.lazy(() => import('./components/GitHubDialog'));
const BookmarksDialog = React.lazy(() => import('./components/BookmarksDialog'));
const SettingsDialog = React.lazy(() => import('./components/SettingsDialog'));
const AboutDialog = React.lazy(() => import('./components/AboutDialog'));
const KeyboardShortcutsDialog = React.lazy(() => import('./components/KeyboardShortcutsDialog'));
const WeatherDetailedDialog = React.lazy(() => import('./components/WeatherDetailedDialog'));

export default function App() {
  return (
    <I18nextProvider i18n={zenTabI18n}>
      <AppInner />
    </I18nextProvider>
  );
}

function AppInner() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('serene_productivity_settings');
    const defaults = { ...DEFAULT_SETTINGS };
    try {
      if (saved) {
        return { ...defaults, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return defaults;
  });

  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  // Quotes
  const [quote, setQuote] = useState<Quote>(() => getRandomQuoteByLanguage(settings.language));

  // Sync quote when language changes
  useEffect(() => {
    setQuote(getRandomQuoteByLanguage(settings.language));
  }, [settings.language]);

  // Dialog state
  const [activeDialog, setActiveDialog] = useState<DialogID>('none');

  // Widget group visibility toggle
  const [widgetsVisible, setWidgetsVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem('serene_widgets_visible');
    return saved !== 'false';
  });

  const toggleWidgetsVisibility = useCallback(() => {
    setWidgetsVisible(p => {
      const next = !p;
      localStorage.setItem('serene_widgets_visible', String(next));
      return next;
    });
  }, []);

  // Widget Sizes (grid-stack style resize tracking)
  const [widgetSizes, setWidgetSizes] = useState<{
    weather: { colSpan: number, height: number };
    focus: { colSpan: number, height: number };
    notes: { colSpan: number, height: number };
  }>(() => {
    try {
      const saved = localStorage.getItem('serene_widget_sizes');
      return saved ? JSON.parse(saved) : {
        weather: { colSpan: 1, height: 208 },
        focus: { colSpan: 1, height: 208 },
        notes: { colSpan: 1, height: 208 }
      };
    } catch {
      return {
        weather: { colSpan: 1, height: 208 },
        focus: { colSpan: 1, height: 208 },
        notes: { colSpan: 1, height: 208 }
      };
    }
  });

  // Responsive Grid-Stack Widget dragging handler for mouse/touch resize
  const handleStartResize = useCallback((
    widgetKey: 'weather' | 'focus' | 'notes',
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    const isTouch = 'touches' in e;
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startY = isTouch ? e.touches[0].clientY : e.clientY;
    const startHeight = widgetSizes[widgetKey].height;
    const startColSpan = widgetSizes[widgetKey].colSpan;
    
    const gridEl = document.getElementById('bento-layout-wrapper');
    const colWidth = gridEl ? gridEl.clientWidth / 3 : 250;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const deltaY = currentY - startY;
      const newHeight = Math.max(180, Math.min(500, startHeight + deltaY));

      const deltaX = currentX - startX;
      const spanChange = Math.round(deltaX / colWidth);
      const newColSpan = Math.max(1, Math.min(3, startColSpan + spanChange));

      setWidgetSizes(prev => {
        if (prev[widgetKey].colSpan === newColSpan && prev[widgetKey].height === newHeight) {
          return prev;
        }
        return {
          ...prev,
          [widgetKey]: { colSpan: newColSpan, height: newHeight }
        };
      });
    };

    const handleEnd = () => {
      if (isTouch) {
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      } else {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
      }

      setWidgetSizes(current => {
        localStorage.setItem('serene_widget_sizes', JSON.stringify(current));
        return current;
      });
    };

    if (isTouch) {
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    } else {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    }
  }, [widgetSizes]);

  useEffect(() => {
    localStorage.setItem('serene_productivity_settings', JSON.stringify(settings));
  }, [settings]);

  // Wallpaper smooth cross-fade transition state
  const [currentBgUrl, setCurrentBgUrl] = useState(() => {
    if (settings.customBgUrl) return settings.customBgUrl;
    const wallpaperObj = WALLPAPER_PRESETS[settings.bgImageIndex] || WALLPAPER_PRESETS[0];
    return wallpaperObj.url;
  });
  const [bgImageOverlay, setBgImageOverlay] = useState<string | null>(null);
  const [overlayActive, setOverlayActive] = useState(false);

  useEffect(() => {
    const targetBgUrl = settings.customBgUrl || (WALLPAPER_PRESETS[settings.bgImageIndex] || WALLPAPER_PRESETS[0]).url;
    if (targetBgUrl !== currentBgUrl && targetBgUrl !== bgImageOverlay) {
      setBgImageOverlay(targetBgUrl);
      setOverlayActive(false);

      const frame = requestAnimationFrame(() => {
        setTimeout(() => {
          setOverlayActive(true);
        }, 30);
      });

      const timer = setTimeout(() => {
        setCurrentBgUrl(targetBgUrl);
        setBgImageOverlay(null);
        setOverlayActive(false);
      }, 2000);

      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
  }, [settings.customBgUrl, settings.bgImageIndex, currentBgUrl, bgImageOverlay]);

  // Global Keyboard Shortcuts Controller
  useEffect(() => {
    const isInputFocused = () => {
      const activeEl = document.activeElement;
      if (!activeEl) return false;
      const tag = activeEl.tagName.toLowerCase();
      return (
        tag === 'input' ||
        tag === 'textarea' ||
        activeEl.getAttribute('contenteditable') === 'true'
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      const key = e.key.toLowerCase();
      const isAltOrShift = e.altKey || e.shiftKey;

      // Question mark shortcut: '?' (without any modifiers) OR Alt + '/'
      if ((e.key === '?' || (isAltOrShift && key === '/')) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setActiveDialog(prev => prev === 'shortcuts' ? 'none' : 'shortcuts');
      } else if (isAltOrShift && !e.ctrlKey && !e.metaKey) {
        switch (key) {
          case 'k': // Toggle task board (Kanban)
            e.preventDefault();
            setActiveDialog(prev => prev === 'kanban' ? 'none' : 'kanban');
            break;
          case 'b': // Toggle bookmarks
            e.preventDefault();
            setActiveDialog(prev => prev === 'bookmarks' ? 'none' : 'bookmarks');
            break;
          case 'g': // Toggle GitHub statistics
            e.preventDefault();
            setActiveDialog(prev => prev === 'github' ? 'none' : 'github');
            break;
          case 's': // Toggle system config (Settings)
            e.preventDefault();
            setActiveDialog(prev => prev === 'settings' ? 'none' : 'settings');
            break;
          case 'a': // Toggle about page info
            e.preventDefault();
            setActiveDialog(prev => prev === 'about' ? 'none' : 'about');
            break;
          case 'h': // Toggle widgets group visibility
            e.preventDefault();
            toggleWidgetsVisibility();
            break;
          case 'p': // Toggle ambient soundtrack
            {
              e.preventDefault();
              const event = new CustomEvent('serene-toggle-audio');
              window.dispatchEvent(event);
            }
            break;
          case 'q': // Toggle Pomodoro timer
            {
              e.preventDefault();
              const event = new CustomEvent('serene-toggle-pomodoro');
              window.dispatchEvent(event);
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [widgetsVisible, activeDialog, toggleWidgetsVisibility]);

  const handleRefreshQuote = useCallback(() => {
    setQuote(getRandomQuoteByLanguage(settings.language));
  }, [settings.language]);

  const handleUpdateSettings = useCallback((newS: Partial<AppSettings>) => {
    setSettings(p => ({ ...p, ...newS }));
  }, []);

  const handleCloseActiveDialog = useCallback(() => {
    setActiveDialog('none');
  }, []);

  const handleOpenDialog = useCallback((dialog: DialogID) => {
    setActiveDialog(dialog);
  }, []);

  return (
    <div 
      className="relative w-full h-full flex flex-col justify-between overflow-hidden p-3 md:p-6 select-none bg-[#090b0f] text-slate-100"
      id="serene-app"
    >
      
      {/* Background Image & Effects Layers */}
      <BackgroundLayers
        currentBgUrl={currentBgUrl}
        bgImageOverlay={bgImageOverlay}
        overlayActive={overlayActive}
        widgetsVisible={widgetsVisible}
        bgBlurIntensity={settings.bgBlurIntensity}
      />

      {/* Playable soundbar and navigation controller */}
      <HeaderNavigation
        settings={settings}
        widgetsVisible={widgetsVisible}
        onToggleWidgets={toggleWidgetsVisibility}
        onOpenDialog={handleOpenDialog}
      />
 
      {/* --- MAIN ZEN STAGE --- */}
      <main 
        className={`relative z-10 w-full transition-[max-width,padding,gap] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] mx-auto flex-1 flex flex-col justify-center items-center overflow-y-auto max-h-[calc(100%-60px)] custom-scrollbar ${
          widgetsVisible 
            ? 'max-w-4xl gap-3 md:gap-4 py-2 my-auto' 
            : 'max-w-2xl gap-6 md:gap-8 py-6 my-auto'
        }`} 
        id="main-zen-stage"
      >
        
        {/* SPRINGED SMOOTH CLOCK SECTION */}
        <ClockSection settings={settings} widgetsVisible={widgetsVisible} />

        {/* SEARCH BAR UNIT */}
        <SearchSection settings={settings} />

        {/* BENTO GRID RESIZABLE WIDGETS SECTION */}
        <AnimatePresence initial={false}>
          {widgetsVisible && (
            <motion.section 
              initial={{ opacity: 0, height: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, height: 'auto', scale: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, scale: 0.96, y: -15 }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1] // Apple easeOutExpo
              }}
              className="w-full max-w-7xl mx-auto overflow-hidden" 
              id="bento-box-grid-section"
            >
              <BentoGridSection
                settings={settings}
                widgetSizes={widgetSizes}
                onStartResize={handleStartResize}
                onOpenDetailedWeather={() => handleOpenDialog('detailed_weather')}
                quote={quote}
                onRefreshQuote={handleRefreshQuote}
              />
            </motion.section>
          )}
        </AnimatePresence>

      </main>

      {/* --- OVERLAYS & DIALOGS ROUTER SECTION --- */}
      <Suspense fallback={null}>
        {activeDialog === 'kanban' && (
        <KanbanDialog
          settings={settings}
          onClose={handleCloseActiveDialog}
        />
      )}

      {activeDialog === 'bookmarks' && (
        <BookmarksDialog
          settings={settings}
          onClose={handleCloseActiveDialog}
        />
      )}

      {activeDialog === 'github' && (
        <GitHubDialog
          settings={settings}
          onClose={handleCloseActiveDialog}
        />
      )}

      {activeDialog === 'about' && (
        <AboutDialog
          settings={settings}
          onClose={handleCloseActiveDialog}
        />
      )}

      {activeDialog === 'settings' && (
        <SettingsDialog
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={handleCloseActiveDialog}
        />
      )}

      {activeDialog === 'detailed_weather' && (
        <WeatherDetailedDialog
          settings={settings}
          onClose={handleCloseActiveDialog}
        />
      )}

      {activeDialog === 'shortcuts' && (
        <KeyboardShortcutsDialog
          settings={settings}
          onClose={handleCloseActiveDialog}
        />
      )}
      </Suspense>

    </div>
  );
}
