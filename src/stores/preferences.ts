import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type LanguageCode =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'ja'
  | 'zh'
  | 'si'
  | 'ta'
  | 'hi'
  | 'ar'

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  locale: string
  decimals: number
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$',    name: 'US Dollar (USD)', locale: 'en-US', decimals: 2 },
  { code: 'LKR', symbol: 'Rs',   name: 'Sri Lankan Rupee (LKR)', locale: 'en-LK', decimals: 2 },
  { code: 'EUR', symbol: '€',    name: 'Euro (EUR)', locale: 'de-DE', decimals: 2 },
  { code: 'GBP', symbol: '£',    name: 'British Pound (GBP)', locale: 'en-GB', decimals: 2 },
  { code: 'CAD', symbol: 'CA$',  name: 'Canadian Dollar (CAD)', locale: 'en-CA', decimals: 2 },
  { code: 'AUD', symbol: 'A$',   name: 'Australian Dollar (AUD)', locale: 'en-AU', decimals: 2 },
  { code: 'JPY', symbol: '¥',    name: 'Japanese Yen (JPY)', locale: 'ja-JP', decimals: 0 },
  { code: 'CNY', symbol: '¥',    name: 'Chinese Yuan (CNY)', locale: 'zh-CN', decimals: 2 },
  { code: 'INR', symbol: '₹',    name: 'Indian Rupee (INR)', locale: 'en-IN', decimals: 2 },
  { code: 'AED', symbol: 'AED',  name: 'UAE Dirham (AED)', locale: 'ar-AE', decimals: 2 },
  { code: 'SGD', symbol: 'S$',   name: 'Singapore Dollar (SGD)', locale: 'en-SG', decimals: 2 },
  { code: 'CHF', symbol: 'CHF',  name: 'Swiss Franc (CHF)', locale: 'de-CH', decimals: 2 },
  { code: 'COP', symbol: 'COP$', name: 'Colombian Peso (COP)', locale: 'es-CO', decimals: 0 },
  { code: 'MXN', symbol: 'MX$',  name: 'Mexican Peso (MXN)', locale: 'es-MX', decimals: 2 },
  { code: 'BRL', symbol: 'R$',   name: 'Brazilian Real (BRL)', locale: 'pt-BR', decimals: 2 },
]

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'si', name: 'Sinhala', native: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇱🇰' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', native: '简体中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇦🇪' },
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
