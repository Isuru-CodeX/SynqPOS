import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode    = 'light' | 'dark'
export type ThemeAccent  = 'gemini' | 'azul' | 'indigo' | 'teal'
export type ThemeSpacing = 'comodo' | 'compacto'

interface ThemeState {
  mode:       ThemeMode
  accent:     ThemeAccent
  spacing:    ThemeSpacing
  showIntro:  boolean
  setMode:      (mode: ThemeMode)       => void
  toggleMode:   ()                      => void
  setAccent:    (accent: ThemeAccent)   => void
  setSpacing:   (spacing: ThemeSpacing) => void
  setShowIntro: (show: boolean)         => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode:      'dark', // Dark theme by default
      accent:    'gemini', // Gemini colors by default
      spacing:   'comodo',
      showIntro: true,
      setMode:      (mode)      => set({ mode }),
      toggleMode:   ()          => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
      setAccent:    (accent)    => set({ accent }),
      setSpacing:   (spacing)   => set({ spacing }),
      setShowIntro: (showIntro) => set({ showIntro }),
    }),
    { name: 'synqpos-theme' }
  )
)
