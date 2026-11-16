import { Moon, Sun, Sparkles, Check, Eclipse, Flame } from "lucide-react"
import { useThemeStore, type ThemeMode, type ThemeAccent } from "@/stores/theme"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export default function AppearanceSettings() {
  const { mode, setMode, accent, setAccent, spacing, setSpacing } = useThemeStore()
  const { t } = useI18n()

  const THEMES: { id: ThemeMode; name: string; subtitle: string; icon: any; bgPreview: string; cardPreview: string; accentColor: string }[] = [
    {
      id: "dark",
      name: "Obsidian Dark (Gemini)",
      subtitle: "Deep cosmic obsidian (#080C14) with subtle cyan & violet aura.",
      icon: Moon,
      bgPreview: "#080C14",
      cardPreview: "#101726",
      accentColor: "#6366F1",
    },
    {
      id: "midnight",
      name: "Midnight OLED (Pure Black)",
      subtitle: "True #000000 pitch black for OLED screens and high-contrast environments.",
      icon: Flame,
      bgPreview: "#000000",
      cardPreview: "#080C14",
      accentColor: "#38BDF8",
    },
    {
      id: "mixed",
      name: "Mixed Eclipse (Hybrid)",
      subtitle: "Deep obsidian frame with high-contrast twilight navy cards.",
      icon: Eclipse,
      bgPreview: "#0A0E17",
      cardPreview: "#141D2E",
      accentColor: "#A855F7",
    },
    {
      id: "light",
      name: "Studio Light",
      subtitle: "Crisp daylight theme with pure white cards and soft shadows.",
      icon: Sun,
      bgPreview: "#F8FAFC",
      cardPreview: "#FFFFFF",
      accentColor: "#4F46E5",
    },
    {
      id: "soft-light",
      name: "Warm Pearl Light",
      subtitle: "Soft warm ivory/pearl daylight theme for gentle eye comfort.",
      icon: Sun,
      bgPreview: "#FAF8F5",
      cardPreview: "#FFFFFF",
      accentColor: "#E11D48",
    },
  ]

  const ACCENTS: { id: ThemeAccent; name: string; tag: string; gradient: string }[] = [
    { id: "gemini", name: "Gemini Cosmic", tag: "Signature", gradient: "from-sky-400 via-indigo-500 to-fuchsia-500" },
    { id: "indigo", name: "Royal Indigo", tag: "Executive", gradient: "from-indigo-600 to-violet-600" },
    { id: "teal",   name: "Emerald Teal", tag: "Fresh", gradient: "from-emerald-400 to-teal-600" },
    { id: "rose",   name: "Radiant Rose", tag: "Vibrant", gradient: "from-pink-500 to-rose-600" },
    { id: "amber",  name: "Warm Gold", tag: "Solar", gradient: "from-amber-400 to-orange-500" },
  ]

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("appearance.title", "Appearance & Themes")}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {t("appearance.desc", "Customize your workspace appearance. Choose between Obsidian Dark, Midnight OLED, Studio Light, or Mixed Eclipse themes.")}
        </p>
      </div>

      {/* Theme Selection Grid */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          {t("appearance.mode", "Display Theme")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEMES.map((theme) => {
            const isSelected = mode === theme.id
            const Icon = theme.icon
            return (
              <div
                key={theme.id}
                onClick={() => setMode(theme.id)}
                className={cn(
                  "cursor-pointer rounded-2xl border-2 p-3.5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/20"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{theme.name}</span>
                    </div>
                    {isSelected && (
                      <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3 leading-tight">{theme.subtitle}</p>
                </div>

                {/* Preview Mini UI */}
                <div
                  className="rounded-xl p-2.5 border border-border/40 space-y-1.5"
                  style={{ background: theme.bgPreview }}
                >
                  <div className="flex items-center justify-between">
                    <div className="h-1.5 w-10 rounded" style={{ background: theme.accentColor }} />
                    <div className="h-2 w-2 rounded-full" style={{ background: theme.accentColor }} />
                  </div>
                  <div
                    className="h-6 rounded-lg border border-border/30 flex items-center px-2"
                    style={{ background: theme.cardPreview }}
                  >
                    <div className="h-1.5 w-12 rounded bg-muted-foreground/40" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Accent Palettes */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          {t("appearance.accent", "Accent Palette")}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {ACCENTS.map((acc) => {
            const isSelected = accent === acc.id
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => setAccent(acc.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:bg-muted/40"
                )}
              >
                <div className={cn("w-7 h-7 rounded-full bg-gradient-to-tr shadow-md", acc.gradient)} />
                <div className="text-center">
                  <div className="text-xs font-bold text-foreground truncate">{acc.name}</div>
                  <div className="text-[10px] text-muted-foreground">{acc.tag}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Spacing / Density */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          {t("appearance.density", "Spacing & Density")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSpacing("comodo")}
            className={cn(
              "p-3.5 rounded-xl border-2 text-left transition-all",
              spacing === "comodo"
                ? "border-primary bg-primary/10 text-foreground font-semibold"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <div className="text-xs font-bold text-foreground">{t("appearance.comfortable", "Comfortable (Touch)")}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {t("appearance.comfortable_desc", "Optimized for touchscreens and tablet POS.")}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSpacing("compacto")}
            className={cn(
              "p-3.5 rounded-xl border-2 text-left transition-all",
              spacing === "compacto"
                ? "border-primary bg-primary/10 text-foreground font-semibold"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <div className="text-xs font-bold text-foreground">{t("appearance.compact", "Compact (High Density)")}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {t("appearance.compact_desc", "Higher information density for desktop monitors.")}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
