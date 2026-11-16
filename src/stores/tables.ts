import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Table } from "@/types/table";

export interface MockTableOrder {
  id: string;
  table_id: string;
  branch_id: string;
  tenant_id: string;
  waiter_id: string | null;
  status: "open" | "sent_to_cashier" | "closed";
  total: number;
  created_at: string;
  table_order_items: {
    id: string;
    product_name?: string;
    quantity?: number;
    price?: number;
    status: "pending" | "preparing" | "ready" | "dispatched" | "delivered";
  }[];
}

export const INITIAL_TABLES: Table[] = [
  { id: "tbl-1", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 1", capacity: 2, status: "occupied", sort_order: 1, pos_x: 10, pos_y: 10, width: 90, height: 90, shape: "square", zone: "Main Hall" },
  { id: "tbl-2", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 2", capacity: 4, status: "available", sort_order: 2, pos_x: 120, pos_y: 10, width: 100, height: 100, shape: "square", zone: "Main Hall" },
  { id: "tbl-3", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 3", capacity: 4, status: "occupied", sort_order: 3, pos_x: 240, pos_y: 10, width: 100, height: 100, shape: "square", zone: "Main Hall" },
  { id: "tbl-4", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 4", capacity: 4, status: "available", sort_order: 4, pos_x: 10, pos_y: 130, width: 100, height: 100, shape: "round", zone: "Terrace" },
  { id: "tbl-5", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 5", capacity: 6, status: "bill_requested", sort_order: 5, pos_x: 130, pos_y: 130, width: 120, height: 100, shape: "rectangle", zone: "Terrace" },
  { id: "tbl-6", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 6", capacity: 6, status: "available", sort_order: 6, pos_x: 270, pos_y: 130, width: 120, height: 100, shape: "rectangle", zone: "Terrace" },
  { id: "tbl-7", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 7 (Bar)", capacity: 2, status: "occupied", sort_order: 7, pos_x: 10, pos_y: 250, width: 80, height: 80, shape: "round", zone: "Bar & Lounge" },
  { id: "tbl-8", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 8 (Bar)", capacity: 2, status: "available", sort_order: 8, pos_x: 110, pos_y: 250, width: 80, height: 80, shape: "round", zone: "Bar & Lounge" },
  { id: "tbl-9", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 9 (Bar)", capacity: 4, status: "available", sort_order: 9, pos_x: 210, pos_y: 250, width: 90, height: 90, shape: "square", zone: "Bar & Lounge" },
  { id: "tbl-10", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 10 (VIP)", capacity: 8, status: "occupied", sort_order: 10, pos_x: 10, pos_y: 360, width: 140, height: 100, shape: "rectangle", zone: "VIP Dining" },
  { id: "tbl-11", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 11 (VIP)", capacity: 8, status: "available", sort_order: 11, pos_x: 170, pos_y: 360, width: 140, height: 100, shape: "rectangle", zone: "VIP Dining" },
  { id: "tbl-12", tenant_id: "demo-tenant-synqpos", branch_id: "demo-branch-main", name: "Table 12 (VIP)", capacity: 10, status: "available", sort_order: 12, pos_x: 330, pos_y: 360, width: 160, height: 100, shape: "rectangle", zone: "VIP Dining" },
];

export const INITIAL_TABLE_ORDERS: MockTableOrder[] = [
  {
    id: "order-tbl-1",
    table_id: "tbl-1",
    branch_id: "demo-branch-main",
    tenant_id: "demo-tenant-synqpos",
    waiter_id: "demo-waiter-1",
    status: "open",
    total: 28.50,
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    table_order_items: [
      { id: "toi-101", product_name: "Espresso Doppio", quantity: 2, price: 3.50, status: "dispatched" },
      { id: "toi-102", product_name: "Butter Croissant", quantity: 2, price: 3.75, status: "dispatched" },
      { id: "toi-103", product_name: "Artisan Sourdough Loaf", quantity: 1, price: 7.50, status: "dispatched" },
      { id: "toi-104", product_name: "Caffe Latte", quantity: 1, price: 4.75, status: "dispatched" },
    ],
  },
  {
    id: "order-tbl-3",
    table_id: "tbl-3",
    branch_id: "demo-branch-main",
    tenant_id: "demo-tenant-synqpos",
    waiter_id: "demo-waiter-1",
    status: "open",
    total: 46.00,
    created_at: new Date(Date.now() - 18 * 60000).toISOString(),
    table_order_items: [
      { id: "toi-301", product_name: "Grilled Chicken Pesto Panini", quantity: 2, price: 11.50, status: "preparing" },
      { id: "toi-302", product_name: "Caffe Latte", quantity: 2, price: 4.75, status: "ready" },
      { id: "toi-303", product_name: "Dark Chocolate Ganache Cake", quantity: 2, price: 6.50, status: "pending" },
    ],
  },
  {
    id: "order-tbl-5",
    table_id: "tbl-5",
    branch_id: "demo-branch-main",
    tenant_id: "demo-tenant-synqpos",
    waiter_id: "demo-waiter-1",
    status: "sent_to_cashier",
    total: 68.75,
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
    table_order_items: [
      { id: "toi-501", product_name: "Truffle Prosciutto Baguette", quantity: 2, price: 14.00, status: "dispatched" },
      { id: "toi-502", product_name: "Berry Acai Smoothie", quantity: 2, price: 6.75, status: "dispatched" },
      { id: "toi-503", product_name: "New York Cheesecake", quantity: 2, price: 6.00, status: "dispatched" },
      { id: "toi-504", product_name: "French Macaron Box", quantity: 1, price: 8.50, status: "dispatched" },
    ],
  },
  {
    id: "order-tbl-7",
    table_id: "tbl-7",
    branch_id: "demo-branch-main",
    tenant_id: "demo-tenant-synqpos",
    waiter_id: "demo-waiter-1",
    status: "open",
    total: 18.50,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    table_order_items: [
      { id: "toi-701", product_name: "Cold-Pressed Green Juice", quantity: 1, price: 6.50, status: "ready" },
      { id: "toi-702", product_name: "Chocolate Almond Danish", quantity: 1, price: 4.50, status: "ready" },
      { id: "toi-703", product_name: "Sparkling Lemon Mint Soda", quantity: 1, price: 4.00, status: "ready" },
    ],
  },
  {
    id: "order-tbl-10",
    table_id: "tbl-10",
    branch_id: "demo-branch-main",
    tenant_id: "demo-tenant-synqpos",
    waiter_id: "demo-waiter-1",
    status: "open",
    total: 142.00,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    table_order_items: [
      { id: "toi-1001", product_name: "Mediterranean Quinoa Bowl", quantity: 3, price: 12.00, status: "preparing" },
      { id: "toi-1002", product_name: "Smoked Salmon & Avocado Bagel", quantity: 3, price: 13.50, status: "preparing" },
      { id: "toi-1003", product_name: "Iced Caramel Macchiato", quantity: 4, price: 5.50, status: "ready" },
      { id: "toi-1004", product_name: "French Macaron Box", quantity: 2, price: 8.50, status: "pending" },
    ],
  },
];

interface TablesState {
  tables: Table[];
  orders: MockTableOrder[];
  setTables: (tables: Table[]) => void;
  addTable: (table: Omit<Table, "id">) => Table;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  setOrders: (orders: MockTableOrder[]) => void;
  addOrder: (order: MockTableOrder) => void;
  updateOrder: (id: string, updates: Partial<MockTableOrder>) => void;
  resetTables: () => void;
}

export const useTablesStore = create<TablesState>()(
  persist(
    (set, get) => ({
      tables: INITIAL_TABLES,
      orders: INITIAL_TABLE_ORDERS,

      setTables: (tables) => set({ tables }),

      addTable: (tbl) => {
        const id = `tbl-${Date.now()}`;
        const newTable: Table = {
          ...tbl,
          id,
        };
        set({ tables: [...get().tables, newTable] });
        return newTable;
      },

      updateTable: (id, updates) => {
        set({
          tables: get().tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        });
      },

      deleteTable: (id) => {
        set({
          tables: get().tables.filter((t) => t.id !== id),
          orders: get().orders.filter((o) => o.table_id !== id),
        });
      },

      setOrders: (orders) => set({ orders }),

      addOrder: (order) => set({ orders: [...get().orders, order] }),

      updateOrder: (id, updates) => {
        set({
          orders: get().orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        });
      },

      resetTables: () => set({ tables: INITIAL_TABLES, orders: INITIAL_TABLE_ORDERS }),
    }),
    {
      name: "synqpos-tables-store",
    }
  )
);
