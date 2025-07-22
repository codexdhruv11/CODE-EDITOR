import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

interface EditorState {
  code: string;
  language: string;
  theme: 'vs-dark' | 'vs-light';
  fontSize: number;
  wordWrap: boolean;
  autoSave: boolean;
  executionResults: {
    output: string;
    status: 'idle' | 'success' | 'error';
    executionTime: number | null;
  };
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'vs-dark' | 'vs-light') => void;
  setFontSize: (fontSize: number) => void;
  setWordWrap: (wordWrap: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  setExecutionResults: (results: { output: string; status: 'idle' | 'success' | 'error'; executionTime: number | null }) => void;
  clearExecutionResults: () => void;
  resetEditor: () => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      code: '',
      language: SUPPORTED_LANGUAGES[0].id, // Default to first language (JavaScript)
      theme: 'vs-dark',
      fontSize: 16,
      wordWrap: true,
      autoSave: true,
      executionResults: {
        output: '',
        status: 'idle',
        executionTime: null,
      },
      setCode: (code) => set({ code }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
      setAutoSave: (autoSave) => set({ autoSave }),
      setExecutionResults: (results) => set({ executionResults: results }),
      clearExecutionResults: () => set({ 
        executionResults: {
          output: '',
          status: 'idle',
          executionTime: null,
        }
      }),
      resetEditor: () => set({
        code: '',
        language: SUPPORTED_LANGUAGES[0].id,
        executionResults: {
          output: '',
          status: 'idle',
          executionTime: null,
        }
      }),
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        wordWrap: state.wordWrap,
        autoSave: state.autoSave,
      }),
    }
  )
); 