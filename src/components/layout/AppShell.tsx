import { useState, type CSSProperties } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { WhatsAppNotifsProvider } from "@/contexts/WhatsAppNotifsContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FlaskConical, Menu, X, Search, Bell, Calendar, ChevronDown, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useDevMode } from "@/hooks/useDevMode";
import { useThemeStore } from "@/stores/theme";
import { usePreferencesStore } from "@/stores/preferences";
import { useI18n } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { NetworkStatusBadge } from "./NetworkStatusBadge";
import { TweaksPanel } from "@/components/shared/TweaksPanel";
import { NotificationCenter } from "./NotificationCenter";

function Shell() {
  const navigate = useNavigate();
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const { branchId, setBranch, branches, roles } = useTenantContext();
  const { devMode } = useDevMode();
  const { toggleSidebar, isMobile, openMobile } = useSidebar();
  const { mode, toggleMode } = useThemeStore();
  const { language } = usePreferencesStore();
  const { t } = useI18n();

  const { data: openSession } = useQuery({
    queryKey: ["open-session", branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const { data } = await supabase
        .from("cash_sessions")
        .select("id")
        .eq("branch_id", branchId!)
        .eq("status", "open")
        .maybeSingle();
      return data;
    },
    refetchInterval: 15000,
  });

  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-CO",
    fr: "fr-FR",
    de: "de-DE",
    ja: "ja-JP",
    zh: "zh-CN",
    si: "si-LK",
    ta: "ta-LK",
    hi: "hi-IN",
    ar: "ar-AE",
  };
  const locale = localeMap[language] || "en-US";
  const today = new Date().toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const roleInitials = (roles[0] ?? "U").slice(0, 2).toUpperCase();
  const branchName = branches.find((b) => b.id === branchId)?.name ?? "—";

  return (
    <div className="g-shell-root">
      <AppSidebar />

      <div className="g-shell-main">
        <header className="g-topbar">
          <div className="g-topbar-row">
            {/* Sidebar toggle */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="glass g-topbar-toggle"
              aria-label="Menu"
            >
              {isMobile && openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Search */}
            <div className="glass g-topbar-search">
              <Search size={18} />
              <span className="g-topbar-search-text">{t("topbar.search_placeholder", "Search products, orders, customers…")}</span>
              <span className="g-topbar-kbd">⌘K</span>
            </div>

            {/* Branch / Date */}
            <div className={cn("glass g-topbar-date", "hidden sm:flex")}>
              <Calendar size={16} className="text-[--ink-700] shrink-0" />
              <Select value={branchId ?? undefined} onValueChange={setBranch}>
                <SelectTrigger className="h-auto border-0 bg-transparent p-0 focus:ring-0 shadow-none text-sm font-semibold min-w-[90px]">
                  <SelectValue placeholder={t("topbar.branch", "Branch")} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="g-topbar-date-text">· {today}</span>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleMode}
              className="glass g-topbar-theme-toggle"
              title={mode === "dark" ? t("topbar.theme_dark", "Switch to light mode") : t("topbar.theme_light", "Switch to dark mode")}
              aria-label="Toggle theme"
            >
              {mode === "dark" ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-indigo-500" />
              )}
            </button>

            {/* Network */}
            <NetworkStatusBadge />

            {/* User / Tweaks */}
            <Popover open={tweaksOpen} onOpenChange={setTweaksOpen}>
              <PopoverTrigger asChild>
                <div className="glass g-topbar-user">
                  <div className="g-topbar-avatar">{roleInitials}</div>
                  <div className="g-topbar-user-info hidden md:block">
                    <div className="g-topbar-user-name">{branchName}</div>
                    <div className={cn("g-topbar-user-role", openSession ? "g-topbar-user-role-ok" : "g-topbar-user-role-off")}>
                      <span className={cn("g-dot", openSession ? "g-dot-ok" : "")} />
                      {roles[0] ?? "User"}
                    </div>
                  </div>
                  <ChevronDown size={14} className="hidden md:block shrink-0 text-[--ink-500]" />
                </div>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="p-0 border-0 bg-transparent shadow-none w-auto">
                <TweaksPanel onClose={() => setTweaksOpen(false)} />
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {devMode && (
          <div className="g-dev-banner">
            <FlaskConical className="h-3.5 w-3.5 shrink-0" />
            DEV MODE — Sales will not enforce inventory stock limits
          </div>
        )}

        <main className="g-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <WhatsAppNotifsProvider>
      <SidebarProvider
        style={{ "--sidebar-width-icon": "5rem" } as CSSProperties}
      >
        <Shell />
      </SidebarProvider>
    </WhatsAppNotifsProvider>
  );
}
