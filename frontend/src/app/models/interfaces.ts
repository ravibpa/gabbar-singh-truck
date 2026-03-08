// ============================================================
// GABBAR SINGH TRUCK - TypeScript Interfaces
// ============================================================

export interface MenuCategory {
  id: string;
  name: string;
  type: 'north' | 'south' | 'special';
  description?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  category?: MenuCategory;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_vegetarian: boolean;
  spice_level: 1 | 2 | 3 | 4 | 5;
  is_available: boolean;
  is_featured: boolean;
  is_special: boolean;
  allergens?: string[];
  tags?: string[];
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;           // unique cart item ID
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  is_vegetarian: boolean;
  special_instructions?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id?: string;
  order_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  order_type: 'delivery' | 'pickup';
  delivery_address?: DeliveryAddress;
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  delivery_fee?: number;
  discount?: number;
  total: number;
  stripe_payment_intent_id?: string;
  stripe_payment_status?: string;
  promo_code?: string;
  notes?: string;
  items: OrderItem[];
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id?: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  expires_at?: string;
}

export interface SiteSettings {
  business_info: {
    name: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    instagram: string;
    facebook: string;
    twitter: string;
  };
  hours: {
    [day: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  delivery_settings: {
    delivery_fee: number;
    free_delivery_above: number;
    tax_rate: number;
    min_order_delivery: number;
    estimated_pickup_time: number;
    estimated_delivery_time: number;
  };
  hero_content: {
    headline: string;
    subheadline: string;
    description: string;
    cta_primary: string;
    cta_secondary: string;
  };
}

export interface SiteOffer {
  id?: string;
  title: string;
  description?: string;
  badge_text: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  applies_to: 'all' | 'pickup' | 'delivery';
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  order_type: 'delivery' | 'pickup';
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  promo_code?: string;
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
}

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  icon: string;
}

export type SpiceLevel = 1 | 2 | 3 | 4 | 5;
export type MenuType = 'north' | 'south' | 'special' | 'all';
