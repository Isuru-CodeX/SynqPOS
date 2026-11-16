import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenantStore } from "@/stores/tenant";
import { useBrandingStore } from "@/stores/branding";

export type ThemeKind = "bakery" | "bar";

export interface TenantConfig {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  theme_kind: string | null;
}

export type DomainError = "not-found" | "error";

export const DEFAULT_FALLBACK_TENANT: TenantConfig = {
  id: "demo-tenant-synqpos",
  name: "SynqPOS",
  domain: "localhost",
  logo_url: "/synqpos-icon.svg",
  primary_color: "#6366F1",
  theme_kind: "bar",
};

export function applyTenantBranding(config: TenantConfig): void {
  const root = document.documentElement;

  // Store the tenant primary color — ThemeApplier is the single writer of CSS vars
  useBrandingStore.getState().setPrimaryColor(config.primary_color ?? null);

  const kind: ThemeKind =
    config.theme_kind === "bakery" || config.theme_kind === "bar"
      ? config.theme_kind
      : "bar";

  root.dataset.tenantTheme = kind;
  document.title = config.name;
}

function resolveHostname(): string {
  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "demo.localhost";
  }
  return hostname;
}

export function useTenantByDomain() {
  const [config, setConfig] = useState<TenantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DomainError | null>(null);
  const setTenant = useTenantStore((s) => s.setTenant);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");
      const domain = resolveHostname();

      try {
        const { data, error: qErr } = await supabase
          .from("tenants")
          .select("id, name, domain, logo_url, primary_color, theme_kind")
          .eq("domain", domain)
          .maybeSingle();

        if (cancelled) return;

        if (data) {
          setTenant(data.id);
          applyTenantBranding(data);
          setConfig(data);
          setError(null);
          setLoading(false);
          return;
        }

        if (qErr) {
          // If running locally, gracefully fall back to default demo tenant
          if (isLocal) {
            console.info("[SynqPOS] Running in local demo/offline mode (backend offline).");
            setTenant(DEFAULT_FALLBACK_TENANT.id);
            applyTenantBranding(DEFAULT_FALLBACK_TENANT);
            setConfig(DEFAULT_FALLBACK_TENANT);
            setError(null);
            setLoading(false);
            return;
          }
          setError("error");
          setLoading(false);
          return;
        }

        // Domain row not found
        if (isLocal) {
          console.info("[SynqPOS] Localhost domain unmapped, falling back to default tenant.");
          setTenant(DEFAULT_FALLBACK_TENANT.id);
          applyTenantBranding(DEFAULT_FALLBACK_TENANT);
          setConfig(DEFAULT_FALLBACK_TENANT);
          setError(null);
          setLoading(false);
          return;
        }

        setError("not-found");
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (isLocal) {
          console.info("[SynqPOS] Backend unreachable, falling back to local demo tenant:", err);
          setTenant(DEFAULT_FALLBACK_TENANT.id);
          applyTenantBranding(DEFAULT_FALLBACK_TENANT);
          setConfig(DEFAULT_FALLBACK_TENANT);
          setError(null);
          setLoading(false);
          return;
        }
        setError("error");
        setLoading(false);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [setTenant]);

  return { config, loading, error, setConfig, setError };
}
