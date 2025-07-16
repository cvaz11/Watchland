import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { APIConfiguration } from '@/types/watch';
import { testAPIConnection, testSupabaseConnection } from '@/services/ai-identification';

interface APIState {
  config: APIConfiguration;
  isLoading: boolean;
  updateConfig: (config: Partial<APIConfiguration>) => void;
  testOpenAIConnection: () => Promise<boolean>;
  testSupabaseConnection: () => Promise<boolean>;
  clearConfig: () => void;
  clearOpenAIConfig: () => void;
  clearSupabaseConfig: () => void;
}

export const useAPIStore = create<APIState>()(
  persist(
    (set, get) => ({
      config: {
        isOpenAIConfigured: false,
        isSupabaseConfigured: false,
        isConfigured: false,
      },
      isLoading: false,
      updateConfig: (newConfig) => {
        set((state) => {
          const updatedConfig = { ...state.config, ...newConfig };
          
          // Update overall configuration status
          updatedConfig.isConfigured = updatedConfig.isOpenAIConfigured || updatedConfig.isSupabaseConfigured;
          
          return {
            config: updatedConfig,
          };
        });
      },
      testOpenAIConnection: async () => {
        set({ isLoading: true });
        try {
          const result = await testAPIConnection();
          const now = new Date().toISOString();
          
          set((state) => ({
            config: {
              ...state.config,
              lastTested: now,
              openaiValid: result.isValid,
              isOpenAIConfigured: result.isValid,
              isConfigured: result.isValid || state.config.isSupabaseConfigured,
              isValid: result.isValid || state.config.supabaseValid,
            },
            isLoading: false,
          }));
          
          return result.isValid;
        } catch (error) {
          set((state) => ({
            config: {
              ...state.config,
              openaiValid: false,
              isOpenAIConfigured: false,
              isConfigured: state.config.isSupabaseConfigured,
              isValid: state.config.supabaseValid,
            },
            isLoading: false,
          }));
          return false;
        }
      },
      testSupabaseConnection: async () => {
        set({ isLoading: true });
        try {
          const { config } = get();
          const result = await testSupabaseConnection(config.supabaseUrl, config.supabaseAnonKey);
          const now = new Date().toISOString();
          
          set((state) => ({
            config: {
              ...state.config,
              lastTested: now,
              supabaseValid: result.isValid,
              isSupabaseConfigured: result.isValid,
              isConfigured: result.isValid || state.config.isOpenAIConfigured,
              isValid: result.isValid || state.config.openaiValid,
            },
            isLoading: false,
          }));
          
          return result.isValid;
        } catch (error) {
          set((state) => ({
            config: {
              ...state.config,
              supabaseValid: false,
              isSupabaseConfigured: false,
              isConfigured: state.config.isOpenAIConfigured,
              isValid: state.config.openaiValid,
            },
            isLoading: false,
          }));
          return false;
        }
      },
      clearConfig: () => {
        set({
          config: {
            isOpenAIConfigured: false,
            isSupabaseConfigured: false,
            isConfigured: false,
          },
        });
      },
      clearOpenAIConfig: () => {
        set((state) => ({
          config: {
            ...state.config,
            openaiApiKey: undefined,
            isOpenAIConfigured: false,
            openaiValid: false,
            isConfigured: state.config.isSupabaseConfigured,
            isValid: state.config.supabaseValid,
          },
        }));
      },
      clearSupabaseConfig: () => {
        set((state) => ({
          config: {
            ...state.config,
            supabaseUrl: undefined,
            supabaseAnonKey: undefined,
            isSupabaseConfigured: false,
            supabaseValid: false,
            isConfigured: state.config.isOpenAIConfigured,
            isValid: state.config.openaiValid,
          },
        }));
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