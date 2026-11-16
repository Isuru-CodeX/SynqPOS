import { X, Moon, Sun, Sparkles, Globe, Coins } from 'lucide-react'
import { useThemeStore } from '@/stores/theme'
import { usePreferencesStore, SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES, type LanguageCode } from '@/stores/preferences'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface TweaksPanelProps {
  onClose: () => void
}

export function TweaksPanel({ onClose }: TweaksPanelProps) {
  const { mode, setMode, accent, setAccent } = useThemeStore()
  const { language, setLanguage, currency, setCurrency } = usePreferencesStore()
  const { t } = useI18n()

  return (
    <div className="w-84 rounded-2xl border border-border bg-card shadow-2xl p-5 text-foreground space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles size={14} className="text-primary" />
          </div>
          <span className="text-sm font-bold tracking-tight">{t("tweaks.title", "Theme & Preferences")}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("action.close", "Close")}
          title={t("action.close", "Close")}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Theme Mode */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
          {t("tweaks.mode", "Theme Mode")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('dark')}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all",
              mode === 'dark'
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon size={14} /> {t("tweaks.dark", "Dark (Gemini)")}
          </button>
          <button
            type="button"
            onClick={() => setMode('light')}
            className={cn(
              "flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all",
              mode === 'light'
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun size={14} /> {t("tweaks.light", "Light")}
          </button>
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
          {t("tweaks.accent", "Accent Color")}
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setAccent('gemini')}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold transition-all",
              accent === 'gemini'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 shadow-sm" />
            Gemini
          </button>
          <button
            type="button"
            onClick={() => setAccent('indigo')}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold transition-all",
              accent === 'indigo'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="w-4 h-4 rounded-full bg-indigo-500 shadow-sm" />
            Indigo
          </button>
          <button
            type="button"
            onClick={() => setAccent('teal')}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold transition-all",
              accent === 'teal'
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="w-4 h-4 rounded-full bg-teal-500 shadow-sm" />
            Teal
          </button>
        </div>
      </div>

      {/* Language Switcher */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Globe size={13} className="text-primary" />
          {t("tweaks.language", "Language")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code as LanguageCode)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border text-xs font-semibold transition-all",
                language === lang.code
                  ? "bg-primary/15 text-primary border-primary"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency Switcher */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Coins size={13} className="text-primary" />
          {t("tweaks.currency", "Currency")}
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label={t("tweaks.currency", "Currency")}
          className="w-full border border-input rounded-xl px-3 py-1.5 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} — {c.code} ({c.name})
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span>SynqPOS AI Omnichannel</span>
        <span className="font-mono text-primary font-semibold">USD · Dark</span>
      </div>
    </div>
  )
}
