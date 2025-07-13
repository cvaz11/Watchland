import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { user as mockUser } from '@/mocks/user';
import { User } from '@/types/watch';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  incrementIdentifications: () => void;
  incrementSavedWatches: () => void;
  decrementSavedWatches: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: () => set({ user: mockUser, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
      incrementIdentifications: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                identificationsCount: state.user.identificationsCount + 1,
              }
            : null,
        })),
      incrementSavedWatches: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                watchesSaved: state.user.watchesSaved + 1,
              }
            : null,
        })),
      decrementSavedWatches: () =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                watchesSaved: Math.max(0, state.user.watchesSaved - 1),
              }
            : null,
        })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);