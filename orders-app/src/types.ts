export interface OrderCustomer {
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  total: number;
  sku?: string;
  image?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed' | string;
  total: number;
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  currency: string;
  date_created: string;
  customer: OrderCustomer;
  items: OrderItem[];
  item_count: number;
  shipping_carrier: string;
  tracking_id: string;
  tracking_url: string;
  payment_method: string;
  payment_method_title: string;
  is_paid: boolean;
  customer_note?: string;
}

export interface OrdersStats {
  total_count: number;
  processing: number;
  completed: number;
  on_hold: number;
  cancelled: number;
  total_rev: number;
  cod_count: number;
  online_count: number;
}
