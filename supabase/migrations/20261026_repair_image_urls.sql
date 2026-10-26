-- ==============================================================================
-- JO JO EFFECTS & CO. - IMAGE URL REPAIR SCRIPT FOR SUPABASE
-- Run this in the Supabase SQL Editor to update existing rows to the
-- production /images/ static path format.
-- ==============================================================================

-- 1. Ensure Storage Bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for product-images bucket
DROP POLICY IF EXISTS "Public Read Product Images" ON storage.objects;
CREATE POLICY "Public Read Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated Upload Product Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Product Images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- 2. Update category image URLs
UPDATE public.categories 
SET image_url = '/images/cat_womens_hair.jpg'
WHERE id = 'cat-womens-hair' OR slug = 'womens-hair';

UPDATE public.categories 
SET image_url = '/images/cat_fashion_handbag.jpg'
WHERE id = 'cat-fashion-handbags' OR slug = 'womens-fashion-handbags';

UPDATE public.categories 
SET image_url = '/images/cat_phone_accessory.jpg'
WHERE id = 'cat-phone-accessories' OR slug = 'phone-accessories';

UPDATE public.categories 
SET image_url = '/images/cat_luxury_watch.jpg'
WHERE id = 'cat-watches' OR slug = 'watches';

-- Convert any other /src/assets/images/ paths in categories
UPDATE public.categories
SET image_url = REPLACE(image_url, '/src/assets/images/', '/images/')
WHERE image_url LIKE '/src/assets/images/%';

-- 3. Update products images jsonb
UPDATE public.products
SET images = '[{"id": "img-h1", "url": "/images/cat_womens_hair.jpg", "alt_text": "Raw Virgin Straight Lace Front Wig", "is_primary": true, "display_order": 1}]'::jsonb
WHERE id = 'prod-hair-01';

UPDATE public.products
SET images = '[{"id": "img-h2", "url": "/images/cat_womens_hair.jpg", "alt_text": "Brazilian Body Wave Bundles", "is_primary": true, "display_order": 1}]'::jsonb
WHERE id = 'prod-hair-02';

UPDATE public.products
SET images = '[{"id": "img-b1", "url": "/images/cat_fashion_handbag.jpg", "alt_text": "Luxe Structured Top-Handle Flap Handbag", "is_primary": true, "display_order": 1}]'::jsonb
WHERE id = 'prod-bag-01';

UPDATE public.products
SET images = '[{"id": "img-w1", "url": "/images/cat_luxury_watch.jpg", "alt_text": "Aurora Fluted Bezel Two-Tone Quartz Timepiece", "is_primary": true, "display_order": 1}]'::jsonb
WHERE id = 'prod-watch-01';

UPDATE public.products
SET images = '[{"id": "img-a1", "url": "/images/cat_phone_accessory.jpg", "alt_text": "Slim Matte Magnetic Case and Fast Wireless Pad", "is_primary": true, "display_order": 1}]'::jsonb
WHERE id = 'prod-acc-01';

-- 4. Update site settings hero image
UPDATE public.site_settings
SET data = jsonb_set(
  data,
  '{hero_section,image_url}',
  '"/images/hero_luxe_collection.jpg"'::jsonb
)
WHERE id = 'current' AND data ? 'hero_section';
