import { useCallback, useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { useSyncEngine } from "@/hooks/useSyncEngine";
import type { SyncQueueItem } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { useI18n } from "@/lib/i18n";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function SyncQueuePanel({ open, onOpenChange }: Props) {
  const { processSyncQueue, getQueueItems, discardItem } = useSyncEngine();
  const { t } = useI18n();
  const [items, setItems] = useState<SyncQueueItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [discarding, setDiscarding] = useState<number | null>(null);

  const typeLabels: Record<string, string> = {
    CHECKOUT_SALE: t("sync.type_pos_sale", "POS Sale Checkout"),
    CHECKOUT_TABLE_ORDER: t("sync.type_table_close", "Table Order Checkout"),
    SEND_TO_KITCHEN: t("sync.type_send_kitchen", "Send to Kitchen"),
    MARK_ORDER_READY: t("sync.type_order_ready", "Mark Order Ready"),
    SEND_TO_CASHIER: t("sync.type_send_cashier", "Send to Cashier"),
    APPLY_INVENTORY_MOVEMENT: t("sync.type_inv_movement", "Inventory Movement"),
    ADD_TABLE_ORDER_ITEMS: t("sync.type_table_items", "Table Order Items"),
    UPSERT_TABLE_ORDER_ITEMS: t("sync.type_table_ticket", "Table Order Ticket"),
  };

  const refresh = useCallback(async () => {
    const rows = await getQueueItems();
    setItems(rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [getQueueItems]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleSync = async () => {
    setSyncing(true);
    await processSyncQueue();
    await refresh();
    setSyncing(false);
  };

  const handleDiscard = async (id: number) => {
    setDiscarding(id);
    await discardItem(id);
    await refresh();
    setDiscarding(null);
  };

  const pending = items.filter(i => i.status === "pending").length;
  const failed = items.filter(i => i.status === "failed").length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            {t("sync.title", "Synchronization Queue")}
            {pending > 0 && (
              <Badge className="bg-amber-500 text-white">{pending} {t("status.pending", "Pending").toLowerCase()}</Badge>
            )}
            {failed > 0 && (
              <Badge variant="destructive">{failed} {t("status.failed", "Failed").toLowerCase()}</Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {t("sync.desc", "Transactions saved locally waiting for connection.")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center gap-2 px-6 py-3 border-b">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSync}
            disabled={syncing || items.length === 0}
            className="gap-1.5"
          >
            {syncing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />}
            {t("sync.sync_now", "Sync Now")}
          </Button>
          <Button size="sm" variant="ghost" onClick={refresh} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            {t("sync.refresh_list", "Refresh List")}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <div>
                <p className="font-medium text-foreground">{t("sync.empty", "Queue is empty")}</p>
                <p className="text-sm">{t("sync.empty_desc", "All transactions are fully synchronized.")}</p>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="mt-0.5 shrink-0">
                  {item.status === "failed" ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {typeLabels[item.type] ?? item.type}
                    </span>
                    <Badge
                      variant={item.status === "failed" ? "destructive" : "secondary"}
                      className="text-[10px] h-4"
                    >
                      {item.status === "failed" ? `${t("status.failed", "Failed")} · ${item.retryCount} ${t("sync.retries", "attempts")}` : t("status.pending", "Pending")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    {item.deviceId && ` · ${t("sync.device", "Device")}: ${item.deviceId.slice(0, 8)}…`}
                  </p>
                  {item.error && (
                    <p className="text-xs text-destructive mt-1 font-mono break-all">
                      {item.error}
                    </p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  title={t("action.discard", "Discard")}
                  disabled={discarding === item.id}
                  onClick={() => item.id !== undefined && handleDiscard(item.id)}
                >
                  {discarding === item.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />}
                </Button>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
