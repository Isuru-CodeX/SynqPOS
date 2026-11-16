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
import { Copy, Bot, Webhook, Save, Loader2, Wifi, WifiOff, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const EVO_WEBHOOK = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evolution-webhook`;

// ─── Types ───────────────────────────────────────────────────
type DiagStep = {
  label: string;
  status: "pending" | "ok" | "fail" | "warn";
  detail?: string;
};

// ─── Helper ──────────────────────────────────────────────────
const statusIcon = (s: DiagStep["status"]) => {
  if (s === "ok")   return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
  if (s === "fail") return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
  if (s === "warn") return <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />;
  return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />;
};

export default function WhatsAppSettings() {
  const { tenantId, branchId, branches } = useTenantContext();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState(branchId ?? "");
  const [instance, setInstance] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Diagnostics state ──
  const [testing, setTesting] = useState(false);
  const [diagSteps, setDiagSteps] = useState<DiagStep[]>([]);
  const [diagDone, setDiagDone] = useState(false);

  const { data: config, isLoading } = useQuery({
    queryKey: ["ai-channel-config", selectedBranch],
    enabled: !!selectedBranch,
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_channel_configs")
        .select("*")
        .eq("branch_id", selectedBranch)
        .eq("channel", "whatsapp")
        .maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (config) {
      setInstance((config.config as any)?.evolution_instance ?? "");
      setPhone(config.phone_number ?? "");
      setIsActive(config.is_active ?? true);
    } else {
      setInstance("");
      setPhone("");
      setIsActive(true);
    }
  }, [config]);

  useEffect(() => {
    if (branchId) setSelectedBranch(branchId);
  }, [branchId]);

  // ── Save ──────────────────────────────────────────────────
  const save = async () => {
    if (!instance.trim()) return toast.error(t("wa_settings.instance_required", "Enter Evolution API instance name"));
    if (!selectedBranch || !tenantId) return;
    setSaving(true);
    try {
      const payload = {
        tenant_id: tenantId,
        branch_id: selectedBranch,
        channel: "whatsapp",
        phone_number: phone.trim() || null,
        is_active: isActive,
        config: { evolution_instance: instance.trim() },
        updated_at: new Date().toISOString(),
      };
      const { error } = config
        ? await supabase.from("ai_channel_configs").update(payload).eq("id", config.id)
        : await supabase.from("ai_channel_configs").insert(payload);
      if (error) throw error;
      toast.success(t("wa_settings.config_saved", "Configuration saved"));
      qc.invalidateQueries({ queryKey: ["ai-channel-config"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(EVO_WEBHOOK);
    toast.success(t("wa_settings.webhook_copied", "Webhook URL copied"));
  };

  // ── Connection test ───────────────────────────────────────
  const runDiagnostics = async () => {
    setTesting(true);
    setDiagDone(false);
    const steps: DiagStep[] = [
      { label: t("wa_settings.step_db", "Database configuration"), status: "pending" },
      { label: t("wa_settings.step_hook", "Edge function evolution-webhook"), status: "pending" },
      { label: t("wa_settings.step_send", "Edge function send-whatsapp-message"), status: "pending" },
      { label: t("wa_settings.step_reachable", "Evolution API reachable (client fetch)"), status: "pending" },
      { label: t("wa_settings.step_inst", "Evolution API instance responding"), status: "pending" },
    ];
    setDiagSteps([...steps]);

    const update = (i: number, patch: Partial<DiagStep>) => {
      steps[i] = { ...steps[i], ...patch };
      setDiagSteps([...steps]);
    };

    // Step 0: DB config check
    try {
      const { data: cfgCheck } = await supabase
        .from("ai_channel_configs")
        .select("id, is_active, phone_number, config")
        .eq("branch_id", selectedBranch)
        .eq("channel", "whatsapp")
        .eq("is_active", true)
        .maybeSingle();

      if (!cfgCheck) {
        update(0, { status: "fail", detail: t("wa_settings.err_no_active", "No active WhatsApp config for this branch. Please save config first.") });
      } else {
        const evoInst = (cfgCheck.config as any)?.evolution_instance;
        if (!evoInst) {
          update(0, { status: "warn", detail: t("wa_settings.err_no_inst_name", "Config found but missing Evolution instance name.") });
        } else {
          update(0, { status: "ok", detail: `${t("wa_settings.instance", "Instance")}: "${evoInst}" | ${t("wa_settings.phone", "Phone")}: ${cfgCheck.phone_number ?? t("common.none", "none")}` });
        }
      }
    } catch (e: any) {
      update(0, { status: "fail", detail: e.message });
    }

    // Step 1: Ping evolution-webhook function
    try {
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evolution-webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "PING_TEST", instance: "__ping__", data: {} }),
      });
      const body = await r.json().catch(() => ({}));
      if (r.status === 200 || r.status === 404) {
        update(1, { status: "ok", detail: `HTTP ${r.status} – ${t("wa_settings.fn_active", "function active")}` });
      } else {
        update(1, { status: "warn", detail: `HTTP ${r.status}: ${JSON.stringify(body)}` });
      }
    } catch (e: any) {
      update(1, { status: "fail", detail: `${t("wa_settings.unreachable", "Unreachable")}: ${e.message}` });
    }

    // Step 2: Ping send-whatsapp-message
    try {
      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (r.status === 401) {
        update(2, { status: "ok", detail: t("wa_settings.expected_401", "Expected HTTP 401 – function active and protected") });
      } else {
        const respBody = await r.json().catch(() => ({}));
        update(2, { status: "warn", detail: `HTTP ${r.status}: ${JSON.stringify(respBody)}` });
      }
    } catch (e: any) {
      update(2, { status: "fail", detail: `${t("wa_settings.unreachable", "Unreachable")}: ${e.message}` });
    }

    // Step 3 & 4
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("No active session");

      const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          __connection_test: true,
          tenant_id: tenantId,
          branch_id: selectedBranch,
        }),
      });
      const respBody = await r.json().catch(() => ({}));

      if (r.status === 200 && respBody?.diagnostics) {
        const diag = respBody.diagnostics;
        update(3, { status: "ok", detail: t("wa_settings.auth_ok", "JWT Auth ✓ | Role permissions verified") });
        const evoUrlOk = diag.evolution_api_url_set;
        const evoKeyOk = diag.evolution_api_key_set;
        if (evoUrlOk && evoKeyOk) {
          update(4, { status: "ok", detail: t("wa_settings.secrets_ok", "EVOLUTION_API_URL and EVOLUTION_API_KEY configured in secrets") });
        } else {
          const missing = [!evoUrlOk && "EVOLUTION_API_URL", !evoKeyOk && "EVOLUTION_API_KEY"].filter(Boolean).join(" & ");
          update(4, {
            status: "fail",
            detail: `${t("wa_settings.missing_secrets", "Missing secrets")}: ${missing}.`,
          });
        }
      } else if (r.status === 401) {
        update(3, { status: "fail", detail: t("wa_settings.jwt_rejected", "JWT rejected – verify user has active session") });
        update(4, { status: "warn", detail: t("wa_settings.requires_auth", "Requires valid authentication to continue") });
      } else if (r.status === 403) {
        update(3, { status: "fail", detail: t("wa_settings.forbidden", "Forbidden – verify owner/admin/manager role") });
        update(4, { status: "warn", detail: t("wa_settings.requires_role", "Requires adequate role to continue") });
      } else {
        update(3, { status: "warn", detail: `HTTP ${r.status}: ${JSON.stringify(respBody)}` });
        update(4, { status: "warn", detail: t("wa_settings.unexpected", "Unexpected result") });
      }
    } catch (e: any) {
      update(3, { status: "fail", detail: e.message });
      update(4, { status: "warn", detail: t("wa_settings.could_not_complete", "Could not complete test") });
    }

    setDiagDone(true);
    setTesting(false);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Webhook URL */}
      <div className="glass p-5 space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <Webhook className="h-4 w-4 text-primary" />
          {t("wa_settings.webhook_title", "Webhook URL (Evolution API)")}
        </div>
        <p className="text-sm text-muted-foreground">
          {t("wa_settings.webhook_desc", "Configure this URL in your Evolution API instance as the target for event")}{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-xs">MESSAGES_UPSERT</code>.
        </p>
        <div className="flex gap-2">
          <Input readOnly value={EVO_WEBHOOK} className="font-mono text-xs" />
          <Button variant="outline" size="icon" onClick={copyWebhook} title={t("common.copy", "Copy URL")}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Configuración por sucursal */}
      <div className="glass p-5 space-y-4">
        <div className="flex items-center gap-2 font-semibold">
          <Bot className="h-4 w-4 text-primary" />
          {t("wa_settings.agent_title", "WhatsApp AI Agent")}
          {config && (
            <Badge className={config.is_active ? "bg-success text-success-foreground" : "bg-muted"}>
              {config.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
            </Badge>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t("common.branch", "Branch")}</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger>
              <SelectValue placeholder={t("wa_settings.select_branch", "Select branch...")} />
            </SelectTrigger>
            <SelectContent>
              {(branches ?? []).map((b: any) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading", "Loading...")}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("wa_settings.instance_name", "Instance name (Evolution API)")}</Label>
              <Input
                placeholder="e.g. synq-main-store"
                value={instance}
                onChange={e => setInstance(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("wa_settings.instance_hint", "Must match exactly the instance name configured in Evolution API.")}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>{t("wa_settings.phone_number", "Associated WhatsApp Number (optional)")}</Label>
              <Input
                placeholder="15551234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="wa-active" />
              <Label htmlFor="wa-active">{t("wa_settings.agent_active", "Agent active")}</Label>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {t("common.save", "Save configuration")}
              </Button>
              <Button variant="outline" onClick={runDiagnostics} disabled={testing || !selectedBranch}>
                {testing
                  ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  : diagDone
                    ? <RefreshCw className="h-4 w-4 mr-2" />
                    : <Wifi className="h-4 w-4 mr-2" />
                }
                {diagDone ? t("wa_settings.repeat_diag", "Rerun diagnostics") : t("wa_settings.test_conn", "Test connection")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Diagnostics panel ── */}
      {diagSteps.length > 0 && (
        <div className="glass p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold">
            {diagDone
              ? diagSteps.every(s => s.status === "ok")
                ? <><CheckCircle2 className="h-4 w-4 text-green-500" /> {t("wa_settings.all_good", "All systems operational")}</>
                : diagSteps.some(s => s.status === "fail")
                  ? <><WifiOff className="h-4 w-4 text-red-500" /> {t("wa_settings.issues_found", "Issues found")}</>
                  : <><AlertCircle className="h-4 w-4 text-yellow-500" /> {t("wa_settings.warnings_found", "Warnings detected")}</>
              : <><Loader2 className="h-4 w-4 animate-spin text-primary" /> {t("wa_settings.running_diag", "Running diagnostics...")}</>
            }
          </div>

          <div className="space-y-2">
            {diagSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0">
                {statusIcon(step.status)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-none mb-0.5">{step.label}</p>
                  {step.detail && (
                    <p className={`text-xs mt-1 ${
                      step.status === "fail" ? "text-red-500"
                      : step.status === "warn" ? "text-yellow-600"
                      : "text-muted-foreground"
                    }`}>
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {diagDone && diagSteps.some(s => s.status === "fail" || s.status === "warn") && (
            <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">{t("wa_settings.rec_actions", "Recommended actions:")}</p>
              {diagSteps[0]?.status !== "ok" && (
                <p>• <strong>{t("wa_settings.config", "Configuration")}:</strong> {t("wa_settings.rec_cfg", "Fill the instance name, save, and activate the agent.")}</p>
              )}
              {(diagSteps[3]?.status !== "ok") && (
                <p>• <strong>{t("wa_settings.secrets", "Edge Function Secrets")}:</strong> {t("wa_settings.rec_secrets", "Ensure EVOLUTION_API_URL and EVOLUTION_API_KEY are configured in Supabase secrets.")}</p>
              )}
              {(diagSteps[4]?.status === "warn") && (
                <p>• <strong>Evolution API:</strong> {t("wa_settings.rec_evo", `Verify that instance "${instance || "?"}" is connected (QR scanned) and webhook URL is configured.`)}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instrucciones */}
      <div className="glass p-5 space-y-2 bg-muted/30">
        <p className="text-sm font-medium">{t("wa_settings.instructions_title", "How to connect Evolution API")}</p>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>{t("wa_settings.step1", "Create an instance in your Evolution API with the exact instance name entered above.")}</li>
          <li>{t("wa_settings.step2", "In that instance, go to Webhooks and paste the webhook URL from above.")}</li>
          <li>{t("wa_settings.step3", "Enable the MESSAGES_UPSERT event.")}</li>
          <li>{t("wa_settings.step4", "Connect WhatsApp by scanning the QR code in Evolution API.")}</li>
          <li>{t("wa_settings.step5", "Toggle Agent active above and click Save.")}</li>
          <li>{t("wa_settings.step6", "In Supabase Secrets, make sure EVOLUTION_API_URL and EVOLUTION_API_KEY are set.")}</li>
        </ol>
      </div>
    </div>
  );
}
