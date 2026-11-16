import { Moon, Sun, Sparkles, Check } from "lucide-react"
import { useThemeStore } from "@/stores/theme"
import { cn } from "@/lib/utils"

export default function AppearanceSettings() {
  const { mode, setMode, accent, setAccent, spacing, setSpacing } = useThemeStore()

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Apariencia & Tema de SynqPOS
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Personaliza la experiencia visual del sistema. SynqPOS cuenta con un sistema de diseño cósmico inspirado en Google Gemini, con modo oscuro por defecto y cambio manual en cualquier momento.
        </p>
      </div>

      {/* Selector de Modo */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Modo de Visualización
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta Modo Oscuro */}
          <div
            onClick={() => setMode("dark")}
            className={cn(
              "cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 relative overflow-hidden",
              mode === "dark"
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Moon className="h-4 w-4 text-indigo-400" />
                <span>Modo Oscuro (Gemini)</span>
              </div>
              {mode === "dark" && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
            {/* Preview Mini UI */}
            <div className="rounded-xl bg-[#0B0F19] p-3 border border-indigo-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-2 w-12 rounded bg-indigo-500/60" />
                <div className="h-2 w-4 rounded-full bg-sky-400" />
              </div>
              <div className="h-6 rounded-lg bg-[#161F33] border border-indigo-800/30 flex items-center px-2">
                <div className="h-1.5 w-16 rounded bg-slate-600" />
              </div>
              <div className="h-2 w-20 rounded bg-slate-700" />
            </div>
          </div>

          {/* Tarjeta Modo Claro */}
          <div
            onClick={() => setMode("light")}
            className={cn(
              "cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 relative overflow-hidden",
              mode === "light"
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Modo Claro</span>
              </div>
              {mode === "light" && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              )}
            </div>
            {/* Preview Mini UI */}
            <div className="rounded-xl bg-slate-100 p-3 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-2 w-12 rounded bg-indigo-500" />
                <div className="h-2 w-4 rounded-full bg-sky-500" />
              </div>
              <div className="h-6 rounded-lg bg-white border border-slate-200 flex items-center px-2">
                <div className="h-1.5 w-16 rounded bg-slate-300" />
              </div>
              <div className="h-2 w-20 rounded bg-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Paleta de Acento */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Paleta de Color de Acento
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setAccent("gemini")}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
              accent === "gemini"
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-fuchsia-500 shadow-md" />
            <div className="text-center">
              <div className="text-xs font-bold">Gemini Gradient</div>
              <div className="text-[10px] text-muted-foreground">Original</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAccent("indigo")}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
              accent === "indigo"
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 shadow-md" />
            <div className="text-center">
              <div className="text-xs font-bold">Royal Índigo</div>
              <div className="text-[10px] text-muted-foreground">Elegante</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAccent("teal")}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
              accent === "teal"
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:bg-muted/40"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-teal-500 shadow-md" />
            <div className="text-center">
              <div className="text-xs font-bold">Esmeralda Teal</div>
              <div className="text-[10px] text-muted-foreground">Refrescante</div>
            </div>
          </button>
        </div>
      </div>

      {/* Densidad y Espaciado */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Espaciado & Densidad
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSpacing("comodo")}
            className={cn(
              "p-3 rounded-xl border text-left transition-all",
              spacing === "comodo"
                ? "border-primary bg-primary/10 text-foreground font-semibold"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <div className="text-xs font-bold">Cómodo (Táctil)</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Optimizado para pantallas táctiles y tablets POS.</div>
          </button>

          <button
            type="button"
            onClick={() => setSpacing("compacto")}
            className={cn(
              "p-3 rounded-xl border text-left transition-all",
              spacing === "compacto"
                ? "border-primary bg-primary/10 text-foreground font-semibold"
                : "border-border bg-card text-muted-foreground"
            )}
          >
            <div className="text-xs font-bold">Compacto (Alta Densidad)</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Mayor cantidad de información visible en pantallas de escritorio.</div>
          </button>
        </div>
      </div>
    </div>
  )
}
