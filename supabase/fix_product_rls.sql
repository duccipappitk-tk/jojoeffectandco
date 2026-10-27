-- ==============================================================================
-- JO JO EFFECTS & CO.
-- Supabase Row-Level Security (RLS) Policy Fix for Products & Store Management
--
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire script, and click "Run" (or Ctrl/Cmd + Enter)
-- ==============================================================================

-- 1. Enable full access to PRODUCTS table for read and write operations
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public products read" ON public.products;
DROP POLICY IF EXISTS "Admin products manage" ON public.products;
DROP POLICY IF EXISTS "Enable all access for products" ON public.products;

CREATE POLICY "Enable all access for products" ON public.products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Enable full access to CATEGORIES table
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public categories read" ON public.categories;
DROP POLICY IF EXISTS "Admin categories manage" ON public.categories;
DROP POLICY IF EXISTS "Enable all access for categories" ON public.categories;

CREATE POLICY "Enable all access for categories" ON public.categories
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Enable full access to SITE SETTINGS table
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admin can update site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Enable all access for site settings" ON public.site_settings;

CREATE POLICY "Enable all access for site settings" ON public.site_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Enable full access to ORDERS table (so customers can create orders and admin can view/update)
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admin can view and update orders" ON public.orders;
DROP POLICY IF EXISTS "Enable all access for orders" ON public.orders;

CREATE POLICY "Enable all access for orders" ON public.orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Enable full access to INQUIRIES table
ALTER TABLE IF EXISTS public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admin can view and update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Enable all access for inquiries" ON public.inquiries;

CREATE POLICY "Enable all access for inquiries" ON public.inquiries
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Ensure Storage Bucket for Product Photography is public and allows uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Product Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to product-images" ON storage.objects;

CREATE POLICY "Allow all uploads to product-images" ON storage.objects
  FOR ALL
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');
