import { Languages, Coins, Check, Globe2 } from "lucide-react";
import { usePreferencesStore, SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES, type LanguageCode } from "@/stores/preferences";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LocalizationSettings() {
  const { language, setLanguage, currency, setCurrency } = usePreferencesStore();
  const { t } = useI18n();

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    toast.success(lang === "en" ? "Language updated to English" : "Idioma actualizado a Español");
  };

  const handleCurrencyChange = (currCode: string) => {
    setCurrency(currCode);
    toast.success(`${t("tweaks.currency")}: ${currCode}`);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          {t("settings.tab_localization", "Language & Currency")}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {language === "en"
            ? "Configure your preferred display language and transactional currency. English and USD are set by default and can be customized anytime."
            : "Configura tu idioma preferido y la moneda para cobros y reportes. Por defecto se usa Inglés y USD."}
        </p>
      </div>

      {/* Language Section */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          {t("tweaks.language", "System Language")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 text-left",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{lang.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {lang.code === "en" ? "Default language" : "Idioma secundario"}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency Section */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          {t("tweaks.currency", "Default Currency")}
        </label>
        
        {/* Live Currency Preview Card */}
        <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs text-muted-foreground font-medium">Live Price Preview</span>
            <div className="text-xl font-mono font-bold text-foreground">
              {formatCurrency(1250.50)}
            </div>
          </div>
          <div className="text-right space-y-0.5">
            <span className="text-[11px] text-muted-foreground">Active Currency</span>
            <div className="text-sm font-semibold text-primary">{currency}</div>
          </div>
        </div>

        {/* Currency Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = currency === curr.code;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => handleCurrencyChange(curr.code)}
                className={cn(
                  "p-3 rounded-xl border-2 transition-all text-left flex flex-col justify-between h-20",
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:bg-muted/30 hover:border-muted-foreground/30"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono text-sm font-bold text-primary">{curr.symbol}</span>
                  {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">{curr.code}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{curr.name}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
