/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GitHubTranslation } from '../../types';

interface DayActivity {
  dateString: string;
  dayName: string;
  count: number;
  commits: number;
  prs: number;
  issues: number;
  others: number;
}

interface GitHubSevenDaySyncProps {
  recentActivity: DayActivity[];
  t: GitHubTranslation;
  isEn: boolean;
}

export default function GitHubSevenDaySync({
  recentActivity,
  t,
  isEn,
}: GitHubSevenDaySyncProps) {
  return (
    <div className="glass-card rounded-xl p-4 border border-white/5 relative overflow-visible" id="github-7day-heatmap-card">
      <div className="flex justify-between items-center mb-3 pb-1 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-heading font-semibold text-xs text-white uppercase tracking-wider">
            {t.sevenDayHeatmap}
          </span>
        </div>
        <span className="text-[9px] text-amber-300 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-300/10">
          {t.realTimeSync}
        </span>
      </div>

      {/* Grid of 7 blocks with D3-styled presentation */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 pb-1 relative" id="github-7day-svg-heatmap">
        {recentActivity.map((day, dIdx) => {
          let colorClass = "from-neutral-900 to-neutral-900 border-white/5 text-slate-500";
          let bgGlow = "";
          const count = day.count;
          
          if (count > 0 && count <= 2) {
            colorClass = "from-emerald-950/70 to-emerald-900/40 border-emerald-900/30 text-emerald-400";
            bgGlow = "shadow-[0_0_8px_rgba(16,185,129,0.1)] hover:border-emerald-500/30";
          } else if (count > 2 && count <= 4) {
            colorClass = "from-emerald-900/80 to-emerald-800/60 border-emerald-700/40 text-emerald-300";
            bgGlow = "shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:border-emerald-400/35";
          } else if (count > 4 && count <= 6) {
            colorClass = "from-emerald-800/80 to-emerald-600/70 border-emerald-600/50 text-emerald-200";
            bgGlow = "shadow-[0_0_16px_rgba(16,185,129,0.35)] hover:border-emerald-300/45";
          } else if (count > 6) {
            colorClass = "from-emerald-600 to-emerald-400 border-emerald-400/60 text-emerald-950 font-bold";
            bgGlow = "shadow-[0_0_20px_rgba(52,211,153,0.45)] hover:border-emerald-300";
          }

          // Split YYYY-MM-DD
          const dateParts = day.dateString.split('-');
          const rDay = dateParts[2] || '';
          const rMonth = dateParts[1] || '';
          const mLabel = isEn
            ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(rMonth) - 1] || ''
            : `Th${parseInt(rMonth)}`;
          const displayDateStr = `${rDay} ${mLabel}`;

          return (
            <div
              key={day.dateString}
              className={`relative rounded-xl p-2.5 bg-gradient-to-br border transition-all duration-300 hover:-translate-y-1 group/tile cursor-help ${colorClass} ${bgGlow}`}
              id={`tile-7day-${dIdx}`}
            >
              <div className="flex flex-col h-full justify-between gap-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-wide">{day.dayName}</span>
                  <span className="text-[8px] opacity-60 font-mono">{displayDateStr}</span>
                </div>

                {/* Centered Stats count */}
                <div className="py-1 text-center">
                  <span className={`text-[20px] tracking-tight block ${count > 6 ? 'font-extrabold text-emerald-950' : 'font-extrabold text-white'}`}>
                    {count}
                  </span>
                  <span className={`text-[7px] uppercase tracking-wider block opacity-75 mt-0.5 ${count > 6 ? 'text-emerald-900 font-semibold' : 'text-slate-400'}`}>
                    {t.events}
                  </span>
                </div>

                {/* Visual Spark bar */}
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden flex" id={`spark-bar-${dIdx}`}>
                  <div
                    className="bg-sky-400 h-full transition-all"
                    style={{ width: `${count > 0 ? (day.commits / count) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-purple-400 h-full transition-all"
                    style={{ width: `${count > 0 ? (day.prs / count) * 100 : 0}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{ width: `${count > 0 ? (day.issues / count) * 100 : 0}%` }}
                  />
                </div>

                {/* Stat Details */}
                <div className={`flex justify-between items-center text-[7.5px] opacity-80 font-mono mt-0.5 ${count > 6 ? 'text-emerald-900 font-medium' : 'text-slate-400'}`}>
                  <span>C:{day.commits}</span>
                  <span>P:{day.prs}</span>
                  <span>I:{day.issues}</span>
                </div>
              </div>

              {/* Precise Floating Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 p-2 rounded-lg bg-slate-900/95 border border-white/15 text-[9px] text-white hidden group-hover/tile:block z-30 shadow-[0_4px_16px_rgba(0,0,0,0.65)] backdrop-blur-md text-left select-none pointer-events-none transition-all duration-300">
                <p className="font-bold border-b border-white/10 pb-1 mb-1 text-amber-300 text-center uppercase tracking-wider">
                  {day.dayName} • {displayDateStr}
                </p>
                <div className="space-y-0.5 font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>Commits:</span>
                    <span className="font-bold text-white">{day.commits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pull Requests:</span>
                    <span className="font-bold text-white">{day.prs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues/Comments:</span>
                    <span className="font-bold text-white">{day.issues}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1 mt-1 font-bold text-emerald-400">
                    <span>Total Events:</span>
                    <span>{day.count}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
