-- ==============================================================================
-- JO JO EFFECTS & CO.
-- Production Supabase Database Schema, Storage, RLS & Initial Seed Data
-- ==============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- PROFILES (Administrators and Store Staff)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT 'Store Administrator',
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  base_price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2),
  stock_quantity INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_reference TEXT NOT NULL UNIQUE,
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cashapp', 'venmo', 'zelle', 'paypal')),
  payment_status TEXT NOT NULL DEFAULT 'awaiting_verification' CHECK (payment_status IN ('pending', 'awaiting_verification', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'new' CHECK (order_status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled', 'on_hold')),
  tracking_number TEXT,
  carrier TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ORDER ITEMS (Normalized line items)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'awaiting_verification',
  transaction_reference TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INVENTORY MOVEMENTS (Stock auditing)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change_amount INT NOT NULL,
  reason TEXT NOT NULL,
  reference_order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INQUIRIES (Customer contact form submissions & product questions)
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'general_inquiry',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ORDER STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ADMIN ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. AUTOMATIC PROFILE TRIGGER ON AUTH SIGNUP
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Store Administrator'),
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Categories RLS
DROP POLICY IF EXISTS "Public categories read" ON public.categories;
CREATE POLICY "Public categories read" ON public.categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin categories manage" ON public.categories;
CREATE POLICY "Admin categories manage" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Products RLS
DROP POLICY IF EXISTS "Public products read" ON public.products;
CREATE POLICY "Public products read" ON public.products
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admin products manage" ON public.products;
CREATE POLICY "Admin products manage" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders RLS
DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
CREATE POLICY "Public can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view and update orders" ON public.orders;
CREATE POLICY "Admin can view and update orders" ON public.orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Order Items RLS
DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view order items" ON public.order_items;
CREATE POLICY "Admin can view order items" ON public.order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Inquiries RLS
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries" ON public.inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view and update inquiries" ON public.inquiries;
CREATE POLICY "Admin can view and update inquiries" ON public.inquiries
  FOR ALL USING (auth.role() = 'authenticated');

-- Site Settings RLS
DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can update site settings" ON public.site_settings;
CREATE POLICY "Admin can update site settings" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Profiles & Activity RLS
DROP POLICY IF EXISTS "Admins can view profiles" ON public.profiles;
CREATE POLICY "Admins can view profiles" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can view logs" ON public.admin_activity_logs;
CREATE POLICY "Admins can view logs" ON public.admin_activity_logs
  FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 5. STORAGE BUCKET FOR IMAGE UPLOADS
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
CREATE POLICY "Public Access Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated Upload Product Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Product Images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- ==============================================================================
-- 6. INITIAL SEED DATA
-- ==============================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, display_order)
VALUES
  ('cat-womens-hair', 'Women''s Hair', 'womens-hair', 'Silky virgin hair bundles, HD lace wigs, extensions, and salon-grade styling pieces.', '/src/assets/images/cat_womens_hair_1793019936017.jpg', true, 1),
  ('cat-fashion-handbags', 'Women''s Fashion Handbags', 'womens-fashion-handbags', 'Chic structured top-handle bags, crossbody styles, and statement luxury shoulder purses.', '/src/assets/images/cat_fashion_handbag_1793019937559.jpg', true, 2),
  ('cat-phone-accessories', 'Phone Accessories', 'phone-accessories', 'Impact protection cases, fast magnetic wireless pads, and braided charging accessories.', '/src/assets/images/cat_phone_accessory_1793019937687.jpg', true, 3),
  ('cat-watches', 'Watches', 'watches', 'Precision quartz timepieces with polished gold bezels and stainless steel link bracelets.', '/src/assets/images/cat_luxury_watch_1793019939029.jpg', true, 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description;

-- Seed Products
INSERT INTO public.products (id, category_id, name, slug, description, specifications, base_price, sale_price, stock_quantity, is_published, is_featured, is_new_arrival, images, variants)
VALUES
  (
    'prod-hair-01',
    'cat-womens-hair',
    'Raw Virgin Straight Lace Front Wig (180% Density)',
    'raw-virgin-straight-lace-front-wig',
    'Hand-tied transparent HD Swiss lace front wig crafted from 100% cuticle-intact raw human hair. Can be bleached, heat styled up to 450°F, and parted in multiple directions. Features natural pre-plucked hairline with baby hairs.',
    '{"Lace Type": "13x4 HD Swiss Transparent Lace", "Hair Texture": "Bone Straight Natural Hair", "Density": "180% Full Volume", "Cap Size": "Medium (22.5\" with adjustable straps)", "Origin": "Selected International Direct Sourcing"}'::jsonb,
    185.00,
    159.00,
    12,
    true,
    true,
    true,
    '[{"id": "img-h1", "url": "/src/assets/images/cat_womens_hair_1793019936017.jpg", "alt_text": "Raw Virgin Straight Lace Front Wig", "is_primary": true, "display_order": 1}]'::jsonb,
    '[{"id": "v-h1", "name": "22 Inches", "price_adjustment": 0, "stock_quantity": 4}, {"id": "v-h2", "name": "26 Inches", "price_adjustment": 25, "stock_quantity": 5}, {"id": "v-h3", "name": "30 Inches", "price_adjustment": 45, "stock_quantity": 3}]'::jsonb
  ),
  (
    'prod-hair-02',
    'cat-womens-hair',
    'Brazilian Body Wave 3-Bundle Set',
    'brazilian-body-wave-3-bundle-set',
    'Thick from root to tip with natural luster and bounce. Retains luscious soft waves effortlessly after washing. Minimal shedding and tangle-free with reinforced double wefts.',
    '{"Quantity": "3 Full Bundles (100g each)", "Grade": "10A Virgin Brazilian Hair", "Color": "Natural Black (1B)", "Weft": "Reinforced Double Machine Weft"}'::jsonb,
    135.00,
    null,
    18,
    true,
    false,
    true,
    '[{"id": "img-h2", "url": "/src/assets/images/cat_womens_hair_1793019936017.jpg", "alt_text": "Brazilian Body Wave Bundles", "is_primary": true, "display_order": 1}]'::jsonb,
    '[{"id": "v-h4", "name": "18 / 20 / 22 Inches", "price_adjustment": 0, "stock_quantity": 8}, {"id": "v-h5", "name": "22 / 24 / 26 Inches", "price_adjustment": 20, "stock_quantity": 10}]'::jsonb
  ),
  (
    'prod-bag-01',
    'cat-fashion-handbags',
    'Luxe Structured Top-Handle Flap Handbag with Gold Clasp',
    'luxe-structured-top-handle-flap-handbag',
    'An iconic silhouette tailored in two-tone structured vegan leather in tan and midnight black. Features a signature brushed gold turn-lock closure, gold curb link chain shoulder strap, and organized interior compartments.',
    '{"Material": "Premium Grained Vegan Leather & Suede Lining", "Hardware": "Polished 18K-Tone Gold Clasp & Stud Feet", "Dimensions": "10.5\" L x 4.2\" W x 8.0\" H", "Strap Drop": "Top handle 4\", Detachable strap 21\""}'::jsonb,
    89.00,
    74.99,
    14,
    true,
    true,
    true,
    '[{"id": "img-b1", "url": "/src/assets/images/cat_fashion_handbag_1793019937559.jpg", "alt_text": "Luxe Structured Top-Handle Flap Handbag", "is_primary": true, "display_order": 1}]'::jsonb,
    '[{"id": "v-b1", "name": "Caramel Tan & Black", "price_adjustment": 0, "stock_quantity": 8}, {"id": "v-b2", "name": "Classic All-Black", "price_adjustment": 0, "stock_quantity": 6}]'::jsonb
  ),
  (
    'prod-watch-01',
    'cat-watches',
    'Aurora Fluted Bezel Two-Tone Quartz Timepiece',
    'aurora-fluted-bezel-two-tone-quartz-timepiece',
    'Classic luxury watch styling featuring a precision fluted gold-plated bezel, silver sunray dial with Roman numerals, and a comfortable two-tone jubilee link bracelet with folding safety clasp. Water-resistant for everyday wear.',
    '{"Movement": "Precision Japanese Quartz Movement", "Case Diameter": "36mm (Unisex Elegant Fit)", "Bezel": "18K Gold PVD-Coated Fluted Stainless Steel", "Crystal": "Scratch-Resistant Mineral Crystal Glass", "Water Resistance": "3 ATM (Splash Proof)"}'::jsonb,
    110.00,
    89.99,
    15,
    true,
    true,
    true,
    '[{"id": "img-w1", "url": "/src/assets/images/cat_luxury_watch_1793019939029.jpg", "alt_text": "Aurora Fluted Bezel Two-Tone Quartz Timepiece", "is_primary": true, "display_order": 1}]'::jsonb,
    '[{"id": "v-w1", "name": "Two-Tone Gold & Silver", "price_adjustment": 0, "stock_quantity": 10}, {"id": "v-w2", "name": "Pure Gold Plated", "price_adjustment": 10, "stock_quantity": 5}]'::jsonb
  ),
  (
    'prod-acc-01',
    'cat-phone-accessories',
    'Slim Matte Magnetic Case with Gold Trim + Fast Wireless Pad',
    'slim-matte-magnetic-case-with-gold-trim',
    'Precision engineered shock-absorbent phone case with an electroplated gold camera guard ring and strong built-in neodymium magnetic ring. Includes ultra-fast 15W aluminum magnetic charging pad and nylon braided cable.',
    '{"Compatibility": "MagSafe Compatible Strong Magnet Array", "Material": "Silky Soft-Touch Anti-Fingerprint PC & TPU", "Charger Output": "15W Fast Wireless Qi-Standard Output", "Cable Length": "1.5m Heavy Duty Braided USB-C"}'::jsonb,
    42.00,
    34.50,
    35,
    true,
    true,
    true,
    '[{"id": "img-a1", "url": "/src/assets/images/cat_phone_accessory_1793019937687.jpg", "alt_text": "Slim Matte Magnetic Case and Fast Wireless Pad", "is_primary": true, "display_order": 1}]'::jsonb,
    '[{"id": "v-a1", "name": "iPhone 15 / 16 Series", "price_adjustment": 0, "stock_quantity": 20}, {"id": "v-a2", "name": "Samsung Galaxy S24 Series", "price_adjustment": 0, "stock_quantity": 15}]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  base_price = EXCLUDED.base_price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity;

-- Seed Official Business Settings
INSERT INTO public.site_settings (id, data, updated_at)
VALUES (
  'current',
  '{
    "business_name": "JO JO EFFECTS & CO.",
    "tagline": "Your Everyday Finds, Made Easy.",
    "business_location": "Sioux Falls, South Dakota, United States",
    "business_contact_number": "+1 (605) 900-8992",
    "whatsapp_number": "+1 (443) 743-5959",
    "currency_code": "USD",
    "currency_symbol": "$",
    "announcement_bar": {
      "enabled": true,
      "text": "Complimentary shipping across the US on orders over $100 · Personal WhatsApp order confirmation available",
      "link_url": "/shop"
    },
    "hero_section": {
      "enabled": true,
      "headline": "Discover Your Everyday Essentials.",
      "description": "Explore carefully selected hair, fashion handbags, watches, and phone accessories designed to complement your everyday style.",
      "primary_button_text": "SHOP NOW",
      "primary_button_link": "/shop",
      "secondary_button_text": "EXPLORE COLLECTIONS",
      "secondary_button_link": "#collections",
      "image_url": "/src/assets/images/hero_luxe_collection_1793019935404.jpg"
    },
    "about_us": {
      "heading": "Curated Finds. Direct Quality. Everyday Style.",
      "content": "JO JO EFFECTS & CO. is a growing online retail business focused on bringing together carefully selected everyday products in one convenient shopping destination.\n\nFrom women''s hair and fashion handbags to watches and phone accessories, our goal is to make discovering and shopping for everyday essentials simple and convenient.\n\nWe source directly from trusted international manufacturers to deliver high quality, accessible luxury, and personal customer service.",
      "mission": "We are building a customer-focused online shopping experience that combines product variety, convenient ordering, and personal customer support."
    },
    "social_links": {
      "facebook": "",
      "instagram": "https://www.instagram.com/easicartmarket?xtok=cTZzc3B5MTFxcDV0",
      "tiktok": ""
    },
    "payment_methods": {
      "cashapp": {
        "enabled": true,
        "identifier": "$JoJoEffectsCo",
        "instructions": "Send order total to $JoJoEffectsCo on Cash App. Please include your Order Reference in the Cash App note."
      },
      "venmo": {
        "enabled": true,
        "identifier": "@JoJoEffects-Co",
        "instructions": "Send payment to @JoJoEffects-Co on Venmo with your Order Reference in the memo field."
      },
      "zelle": {
        "enabled": true,
        "identifier": "orders@jojoeffects.com",
        "instructions": "Send via Zelle to orders@jojoeffects.com or business contact (605) 900-8992. Include your Order Reference."
      },
      "paypal": {
        "enabled": true,
        "identifier": "paypal.me/jojoeffectsco",
        "instructions": "Send to paypal.me/jojoeffectsco or click to open PayPal. Please include your Order Reference."
      }
    }
  }'::jsonb,
  timezone('utc'::text, now())
)
ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  updated_at = timezone('utc'::text, now());
