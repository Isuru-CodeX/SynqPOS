import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LanguageCode = 'en' | 'es'

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  locale: string
  decimals: number
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)', locale: 'en-US', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'de-DE', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', locale: 'en-GB', decimals: 2 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)', locale: 'en-CA', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (AUD)', locale: 'en-AU', decimals: 2 },
  { code: 'COP', symbol: 'COP$', name: 'Colombian Peso (COP)', locale: 'es-CO', decimals: 0 },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso (MXN)', locale: 'es-MX', decimals: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (BRL)', locale: 'pt-BR', decimals: 2 },
]

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const

interface PreferencesState {
  language: LanguageCode
  currency: string
  setLanguage: (language: LanguageCode) => void
  setCurrency: (currency: string) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: 'en', // English by default
      currency: 'USD', // USD by default
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'synqpos-preferences',
    }
  )
)
