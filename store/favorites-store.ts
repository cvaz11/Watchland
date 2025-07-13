import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Watch } from '@/types/watch';

interface FavoritesState {
  favorites: Watch[];
  addFavorite: (watch: Watch) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (watch) => {
        const updatedWatch = { ...watch, isFavorite: true };
        set((state) => ({
          favorites: [...state.favorites, updatedWatch],
        }));
      },
      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((watch) => watch.id !== id),
        }));
      },
      isFavorite: (id) => {
        return get().favorites.some((watch) => watch.id === id);
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);