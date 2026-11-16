-- ═══════════════════════════════════════════════════════════════════════════════
-- SynqPOS — Database Seed Script
-- Maintainer: Isuru Rathnayaka <isururathnayaka999@gmail.com>
-- Currency: USD ($) | Tax: 8.00%
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

  -- Product UUIDs
  v_prod_espresso UUID;
  v_prod_latte    UUID;
  v_prod_macchiato UUID;
  v_prod_matcha   UUID;
  v_prod_hotchoc  UUID;

  v_prod_croissant UUID;
  v_prod_danish    UUID;
  v_prod_muffin    UUID;
  v_prod_brioche   UUID;
  v_prod_sourdough UUID;

  v_prod_panini    UUID;
  v_prod_salmon    UUID;
  v_prod_quinoa    UUID;
  v_prod_truffle   UUID;

  v_prod_greenjuice UUID;
  v_prod_lemonsoda  UUID;
  v_prod_smoothie   UUID;

  v_prod_choccake   UUID;
  v_prod_cheesecake UUID;
  v_prod_macarons   UUID;
BEGIN

  -- 1. Tenant: SynqPOS
  INSERT INTO public.tenants (name, slug, currency, tax_rate, domain, primary_color, theme_kind, active_channels)
  VALUES ('SynqPOS', 'synqpos', 'USD', 0.08, 'demo.localhost', '#6366F1', 'bar', ARRAY['pos', 'tables', 'delivery', 'qr', 'rappi']::text[])
  RETURNING id INTO v_tenant_id;

  -- 2. Branches
  INSERT INTO public.branches (tenant_id, name, address, phone, status)
  VALUES (v_tenant_id, 'Main Flagship Store', '742 Evergreen Terrace, Suite 100', '+1 (555) 234-5678', 'active')
  RETURNING id INTO v_branch_main;

  INSERT INTO public.branches (tenant_id, name, address, phone, status)
  VALUES (v_tenant_id, 'Downtown Express', '100 Broadway Ave, Floor 1', '+1 (555) 987-6543', 'active')
  RETURNING id INTO v_branch_dt;

  -- 3. Inventory Centers
  INSERT INTO public.inventory_centers (tenant_id, branch_id, name, type)
  VALUES 
    (v_tenant_id, v_branch_main, 'Flagship Main Depot', 'point_of_sale'),
    (v_tenant_id, v_branch_dt,   'Downtown Storage',   'point_of_sale');

  -- 4. Tables for Floor Management
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
    (v_tenant_id, v_branch_main, 'Bar Counter 3', 1, 'available', 170, 270);

  -- 5. Categories
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Hot Beverages',       '#38BDF8', 1) RETURNING id INTO v_cat_coffee;
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Bakery & Bread',      '#818CF8', 2) RETURNING id INTO v_cat_bakery;
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Sandwiches & Meals',  '#C084FC', 3) RETURNING id INTO v_cat_meals;
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Cold Drinks',         '#34D399', 4) RETURNING id INTO v_cat_cold;
  INSERT INTO public.categories (tenant_id, name, color, sort_order) VALUES (v_tenant_id, 'Desserts & Cakes',    '#F472B6', 5) RETURNING id INTO v_cat_dessert;

  -- 6. Products (Prices in USD)
  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_coffee, 'Espresso Doppio', 3.50, 0.85, 0.08, 'HOT-001', '7701001', 'simple', 'bar', 'Double shot of rich espresso with golden crema.')
  RETURNING id INTO v_prod_espresso;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_coffee, 'Caffe Latte', 4.75, 1.20, 0.08, 'HOT-002', '7701002', 'simple', 'bar', 'Steamed whole milk poured over fresh double espresso.')
  RETURNING id INTO v_prod_latte;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_coffee, 'Iced Caramel Macchiato', 5.50, 1.45, 0.08, 'HOT-003', '7701003', 'simple', 'bar', 'Vanilla syrup, cold milk, espresso, and butter caramel drizzle.')
  RETURNING id INTO v_prod_macchiato;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_coffee, 'Matcha Green Tea Latte', 5.25, 1.35, 0.08, 'HOT-004', '7701004', 'simple', 'bar', 'Ceremonial Japanese matcha whisked with steamed oat milk.')
  RETURNING id INTO v_prod_matcha;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_coffee, 'Artisan Hot Chocolate', 4.50, 1.10, 0.08, 'HOT-005', '7701005', 'simple', 'bar', 'Melted Belgian 70% dark chocolate and silky milk foam.')
  RETURNING id INTO v_prod_hotchoc;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_bakery, 'Butter Croissant', 3.75, 0.95, 0.08, 'BAK-001', '7702001', 'simple', 'kitchen', 'Flaky, multi-layered French butter croissant baked fresh daily.')
  RETURNING id INTO v_prod_croissant;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_bakery, 'Chocolate Almond Danish', 4.50, 1.25, 0.08, 'BAK-002', '7702002', 'simple', 'kitchen', 'Sweet almond frangipane cream, dark chocolate chips and toasted almonds.')
  RETURNING id INTO v_prod_danish;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_bakery, 'Blueberry Crumble Muffin', 3.95, 0.90, 0.08, 'BAK-003', '7702003', 'simple', 'kitchen', 'Loaded with fresh wild blueberries and cinnamon brown sugar crumble.')
  RETURNING id INTO v_prod_muffin;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_bakery, 'Cinnamon Brioche Roll', 4.25, 1.10, 0.08, 'BAK-004', '7702004', 'simple', 'kitchen', 'Warm brioche swirled with Ceylon cinnamon and cream cheese glaze.')
  RETURNING id INTO v_prod_brioche;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_bakery, 'Artisan Sourdough Loaf', 7.50, 1.80, 0.08, 'BAK-005', '7702005', 'simple', 'kitchen', 'Naturally fermented 36-hour sourdough loaf with crispy blistered crust.')
  RETURNING id INTO v_prod_sourdough;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_meals, 'Grilled Chicken Pesto Panini', 11.50, 3.40, 0.08, 'MEA-001', '7703001', 'simple', 'kitchen', 'Marinated chicken breast, basil pesto, fresh mozzarella and sun-dried tomatoes.')
  RETURNING id INTO v_prod_panini;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_meals, 'Smoked Salmon & Avocado Bagel', 13.50, 4.20, 0.08, 'MEA-002', '7703002', 'simple', 'kitchen', 'Atlantic cold-smoked salmon, dill cream cheese, capers, red onion on toasted bagel.')
  RETURNING id INTO v_prod_salmon;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_meals, 'Mediterranean Quinoa Bowl', 12.00, 3.10, 0.08, 'MEA-003', '7703003', 'simple', 'kitchen', 'Organic tricolor quinoa, cucumber, cherry tomatoes, kalamata olives and Greek feta.')
  RETURNING id INTO v_prod_quinoa;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_meals, 'Truffle Prosciutto Baguette', 14.00, 4.50, 0.08, 'MEA-004', '7703004', 'simple', 'kitchen', 'Prosciutto di Parma, black truffle butter, arugula and shaved aged parmesan.')
  RETURNING id INTO v_prod_truffle;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_cold, 'Organic Cold-Pressed Green Juice', 6.50, 1.80, 0.08, 'COL-001', '7704001', 'simple', 'bar', 'Fresh celery, green apple, cucumber, kale, ginger and lemon.')
  RETURNING id INTO v_prod_greenjuice;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_cold, 'Sparkling Lemon Mint Soda', 4.00, 0.70, 0.08, 'COL-002', '7704002', 'simple', 'bar', 'San Pellegrino sparkling water with freshly squeezed Sicilian lemon and mint leaves.')
  RETURNING id INTO v_prod_lemonsoda;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_cold, 'Berry Acai Smoothie', 6.75, 1.95, 0.08, 'COL-003', '7704003', 'simple', 'bar', 'Organic acai, blackberries, banana, almond butter and coconut water.')
  RETURNING id INTO v_prod_smoothie;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_dessert, 'Dark Chocolate Ganache Cake', 6.50, 1.60, 0.08, 'DES-001', '7705001', 'simple', 'kitchen', 'Decadent triple layer dark cocoa sponge cake filled with silk chocolate ganache.')
  RETURNING id INTO v_prod_choccake;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_dessert, 'New York Cheesecake', 6.00, 1.50, 0.08, 'DES-002', '7705002', 'simple', 'kitchen', 'Classic creamy baked cheesecake on buttery graham cracker crust with strawberry coulis.')
  RETURNING id INTO v_prod_cheesecake;

  INSERT INTO public.products (tenant_id, category_id, name, price, cost, tax_rate, sku, barcode, product_type, station, description)
  VALUES (v_tenant_id, v_cat_dessert, 'French Macaron Box (4pcs)', 8.50, 2.10, 0.08, 'DES-003', '7705003', 'simple', 'kitchen', 'Assorted Parisian macarons: Pistachio, Raspberry, Salted Caramel and Madagascar Vanilla.')
  RETURNING id INTO v_prod_macarons;

  -- 7. Branch Products
  INSERT INTO public.branch_products (tenant_id, branch_id, product_id, is_available, local_price)
  SELECT v_tenant_id, v_branch_main, id, true, price FROM public.products WHERE tenant_id = v_tenant_id;

  INSERT INTO public.branch_products (tenant_id, branch_id, product_id, is_available, local_price)
  SELECT v_tenant_id, v_branch_dt, id, true, price FROM public.products WHERE tenant_id = v_tenant_id;

  -- 8. Channel Prices (POS, Tables, Delivery, Rappi)
  INSERT INTO public.product_channel_prices (tenant_id, product_id, channel, price)
  SELECT v_tenant_id, id, 'pos', price FROM public.products WHERE tenant_id = v_tenant_id;

  INSERT INTO public.product_channel_prices (tenant_id, product_id, channel, price)
  SELECT v_tenant_id, id, 'tables', price FROM public.products WHERE tenant_id = v_tenant_id;

  INSERT INTO public.product_channel_prices (tenant_id, product_id, channel, price)
  SELECT v_tenant_id, id, 'delivery', ROUND((price * 1.05)::numeric, 2) FROM public.products WHERE tenant_id = v_tenant_id;

  INSERT INTO public.product_channel_prices (tenant_id, product_id, channel, price)
  SELECT v_tenant_id, id, 'rappi', ROUND((price * 1.15)::numeric, 2) FROM public.products WHERE tenant_id = v_tenant_id;

END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Seed User Accounts: Isuru Rathnayaka (Owner) & Role Accounts
-- Password: SynqPOS2026!
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_tenant_id UUID;
  u_id        UUID;
  demo_pwd    TEXT := crypt('SynqPOS2026!', gen_salt('bf'));
  roles_data  RECORD;
BEGIN
  SELECT id INTO v_tenant_id FROM public.tenants WHERE slug = 'synqpos' LIMIT 1;

  FOR roles_data IN SELECT * FROM (VALUES
    ('isururathnayaka999@gmail.com', 'Isuru Rathnayaka', 'owner'::app_role),
    ('admin@synqpos.com',             'Alex Rivera',      'admin'::app_role),
    ('manager@synqpos.com',           'Sarah Chen',       'manager'::app_role),
    ('cashier@synqpos.com',           'David Miller',     'cashier'::app_role),
    ('waiter@synqpos.com',            'Emma Watson',      'waiter'::app_role),
    ('kitchen@synqpos.com',           'Marco Rossi',      'kitchen'::app_role),
    ('courier@synqpos.com',           'Lucas Silva',      'courier'::app_role)
  ) AS t(email, full_name, rol)
  LOOP
    SELECT id INTO u_id FROM auth.users WHERE email = roles_data.email;

    IF u_id IS NULL THEN
      u_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role,
        email, encrypted_password,
        email_confirmed_at,
        confirmation_token, recovery_token,
        email_change_token_new, reauthentication_token,
        raw_user_meta_data,
        created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        u_id, 'authenticated', 'authenticated',
        roles_data.email,
        demo_pwd,
        now(),
        '', '', '', '',
        jsonb_build_object('full_name', roles_data.full_name, 'role', roles_data.rol),
        now(), now()
      );
    END IF;

    INSERT INTO public.user_roles (user_id, tenant_id, role)
    VALUES (u_id, v_tenant_id, roles_data.rol)
    ON CONFLICT DO NOTHING;

    -- Also link super_admin for the owner
    IF roles_data.rol = 'owner' THEN
      INSERT INTO public.user_roles (user_id, tenant_id, role)
      VALUES (u_id, v_tenant_id, 'super_admin'::app_role)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
