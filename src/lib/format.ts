import { supabase } from "@/integrations/supabase/client";
import { usePreferencesStore, SUPPORTED_CURRENCIES } from "@/stores/preferences";

export const formatCurrency = (n: number, currencyOverride?: string): string => {
  const currentCurrency = currencyOverride ?? usePreferencesStore.getState().currency ?? "USD";
  const config = SUPPORTED_CURRENCIES.find((c) => c.code === currentCurrency) ?? {
    code: currentCurrency,
    locale: "en-US",
    decimals: 2,
  };

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(n || 0);
  } catch {
    return `$${(n || 0).toFixed(2)}`;
  }
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatDate = (d: string | Date): string => {
  const lang = usePreferencesStore.getState().language ?? "en";
  const locale = lang === "es" ? "es-CO" : "en-US";
  try {
    return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(d));
  } catch {
    return String(d);
  }
};

export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
