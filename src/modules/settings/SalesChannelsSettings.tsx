import { useEffect, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, RefreshCw, PlugZap, BookOpen, Store, UtensilsCrossed, CarFront } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type SalesChannel = Database["public"]["Enums"]["sales_channel"];

const RAPPI_WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rappi-webhook`;

export default function SalesChannelsSettings() {
  const { tenantId, branchId, branches, hasRole } = useTenantContext();
  const { t } = useI18n();
  const qc = useQueryClient();
  const isSuperAdmin = hasRole("super_admin");

  const [activeChannels, setActiveChannels] = useState<SalesChannel[]>([]);
  const [savingChannels, setSavingChannels] = useState(false);

  // Rappi State
  const [rappiStoreId, setRappiStoreId] = useState("");
  const [rappiAutoAccept, setRappiAutoAccept] = useState(false);
  const [rappiPrepTime, setRappiPrepTime] = useState(15);
  const [rappiStatus, setRappiStatus] = useState<"active" | "paused">("active");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: tenant, isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-channels", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await supabase
        .from("tenants")
        .select("active_channels")
        .eq("id", tenantId!)
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (tenant?.active_channels) {
      setActiveChannels(tenant.active_channels);
    } else {
      setActiveChannels(["pos", "qr", "delivery", "tables"]);
    }
  }, [tenant]);

  const updateChannelsMutation = useMutation({
    mutationFn: async (newChannels: SalesChannel[]) => {
      const { error } = await supabase
        .from("tenants")
        .update({ active_channels: newChannels })
        .eq("id", tenantId!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("channels.updated", "Sales channels updated"));
      qc.invalidateQueries({ queryKey: ["tenant-channels"] });
      qc.invalidateQueries();
    },
    onError: (e: any) => toast.error(e.message),
    onSettled: () => setSavingChannels(false),
  });

  const toggleChannel = (channel: SalesChannel, enabled: boolean) => {
    if (!isSuperAdmin) return toast.error(t("channels.admin_only", "Only a super admin can modify sales channels."));
    setSavingChannels(true);
    let updated = [...activeChannels];
    if (enabled) {
      if (!updated.includes(channel)) updated.push(channel);
    } else {
      updated = updated.filter((c) => c !== channel);
    }
    setActiveChannels(updated);
    updateChannelsMutation.mutate(updated);
  };

  const { data: rappiInteg, isLoading: loadingRappi } = useQuery({
    queryKey: ["rappi-integration", branchId],
    enabled: !!branchId && activeChannels.includes("rappi"),
    queryFn: async () => {
      const { data } = await supabase
        .from("rappi_integrations")
        .select("*")
        .eq("branch_id", branchId!)
        .maybeSingle();
      return data;
    },
  });

  const { data: rappiLogs } = useQuery({
    queryKey: ["rappi-logs", branchId],
    enabled: !!branchId && activeChannels.includes("rappi"),
    refetchInterval: 10000,
    queryFn: async () => {
      const { data } = await supabase
        .from("rappi_webhook_logs")
        .select("*")
        .or(`branch_id.eq.${branchId},branch_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (rappiInteg) {
      setRappiStoreId(rappiInteg.store_id ?? "");
      setRappiAutoAccept(!!rappiInteg.auto_accept);
      setRappiPrepTime(rappiInteg.prep_time_min ?? 15);
      setRappiStatus((rappiInteg.status as any) ?? "active");
    } else {
      setRappiStoreId(""); setRappiAutoAccept(false); setRappiPrepTime(15); setRappiStatus("active");
    }
  }, [rappiInteg]);

  const branchName = branches.find((b) => b.id === branchId)?.name ?? "—";

  const saveRappi = async () => {
    if (!tenantId || !branchId) return;
    if (!rappiStoreId.trim()) return toast.error(t("rappi.store_id_required", "Enter Rappi Store ID"));
    setBusy("saveRappi");
    try {
      const payload = {
        tenant_id: tenantId,
        branch_id: branchId,
        store_id: rappiStoreId.trim(),
        auto_accept: rappiAutoAccept,
        prep_time_min: rappiPrepTime,
        status: rappiStatus,
      };
      const { error } = rappiInteg
        ? await supabase.from("rappi_integrations").update(payload).eq("id", rappiInteg.id)
        : await supabase.from("rappi_integrations").insert(payload);
      if (error) throw error;
      toast.success(t("rappi.config_saved", "Rappi configuration saved"));
      qc.invalidateQueries({ queryKey: ["rappi-integration"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(null); }
  };

  const testRappi = async () => {
    if (!branchId) return;
    setBusy("testRappi");
    try {
      const { data, error } = await supabase.functions.invoke("rappi-test-connection", {
        body: { branch_id: branchId, store_id: rappiStoreId || rappiInteg?.store_id },
      });
      if (error) throw error;
      if (data?.ok) toast.success(t("rappi.conn_ok", "Connection OK with Rappi"));
      else toast.error(`${t("rappi.conn_failed", "Failed")}: ${data?.error ?? t("rappi.verify_creds", "verify credentials")}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const syncRappiMenu = async () => {
    if (!branchId) return;
    setBusy("syncRappi");
    try {
      const { data, error } = await supabase.functions.invoke("rappi-sync-menu", {
        body: { branch_id: branchId },
      });
      if (error) throw error;
      if (data?.ok) toast.success(`${t("rappi.menu_sent", "Menu sent")} · ${data.items} ${t("common.items", "items")}`);
      else toast.error(`${t("common.error", "Error")}: ${data?.error ?? t("rappi.could_not_send", "could not send")}`);
      qc.invalidateQueries({ queryKey: ["rappi-integration"] });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(RAPPI_WEBHOOK_URL);
    toast.success(t("rappi.webhook_copied", "Webhook URL copied"));
  };

  if (loadingTenant) return <div className="h-meta">{t("common.loading", "Loading...")}</div>;

  return (
    <div className="space-y-8">
      {/* GLOBAL CHANNELS TOGGLES */}
      <div className="glass p-6 rounded-2xl space-y-6">
        <div>
          <h2 className="font-bold flex items-center gap-2 text-ink-900">
            <Store className="h-5 w-5 text-brand-600" />
            {t("channels.title", "Sales Channels")}
          </h2>
          <p className="h-meta mt-1">
            {t("channels.desc", "Enable or disable available channels for this business. Disabled channels will not be shown in the POS or throughout the system. (Super Admin only)")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* POS — always on */}
          <div className="glass-thin rounded-xl p-4 flex flex-col gap-3 opacity-70">
            <div className="flex items-center justify-between">
              <div className="font-semibold flex items-center gap-2 text-ink-900">
                <Store className="h-4 w-4" /> {t("channels.pos", "Physical POS")}
              </div>
              <Switch checked disabled />
            </div>
            <p className="h-meta">{t("channels.pos_desc", "Default in-store POS (always active).")}</p>
          </div>

          {(
            [
              { key: "tables" as SalesChannel, label: t("channels.tables", "Dine-In Tables"), icon: <UtensilsCrossed className="h-4 w-4" />, desc: t("channels.tables_desc", "On-premise table sales and management.") },
              { key: "delivery" as SalesChannel, label: t("channels.delivery", "Own Delivery"), icon: <CarFront className="h-4 w-4" />, desc: t("channels.delivery_desc", "Direct dispatch management with drivers. Cash on delivery or card transfer.") },
              { key: "rappi" as SalesChannel, label: "Rappi", icon: <PlugZap className="h-4 w-4 text-orange-500" />, desc: t("channels.rappi_desc", "Direct integration with Rappi marketplace orders.") },
              { key: "didi" as SalesChannel, label: "DiDi Food", icon: <PlugZap className="h-4 w-4 text-orange-500" />, desc: t("channels.didi_desc", "Enables sales channel for DiDi Food.") },
              { key: "uber" as SalesChannel, label: "Uber Eats", icon: <PlugZap className="h-4 w-4 text-green-500" />, desc: t("channels.uber_desc", "Enables sales channel for Uber Eats.") },
            ] as { key: SalesChannel; label: string; icon: React.ReactNode; desc: string }[]
          ).map(({ key, label, icon, desc }) => {
            const active = activeChannels.includes(key);
            return (
              <div key={key} className={`glass-thin rounded-xl p-4 flex flex-col gap-3 transition-opacity ${active ? "" : "opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold flex items-center gap-2 text-ink-900">{icon} {label}</div>
                  <Switch
                    disabled={!isSuperAdmin || savingChannels}
                    checked={active}
                    onCheckedChange={(c) => toggleChannel(key, c)}
                  />
                </div>
                <p className="h-meta">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* RAPPI CONFIGURATION */}
      {activeChannels.includes("rappi") && (
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="glass p-6 rounded-2xl space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <PlugZap className="h-5 w-5 text-orange-500" />
                <h2 className="font-bold text-ink-900">{t("rappi.title", "Rappi Configuration")}</h2>
                {rappiInteg && (
                  <span className={`g-pill g-pill-h22 ml-2 ${rappiStatus === "active" ? "g-pill-ok" : "g-pill-ghost"}`}>
                    {rappiStatus === "active" ? t("common.active", "Active") : t("common.paused", "Paused")}
                  </span>
                )}
              </div>
              <p className="h-meta mt-1">
                {t("common.branch", "Branch")}: <strong>{branchName}</strong>. {t("rappi.branch_hint", "Each branch uses its own Rappi Partners Store ID.")}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("rappi.store_id", "Store ID (Rappi)")}</Label>
                <Input value={rappiStoreId} onChange={(e) => setRappiStoreId(e.target.value)} placeholder="e.g. 900123" />
              </div>
              <div className="space-y-1.5">
                <Label>{t("rappi.prep_time", "Preparation time (min)")}</Label>
                <Input
                  type="number" min="1" max="120"
                  value={rappiPrepTime}
                  onChange={(e) => setRappiPrepTime(Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("common.status", "Status")}</Label>
                <Select value={rappiStatus} onValueChange={(v) => setRappiStatus(v as "active" | "paused")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("common.active", "Active")}</SelectItem>
                    <SelectItem value="paused">{t("common.paused", "Paused")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between border border-black/5 rounded-lg px-3 h-10 mt-6">
                <Label className="cursor-pointer">{t("rappi.auto_accept", "Auto-accept orders")}</Label>
                <Switch checked={rappiAutoAccept} onCheckedChange={setRappiAutoAccept} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" className="g-btn g-btn-primary" onClick={saveRappi} disabled={busy === "saveRappi"}>
                {busy === "saveRappi" && <Loader2 className="h-4 w-4 animate-spin" />} {t("common.save", "Save")}
              </button>
              <button type="button" className="g-btn g-btn-ghost" onClick={testRappi} disabled={busy === "testRappi"}>
                {busy === "testRappi" && <Loader2 className="h-4 w-4 animate-spin" />} {t("rappi.test_conn", "Test connection")}
              </button>
              <button type="button" className="g-btn g-btn-ghost" onClick={syncRappiMenu} disabled={busy === "syncRappi" || !rappiInteg}>
                {busy === "syncRappi" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {t("rappi.sync_menu", "Sync menu")}
              </button>
              <a
                href="https://dev-portal.rappi.com/api/es/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm ml-auto h-label text-brand-600 hover:underline"
              >
                <BookOpen className="h-4 w-4" /> {t("common.documentation", "Documentation")}
              </a>
            </div>

            {rappiInteg?.last_menu_sync_at && (
              <p className="h-meta">{t("rappi.last_sync", "Last menu sync")}: {formatDate(rappiInteg.last_menu_sync_at)}</p>
            )}

            <div className="border-t border-black/5 pt-4 space-y-2">
              <p className="h-label uppercase tracking-wider">{t("rappi.webhook_url", "Webhook URL")}</p>
              <div className="flex gap-2">
                <Input readOnly value={RAPPI_WEBHOOK_URL} className="font-mono text-xs" />
                <button type="button" className="g-btn g-btn-ghost h-10 w-10 p-0 flex items-center justify-center" title={t("common.copy", "Copy URL")} onClick={copyWebhook}>
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="h-meta">
                {t("rappi.webhook_hint", "Paste this URL in the Rappi Partner Portal as target for order events (new orders, status updates).")}
              </p>
            </div>
          </div>

          <div className="glass p-4 rounded-2xl">
            <p className="font-semibold text-sm text-ink-900 mb-3">{t("rappi.recent_events", "Recent events received")}</p>
            {(rappiLogs ?? []).length === 0 ? (
              <p className="h-meta">{t("rappi.no_events", "No events yet.")}</p>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-auto">
                {rappiLogs!.map((l) => (
                  <div key={l.id} className="glass-thin rounded-lg p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-900">{l.event_type}</span>
                      <span className={`g-pill g-pill-h18 ${l.status === "error" ? "g-pill-bad" : "g-pill-ghost"}`}>
                        {l.status}
                      </span>
                    </div>
                    <div className="h-meta">{formatDate(l.created_at)}</div>
                    {l.rappi_order_id && <div className="h-meta">{t("digital.order", "Order")}: {l.rappi_order_id}</div>}
                    {l.error && <div className="text-red-500 truncate">{l.error}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
