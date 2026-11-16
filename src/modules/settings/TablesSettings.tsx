import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useTablesStore } from "@/stores/tables";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

export default function TablesSettings() {
  const { tenantId, branchId, branches } = useTenantContext();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [qrTable, setQrTable] = useState<any>(null);
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [scopeBranch, setScopeBranch] = useState<string>(branchId ?? "");
  const [waiterId, setWaiterId] = useState<string>("");

  const { data: waiters } = useQuery({
    queryKey: ["tenant-waiters", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("tenant_id", tenantId!)
        .in("role", ["waiter", "cashier", "manager", "admin", "owner"]);
      const ids = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
      if (ids.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
      return data ?? [];
    },
  });

  const localTables = useTablesStore((s) => s.tables);
  const addTableStore = useTablesStore((s) => s.addTable);
  const updateTableStore = useTablesStore((s) => s.updateTable);
  const deleteTableStore = useTablesStore((s) => s.deleteTable);

  const { data: tables } = useQuery({
    queryKey: ["tables-settings", tenantId, localTables],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("tables").select("*").eq("tenant_id", tenantId!).order("name");
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn("[TablesSettings] Supabase tables query failed, falling back to local tables store:", err);
      }
      return localTables;
    },
  });

  const reset = () => {
    setEditing(null);
    setName("");
    setCapacity(4);
    setScopeBranch(branchId ?? branches[0]?.id ?? "");
    setWaiterId("");
  };

  const openNew = () => { reset(); setOpen(true); };
  const openEdit = (t: any) => {
    setEditing(t);
    setName(t.name);
    setCapacity(t.capacity ?? 4);
    setScopeBranch(t.branch_id);
    setWaiterId(t.assigned_waiter_id ?? "");
    setOpen(true);
  };

  const save = async () => {
    if (!tenantId || !scopeBranch || !name.trim()) return toast.error(t("tables.fill_fields", "Please complete all fields"));
    const payload = {
      name: name.trim(), capacity, branch_id: scopeBranch,
      assigned_waiter_id: waiterId || null,
    };
    if (editing) {
      updateTableStore(editing.id, payload);
      try {
        await supabase.from("tables").update(payload).eq("id", editing.id);
      } catch {}
    } else {
      const newTbl = addTableStore({
        tenant_id: tenantId,
        ...payload,
        status: "available",
        sort_order: (tables?.length ?? 0) + 1,
      });
      try {
        await supabase.from("tables").insert({
          id: newTbl.id,
          tenant_id: tenantId,
          ...payload,
          sort_order: (tables?.length ?? 0) + 1,
        });
      } catch {}
    }
    toast.success(t("tables.saved", "Table saved successfully"));
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["tables-settings"] });
    qc.invalidateQueries({ queryKey: ["tables"] });
  };

  const remove = async (id: string) => {
    if (!confirm(t("tables.delete_confirm", "Delete this table?"))) return;
    deleteTableStore(id);
    try {
      await supabase.from("tables").delete().eq("id", id);
    } catch {}
    toast.success(t("tables.deleted", "Table deleted"));
    qc.invalidateQueries({ queryKey: ["tables-settings"] });
    qc.invalidateQueries({ queryKey: ["tables"] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-ink-900">{t("tables.title", "Tables")}</p>
          <p className="h-meta">{t("tables.settings_desc", "Branch table catalog")}</p>
        </div>
        <button type="button" className="g-btn g-btn-primary" onClick={openNew}>
          <Plus className="h-4 w-4" /> {t("tables.new_table", "New Table")}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {(tables ?? []).map((tItem) => {
          const branch = branches.find((b) => b.id === tItem.branch_id);
          return (
            <div key={tItem.id} className="glass rounded-xl p-3">
              <div className="flex items-start justify-between">
                <div className="font-bold text-lg text-ink-900">{tItem.name}</div>
                <span className="g-pill g-pill-ghost g-pill-h20">{tItem.capacity} {t("tables.pax", "guests")}</span>
              </div>
              <div className="h-meta mt-1 truncate">{branch?.name ?? "—"}</div>
              <div className="flex gap-1 mt-2">
                <button type="button" className="g-btn g-btn-ghost h-7 px-2" title={t("tables.edit_table", "Edit table")} onClick={() => openEdit(tItem)}>
                  <Pencil className="h-3 w-3" />
                </button>
                <button type="button" className="g-btn g-btn-ghost h-7 px-2" title={t("tables.view_qr", "View QR")} onClick={() => setQrTable(tItem)}>
                  <QrCode className="h-3 w-3" />
                </button>
                <button type="button" className="g-btn g-btn-ghost h-7 px-2 text-red-500 hover:text-red-600" title={t("tables.delete_table", "Delete table")} onClick={() => remove(tItem.id)}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
        {(tables ?? []).length === 0 && (
          <div className="col-span-full text-center py-12 h-meta">
            {t("tables.empty_settings", 'No tables created yet. Create the first one with "New Table".')}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("tables.edit_table", "Edit Table") : t("tables.new_table", "New Table")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("common.branch", "Branch")}</Label>
              <Select value={scopeBranch} onValueChange={setScopeBranch}>
                <SelectTrigger><SelectValue placeholder={t("tables.select_branch", "Select branch")} /></SelectTrigger>
                <SelectContent>
                  {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("tables.name_number", "Name / Number")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Table 1" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("tables.capacity", "Capacity")}</Label>
              <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("tables.assigned_waiter", "Assigned Waiter (optional)")}</Label>
              <Select value={waiterId || "none"} onValueChange={(v) => setWaiterId(v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder={t("tables.unassigned", "Unassigned")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("tables.unassigned_desc", "Unassigned (any waiter can take it)")}</SelectItem>
                  {(waiters ?? []).map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.full_name ?? w.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button type="button" className="g-btn g-btn-ghost" onClick={() => setOpen(false)}>{t("common.cancel", "Cancel")}</button>
            <button type="button" className="g-btn g-btn-primary" onClick={save}>{t("common.save", "Save")}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Dialog */}
      <Dialog open={!!qrTable} onOpenChange={(o) => { if (!o) setQrTable(null); }}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>QR · {qrTable?.name}</DialogTitle>
          </DialogHeader>
          {qrTable && (() => {
            const url = `${window.location.origin}/qr/${qrTable.branch_id}?table=${qrTable.id}`;
            return (
              <div className="flex flex-col items-center gap-4 py-2">
                <QRCodeSVG value={url} size={200} level="M" />
                <p className="h-meta break-all">{url}</p>
                <button
                  type="button"
                  className="g-btn g-btn-ghost"
                  onClick={() => { navigator.clipboard.writeText(url); toast.success(t("tables.url_copied", "URL copied")); }}
                >
                  {t("tables.copy_url", "Copy URL")}
                </button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
