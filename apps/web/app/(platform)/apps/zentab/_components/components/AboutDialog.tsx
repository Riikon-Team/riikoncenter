/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X, Sparkles, History } from 'lucide-react';
import { AppSettings, AboutTranslation } from '../types';
import { useTranslation } from 'react-i18next';
import changelogData from '../data/changelog.json';

interface ChangelogEntry {
  version: string;
  date: string;
  description: {
    vi: string;
    en: string;
  };
}

const changelogs = changelogData as ChangelogEntry[];

interface AboutDialogProps {
  settings: AppSettings;
  onClose: () => void;
}

export default function AboutDialog({ settings, onClose }: AboutDialogProps) {
  const { t: tHook, i18n } = useTranslation();
  const t = tHook('about', { returnObjects: true }) as unknown as AboutTranslation;
  const isEn = i18n.language.startsWith('en');
  const currentLang = isEn ? 'en' : 'vi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-fade-in" id="about-overlay">
      <div className="glass-dialog w-full max-w-md rounded-2xl p-6 relative flex flex-col max-h-[80vh] overflow-hidden" id="about-dialog-box">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4" id="about-dialog-header">
          <div className="flex items-center gap-2">
            <Sparkles className="text-slate-300 animate-pulse" size={18} />
            <div>
              <h3 className="font-heading font-semibold text-lg text-white" id="about-dialog-title">
                {t.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            id="about-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Informative text scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar my-4 pr-1 text-slate-300 font-sans text-xs space-y-5" id="about-content">
          
          {/* Version & Build Card */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center" id="about-version-card">
            <div>
              <p className="text-xs font-semibold text-white">{t.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.stableBuild}</p>
            </div>
            <div className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
              {t.version ? t.version.replace('Version: ', '').replace('Phiên bản: ', '') : 'v1.0.0'}
            </div>
          </div>

          {/* Changelog Section */}
          <div className="space-y-3" id="about-changelog-section">
            <h4 className="font-heading font-bold text-white text-xs tracking-wider uppercase flex items-center gap-2">
              <History size={13} className="text-slate-400" />
              {t.changelog}
            </h4>
            
            <div className="relative border-l border-white/10 ml-2 pl-4 space-y-4 py-1" id="changelog-timeline">
              {changelogs.map((entry, idx) => (
                <div key={idx} className="relative group" id={`changelog-entry-${entry.version}`}>
                  {/* Timeline Indicator Node */}
                  <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-slate-500 group-hover:border-emerald-400 transition-colors" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {entry.version}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {entry.date}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {currentLang === 'en' ? entry.description.en : entry.description.vi}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>



      </div>
    </div>
  );
}
