import { useCallback, useEffect, useState } from "react";
import { Loader2, Settings2, RefreshCw, WifiOff } from "lucide-react";
import { useTenantByDomain, DEFAULT_FALLBACK_TENANT, applyTenantBranding } from "@/hooks/useTenantByDomain";
import { useTenantStore } from "@/stores/tenant";
import { supabase } from "@/integrations/supabase/client";
import { signOutFully } from "@/lib/signOut";
import { Button } from "@/components/ui/button";
import { SynqLogo } from "@/components/shared/SynqLogo";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

interface TenantProviderProps {
  children: React.ReactNode;
}

// ── Screen: Unconfigured Instance ───────────────────────────────────────────
function UnconfiguredScreen({ onContinueOffline }: { onContinueOffline: () => void }) {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

  const [session, setSession]           = useState<Session | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [authLoading, setAuthLoading]   = useState(true);

  // Login form state
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Setup state
  const [tenants, setTenants]               = useState<{ id: string; name: string; slug: string; domain: string | null }[]>([]);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [saving, setSaving]                 = useState(false);

  const loadTenants = useCallback(async () => {
    const { data } = await supabase
      .from("tenants")
      .select("id, name, slug, domain");
    setTenants(data ?? []);
  }, []);

  const checkSuperAdmin = useCallback(async (userId: string) => {
    setAuthLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "super_admin")
      .maybeSingle();

    const isAdmin = !!data;
    setIsSuperAdmin(isAdmin);
    setAuthLoading(false);

    if (isAdmin) loadTenants();
  }, [loadTenants]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      if (data.session) checkSuperAdmin(data.session.user.id);
      else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) checkSuperAdmin(s.user.id);
      else { setIsSuperAdmin(false); setAuthLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [checkSuperAdmin]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    setLoggingIn(false);
  }

  async function handleSetDomain() {
    if (!selectedTenant) return;
    setSaving(true);
    const { error } = await supabase
      .from("tenants")
      .update({ domain: hostname })
      .eq("id", selectedTenant);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success("Domain configured. Reloading...");
      setTimeout(() => window.location.reload(), 800);
    }
    setSaving(false);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Super admin authenticated: instance configuration
  if (session && isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl">
          <div className="flex items-center gap-2 text-primary">
            <Settings2 className="h-5 w-5" />
            <span className="font-semibold text-sm">Configure Instance</span>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Detected Hostname</p>
            <code className="block text-sm font-mono bg-muted px-3 py-2 rounded-lg">
              {hostname}
            </code>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Link to Tenant</label>
            <select
              aria-label="Tenant"
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
            >
              <option value="">Select tenant...</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug}){t.domain ? ` — ${t.domain}` : ""}
                </option>
              ))}
            </select>
          </div>

          <Button
            className="w-full"
            disabled={!selectedTenant || saving}
            onClick={handleSetDomain}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Link Domain & Continue
          </Button>

          <Button
            variant="outline"
            className="w-full text-xs"
            onClick={onContinueOffline}
          >
            Continue in Offline / Demo Mode
          </Button>

          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={() => signOutFully()}
          >
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  // Not logged in or not super_admin
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border shadow-xl text-center">
        <div className="flex justify-center mb-2">
          <SynqLogo variant="icon" size="lg" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-foreground">Unconfigured Instance</h1>
          <p className="text-muted-foreground text-xs">
            No tenant linked to <code className="font-mono text-primary">{hostname}</code>
          </p>
        </div>

        {session && !isSuperAdmin ? (
          <p className="text-center text-xs text-destructive">
            Your account does not have permission to configure this instance.
          </p>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <p className="text-xs text-muted-foreground text-center">
              Sign in as Super Admin to link a domain, or explore in demo mode.
            </p>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              required
            />
            <Button type="submit" className="w-full" disabled={loggingIn}>
              {loggingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In as Admin
            </Button>
          </form>
        )}

        <div className="pt-2 border-t border-border/50">
          <Button
            variant="outline"
            className="w-full text-xs border-primary/30 hover:bg-primary/10"
            onClick={onContinueOffline}
          >
            Continue in Offline / Demo Mode
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Connection Notice ────────────────────────────────────────────────
function ConnectionErrorScreen({ onRetry, onContinueOffline }: { onRetry: () => void; onContinueOffline: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-card/60 backdrop-blur-md p-8 rounded-2xl border border-border shadow-2xl text-center">
        <div className="flex justify-center mb-1">
          <SynqLogo variant="full" size="md" />
        </div>

        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
          <WifiOff className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Database Connection Notice</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Could not reach the remote database server. SynqPOS includes an offline-first engine and local storage, allowing you to run smoothly without a remote connection.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
            onClick={onContinueOffline}
          >
            Continue in Offline / Demo Mode
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Tip: Set up your Supabase credentials in <code className="font-mono text-primary">.env</code> to connect to your remote cloud database.
        </p>
      </div>
    </div>
  );
}

// ── Main Provider ─────────────────────────────────────────────────────────────
export function TenantProvider({ children }: TenantProviderProps) {
  const { loading, error } = useTenantByDomain();
  const [bypassed, setBypassed] = useState(false);
  const setTenant = useTenantStore((s) => s.setTenant);

  const handleContinueOffline = useCallback(() => {
    setTenant(DEFAULT_FALLBACK_TENANT.id);
    applyTenantBranding(DEFAULT_FALLBACK_TENANT);
    setBypassed(true);
  }, [setTenant]);

  if (bypassed) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Domain not found → super admin setup screen or continue in demo mode
  if (error === "not-found") {
    return <UnconfiguredScreen onContinueOffline={handleContinueOffline} />;
  }

  // Network / database connection error
  if (error === "error") {
    return (
      <ConnectionErrorScreen
        onRetry={() => window.location.reload()}
        onContinueOffline={handleContinueOffline}
      />
    );
  }

  return <>{children}</>;
}
