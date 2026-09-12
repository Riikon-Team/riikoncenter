/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Code2 } from 'lucide-react';
import { GitHubStats, GitHubTranslation } from '../../types';

interface GitHubLangStatsProps {
  stats: GitHubStats;
  t: GitHubTranslation;
}

export default function GitHubLangStats({ stats, t }: GitHubLangStatsProps) {
  const hasTopRepos = stats.topRepos && stats.topRepos.length > 0;
  return (
    <div className={`grid grid-cols-1 ${hasTopRepos ? 'md:grid-cols-2' : ''} gap-4`} id="github-languages-repos">
      <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4">
        <span className="block font-heading font-semibold text-xs text-white uppercase tracking-wider mb-3">
          {t.langTitle}
        </span>
        <div className="space-y-3" id="github-langs-progress">
          {stats.languages.length === 0 ? (
            <div className="text-[11px] font-sans text-slate-500 italic py-6 text-center select-none" id="github-langs-empty">
              {t.noLangStats}
            </div>
          ) : (
            stats.languages.map((lang) => (
              <div key={lang.name} className="space-y-1">
                <div className="flex justify-between text-[11px] font-sans text-slate-300">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                    {lang.name}
                  </span>
                  <span>{lang.percentage}%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {hasTopRepos && (
        <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 flex flex-col justify-start">
          <span className="block font-heading font-semibold text-xs text-white uppercase tracking-wider mb-3">
            Top Repositories
          </span>
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
            {stats.topRepos.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noreferrer"
                className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
              >
                <div className="flex justify-between items-start mb-1">
                  <h6 className="font-sans font-medium text-xs text-blue-400 group-hover:text-blue-300 transition-colors line-clamp-1">
                    {repo.name}
                  </h6>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span className="text-amber-400 text-[10px]">★</span>
                    {repo.stars}
                  </span>
                </div>
                {repo.description && (
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                    {repo.description}
                  </p>
                )}
                {repo.language && (
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-white/5">
                    {repo.language}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
