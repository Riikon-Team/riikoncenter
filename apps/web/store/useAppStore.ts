import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStoreState {
  favoriteAppIds: string[];
  recentAppIds: string[];
  toggleFavorite: (id: string) => void;
  addRecentApp: (id: string) => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      favoriteAppIds: [],
      recentAppIds: [],
      toggleFavorite: (id) =>
        set((state) => ({
          favoriteAppIds: state.favoriteAppIds.includes(id)
            ? state.favoriteAppIds.filter((appId) => appId !== id)
            : [...state.favoriteAppIds, id],
        })),
      addRecentApp: (id) =>
        set((state) => {
          // Remove if exists to push to front
          const filtered = state.recentAppIds.filter((appId) => appId !== id);
          return {
            recentAppIds: [id, ...filtered].slice(0, 10), // Keep last 10
          };
        }),
    }),
    {
      name: 'riikon-app-preferences',
    }
  )
);
