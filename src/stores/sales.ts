import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MockSale {
  id: string;
  ticket_number: string;
  total: number;
  subtotal: number;
  tax: number;
  status: "completed" | "cancelled";
  channel: "pos" | "web" | "delivery" | "qr";
  created_at: string;
  payments: {
    method: "cash" | "card" | "transfer" | "other";
    amount: number;
  }[];
  items_count: number;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  action: string;
  recordsCount: number;
  status: "success" | "pending" | "failed";
  durationMs: number;
  endpoint: string;
}

const NOW = Date.now();
const minutesAgo = (min: number) => new Date(NOW - min * 60000).toISOString();

export const INITIAL_SALES: MockSale[] = [
  {
    id: "sale-1084",
    ticket_number: "TK-1084",
    total: 34.50,
    subtotal: 31.94,
    tax: 2.56,
    status: "completed",
    channel: "pos",
    created_at: minutesAgo(4),
    payments: [{ method: "card", amount: 34.50 }],
    items_count: 4,
  },
  {
    id: "sale-1083",
    ticket_number: "TK-1083",
    total: 21.75,
    subtotal: 20.14,
    tax: 1.61,
    status: "completed",
    channel: "pos",
    created_at: minutesAgo(12),
    payments: [{ method: "cash", amount: 21.75 }],
    items_count: 3,
  },
  {
    id: "sale-1082",
    ticket_number: "TK-1082",
    total: 58.00,
    subtotal: 53.70,
    tax: 4.30,
    status: "completed",
    channel: "web",
    created_at: minutesAgo(25),
    payments: [{ method: "card", amount: 58.00 }],
    items_count: 5,
  },
  {
    id: "sale-1081",
    ticket_number: "TK-1081",
    total: 16.50,
    subtotal: 15.28,
    tax: 1.22,
    status: "completed",
    channel: "delivery",
    created_at: minutesAgo(38),
    payments: [{ method: "card", amount: 16.50 }],
    items_count: 2,
  },
  {
    id: "sale-1080",
    ticket_number: "TK-1080",
    total: 42.25,
    subtotal: 39.12,
    tax: 3.13,
    status: "completed",
    channel: "pos",
    created_at: minutesAgo(52),
    payments: [{ method: "cash", amount: 42.25 }],
    items_count: 4,
  },
  {
    id: "sale-1079",
    ticket_number: "TK-1079",
    total: 76.50,
    subtotal: 70.83,
    tax: 5.67,
    status: "completed",
    channel: "qr",
    created_at: minutesAgo(75),
    payments: [{ method: "transfer", amount: 76.50 }],
    items_count: 6,
  },
  {
    id: "sale-1078",
    ticket_number: "TK-1078",
    total: 28.00,
    subtotal: 25.93,
    tax: 2.07,
    status: "completed",
    channel: "pos",
    created_at: minutesAgo(98),
    payments: [{ method: "card", amount: 28.00 }],
    items_count: 3,
  },
];

export const INITIAL_SYNC_LOGS: SyncLogEntry[] = [
  {
    id: "sync-log-1",
    timestamp: minutesAgo(1),
    action: "Omnichannel Transaction Batch Synced",
    recordsCount: 7,
    status: "success",
    durationMs: 240,
    endpoint: "https://synqpos.supabase.co/rest/v1/sales",
  },
  {
    id: "sync-log-2",
    timestamp: minutesAgo(6),
    action: "Catalog & Product Stock Incremental Push",
    recordsCount: 20,
    status: "success",
    durationMs: 310,
    endpoint: "https://synqpos.supabase.co/rest/v1/inventory_stocks",
  },
  {
    id: "sync-log-3",
    timestamp: minutesAgo(15),
    action: "Table Orders & Waiter Dispatch Realtime Heartbeat",
    recordsCount: 5,
    status: "success",
    durationMs: 180,
    endpoint: "https://synqpos.supabase.co/rest/v1/table_orders",
  },
  {
    id: "sync-log-4",
    timestamp: minutesAgo(30),
    action: "Cash Register Session Checkpoint",
    recordsCount: 1,
    status: "success",
    durationMs: 145,
    endpoint: "https://synqpos.supabase.co/rest/v1/cash_sessions",
  },
  {
    id: "sync-log-5",
    timestamp: minutesAgo(60),
    action: "Full Offline Rehydration Snapshot",
    recordsCount: 84,
    status: "success",
    durationMs: 620,
    endpoint: "https://synqpos.supabase.co/rest/v1/rpc/sync_full",
  },
];

interface SalesState {
  sales: MockSale[];
  syncLogs: SyncLogEntry[];
  addSale: (sale: Omit<MockSale, "id" | "created_at">) => MockSale;
  addSyncLog: (log: Omit<SyncLogEntry, "id" | "timestamp">) => void;
  resetSales: () => void;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set, get) => ({
      sales: INITIAL_SALES,
      syncLogs: INITIAL_SYNC_LOGS,

      addSale: (s) => {
        const id = `sale-${Date.now()}`;
        const newSale: MockSale = {
          ...s,
          id,
          created_at: new Date().toISOString(),
        };
        set({ sales: [newSale, ...get().sales] });
        return newSale;
      },

      addSyncLog: (log) => {
        const id = `sync-log-${Date.now()}`;
        const entry: SyncLogEntry = {
          ...log,
          id,
          timestamp: new Date().toISOString(),
        };
        set({ syncLogs: [entry, ...get().syncLogs] });
      },

      resetSales: () => set({ sales: INITIAL_SALES, syncLogs: INITIAL_SYNC_LOGS }),
    }),
    {
      name: "synqpos-sales-store",
    }
  )
);
