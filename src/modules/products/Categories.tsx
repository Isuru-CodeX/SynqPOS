import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isCategoryActive } from "@/lib/categories";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Categories() {
  const { tenantId } = useTenantContext();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["categories", tenantId],
    enabled: !!tenantId,
    queryFn: async () => (await supabase.from("categories").select("*").eq("tenant_id", tenantId!).order("name")).data ?? [],
  });

  const handleDelete = async (cat: any) => {
    if (!confirm(`${t("categories.delete_confirm", "Delete category")} "${cat.name}"?\n\n${t("categories.delete_desc", "This cannot be undone. Associated products will become uncategorized.")}`)) return;
    setDeleting(cat.id);
    try {
      await supabase.from("products").update({ category_id: null }).eq("category_id", cat.id);
      const { error } = await supabase.from("categories").delete().eq("id", cat.id);
      if (error) throw error;
      toast.success(`${cat.name} ${t("common.deleted", "deleted")}`);
      qc.invalidateQueries({ queryKey: ["categories"] });
    } catch (e: any) {
      toast.error(e.message ?? t("common.error", "Could not delete"));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="h-display g-page-title">{t("categories.title", "Categories")}</div>
          <div className="h-meta g-page-subtitle">{categories?.length ?? 0} {t("categories.subtitle", "Product categories · CATALOG")}</div>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <button type="button" className="g-btn g-btn-primary" onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" />{t("categories.new", "New Category")}
            </button>
          </DialogTrigger>
          <CategoryDialog
            tenantId={tenantId!}
            editing={editing}
            onClose={() => { setOpen(false); setEditing(null); qc.invalidateQueries({ queryKey: ["categories"] }); }}
          />
        </Dialog>
      </div>

      {/* Dynamic color styles for categories */}
      <style>{`
        ${(categories ?? [])
          .map((c: any) => (c.color ? `.category-color-${c.id} { background-color: ${c.color}; }` : ""))
          .join("\n")}
      `}</style>

      {/* Category grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {(categories ?? []).map((c: any) => {
          const active = isCategoryActive(c);
          const isDeleting = deleting === c.id;
          return (
            <div key={c.id} className="glass rounded-2xl p-4 flex items-center gap-3">
              {/* Color swatch / orb */}
              <div className={`orb h-12 w-12 rounded-xl shrink-0 relative ${c.color ? `category-color-${c.id}` : ""}`}>
                {c.schedule_enabled && (
                  <Clock className="h-3.5 w-3.5 absolute -bottom-1 -right-1 text-white bg-black/60 rounded-full p-0.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="mt-0.5">
                  {c.schedule_enabled ? (
                    <span className={active ? "pill pill-ok" : "pill pill-ghost"}>
                      {active ? t("categories.active_now", "Active Now") : t("categories.off_hours", "Off Hours")}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-400 capitalize">{c.status}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="g-btn g-btn-ghost g-btn-icon"
                  title={t("categories.edit", "Edit category")}
                  aria-label={t("categories.edit", "Edit category")}
                  onClick={() => { setEditing(c); setOpen(true); }}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="g-btn g-btn-ghost g-btn-icon g-btn-danger"
                  title={t("categories.delete_confirm", "Delete category")}
                  aria-label={t("categories.delete_confirm", "Delete category")}
                  disabled={isDeleting}
                  onClick={() => handleDelete(c)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryDialog({ tenantId, editing, onClose }: { tenantId: string; editing: any; onClose: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState<any>(editing ?? {
    name: "", color: "#c2410c", sort_order: 0, status: "active",
    schedule_enabled: false, schedule_from: "08:00", schedule_until: "22:00",
    schedule_days: [0,1,2,3,4,5,6],
  });

  const toggleDay = (d: number) => {
    const days: number[] = form.schedule_days ?? [0,1,2,3,4,5,6];
    setForm({ ...form, schedule_days: days.includes(d) ? days.filter(x => x !== d) : [...days, d].sort() });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form, tenant_id: tenantId, sort_order: Number(form.sort_order),
        schedule_from: form.schedule_enabled ? form.schedule_from : null,
        schedule_until: form.schedule_enabled ? form.schedule_until : null,
        schedule_days: form.schedule_enabled ? form.schedule_days : [0,1,2,3,4,5,6],
      };
      if (editing) await supabase.from("categories").update(payload).eq("id", editing.id);
      else await supabase.from("categories").insert(payload);
      toast.success(t("action.saved", "Saved successfully"));
      onClose();
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{editing ? t("categories.edit", "Edit Category") : t("categories.new", "New Category")}</DialogTitle>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label>{t("categories.name", "Name")}</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("categories.color", "Color")}</Label>
            <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("categories.order", "Sort Order")}</Label>
            <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          </div>
        </div>

        {/* Schedule section */}
        <div className="border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-ink-400" />
              <Label>{t("categories.scheduled_hours", "Scheduled Hours")}</Label>
            </div>
            <Switch checked={form.schedule_enabled} onCheckedChange={(v) => setForm({ ...form, schedule_enabled: v })} />
          </div>
          {form.schedule_enabled && (
            <div className="space-y-2 pl-6">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">{t("categories.from", "From")}</Label>
                  <Input type="time" value={form.schedule_from ?? "08:00"} onChange={(e) => setForm({ ...form, schedule_from: e.target.value })} className="h-8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{t("categories.until", "Until")}</Label>
                  <Input type="time" value={form.schedule_until ?? "22:00"} onChange={(e) => setForm({ ...form, schedule_until: e.target.value })} className="h-8" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("categories.active_days", "Active Days")}</Label>
                <div className="flex gap-1 flex-wrap">
                  {DAYS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleDay(i)}
                      className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                        (form.schedule_days ?? []).includes(i)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label>{t("categories.active", "Active")}</Label>
          <Switch checked={form.status === "active"} onCheckedChange={(c) => setForm({ ...form, status: c ? "active" : "inactive" })} />
        </div>

        <button type="submit" className="g-btn g-btn-primary w-full g-btn-touch">
          {t("action.save", "Save")}
        </button>
      </form>
    </DialogContent>
  );
}
