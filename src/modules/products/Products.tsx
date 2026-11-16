import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/db";
import { useTenantContext } from "@/hooks/useTenantContext";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Search, Barcode, Trash2, Upload, FileDown, Download, HelpCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { exportToCsv, parseCsv } from "@/lib/csv";
import { ProductForm } from "./ProductForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

const TYPE_LABELS: Record<string, string> = {
  simple: "Simple",
  composite: "Composite",
  production: "Production",
  combo: "Combo",
  ingredient: "Ingredient",
  modifier: "Modifier"
};

export default function Products() {
  const { tenantId } = useTenantContext();
  const { t } = useI18n();
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [productType, setProductType] = useState<string>("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ["products", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("products").select("*, categories(name)")
          .eq("tenant_id", tenantId!).order("name");
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn("[Products] Supabase products query failed, falling back to local db:", err);
      }
      const cached = await db.products.where("tenant_id").equals(tenantId!).toArray();
      const cats = await db.categories.where("tenant_id").equals(tenantId!).toArray();
      const catMap = new Map(cats.map(c => [c.id, c.name]));
      return cached.map(p => ({
        ...p,
        categories: p.category_id ? { name: catMap.get(p.category_id) ?? null } : null,
      }));
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-list", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const { data } = await supabase.from("categories").select("id, name").eq("tenant_id", tenantId!).order("name");
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn("[Products] Categories query failed, falling back to local db:", err);
      }
      return await db.categories.where("tenant_id").equals(tenantId!).toArray();
    },
  });

  const filtered = (products ?? []).filter((p: any) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryId === "all" || p.category_id === categoryId;
    const matchType = productType === "all" || p.product_type === productType;
    return matchSearch && matchCategory && matchType;
  });

  const handleDelete = async () => {
    if (!deletingId || !tenantId) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", deletingId).eq("tenant_id", tenantId);
      if (error) throw error;
      toast({ title: t("products.deleted_title", "Product deleted"), description: t("products.deleted_desc", "The product was successfully deleted.") });
      qc.invalidateQueries({ queryKey: ["products"] });
    } catch (err: any) {
      toast({ title: t("products.delete_error", "Error deleting product"), description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      { name: "Mineral Water 500ml", category_name: "Beverages", sku: "BEV-001", barcode: "123456789012", price: "2.50", cost: "1.00", product_type: "simple", status: "active" },
      { name: "Ground Beef (10kg Box)", category_name: "Raw Materials", sku: "RAW-001", barcode: "", price: "0", cost: "50.00", product_type: "ingredient", status: "active" },
      { name: "Classic Cheeseburger", category_name: "Main Dishes", sku: "BUR-001", barcode: "", price: "8.50", cost: "3.20", product_type: "composite", status: "active" },
      { name: "Cheeseburger + Drink Combo", category_name: "Combos", sku: "CMB-001", barcode: "", price: "10.00", cost: "4.20", product_type: "combo", status: "active" }
    ];
    exportToCsv(`products_template_${tenantId}.csv`, template);
  };

  const [importFile, setImportFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const executeImport = async () => {
    if (!importFile || !tenantId) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseCsv(content);
        if (parsed.length === 0) {
          toast({ title: t("common.error", "Error"), description: t("products.csv_empty", "The file is empty or formatted incorrectly."), variant: "destructive" });
          return;
        }
        const isValid = parsed.every(row => row.name && row.name.trim() !== "");
        if (!isValid) {
          toast({ title: t("products.invalid_format", "Invalid format"), description: t("products.missing_name", "Ensure all product rows have at least a 'name' field."), variant: "destructive" });
          return;
        }
        const mapProductType = (type: string | undefined): string => {
          if (!type) return "simple";
          const normalized = type.trim().toLowerCase();
          switch (normalized) {
            case "standard":
            case "simple":
              return "simple";
            case "raw_material":
            case "ingredient":
              return "ingredient";
            case "manufactured":
            case "composite":
              return "composite";
            case "production":
              return "production";
            case "combo":
              return "combo";
            case "modifier":
              return "modifier";
            default:
              return "simple";
          }
        };
        const dataToInsert = parsed.map(row => {
          let category_id = null;
          if (row.category_name && categories) {
            const matched = categories.find(c => c.name.toLowerCase() === row.category_name.trim().toLowerCase());
            if (matched) category_id = matched.id;
          }
          return {
            tenant_id: tenantId,
            name: row.name,
            category_id,
            sku: row.sku || null,
            barcode: row.barcode || null,
            price: parseFloat(row.price) || 0,
            cost: parseFloat(row.cost) || 0,
            product_type: mapProductType(row.product_type),
            status: row.status || "active",
          };
        });
        const { error: deleteError } = await supabase.from("products").delete().eq("tenant_id", tenantId);
        if (deleteError) {
          console.error("Error deleting products:", deleteError);
          if (deleteError.code === "23503") {
            throw new Error(t("products.delete_fk_error", "Cannot clear existing products because they are linked to existing orders, recipes, or inventory movements."));
          }
          throw new Error(t("products.clear_error", "An error occurred while clearing the existing products table."));
        }
        const { error: insertError } = await supabase.from("products").insert(dataToInsert);
        if (insertError) {
          console.error("Error inserting products:", insertError);
          throw new Error(t("products.insert_error", "Products were cleared, but an error occurred inserting new records. Check category and field names."));
        }
        toast({ title: t("products.sync_success", "Sync Successful"), description: t("products.sync_success_desc", `Previous data cleared and ${dataToInsert.length} new products imported.`) });
        qc.invalidateQueries({ queryKey: ["products"] });
      } catch (err: any) {
        toast({ title: t("products.sync_error", "Sync Error"), description: err.message, variant: "destructive" });
      } finally {
        setImportFile(null);
      }
    };
    reader.readAsText(importFile);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="h-display g-page-title">{t("products.title", "Products")}</div>
        <div className="h-meta g-page-subtitle">{products?.length ?? 0} {t("nav.products", "products").toLowerCase()} · {t("products.catalog", "CATALOG")}</div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <Input className="pl-9 w-48 lg:w-64" placeholder={t("products.search", "Search products...")} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("products.category", "Category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("products.all_categories", "All Categories")}</SelectItem>
            {categories?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={productType} onValueChange={setProductType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder={t("products.type", "Type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("products.all_types", "All Types")}</SelectItem>
            <SelectItem value="simple">{t("products.types.simple", "Simple")}</SelectItem>
            <SelectItem value="composite">{t("products.types.composite", "Composite")}</SelectItem>
            <SelectItem value="production">{t("products.types.production", "Production")}</SelectItem>
            <SelectItem value="combo">{t("products.types.combo", "Combo")}</SelectItem>
            <SelectItem value="ingredient">{t("products.types.ingredient", "Ingredient")}</SelectItem>
            <SelectItem value="modifier">{t("products.types.modifier", "Modifier")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Product type guide dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <button type="button" className="g-btn g-btn-ghost g-btn-icon" title={t("products.type_guide", "Product Types Guide")} aria-label="Product Types Guide">
              <HelpCircle className="h-5 w-5 text-ink-400" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{t("products.type_guide_title", "Product Types Guide")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid gap-4">
                {[
                  { label: "1. Simple", desc: "Finished product sold directly without recipe assembly. E.g. Bottled beverage." },
                  { label: "2. Composite", desc: "Product assembled from recipe ingredients deducted on sale. E.g. Burger or sandwich." },
                  { label: "3. Production", desc: "Batch-manufactured goods producing stock from raw materials. E.g. House sauce or bread." },
                  { label: "4. Combo", desc: "Bundle of products sold together under a single package price. E.g. Lunch meal combo." },
                  { label: "5. Ingredient", desc: "Raw material strictly used in recipes and productions. E.g. Flour, salt, beef." },
                  { label: "6. Modifier", desc: "Custom add-on option for orders. E.g. Extra bacon, no onions." },
                ].map(({ label, desc }) => (
                  <div key={label} className="space-y-1">
                    <div className="font-semibold text-sm text-brand-500">{label}</div>
                    <p className="text-sm text-ink-500">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileSelect} title="CSV" aria-label="CSV" />

        <button type="button" className="g-btn g-btn-ghost" onClick={() => fileInputRef.current?.click()} title={t("products.import_csv", "Import CSV")}>
          <Upload className="h-4 w-4" /> {t("action.import", "Import")}
        </button>

        <button type="button" className="g-btn g-btn-ghost" onClick={handleDownloadTemplate} title={t("products.template_csv", "CSV Template")}>
          <FileDown className="h-4 w-4" /> {t("products.template_csv", "Template")}
        </button>

        <button
          type="button"
          className="g-btn g-btn-ghost"
          onClick={() => exportToCsv(`products_${tenantId}.csv`, filtered)}
          title={t("products.export_csv", "Export CSV")}
        >
          <Download className="h-4 w-4" /> {t("action.export", "Export")}
        </button>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <button type="button" className="g-btn g-btn-primary" onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4" />{t("products.new_product", "New Product")}
            </button>
          </DialogTrigger>
          <ProductForm
            tenantId={tenantId!}
            categories={categories ?? []}
            editing={editing}
            onClose={() => {
              setOpen(false); setEditing(null);
              qc.invalidateQueries({ queryKey: ["products"] });
              qc.invalidateQueries({ queryKey: ["product-components"] });
            }}
          />
        </Dialog>
      </div>

      {/* Products table */}
      <div className="glass rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("products.col_name", "Name")}</TableHead>
              <TableHead>{t("products.col_category", "Category")}</TableHead>
              <TableHead>{t("products.col_type", "Type")}</TableHead>
              <TableHead>{t("products.col_sku", "SKU / Code")}</TableHead>
              <TableHead className="text-right">{t("products.col_price", "Price")}</TableHead>
              <TableHead className="text-right">{t("products.col_cost", "Cost")}</TableHead>
              <TableHead>{t("products.col_status", "Status")}</TableHead>
              <TableHead className="text-right">{t("products.col_actions", "Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-purple-500/10 border border-purple-500/20 flex-shrink-0 flex items-center justify-center">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="font-bold text-sm text-purple-400">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink-900">{p.name}</div>
                      {p.description && (
                        <div className="truncate text-xs text-ink-400 max-w-xs">{p.description}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-ink-500">{p.categories?.name ?? "—"}</TableCell>
                <TableCell>
                  <span className="pill pill-ghost">{t(`products.types.${p.product_type}`, TYPE_LABELS[p.product_type] || p.product_type)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5 text-xs tabular-nums text-ink-500">
                    {p.sku && <span>{p.sku}</span>}
                    {p.barcode && (
                      <span className="flex items-center gap-1">
                        <Barcode className="h-3 w-3" />{p.barcode}
                      </span>
                    )}
                    {!p.sku && !p.barcode && <span>—</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">{formatCurrency(Number(p.price))}</TableCell>
                <TableCell className="text-right tabular-nums text-ink-500">{formatCurrency(Number(p.cost))}</TableCell>
                <TableCell>
                  <span className={p.status === "active" ? "pill pill-ok" : "pill pill-ghost"}>
                    {p.status === "active" ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      className="g-btn g-btn-ghost g-btn-icon"
                      title={t("products.edit_product", "Edit Product")}
                      aria-label={t("products.edit_product", "Edit Product")}
                      onClick={() => { setEditing(p); setOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="g-btn g-btn-ghost g-btn-icon g-btn-danger"
                      title={t("common.delete", "Delete")}
                      aria-label={t("common.delete", "Delete")}
                      onClick={() => setDeletingId(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-ink-400">
                  {t("products.empty_title", "No products found")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirm dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("products.delete_confirm", "Delete product?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("products.delete_desc", "This action cannot be undone. The product will be permanently removed.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete", "Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import confirm dialog */}
      <AlertDialog open={!!importFile} onOpenChange={(o) => !o && setImportFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              ⚠️ {t("products.import_warning_title", "Import Warning")}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{t("products.import_warning_file", "You are about to import")} <strong>{importFile?.name}</strong>.</p>
              <p>{t("products.import_warning_overwrite", "This action will replace existing products with the ones from the file.")}</p>
              <p className="font-semibold text-destructive">{t("products.import_warning_confirm", "Are you sure you want to proceed?")}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={executeImport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("products.import_btn_confirm", "Confirm & Import")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
