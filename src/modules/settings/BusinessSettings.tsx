import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useDevMode } from "@/hooks/useDevMode";
import { useBusinessStore, type BusinessProfile } from "@/stores/business";
import { usePreferencesStore, SUPPORTED_CURRENCIES } from "@/stores/preferences";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Building2,
  Save,
  RotateCcw,
  FlaskConical,
  Mail,
  Phone,
  MapPin,
  Globe,
  Coins,
  Percent,
  Sparkles,
  Briefcase,
  FileText,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import { SynqLogo } from "@/components/shared/SynqLogo";

const INDUSTRY_OPTIONS = [
  "Restaurant & Bar",
  "Cafe & Bakery",
  "Retail & Boutique",
  "Fast Food & Takeaway",
  "Ice Cream & Gelato",
  "Pub & Lounge",
  "Supermarket & Grocery",
  "Hospitality & Services",
  "Other Enterprise",
];

export default function BusinessSettings() {
  const { tenantId } = useTenantContext();
  const { t } = useI18n();
  const qc = useQueryClient();
  const { devMode, setDevMode, isPending: devModePending } = useDevMode();
  const { profile, setProfile, resetToDefaults } = useBusinessStore();
  const { currency, setCurrency } = usePreferencesStore();

  const [form, setForm] = useState<BusinessProfile>({
    ...profile,
    currency: profile.currency || currency || "USD",
  });
  const [saving, setSaving] = useState(false);

  // Sync state if store updates externally
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...profile,
      currency: profile.currency || currency || "USD",
    }));
  }, [profile, currency]);

  // Optionally load remote tenant if present
  useEffect(() => {
    if (!tenantId || tenantId === "demo-tenant-synqpos") return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("tenants")
          .select("name, currency, tax_rate, allow_negative_stock, dev_mode")
          .eq("id", tenantId)
          .maybeSingle();

        if (data && !error) {
          setForm((prev) => ({
            ...prev,
            name: data.name || prev.name,
            currency: data.currency || prev.currency,
            taxRate: data.tax_rate != null ? Number(data.tax_rate) : prev.taxRate,
            allowNegativeStock: data.allow_negative_stock ?? prev.allowNegativeStock,
            devMode: data.dev_mode ?? prev.devMode,
          }));
        }
      } catch (err) {
        console.warn("[BusinessSettings] Could not fetch remote tenant details:", err);
      }
    })();
  }, [tenantId]);

  const handleChange = (field: keyof BusinessProfile, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) {
      return toast.error(t("business.name_required", "Business name is required"));
    }

    setSaving(true);
    try {
      // 1. Update persistent local store
      setProfile(form);

      // 2. Sync currency preference if changed
      if (form.currency && form.currency !== currency) {
        setCurrency(form.currency);
      }

      // 3. Attempt Supabase sync if connected
      if (tenantId) {
        try {
          await supabase
            .from("tenants")
            .update({
              name: form.name.trim(),
              currency: form.currency,
              tax_rate: Number(form.taxRate) || 0,
              allow_negative_stock: Boolean(form.allowNegativeStock),
              dev_mode: Boolean(form.devMode),
            })
            .eq("id", tenantId);
        } catch (supabaseErr) {
          console.warn("[BusinessSettings] Supabase sync skipped or failed (offline safe):", supabaseErr);
        }
      }

      // Invalidate caches
      await qc.invalidateQueries({ queryKey: ["tenant"] });
      await qc.invalidateQueries({ queryKey: ["my-roles"] });

      toast.success(t("business.save_success", "Business profile updated successfully!"));
    } catch (err: any) {
      toast.error(err.message ?? t("business.save_error", "Failed to update business profile"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetToDefaults();
    toast.info(t("business.reset_info", "Reset business profile to default values"));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl pb-12">
      {/* ── Top Header Card ────────────────────────────────────── */}
      <div className="glass p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-border/50 shadow-md">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 p-[1.5px] shrink-0 shadow-lg shadow-purple-500/20">
            <div className="h-full w-full bg-background rounded-[15px] flex items-center justify-center">
              <SynqLogo size={36} variant="icon" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {form.name || "SynqPOS Business"}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BadgeCheck size={12} /> {t("business.verified", "Active Account")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {form.legalName} · {form.industry}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="g-btn g-btn-ghost text-xs px-3"
            title={t("business.reset_title", "Reset to default demo values")}
          >
            <RotateCcw size={14} className="mr-1" />
            {t("action.reset", "Reset")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="g-btn g-btn-primary flex-1 md:flex-initial"
          >
            <Save size={15} className="mr-1.5" />
            {saving ? t("common.saving", "Saving...") : t("action.save_changes", "Save Changes")}
          </button>
        </div>
      </div>

      {/* ── Section 1: Business Identity ────────────────────────── */}
      <div className="glass p-6 rounded-2xl space-y-4 border border-border/40">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <Building2 className="h-5 w-5 text-cyan-400" />
          <h2 className="font-bold text-base text-foreground">
            {t("business.identity_title", "Business Identity & Registration")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.trading_name", "Trading Name / Display Name")} <span className="text-destructive">*</span>
            </Label>
            <Input
              required
              placeholder="e.g. SynqPOS Coffee & Bar"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.legal_name", "Legal / Registered Corporate Name")}
            </Label>
            <Input
              placeholder="e.g. SynqPOS Global Technologies Inc."
              value={form.legalName}
              onChange={(e) => handleChange("legalName", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.tax_id", "Tax Identification Number (EIN / VAT / NIT)")}
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 font-mono text-sm"
                placeholder="e.g. US-987654321-K"
                value={form.taxId}
                onChange={(e) => handleChange("taxId", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.industry", "Industry / Business Category")}
            </Label>
            <Select
              value={form.industry}
              onValueChange={(val) => handleChange("industry", val)}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Select business category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-semibold">
              {t("business.tagline", "Business Description / Slogan")}
            </Label>
            <Textarea
              rows={2}
              placeholder="Brief description of your business shown on receipts and customer portals..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Contact & Location ───────────────────────── */}
      <div className="glass p-6 rounded-2xl space-y-4 border border-border/40">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <MapPin className="h-5 w-5 text-purple-400" />
          <h2 className="font-bold text-base text-foreground">
            {t("business.contact_title", "Contact & Headquarters Address")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.email", "Primary Contact Email")}
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                className="pl-9"
                placeholder="contact@business.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.phone", "Phone Number")}
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                className="pl-9"
                placeholder="+1 (555) 234-5678"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.website", "Website URL")}
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="url"
                className="pl-9"
                placeholder="https://synqpos.io"
                value={form.website}
                onChange={(e) => handleChange("website", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs font-semibold">
              {t("business.street", "Street Address")}
            </Label>
            <Input
              placeholder="742 Evergreen Terrace, Suite 100"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("business.city", "City")}</Label>
            <Input
              placeholder="New York"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("business.state", "State / Province")}</Label>
            <Input
              placeholder="NY"
              value={form.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("business.zip", "Zip / Postal Code")}</Label>
            <Input
              placeholder="10001"
              value={form.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("business.country", "Country")}</Label>
            <Input
              placeholder="United States"
              value={form.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Financial & Tax Policy ───────────────────── */}
      <div className="glass p-6 rounded-2xl space-y-4 border border-border/40">
        <div className="flex items-center gap-2 pb-2 border-b border-border/30">
          <Coins className="h-5 w-5 text-emerald-400" />
          <h2 className="font-bold text-base text-foreground">
            {t("business.financial_title", "Financial & Tax Policy")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.operating_currency", "Operating Currency")}
            </Label>
            <Select
              value={form.currency}
              onValueChange={(val) => handleChange("currency", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <SelectItem key={curr.code} value={curr.code}>
                    <span className="font-semibold text-primary mr-1.5">
                      {curr.symbol}
                    </span>
                    {curr.code} — {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {t("business.currency_hint", "Updates pricing display across register, orders and tickets.")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.tax_rate", "Default Sales Tax / VAT (%)")}
            </Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                max={100}
                step={0.01}
                className="pl-9"
                value={form.taxRate}
                onChange={(e) => handleChange("taxRate", Number(e.target.value))}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("business.tax_hint", "Default tax applied automatically to new sales items.")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.tax_label", "Tax Receipt Label")}
            </Label>
            <Input
              placeholder="e.g. Sales Tax, VAT, GST"
              value={form.taxName}
              onChange={(e) => handleChange("taxName", e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              {t("business.tax_label_hint", "Printed on customer receipts and digital invoices.")}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-border/20 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t("business.loyalty_rate", "Loyalty Reward Points (per 1,000 spent)")}
            </Label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
              <Input
                type="number"
                min={0}
                max={500}
                className="pl-9"
                value={form.pointsPerThousand}
                onChange={(e) => handleChange("pointsPerThousand", Number(e.target.value))}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              {t("business.loyalty_hint", "Customers earn reward points redeemable for discounts.")}
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/40 bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold cursor-pointer">
                {t("business.allow_negative", "Allow Negative Inventory Sales")}
              </Label>
              <p className="text-[11px] text-muted-foreground">
                {t("business.allow_negative_desc", "Permit sales even when item stock counts drop below zero.")}
              </p>
            </div>
            <Switch
              checked={form.allowNegativeStock}
              onCheckedChange={(val) => handleChange("allowNegativeStock", val)}
            />
          </div>
        </div>
      </div>

      {/* ── Section 4: Operational Mode ─────────────────────────── */}
      <div className="glass p-6 rounded-2xl space-y-4 border border-orange-500/30 bg-orange-500/[0.02]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
              <FlaskConical className="h-5 w-5 text-orange-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">
                  {t("business.dev_mode_title", "Developer & Demo Sandbox Mode")}
                </h3>
                {devMode && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
                    {t("common.active", "ACTIVE")}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground max-w-xl">
                {t(
                  "business.dev_mode_desc",
                  "Bypasses physical inventory stock depletion and open cash drawer requirements for orders. Highly recommended for demonstration, training, and fast workflow testing."
                )}
              </p>
            </div>
          </div>

          <Switch
            checked={devMode}
            disabled={devModePending}
            onCheckedChange={(checked) => {
              setDevMode(checked);
              handleChange("devMode", checked);
              toast[checked ? "warning" : "success"](
                checked
                  ? t("business.dev_mode_on", "Developer mode ACTIVATED")
                  : t("business.dev_mode_off", "Developer mode deactivated")
              );
            }}
          />
        </div>
      </div>

      {/* ── Save Bottom Bar ────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="g-btn g-btn-ghost"
        >
          {t("action.cancel", "Cancel")}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="g-btn g-btn-primary min-w-[160px]"
        >
          <Save size={16} className="mr-2" />
          {saving ? t("common.saving", "Saving...") : t("action.save_changes", "Save Changes")}
        </button>
      </div>
    </form>
  );
}
