/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Keyboard, CheckSquare, Bookmark, Github, Settings, Info, Eye, Music, Hourglass, HelpCircle } from 'lucide-react';
import { AppSettings, KeyboardShortcutsTranslation } from '../types';
import { useTranslation } from 'react-i18next';

interface KeyboardShortcutsDialogProps {
  settings: AppSettings;
  onClose: () => void;
}

export default function KeyboardShortcutsDialog({ settings, onClose }: KeyboardShortcutsDialogProps) {
  const { t: tHook } = useTranslation();
  const t = tHook('keyboardShortcuts', { returnObjects: true }) as unknown as KeyboardShortcutsTranslation;

  // Render individual key badge
  const renderKbd = (text: string) => (
    <kbd className="px-2 py-1 rounded-md bg-white/10 text-white text-[11px] font-mono border-b-2 border-white/20 px-1.5 shadow-md" style={{ textShadow: '0 1px 0 rgba(0,0,0,0.5)' }}>
      {text}
    </kbd>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fade-in" id="shortcuts-overlay">
      <div className="glass-dialog w-full max-w-lg rounded-2xl p-6 relative flex flex-col max-h-[85vh] overflow-hidden" id="shortcuts-dialog-box">
        
        {/* Header section with Keyboard icon */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4" id="shortcuts-dialog-header">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <Keyboard size={18} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-base text-white" id="shortcuts-dialog-title">
                {t.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            id="shortcuts-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Categories items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar my-4 pr-1 space-y-5" id="shortcuts-content">
          
          {/* Category: General Navigation */}
          <div className="space-y-2.5" id="shortcuts-cat-general">
            <h4 className="font-heading font-medium text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {t.categories.general}
            </h4>
            <div className="space-y-2">
              {/* Toggle Help (alt + / or ?) */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><HelpCircle size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.help}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('/')}
                  <span className="text-slate-500 text-[10px] mx-1 font-sans">{t.pressKey}</span>
                  {renderKbd('?')}
                </div>
              </div>
            </div>
          </div>

          {/* Category: Workspace Modules */}
          <div className="space-y-2.5" id="shortcuts-cat-dialogs">
            <h4 className="font-heading font-medium text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {t.categories.dialogs}
            </h4>
            <div className="space-y-2">
              
              {/* Kanban Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><CheckSquare size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.kanban}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('K')}
                </div>
              </div>

              {/* Bookmarks Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><Bookmark size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.bookmarks}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('B')}
                </div>
              </div>

              {/* GitHub Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><Github size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.github}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('G')}
                </div>
              </div>

              {/* Settings Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><Settings size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.settings}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('S')}
                </div>
              </div>

              {/* About App Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><Info size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.about}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('A')}
                </div>
              </div>

            </div>
          </div>

          {/* Category: Active Work Helpers */}
          <div className="space-y-2.5" id="shortcuts-cat-controls">
            <h4 className="font-heading font-medium text-slate-300 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {t.categories.controls}
            </h4>
            <div className="space-y-2">

              {/* Hide/Show Bento items Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><Eye size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.widgets}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('H')}
                </div>
              </div>

              {/* Focus Sound Soundboard Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><Music size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.sound}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('P')}
                </div>
              </div>

              {/* Pomodoro Timer Toggle Shortcut */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-slate-400"><Hourglass size={15} /></div>
                  <span className="text-xs text-slate-300 font-sans">{t.shortcutsList.pomodoro}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {renderKbd('Alt')}
                  <span className="text-slate-500 text-xs">+</span>
                  {renderKbd('Q')}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
