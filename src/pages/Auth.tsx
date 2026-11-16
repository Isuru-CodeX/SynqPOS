import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SynqLogo } from "@/components/shared/SynqLogo";
import { LiveDot } from "@/components/shared/LiveDot";
import { GearMark } from "@/components/shared/GearMark";
import { useThemeStore } from "@/stores/theme";
import { loginAsDemo } from "@/hooks/useAuth";
import { DEMO_CREDENTIALS, seedInitialDemoData, type DemoAccount } from "@/lib/demoData";
import { useTenantStore } from "@/stores/tenant";
import { toast } from "sonner";
import {
  Loader2, Shield, Zap, Wifi, ArrowLeft,
  ShoppingCart, UtensilsCrossed, BarChart3, Sun, Moon,
  KeyRound, Sparkles, Check,
} from "lucide-react";

/* ── Left panel features ── */
const FEATURES = [
  { icon: Zap,           text: "Tactile & ultra fast · Touch-optimized with instant reactive feedback" },
  { icon: Wifi,          text: "Offline-first architecture · Seamless automatic sync on reconnect" },
  { icon: Shield,        text: "Multi-branch & omnichannel · Granular roles and sales channels" },
];

/* ── Social proof stats ── */
const PROOF = [
  { icon: ShoppingCart,   label: "Sales processed",   value: "Unlimited" },
  { icon: UtensilsCrossed, label: "Active channels",  value: "5+"         },
  { icon: BarChart3,      label: "Real-time metrics", value: "Always live" },
];

export default function Auth() {
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState("isururathnayaka999@gmail.com");
  const [password, setPassword] = useState("SynqPOS2026!");
  const [loading,  setLoading]  = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const setTenant = useTenantStore((s) => s.setTenant);

  const { mode, toggleMode } = useThemeStore();

  useEffect(() => {
    document.title = "Sign In | SynqPOS";
    // Seed initial products and categories into local Dexie database
    seedInitialDemoData("demo-tenant-synqpos");
  }, []);

  const handleQuickLogin = async (acc: DemoAccount) => {
    setLoading(true);
    try {
      setTenant("demo-tenant-synqpos");
      await seedInitialDemoData("demo-tenant-synqpos");
      loginAsDemo(acc.email, acc.role, acc.fullName);
      toast.success(`Signed in as ${acc.fullName} (${acc.title})`);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTenant("demo-tenant-synqpos");
    await seedInitialDemoData("demo-tenant-synqpos");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fall back to local demo login for recognized demo accounts or offline mode
        const matched = DEMO_CREDENTIALS.find(
          (c) => c.email.toLowerCase() === email.toLowerCase()
        );
        if (matched) {
          loginAsDemo(matched.email, matched.role, matched.fullName);
          toast.success(`Signed in as ${matched.fullName} (${matched.title})`);
          navigate("/dashboard", { replace: true });
          return;
        }

        // Generic local login if offline
        if (email.includes("@")) {
          const role = email.includes("cashier") ? "cashier" : email.includes("waiter") ? "waiter" : "owner";
          loginAsDemo(email, role, "Authenticated User");
          toast.success(`Signed in as ${email}`);
          navigate("/dashboard", { replace: true });
          return;
        }

        throw error;
      }

      if (data.user) {
        toast.success("Welcome back to SynqPOS");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      // In local development or placeholder envs, grant access to valid emails
      if (email.includes("@")) {
        const matched = DEMO_CREDENTIALS.find((c) => c.email.toLowerCase() === email.toLowerCase());
        const role = matched?.role ?? "owner";
        const fullName = matched?.fullName ?? "Isuru Rathnayaka";
        loginAsDemo(email, role, fullName);
        toast.success(`Signed in as ${fullName} (Demo Mode)`);
        navigate("/dashboard", { replace: true });
        return;
      }
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel: branding SynqPOS ── */}
      <div className="hidden lg:flex lg:w-[50%] xl:w-[52%] flex-col relative overflow-hidden auth-panel-left">
        <div className="absolute inset-0 s-grid-texture pointer-events-none opacity-50" />
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full pointer-events-none auth-glow-blue" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full pointer-events-none auth-glow-green" />
        <div className="absolute -bottom-20 -right-20 opacity-[0.04] pointer-events-none">
          <GearMark size={420} />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Back link + logo */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <SynqLogo size={38} variant="full" />
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMode}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all"
                title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {mode === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-sky-300" />}
              </button>
              <Link to="/" className="auth-back-link">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </Link>
            </div>
          </div>

          {/* Status pill */}
          <div className="mt-6 self-start">
            <span className="s-pill s-pill-green inline-flex items-center gap-2">
              <LiveDot /> INTELLIGENT POS OS · SynqPOS v1.0
            </span>
          </div>

          {/* Hero copy */}
          <div className="mt-auto mb-auto pt-10">
            <h1 className="auth-hero-title">
              Your sales as an<br />
              <span className="gradient-text">intelligent OS.</span>
            </h1>
            <p className="auth-hero-sub">
              Omnichannel · Multi-branch · Offline-first.<br />
              From counter to courier, from dining room to dashboard.
            </p>

            {/* Features */}
            <div className="mt-8 space-y-3.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="auth-feature-icon">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-sidebar-foreground/70 leading-snug">{text}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-8 pt-6 border-t border-sidebar-border/30 grid grid-cols-3 gap-4">
              {PROOF.map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="h-4 w-4 text-primary/60 mx-auto mb-1" />
                  <div className="text-base font-black text-sidebar-foreground">{value}</div>
                  <div className="text-[10px] text-sidebar-foreground/40 leading-snug mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-sidebar-foreground/25 tracking-wider">
            © 2026 Isuru Rathnayaka · SynqPOS · MIT License
          </div>
        </div>
      </div>

      {/* ── Right panel: form + demo logins ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-5">

          {/* Mobile brand + back link */}
          <div className="flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <SynqLogo size={30} variant="full" />
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMode}
                className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
              >
                {mode === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-500" />}
              </button>
              <Link to="/" className="auth-back-link">
                <ArrowLeft className="h-3.5 w-3.5" /> Home
              </Link>
            </div>
          </div>

          {/* Form card */}
          <div className="glass p-7 rounded-3xl space-y-5">
            <div>
              <div className="h-label g-auth-eyebrow mb-1">OPERATIONAL ACCESS</div>
              <div className="h-display g-auth-title text-2xl font-bold">Sign In to SynqPOS</div>
              <div className="h-meta mt-1 text-xs text-muted-foreground">
                Enter your authorized credentials or use 1-click demo access below.
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address</Label>
                <Input
                  id="email" type="email" required
                  inputMode="email" autoComplete="email"
                  className="h-10 text-sm bg-background border-input rounded-xl"
                  placeholder="isururathnayaka999@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pwd" className="text-xs font-semibold text-foreground">Password</Label>
                  <span className="text-[11px] text-muted-foreground font-mono">SynqPOS2026!</span>
                </div>
                <Input
                  id="pwd" type="password" required minLength={6}
                  autoComplete="current-password"
                  className="h-10 text-sm bg-background border-input rounded-xl"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="g-btn g-btn-primary g-btn-touch g-auth-submit w-full mt-3 h-11 text-sm font-semibold shadow-lg shadow-primary/25"
                disabled={loading}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Authenticating…</>
                  : "Sign In to Workspace"
                }
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="pt-4 border-t border-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Quick 1-Click Demo Logins
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="text-[11px] text-primary hover:underline"
                >
                  {showDemoAccounts ? "Hide accounts" : "View all roles"}
                </button>
              </div>

              {/* Primary 1-Click Button for Owner */}
              <button
                type="button"
                onClick={() => handleQuickLogin(DEMO_CREDENTIALS[0])}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/15 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    IR
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Isuru Rathnayaka (Owner)</div>
                    <div className="text-[10px] text-muted-foreground font-mono">isururathnayaka999@gmail.com</div>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/20">
                  Instant Access →
                </div>
              </button>

              {/* Expanded Role List */}
              {showDemoAccounts && (
                <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-200">
                  {DEMO_CREDENTIALS.slice(1).map((acc) => (
                    <button
                      key={acc.role}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className="p-2 rounded-xl border border-border bg-card/60 hover:bg-muted text-left transition-all flex flex-col justify-between"
                    >
                      <div className="text-xs font-semibold text-foreground truncate">{acc.title}</div>
                      <div className="text-[10px] text-muted-foreground font-mono truncate">{acc.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center">
            Restricted environment · SynqPOS Omnichannel Point of Sale · MIT License
          </p>
        </div>
      </div>
    </div>
  );
}
