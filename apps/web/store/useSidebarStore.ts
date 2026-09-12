import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setIsOpen: (isOpen: boolean) => void;
  isSidebarVisible: boolean;
  isHeaderVisible: boolean;
  toggleSidebarVisibility: () => void;
  toggleHeaderVisibility: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (isOpen) => set({ isOpen }),
  isSidebarVisible: true,
  isHeaderVisible: true,
  toggleSidebarVisibility: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),
  toggleHeaderVisibility: () => set((state) => ({ isHeaderVisible: !state.isHeaderVisible })),
}));
