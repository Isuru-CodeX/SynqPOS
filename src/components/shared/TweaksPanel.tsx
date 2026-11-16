import { X, Moon, Sun, Sparkles, Globe, Coins, Eclipse, Flame } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
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

  const THEMES: { id: ThemeMode; label: string; icon: any }[] = [
    { id: 'dark',      label: 'Obsidian', icon: Moon },
    { id: 'midnight',  label: 'Midnight', icon: Flame },
    { id: 'mixed',     label: 'Mixed',    icon: Eclipse },
    { id: 'light',     label: 'Studio',   icon: Sun },
  ]

  return (
    <div className="w-88 rounded-2xl border border-border bg-card shadow-2xl p-5 text-foreground space-y-4">
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

      {/* Theme Modes */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
          {t("tweaks.mode", "Theme Mode")}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((th) => {
            const Icon = th.icon
            const isSelected = mode === th.id
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => setMode(th.id)}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
                    : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70"
                )}
              >
                <Icon size={13} />
                <span>{th.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
          {t("tweaks.accent", "Accent Color")}
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'gemini', label: 'Gemini', dot: 'bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500' },
            { id: 'indigo', label: 'Indigo', dot: 'bg-indigo-500' },
            { id: 'teal',   label: 'Teal',   dot: 'bg-teal-500' },
            { id: 'rose',   label: 'Rose',   dot: 'bg-pink-500' },
          ].map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAccent(a.id as any)}
              className={cn(
                "flex flex-col items-center gap-1 p-1.5 rounded-xl border text-[11px] font-semibold transition-all",
                accent === a.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn("w-3.5 h-3.5 rounded-full shadow-sm", a.dot)} />
              <span className="truncate w-full text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Language Selector */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <Globe size={13} className="text-primary" />
          {t("tweaks.language", "Language")}
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as LanguageCode)}
          aria-label={t("tweaks.language", "Language")}
          className="w-full border border-input rounded-xl px-3 py-2 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {SUPPORTED_LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.name} — {l.native}
            </option>
          ))}
        </select>
      </div>

      {/* Currency Selector */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <Coins size={13} className="text-primary" />
          {t("tweaks.currency", "Currency")}
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label={t("tweaks.currency", "Currency")}
          className="w-full border border-input rounded-xl px-3 py-2 text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
        >
          {SUPPORTED_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.symbol} · {c.code} ({c.name})
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
        <span>SynqPOS AI Omnichannel</span>
        <span className="font-mono text-primary font-semibold">{currency} · {mode.toUpperCase()}</span>
      </div>
    </div>
  )
}
