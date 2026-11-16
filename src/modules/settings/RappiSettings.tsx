import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useI18n } from "@/lib/i18n";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, RefreshCw, PlugZap, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

const WEBHOOK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rappi-webhook`;

export default function RappiSettings() {
  const { tenantId, branchId, branches } = useTenantContext();
  const qc = useQueryClient();
  const { t } = useI18n();

  const [storeId, setStoreId] = useState("");
  const [autoAccept, setAutoAccept] = useState(false);
  const [prepTime, setPrepTime] = useState(15);
  const [status, setStatus] = useState<"active" | "paused">("active");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: integ, isLoading } = useQuery({
    queryKey: ["rappi-integration", branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const { data } = await supabase
        .from("rappi_integrations")
        .select("*")
        .eq("branch_id", branchId!)
        .maybeSingle();
      return data;
    },
  });

  const { data: logs } = useQuery({
    queryKey: ["rappi-logs", branchId],
    enabled: !!branchId,
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
    if (integ) {
      setStoreId(integ.store_id ?? "");
      setAutoAccept(!!integ.auto_accept);
      setPrepTime(integ.prep_time_min ?? 15);
      setStatus((integ.status as any) ?? "active");
    } else {
      setStoreId(""); setAutoAccept(false); setPrepTime(15); setStatus("active");
    }
  }, [integ]);

  const branchName = branches.find((b) => b.id === branchId)?.name ?? "—";

  const save = async () => {
    if (!tenantId || !branchId) return;
    if (!storeId.trim()) return toast.error(t("rappi.store_id_required", "Enter your Rappi Store ID"));
    setBusy("save");
    try {
      const payload = {
        tenant_id: tenantId,
        branch_id: branchId,
        store_id: storeId.trim(),
        auto_accept: autoAccept,
        prep_time_min: prepTime,
        status,
      };
      const { error } = integ
        ? await supabase.from("rappi_integrations").update(payload).eq("id", integ.id)
        : await supabase.from("rappi_integrations").insert(payload);
      if (error) throw error;
      toast.success(t("rappi.saved", "Integration settings saved successfully"));
      qc.invalidateQueries({ queryKey: ["rappi-integration"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(null); }
  };

  const test = async () => {
    if (!branchId) return;
    setBusy("test");
    try {
      const { data, error } = await supabase.functions.invoke("rappi-test-connection", {
        body: { branch_id: branchId, store_id: storeId || integ?.store_id },
      });
      if (error) throw error;
      if (data?.ok) toast.success(t("rappi.connection_ok", "Connection with Rappi verified successfully"));
      else toast.error(t("rappi.connection_fail", `Connection failed: ${data?.error ?? "check credentials"}`));
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const syncMenu = async () => {
    if (!branchId) return;
    setBusy("sync");
    try {
      const { data, error } = await supabase.functions.invoke("rappi-sync-menu", {
        body: { branch_id: branchId },
      });
      if (error) throw error;
      if (data?.ok) toast.success(t("rappi.menu_synced", `Menu synced · ${data.items} items`));
      else toast.error(t("rappi.menu_sync_error", `Error: ${data?.error ?? "failed to sync menu"}`));
      qc.invalidateQueries({ queryKey: ["rappi-integration"] });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(null); }
  };

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(WEBHOOK_URL);
    toast.success(t("rappi.webhook_copied", "Webhook URL copied to clipboard"));
  };

  if (isLoading) return <div className="text-muted-foreground">{t("common.loading", "Loading…")}</div>;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="glass p-6 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <PlugZap className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">{t("rappi.title", "Rappi Integration")}</h2>
            {integ && (
              <Badge variant={status === "active" ? "default" : "outline"}>
                {status === "active" ? t("common.active", "Active") : t("common.paused", "Paused")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("rappi.branch", "Branch")}: <strong>{branchName}</strong>. {t("rappi.branch_notice", "Each branch uses its own Rappi Partners Store ID.")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>{t("rappi.store_id", "Store ID (Rappi)")}</Label>
            <Input value={storeId} onChange={(e) => setStoreId(e.target.value)} placeholder="e.g. 900123" />
          </div>
          <div>
            <Label>{t("rappi.prep_time", "Preparation Time (minutes)")}</Label>
            <Input
              type="number" min="1" max="120"
              value={prepTime}
              onChange={(e) => setPrepTime(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>{t("rappi.status", "Status")}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("common.active", "Active")}</SelectItem>
                <SelectItem value="paused">{t("common.paused", "Paused")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between border rounded-md px-3 h-10 mt-6">
            <Label className="cursor-pointer">{t("rappi.auto_accept", "Auto-accept Orders")}</Label>
            <Switch checked={autoAccept} onCheckedChange={setAutoAccept} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={busy === "save"}>
            {busy === "save" && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} {t("action.save", "Save")}
          </Button>
          <Button variant="outline" onClick={test} disabled={busy === "test"}>
            {busy === "test" && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} {t("rappi.test_conn", "Test Connection")}
          </Button>
          <Button variant="outline" onClick={syncMenu} disabled={busy === "sync" || !integ}>
            {busy === "sync" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            {t("rappi.sync_menu", "Sync Menu")}
          </Button>
          <a
            href="https://dev-portal.rappi.com/api/es/" target="_blank" rel="noreferrer"
            className="inline-flex items-center text-sm text-primary hover:underline ml-auto"
          >
            <BookOpen className="h-4 w-4 mr-1" /> {t("rappi.documentation", "Documentation")}
          </a>
        </div>

        {integ?.last_menu_sync_at && (
          <p className="text-xs text-muted-foreground">
            {t("rappi.last_sync", "Last menu sync")}: {formatDate(integ.last_menu_sync_at)}
          </p>
        )}

        <div className="border-t pt-4">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">{t("rappi.webhook_url", "Webhook URL")}</Label>
          <div className="flex gap-2 mt-1">
            <Input readOnly value={WEBHOOK_URL} className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={copyWebhook}><Copy className="h-4 w-4" /></Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("rappi.webhook_desc", "Paste this URL in the Rappi Partner Portal as your webhook endpoint (new orders, status updates).")}
          </p>
        </div>
      </div>

      <div className="glass p-4">
        <div className="text-sm font-semibold mb-3">{t("rappi.recent_events", "Recent Webhook Events")}</div>
        {(logs ?? []).length === 0 ? (
          <div className="text-xs text-muted-foreground">{t("rappi.no_events", "No events received yet.")}</div>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-auto">
            {logs!.map((l) => (
              <div key={l.id} className="text-xs border rounded-md p-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{l.event_type}</span>
                  <Badge variant={l.status === "error" ? "destructive" : "outline"} className="text-[10px]">
                    {l.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground">{formatDate(l.created_at)}</div>
                {l.rappi_order_id && <div>{t("rappi.order", "Order")}: {l.rappi_order_id}</div>}
                {l.error && <div className="text-destructive truncate">{l.error}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
