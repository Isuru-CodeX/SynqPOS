import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useBranchesStore } from "@/stores/branches";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Store, Pencil, Trash2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Branch } from "@/types/branch";

export default function Branches() {
  const { tenantId, hasRole } = useTenantContext();
  const { t } = useI18n();
  const qc = useQueryClient();
  const canManage = hasRole("owner", "admin");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [deleting, setDeleting] = useState<string | null>(null);

  const localBranches = useBranchesStore((s) => s.branches);
  const addBranchStore = useBranchesStore((s) => s.addBranch);
  const updateBranchStore = useBranchesStore((s) => s.updateBranch);
  const deleteBranchStore = useBranchesStore((s) => s.deleteBranch);
  const toggleBranchStatusStore = useBranchesStore((s) => s.toggleBranchStatus);

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches-admin", tenantId, localBranches],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("branches")
          .select("id, name, address, phone, status, tenant_id, table_view_mode")
          .eq("tenant_id", tenantId!)
          .order("name");
        if (error) throw error;
        if (data && data.length > 0) return data as Branch[];
      } catch (err) {
        console.warn("[Branches] Remote query failed, using local store:", err);
      }
      return localBranches;
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", address: "", phone: "" });
    setOpen(true);
  };

  const openEdit = (b: Branch) => {
    setEditing(b);
    setForm({ name: b.name, address: b.address ?? "", phone: b.phone ?? "" });
    setOpen(true);
  };

  const save = async () => {
    if (!tenantId) return;
    if (!form.name.trim()) return toast.error(t("branches.name_required", "Branch name is required"));
    try {
      if (editing) {
        updateBranchStore(editing.id, {
          name: form.name,
          address: form.address || null,
          phone: form.phone || null,
        });
        try {
          await supabase
            .from("branches")
            .update({ name: form.name, address: form.address || null, phone: form.phone || null })
            .eq("id", editing.id);
        } catch {}
        toast.success(t("branches.updated", "Branch updated successfully"));
      } else {
        const newBranch = addBranchStore({
          tenant_id: tenantId,
          name: form.name,
          address: form.address || null,
          phone: form.phone || null,
          status: "active",
        });
        try {
          await supabase
            .from("branches")
            .insert({
              id: newBranch.id,
              tenant_id: tenantId,
              name: form.name,
              address: form.address || null,
              phone: form.phone || null,
            });
          await supabase
            .from("cash_registers")
            .insert({ tenant_id: tenantId, branch_id: newBranch.id, name: "Register 1" });
        } catch {}
        toast.success(t("branches.created", "Branch created successfully"));
      }
      qc.invalidateQueries({ queryKey: ["branches-admin"] });
      qc.invalidateQueries({ queryKey: ["branches"] });
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleStatus = async (b: Branch) => {
    const next = b.status === "active" ? "inactive" : "active";
    toggleBranchStatusStore(b.id);
    try {
      await supabase.from("branches").update({ status: next }).eq("id", b.id);
    } catch {}
    toast.success(next === "active" ? t("branches.activated", "Branch activated") : t("branches.deactivated", "Branch deactivated"));
    qc.invalidateQueries({ queryKey: ["branches-admin"] });
    qc.invalidateQueries({ queryKey: ["branches"] });
  };

  const handleDelete = async (b: Branch) => {
    const total = branches?.length ?? 0;
    if (total <= 1) {
      return toast.error(t("branches.delete_only_error", "You cannot delete the only branch. You must maintain at least one."));
    }
    if (
      !confirm(
        t("branches.delete_confirm", `Delete branch "${b.name}"? Associated registers and data will be removed. This cannot be undone.`)
      )
    )
      return;

    setDeleting(b.id);
    try {
      deleteBranchStore(b.id);
      try {
        await supabase.from("cash_registers").delete().eq("branch_id", b.id);
        await supabase.from("branches").delete().eq("id", b.id);
      } catch {}
      toast.success(t("branches.deleted", `Branch "${b.name}" deleted`));
      qc.invalidateQueries({ queryKey: ["branches-admin"] });
      qc.invalidateQueries({ queryKey: ["branches"] });
    } catch (e: any) {
      toast.error(e.message ?? "Could not delete");
    } finally {
      setDeleting(null);
    }
  };

  const activeCount = branches?.filter((b) => b.status === "active").length ?? 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="g-branches-header">
        <div className="orb g-branches-header-orb">
          <Store className="h-5 w-5" />
        </div>
        <div className="g-branches-header-info">
          <div className="g-branches-eyebrow">{t("branches.eyebrow", "BUSINESS · BRANCHES")}</div>
          <h1 className="g-branches-title">{t("branches.title", "Branches & Locations")}</h1>
          <div className="h-meta">
            {branches?.length ?? 0} {t("branches.registered", "registered")} · {activeCount} {t("branches.active", "active")}
          </div>
        </div>
        {canManage && (
          <button type="button" className="g-btn g-btn-primary" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t("branches.new", "New Branch")}
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="h-meta text-center py-16">{t("common.loading", "Loading…")}</div>
      ) : !branches || branches.length === 0 ? (
        <EmptyState
          icon={Store}
          title={t("branches.empty_title", "No branches")}
          description={t("branches.empty_desc", "Create your first branch to start operating")}
        />
      ) : (
        <div className="g-branches-grid">
          {branches.map((b) => {
            const isActive = b.status === "active";
            const isDeleting = deleting === b.id;
            return (
              <div key={b.id} className="glass g-branch-card">
                {/* Top row */}
                <div className="g-branch-card-top">
                  <div className="g-branch-card-identity">
                    <div className="orb g-branch-card-orb">
                      <Store className="h-4 w-4" />
                    </div>
                    <div className="g-branch-card-name-wrap">
                      <div className="g-branch-card-name">{b.name}</div>
                      <div className="g-branch-card-pill-row">
                        <span className={"g-pill " + (isActive ? "g-pill-ok" : "g-pill-ghost")}>
                          {isActive ? t("branches.active", "Active") : t("branches.inactive", "Inactive")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="g-branch-card-actions">
                      <button
                        type="button"
                        className="g-btn g-btn-ghost g-btn-icon"
                        onClick={() => openEdit(b)}
                        title={t("branches.edit", "Edit Branch")}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="g-btn g-btn-ghost g-btn-icon g-branch-card-del-btn"
                        disabled={isDeleting || (branches?.length ?? 0) <= 1}
                        onClick={() => handleDelete(b)}
                        title={(branches?.length ?? 0) <= 1 ? t("branches.cannot_delete_only", "Cannot delete only branch") : t("common.delete", "Delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact info */}
                {(b.address || b.phone) && (
                  <div className="glass-thin g-branch-info-block">
                    {b.address && (
                      <div className="g-branch-info-row">
                        <MapPin className="h-3.5 w-3.5 g-branch-info-icon" />
                        <span className="g-branch-info-text">{b.address}</span>
                      </div>
                    )}
                    {b.phone && (
                      <div className="g-branch-info-row">
                        <Phone className="h-3.5 w-3.5 g-branch-info-icon" />
                        <span className="g-branch-info-text">{b.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Toggle status */}
                {canManage && (
                  <button
                    type="button"
                    className="g-btn g-btn-ghost g-branch-toggle-btn"
                    onClick={() => toggleStatus(b)}
                  >
                    {isActive ? t("branches.deactivate", "Deactivate") : t("branches.activate", "Activate")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("branches.edit", "Edit Branch") : t("branches.new", "New Branch")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t("branches.name", "Branch Name")}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>{t("branches.address", "Address")}</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <Label>{t("branches.phone", "Phone")}</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <button type="button" className="g-btn g-btn-ghost" onClick={() => setOpen(false)}>{t("common.cancel", "Cancel")}</button>
            <button type="button" className="g-btn g-btn-primary" onClick={save}>{t("common.save", "Save")}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
