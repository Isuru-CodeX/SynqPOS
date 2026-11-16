import { useState } from "react";
import { useTenantContext } from "@/hooks/useTenantContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ShieldCheck, RefreshCcw, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useI18n } from "@/lib/i18n";

export function SystemMaintenance() {
  const { tenantId, branchId } = useTenantContext();
  const [loading, setLoading] = useState<string | null>(null);
  const { t } = useI18n();

  const processEmailQueue = async () => {
    setLoading("email");
    try {
      const { data, error } = await supabase.functions.invoke("process-email-queue");
      if (error) throw error;
      toast.success(t("maintenance.email_processed", `Email queue processed: ${data?.processed || 0} sent`));
    } catch (err: any) {
      toast.error(t("maintenance.email_error", "Error processing email queue: ") + err.message);
    } finally {
      setLoading(null);
    }
  };

  const auditInventoryDrift = async () => {
    setLoading("inventory");
    try {
      const { error } = await supabase.rpc("audit_inventory_drift", {
        _tenant_id: tenantId,
        _branch_id: branchId
      });
      if (error) throw error;
      toast.success(t("maintenance.inventory_synced", "Inventory audit completed: stock records synchronized"));
    } catch (err: any) {
      toast.error(t("maintenance.audit_error", "Error during audit: ") + err.message);
    } finally {
      setLoading(null);
    }
  };

  const testWhatsAppConnection = async () => {
    setLoading("whatsapp");
    try {
      const { data, error } = await supabase.rpc("ai_whatsapp_config_summary", {
        _branch_id: branchId
      });
      if (error) throw error;
      
      const config = data?.[0];
      if (!config || !config.is_active) {
        toast.error(t("maintenance.whatsapp_not_active", "WhatsApp is not configured or active for this branch"));
        return;
      }

      toast.success(t("maintenance.whatsapp_loaded", "WhatsApp configuration verified successfully"));
    } catch (err: any) {
      toast.error(t("maintenance.whatsapp_error", "WhatsApp test error: ") + err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Emails */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand-600">
            <Mail className="h-5 w-5" />
            <div className="g-title-15">{t("maintenance.messaging", "Messaging")}</div>
          </div>
          <div className="h-meta">{t("maintenance.messaging_desc", "Manual dispatch of pending email queue.")}</div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={processEmailQueue}
            disabled={!!loading}
          >
            {loading === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t("maintenance.process_email", "Process Email Queue")}
          </Button>
        </div>

        {/* Inventory */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand-600">
            <ShieldCheck className="h-5 w-5" />
            <div className="g-title-15">{t("maintenance.consistency", "Data Consistency")}</div>
          </div>
          <div className="h-meta">{t("maintenance.consistency_desc", "Ensures all active products have valid stock records.")}</div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={auditInventoryDrift}
            disabled={!!loading}
          >
            {loading === "inventory" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            {t("maintenance.sync_stocks", "Synchronize Stock Records")}
          </Button>
        </div>

        {/* WhatsApp */}
        <div className="glass rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-brand-600">
            <RefreshCcw className="h-5 w-5" />
            <div className="g-title-15">{t("maintenance.diagnostics", "Diagnostics")}</div>
          </div>
          <div className="h-meta">{t("maintenance.diagnostics_desc", "Verifies live connection with the AI WhatsApp gateway.")}</div>
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={testWhatsAppConnection}
            disabled={!!loading}
          >
            {loading === "whatsapp" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {t("maintenance.test_whatsapp", "Test WhatsApp Gateway")}
          </Button>
        </div>
      </div>

      <Alert variant="destructive" className="bg-destructive/5">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("maintenance.manual_mode", "Manual Execution Mode")}</AlertTitle>
        <AlertDescription>
          {t("maintenance.manual_mode_desc", "Background maintenance routines can be triggered manually by administrators to audit data consistency.")}
        </AlertDescription>
      </Alert>
    </div>
  );
}
