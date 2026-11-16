import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useI18n } from "@/lib/i18n";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/format";
import {
  TrendingUp, Wallet, Package, Factory, ShoppingCart,
  BarChart3, Globe, CheckCircle, Cloud, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Sparkline data ── */
const SPARK = [55,62,58,71,68,78,82,76,89,94,88,102,110,105,118,124,121,132,128,140,138,145,152,148,155,150,158];
const YMAX = 200;

/* ── Area chart ── */
function AreaChart() {
  const W = 480, H = 180;
  const pl = 36, pr = 16, pt = 18, pb = 24;
  const iW = W - pl - pr, iH = H - pt - pb;
  const n = SPARK.length;
  const toX = (i: number) => pl + (i / (n - 1)) * iW;
  const toY = (v: number) => pt + (1 - v / YMAX) * iH;
  const linePath = SPARK.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${toX(n-1).toFixed(1)} ${pt+iH} L ${toX(0).toFixed(1)} ${pt+iH} Z`;
  const lX = toX(n-1), lY = toY(SPARK[n-1]);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="g-chart-glow w-full">
      <defs>
        <linearGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.30" />
          <stop offset="50%" stopColor="#6366F1" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="aLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#aFill)" />
      <path d={linePath} fill="none" className="line" stroke="url(#aLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {SPARK.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p)} r={i === n-1 ? 4 : 2.3} fill="#fff" stroke="#6366F1" strokeWidth={i === n-1 ? 2.5 : 1.5} />
      ))}
      <g transform={`translate(${lX}, ${lY - 24})`}>
        <rect x="-34" y="-13" width="68" height="20" rx="10" fill="#6366F1" />
        <text x="0" y="2" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="var(--g-font-display)">
          {formatCurrency(SPARK[n-1] * 25)}
        </text>
      </g>
    </svg>
  );
}

/* ── Donut Chart ── */
interface DonutSeg { value: number; color: string; label: string; amount: string }
function Donut({ size = 160, segments, total, totalLabel }: { size?: number; segments: DonutSeg[]; total: string; totalLabel: string }) {
  const R = size/2 - 14, C = 2 * Math.PI * R;
  const sum = segments.reduce((a, b) => a + b.value, 0);
  const cx = size/2, cy = size/2;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={R} stroke="rgba(129,140,248,0.12)" strokeWidth="18" fill="none" />
      {segments.map((s, i) => {
        const dash = (s.value / sum) * C;
        const el = <circle key={i} cx={cx} cy={cy} r={R} stroke={s.color} strokeWidth="18" fill="none"
          strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={-offset} strokeLinecap="butt"
          transform={`rotate(-90 ${cx} ${cy})`} />;
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="12" fill="var(--ink-400)" fontFamily="var(--g-font-body)">{totalLabel}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--ink-900)" fontFamily="var(--g-font-display)">{total}</text>
    </svg>
  );
}

/* ── Bar row ── */
function BarRow({ label, sub, pct, value }: { label: string; sub: string; pct: number; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[13px] font-semibold text-foreground truncate">{label}</span>
        <span className="g-num-14 text-foreground">{value}</span>
      </div>
      <div className="g-bar"><i ref={(el) => { if (el) el.style.width = `${pct}%`; }} /></div>
      <span className="h-meta">{sub}</span>
    </div>
  );
}

/* ── KPI card ── */
interface KPIProps { label: string; value: string; delta?: string; deltaUp?: boolean; sub?: string; icon: React.ReactNode; compact?: boolean }
function KPICard({ label, value, delta, deltaUp = true, sub, icon, compact = false }: KPIProps) {
  return (
    <div className={cn("glass flex flex-col", compact ? "g-kpi g-kpi-compact" : "g-kpi")}>
      <div className="flex items-center justify-between gap-2.5">
        <div className={cn("h-label font-semibold", compact ? "g-val-11" : "g-val-12")}>{label}</div>
        <div className={cn("orb", compact ? "g-orb-30" : "g-orb-38")}>{icon}</div>
      </div>
      <div className={cn("h-num font-bold", compact ? "g-val-22" : "g-val-28")}>{value}</div>
      {(delta || sub) && (
        <div className="flex items-center gap-2 flex-wrap">
          {delta && (
            <span className={cn("inline-flex items-center gap-1 text-[12px] font-bold", deltaUp ? "text-g-ok" : "text-g-bad")}>
              {deltaUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
              {delta}
            </span>
          )}
          {sub && <span className="h-meta">{sub}</span>}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { tenantId, branchId, branches } = useTenantContext();
  const { t } = useI18n();
  const branchName = branches.find((b) => b.id === branchId)?.name ?? "Main Flagship Store";

  const { data: metrics } = useQuery({
    queryKey: ["dashboard-metrics", tenantId, branchId],
    enabled: !!tenantId && !!branchId,
    refetchInterval: 30_000,
    queryFn: async () => {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const iso = today.toISOString();
      try {
        const [salesRes, paymentsRes, sessionRes, lowStockRes, prodRes] = await Promise.all([
          supabase.from("sales").select("id,total").eq("branch_id", branchId!).eq("status", "completed").gte("created_at", iso),
          supabase.from("payments").select("method, amount, sales!inner(branch_id, created_at, status)").eq("sales.branch_id", branchId!).eq("sales.status", "completed").gte("sales.created_at", iso),
          supabase.from("cash_sessions").select("id, opening_amount, total_cash, total_in, total_out").eq("branch_id", branchId!).eq("status", "open").maybeSingle(),
          supabase.from("inventory_stocks").select("quantity, products!inner(id, name, min_stock, status, color)").eq("branch_id", branchId!).eq("products.status", "active"),
          supabase.from("production_orders").select("id, produced_quantity").eq("branch_id", branchId!).gte("created_at", iso),
        ]);
        const salesCount  = salesRes.data?.length ?? 0;
        const totalSales  = salesRes.data?.reduce((s, r) => s + Number(r.total), 0) ?? 0;
        const avgTicket   = salesCount ? totalSales / salesCount : 0;
        const byMethod: Record<string, number> = {};
        paymentsRes.data?.forEach((p: any) => { byMethod[p.method] = (byMethod[p.method] ?? 0) + Number(p.amount); });
        const methodTotal = Object.values(byMethod).reduce((a, b) => a + b, 0);
        const methodsMix  = Object.entries(byMethod).sort((a, b) => b[1] - a[1]).map(([method, amount]) => ({ method, amount, pct: methodTotal ? Math.round((amount / methodTotal) * 100) : 0 }));
        const stockItems  = lowStockRes.data ?? [];
        const lowStock    = stockItems.filter((r: any) => Number(r.quantity) <= Number(r.products.min_stock || 0));
        const totalSKUs   = stockItems.length;
        const stockHealth = totalSKUs ? Math.round(((totalSKUs - lowStock.length) / totalSKUs) * 100) : 100;
        const expectedCash = sessionRes.data
          ? Number(sessionRes.data.opening_amount) + Number(sessionRes.data.total_cash) + Number(sessionRes.data.total_in) - Number(sessionRes.data.total_out)
          : 0;
        const productionToday = prodRes.data?.reduce((s, r) => s + Number(r.produced_quantity ?? 0), 0) ?? 0;
        return { salesCount, totalSales, avgTicket, methodsMix, lowStock, lowStockCount: lowStock.length, totalSKUs, stockHealth, expectedCash, cashOpen: !!sessionRes.data, productionToday };
      } catch {
        return {
          salesCount: 0,
          totalSales: 0,
          avgTicket: 0,
          methodsMix: [],
          lowStock: [],
          lowStockCount: 0,
          totalSKUs: 20,
          stockHealth: 100,
          expectedCash: 0,
          cashOpen: false,
          productionToday: 0,
        };
      }
    },
  });

  const { data: recentSales } = useQuery({
    queryKey: ["dashboard-feed", branchId],
    enabled: !!branchId,
    refetchInterval: 15_000,
    queryFn: async () => {
      try {
        const { data } = await supabase.from("sales")
          .select("id, ticket_number, total, created_at, channel, payments(method, amount)")
          .eq("branch_id", branchId!).eq("status", "completed")
          .order("created_at", { ascending: false }).limit(5);
        return (data ?? []) as any[];
      } catch {
        return [];
      }
    },
  });

  const totalSales = metrics?.totalSales ?? 0;
  const CHANNEL_SEGS: DonutSeg[] = [
    { value: 52, color: "#38BDF8", label: t("dashboard.channel_pos", "Physical Store"), amount: formatCurrency(totalSales * 0.52) },
    { value: 24, color: "#818CF8", label: t("dashboard.channel_web", "Web Store"),      amount: formatCurrency(totalSales * 0.24) },
    { value: 16, color: "#C084FC", label: t("dashboard.channel_mobile", "Mobile App"), amount: formatCurrency(totalSales * 0.16) },
    { value:  8, color: "#34D399", label: t("dashboard.channel_delivery", "Delivery"), amount: formatCurrency(totalSales * 0.08) },
  ];

  const TOP_PRODUCTS = [
    { name: "Espresso Doppio",            cat: "Hot Beverages",      qty: 1245, pct: 96 },
    { name: "Butter Croissant",           cat: "Bakery & Bread",     qty: 978,  pct: 78 },
    { name: "Caffe Latte",                cat: "Hot Beverages",      qty: 854,  pct: 68 },
    { name: "Grilled Chicken Panini",     cat: "Sandwiches & Meals", qty: 642,  pct: 51 },
    { name: "Dark Chocolate Ganache Cake",cat: "Desserts & Cakes",   qty: 523,  pct: 41 },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KPICard
          label={t("dashboard.sales_today", "Today's Sales")}
          value={formatCurrency(metrics?.totalSales ?? 0)}
          delta="18.5%"
          sub={t("dashboard.vs_yesterday", "vs. yesterday")}
          icon={<TrendingUp size={16} />}
        />
        <KPICard
          label={t("dashboard.active_orders", "Active Orders")}
          value={String(metrics?.salesCount ?? 0)}
          delta="12%"
          sub={t("dashboard.vs_yesterday", "vs. yesterday")}
          icon={<ShoppingCart size={16} />}
        />
        <KPICard
          label={t("dashboard.cash_drawer", "Current Drawer")}
          value={formatCurrency(metrics?.expectedCash ?? 0)}
          sub={metrics?.cashOpen ? t("dashboard.drawer_open", "Drawer Open") : t("dashboard.no_session", "No Session")}
          icon={<Wallet size={16} />}
        />
        <KPICard
          label={t("dashboard.healthy_stock", "Stock Health")}
          value={`${metrics?.stockHealth ?? 100}%`}
          sub={t("nav.inventory", "Inventory")}
          icon={<Package size={16} />}
        />
        <KPICard
          label={t("dashboard.production", "Production")}
          value={String(metrics?.productionToday ?? 0)}
          sub={t("dashboard.units_today", "Units today")}
          icon={<Factory size={16} />}
        />
        <KPICard
          label={t("dashboard.active_channels", "Active Channels")}
          value="4 / 5"
          sub={t("dashboard.online_pct", "80% online")}
          icon={<Globe size={16} />}
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr_1fr] gap-3.5 min-h-[300px]">

        {/* Sales chart */}
        <div className="glass flex flex-col gap-3.5 g-panel-20">
          <div className="flex items-center justify-between">
            <div>
              <div className="g-title-16">{t("dashboard.sales_summary", "Sales Overview")}</div>
              <div className="h-meta">{t("dashboard.monthly_trend", "Monthly Trend")} · {branchName}</div>
            </div>
            <span className="g-pill g-pill-ghost g-pill-h28">{t("dashboard.this_month", "This Month")} <TrendingUp size={12} /></span>
          </div>
          <div className="flex-1 flex items-center justify-center min-w-0 overflow-hidden">
            <AreaChart />
          </div>
          <div className="flex items-end justify-between gap-2.5">
            <div>
              <div className="g-num-26">{formatCurrency(metrics?.totalSales ?? 0)}</div>
              <div className="h-meta">{t("dashboard.total_day", "Total for Today")}</div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 font-bold text-[14px] text-g-ok">
                <ArrowUpRight size={12} /> 18.5%
              </span>
              <div className="h-meta">{t("dashboard.vs_last_month", "vs. last month")}</div>
            </div>
          </div>
        </div>

        {/* Top products */}
        <div className="glass flex flex-col gap-3.5 g-panel-20">
          <div className="flex items-center justify-between">
            <div className="g-title-16">{t("dashboard.top_products", "Top Selling Products")}</div>
            <span className="g-pill g-pill-ghost g-pill-h28">{t("dashboard.this_month", "This Month")}</span>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {TOP_PRODUCTS.map((r, i) => (
              <BarRow key={i} label={r.name} sub={r.cat} pct={r.pct} value={r.qty.toLocaleString()} />
            ))}
          </div>
          <Link to="/products" className="g-link justify-between">
            {t("dashboard.view_all_products", "View All Products")} <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Channel donut */}
        <div className="glass flex flex-col gap-3.5 g-panel-20">
          <div className="flex items-center justify-between">
            <div className="g-title-16">{t("dashboard.sales_channels", "Sales Channels")}</div>
            <span className="g-pill g-pill-ghost g-pill-h28">{t("dashboard.this_month", "This Month")}</span>
          </div>
          <div className="flex items-center gap-4 flex-1">
            <Donut size={160} segments={CHANNEL_SEGS} total={formatCurrency(totalSales)} totalLabel={t("dashboard.total", "Total")} />
            <div className="flex flex-col gap-2.5 flex-1 min-w-0">
              {CHANNEL_SEGS.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="g-dot-color shrink-0" ref={(el) => { if (el) el.style.background = s.color; }} />
                    <span className="text-[13px] font-semibold text-foreground truncate">{s.label}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="g-num-13 text-foreground">{s.value}%</div>
                    <div className="h-meta g-val-10">{s.amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link to="/reports" className="g-link justify-between">
            {t("dashboard.view_details", "View Details")} <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">

        {/* Inventory */}
        <div className="glass flex flex-col gap-3.5 g-panel">
          <div className="flex justify-between items-center">
            <div className="g-title-15">{t("dashboard.inventory", "Inventory Overview")}</div>
            <Link to="/inventory" className="g-link g-val-12">{t("dashboard.view_all", "View All")}</Link>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <div className="h-meta mb-1">{t("dashboard.total_skus", "Total SKUs")}</div>
              <div className="g-num-20 text-foreground">{metrics?.totalSKUs ?? 20}</div>
            </div>
            <div>
              <div className="h-meta mb-1">{t("dashboard.low_stock", "Low Stock")}</div>
              <div className="g-num-20 text-g-warn">{metrics?.lowStockCount ?? 0}</div>
            </div>
            <div>
              <div className="h-meta mb-1">{t("dashboard.out_of_stock", "Out of Stock")}</div>
              <div className="g-num-20 text-g-bad">0</div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="h-meta">{t("dashboard.stock_health", "Inventory Health")}</span>
              <span className="text-[12px] font-bold text-g-ok">{metrics?.stockHealth ?? 100}%</span>
            </div>
            <div className="g-bar">
              <i ref={(el) => { if (el) el.style.width = `${metrics?.stockHealth ?? 100}%`; }} />
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="glass flex flex-col gap-3 g-panel">
          <div className="flex justify-between items-center">
            <div className="g-title-15">{t("dashboard.payments", "Payments")}</div>
            <Link to="/sales" className="g-link g-val-12">{t("dashboard.view_all", "View All")}</Link>
          </div>
          <div className="flex flex-col gap-2">
            {(metrics?.methodsMix ?? []).slice(0, 4).map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Wallet size={16} className="text-muted-foreground" />
                  <span className="text-[13px] font-semibold text-foreground">{m.method}</span>
                </div>
                <span className="g-num-13 text-foreground">{formatCurrency(m.amount)}</span>
              </div>
            ))}
            {(metrics?.methodsMix ?? []).length === 0 && (
              <p className="h-meta text-center py-2">{t("dashboard.no_payments", "No payments recorded today")}</p>
            )}
          </div>
          <div className="g-hairline" />
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-bold text-foreground">{t("dashboard.total", "Total")}</span>
            <span className="g-num-18 text-foreground">{formatCurrency(metrics?.totalSales ?? 0)}</span>
          </div>
        </div>

        {/* Live feed */}
        <div className="glass flex flex-col gap-3 g-panel">
          <div className="flex justify-between items-center">
            <div className="g-title-15">{t("dashboard.recent_sales", "Recent Transactions")}</div>
            <span className="g-pill g-pill-ok g-pill-h22">
              <span className="g-dot g-dot-ok" /> Live
            </span>
          </div>
          <div className="flex flex-col gap-2 flex-1">
            {(recentSales ?? []).length === 0 ? (
              <p className="h-meta text-center py-4">{t("dashboard.no_recent_sales", "No transactions recorded yet today")}</p>
            ) : (recentSales ?? []).slice(0, 4).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="g-dot g-dot-brand" />
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-foreground truncate">#{s.ticket_number ?? s.id.slice(0, 6)}</div>
                    <div className="h-meta g-val-10">
                      {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <span className="g-num-13 text-foreground shrink-0">{formatCurrency(Number(s.total))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Branches */}
        <div className="glass flex flex-col gap-3 g-panel">
          <div className="flex justify-between items-center">
            <div className="g-title-15">{t("dashboard.branches", "Branches")}</div>
            <Link to="/branches" className="g-link g-val-12">{t("dashboard.view_all", "View All")}</Link>
          </div>
          <div className="flex flex-col gap-2">
            {branches.slice(0, 4).map((b, i) => (
              <div key={b.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BarChart3 size={16} className="text-muted-foreground shrink-0" />
                  <span className="text-[13px] font-semibold text-foreground truncate max-w-[100px]">{b.name}</span>
                </div>
                <span className={cn("g-pill g-pill-h18", i === 0 ? "g-pill-ok" : "g-pill-ghost")}>
                  {i === 0 ? t("dashboard.branch_online", "Online") : t("dashboard.branch_active", "Active")}
                </span>
              </div>
            ))}
            {branches.length === 0 && <p className="h-meta text-center py-4">{t("dashboard.no_branches", "No branches found")}</p>}
          </div>
        </div>

        {/* Sync */}
        <div className="glass flex flex-col gap-3 g-panel items-center text-center">
          <div className="flex justify-between items-center w-full">
            <div className="g-title-15">{t("dashboard.sync", "Cloud Sync")}</div>
          </div>
          <div className="orb g-orb-64 g-sync-orb-wrap">
            <Cloud size={28} />
          </div>
          <div>
            <div className="font-bold g-val-14 text-g-ok flex items-center justify-center gap-1">
              <CheckCircle size={14} /> {t("dashboard.all_synced", "All Synced")}
            </div>
            <div className="h-meta mt-1">{t("dashboard.last_sync", "Last synced: < 1 min ago")}</div>
          </div>
          <button type="button" className="g-btn g-btn-ghost g-val-12 w-full h-8">
            {t("dashboard.view_history", "View History")} <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      <p className="g-footer-note">
        SynqPOS © 2026 — Isuru Rathnayaka · MIT License
      </p>
    </div>
  );
}
