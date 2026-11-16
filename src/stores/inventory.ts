import { create } from "zustand";
import { persist } from "zustand/middleware";
import { INITIAL_PRODUCTS } from "@/lib/demoData";

export interface MockStockItem {
  id: string;
  product_id: string;
  branch_id: string;
  inventory_center_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  products: {
    id: string;
    name: string;
    min_stock: number;
    unit_code: string;
    status: string;
    sku: string;
    barcode?: string;
  };
  inventory_centers?: {
    name: string;
  } | null;
}

export interface MockMovement {
  id: string;
  product_id: string;
  branch_id: string;
  inventory_center_id: string | null;
  movement_type: "purchase" | "adjustment" | "waste" | "return";
  quantity: number;
  previous_stock: number;
  resulting_stock: number;
  reason: string | null;
  created_at: string;
  products: {
    name: string;
  };
  inventory_centers?: {
    name: string;
  } | null;
}

const STOCK_QUANTITIES: Record<string, { qty: number; min: number; unit: string; center: string }> = {
  "prod-espresso": { qty: 120.0, min: 25.0, unit: "shots", center: "Bar Station" },
  "prod-latte": { qty: 85.0, min: 20.0, unit: "units", center: "Bar Station" },
  "prod-caramel-macchiato": { qty: 64.0, min: 15.0, unit: "units", center: "Bar Station" },
  "prod-matcha-latte": { qty: 45.0, min: 10.0, unit: "units", center: "Bar Station" },
  "prod-hot-chocolate": { qty: 52.0, min: 15.0, unit: "units", center: "Bar Station" },
  "prod-croissant": { qty: 28.0, min: 12.0, unit: "pcs", center: "Kitchen Pantry" },
  "prod-almond-croissant": { qty: 18.0, min: 10.0, unit: "pcs", center: "Kitchen Pantry" },
  "prod-blueberry-muffin": { qty: 4.0, min: 10.0, unit: "pcs", center: "Kitchen Pantry" }, // Low stock!
  "prod-cinnamon-brioche": { qty: 14.0, min: 8.0, unit: "pcs", center: "Kitchen Pantry" },
  "prod-sourdough-loaf": { qty: 2.0, min: 6.0, unit: "loaves", center: "Kitchen Pantry" }, // Low stock!
  "prod-chicken-pesto": { qty: 32.0, min: 12.0, unit: "portions", center: "Kitchen Cold Room" },
  "prod-salmon-bagel": { qty: 24.0, min: 8.0, unit: "portions", center: "Kitchen Cold Room" },
  "prod-quinoa-bowl": { qty: 26.0, min: 10.0, unit: "portions", center: "Kitchen Cold Room" },
  "prod-truffle-baguette": { qty: 15.0, min: 6.0, unit: "portions", center: "Kitchen Cold Room" },
  "prod-green-juice": { qty: 38.0, min: 15.0, unit: "bottles", center: "Main Warehouse" },
  "prod-lemon-soda": { qty: 65.0, min: 20.0, unit: "cans", center: "Main Warehouse" },
  "prod-acai-smoothie": { qty: 0.0, min: 10.0, unit: "portions", center: "Bar Station" }, // Out of stock!
  "prod-chocolate-cake": { qty: 16.0, min: 8.0, unit: "slices", center: "Kitchen Pantry" },
  "prod-cheesecake": { qty: 22.0, min: 8.0, unit: "slices", center: "Kitchen Pantry" },
  "prod-macarons": { qty: 30.0, min: 10.0, unit: "boxes", center: "Kitchen Pantry" },
};

export const INITIAL_STOCKS: MockStockItem[] = INITIAL_PRODUCTS.map((prod) => {
  const conf = STOCK_QUANTITIES[prod.id] || { qty: 30.0, min: 10.0, unit: "units", center: "Main Warehouse" };
  const now = new Date().toISOString();
  return {
    id: `stock-${prod.id}`,
    product_id: prod.id,
    branch_id: "demo-branch-main",
    inventory_center_id: "center-main",
    quantity: conf.qty,
    created_at: now,
    updated_at: now,
    products: {
      id: prod.id,
      name: prod.name,
      min_stock: conf.min,
      unit_code: conf.unit,
      status: "active",
      sku: prod.sku,
      barcode: prod.barcode,
    },
    inventory_centers: {
      name: conf.center,
    },
  };
});

export const INITIAL_MOVEMENTS: MockMovement[] = [
  {
    id: "mov-1",
    product_id: "prod-croissant",
    branch_id: "demo-branch-main",
    inventory_center_id: "center-main",
    movement_type: "purchase",
    quantity: 30,
    previous_stock: 10,
    resulting_stock: 40,
    reason: "Fresh morning bakery delivery from artisan supplier",
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    products: { name: "Butter Croissant" },
    inventory_centers: { name: "Kitchen Pantry" },
  },
  {
    id: "mov-2",
    product_id: "prod-espresso",
    branch_id: "demo-branch-main",
    inventory_center_id: "center-main",
    movement_type: "purchase",
    quantity: 50,
    previous_stock: 80,
    resulting_stock: 130,
    reason: "Restocked organic Colombia Huila roast beans",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    products: { name: "Espresso Doppio" },
    inventory_centers: { name: "Bar Station" },
  },
  {
    id: "mov-3",
    product_id: "prod-sourdough-loaf",
    branch_id: "demo-branch-main",
    inventory_center_id: "center-main",
    movement_type: "adjustment",
    quantity: -4,
    previous_stock: 6,
    resulting_stock: 2,
    reason: "Daily shift end count reconciliation",
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    products: { name: "Artisan Sourdough Loaf" },
    inventory_centers: { name: "Kitchen Pantry" },
  },
  {
    id: "mov-4",
    product_id: "prod-acai-smoothie",
    branch_id: "demo-branch-main",
    inventory_center_id: "center-main",
    movement_type: "waste",
    quantity: -5,
    previous_stock: 5,
    resulting_stock: 0,
    reason: "Expired organic frozen pulp batch",
    created_at: new Date(Date.now() - 20 * 3600000).toISOString(),
    products: { name: "Berry Acai Smoothie" },
    inventory_centers: { name: "Bar Station" },
  },
];

interface InventoryState {
  stocks: MockStockItem[];
  movements: MockMovement[];
  setStocks: (stocks: MockStockItem[]) => void;
  updateStock: (productId: string, quantity: number) => void;
  addMovement: (movement: Omit<MockMovement, "id" | "created_at">) => void;
  resetInventory: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      stocks: INITIAL_STOCKS,
      movements: INITIAL_MOVEMENTS,

      setStocks: (stocks) => set({ stocks }),

      updateStock: (productId, quantity) => {
        set({
          stocks: get().stocks.map((s) =>
            s.product_id === productId ? { ...s, quantity, updated_at: new Date().toISOString() } : s
          ),
        });
      },

      addMovement: (m) => {
        const id = `mov-${Date.now()}`;
        const newMov: MockMovement = {
          ...m,
          id,
          created_at: new Date().toISOString(),
        };
        set({
          movements: [newMov, ...get().movements],
        });
      },

      resetInventory: () => set({ stocks: INITIAL_STOCKS, movements: INITIAL_MOVEMENTS }),
    }),
    {
      name: "synqpos-inventory-stocks",
    }
  )
);
