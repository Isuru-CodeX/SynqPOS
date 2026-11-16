import { db, type CachedProduct, type CachedCategory, type CachedBranchProduct } from "./db";

export interface DemoAccount {
  role: "owner" | "admin" | "manager" | "cashier" | "waiter" | "kitchen" | "courier";
  title: string;
  email: string;
  password: string;
  fullName: string;
  description: string;
}

export const DEMO_CREDENTIALS: DemoAccount[] = [
  {
    role: "owner",
    title: "Owner / Super Admin",
    email: "isururathnayaka999@gmail.com",
    password: "SynqPOS2026!",
    fullName: "Isuru Rathnayaka",
    description: "Full access to all modules, POS, financial reports, settings, and staff management.",
  },
  {
    role: "admin",
    title: "System Administrator",
    email: "admin@synqpos.com",
    password: "SynqPOS2026!",
    fullName: "Alex Rivera",
    description: "Branch administration, products, recipes, catalog, and inventory.",
  },
  {
    role: "manager",
    title: "Floor Manager",
    email: "manager@synqpos.com",
    password: "SynqPOS2026!",
    fullName: "Sarah Chen",
    description: "Shift oversight, POS register, discount approvals, tables, and refunds.",
  },
  {
    role: "cashier",
    title: "Cashier Operator",
    email: "cashier@synqpos.com",
    password: "SynqPOS2026!",
    fullName: "David Miller",
    description: "POS terminal checkout, multi-method payments, tickets, and cash drawer.",
  },
  {
    role: "waiter",
    title: "Table Waiter",
    email: "waiter@synqpos.com",
    password: "SynqPOS2026!",
    fullName: "Emma Watson",
    description: "Table floor management, mobile orders, kitchen dispatch, and split billing.",
  },
  {
    role: "kitchen",
    title: "Kitchen / Chef (KDS)",
    email: "kitchen@synqpos.com",
    password: "SynqPOS2026!",
    fullName: "Marco Rossi",
    description: "KDS screen, order item status, prep alerts, and recipe batching.",
  },
  {
    role: "courier",
    title: "Delivery Courier",
    email: "courier@synqpos.com",
    password: "SynqPOS2026!",
    fullName: "Lucas Silva",
    description: "Dispatch orders, in-transit deliveries, client tracking, and confirmations.",
  },
];

export const INITIAL_CATEGORIES = [
  { id: "cat-coffee",   name: "Hot Beverages",  color: "#38BDF8", sort_order: 1 },
  { id: "cat-bakery",   name: "Bakery & Bread", color: "#818CF8", sort_order: 2 },
  { id: "cat-meals",    name: "Sandwiches & Meals", color: "#C084FC", sort_order: 3 },
  { id: "cat-cold",     name: "Cold Drinks",    color: "#34D399", sort_order: 4 },
  { id: "cat-desserts", name: "Desserts & Cakes", color: "#F472B6", sort_order: 5 },
];

export const INITIAL_PRODUCTS = [
  // Hot Beverages
  {
    id: "prod-espresso",
    category_id: "cat-coffee",
    name: "Espresso Doppio",
    price: 3.50,
    cost: 0.85,
    tax_rate: 0.08,
    sku: "HOT-001",
    barcode: "7701001",
    product_type: "simple",
    station: "bar",
    description: "Double shot of rich espresso with golden crema.",
  },
  {
    id: "prod-latte",
    category_id: "cat-coffee",
    name: "Caffe Latte",
    price: 4.75,
    cost: 1.20,
    tax_rate: 0.08,
    sku: "HOT-002",
    barcode: "7701002",
    product_type: "simple",
    station: "bar",
    description: "Steamed whole milk poured over fresh double espresso.",
  },
  {
    id: "prod-caramel-macchiato",
    category_id: "cat-coffee",
    name: "Iced Caramel Macchiato",
    price: 5.50,
    cost: 1.45,
    tax_rate: 0.08,
    sku: "HOT-003",
    barcode: "7701003",
    product_type: "simple",
    station: "bar",
    description: "Vanilla syrup, cold milk, espresso, and butter caramel drizzle.",
  },
  {
    id: "prod-matcha-latte",
    category_id: "cat-coffee",
    name: "Matcha Green Tea Latte",
    price: 5.25,
    cost: 1.35,
    tax_rate: 0.08,
    sku: "HOT-004",
    barcode: "7701004",
    product_type: "simple",
    station: "bar",
    description: "Ceremonial Japanese matcha whisked with steamed oat milk.",
  },
  {
    id: "prod-hot-chocolate",
    category_id: "cat-coffee",
    name: "Artisan Hot Chocolate",
    price: 4.50,
    cost: 1.10,
    tax_rate: 0.08,
    sku: "HOT-005",
    barcode: "7701005",
    product_type: "simple",
    station: "bar",
    description: "Melted Belgian 70% dark chocolate and silky milk foam.",
  },

  // Bakery & Bread
  {
    id: "prod-croissant",
    category_id: "cat-bakery",
    name: "Butter Croissant",
    price: 3.75,
    cost: 0.95,
    tax_rate: 0.08,
    sku: "BAK-001",
    barcode: "7702001",
    product_type: "simple",
    station: "kitchen",
    description: "Flaky, multi-layered French butter croissant baked fresh daily.",
  },
  {
    id: "prod-almond-croissant",
    category_id: "cat-bakery",
    name: "Chocolate Almond Danish",
    price: 4.50,
    cost: 1.25,
    tax_rate: 0.08,
    sku: "BAK-002",
    barcode: "7702002",
    product_type: "simple",
    station: "kitchen",
    description: "Sweet almond frangipane cream, dark chocolate chips and toasted almonds.",
  },
  {
    id: "prod-blueberry-muffin",
    category_id: "cat-bakery",
    name: "Blueberry Crumble Muffin",
    price: 3.95,
    cost: 0.90,
    tax_rate: 0.08,
    sku: "BAK-003",
    barcode: "7702003",
    product_type: "simple",
    station: "kitchen",
    description: "Loaded with fresh wild blueberries and cinnamon brown sugar crumble.",
  },
  {
    id: "prod-cinnamon-brioche",
    category_id: "cat-bakery",
    name: "Cinnamon Brioche Roll",
    price: 4.25,
    cost: 1.10,
    tax_rate: 0.08,
    sku: "BAK-004",
    barcode: "7702004",
    product_type: "simple",
    station: "kitchen",
    description: "Warm brioche swirled with Ceylon cinnamon and cream cheese glaze.",
  },
  {
    id: "prod-sourdough-loaf",
    category_id: "cat-bakery",
    name: "Artisan Sourdough Loaf",
    price: 7.50,
    cost: 1.80,
    tax_rate: 0.08,
    sku: "BAK-005",
    barcode: "7702005",
    product_type: "simple",
    station: "kitchen",
    description: "Naturally fermented 36-hour sourdough loaf with crispy blistered crust.",
  },

  // Sandwiches & Meals
  {
    id: "prod-chicken-pesto",
    category_id: "cat-meals",
    name: "Grilled Chicken Pesto Panini",
    price: 11.50,
    cost: 3.40,
    tax_rate: 0.08,
    sku: "MEA-001",
    barcode: "7703001",
    product_type: "simple",
    station: "kitchen",
    description: "Marinated chicken breast, basil pesto, fresh mozzarella and sun-dried tomatoes.",
  },
  {
    id: "prod-salmon-bagel",
    category_id: "cat-meals",
    name: "Smoked Salmon & Avocado Bagel",
    price: 13.50,
    cost: 4.20,
    tax_rate: 0.08,
    sku: "MEA-002",
    barcode: "7703002",
    product_type: "simple",
    station: "kitchen",
    description: "Atlantic cold-smoked salmon, dill cream cheese, capers, red onion on toasted bagel.",
  },
  {
    id: "prod-quinoa-bowl",
    category_id: "cat-meals",
    name: "Mediterranean Quinoa Bowl",
    price: 12.00,
    cost: 3.10,
    tax_rate: 0.08,
    sku: "MEA-003",
    barcode: "7703003",
    product_type: "simple",
    station: "kitchen",
    description: "Organic tricolor quinoa, cucumber, cherry tomatoes, kalamata olives and Greek feta.",
  },
  {
    id: "prod-truffle-baguette",
    category_id: "cat-meals",
    name: "Truffle Prosciutto Baguette",
    price: 14.00,
    cost: 4.50,
    tax_rate: 0.08,
    sku: "MEA-004",
    barcode: "7703004",
    product_type: "simple",
    station: "kitchen",
    description: "Prosciutto di Parma, black truffle butter, arugula and shaved aged parmesan.",
  },

  // Cold Drinks
  {
    id: "prod-green-juice",
    category_id: "cat-cold",
    name: "Organic Cold-Pressed Green Juice",
    price: 6.50,
    cost: 1.80,
    tax_rate: 0.08,
    sku: "COL-001",
    barcode: "7704001",
    product_type: "simple",
    station: "bar",
    description: "Fresh celery, green apple, cucumber, kale, ginger and lemon.",
  },
  {
    id: "prod-lemon-soda",
    category_id: "cat-cold",
    name: "Sparkling Lemon Mint Soda",
    price: 4.00,
    cost: 0.70,
    tax_rate: 0.08,
    sku: "COL-002",
    barcode: "7704002",
    product_type: "simple",
    station: "bar",
    description: "San Pellegrino sparkling water with freshly squeezed Sicilian lemon and mint leaves.",
  },
  {
    id: "prod-acai-smoothie",
    category_id: "cat-cold",
    name: "Berry Acai Smoothie",
    price: 6.75,
    cost: 1.95,
    tax_rate: 0.08,
    sku: "COL-003",
    barcode: "7704003",
    product_type: "simple",
    station: "bar",
    description: "Organic acai, blackberries, banana, almond butter and coconut water.",
  },

  // Desserts & Cakes
  {
    id: "prod-chocolate-cake",
    category_id: "cat-desserts",
    name: "Dark Chocolate Ganache Cake",
    price: 6.50,
    cost: 1.60,
    tax_rate: 0.08,
    sku: "DES-001",
    barcode: "7705001",
    product_type: "simple",
    station: "kitchen",
    description: "Decadent triple layer dark cocoa sponge cake filled with silk chocolate ganache.",
  },
  {
    id: "prod-cheesecake",
    category_id: "cat-desserts",
    name: "New York Cheesecake",
    price: 6.00,
    cost: 1.50,
    tax_rate: 0.08,
    sku: "DES-002",
    barcode: "7705002",
    product_type: "simple",
    station: "kitchen",
    description: "Classic creamy baked cheesecake on buttery graham cracker crust with strawberry coulis.",
  },
  {
    id: "prod-macarons",
    category_id: "cat-desserts",
    name: "French Macaron Box (4pcs)",
    price: 8.50,
    cost: 2.10,
    tax_rate: 0.08,
    sku: "DES-003",
    barcode: "7705003",
    product_type: "simple",
    station: "kitchen",
    description: "Assorted Parisian macarons: Pistachio, Raspberry, Salted Caramel and Madagascar Vanilla.",
  },
];

/**
 * Ensures the local IndexedDB contains default categories and products
 * so that offline POS terminal, cashier, catalog, and inventory are fully functional immediately.
 */
export async function seedInitialDemoData(tenantId: string = "demo-tenant-synqpos", branchId: string = "demo-branch-main") {
  try {
    const existingCount = await db.products.where("tenant_id").equals(tenantId).count();
    if (existingCount > 0) {
      return;
    }

    const now = new Date().toISOString();

    const categoriesToPut: CachedCategory[] = INITIAL_CATEGORIES.map((cat) => ({
      id: cat.id,
      tenant_id: tenantId,
      name: cat.name,
      color: cat.color,
      sort_order: cat.sort_order,
      status: "active",
      schedule_enabled: false,
      schedule_from: null,
      schedule_until: null,
      schedule_days: null,
      _cached_at: now,
    }));

    const productsToPut: CachedProduct[] = INITIAL_PRODUCTS.map((prod) => ({
      id: prod.id,
      tenant_id: tenantId,
      name: prod.name,
      price: prod.price,
      tax_rate: prod.tax_rate,
      category_id: prod.category_id,
      image_url: null,
      sku: prod.sku,
      barcode: prod.barcode,
      status: "active",
      product_type: prod.product_type,
      station: prod.station,
      rappi_product_id: null,
      description: prod.description,
      sort_order: null,
      _cached_at: now,
    }));

    const branchProductsToPut: CachedBranchProduct[] = INITIAL_PRODUCTS.map((prod) => ({
      id: `${prod.id}:${branchId}`,
      product_id: prod.id,
      branch_id: branchId,
      is_available: true,
      local_price: prod.price,
      _cached_at: now,
    }));

    await db.categories.bulkPut(categoriesToPut);
    await db.products.bulkPut(productsToPut);
    await db.branch_products.bulkPut(branchProductsToPut);

    console.info(`[SynqPOS] Seeded ${productsToPut.length} products and ${categoriesToPut.length} categories into IndexedDB.`);
  } catch (err) {
    console.error("[SynqPOS] Error seeding local demo data:", err);
  }
}
