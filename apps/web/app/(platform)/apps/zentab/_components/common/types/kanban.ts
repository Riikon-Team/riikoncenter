/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface KanbanCard {
  id: string;
  columnId: string;
  title: string;
  description: string;
  category: string; // e.g. Design, Development, Research, High Priority
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // e.g. "Tomorrow", "Today", "Overdue", date strings
  dueTime?: string; // e.g. "14:30"
  completed?: boolean;
  completedAt?: string; // e.g. "2026-06-11"
  subtasks: SubTask[];
  assignees?: string[]; // image URLs or initials
}
