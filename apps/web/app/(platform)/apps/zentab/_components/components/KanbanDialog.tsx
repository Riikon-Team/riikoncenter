/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckSquare, Clock, Check, AlertCircle, Download, Upload } from 'lucide-react';
import { KanbanCard, SubTask, AppSettings, KanbanTranslation } from '../types';
import { useTranslation } from 'react-i18next';
import KanbanProductivityPanel from './kanban/KanbanProductivityPanel';
import KanbanAddCardForm from './kanban/KanbanAddCardForm';
import KanbanCardItem from './kanban/KanbanCardItem';

interface KanbanDialogProps {
  settings: AppSettings;
  onClose: () => void;
}

export interface KanbanColumn {
  id: string;
  label: string;
  color: string;
}

const PRESET_COLORS = [
  { hex: '#fb7185', labelKey: 'peachPink' },
  { hex: '#f59e0b', labelKey: 'amberYellow' },
  { hex: '#10b981', labelKey: 'jadeGreen' },
  { hex: '#3b82f6', labelKey: 'oceanBlue' },
  { hex: '#8b5cf6', labelKey: 'lavenderViolet' },
  { hex: '#f43f5e', labelKey: 'coralRed' },
  { hex: '#06b6d4', labelKey: 'cyanDream' },
  { hex: '#ec4899', labelKey: 'deepPink' }
];

function KanbanDialog({ settings, onClose }: KanbanDialogProps) {
  const { t: tHook, i18n } = useTranslation();
  const t = tHook('kanban', { returnObjects: true }) as unknown as KanbanTranslation;
  const isEn = settings.language === 'en';

  const defaultColumns: KanbanColumn[] = [
    { id: 'todo', label: t.presetTodo, color: '#fb7185' },
    { id: 'doing', label: t.presetDoing, color: '#f59e0b' },
    { id: 'done', label: t.presetDone, color: '#10b981' }
  ];

  const defaultCards: KanbanCard[] = [];

  // Columns state
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    try {
      const saved = localStorage.getItem('serene_productivity_kanban_columns');
      return saved ? JSON.parse(saved) : defaultColumns;
    } catch {
      return defaultColumns;
    }
  });

  // Cards state
  const [cards, setCards] = useState<KanbanCard[]>(() => {
    try {
      const saved = localStorage.getItem('serene_productivity_kanban_cards');
      return saved ? JSON.parse(saved) : defaultCards;
    } catch {
      return defaultCards;
    }
  });

  // Mobile layout selected tab
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    if (columns.length > 0 && !activeTab) {
      setActiveTab(columns[0].id);
    }
  }, [columns, activeTab]);

  // Drag and drop states
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);

  // New Column form state
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [newColColor, setNewColColor] = useState('#fb7185');

  // Edit Column inline state
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnLabel, setEditingColumnLabel] = useState('');
  const [editingColumnColor, setEditingColumnColor] = useState('');

  // Dropdown menus state
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // New Card form visibility state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProductivity, setShowProductivity] = useState(false);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('serene_productivity_kanban_columns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('serene_productivity_kanban_cards', JSON.stringify(cards));
  }, [cards]);

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ columns, cards }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `serene_kanban_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowExportDropdown(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const colMap = new Map(columns.map(c => [c.id, c.label]));
    const csvRows = [
      ['Title', 'Description', 'Column', 'Category', 'Priority', 'Due Date', 'Subtasks (Total)', 'Subtasks (Done)'].map(h => `"${h.replace(/"/g, '""')}"`).join(',')
    ];

    cards.forEach(card => {
      const colLabel = colMap.get(card.columnId) || card.columnId;
      const row = [
        card.title,
        card.description || '',
        colLabel,
        card.category || '',
        card.priority,
        card.dueDate || '',
        card.subtasks.length,
        card.subtasks.filter(s => s.completed).length
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
      csvRows.push(row);
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvRows.join("\n"));
    const altAnchor = document.createElement('a');
    altAnchor.setAttribute("href", csvContent);
    altAnchor.setAttribute("download", `serene_kanban_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(altAnchor);
    altAnchor.click();
    altAnchor.remove();
    setShowExportDropdown(false);
  };

  // Import Trigger File
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    performImport(file);
  };

  const performImport = (file: File) => {
    const rdr = new FileReader();
    rdr.onload = (event) => {
      try {
        const textStr = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(textStr);
          if (parsed && Array.isArray(parsed.columns) && Array.isArray(parsed.cards)) {
            setColumns(parsed.columns);
            setCards(parsed.cards);
            alert(t.importSuccess);
          } else {
            alert(t.importFail);
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = textStr.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) {
            alert(t.importFail);
            return;
          }
          // Parse basic CSV
          const importedCards: KanbanCard[] = [];

          for (let i = 1; i < lines.length; i++) {
            const rowMatches = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
            const rowValues = rowMatches.map(v => v.replace(/^"|"$/g, '').trim());
            if (rowValues.length < 3) continue;

            const tColLabel = rowValues[2] || 'todo';
            let matchingCol = columns.find(c => c.label.toLowerCase() === tColLabel.toLowerCase() || c.id === tColLabel);
            if (!matchingCol && columns.length > 0) {
              matchingCol = columns[0];
            }

            importedCards.push({
              id: 'k-' + Date.now() + '-' + i,
              title: rowValues[0] || 'Task ' + i,
              description: rowValues[1] || '',
              columnId: matchingCol ? matchingCol.id : 'todo',
              category: rowValues[3] || 'General',
              priority: (rowValues[4] === 'low' || rowValues[4] === 'high' ? rowValues[4] : 'medium') as 'low' | 'medium' | 'high',
              dueDate: rowValues[5] || 'Today',
              subtasks: []
            });
          }

          if (importedCards.length > 0) {
            setCards([...cards, ...importedCards]);
            alert(t.importSuccess);
          } else {
            alert(t.importFail);
          }
        }
      } catch (err) {
        alert(t.importFail);
      }
    };
    rdr.readAsText(file);
    setShowImportDropdown(false);
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggingCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    setDragOverColumnId(null);
  };

  const handleDragOverColumn = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnterColumn = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverColumnId(colId);
  };

  const handleDropOnColumn = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      moveCard(cardId, targetColId);
    }
    setDragOverColumnId(null);
  };

  const getWeeklyCompletedData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateString = d.toISOString().slice(0, 10);
      
      const count = cards.filter(card => {
        if (card.columnId === 'done') {
          if (card.completedAt) {
            return card.completedAt === dateString;
          } else {
            if (card.id === 'k3') {
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);
              return yesterday.toISOString().slice(0, 10) === dateString;
            }
            return today.toISOString().slice(0, 10) === dateString;
          }
        }
        return false;
      }).length;

      const dayName = d.toLocaleDateString(isEn ? 'en-US' : 'vi-VN', { weekday: 'short' });
      data.push({
        date: dateString,
        dayName,
        count
      });
    }
    return data;
  };

  const moveCard = (cardId: string, destColumnId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const isDone = destColumnId === 'done';
        const todayStr = new Date().toISOString().slice(0, 10);
        return {
          ...c,
          columnId: destColumnId,
          completed: isDone,
          completedAt: isDone ? todayStr : undefined
        };
      }
      return c;
    }));
  };

  const handleAddCard = (formData: {
    title: string;
    description: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    dueTime: string;
    targetColumnId: string;
    rawSubtasks: string;
  }) => {
    const subList: SubTask[] = formData.rawSubtasks
      .split('\n')
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(Boolean)
      .map((item, index) => ({
        id: `sub-${Date.now()}-${index}`,
        title: item,
        completed: false
      }));

    const nextCard: KanbanCard = {
      id: 'k-' + Date.now(),
      columnId: formData.targetColumnId,
      title: formData.title,
      description: formData.description || "",
      category: formData.category || "",
      priority: formData.priority,
      dueDate: formData.dueDate || "",
      dueTime: formData.dueTime || "",
      subtasks: subList,
      completed: formData.targetColumnId === 'done',
      completedAt: formData.targetColumnId === 'done' ? new Date().toISOString().slice(0, 10) : ""
    };

    setCards([nextCard, ...cards]);
    setShowAddForm(false);
  };

  const toggleSubtask = (cardId: string, subId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return {
          ...c,
          subtasks: c.subtasks.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
        };
      }
      return c;
    }));
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm(t.deleteCardConfirm)) {
      setCards(prev => prev.filter(c => c.id !== cardId));
    }
  };

  const handleDeleteColumn = (colId: string) => {
    if (window.confirm(t.deleteColumnConfirm)) {
      setColumns(prev => prev.filter(c => c.id !== colId));
      setCards(prev => prev.filter(c => c.columnId !== colId));
    }
  };

  const startEditingColumn = (col: KanbanColumn) => {
    setEditingColumnId(col.id);
    setEditingColumnLabel(col.label);
    setEditingColumnColor(col.color);
  };

  const handleSaveEditedColumn = (colId: string) => {
    if (!editingColumnLabel.trim()) return;
    setColumns(prev => prev.map(c => c.id === colId ? { ...c, label: editingColumnLabel.trim(), color: editingColumnColor } : c));
    setEditingColumnId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all animate-fade-in" id="kanban-overlay">
      <div className="glass-dialog w-full max-w-6xl rounded-2xl p-6 relative flex flex-col h-[90vh] overflow-hidden animate-slide-up" id="kanban-dialog-box">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4 shrink-0 gap-3" id="kanban-dialog-header">
          <div className="flex items-center gap-2">
            <CheckSquare className="text-white" size={20} />
            <div>
              <h3 className="font-heading font-semibold text-lg text-white" id="kanban-dialog-title">
                {t.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1" id="kanban-dialog-subtitle">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end" id="kanban-header-actions">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowExportDropdown(!showExportDropdown);
                  setShowImportDropdown(false);
                }}
                className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-300 font-heading font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                id="kanban-export-trigger-btn"
              >
                <Download size={12} /> {t.exportLabel}
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-slate-950 border border-white/10 rounded-lg shadow-lg py-1 z-30 animate-slide-down">
                  <button
                    onClick={handleExportJSON}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    🚀 {t.exportJSON}
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    📊 {t.exportCSV}
                  </button>
                </div>
              )}
            </div>

            {/* Import Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowImportDropdown(!showImportDropdown);
                  setShowExportDropdown(false);
                }}
                className="px-3.5 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-300 font-heading font-semibold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                id="kanban-import-trigger-btn"
              >
                <Upload size={12} /> {t.importLabel}
              </button>
              {showImportDropdown && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-slate-950 border border-white/10 rounded-lg shadow-lg p-2.5 z-30 animate-slide-down text-left space-y-2">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase">{t.importJSON} / {t.importCSV}</label>
                  <div className="border border-dashed border-white/10 hover:border-white/20 rounded-md p-2 text-center relative cursor-pointer hover:bg-white/5">
                    <span className="text-[10px] text-slate-400 font-medium block">{t.tapToBrowse}</span>
                    <span className="text-[8px] text-slate-500 block mt-0.5">{t.orDropLabel}</span>
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={handleImportFile}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              id="kanban-close-btn"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Toolbar & Create Triggers */}
        <div className="shrink-0 pt-4 pb-2 flex flex-wrap gap-2 items-center" id="kanban-toolbar">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) setShowProductivity(false);
            }}
            className="px-4 py-2 bg-white text-slate-950 font-heading font-semibold text-xs rounded-lg shadow hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            id="kanban-btn-toggle-add"
          >
            {showAddForm ? t.cancelBtn : <><Plus size={13} strokeWidth={2.5} /> {t.addCardBtn}</>}
          </button>

          <button
            onClick={() => {
              setShowProductivity(!showProductivity);
              if (!showProductivity) setShowAddForm(false);
            }}
            className={`px-4 py-2 font-heading font-semibold text-xs rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border ${
              showProductivity
                ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
            }`}
            id="kanban-btn-toggle-productivity"
          >
            <Clock size={13} />
            {t.weeklyProductivity}
          </button>
        </div>

        {/* Weekly Productivity Visual Summary Panel */}
        {showProductivity && (
          <KanbanProductivityPanel
            isEn={isEn}
            t={t}
            cards={cards}
            weeklyCompletedData={getWeeklyCompletedData()}
          />
        )}

        {/* Dynamic task adding dialog form */}
        {showAddForm && (
          <KanbanAddCardForm
            columns={columns}
            t={t}
            isEn={isEn}
            onAddCard={handleAddCard}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Column Navigation Tabs on Mobile Device layout */}
        <div className="flex md:hidden bg-white/5 p-1 rounded-xl gap-1 my-3 overflow-x-auto custom-scrollbar shrink-0" id="kanban-mobile-tabs">
          {columns.map(col => (
            <button
              key={col.id}
              onClick={() => setActiveTab(col.id)}
              className={`py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                activeTab === col.id ? 'bg-white/15 text-white' : 'text-slate-400'
              }`}
              id={`kanban-tab-btn-${col.id}`}
            >
              {col.label} ({cards.filter(c => c.columnId === col.id).length})
            </button>
          ))}
          <button
            onClick={() => {
              setShowAddCol(true);
              setNewColColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].hex);
            }}
            className="py-1.5 px-3 text-xs mt-0.5 border border-dashed border-white/20 select-none text-slate-400 font-semibold rounded-lg hover:text-white cursor-pointer shrink-0"
          >
            + {t.newColumn}
          </button>
        </div>

        {/* Board Desk Container with Horizontal Scroll Support */}
        <div className="flex-1 flex flex-col md:flex-row gap-5 overflow-x-auto pb-4 pt-4 custom-scrollbar" id="kanban-grid-board">
          {columns.map((col) => {
            const colCards = cards.filter(c => c.columnId === col.id);
            const isEditingThisCol = editingColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={handleDragOverColumn}
                onDragEnter={(e) => handleDragEnterColumn(e, col.id)}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
                className={`flex flex-col h-full bg-white/[0.02] border rounded-2xl p-4 border-t-2 transition-all w-full md:w-[310px] shrink-0 ${
                  dragOverColumnId === col.id ? 'border-amber-400/30 bg-white/[0.05]' : 'border-white/5'
                } ${activeTab === col.id ? 'flex' : 'hidden md:flex'}`}
                style={{ borderTopColor: col.color }}
                id={`kanban-col-wrapper-${col.id}`}
              >
                {/* Column Headline Header */}
                <div className="flex flex-col mb-3.5 pb-2 border-b border-white/5" id={`kanban-col-header-${col.id}`}>
                  {isEditingThisCol ? (
                    <div className="space-y-3.5 w-full bg-slate-900/40 p-3 rounded-xl border border-white/10 animate-fade-in" id="column-edit-form">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">{t.columnLabel}</label>
                        <input
                          type="text"
                          value={editingColumnLabel}
                          onChange={e => setEditingColumnLabel(e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded bg-black/60 border border-white/10 text-white focus:outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">{t.accentTheme}</label>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {PRESET_COLORS.map(c => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => setEditingColumnColor(c.hex)}
                              className="w-5 h-5 rounded-full border border-white/10 relative transition-all"
                              style={{ backgroundColor: c.hex }}
                              title={t.colorNames[c.labelKey]}
                            >
                              {editingColumnColor === c.hex && (
                                <Check size={8} strokeWidth={4} className="text-slate-950 absolute inset-0 m-auto font-black" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => setEditingColumnId(null)}
                          className="px-2.5 py-1 text-[10px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {t.cancel}
                        </button>
                        <button
                          onClick={() => handleSaveEditedColumn(col.id)}
                          className="px-3.5 py-1 text-[10px] font-bold bg-white text-slate-950 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {t.save}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center w-full">
                      <div 
                        className="flex items-center gap-2 overflow-hidden cursor-pointer select-none"
                        onDoubleClick={() => startEditingColumn(col)}
                        title={t.doubleClickEditCol}
                      >
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 hover:scale-125 transition-transform" 
                          style={{ backgroundColor: col.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingColumn(col);
                          }}
                          title={t.changeColColor}
                        />
                        <span className="font-heading font-semibold text-xs text-white uppercase tracking-wider truncate hover:text-amber-300 transition-colors" id={`col-title-${col.id}`}>
                          {col.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full bg-white/5 text-[9px] text-slate-400 border border-white/5 font-mono shrink-0" id={`col-counter-${col.id}`}>
                          {colCards.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEditingColumn(col)}
                          className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/5 transition-all text-[10px] font-medium cursor-pointer"
                          title={t.editCol}
                        >
                          {t.editCol.split(' ')[0]}
                        </button>
                        <button
                          onClick={() => handleDeleteColumn(col.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                          title={t.deleteCol}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cards Container List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1" id={`kanban-cards-scroller-${col.id}`}>
                  {colCards.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 font-sans text-xs border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                      {t.emptyCol}
                    </div>
                  ) : (
                    colCards.map(card => (
                      <KanbanCardItem
                        key={card.id}
                        card={card}
                        columnId={col.id}
                        columns={columns}
                        t={t}
                        isEn={isEn}
                        draggingCardId={draggingCardId}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onToggleSubtask={toggleSubtask}
                        onDeleteCard={handleDeleteCard}
                        onMoveCard={moveCard}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Add dynamic column item box */}
          <div className="w-full md:w-[310px] shrink-0" id="kanban-add-column-scroller-wrap">
            {showAddCol ? (
              <div className="flex flex-col bg-white/[0.02] border border-white/10 rounded-2xl p-4 border-t-2 animate-fade-in text-left font-sans" style={{ borderTopColor: newColColor }}>
                <h4 className="font-heading font-semibold text-white text-xs uppercase mb-3 pb-2 border-b border-white/5">{t.newColumn}</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">{t.newColumnLabel} *</label>
                    <input
                      type="text"
                      value={newColLabel}
                      onChange={e => setNewColLabel(e.target.value)}
                      placeholder={t.newColumnPlaceholder}
                      className="w-full px-2 py-1.5 text-xs rounded bg-black/45 border border-white/10 text-white focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 mb-1">{t.columnAccentTheme}</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setNewColColor(c.hex)}
                          className="w-5 h-5 rounded-full border border-white/10 relative transition-all hover:scale-105"
                          style={{ backgroundColor: c.hex }}
                          title={t.colorNames[c.labelKey]}
                        >
                          {newColColor === c.hex && (
                            <Check size={8} strokeWidth={4} className="text-slate-950 absolute inset-0 m-auto font-black" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1.5 border-t border-white/5">
                    <button
                      onClick={() => {
                        setShowAddCol(false);
                        setNewColLabel('');
                      }}
                      className="px-2.5 py-1 text-[10px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => {
                        if (!newColLabel.trim()) return;
                        const newColId = `col-${Date.now()}`;
                        setColumns([...columns, { id: newColId, label: newColLabel.trim(), color: newColColor }]);
                        setShowAddCol(false);
                        setNewColLabel('');
                      }}
                      className="px-3 py-1 text-[10px] font-bold bg-white text-slate-950 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {t.addColumn}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowAddCol(true);
                  setNewColColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)].hex);
                }}
                className="w-full h-[140px] flex flex-col justify-center items-center bg-white/[0.01] hover:bg-white/[0.03] border border-dashed border-white/10 hover:border-white/20 rounded-2xl p-4 transition-colors cursor-pointer text-slate-400 hover:text-white group"
                id="kanban-add-column-card-btn"
              >
                <Plus size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">{t.addColumnBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(KanbanDialog);
