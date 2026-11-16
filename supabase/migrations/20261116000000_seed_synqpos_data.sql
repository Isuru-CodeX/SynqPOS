-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Seed SynqPOS Tenant, Catalog in USD, and Accounts
-- Maintainer: Isuru Rathnayaka <isururathnayaka999@gmail.com>
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_tenant_id   UUID;
  v_branch_main UUID;
  v_branch_dt   UUID;

  v_cat_coffee   UUID;
  v_cat_bakery   UUID;
  v_cat_meals    UUID;
  v_cat_cold     UUID;
  v_cat_dessert  UUID;
BEGIN
  -- Create or fetch SynqPOS tenant
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'synqpos' LIMIT 1;

  IF v_tenant_id IS NULL THEN
    INSERT INTO public.tenants (name, slug, currency, tax_rate, domain, primary_color, theme_kind, active_channels)
    VALUES ('SynqPOS', 'synqpos', 'USD', 0.08, 'demo.localhost', '#6366F1', 'bar', ARRAY['pos', 'tables', 'delivery', 'qr', 'rappi']::text[])
    RETURNING id INTO v_tenant_id;
  END IF;

  -- Create branch if not exists
  SELECT id INTO v_branch_main FROM public.branches WHERE tenant_id = v_tenant_id AND name = 'Main Flagship Store' LIMIT 1;
  IF v_branch_main IS NULL THEN
    INSERT INTO public.branches (tenant_id, name, address, phone, status)
    VALUES (v_tenant_id, 'Main Flagship Store', '742 Evergreen Terrace, Suite 100', '+1 (555) 234-5678', 'active')
    RETURNING id INTO v_branch_main;
  END IF;

  SELECT id INTO v_branch_dt FROM public.branches WHERE tenant_id = v_tenant_id AND name = 'Downtown Express' LIMIT 1;
  IF v_branch_dt IS NULL THEN
    INSERT INTO public.branches (tenant_id, name, address, phone, status)
    VALUES (v_tenant_id, 'Downtown Express', '100 Broadway Ave, Floor 1', '+1 (555) 987-6543', 'active')
    RETURNING id INTO v_branch_dt;
  END IF;

  -- Inventory centers
  INSERT INTO public.inventory_centers (tenant_id, branch_id, name, type)
  VALUES (v_tenant_id, v_branch_main, 'Flagship Main Depot', 'point_of_sale')
  ON CONFLICT DO NOTHING;

  -- Tables
  INSERT INTO public.tables (tenant_id, branch_id, name, capacity, status, position_x, position_y)
  VALUES
    (v_tenant_id, v_branch_main, 'Table 1', 2, 'available', 50, 50),
    (v_tenant_id, v_branch_main, 'Table 2', 2, 'available', 150, 50),
    (v_tenant_id, v_branch_main, 'Table 3', 4, 'available', 250, 50),
    (v_tenant_id, v_branch_main, 'Table 4', 4, 'available', 350, 50),
    (v_tenant_id, v_branch_main, 'Table 5 (Booth)', 6, 'available', 50, 160),
    (v_tenant_id, v_branch_main, 'Table 6 (Booth)', 6, 'available', 180, 160),
    (v_tenant_id, v_branch_main, 'VIP Terrace 1', 4, 'available', 320, 160),
    (v_tenant_id, v_branch_main, 'Bar Counter 1', 1, 'available', 50, 270),
    (v_tenant_id, v_branch_main, 'Bar Counter 2', 1, 'available', 110, 270),
    (v_tenant_id, v_branch_main, 'Bar Counter 3', 1, 'available', 170, 270)
  ON CONFLICT DO NOTHING;

  -- Categories
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Hot Beverages',       '#38BDF8', 1) RETURNING id INTO v_cat_coffee;
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Bakery & Bread',      '#818CF8', 2) RETURNING id INTO v_cat_bakery;
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Sandwiches & Meals',  '#C084FC', 3) RETURNING id INTO v_cat_meals;
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Cold Drinks',         '#34D399', 4) RETURNING id INTO v_cat_cold;
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Desserts & Cakes',    '#F472B6', 5) RETURNING id INTO v_cat_dessert;

  -- Products
  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description) VALUES
    (v_tenant_id, v_cat_coffee, 'Espresso Doppio', 3.50, 0.85, 0.08, 'HOT-001', '7701001', 'simple', 'bar', 'Double shot of rich espresso with golden crema.'),
    (v_tenant_id, v_cat_coffee, 'Caffe Latte', 4.75, 1.20, 0.08, 'HOT-002', '7701002', 'simple', 'bar', 'Steamed whole milk poured over fresh double espresso.'),
    (v_tenant_id, v_cat_coffee, 'Iced Caramel Macchiato', 5.50, 1.45, 0.08, 'HOT-003', '7701003', 'simple', 'bar', 'Vanilla syrup, cold milk, espresso, and butter caramel drizzle.'),
    (v_tenant_id, v_cat_coffee, 'Matcha Green Tea Latte', 5.25, 1.35, 0.08, 'HOT-004', '7701004', 'simple', 'bar', 'Ceremonial Japanese matcha whisked with steamed oat milk.'),
    (v_tenant_id, v_cat_coffee, 'Artisan Hot Chocolate', 4.50, 1.10, 0.08, 'HOT-005', '7701005', 'simple', 'bar', 'Melted Belgian 70% dark chocolate and silky milk foam.'),
    (v_tenant_id, v_cat_bakery, 'Butter Croissant', 3.75, 0.95, 0.08, 'BAK-001', '7702001', 'simple', 'kitchen', 'Flaky, multi-layered French butter croissant baked fresh daily.'),
    (v_tenant_id, v_cat_bakery, 'Chocolate Almond Danish', 4.50, 1.25, 0.08, 'BAK-002', '7702002', 'simple', 'kitchen', 'Sweet almond frangipane cream, dark chocolate chips and toasted almonds.'),
    (v_tenant_id, v_cat_bakery, 'Blueberry Crumble Muffin', 3.95, 0.90, 0.08, 'BAK-003', '7702003', 'simple', 'kitchen', 'Loaded with fresh wild blueberries and cinnamon brown sugar crumble.'),
    (v_tenant_id, v_cat_bakery, 'Cinnamon Brioche Roll', 4.25, 1.10, 0.08, 'BAK-004', '7702004', 'simple', 'kitchen', 'Warm brioche swirled with Ceylon cinnamon and cream cheese glaze.'),
    (v_tenant_id, v_cat_bakery, 'Artisan Sourdough Loaf', 7.50, 1.80, 0.08, 'BAK-005', '7702005', 'simple', 'kitchen', 'Naturally fermented 36-hour sourdough loaf with crispy blistered crust.'),
    (v_tenant_id, v_cat_meals, 'Grilled Chicken Pesto Panini', 11.50, 3.40, 0.08, 'MEA-001', '7703001', 'simple', 'kitchen', 'Marinated chicken breast, basil pesto, fresh mozzarella and sun-dried tomatoes.'),
    (v_tenant_id, v_cat_meals, 'Smoked Salmon & Avocado Bagel', 13.50, 4.20, 0.08, 'MEA-002', '7703002', 'simple', 'kitchen', 'Atlantic cold-smoked salmon, dill cream cheese, capers, red onion on toasted bagel.'),
    (v_tenant_id, v_cat_meals, 'Mediterranean Quinoa Bowl', 12.00, 3.10, 0.08, 'MEA-003', '7703003', 'simple', 'kitchen', 'Organic tricolor quinoa, cucumber, cherry tomatoes, kalamata olives and Greek feta.'),
    (v_tenant_id, v_cat_meals, 'Truffle Prosciutto Baguette', 14.00, 4.50, 0.08, 'MEA-004', '7703004', 'simple', 'kitchen', 'Prosciutto di Parma, black truffle butter, arugula and shaved aged parmesan.'),
    (v_tenant_id, v_cat_cold, 'Organic Cold-Pressed Green Juice', 6.50, 1.80, 0.08, 'COL-001', '7704001', 'simple', 'bar', 'Fresh celery, green apple, cucumber, kale, ginger and lemon.'),
    (v_tenant_id, v_cat_cold, 'Sparkling Lemon Mint Soda', 4.00, 0.70, 0.08, 'COL-002', '7704002', 'simple', 'bar', 'San Pellegrino sparkling water with freshly squeezed Sicilian lemon and mint leaves.'),
    (v_tenant_id, v_cat_cold, 'Berry Acai Smoothie', 6.75, 1.95, 0.08, 'COL-003', '7704003', 'simple', 'bar', 'Organic acai, blackberries, banana, almond butter and coconut water.'),
    (v_tenant_id, v_cat_dessert, 'Dark Chocolate Ganache Cake', 6.50, 1.60, 0.08, 'DES-001', '7705001', 'simple', 'kitchen', 'Decadent triple layer dark cocoa sponge cake filled with silk chocolate ganache.'),
    (v_tenant_id, v_cat_dessert, 'New York Cheesecake', 6.00, 1.50, 0.08, 'DES-002', '7705002', 'simple', 'kitchen', 'Classic creamy baked cheesecake on buttery graham cracker crust with strawberry coulis.'),
    (v_tenant_id, v_cat_dessert, 'French Macaron Box (4pcs)', 8.50, 2.10, 0.08, 'DES-003', '7705003', 'simple', 'kitchen', 'Assorted Parisian macarons: Pistachio, Raspberry, Salted Caramel and Madagascar Vanilla.')
  ON CONFLICT DO NOTHING;

  -- Link products to branch
  INSERT INTO public.branch_products (tenant_id, branch_id, product_id, is_available, local_price)
  SELECT v_tenant_id, v_branch_main, id, true, price FROM public.products WHERE tenant_id = v_tenant_id
  ON CONFLICT DO NOTHING;

  -- Channel prices
  INSERT INTO public.product_channel_prices (tenant_id, product_id, channel, price)
  SELECT v_tenant_id, id, 'pos', price FROM public.products WHERE tenant_id = v_tenant_id
  ON CONFLICT DO NOTHING;
END $$;
