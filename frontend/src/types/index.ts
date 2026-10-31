export interface HerbalProductFields {
  botanical_name?: string;
  common_name?: string;
  ingredients?: string[];
  composition?: string;
  product_origin?: string;
  product_form?: string; // Oil, Powder, Capsule, Tea, Cream
  net_quantity?: string; // e.g. "100ml", "50g"
  directions_for_use?: string;
  recommended_usage?: string;
  storage_instructions?: string;
  precautions?: string;
  allergen_info?: string;
  manufacturer?: string;
  country_of_origin?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  batch_number?: string;
  licence_number?: string;
  certifications?: string[]; // e.g. ['GMP Certified', 'AYUSH Premium Mark', '100% Organic', 'Cruelty Free']
  testing_documentation?: string;
  product_information_pdf?: string;
}

export interface ProductVariation {
  id: number;
  name: string;
  price: number;
  regular_price: number;
  sale_price?: number;
  in_stock: boolean;
  stock_quantity: number;
  attributes: { [key: string]: string }; // e.g. { size: "100ml" }
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  price: number;
  regular_price: number;
  sale_price?: number;
  on_sale: boolean;
  discount_percentage?: number;
  short_description: string;
  description: string;
  categories: { id: number; name: string; slug: string }[];
  tags?: { id: number; name: string; slug: string }[];
  images: { id: number; src: string; alt: string }[];
  rating: number;
  rating_count: number;
  in_stock: boolean;
  stock_quantity: number;
  sku: string;
  type: 'simple' | 'variable' | 'bundle' | 'grouped';
  variations?: ProductVariation[];
  herbal_fields: HerbalProductFields;
  featured?: boolean;
  bestseller?: boolean;
  new_arrival?: boolean;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  image?: string;
  parent?: number;
}

export interface BrandSettings {
  brand_name: string;
  tagline: string;
  logo_url: string;
  logo_footer_url: string;
  favicon_url: string;
  primary_color: string;
  deep_green: string;
  lime_color: string;
  orange_color: string;
  cream_bg: string;
  contact_email: string;
  support_phone: string;
  address: string;
  currency: string;
  currency_symbol: string;
  social_links: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    whatsapp?: string;
  };
  announcement_bar: {
    enabled: boolean;
    text: string;
    link?: string;
  };
}

export interface CartItem {
  product: Product;
  variation?: ProductVariation;
  quantity: number;
}

export interface OrderAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  subtotal: number;
  total: number;
  image?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  currency: string;
  total: number;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  tax_total: number;
  date_created: string;
  billing: OrderAddress;
  shipping: OrderAddress;
  items: OrderItem[];
  tracking_id?: string;
  tracking_url?: string;
  shipping_carrier?: string;
  payment_method: string;
  payment_method_title: string;
  is_paid: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  read_time: string;
}

