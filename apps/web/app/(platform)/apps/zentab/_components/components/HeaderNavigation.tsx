/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bookmark, Settings, CheckSquare, Github, Info, Eye, EyeOff, Keyboard, Menu, PanelTop, PanelTopClose } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppSettings } from '../types';
import SoundBoard from './SoundBoard';
import { useSidebarStore } from '@/store/useSidebarStore';

export type DialogID = 'none' | 'kanban' | 'bookmarks' | 'github' | 'about' | 'settings' | 'detailed_weather' | 'shortcuts';

interface HeaderNavigationProps {
  settings: AppSettings;
  widgetsVisible: boolean;
  onToggleWidgets: () => void;
  onOpenDialog: (dialog: DialogID) => void;
}

export default function HeaderNavigation({
  settings,
  widgetsVisible,
  onToggleWidgets,
  onOpenDialog,
}: HeaderNavigationProps) {
  const { toggleSidebarVisibility, isSidebarVisible, isHeaderVisible, toggleHeaderVisibility } = useSidebarStore();
  const { t } = useTranslation();

  return (
    <header className="relative z-40 flex flex-wrap justify-between items-center gap-3 w-full max-w-7xl mx-auto shrink-0 select-none" id="app-header-nav">
      
      {/* Playable music player with sidebar toggle button to its left */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebarVisibility}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/5 bg-white/5"
          title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
          id="trigger-toggle-sidebar"
        >
          <Menu size={14} />
        </button>
        <SoundBoard settings={settings} />
      </div>

      {/* Navigation Action Buttons panel */}
      <nav className="flex items-center bg-black/20 border border-white/5 rounded-full p-1 gap-1" id="widgets-triggers-nav">
        <button
          onClick={() => onOpenDialog('kanban')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative cursor-pointer"
          title={t('sideActions.kanban') as string}
          id="trigger-kanban"
        >
          <CheckSquare size={14} />
        </button>
        
        <button
          onClick={() => onOpenDialog('bookmarks')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={t('sideActions.bookmarks') as string}
          id="trigger-bookmarks"
        >
          <Bookmark size={14} />
        </button>

        <button
          onClick={() => onOpenDialog('github')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={t('sideActions.github') as string}
          id="trigger-github"
        >
          <Github size={14} />
        </button>

        <span className="w-[1px] h-4 bg-white/10 mx-0.5" />

        <button
          onClick={toggleHeaderVisibility}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={(isHeaderVisible ? t('sideActions.hideHeader') : t('sideActions.showHeader')) as string}
          id="trigger-toggle-header"
        >
          {isHeaderVisible ? <PanelTopClose size={14} /> : <PanelTop size={14} />}
        </button>

        <span className="w-[1px] h-4 bg-white/10 mx-0.5" />

        <button
          onClick={onToggleWidgets}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={(widgetsVisible ? t('sideActions.hideWidgets') : t('sideActions.showWidgets')) as string}
          id="trigger-toggle-widgets"
        >
          {widgetsVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        <span className="w-[1px] h-4 bg-white/10 mx-0.5" />

        <button
          onClick={() => onOpenDialog('about')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={t('sideActions.info') as string}
          id="trigger-about"
        >
          <Info size={14} />
        </button>

        <button
          onClick={() => onOpenDialog('shortcuts')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={settings.language === 'en' ? 'Keyboard shortcuts' : 'Hướng dẫn phím tắt'}
          id="trigger-shortcuts"
        >
          <Keyboard size={14} />
        </button>

        <button
          onClick={() => onOpenDialog('settings')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={t('sideActions.settings') as string}
          id="trigger-settings"
        >
          <Settings size={14} />
        </button>
      </nav>
    </header>
  );
}
