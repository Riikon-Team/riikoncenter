/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, Link } from 'lucide-react';
import { GitHubStats, GitHubTranslation } from '../../types';

interface GitHubProfileCardProps {
  stats: GitHubStats;
  t: GitHubTranslation;
}

export default function GitHubProfileCard({ stats, t }: GitHubProfileCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-center sm:items-start" id="github-profile-brief">
      <img
        src={stats.avatarUrl}
        alt={stats.username}
        referrerPolicy="no-referrer"
        className="w-20 h-20 rounded-xl border border-white/10 object-cover shadow-inner"
        id="github-avatar-img"
      />
      <div className="text-center sm:text-left flex-1" id="github-bio-block">
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3 justify-center sm:justify-start">
          <h4 className="font-heading font-bold text-base text-white">{stats.fullName}</h4>
          <span className="text-xs text-amber-300 font-mono">@{stats.username}</span>
        </div>
        {stats.bio && (
          <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md">
            {stats.bio}
          </p>
        )}
        <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start text-xs text-slate-400" id="github-counts-row">
          <span className="flex items-center gap-1">
            <Users size={12} /> <strong>{stats.followers}</strong> {t.followers}
          </span>
          <span className="flex items-center gap-1">
            <strong>{stats.following}</strong> {t.following}
          </span>
          <span className="flex items-center gap-1">
            <Link size={12} /> <strong>{stats.reposCount}</strong> {t.repos}
          </span>
        </div>
      </div>
    </div>
  );
}
