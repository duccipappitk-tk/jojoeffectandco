export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  name: string; // e.g. "Length: 26 inch" or "Color: Gold / Black"
  sku?: string;
  price_adjustment: number;
  stock_quantity: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  specifications: Record<string, string>;
  base_price: number;
  sale_price?: number | null;
  stock_quantity: number;
  is_published: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'on_hold';

export type PaymentMethod = 'cashapp' | 'venmo' | 'zelle' | 'paypal';

export type PaymentStatus = 'pending' | 'awaiting_verification' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  variant_name?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

export interface OrderCustomer {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  delivery_instructions?: string;
}

export interface Order {
  id: string;
  order_reference: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  tracking_number?: string;
  carrier?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export type InquiryType = 'product_inquiry' | 'order_inquiry' | 'delivery_inquiry' | 'general_inquiry';
export type InquiryStatus = 'new' | 'in_progress' | 'responded' | 'resolved';

export interface CustomerInquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  inquiry_type: InquiryType;
  message: string;
  product_id?: string;
  product_name?: string;
  order_reference?: string;
  status: InquiryStatus;
  admin_notes?: string;
  created_at: string;
}

export interface SiteSettings {
  business_name: string;
  tagline: string;
  business_location: string;
  business_contact_number: string;
  whatsapp_number: string; // Used strictly internally, NEVER rendered publicly in text
  currency_code: string;
  currency_symbol: string;
  announcement_bar: {
    enabled: boolean;
    text: string;
    link_url: string;
  };
  hero_section: {
    enabled: boolean;
    headline: string;
    description: string;
    primary_button_text: string;
    primary_button_link: string;
    secondary_button_text: string;
    secondary_button_link: string;
    image_url: string;
  };
  about_us: {
    heading: string;
    content: string;
    mission: string;
  };
  social_links: {
    facebook: string;
    instagram: string;
    tiktok: string;
  };
  payment_methods: {
    cashapp: {
      enabled: boolean;
      identifier: string; // e.g. $JoJoEffects
      instructions: string;
    };
    venmo: {
      enabled: boolean;
      identifier: string; // e.g. @JoJoEffects
      instructions: string;
    };
    zelle: {
      enabled: boolean;
      identifier: string; // e.g. payments@jojoeffects.com or (605) 900-8992
      instructions: string;
    };
    paypal: {
      enabled: boolean;
      identifier: string; // e.g. paypal.me/jojoeffects
      instructions: string;
    };
  };
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin';
}
