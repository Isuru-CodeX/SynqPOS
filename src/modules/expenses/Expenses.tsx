import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useI18n } from "@/lib/i18n";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, Plus, Pencil, Trash2, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";

type Category = { id: string; name: string };
type Expense = {
  id: string;
  amount: number;
  payment_method: string;
  description: string | null;
  expense_date: string;
  category_id: string | null;
  expense_categories?: { name: string } | null;
};

type ExpenseForm = {
  category_id: string;
  amount: string;
  payment_method: string;
  description: string;
  expense_date: string;
};

const emptyExpense: ExpenseForm = {
  category_id: "",
  amount: "",
  payment_method: "cash",
  description: "",
  expense_date: new Date().toISOString().slice(0, 10),
};

export default function Expenses() {
  const { tenantId, branchId } = useTenantContext();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [tab, setTab] = useState("expenses");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(emptyExpense);
  const [catName, setCatName] = useState("");

  const payMethods = [
    { id: "cash",     label: t("pos.pay_cash", "Cash") },
    { id: "card",     label: t("pos.pay_card", "Card") },
    { id: "transfer", label: t("pos.pay_transfer", "Transfer") },
  ];

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["expense-categories", tenantId],
    enabled: !!tenantId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("expense_categories")
        .select("id, name")
        .eq("tenant_id", tenantId!)
        .order("name");
      return (data ?? []) as Category[];
    },
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: ["expenses", branchId],
    enabled: !!branchId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("expenses")
        .select("*, expense_categories(name)")
        .eq("branch_id", branchId!)
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);
      return (data ?? []) as Expense[];
    },
  });

  const totalMonth = expenses
    .filter((e) => e.expense_date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((s, e) => s + Number(e.amount), 0);

  const saveExpense = useMutation({
    mutationFn: async (f: ExpenseForm) => {
      const payload = {
        tenant_id: tenantId!,
        branch_id: branchId!,
        category_id: f.category_id || null,
        amount: parseFloat(f.amount),
        payment_method: f.payment_method,
        description: f.description.trim() || null,
        expense_date: f.expense_date,
      };
      if (editingExpense) {
        const { error } = await (supabase as any).from("expenses").update(payload).eq("id", editingExpense.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any).from("expenses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingExpense ? t("expenses.updated", "Expense updated") : t("expenses.created_toast", "Expense recorded successfully"));
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setExpenseOpen(false);
      setEditingExpense(null);
      setExpenseForm(emptyExpense);
    },
    onError: (e: any) => toast.error(e.message ?? "Error"),
  });

  const removeExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("expenses.deleted", "Expense deleted"));
      qc.invalidateQueries({ queryKey: ["expenses"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Error"),
  });

  const saveCat = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("expense_categories")
        .insert({ tenant_id: tenantId!, name: catName.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(t("categories.created", "Category created"));
      qc.invalidateQueries({ queryKey: ["expense-categories"] });
      setCatOpen(false);
      setCatName("");
    },
    onError: (e: any) => toast.error(e.message ?? "Error"),
  });

  const openCreate = () => {
    setEditingExpense(null);
    setExpenseForm(emptyExpense);
    setExpenseOpen(true);
  };

  const openEdit = (e: Expense) => {
    setEditingExpense(e);
    setExpenseForm({
      category_id: e.category_id ?? "",
      amount: String(e.amount),
      payment_method: e.payment_method,
      description: e.description ?? "",
      expense_date: e.expense_date,
    });
    setExpenseOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="g-page-hd">
          <div className="g-page-hd-eyebrow">{t("expenses.eyebrow", "BUSINESS · EXPENSES")}</div>
          <div className="h-display g-page-title">{t("expenses.title", "Expenses")}</div>
          <div className="g-page-hd-meta">{t("dashboard.this_month", "This Month")}: {formatCurrency(totalMonth)}</div>
        </div>
        <button type="button" className="g-btn g-btn-primary" onClick={openCreate}>
          <Plus size={16} className="mr-1" />{t("expenses.new_expense", "New Expense")}
        </button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="expenses">{t("expenses.title", "Expenses")}</TabsTrigger>
          <TabsTrigger value="categories">{t("categories.title", "Categories")}</TabsTrigger>
        </TabsList>

        {/* ── Expenses tab ── */}
        <TabsContent value="expenses" className="mt-4">
          {expenses.length === 0 ? (
            <EmptyState
              icon={TrendingDown}
              title={t("expenses.empty_title", "No expenses recorded")}
              description={t("expenses.empty_desc", "Record petty cash outflows and operational expenses to keep accurate records.")}
            />
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="g-exp-head">
                <span>{t("expenses.col_date", "Date")}</span>
                <span>{t("expenses.col_description", "Description")}</span>
                <span>{t("expenses.col_category", "Category")}</span>
                <span>{t("expenses.col_payment", "Payment Method")}</span>
                <span className="text-right">{t("expenses.col_amount", "Amount")}</span>
                <span />
              </div>
              {expenses.map((e) => (
                <div key={e.id} className="g-exp-row">
                  <span className="g-exp-date">{e.expense_date}</span>
                  <span className="g-exp-desc">{e.description ?? "—"}</span>
                  <span>
                    {e.expense_categories?.name ? (
                      <span className="g-pill g-pill-ghost">
                        <Tag size={11} />
                        {e.expense_categories.name}
                      </span>
                    ) : (
                      <span className="h-meta">{t("common.uncategorized", "Uncategorized")}</span>
                    )}
                  </span>
                  <span className="g-exp-pay">
                    {payMethods.find((m) => m.id === e.payment_method)?.label ?? e.payment_method}
                  </span>
                  <span className="g-exp-amt">{formatCurrency(Number(e.amount))}</span>
                  <span className="g-exp-actions">
                    <button
                      type="button"
                      title={t("common.edit", "Edit")}
                      className="g-exp-icon-btn"
                      onClick={() => openEdit(e)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      title={t("common.delete", "Delete")}
                      className="g-exp-icon-btn g-exp-icon-btn-del"
                      onClick={() => { if (confirm(t("common.confirm", "Confirm") + "?")) removeExpense.mutate(e.id); }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Categories tab ── */}
        <TabsContent value="categories" className="mt-4">
          <div className="flex gap-2 mb-4">
            <button type="button" className="g-btn g-btn-ghost" onClick={() => setCatOpen(true)}>
              <Plus size={16} className="mr-1" />{t("categories.new", "New Category")}
            </button>
          </div>
          {categories.length === 0 ? (
            <EmptyState
              icon={Tag}
              title={t("categories.empty_title", "No categories")}
              description={t("categories.empty_desc", "Create categories such as Rent, Payroll, Utilities, etc.")}
            />
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="g-cat-head">
                <span>{t("categories.name", "Name")}</span>
              </div>
              {categories.map((c) => (
                <div key={c.id} className="g-cat-row">
                  <span className="g-cat-name">{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Expense dialog */}
      <Dialog
        open={expenseOpen}
        onOpenChange={(v) => {
          setExpenseOpen(v);
          if (!v) { setEditingExpense(null); setExpenseForm(emptyExpense); }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? t("expenses.edit_title", "Edit Expense") : t("expenses.dialog_title", "Record Expense")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("expenses.lbl_amount", "Amount *")}</Label>
                <Input
                  type="number"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("expenses.col_date", "Date *")}</Label>
                <Input
                  type="date"
                  value={expenseForm.expense_date}
                  onChange={(e) => setExpenseForm((f) => ({ ...f, expense_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("expenses.lbl_category", "Category")}</Label>
              <Select
                value={expenseForm.category_id}
                onValueChange={(v) => setExpenseForm((f) => ({ ...f, category_id: v }))}
              >
                <SelectTrigger><SelectValue placeholder={t("expenses.category_all", "Select Category")} /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("expenses.lbl_payment", "Payment Method")}</Label>
              <Select
                value={expenseForm.payment_method}
                onValueChange={(v) => setExpenseForm((f) => ({ ...f, payment_method: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {payMethods.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("expenses.lbl_description", "Description")}</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Store rent, internet bill..."
              />
            </div>
            <button
              type="button"
              className="g-btn g-btn-primary g-btn-touch w-full"
              disabled={!expenseForm.amount || saveExpense.isPending}
              onClick={() => saveExpense.mutate(expenseForm)}
            >
              {saveExpense.isPending ? t("suppliers.btn_saving", "Saving...") : editingExpense ? t("common.save", "Save Changes") : t("expenses.btn_record", "Save Expense")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t("categories.new", "New Category")}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>{t("categories.name", "Name *")}</Label>
              <Input
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Rent, Utilities, Supplies..."
              />
            </div>
            <button
              type="button"
              className="g-btn g-btn-primary g-btn-touch w-full"
              disabled={!catName.trim() || saveCat.isPending}
              onClick={() => saveCat.mutate()}
            >
              {saveCat.isPending ? t("suppliers.btn_saving", "Saving...") : t("categories.create", "Create Category")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
