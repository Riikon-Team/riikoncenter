/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GitHubTranslation } from '../../types';

interface CommitCell {
  level: number;
  count: number;
  dateStr: string;
  dayOfWeek: number;
  dateObj: Date;
}

interface GitHubCommitCalendarProps {
  commitGrid: CommitCell[][];
  t: GitHubTranslation;
  isEn: boolean;
}

export default function GitHubCommitCalendar({
  commitGrid,
  t,
  isEn,
}: GitHubCommitCalendarProps) {
  const getCommitColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-white/5';
      case 1:
        return 'bg-emerald-900/40 text-emerald-500';
      case 2:
        return 'bg-emerald-700/60 text-emerald-400';
      case 3:
        return 'bg-emerald-500/80 text-emerald-300';
      case 4:
        return 'bg-emerald-400 text-slate-950';
      default:
        return 'bg-white/5';
    }
  };

  const weekDays = t.weekdays;

  return (
    <div className="glass-card rounded-xl p-4" id="github-commit-graph-card">
      <div className="flex justify-between items-center mb-3">
        <span className="font-heading font-semibold text-xs text-white uppercase tracking-wider">
          {t.contributionsTitle}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          {t.contributionsCols}
        </span>
      </div>

      <div className="flex gap-2 items-start overflow-x-auto pt-8 pb-2 custom-scrollbar" id="heatmap-wrapper">
        {/* Week Day Labels column */}
        <div className="grid grid-rows-7 gap-[3px] text-[8px] text-slate-400 font-sans pr-1 pt-[2px]" id="heatmap-labels">
          {weekDays.map((d, i) => (
            <div key={i} className="h-[10px] flex items-center">
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Heatmap Cell Blocks */}
        <div className="flex-1 grid grid-rows-7 grid-flow-col gap-[3px] min-w-max relative" id="heatmap-cells">
          {commitGrid.map((weekCol, colIndex) => {
            return weekCol.map((cell, rowIndex) => {
              const cellDate = cell.dateObj;

              // Date formatting helpers
              const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const daysVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

              const dayName = isEn ? daysEn[cellDate.getDay()] : daysVi[cellDate.getDay()];
              const formattedDate = isEn 
                ? `${monthsEn[cellDate.getMonth()]} ${cellDate.getDate()}, ${cellDate.getFullYear()}`
                : `${cellDate.getDate()} thg ${cellDate.getMonth() + 1}, ${cellDate.getFullYear()}`;

              const contributionLabel = cell.count === 0
                ? t.noContributions
                : `${cell.count} ${t.contributions}`;

              return (
                <div key={`${colIndex}-${rowIndex}`} className="relative group/cell select-none">
                  <div
                    className={`w-[10px] h-[10px] rounded-[1.5px] transition-all hover:scale-125 cursor-pointer ${getCommitColor(cell.level)}`}
                  />
                  {/* Rich Floating Tooltip */}
                  <div className={`absolute bottom-full ${
                    colIndex < 6
                      ? "left-0 translate-x-0"
                      : colIndex >= 18
                        ? "right-0 left-auto translate-x-0"
                        : "left-1/2 -translate-x-1/2"
                  } mb-1.5 px-2.5 py-1.5 rounded-md bg-slate-900/95 border border-white/10 text-[9px] text-white whitespace-nowrap hidden group-hover/cell:block z-50 shadow-[0_4px_12px_rgba(0,0,0,0.5)] pointer-events-none text-center font-sans animate-fade-in`}>
                    <span className="font-semibold block text-amber-300 mb-0.5 text-center">
                      {contributionLabel}
                    </span>
                    <span className="text-[8px] text-slate-300 block text-center">
                      {dayName}, {formattedDate}
                    </span>
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>

      <div className="flex justify-end gap-1.5 items-center text-[9px] text-slate-400 mt-2" id="heatmap-legend">
        <span>{t.less}</span>
        <div className="w-[8px] h-[8px] rounded-[1px] bg-white/5" />
        <div className="w-[8px] h-[8px] rounded-[1px] bg-emerald-950" />
        <div className="w-[8px] h-[8px] rounded-[1px] bg-emerald-700" />
        <div className="w-[8px] h-[8px] rounded-[1px] bg-emerald-500" />
        <div className="w-[8px] h-[8px] rounded-[1px] bg-emerald-400" />
        <span>{t.more}</span>
      </div>
    </div>
  );
}
