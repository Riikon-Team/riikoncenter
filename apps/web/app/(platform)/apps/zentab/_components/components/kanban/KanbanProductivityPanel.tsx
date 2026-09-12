/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { KanbanCard, KanbanTranslation } from '../../types';

interface KanbanProductivityPanelProps {
  isEn: boolean;
  t: KanbanTranslation;
  cards: KanbanCard[];
  weeklyCompletedData: Array<{ date: string; dayName: string; count: number }>;
}

export default function KanbanProductivityPanel({
  t,
  cards,
  weeklyCompletedData,
}: KanbanProductivityPanelProps) {
  const maxCount = Math.max(...weeklyCompletedData.map(d => d.count), 1);
  const totalCompleted = cards.filter(c => c.columnId === 'done').length;
  const activeDays = weeklyCompletedData.filter(d => d.count > 0).length;

  return (
    <div className="shrink-0 p-5 rounded-2xl bg-white/[0.03] border border-white/5 mb-4 animate-slide-down flex flex-col md:flex-row gap-6 text-left" id="kanban-productivity-panel">
      {/* Stats Summary Column */}
      <div className="md:w-1/3 flex flex-col justify-between" id="productivity-stats-col">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <div className="w-1.5 h-3 bg-amber-400 rounded-full" />
            {t.weeklyProductivity}
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-normal">
            {t.weeklyProductivityDesc}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4" id="productivity-stats-grid">
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
              {t.completed}
            </span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
              {totalCompleted}
            </span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
              {t.activeDays}
            </span>
            <span className="text-2xl font-bold text-amber-300 mt-1 font-mono">
              {activeDays} <span className="text-xs text-slate-500 font-sans">/7</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart Column */}
      <div className="flex-1 flex flex-col bg-black/30 border border-white/5 p-4 rounded-xl relative" id="productivity-chart-col">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {t.completedTasksTrend}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {weeklyCompletedData.length > 0
              ? `${weeklyCompletedData[0].date} ~ ${weeklyCompletedData[6].date}`
              : ''}
          </span>
        </div>

        {/* Chart Grid Lines & Columns */}
        <div className="flex-1 flex items-end justify-between h-[120px] pt-4 relative" id="productivity-graph">
          {/* Horizontal reference help line */}
          <div className="absolute inset-x-0 bottom-0 border-b border-white/10" />
          <div className="absolute inset-x-0 bottom-1/2 border-b border-white/5 border-dashed" />

          {weeklyCompletedData.map((item, index) => {
            const isPeak = item.count > 0 && item.count === Math.max(...weeklyCompletedData.map(d => d.count), 1);
            const percentage = (item.count / maxCount) * 100;
            
            // Height scale logic
            const heightVal = item.count === 0 ? '6px' : `${Math.max(percentage, 15)}%`;

            return (
              <div key={item.date} className="flex-1 flex flex-col items-center group relative h-full justify-end px-1.5" id={`chart-col-${index}`}>
                
                {/* Tooltip Hover Bubble */}
                <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-1.5 bg-slate-950 border border-white/10 text-white text-[10px] py-1 px-2.5 rounded-lg pointer-events-none transition-all duration-200 z-10 whitespace-nowrap shadow-xl flex items-center justify-center gap-1.5 select-none transform translate-y-1 group-hover:translate-y-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">{item.count} {t.completedLabel}</span>
                  <span className="text-slate-500">({item.date.slice(5)})</span>
                </div>

                {/* Interactive Bar */}
                <div 
                  className={`w-full rounded-t-md transition-all duration-500 flex flex-col items-center justify-end relative cursor-pointer ${
                    item.count === 0 
                      ? 'bg-white/5 hover:bg-white/10' 
                      : isPeak
                        ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.25)] hover:bg-amber-300'
                        : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.15)] hover:bg-emerald-450'
                  }`}
                  style={{ height: heightVal }}
                  id={`bar-geom-${index}`}
                >
                  {/* Peak glow line dot */}
                  {item.count > 0 && (
                    <div className={`w-full h-[2px] absolute top-0 rounded-t-sm ${isPeak ? 'bg-white/45' : 'bg-white/25'}`} />
                  )}
                </div>

                {/* Day Label */}
                <span className="text-[10px] font-medium mt-2 text-slate-500 group-hover:text-slate-350 transition-colors tracking-wide shrink-0">
                  {item.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
