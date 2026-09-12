/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, ChangeEvent } from 'react';
import { PencilLine, Trash2, Check } from 'lucide-react';
import { AppSettings, NotesTranslation } from '../types';
import { useTranslation } from 'react-i18next';

interface NotesWidgetProps {
  settings: AppSettings;
}

export default function NotesWidget({ settings }: NotesWidgetProps) {
  const { t: tHook } = useTranslation();
  const t = tHook('notes', { returnObjects: true }) as unknown as NotesTranslation;

  const [content, setContent] = useState(() => {
    return localStorage.getItem('serene_productivity_quick_notes') || '';
  });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!content) {
      localStorage.setItem('serene_productivity_quick_notes', '');
      setIsSaving(false);
      setSaved(false);
      return;
    }

    setIsSaving(true);
    setSaved(false);

    // Debounce localStorage write by 350ms to keep keystrokes extremely fluid
    const saveTimer = setTimeout(() => {
      localStorage.setItem('serene_productivity_quick_notes', content);
      setIsSaving(false);
      setSaved(true);

      // Dismiss the "Autosaved" tag after 1.5s
      const dismissTimer = setTimeout(() => {
        setSaved(false);
      }, 1500);

      return () => clearTimeout(dismissTimer);
    }, 350);

    return () => clearTimeout(saveTimer);
  }, [content]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const clearNotes = () => {
    if (window.confirm(tHook('confirmDeleteNote'))) {
      setContent('');
    }
  };

  const getWordCount = () => {
    const trimmed = content.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  };

  return (
    <div
      className="glass-card rounded-[16px] p-6 flex flex-col justify-between h-full min-h-[180px] relative overflow-hidden"
      id="notes-widget-container"
    >
      <div className="flex justify-between items-center" id="notes-widget-header">
        <span className="font-display text-[11px] font-semibold text-slate-400 tracking-wider uppercase block" id="notes-title-label">
          {t.title}
        </span>
        <div className="flex items-center gap-2" id="notes-top-actions">
          {isSaving ? (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-sans animate-pulse" id="notes-saving-indicator">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full inline-block" /> {t.saving}
            </span>
          ) : saved ? (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 font-sans" id="notes-autosaved-indicator">
              <Check size={10} /> {t.autosaved}
            </span>
          ) : null}
          {content && (
            <button
              onClick={clearNotes}
              className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
              title={t.deleteNotes}
              id="notes-clear-btn"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 mt-3 relative" id="notes-textarea-container">
        <textarea
          value={content}
          onChange={handleTextChange}
          placeholder={t.placeholder}
          className="w-full h-full bg-transparent resize-none border-0 p-0 text-slate-200 placeholder-slate-500 font-sans text-xs leading-relaxed focus:ring-0 focus:outline-none custom-scrollbar text-left"
          id="notes-textarea-el"
        />
      </div>

      <div className="border-t border-white/5 pt-2 mt-2 flex justify-between items-center text-slate-500 text-[10px] font-mono" id="notes-footer-row">
        <span id="notes-stats-indicator">
          {tHook('notes.stats', { words: getWordCount(), chars: content.length })}
        </span>
        <span className="flex items-center gap-1 text-slate-400" id="notes-hint-indicator">
          <PencilLine size={10} /> {t.autoSaveHint}
        </span>
      </div>
    </div>
  );
}
