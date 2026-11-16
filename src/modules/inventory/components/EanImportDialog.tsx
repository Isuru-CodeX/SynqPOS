import { useEffect, useRef, useState } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { lookupEAN, type BarcodeProduct } from "@/lib/barcodeLookup";
import { applyInventoryMovement } from "@/lib/inventory";
import { supabase } from "@/integrations/supabase/client";
import { useHardware } from "@/hooks/useHardware";
import { toast } from "sonner";
import { ScanBarcode, Globe, Loader2, Plus, Trash2, CheckCircle, AlertCircle, PackagePlus } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Center { id: string; name: string }

interface EanLine {
  barcode: string;
  quantity: number;
  apiProduct: BarcodeProduct | null;
  existingProduct: { id: string; name: string } | null;
  newName: string;
  newSku: string;
  status: "idle" | "loading" | "found" | "new" | "notfound";
}

interface Props {
  tenantId: string;
  branchId: string;
  userId: string;
  centers: Center[];
  defaultCenterId?: string;
  existingProducts: { id: string; name: string; barcode?: string | null }[];
  onClose: () => void;
}

export function EanImportDialog({ tenantId, branchId, userId, centers, defaultCenterId, existingProducts, onClose }: Props) {
  const { t } = useI18n();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lines, setLines] = useState<EanLine[]>([]);
  const [centerId, setCenterId] = useState(defaultCenterId ?? "");
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const scanCleanup = useRef<(() => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { onBarcodeScanned } = useHardware();

  // HID listener always active while dialog open
  useEffect(() => {
    const cleanup = onBarcodeScanned((code) => {
      addBarcode(code);
    });
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScan = () => {
    setScanning(true);
    scanCleanup.current = onBarcodeScanned((code) => {
      setScanning(false);
      scanCleanup.current?.();
      scanCleanup.current = null;
      addBarcode(code);
    });
    const timer = setTimeout(() => {
      setScanning(false);
      scanCleanup.current?.();
      scanCleanup.current = null;
    }, 15_000);
    const prev = scanCleanup.current;
    scanCleanup.current = () => { clearTimeout(timer); prev?.(); };
  };

  const addBarcode = async (code: string) => {
    const barcode = code.trim();
    if (!barcode) return;

    if (lines.some(l => l.barcode === barcode)) {
      toast.info(t("ean.already_in_list", "That barcode is already in the list."));
      setBarcodeInput("");
      return;
    }

    const line: EanLine = {
      barcode, quantity: 1,
      apiProduct: null, existingProduct: null,
      newName: "", newSku: "", status: "loading",
    };
    setLines(prev => [...prev, line]);
    setBarcodeInput("");

    // Search local products
    const local = existingProducts.find(p => p.barcode === barcode);
    if (local) {
      setLines(prev => prev.map(l =>
        l.barcode === barcode ? { ...l, existingProduct: local, status: "found" } : l
      ));
      return;
    }

    // Lookup global API
    try {
      const apiResult = await lookupEAN(barcode);
      if (apiResult) {
        setLines(prev => prev.map(l =>
          l.barcode === barcode
            ? { ...l, apiProduct: apiResult, newName: apiResult.title, newSku: apiResult.brand, status: "new" }
            : l
        ));
      } else {
        setLines(prev => prev.map(l =>
          l.barcode === barcode ? { ...l, status: "notfound" } : l
        ));
      }
    } catch (err: any) {
      setLines(prev => prev.map(l =>
        l.barcode === barcode ? { ...l, status: "notfound" } : l
      ));
      toast.error(err?.message ?? "Error querying barcode API.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addBarcode(barcodeInput); }
  };

  const removeLine = (barcode: string) =>
    setLines(prev => prev.filter(l => l.barcode !== barcode));

  const updateLine = (barcode: string, patch: Partial<EanLine>) =>
    setLines(prev => prev.map(l => l.barcode === barcode ? { ...l, ...patch } : l));

  const canSubmit = centerId && lines.length > 0 &&
    lines.every(l => l.status !== "loading" && l.quantity > 0 &&
      (l.existingProduct || (l.status === "new" && l.newName.trim())));

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      for (const line of lines) {
        let productId = line.existingProduct?.id;

        if (!productId && line.status === "new") {
          const { data, error } = await supabase.from("products").insert({
            tenant_id: tenantId,
            name: line.newName.trim(),
            sku: line.newSku.trim() || null,
            barcode: line.barcode,
            product_type: "simple",
            price: 0, cost: 0, tax_rate: 19, min_stock: 0,
            status: "active",
          }).select("id").single();
          if (error) throw new Error(`Error creating "${line.newName}": ${error.message}`);
          productId = data.id;
        }

        if (!productId) continue;

        await applyInventoryMovement({
          tenantId, branchId, userId, productId,
          inventoryCenterId: centerId,
          type: "purchase",
          quantity: line.quantity,
          reason: "EAN Barcode Load",
          referenceType: "ean_import",
        });
      }

      const created = lines.filter(l => l.status === "new").length;
      const updated = lines.filter(l => l.status === "found").length;
      toast.success(t("ean.inventory_updated", "Inventory updated successfully"), {
        description: `${created} created, ${updated} updated.`,
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col gap-0 p-0">
      <DialogHeader className="px-6 pt-6 pb-4">
        <DialogTitle className="flex items-center gap-2">
          <PackagePlus className="h-5 w-5" /> {t("ean.dialog_title", "Load Inventory by EAN Barcode")}
        </DialogTitle>
      </DialogHeader>

      <div className="px-6 space-y-3 pb-4">
        {/* Inventory Center */}
        <div className="space-y-1.5">
          <Label>{t("inventory.center", "Inventory Center")}</Label>
          <Select value={centerId} onValueChange={setCenterId}>
            <SelectTrigger><SelectValue placeholder={t("inventory.select_center", "Select center...")} /></SelectTrigger>
            <SelectContent>
              {centers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Barcode input */}
        <div className="space-y-1.5">
          <Label>{t("ean.lbl_barcode", "EAN / Barcode")}</Label>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder={t("ean.placeholder", "Type or scan barcode and press Enter…")}
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="font-mono"
              autoFocus
            />
            <Button type="button" variant="outline" size="icon"
              onClick={() => addBarcode(barcodeInput)}
              disabled={!barcodeInput.trim()}
              title="Add barcode"
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Button type="button" variant={scanning ? "default" : "outline"} size="icon"
              onClick={startScan} disabled={scanning}
              title={scanning ? t("common.loading", "Scanning...") : "Activate barcode scanner"}
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanBarcode className="h-4 w-4" />}
            </Button>
          </div>
          {scanning && (
            <p className="text-xs text-muted-foreground animate-pulse">{t("ean.aim_scanner", "Point scanner at product barcode…")}</p>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-2 min-h-0">
        {lines.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            {t("ean.empty_desc", "Add EAN codes to lookup and load products into inventory.")}
          </div>
        )}

        {lines.map(line => (
          <div key={line.barcode} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm text-muted-foreground">{line.barcode}</span>
                  {line.status === "loading" && <Badge variant="outline" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />{t("common.loading", "Searching…")}</Badge>}
                  {line.status === "found" && <Badge className="gap-1 bg-success text-success-foreground"><CheckCircle className="h-3 w-3" />{t("ean.in_catalog", "In Catalog")}</Badge>}
                  {line.status === "new" && <Badge className="gap-1 bg-blue-500 text-white"><Plus className="h-3 w-3" />{t("products.new_product", "New Product")}</Badge>}
                  {line.status === "notfound" && <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />{t("ean.not_found", "Not found")}</Badge>}
                </div>

                {line.status === "found" && (
                  <p className="text-sm font-medium mt-1">{line.existingProduct?.name}</p>
                )}

                {line.status === "new" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">{t("products.col_name", "Product Name")}</Label>
                      <Input
                        value={line.newName}
                        onChange={e => updateLine(line.barcode, { newName: e.target.value })}
                        placeholder="Name…"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("products.col_sku", "Brand / SKU")}</Label>
                      <Input
                        value={line.newSku}
                        onChange={e => updateLine(line.barcode, { newSku: e.target.value })}
                        placeholder="Brand…"
                        className="h-8 text-sm"
                      />
                    </div>
                    {line.apiProduct?.description && (
                      <p className="col-span-2 text-xs text-muted-foreground line-clamp-2">{line.apiProduct.description}</p>
                    )}
                  </div>
                )}

                {line.status === "notfound" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">{t("products.col_name", "Product Name")}</Label>
                      <Input
                        value={line.newName}
                        onChange={e => updateLine(line.barcode, { newName: e.target.value, status: e.target.value ? "new" : "notfound" })}
                        placeholder="Type product name manually…"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t("products.col_sku", "SKU / Brand")}</Label>
                      <Input
                        value={line.newSku}
                        onChange={e => updateLine(line.barcode, { newSku: e.target.value })}
                        placeholder="Optional…"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="space-y-1 text-center">
                  <Label className="text-xs">{t("common.qty", "Quantity")}</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={line.quantity}
                    onChange={e => updateLine(line.barcode, { quantity: Number(e.target.value) })}
                    className="h-8 w-20 text-center text-sm"
                    disabled={line.status === "loading"}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive mt-5"
                  onClick={() => removeLine(line.barcode)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {lines.length > 0 && (
        <>
          <Separator className="mt-4" />
          <div className="px-6 py-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {lines.filter(l => l.status === "new" || l.status === "notfound").length} new ·{" "}
              {lines.filter(l => l.status === "found").length} in catalog
            </p>
            <Button onClick={submit} disabled={!canSubmit || saving} className="min-w-36">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PackagePlus className="h-4 w-4 mr-2" />}
              {t("ean.btn_load", "Load into Inventory")}
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  );
}

                {line.status === "new" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre del producto</Label>
                      <Input
                        value={line.newName}
                        onChange={e => updateLine(line.barcode, { newName: e.target.value })}
                        placeholder="Nombre…"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Marca / SKU</Label>
                      <Input
                        value={line.newSku}
                        onChange={e => updateLine(line.barcode, { newSku: e.target.value })}
                        placeholder="Marca…"
                        className="h-8 text-sm"
                      />
                    </div>
                    {line.apiProduct?.description && (
                      <p className="col-span-2 text-xs text-muted-foreground line-clamp-2">{line.apiProduct.description}</p>
                    )}
                  </div>
                )}

                {line.status === "notfound" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre del producto</Label>
                      <Input
                        value={line.newName}
                        onChange={e => updateLine(line.barcode, { newName: e.target.value, status: e.target.value ? "new" : "notfound" })}
                        placeholder="Escribe el nombre manualmente…"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">SKU / Marca</Label>
                      <Input
                        value={line.newSku}
                        onChange={e => updateLine(line.barcode, { newSku: e.target.value })}
                        placeholder="Opcional…"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="space-y-1 text-center">
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={line.quantity}
                    onChange={e => updateLine(line.barcode, { quantity: Number(e.target.value) })}
                    className="h-8 w-20 text-center text-sm"
                    disabled={line.status === "loading"}
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive mt-5"
                  onClick={() => removeLine(line.barcode)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {lines.length > 0 && (
        <>
          <Separator className="mt-4" />
          <div className="px-6 py-4 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {lines.filter(l => l.status === "new" || l.status === "notfound").length} {t("inventory.ean_new", "new")} ·{" "}
              {lines.filter(l => l.status === "found").length} {t("inventory.ean_existing", "existing")}
            </p>
            <Button onClick={submit} disabled={!canSubmit || saving} className="min-w-36">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PackagePlus className="h-4 w-4 mr-2" />}
              {t("inventory.load_to_stock", "Load into Inventory")}
            </Button>
          </div>
        </>
      )}
    </DialogContent>
  );
}
