/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, GitCommit, GitPullRequest, GitMerge } from 'lucide-react';
import { GitHubStats, GitHubTranslation } from '../../types';

interface GitHubMetricsGridProps {
  stats: GitHubStats;
  t: GitHubTranslation;
}

export default function GitHubMetricsGrid({ stats, t }: GitHubMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="github-metrics-grid">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-center">
        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {t.metricStars}
        </span>
        <span className="block font-display text-[20px] font-extrabold text-amber-300 mt-1 flex items-center justify-center gap-1">
          <Star size={14} fill="currentColor" /> {stats.stars}
        </span>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-center">
        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {t.metricCommits}
        </span>
        <span className="block font-display text-[20px] font-extrabold text-white mt-1 flex items-center justify-center gap-1">
          <GitCommit size={14} /> {stats.commits}
        </span>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-center">
        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {t.metricPrs}
        </span>
        <span className="block font-display text-[20px] font-extrabold text-emerald-400 mt-1 flex items-center justify-center gap-1">
          <GitPullRequest size={14} /> {stats.prs}
        </span>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-center">
        <span className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          {t.metricIssues}
        </span>
        <span className="block font-display text-[20px] font-extrabold text-amber-400 mt-1 flex items-center justify-center gap-1">
          <GitMerge size={14} /> {stats.issues}
        </span>
      </div>
    </div>
  );
}
