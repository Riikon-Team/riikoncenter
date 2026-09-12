/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { KanbanTranslation } from '../../types';
import { KanbanColumn } from '../KanbanDialog';

interface KanbanAddCardFormProps {
  columns: KanbanColumn[];
  t: KanbanTranslation;
  isEn: boolean;
  onAddCard: (cardData: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    dueTime: string;
    targetColumnId: string;
    rawSubtasks: string;
  }) => void;
  onCancel: () => void;
}

export default function KanbanAddCardForm({
  columns,
  t,
  isEn,
  onAddCard,
  onCancel,
}: KanbanAddCardFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('12:00');
  const [targetColumnId, setTargetColumnId] = useState('');
  const [rawSubtasks, setRawSubtasks] = useState('');

  // Sync defaults on mount / language switch
  useEffect(() => {
    setCategory(t.defaultCategory);
    setDueDate(t.defaultDueDate);
  }, [t]);

  useEffect(() => {
    if (columns.length > 0 && !targetColumnId) {
      setTargetColumnId(columns[0].id);
    }
  }, [columns, targetColumnId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddCard({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority,
      dueDate: dueDate.trim(),
      dueTime: dueTime.trim(),
      targetColumnId,
      rawSubtasks: rawSubtasks.trim(),
    });

    // Reset state
    setTitle('');
    setDescription('');
    setCategory(t.defaultCategory);
    setPriority('medium');
    setDueDate(t.defaultDueDate);
    setDueTime('12:00');
    setRawSubtasks('');
  };

  return (
    <div className="shrink-0 p-4 rounded-xl bg-white/5 border border-white/5 mb-4 max-h-[350px] overflow-y-auto custom-scrollbar animate-slide-down" id="kanban-add-card-form-box">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">{t.cardTitleLabel} *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t.cardTitlePlaceholder}
              className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">{t.cardCatLabel}</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder={t.cardCatPlaceholder}
              className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">{t.cardDescLabel}</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t.cardDescPlaceholder}
            className="w-full h-14 px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-white resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">{t.cardPriorityLabel}</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none cursor-pointer"
            >
              <option value="low" className="bg-slate-900">{t.priorities.low}</option>
              <option value="medium" className="bg-slate-900">{t.priorities.medium}</option>
              <option value="high" className="bg-slate-900">{t.priorities.high}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">{t.cardDueDateLabel}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                placeholder={t.cardDueDatePlaceholder}
                className="w-2/3 px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-white"
              />
              <input
                type="time"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                className="w-1/3 px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none focus:border-white cursor-pointer"
                title={t.dueTimeTitle}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">{t.destColumn}</label>
            <select
              value={targetColumnId}
              onChange={e => setTargetColumnId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none cursor-pointer"
            >
              {columns.map(col => (
                <option key={col.id} value={col.id} className="bg-slate-900">{col.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">{t.cardSubtasksLabel}</label>
          <textarea
            value={rawSubtasks}
            onChange={e => setRawSubtasks(e.target.value)}
            placeholder={t.cardSubtasksPlaceholder}
            className="w-full h-16 px-3 py-2 text-xs rounded-lg bg-black/40 border border-white/10 text-white focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {t.cancelBtn}
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {t.saveCardBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
