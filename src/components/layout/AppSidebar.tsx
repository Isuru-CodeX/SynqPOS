import { useRef, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Boxes, ChefHat, Factory,
  Wallet, Receipt, Users, Calendar, BarChart3, Settings,
  Bike, UtensilsCrossed, UserRound, Truck,
  LogOut, ChevronRight, Sparkles, Sun, Moon,
} from "lucide-react";
import {
  Sidebar, SidebarContent, useSidebar,
} from "@/components/ui/sidebar";
import { useTenantContext } from "@/hooks/useTenantContext";
import { canAccessRoles, type AppRole } from "@/lib/roles";
import { useWhatsAppNotifs } from "@/contexts/WhatsAppNotifsContext";
import { useThemeStore } from "@/stores/theme";
import { useI18n } from "@/lib/i18n";
import { SynqLogo } from "@/components/shared/SynqLogo";
import { PlanBenefitsModal } from "@/components/shared/PlanBenefitsModal";
import { cn } from "@/lib/utils";
import { signOutFully } from "@/lib/signOut";
import type { LucideIcon } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Item = {
  titleKey: string;
  defaultTitle: string;
  url: string;
  icon: LucideIcon;
  roles?: AppRole[];
  channel?: Database["public"]["Enums"]["sales_channel"];
};

type Section = {
  labelKey: string;
  defaultLabel: string;
  items: Item[];
};

const sections: Section[] = [
  {
    labelKey: "nav.operation",
    defaultLabel: "Operation",
    items: [
      { titleKey: "nav.dashboard", defaultTitle: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["owner","admin","manager","cashier","waiter","kitchen","inventory","courier","staff"] },
      { titleKey: "nav.pos",       defaultTitle: "Point of Sale", url: "/pos", icon: ShoppingCart, roles: ["owner","admin","manager","cashier"], channel: "pos" },
      { titleKey: "nav.tables",    defaultTitle: "Tables", url: "/tables", icon: UtensilsCrossed, roles: ["owner","admin","manager","cashier","waiter"], channel: "tables" },
      { titleKey: "nav.waiter",    defaultTitle: "Waiter", url: "/waiter", icon: UtensilsCrossed, roles: ["waiter"], channel: "tables" },
      { titleKey: "nav.delivery",  defaultTitle: "Delivery", url: "/delivery", icon: Bike, roles: ["owner","admin","manager","cashier","courier","staff"], channel: "delivery" },
      { titleKey: "nav.courier",   defaultTitle: "Courier", url: "/courier", icon: Bike, roles: ["courier","staff"], channel: "delivery" },
      { titleKey: "nav.cash",      defaultTitle: "Cash Register", url: "/cash", icon: Wallet, roles: ["owner","admin","manager","cashier"] },
      { titleKey: "nav.sales",     defaultTitle: "Sales", url: "/sales", icon: Receipt, roles: ["owner","admin","manager","cashier"] },
      { titleKey: "nav.customers", defaultTitle: "Customers", url: "/customers", icon: UserRound, roles: ["owner","admin","manager","cashier"] },
    ],
  },
  {
    labelKey: "nav.catalog",
    defaultLabel: "Catalog",
    items: [
      { titleKey: "nav.products", defaultTitle: "Products", url: "/products", icon: Package, roles: ["owner","admin","manager"] },
      { titleKey: "nav.recipes",  defaultTitle: "Recipes", url: "/recipes", icon: ChefHat, roles: ["owner","admin","manager","kitchen"] },
    ],
  },
  {
    labelKey: "nav.stock",
    defaultLabel: "Stock",
    items: [
      { titleKey: "nav.inventory",  defaultTitle: "Inventory", url: "/inventory", icon: Boxes, roles: ["owner","admin","manager","inventory","cashier"] },
      { titleKey: "nav.production", defaultTitle: "Production", url: "/production", icon: Factory, roles: ["owner","admin","manager","kitchen"] },
      { titleKey: "nav.kds",        defaultTitle: "Kitchen (KDS)", url: "/kds", icon: ChefHat, roles: ["owner","admin","manager","kitchen"] },
      { titleKey: "nav.suppliers",  defaultTitle: "Suppliers", url: "/suppliers", icon: Truck, roles: ["owner","admin","manager"] },
    ],
  },
  {
    labelKey: "nav.business",
    defaultLabel: "Business",
    items: [
      { titleKey: "nav.employees", defaultTitle: "Employees", url: "/employees", icon: Users, roles: ["owner","admin","manager"] },
      { titleKey: "nav.shifts",    defaultTitle: "Shifts", url: "/shifts", icon: Calendar, roles: ["owner","admin","manager"] },
      { titleKey: "nav.reports",   defaultTitle: "Reports", url: "/reports", icon: BarChart3, roles: ["owner","admin","manager"] },
      { titleKey: "nav.settings",  defaultTitle: "Settings", url: "/settings", icon: Settings, roles: ["owner","admin"] },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { roles, activeChannels, branchId, branches } = useTenantContext();
  const { unreadCount } = useWhatsAppNotifs();
  const { mode, toggleMode } = useThemeStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const branchName = branches.find((b) => b.id === branchId)?.name ?? "—";
  const userRole = roles[0] ?? "";
  const initials = userRole.slice(0, 2).toUpperCase() || "U";

  const canSee = (item: Item) => {
    if (item.channel && !activeChannels.includes(item.channel)) return false;
    return canAccessRoles(roles, item.roles);
  };

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector(".is-active") as HTMLElement | null;
    if (!nav || !active) return;
    const target = active.offsetTop - nav.clientHeight / 2 + active.clientHeight / 2;
    nav.scrollTop = Math.max(0, target);
  }, [pathname]);

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-transparent">
      <SidebarContent className="bg-transparent p-0">
        <div className="g-sb-wrap">
          <div className="glass g-sb-card">

            {/* Brand */}
            <div
              className="g-sb-brand cursor-pointer select-none"
              onClick={() => navigate("/dashboard")}
              title="SynqPOS Dashboard"
            >
              {collapsed ? (
                <SynqLogo size={36} variant="icon" />
              ) : (
                <SynqLogo size={38} variant="full" />
              )}
            </div>

            <div className="g-sb-divider" />

            {/* Nav */}
            <nav ref={navRef} className="g-sb-nav">
              {sections.map((section) => {
                const visible = section.items.filter(canSee);
                if (visible.length === 0) return null;
                return (
                  <div key={section.labelKey}>
                    {!collapsed && (
                      <div className="g-sb-section-label">
                        {t(section.labelKey, section.defaultLabel)}
                      </div>
                    )}
                    {visible.map((item) => {
                      const active =
                        pathname === item.url ||
                        (item.url !== "/" && pathname.startsWith(item.url));
                      const title = t(item.titleKey, item.defaultTitle);
                      return (
                        <NavLink
                          key={item.url}
                          to={item.url}
                          title={collapsed ? title : undefined}
                          className={cn(
                            "g-sb-nav-item group",
                            active && "is-active",
                            collapsed && "g-sb-nav-item-collapsed"
                          )}
                        >
                          <div className="g-icon-badge">
                            <item.icon size={16} />
                          </div>
                          {!collapsed && (
                            <span className="truncate flex-1 font-medium">{title}</span>
                          )}
                          {item.url === "/whatsapp" && unreadCount > 0 && (
                            <span className={cn("g-sb-badge", collapsed && "g-sb-badge-float")}>
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                );
              })}
            </nav>

            {/* Plan card (only expanded) */}
            {!collapsed && (
              <div className="glass-thin g-sb-plan">
                <div className="g-sb-plan-row">
                  <div className="g-sb-plan-orb">
                    <Sparkles size={14} color="white" />
                  </div>
                  <div>
                    <div className="g-sb-plan-title">{t("nav.premium_plan", "Premium Plan")}</div>
                    <div className="g-sb-plan-sub">{t("nav.plan_active", "Your plan is active")}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="g-sb-plan-btn"
                  onClick={() => setPlanModalOpen(true)}
                >
                  {t("nav.view_benefits", "View benefits")} <ChevronRight size={12} />
                </button>
              </div>
            )}

            {/* User / logout */}
            <div className={cn("glass-thin g-sb-nav-item g-sb-user-row", collapsed && "g-sb-nav-item-collapsed")}>
              <div className="g-sb-user-avatar">{initials}</div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="g-sb-user-name truncate">{branchName}</div>
                    <div className="g-sb-user-sub">{userRole || "User"}</div>
                  </div>
                  <button
                    type="button"
                    className="g-sb-logout-btn"
                    title={mode === "dark" ? t("topbar.theme_dark", "Switch to light mode") : t("topbar.theme_light", "Switch to dark mode")}
                    onClick={toggleMode}
                  >
                    {mode === "dark" ? (
                      <Sun size={15} className="text-amber-400" />
                    ) : (
                      <Moon size={15} className="text-indigo-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="g-sb-logout-btn"
                    title={t("nav.logout", "Sign Out")}
                    onClick={async () => {
                      await signOutFully();
                      navigate("/auth");
                    }}
                  >
                    <LogOut size={14} />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
        <PlanBenefitsModal open={planModalOpen} onOpenChange={setPlanModalOpen} />
      </SidebarContent>
    </Sidebar>
  );
}
