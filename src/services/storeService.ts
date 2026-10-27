import { 
  Category, 
  Product, 
  Order, 
  CustomerInquiry, 
  SiteSettings, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod 
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEYS = {
  CATEGORIES: 'jojo_categories_v1',
  PRODUCTS: 'jojo_products_v1',
  ORDERS: 'jojo_orders_v1',
  INQUIRIES: 'jojo_inquiries_v1',
  SETTINGS: 'jojo_settings_v1',
};

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (_) {}
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (_) {}
  },
};

/**
 * Normalizes any image URL so it resolves correctly in production on Vercel
 * without 404ing on Vite source paths.
 */
export function resolveImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '/images/hero_luxe_collection.jpg';
  }
  const trimmed = url.trim();
  // Remote URLs or data URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  // Convert old Vite source paths to public distribution paths
  if (trimmed.startsWith('/src/assets/images/')) {
    const filename = trimmed.replace('/src/assets/images/', '');
    return `/images/${filename}`;
  }
  if (trimmed.startsWith('src/assets/images/')) {
    const filename = trimmed.replace('src/assets/images/', '');
    return `/images/${filename}`;
  }
  if (trimmed.startsWith('/assets/images/')) {
    const filename = trimmed.replace('/assets/images/', '');
    return `/images/${filename}`;
  }
  if (trimmed.startsWith('images/')) {
    return `/${trimmed}`;
  }
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`;
  }
  return trimmed;
}

// Initial default categories
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-womens-hair',
    name: "Women's Hair",
    slug: 'womens-hair',
    description: 'Silky virgin hair bundles, HD lace wigs, extensions, and salon-grade styling pieces.',
    image_url: '/images/cat_womens_hair.jpg',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'cat-fashion-handbags',
    name: "Women's Fashion Handbags",
    slug: 'womens-fashion-handbags',
    description: 'Chic structured top-handle bags, crossbody styles, and statement luxury shoulder purses.',
    image_url: '/images/cat_fashion_handbag.jpg',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'cat-phone-accessories',
    name: 'Phone Accessories',
    slug: 'phone-accessories',
    description: 'Impact protection cases, fast magnetic wireless pads, and braided charging accessories.',
    image_url: '/images/cat_phone_accessory.jpg',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'cat-watches',
    name: 'Watches',
    slug: 'watches',
    description: 'Precision quartz timepieces with polished gold bezels and stainless steel link bracelets.',
    image_url: '/images/cat_luxury_watch.jpg',
    is_active: true,
    display_order: 4,
  },
];

// Initial default products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-hair-01',
    category_id: 'cat-womens-hair',
    name: 'Raw Virgin Straight Lace Front Wig (180% Density)',
    slug: 'raw-virgin-straight-lace-front-wig',
    description: 'Hand-tied transparent HD Swiss lace front wig crafted from 100% cuticle-intact raw human hair. Can be bleached, heat styled up to 450°F, and parted in multiple directions. Features natural pre-plucked hairline with baby hairs.',
    specifications: {
      'Lace Type': '13x4 HD Swiss Transparent Lace',
      'Hair Texture': 'Bone Straight Natural Hair',
      'Density': '180% Full Volume',
      'Cap Size': 'Medium (22.5" with adjustable straps)',
      'Origin': 'Selected International Direct Sourcing'
    },
    base_price: 185.00,
    sale_price: 159.00,
    stock_quantity: 12,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    images: [
      {
        id: 'img-h1',
        url: '/images/cat_womens_hair.jpg',
        alt_text: 'Raw Virgin Straight Lace Front Wig',
        is_primary: true,
        display_order: 1
      }
    ],
    variants: [
      { id: 'v-h1', name: '22 Inches', price_adjustment: 0, stock_quantity: 4 },
      { id: 'v-h2', name: '26 Inches', price_adjustment: 25, stock_quantity: 5 },
      { id: 'v-h3', name: '30 Inches', price_adjustment: 45, stock_quantity: 3 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-hair-02',
    category_id: 'cat-womens-hair',
    name: 'Brazilian Body Wave 3-Bundle Set',
    slug: 'brazilian-body-wave-3-bundle-set',
    description: 'Thick from root to tip with natural luster and bounce. Retains luscious soft waves effortlessly after washing. Minimal shedding and tangle-free with reinforced double wefts.',
    specifications: {
      'Quantity': '3 Full Bundles (100g each)',
      'Grade': '10A Virgin Brazilian Hair',
      'Color': 'Natural Black (1B)',
      'Weft': 'Reinforced Double Machine Weft'
    },
    base_price: 135.00,
    sale_price: null,
    stock_quantity: 18,
    is_published: true,
    is_featured: false,
    is_new_arrival: true,
    images: [
      {
        id: 'img-h2',
        url: '/images/cat_womens_hair.jpg',
        alt_text: 'Brazilian Body Wave Bundles',
        is_primary: true,
        display_order: 1
      }
    ],
    variants: [
      { id: 'v-h4', name: '18 / 20 / 22 Inches', price_adjustment: 0, stock_quantity: 8 },
      { id: 'v-h5', name: '22 / 24 / 26 Inches', price_adjustment: 20, stock_quantity: 10 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-bag-01',
    category_id: 'cat-fashion-handbags',
    name: 'Luxe Structured Top-Handle Flap Handbag with Gold Clasp',
    slug: 'luxe-structured-top-handle-flap-handbag',
    description: 'An iconic silhouette tailored in two-tone structured vegan leather in tan and midnight black. Features a signature brushed gold turn-lock closure, gold curb link chain shoulder strap, and organized interior compartments.',
    specifications: {
      'Material': 'Premium Grained Vegan Leather & Suede Lining',
      'Hardware': 'Polished 18K-Tone Gold Clasp & Stud Feet',
      'Dimensions': '10.5" L x 4.2" W x 8.0" H',
      'Strap Drop': 'Top handle 4", Detachable strap 21"'
    },
    base_price: 89.00,
    sale_price: 74.99,
    stock_quantity: 14,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    images: [
      {
        id: 'img-b1',
        url: '/images/cat_fashion_handbag.jpg',
        alt_text: 'Luxe Structured Top-Handle Flap Handbag',
        is_primary: true,
        display_order: 1
      }
    ],
    variants: [
      { id: 'v-b1', name: 'Caramel Tan & Black', price_adjustment: 0, stock_quantity: 8 },
      { id: 'v-b2', name: 'Classic All-Black', price_adjustment: 0, stock_quantity: 6 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-bag-02',
    category_id: 'cat-fashion-handbags',
    name: 'Everyday Parisian Saddle Crossbody Bag',
    slug: 'everyday-parisian-saddle-crossbody-bag',
    description: 'Sleek curved silhouette designed for daily outings and evening dinners. Features secure magnetic snap closure, rear slip pocket for phone, and an adjustable wide strap.',
    specifications: {
      'Closure': 'Concealed Magnetic Flap',
      'Material': 'Smooth Matte Finish Vegan Leather',
      'Pockets': '1 Interior Zipper Pocket, 1 Card Slot'
    },
    base_price: 64.00,
    sale_price: 52.00,
    stock_quantity: 20,
    is_published: true,
    is_featured: false,
    is_new_arrival: false,
    images: [
      {
        id: 'img-b2',
        url: '/images/hero_luxe_collection.jpg',
        alt_text: 'Everyday Parisian Saddle Crossbody Bag',
        is_primary: true,
        display_order: 1
      }
    ],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-watch-01',
    category_id: 'cat-watches',
    name: 'Aurora Fluted Bezel Two-Tone Quartz Timepiece',
    slug: 'aurora-fluted-bezel-two-tone-quartz-timepiece',
    description: 'Classic luxury watch styling featuring a precision fluted gold-plated bezel, silver sunray dial with Roman numerals, and a comfortable two-tone jubilee link bracelet with folding safety clasp. Water-resistant for everyday wear.',
    specifications: {
      'Movement': 'Precision Japanese Quartz Movement',
      'Case Diameter': '36mm (Unisex Elegant Fit)',
      'Bezel': '18K Gold PVD-Coated Fluted Stainless Steel',
      'Crystal': 'Scratch-Resistant Mineral Crystal Glass',
      'Water Resistance': '3 ATM (Splash Proof)'
    },
    base_price: 110.00,
    sale_price: 89.99,
    stock_quantity: 15,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    images: [
      {
        id: 'img-w1',
        url: '/images/cat_luxury_watch.jpg',
        alt_text: 'Aurora Fluted Bezel Two-Tone Quartz Timepiece',
        is_primary: true,
        display_order: 1
      }
    ],
    variants: [
      { id: 'v-w1', name: 'Two-Tone Gold & Silver', price_adjustment: 0, stock_quantity: 10 },
      { id: 'v-w2', name: 'Pure Gold Plated', price_adjustment: 10, stock_quantity: 5 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-watch-02',
    category_id: 'cat-watches',
    name: 'Heritage Minimalist Slim Mesh Watch',
    slug: 'heritage-minimalist-slim-mesh-watch',
    description: 'Ultra-thin 6.8mm profile with clean baton hour markers and an easily adjustable magnetic Milanese mesh strap. Understated luxury that complements formalwear and casual attire.',
    specifications: {
      'Case Thickness': '6.8mm Ultra-Slim',
      'Strap': 'Stainless Steel Magnetic Mesh Strap',
      'Dial': 'Eggshell White Dial with Gold Accents'
    },
    base_price: 78.00,
    sale_price: null,
    stock_quantity: 9,
    is_published: true,
    is_featured: false,
    is_new_arrival: false,
    images: [
      {
        id: 'img-w2',
        url: '/images/cat_luxury_watch.jpg',
        alt_text: 'Heritage Minimalist Slim Mesh Watch',
        is_primary: true,
        display_order: 1
      }
    ],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-acc-01',
    category_id: 'cat-phone-accessories',
    name: 'Slim Matte Magnetic Case with Gold Trim + Fast Wireless Pad',
    slug: 'slim-matte-magnetic-case-with-gold-trim',
    description: 'Precision engineered shock-absorbent phone case with an electroplated gold camera guard ring and strong built-in neodymium magnetic ring. Includes ultra-fast 15W aluminum magnetic charging pad and nylon braided cable.',
    specifications: {
      'Compatibility': 'MagSafe Compatible Strong Magnet Array',
      'Material': 'Silky Soft-Touch Anti-Fingerprint PC & TPU',
      'Charger Output': '15W Fast Wireless Qi-Standard Output',
      'Cable Length': '1.5m Heavy Duty Braided USB-C'
    },
    base_price: 42.00,
    sale_price: 34.50,
    stock_quantity: 35,
    is_published: true,
    is_featured: true,
    is_new_arrival: true,
    images: [
      {
        id: 'img-a1',
        url: '/images/cat_phone_accessory.jpg',
        alt_text: 'Slim Matte Magnetic Case and Fast Wireless Pad',
        is_primary: true,
        display_order: 1
      }
    ],
    variants: [
      { id: 'v-a1', name: 'iPhone 15 / 16 Series', price_adjustment: 0, stock_quantity: 20 },
      { id: 'v-a2', name: 'Samsung Galaxy S24 Series', price_adjustment: 0, stock_quantity: 15 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'prod-acc-02',
    category_id: 'cat-phone-accessories',
    name: 'Luxe Braided Heavy-Duty 60W USB-C Cable Trio',
    slug: 'luxe-braided-heavy-duty-usb-c-cable-trio',
    description: 'Three reinforced braided charging cables engineered with aerospace-grade aluminum alloy connectors. Supports 60W Power Delivery and high-speed data transfer. Tested for 25,000+ bends.',
    specifications: {
      'Includes': '3 Cables (3.3ft, 6ft, 10ft lengths)',
      'Power Delivery': 'Up to 60W Fast Power Delivery (3A)',
      'Connector': 'Gold-Plated USB-C to USB-C with USB-A Adapter'
    },
    base_price: 28.00,
    sale_price: 22.00,
    stock_quantity: 40,
    is_published: true,
    is_featured: false,
    is_new_arrival: false,
    images: [
      {
        id: 'img-a2',
        url: '/images/cat_phone_accessory.jpg',
        alt_text: 'Braided Heavy-Duty 60W USB-C Cable',
        is_primary: true,
        display_order: 1
      }
    ],
    variants: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  business_name: 'JO JO EFFECTS & CO.',
  tagline: 'Your Everyday Finds, Made Easy.',
  business_location: 'Sioux Falls, South Dakota, United States',
  business_contact_number: '+1 (605) 900-8992', // Public display contact
  whatsapp_number: '+1 (443) 743-5959', // Internal only! Never display in text!
  currency_code: 'USD',
  currency_symbol: '$',
  announcement_bar: {
    enabled: true,
    text: 'Complimentary shipping across the US on orders over $100 · Personal WhatsApp order confirmation available',
    link_url: '/shop',
  },
  hero_section: {
    enabled: true,
    headline: 'Discover Your Everyday Essentials.',
    description: 'Explore carefully selected hair, fashion handbags, watches, and phone accessories designed to complement your everyday style.',
    primary_button_text: 'SHOP NOW',
    primary_button_link: '/shop',
    secondary_button_text: 'EXPLORE COLLECTIONS',
    secondary_button_link: '#collections',
    image_url: '/images/hero_luxe_collection.jpg',
  },
  about_us: {
    heading: 'Curated Finds. Direct Quality. Everyday Style.',
    content: 'JO JO EFFECTS & CO. is a growing online retail business focused on bringing together carefully selected everyday products in one convenient shopping destination.\n\nFrom women\'s hair and fashion handbags to watches and phone accessories, our goal is to make discovering and shopping for everyday essentials simple and convenient.\n\nWe source directly from trusted international manufacturers to deliver high quality, accessible luxury, and personal customer service.',
    mission: 'We are building a customer-focused online shopping experience that combines product variety, convenient ordering, and personal customer support.',
  },
  social_links: {
    facebook: '',
    instagram: 'https://www.instagram.com/easicartmarket?xtok=cTZzc3B5MTFxcDV0',
    tiktok: '',
  },
  payment_methods: {
    cashapp: {
      enabled: true,
      identifier: '$JoJoEffectsCo',
      instructions: 'Send order total to $JoJoEffectsCo on Cash App. Please include your Order Reference in the Cash App note.',
    },
    venmo: {
      enabled: true,
      identifier: '@JoJoEffects-Co',
      instructions: 'Send payment to @JoJoEffects-Co on Venmo with your Order Reference in the memo field.',
    },
    zelle: {
      enabled: true,
      identifier: 'orders@jojoeffects.com',
      instructions: 'Send via Zelle to orders@jojoeffects.com or business contact (605) 900-8992. Include your Order Reference.',
    },
    paypal: {
      enabled: true,
      identifier: 'paypal.me/jojoeffectsco',
      instructions: 'Send to paypal.me/jojoeffectsco or click to open PayPal. Please include your Order Reference.',
    },
  },
};

// Helper to format WhatsApp link internally
export function getCleanWhatsAppDigits(rawPhone: string): string {
  return rawPhone.replace(/\D/g, '');
}

export function buildWhatsAppLink(message: string, whatsappNumber?: string): string {
  const settings = storeService.getSettings();
  const rawNumber = whatsappNumber || settings.whatsapp_number || '+1 (443) 743-5959';
  const cleanDigits = getCleanWhatsAppDigits(rawNumber);
  const encodedText = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanDigits}?text=${encodedText}`;
}

export const storeService = {
  // SETTINGS
  getSettings(): SiteSettings {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.hero_section?.image_url) {
          parsed.hero_section.image_url = resolveImageUrl(parsed.hero_section.image_url);
        }
        // Ensure official Instagram URL is present if unset or placeholder
        if (!parsed.social_links?.instagram || parsed.social_links.instagram.includes('jojoeffects')) {
          parsed.social_links = {
            ...parsed.social_links,
            instagram: 'https://www.instagram.com/easicartmarket?xtok=cTZzc3B5MTFxcDV0',
          };
          safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
        }
        return { ...INITIAL_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.warn('Failed reading settings from storage', e);
    }
    return INITIAL_SETTINGS;
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    safeStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('site_settings')
          .upsert({ id: 'current', data: settings, updated_at: new Date().toISOString() });
      } catch (err) {
        console.warn('Supabase settings sync error:', err);
      }
    }
    return settings;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const sanitizeCategories = (cats: Category[]): Category[] => {
      return cats.map(c => ({
        ...c,
        image_url: resolveImageUrl(c.image_url),
      }));
    };

    let localCategories: Category[] = [];
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        localCategories = sanitizeCategories(JSON.parse(stored) as Category[]);
      }
    } catch (_) {}

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        if (!error && data && data.length > 0) {
          const supabaseCats = sanitizeCategories(data as Category[]);
          const supabaseIdSet = new Set(supabaseCats.map(c => c.id));
          const localOnly = localCategories.filter(c => !supabaseIdSet.has(c.id));
          if (localOnly.length > 0) {
            const combined = [...supabaseCats, ...localOnly];
            safeStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(combined));
            return combined;
          }
          safeStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(supabaseCats));
          return supabaseCats;
        }
        // If table exists but empty, auto-seed initial categories into Supabase
        if (!error && (!data || data.length === 0)) {
          for (const cat of INITIAL_CATEGORIES) {
            await supabase.from('categories').upsert(cat);
          }
          return INITIAL_CATEGORIES;
        }
      } catch (err) {
        console.warn('Supabase getCategories error:', err);
      }
    }

    if (localCategories.length > 0) {
      return localCategories;
    }

    safeStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  },

  async saveCategory(category: Category): Promise<{ category: Category; supabaseSyncError?: string }> {
    const list = await this.getCategories();
    const existingIndex = list.findIndex(c => c.id === category.id);
    let updated: Category[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = category;
    } else {
      updated = [...list, category];
    }
    safeStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jojo_store_updated', { detail: { type: 'category', id: category.id } }));
    }

    let supabaseSyncError: string | undefined = undefined;
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('categories').upsert(category);
        if (error) {
          console.warn('Supabase upsert category error:', error);
          supabaseSyncError = error.message;
        }
      } catch (e: any) {
        console.warn('Supabase upsert category exception:', e);
        supabaseSyncError = e?.message;
      }
    }
    return { category, supabaseSyncError };
  },

  async deleteCategory(id: string): Promise<void> {
    const list = await this.getCategories();
    const updated = list.filter(c => c.id !== id);
    safeStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jojo_store_updated', { detail: { type: 'category_deleted', id } }));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete category error:', error);
        }
      } catch (e) {
        console.warn('Supabase delete category exception:', e);
      }
    }
  },

  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const sanitizeProducts = (prods: Product[]): Product[] => {
      return prods.map(p => ({
        ...p,
        images: (p.images && p.images.length > 0)
          ? p.images.map(img => ({ ...img, url: resolveImageUrl(img.url) }))
          : [{ id: `img-default-${p.id}`, url: '/images/hero_luxe_collection.jpg', is_primary: true, display_order: 1 }]
      }));
    };

    let localProducts: Product[] = [];
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        localProducts = sanitizeProducts(JSON.parse(stored) as Product[]);
      }
    } catch (_) {}

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const supabaseProducts = sanitizeProducts(data as Product[]);
          const supabaseIdSet = new Set(supabaseProducts.map(p => p.id));
          const localOnly = localProducts.filter(lp => !supabaseIdSet.has(lp.id));

          if (localOnly.length > 0) {
            const combined = [...localOnly, ...supabaseProducts];
            safeStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(combined));
            return combined;
          }

          safeStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(supabaseProducts));
          return supabaseProducts;
        }

        // If table exists but empty, auto-seed initial products into Supabase
        if (!error && (!data || data.length === 0)) {
          for (const prod of INITIAL_PRODUCTS) {
            await supabase.from('products').upsert(prod);
          }
          return INITIAL_PRODUCTS;
        }
      } catch (err) {
        console.warn('Supabase getProducts error:', err);
      }
    }

    if (localProducts.length > 0) {
      return localProducts;
    }

    safeStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.slug === slug) || null;
  },

  async saveProduct(product: Product): Promise<{ product: Product; supabaseSyncError?: string }> {
    const list = await this.getProducts();
    const existingIndex = list.findIndex(p => p.id === product.id);
    let updated: Product[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...product, updated_at: new Date().toISOString() };
    } else {
      updated = [{ ...product, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...list];
    }
    safeStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));

    // Dispatch custom event to notify App.tsx and live storefront components to refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jojo_store_updated', { detail: { type: 'product', id: product.id } }));
    }

    let supabaseSyncError: string | undefined = undefined;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').upsert(product);
        if (error) {
          console.error('Supabase upsert product error:', error);
          if (error.code === '42501') {
            supabaseSyncError = 'Supabase Row-Level Security policy (RLS 42501) prevented cloud storage. Product is saved locally on this browser. Run the provided fix SQL in your Supabase SQL Editor to sync to all devices.';
          } else {
            supabaseSyncError = `Supabase sync error (${error.code || 'database'}): ${error.message}`;
          }
        }
      } catch (err: any) {
        console.error('Supabase upsert exception:', err);
        supabaseSyncError = err?.message || 'Network error while syncing to Supabase';
      }
    }

    return { product, supabaseSyncError };
  },

  async deleteProduct(id: string): Promise<void> {
    const list = await this.getProducts();
    const updated = list.filter(p => p.id !== id);
    safeStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('jojo_store_updated', { detail: { type: 'product_deleted', id } }));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete product error:', error);
        }
      } catch (e) {
        console.warn('Supabase delete product exception:', e);
      }
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as Order[];
        }
      } catch (err) {
        console.warn('Supabase getOrders error:', err);
      }
    }
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
    return [];
  },

  async getOrderByReference(orderReference: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o.order_reference === orderReference) || null;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'order_reference' | 'created_at' | 'updated_at'>): Promise<Order> {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const reference = `JJE-${dateStamp}-${randomSuffix}`;
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      order_reference: reference,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const currentOrders = await this.getOrders();
    const updated = [newOrder, ...currentOrders];
    safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));

    // Update stock quantity for ordered products
    try {
      const products = await this.getProducts();
      for (const item of newOrder.items) {
        const pIndex = products.findIndex(p => p.id === item.product_id);
        if (pIndex >= 0) {
          products[pIndex].stock_quantity = Math.max(0, products[pIndex].stock_quantity - item.quantity);
        }
      }
      safeStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Stock update error', e);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert(newOrder);
      } catch (e) {
        console.warn('Supabase insert order error', e);
      }
    }

    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    orders[index].order_status = status;
    orders[index].updated_at = new Date().toISOString();
    if (notes) {
      orders[index].internal_notes = (orders[index].internal_notes ? orders[index].internal_notes + '\n' : '') + `[${new Date().toLocaleDateString()}] ${notes}`;
    }
    safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ order_status: status, updated_at: orders[index].updated_at, internal_notes: orders[index].internal_notes }).eq('id', id);
      } catch (e) {
        console.warn('Supabase update status error', e);
      }
    }
    return orders[index];
  },

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    orders[index].payment_status = paymentStatus;
    orders[index].updated_at = new Date().toISOString();
    safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ payment_status: paymentStatus, updated_at: orders[index].updated_at }).eq('id', id);
      } catch (e) {
        console.warn('Supabase payment update error', e);
      }
    }
    return orders[index];
  },

  async updateOrderTracking(id: string, trackingNumber: string, carrier: string): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    orders[index].tracking_number = trackingNumber;
    orders[index].carrier = carrier;
    orders[index].order_status = 'shipped';
    orders[index].updated_at = new Date().toISOString();
    safeStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').update({ tracking_number: trackingNumber, carrier, order_status: 'shipped', updated_at: orders[index].updated_at }).eq('id', id);
      } catch (e) {
        console.warn('Supabase tracking update error', e);
      }
    }
    return orders[index];
  },

  // INQUIRIES
  async getInquiries(): Promise<CustomerInquiry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as CustomerInquiry[];
        }
      } catch (err) {
        console.warn('Supabase getInquiries error:', err);
      }
    }
    try {
      const stored = safeStorage.getItem(STORAGE_KEYS.INQUIRIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Storage read error', e);
    }
    return [];
  },

  async createInquiry(inquiryData: Omit<CustomerInquiry, 'id' | 'status' | 'created_at'>): Promise<CustomerInquiry> {
    const newInquiry: CustomerInquiry = {
      ...inquiryData,
      id: 'inq-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      status: 'new',
      created_at: new Date().toISOString(),
    };

    const current = await this.getInquiries();
    const updated = [newInquiry, ...current];
    safeStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('inquiries').insert(newInquiry);
      } catch (e) {
        console.warn('Supabase inquiry insert error', e);
      }
    }
    return newInquiry;
  },

  async updateInquiryStatus(id: string, status: CustomerInquiry['status'], adminNotes?: string): Promise<CustomerInquiry | null> {
    const list = await this.getInquiries();
    const index = list.findIndex(i => i.id === id);
    if (index === -1) return null;

    list[index].status = status;
    if (adminNotes !== undefined) {
      list[index].admin_notes = adminNotes;
    }
    safeStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(list));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('inquiries').update({ status, admin_notes: list[index].admin_notes }).eq('id', id);
      } catch (e) {
        console.warn('Supabase inquiry update error', e);
      }
    }
    return list[index];
  },

  // FILE UPLOAD (Converts local file to Data URL or uploads to Supabase Storage if bucket exists)
  async uploadImage(file: File): Promise<string> {
    if (isSupabaseConfigured && supabase) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          if (data?.publicUrl) return data.publicUrl;
        }
      } catch (err) {
        console.warn('Supabase storage upload failed, falling back to local preview:', err);
      }
    }

    // Direct Base64 / Data URL fallback: guaranteed to work on all phones and desktops without failing
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  },

  // WHATSAPP URL BUILDERS (Strictly without displaying phone number in visible text)
  getWhatsAppGeneralLink(): string {
    const message = `Hello JO JO EFFECTS & CO., I would like to make an inquiry about your products. Please assist me. Thank you.`;
    return buildWhatsAppLink(message);
  },

  getWhatsAppProductLink(productName: string, price: number): string {
    const message = `Hello JO JO EFFECTS & CO., I am interested in ${productName} ($${price.toFixed(2)}). Please confirm availability and provide more information. Thank you.`;
    return buildWhatsAppLink(message);
  },

  getWhatsAppOrderLink(order: Order): string {
    const productSummary = order.items
      .map(i => `${i.product_name} (${i.quantity}x)${i.variant_name ? ` - ${i.variant_name}` : ''}`)
      .join(', ');

    const message = `Hello JO JO EFFECTS & CO., I have placed an order.

Order Reference: ${order.order_reference}
Customer: ${order.customer.full_name}
Products: ${productSummary}
Order Total: $${order.total_amount.toFixed(2)} USD

Please confirm my order and provide any necessary delivery updates.

Thank you.`;

    return buildWhatsAppLink(message);
  }
};
