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
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'vs-dark' | 'vs-light') => void;
  setFontSize: (fontSize: number) => void;
  setWordWrap: (wordWrap: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
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
      setCode: (code) => set({ code }),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setWordWrap: (wordWrap) => set({ wordWrap }),
      setAutoSave: (autoSave) => set({ autoSave }),
      resetEditor: () => set({
        code: '',
        language: SUPPORTED_LANGUAGES[0].id,
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