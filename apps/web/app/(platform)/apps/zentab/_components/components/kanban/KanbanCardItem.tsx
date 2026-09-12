/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, CheckSquare, Calendar, Clock, Check } from 'lucide-react';
import { KanbanCard, KanbanTranslation } from '../../types';
import { KanbanColumn } from '../KanbanDialog';

interface KanbanCardItemProps {
  card: KanbanCard;
  columnId: string;
  columns: KanbanColumn[];
  t: KanbanTranslation;
  isEn: boolean;
  draggingCardId: string | null;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
  onDragEnd: () => void;
  onToggleSubtask: (cardId: string, subId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onMoveCard: (cardId: string, destColumnId: string) => void;
}

export default function KanbanCardItem({
  card,
  columnId,
  columns,
  t,
  isEn,
  draggingCardId,
  onDragStart,
  onDragEnd,
  onToggleSubtask,
  onDeleteCard,
  onMoveCard,
}: KanbanCardItemProps) {
  const completeSubs = card.subtasks.filter(s => s.completed).length;
  const hasSubtasks = card.subtasks.length > 0;

  const getPriorityColor = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
  };

  const getDueDateColor = (d?: string) => {
    if (!d) return 'text-slate-500';
    const cleanStr = d.toLowerCase();
    if (cleanStr.includes('hôm nay') || cleanStr.includes('today') || cleanStr.includes('khẩn')) {
      return 'text-rose-400 font-semibold';
    }
    return 'text-slate-400';
  };

  const getPriorityLabel = (p: 'low' | 'medium' | 'high') => {
    switch (p) {
      case 'high':
        return t.priorities.high;
      case 'medium':
        return t.priorities.medium;
      case 'low':
        return t.priorities.low;
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragEnd={onDragEnd}
      className={`bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all cursor-grab active:cursor-grabbing text-left ${
        draggingCardId === card.id ? 'opacity-40 border-dashed border-white/30 scale-[0.98]' : ''
      }`}
      id={`kanban-card-${card.id}`}
    >
      <div className="flex justify-between items-start gap-1" id="card-inner-top">
        <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border ${getPriorityColor(card.priority)} uppercase tracking-wider`}>
          {getPriorityLabel(card.priority)}
        </span>
        <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wide truncate max-w-[100px]" title={card.category}>
          {card.category}
        </span>
      </div>

      <h5 className="font-heading font-medium text-xs text-white mt-2 leading-relaxed" id="card-inner-title">
        {card.title}
      </h5>

      {card.description && (
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-normal" id="card-inner-desc">
          {card.description}
        </p>
      )}

      {/* Subtasks Progress view */}
      {hasSubtasks && (
        <div className="mt-3.5 space-y-1.5 border-t border-white/5 pt-3" id="card-inner-subtasks">
          <div className="flex justify-between text-[9px] text-slate-400 font-sans" id="card-subtask-header">
            <span className="flex items-center gap-1 font-semibold">
              <CheckSquare size={10} /> {t.subtasksTitle}
            </span>
            <span>{completeSubs}/{card.subtasks.length}</span>
          </div>
          <div className="space-y-1">
            {card.subtasks.map(sub => (
              <div
                key={sub.id}
                onClick={() => onToggleSubtask(card.id, sub.id)}
                className="flex items-center gap-2 text-[10px] text-slate-300 hover:text-white cursor-pointer select-none"
                id={`subtask-${sub.id}`}
              >
                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                  sub.completed ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-white/20 hover:border-white'
                }`}>
                  {sub.completed && <Check size={8} strokeWidth={4} />}
                </div>
                <span className={`${sub.completed ? 'line-through text-slate-500' : ''} truncate`}>
                  {sub.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls Footer */}
      <div className="flex justify-between items-center mt-3.5 border-t border-white/5 pt-2.5" id="card-inner-footer">
        <div className={`flex flex-col gap-0.5 text-[10px] ${getDueDateColor(card.dueDate)}`} id="card-due-indicator">
          <div className="flex items-center gap-1 font-semibold">
            <Calendar size={10} className="shrink-0" />
            <span className="truncate">{card.dueDate}</span>
          </div>
          {card.dueTime && (
            <div className="flex items-center gap-1 opacity-70 font-mono text-[9px] pl-3.5">
              <Clock size={9} className="shrink-0" />
              <span>{card.dueTime}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5" id="card-inner-routing">
          <button
            onClick={() => onDeleteCard(card.id)}
            className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
            title={t.deleteCard}
          >
            <Trash2 size={11} />
          </button>

          {/* Task Completion checkmark button instead of moving Left/Right arrows */}
          <button
            onClick={() => {
              if (columnId === 'done') {
                onMoveCard(card.id, columns[0]?.id || 'todo');
              } else {
                onMoveCard(card.id, 'done');
              }
            }}
            className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors cursor-pointer border ${
              columnId === 'done'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/25'
            }`}
            title={columnId === 'done' ? t.markIncomplete : t.markComplete}
          >
            <Check size={12} strokeWidth={columnId === 'done' ? 3.5 : 2} />
          </button>
        </div>
      </div>
    </div>
  );
}
