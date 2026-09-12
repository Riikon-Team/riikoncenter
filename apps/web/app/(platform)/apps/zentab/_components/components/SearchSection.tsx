/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { Search, Compass } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppSettings } from '../types';

interface SearchSectionProps {
  settings: AppSettings;
}

export default function SearchSection({ settings }: SearchSectionProps) {
  const { t: tHook } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchProvider, setSearchProvider] = useState<'google' | 'duck' | 'bing'>('google');
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('serene_search_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return;

    setSearchHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== cleanQuery.toLowerCase());
      const next = [cleanQuery, ...filtered].slice(0, 10);
      localStorage.setItem('serene_search_history', JSON.stringify(next));
      return next;
    });

    let targetUrl = '';
    if (searchProvider === 'google') {
      targetUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`;
    } else if (searchProvider === 'duck') {
      targetUrl = `https://duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}`;
    } else {
      targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(cleanQuery)}`;
    }

    window.open(targetUrl, '_blank', 'noreferrer,noopener');
    setSearchQuery('');
    setIsSearchFocused(false);
  };

  const textSearchPlaceholder = tHook('searchPlaceholder');
  const textSearchHistoryHeader = tHook('searchHistoryHeader');
  const textClearAll = tHook('clearAll');
  const textClearThisSearch = tHook('clearThisSearch');

  return (
    <section className="w-full max-w-xl mx-auto" id="primary-search-section">
      <form onSubmit={handleSearchSubmit} className="relative group" id="search-input-form-el">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10" id="search-choices-pills">
          <button
            type="button"
            onClick={() => setSearchProvider(searchProvider === 'google' ? 'duck' : searchProvider === 'duck' ? 'bing' : 'google')}
            className="px-2 py-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono leading-none tracking-tight flex items-center gap-1 cursor-pointer transition-colors"
            id="search-toggle-provider"
            title={tHook('changeSearchEngine')}
          >
            <Compass size={10} />
            <span>{searchProvider === 'google' ? 'Google' : searchProvider === 'duck' ? 'DuckDuck' : 'Bing'}</span>
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => {
            setTimeout(() => setIsSearchFocused(false), 200);
          }}
          placeholder={textSearchPlaceholder}
          className="w-full pl-32 pr-12 py-3.5 rounded-full text-xs font-sans text-white placeholder-slate-400 bg-white/[0.04] focus:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-white/20 focus:border-white/40 focus:outline-none focus:ring-0 shadow-lg group-hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all text-left"
          id="main-stage-search-input"
          autoComplete="off"
        />

        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          id="main-search-submit-arrow"
        >
          <Search size={14} />
        </button>

        {/* SEARCH HISTORY LIST */}
        {isSearchFocused && searchHistory.length > 0 && (
          <div 
            className="absolute left-0 right-0 top-full mt-2 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl py-2 px-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-left max-h-48 overflow-y-auto font-sans"
            onMouseDown={(e) => e.preventDefault()}
            id="search-history-dropdown"
          >
            <div className="flex justify-between items-center px-1.5 py-1 select-none border-b border-white/5 mb-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <span>{textSearchHistoryHeader}</span>
              <button 
                type="button"
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem('serene_search_history');
                }}
                className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors normal-case font-normal hover:underline cursor-pointer"
              >
                {textClearAll}
              </button>
            </div>
            {searchHistory.map((query, idx) => (
              <div 
                key={idx}
                className="flex justify-between items-center hover:bg-white/5 rounded-lg px-2 py-1.5 group/item transition-colors"
              >
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery(query);
                    setTimeout(() => {
                      let targetUrl = '';
                      if (searchProvider === 'google') {
                        targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                      } else if (searchProvider === 'duck') {
                        targetUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
                      } else {
                        targetUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
                      }
                      window.open(targetUrl, '_blank', 'noreferrer,noopener');
                    }, 50);
                    setIsSearchFocused(false);
                  }}
                  className="text-left text-xs text-slate-200 hover:text-white truncate flex-1 cursor-pointer font-sans"
                >
                  {query}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchHistory(prev => {
                      const next = prev.filter((_, i) => i !== idx);
                      localStorage.setItem('serene_search_history', JSON.stringify(next));
                      return next;
                    });
                  }}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-white/5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center font-sans text-[10px] w-4 h-4 ml-2"
                  title={textClearThisSearch}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </section>
  );
}
