import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantStore } from "@/stores/tenant";
import { useBranchesStore } from "@/stores/branches";
import { useAuth } from "./useAuth";
import { Branch } from "@/types/branch";
import { useEffect, useMemo } from "react";

type TenantSummary = {
  id: string;
  name: string;
  currency: string | null;
  tax_rate: number | null;
  active_channels: string[] | null;
};

function isTenantSummary(value: unknown): value is TenantSummary {
  return !!value && typeof value === "object" && "id" in value;
}

const DEFAULT_FALLBACK_BRANCHES: Branch[] = [
  {
    id: "demo-branch-main",
    tenant_id: "demo-tenant-synqpos",
    name: "Main Flagship Store",
    address: "742 Evergreen Terrace, Suite 100",
    phone: "+1 (555) 234-5678",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-branch-downtown",
    tenant_id: "demo-tenant-synqpos",
    name: "Downtown Express",
    address: "100 Broadway Ave, Floor 1",
    phone: "+1 (555) 987-6543",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useTenantContext() {
  const { user } = useAuth();
  // tenantId is now injected by useTenantByDomain via TenantProvider (domain-resolved).
  const { tenantId, branchId, setTenant, setBranch } = useTenantStore();

  const { data: memberships, isLoading: loadingRoles } = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("tenant_id, role, branch_id, tenants(id, name, currency, tax_rate, active_channels)")
          .eq("user_id", user!.id);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn("[useTenantContext] Remote roles query unavailable, applying demo roles:", err);
      }

      // Fallback memberships for local demo user
      const userRole = (user?.user_metadata?.role as string) || "owner";
      return [
        {
          tenant_id: tenantId ?? "demo-tenant-synqpos",
          role: userRole,
          branch_id: "demo-branch-main",
          tenants: {
            id: tenantId ?? "demo-tenant-synqpos",
            name: "SynqPOS",
            currency: "USD",
            tax_rate: 0.08,
            active_channels: ["pos", "tables", "delivery", "qr", "rappi"],
          },
        },
      ];
    },
  });

  const localBranches = useBranchesStore((s) => s.branches);

  const { data: branches } = useQuery({
    queryKey: ["branches", tenantId, localBranches.length],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("branches")
          .select("*")
          .eq("tenant_id", tenantId!)
          .eq("status", "active")
          .order("name");
        if (error) throw error;
        if (data && data.length > 0) return data as Branch[];
      } catch (err) {
        console.warn("[useTenantContext] Remote branches query unavailable, applying fallback:", err);
      }
      const activeLocal = localBranches.filter((b) => b.status === "active");
      return activeLocal.length > 0 ? activeLocal : DEFAULT_FALLBACK_BRANCHES;
    },
  });

  const tenantMemberships = useMemo(
    () => (memberships ?? []).filter((m) => m.tenant_id === (tenantId ?? "demo-tenant-synqpos")),
    [memberships, tenantId],
  );
  const branchScopedIds = useMemo(
    () => tenantMemberships.map((m) => m.branch_id).filter(Boolean) as string[],
    [tenantMemberships],
  );

  // Auto-select the first branch the user can actually use in the domain tenant.
  useEffect(() => {
    if (!branchId && branches && branches.length > 0) {
      const scoped = branches.find((branch) => branchScopedIds.includes(branch.id));
      setBranch(scoped?.id ?? branches[0].id);
    }
  }, [branches, branchId, branchScopedIds, setBranch]);

  // Roles only for the current domain tenant and selected branch. Null branch_id means all branches.
  const roles = useMemo(() => {
    const list = tenantMemberships
      .filter((m) => !m.branch_id || !branchId || m.branch_id === branchId)
      .map((m) => m.role);

    // If list is empty but user is logged in as demo, ensure their role is represented
    if (list.length === 0 && user?.user_metadata?.role) {
      list.push(user.user_metadata.role);
    }

    // Owner and super_admin automatically inherit administrative roles
    if (list.includes("owner") || list.includes("super_admin")) {
      return Array.from(new Set([...list, "owner", "super_admin", "admin", "manager", "cashier"]));
    }

    return list;
  }, [branchId, tenantMemberships, user]);

  const hasRole = (...needed: string[]) =>
    roles.includes("super_admin") ||
    roles.includes("owner") ||
    roles.some((r) => needed.includes(r));

  // True when the logged-in user has at least one membership in the domain tenant
  const isAuthorizedForDomain =
    !loadingRoles &&
    (tenantMemberships.length > 0 || !!user);

  // Active channels from the domain tenant
  const activeChannels = useMemo(() => {
    const tenantObj = memberships?.find((m) => m.tenant_id === tenantId)?.tenants;
    if (isTenantSummary(tenantObj) && Array.isArray(tenantObj.active_channels)) {
      return tenantObj.active_channels;
    }
    return ["pos", "tables", "delivery", "qr", "rappi"];
  }, [memberships, tenantId]);

  return {
    tenantId,
    branchId,
    setTenant,
    setBranch,
    memberships: memberships ?? [],
    branches: branches ?? DEFAULT_FALLBACK_BRANCHES,
    roles,
    hasRole,
    isAuthorizedForDomain,
    isLoading: loadingRoles,
    needsOnboarding: !loadingRoles && (memberships?.length ?? 0) === 0 && !user,
    activeChannels,
  };
}
