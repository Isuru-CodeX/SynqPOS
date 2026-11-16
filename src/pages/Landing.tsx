import { Link, Navigate } from "react-router-dom";
import { SynqLogo } from "@/components/shared/SynqLogo";
import { LiveDot } from "@/components/shared/LiveDot";
import { useAuth } from "@/hooks/useAuth";
import { useThemeStore } from "@/stores/theme";
import { Loader2, Sun, Moon } from "lucide-react";
import {
  ShoppingCart, UtensilsCrossed, BarChart3, Wifi,
  Bike, ChefHat, Smartphone, Package,
  CheckCircle, ArrowRight, Star,
} from "lucide-react";

/* ── Features ── */
const FEATURES = [
  {
    icon: ShoppingCart,
    sc: "sc-blue",
    title: "Tactile POS Terminal",
    desc: "Visual category catalog, barcode/EAN search, multi-ticket management and split payments on a single screen.",
  },
  {
    icon: UtensilsCrossed,
    sc: "sc-green",
    title: "Tables & Kitchen Orders",
    desc: "Table-side ordering, live status tracking, instant kitchen dispatch, and fast dining-room checkout.",
  },
  {
    icon: Bike,
    sc: "sc-purple",
    title: "In-House Delivery",
    desc: "Interactive Kanban delivery board, smart courier assignment, live status tracking, and dispatch control.",
  },
  {
    icon: Smartphone,
    sc: "sc-amber",
    title: "Digital Orders & Aggregators",
    desc: "Direct integration with Uber Eats, DoorDash, and WhatsApp AI. Real-time webhooks and automated net margin calculation.",
  },
  {
    icon: ChefHat,
    sc: "sc-cyan",
    title: "Kitchen Display (KDS)",
    desc: "Interactive kitchen order monitor with preparation timers, urgency color coding, and item-by-item dispatching.",
  },
  {
    icon: Package,
    sc: "sc-lime",
    title: "Inventory & Production",
    desc: "Multi-branch stock tracking, recipes, sub-recipes, batch production, waste tracking, and automated reorder alerts.",
  },
  {
    icon: BarChart3,
    sc: "sc-rose",
    title: "Advanced Analytics",
    desc: "Daily sales trends, top performing items, payment mix breakdown, tax accounting, and one-click CSV export.",
  },
  {
    icon: Wifi,
    sc: "sc-slate",
    title: "Offline-First Engine",
    desc: "Works 100% without internet. Automatic zero-loss synchronization once connection restores. Installable PWA.",
  },
];

/* ── Stats ── */
const STATS = [
  { value: "5+", unit: "channels", label: "Integrated sales channels" },
  { value: "∞", unit: "branches", label: "Multi-branch capability" },
  { value: "100%", unit: "offline", label: "Zero lost transactions" },
  { value: "8+", unit: "roles", label: "Granular access roles" },
];

/* ── Plans ── */
const PLANS = [
  {
    name: "Starter",
    price: "$0",
    sub: "Forever free",
    features: ["1 branch location", "POS Terminal", "Cash register & sales", "Standard reports & exports"],
    cta: "Start Free",
    accent: false,
  },
  {
    name: "Pro",
    price: "$39",
    sub: "USD / month",
    features: [
      "Unlimited branches",
      "Everything in Starter +",
      "Tables & Floor management",
      "In-house delivery & KDS",
      "Digital order channels",
      "WhatsApp AI Assistant",
      "Advanced inventory & recipes"
    ],
    cta: "Start 14-day Free Trial",
    accent: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    sub: "Tailored quote",
    features: ["Everything in Pro +", "Guaranteed SLA uptime", "Dedicated onboarding manager", "Custom hardware & API integrations"],
    cta: "Contact Sales",
    accent: false,
  },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const { mode, toggleMode } = useThemeStore();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Topbar ────────────────────────────────────────────── */}
      <header className="landing-topbar">
        <div className="landing-container flex items-center justify-between h-full">
          <Link to="/" className="flex items-center gap-2.5">
            <SynqLogo size={34} variant="full" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#plans" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleMode}
              className="p-2 rounded-xl border border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {mode === "dark" ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-indigo-500" />}
            </button>
            <Link to="/auth" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link to="/auth" className="landing-btn-primary">
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-glow-blue" />
        <div className="landing-glow-green" />
        <div className="absolute inset-0 s-grid-texture opacity-40 pointer-events-none" />

        <div className="landing-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 s-pill s-pill-green mb-6">
            <LiveDot /> INTELLIGENT POS SYSTEM · SynqPOS · v1.0
          </div>

          <h1 className="landing-hero-title">
            Your sales as an<br />
            <span className="gradient-text">intelligent OS.</span>
          </h1>

          <p className="landing-hero-sub">
            Omnichannel · Multi-branch · Offline-first.<br className="hidden sm:block" />
            From counter to courier, from dining room to dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link to="/auth" className="landing-btn-primary landing-btn-lg">
              Start Free — No Credit Card <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="landing-btn-ghost landing-btn-lg">
              Explore Features
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="landing-stats-bar">
        <div className="landing-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border">
            {STATS.map(({ value, unit, label }) => (
              <div key={label} className="text-center px-6 py-4">
                <div className="landing-stat-value">{value} <span className="c-blue text-2xl">{unit}</span></div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="text-center mb-12">
            <div className="eyebrow eyebrow-blue mb-3">CAPABILITIES</div>
            <h2 className="landing-section-title">
              Everything your business needs,<br />
              <span className="gradient-text">on one unified platform.</span>
            </h2>
            <p className="landing-section-sub">
              From fast counter checkout to multi-location inventory and digital sales channels.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, sc, title, desc }) => (
              <div key={title} className="landing-feature-card">
                <div className={`landing-feature-icon ${sc} sc-icon-bg`}>
                  <Icon className="h-5 w-5 sc-icon-color" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-base mt-4 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlight row ─────────────────────────────────────── */}
      <section className="landing-section landing-highlight">
        <div className="landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="eyebrow eyebrow-blue mb-3">GEMINI DESIGN SYSTEM</div>
              <h2 className="landing-section-title mb-4">
                Across all devices,<br />
                <span className="gradient-text">one cohesive experience.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Deep obsidian canvas, cosmic indigo gradients, and vibrant action accents.
                Touch-responsive 100px tiles with active glow feedback, crisp typographic hierarchy,
                and seamless dark mode designed for demanding operational environments.
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Tablet · POS Terminal",           sub: "Catalog + ticket + multi-tender checkout on one screen" },
                  { label: "Mobile · Waiter & Courier",       sub: "Interactive table states, kitchen orders, courier dispatch" },
                  { label: "Desktop · Operational Dashboard", sub: "Live KPI metrics, audit trail, KDS display and analytics" },
                ].map(({ label, sub }) => (
                  <li key={label} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{label}</span>
                      <p className="text-xs text-muted-foreground">{sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/auth" className="landing-btn-primary landing-btn-lg mt-8 inline-flex">
                Try Interactive Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right: mock screens */}
            <div className="relative">
              <div className="landing-mock-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <div className="flex-1 h-5 rounded bg-muted/60 mx-2" />
                </div>
                <div className="flex gap-3">
                  <div className="w-16 space-y-1.5 shrink-0">
                    <div className="h-7 rounded-lg bg-muted/80" />
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-5 rounded bg-muted/${i === 0 ? "100" : "40"}`} />
                    ))}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 rounded-xl bg-muted/60 border border-border" />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-8 rounded bg-muted/40" />
                      ))}
                    </div>
                    <div className="h-20 rounded-xl bg-primary/10 border border-primary/20" />
                  </div>
                </div>
              </div>

              <div className="landing-mock-mobile">
                <div className="space-y-2">
                  <div className="h-16 rounded-xl bg-primary/15 border border-primary/20" />
                  <div className="grid grid-cols-2 gap-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-14 rounded-lg border ${i === 2 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/50 border-border"}`} />
                    ))}
                  </div>
                  <div className="h-8 rounded-lg bg-primary/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────── */}
      <section id="plans" className="landing-section">
        <div className="landing-container">
          <div className="text-center mb-12">
            <div className="eyebrow eyebrow-blue mb-3">TRANSPARENT PRICING</div>
            <h2 className="landing-section-title">
              Scale with <span className="gradient-text">your business.</span>
            </h2>
            <p className="landing-section-sub">Simple monthly billing in USD. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PLANS.map(({ name, price, sub, features, cta, accent }) => (
              <div key={name} className={`landing-plan-card ${accent ? "landing-plan-card-accent" : ""}`}>
                {accent && (
                  <div className="landing-plan-badge">
                    <Star className="h-3 w-3 fill-current" /> Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <div className="eyebrow mb-2">{name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{price}</span>
                    <span className="text-sm text-muted-foreground">{sub}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className={accent ? "landing-btn-primary w-full justify-center" : "landing-btn-ghost w-full justify-center"}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section id="contact" className="landing-section landing-cta-section">
        <div className="landing-container text-center relative z-10">
          <div className="eyebrow mb-4">READY TO SCALE?</div>
          <h2 className="landing-section-title mb-4">
            Get started today —<br />
            <span className="gradient-text">free, no credit card required.</span>
          </h2>
          <p className="landing-section-sub mb-8">
            Set up your first branch and start processing transactions in less than 5 minutes.
          </p>
          <Link to="/auth" className="landing-btn-primary landing-btn-lg">
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SynqLogo size={24} variant="full" />
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Isuru Rathnayaka · SynqPOS · MIT License</p>
            <Link to="/auth" className="text-sm font-semibold text-primary hover:underline">
              Sign In →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
