import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { IdentificationResult, IdentificationSettings, AIAnalysis } from '@/types/watch';

interface IdentificationState {
  history: IdentificationResult[];
  settings: IdentificationSettings;
  isAnalyzing: boolean;
  currentAnalysis: AIAnalysis | null;
  addToHistory: (result: IdentificationResult) => void;
  updateSettings: (settings: Partial<IdentificationSettings>) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setCurrentAnalysis: (analysis: AIAnalysis | null) => void;
  clearHistory: () => void;
}

export const useIdentificationStore = create<IdentificationState>()(
  persist(
    (set, get) => ({
      history: [],
      settings: {
        precision: 'high',
        showConfidence: true,
        saveHistory: true,
      },
      isAnalyzing: false,
      currentAnalysis: null,
      addToHistory: (result) => {
        const { settings } = get();
        if (settings.saveHistory) {
          set((state) => ({
            history: [result, ...state.history.slice(0, 49)], // Keep last 50
          }));
        }
      },
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
      setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'identification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
        settings: state.settings,
      }),
    }
  )
);