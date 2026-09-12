/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { X, Plus, Trash2, Folder, Keyboard, Figma, Youtube, Github, Mail, Globe, MessageSquare, Compass, ExternalLink } from 'lucide-react';
import { Bookmark, AppSettings, BookmarksTranslation } from '../types';
import { useTranslation } from 'react-i18next';

interface BookmarksDialogProps {
  settings: AppSettings;
  onClose: () => void;
}

const AVAILABLE_ICONS = [
  { name: 'Youtube', component: Youtube, label: 'YouTube' },
  { name: 'Github', component: Github, label: 'GitHub' },
  { name: 'Figma', component: Figma, label: 'Figma' },
  { name: 'Mail', component: Mail, label: 'Email' },
  { name: 'Globe', component: Globe, label: 'Website' },
  { name: 'MessageSquare', component: MessageSquare, label: 'Chat' },
  { name: 'Compass', component: Compass, label: 'Explore' }
];

export default function BookmarksDialog({ settings, onClose }: BookmarksDialogProps) {
  const { t: tHook } = useTranslation();
  const t = tHook('bookmarks', { returnObjects: true }) as unknown as BookmarksTranslation;

  const defaultBookmarks: Bookmark[] = [
    { id: 'b1', title: 'YouTube Lounge', url: 'https://youtube.com', category: 'Entertainment', iconName: 'Youtube' },
    { id: 'b2', title: 'GitHub Hub', url: 'https://github.com', category: 'Study', iconName: 'Github' },
    { id: 'b3', title: 'ChatGPT', url: 'https://chatgpt.com', category: 'Work', iconName: 'MessageSquare' },
    { id: 'b4', title: 'Figma Design', url: 'https://figma.com', category: 'Art', iconName: 'Figma' }
  ];

  const categories = ['All', 'Work', 'Study', 'Entertainment', 'Art'];

  const getCategoryDisplayLabel = (cat: string) => {
    switch (cat) {
      case 'All': return t.categories.all;
      case 'Work': return t.categories.work;
      case 'Study': return t.categories.study;
      case 'Entertainment': return t.categories.entertainment;
      case 'Art': return t.categories.art;
      default: return cat;
    }
  };

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('serene_productivity_bookmarks');
    return saved ? JSON.parse(saved) : defaultBookmarks;
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Work');
  const [iconName, setIconName] = useState('Globe');

  useEffect(() => {
    localStorage.setItem('serene_productivity_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const handleAddBookmark = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    // Auto prepend protocol if URL is simple
    let finalUrl = url.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const newBm: Bookmark = {
      id: 'b-' + Date.now(),
      title: title.trim(),
      url: finalUrl,
      category,
      iconName
    };

    setBookmarks([newBm, ...bookmarks]);
    setTitle('');
    setUrl('');
    setShowAddForm(false);
  };

  const handleDeleteBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(tHook('confirmDeleteBookmark'))) {
      setBookmarks(bookmarks.filter(bm => bm.id !== id));
    }
  };

  const getIconComponent = (name: string) => {
    const found = AVAILABLE_ICONS.find(ic => ic.name === name);
    if (found) {
      const Comp = found.component;
      return <Comp size={15} />;
    }
    return <Globe size={15} />;
  };

  // Filter bookmarks
  const filteredBookmarks = selectedCategory === 'All'
    ? bookmarks
    : bookmarks.filter(bm => {
        const normSelected = selectedCategory.toLowerCase();
        const normBm = bm.category.toLowerCase();
        if (normSelected === 'work' && (normBm === 'work' || normBm === 'công việc')) return true;
        if (normSelected === 'study' && (normBm === 'study' || normBm === 'học tập')) return true;
        if (normSelected === 'entertainment' && (normBm === 'entertainment' || normBm === 'giải trí')) return true;
        if (normSelected === 'art' && (normBm === 'art' || normBm === 'mỹ thuật')) return true;
        return normBm === normSelected;
      });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fade-in" id="bookmarks-overlay">
      <div className="glass-dialog w-full max-w-3xl rounded-2xl p-6 relative flex flex-col max-h-[85vh] overflow-hidden animate-slide-up" id="bookmarks-dialog-box">
        
        {/* Header section */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4" id="bookmarks-dialog-header">
          <div className="flex items-center gap-2">
            <Folder className="text-white" size={20} />
            <div>
              <h3 className="font-heading font-semibold text-lg text-white" id="bookmarks-dialog-title">
                {t.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1" id="bookmarks-dialog-subtitle">
                {t.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            id="bookmarks-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar & Categories filters row */}
        <div className="py-4 flex flex-wrap gap-2 justify-between items-center" id="bookmarks-toolbar">
          <div className="flex flex-wrap gap-1.5" id="bookmarks-cats-list">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1 text-xs font-heading font-medium rounded-lg border transition-all cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-white text-slate-950 border-white'
                    : 'text-slate-300 hover:text-white border-white/5 bg-white/5 hover:bg-white/10'
                }`}
                id={`bookmark-cat-btn-${c}`}
              >
                {getCategoryDisplayLabel(c)}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 bg-white text-slate-950 hover:bg-slate-100 font-heading font-semibold text-xs rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            id="bookmark-btn-toggle-add"
          >
            {showAddForm ? t.closeForm : <><Plus size={12} strokeWidth={2.5} /> {t.addNew}</>}
          </button>
        </div>

        {/* Accordion form for adding book links */}
        {showAddForm && (
          <form onSubmit={handleAddBookmark} className="p-4 rounded-xl bg-white/5 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 animate-slide-down" id="add-bookmark-form">
            <div id="bookmark-input-title-wrap">
              <label className="block text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider mb-1" id="lbl-bookmark-title">
                {t.nameLabel}
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-white transition-colors"
                required
                id="inp-bookmark-title"
              />
            </div>

            <div id="bookmark-input-url-wrap">
              <label className="block text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider mb-1" id="lbl-bookmark-url">
                {t.urlLabel}
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t.urlPlaceholder}
                className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-white transition-colors"
                required
                id="inp-bookmark-url"
              />
            </div>

            <div id="bookmark-input-category-wrap">
              <label className="block text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider mb-1" id="lbl-bookmark-cat">
                {t.categoryLabel}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-2 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                id="sel-bookmark-cat"
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{getCategoryDisplayLabel(c)}</option>
                ))}
              </select>
            </div>

            <div id="bookmark-input-icon-wrap">
              <label className="block text-[11px] font-heading font-semibold text-slate-400 uppercase tracking-wider mb-1" id="lbl-bookmark-icon">
                {t.iconLabel}
              </label>
              <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-black/20" id="bookmarks-icon-options">
                {AVAILABLE_ICONS.map(ic => {
                  const IconComp = ic.component;
                  return (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setIconName(ic.name)}
                      className={`w-7 h-7 rounded flex items-center justify-center transition-colors border ${
                        iconName === ic.name
                          ? 'border-white bg-white/20 text-white'
                          : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                      title={ic.label}
                      id={`bookmark-icon-opt-${ic.name}`}
                    >
                      <IconComp size={13} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-2" id="bookmarks-form-actions">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                id="bookmark-btn-cancel"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 rounded-lg shadow transition-all cursor-pointer"
                id="bookmark-btn-submit"
              >
                {t.save}
              </button>
            </div>
          </form>
        )}

        {/* Bookmarks Grid Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" id="bookmarks-grid-container">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-sans text-xs" id="bookmarks-empty-state">
              {t.emptyState}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" id="bookmarks-grid-box">
              {filteredBookmarks.map(bm => (
                <a
                  key={bm.id}
                  href={bm.url}
                  target="_blank"
                  rel="noopener noreferrer referrer"
                  className="glass-card flex items-center justify-between p-3.5 rounded-xl cursor-pointer select-none relative group h-14"
                  id={`bookmark-link-${bm.id}`}
                >
                  <div className="flex items-center gap-2.5 truncate" id="bookmark-card-main">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-300 group-hover:bg-white/10 group-hover:text-amber-300 transition-colors" id="bookmark-icon-outer">
                      {getIconComponent(bm.iconName || 'Link')}
                    </div>
                    <div className="truncate text-left" id="bookmark-card-texts">
                      <span className="font-heading font-medium text-xs text-white block group-hover:text-amber-300 transition-colors truncate" id="bookmark-text-title">
                        {bm.title}
                      </span>
                      <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wide block" id="bookmark-text-cat">
                        {bm.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" id="bookmark-hover-controls">
                    <button
                      onClick={(e) => handleDeleteBookmark(bm.id, e)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-white/10 transition-colors z-10 cursor-pointer"
                      title="Xóa"
                      id={`bookmark-del-btn-${bm.id}`}
                    >
                      <Trash2 size={11} />
                    </button>
                    <ExternalLink size={10} className="text-slate-500 mr-1" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
