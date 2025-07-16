import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { APIConfiguration } from '@/types/watch';
import { testAPIConnection } from '@/services/ai-identification';

interface APIState {
  config: APIConfiguration;
  isLoading: boolean;
  updateConfig: (config: Partial<APIConfiguration>) => void;
  testConnection: () => Promise<boolean>;
  clearConfig: () => void;
}

export const useAPIStore = create<APIState>()(
  persist(
    (set, get) => ({
      config: {
        isConfigured: false,
      },
      isLoading: false,
      updateConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig },
        }));
      },
      testConnection: async () => {
        set({ isLoading: true });
        try {
          const result = await testAPIConnection();
          const now = new Date().toISOString();
          
          set((state) => ({
            config: {
              ...state.config,
              lastTested: now,
              isValid: result.isValid,
              isConfigured: result.isValid,
            },
            isLoading: false,
          }));
          
          return result.isValid;
        } catch (error) {
          set((state) => ({
            config: {
              ...state.config,
              isValid: false,
              isConfigured: false,
            },
            isLoading: false,
          }));
          return false;
        }
      },
      clearConfig: () => {
        set({
          config: {
            isConfigured: false,
          },
        });
      },
    }),
    {
      name: 'api-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        config: state.config,
      }),
    }
  )
);