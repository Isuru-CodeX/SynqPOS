import { t } from "@/lib/i18n";

// Estados del ciclo de un item de pedido en mesa
export type TableItemStatus = "pending" | "preparing" | "ready" | "dispatched" | "cancelled";

export const ITEM_STATUS_META: Record<
  TableItemStatus,
  { label: string; short: string; tone: string; dot: string }
> = {
  get pending() {
    return {
      label: t("tables.status_pending", "Pending"),
      short: t("tables.short_pending", "Pend."),
      tone: "bg-muted text-muted-foreground",
      dot: "bg-muted-foreground",
    };
  },
  get preparing() {
    return {
      label: t("tables.status_preparing", "In Preparation"),
      short: t("tables.short_prep", "Prep."),
      tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
      dot: "bg-amber-500",
    };
  },
  get ready() {
    return {
      label: t("tables.status_ready", "Ready to Serve"),
      short: t("tables.short_ready", "Ready"),
      tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
      dot: "bg-sky-500",
    };
  },
  get dispatched() {
    return {
      label: t("tables.status_served", "Served"),
      short: t("tables.short_served", "Served"),
      tone: "bg-success/15 text-success",
      dot: "bg-success",
    };
  },
  get cancelled() {
    return {
      label: t("tables.status_cancelled", "Cancelled"),
      short: t("tables.short_cancelled", "Canc."),
      tone: "bg-destructive/10 text-destructive",
      dot: "bg-destructive",
    };
  },
};

export type DerivedOrderState =
  | "empty"
  | "open"
  | "preparing"
  | "ready"
  | "served"
  | "in_cashier"
  | "closed";

export function deriveOrderState(
  orderStatus: string | null | undefined,
  items: Array<{ status: string }>,
): DerivedOrderState {
  if (orderStatus === "closed") return "closed";
  if (orderStatus === "sent_to_cashier") return "in_cashier";
  const active = items.filter((i) => i.status !== "cancelled");
  if (active.length === 0) return "empty";
  const hasPreparing = active.some((i) => i.status === "preparing");
  if (hasPreparing) return "preparing";
  const allDispatched = active.every((i) => i.status === "dispatched");
  if (allDispatched) return "served";
  const hasReady = active.some((i) => i.status === "ready");
  if (hasReady) return "ready";
  return "open";
}

export const ORDER_STATE_META: Record<
  DerivedOrderState,
  { label: string; tone: string }
> = {
  get empty() {
    return { label: t("tables.status_open", "Open"), tone: "bg-primary text-primary-foreground" };
  },
  get open() {
    return { label: t("tables.status_open", "Open"), tone: "bg-primary text-primary-foreground" };
  },
  get preparing() {
    return { label: t("tables.status_preparing", "In Preparation"), tone: "bg-amber-500 text-white" };
  },
  get ready() {
    return { label: t("tables.status_ready", "Ready to Serve"), tone: "bg-sky-500 text-white" };
  },
  get served() {
    return { label: t("tables.status_served", "Served"), tone: "bg-success text-success-foreground" };
  },
  get in_cashier() {
    return { label: t("tables.status_cashier", "In Cashier"), tone: "bg-warning text-warning-foreground" };
  },
  get closed() {
    return { label: t("tables.status_closed", "Closed"), tone: "bg-muted text-muted-foreground" };
  },
};

export function countByStatus(items: Array<{ status: string }>) {
  return {
    pending:    items.filter((i) => i.status === "pending").length,
    preparing:  items.filter((i) => i.status === "preparing").length,
    ready:      items.filter((i) => i.status === "ready").length,
    dispatched: items.filter((i) => i.status === "dispatched").length,
    cancelled:  items.filter((i) => i.status === "cancelled").length,
  };
}
