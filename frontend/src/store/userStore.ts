import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, SavedAddress, Order } from '../types';

interface UserStore {
  profile: UserProfile | null;
  savedAddresses: SavedAddress[];
  orders: Order[];
  isLoggedIn: boolean;

  // Actions
  login: (data: { email: string; phone?: string; first_name?: string; last_name?: string }) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Omit<SavedAddress, 'id'>) => SavedAddress;
  updateAddress: (id: string, address: Partial<SavedAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => SavedAddress | undefined;
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
}

const DEFAULT_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr_default_1',
    title: 'Home Address',
    first_name: 'Rahul',
    last_name: 'Sharma',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    address_1: 'Flat 402, Lotus Residency, Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postcode: '560038',
    country: 'India',
    is_default: true,
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 10482,
    order_number: 'MED-748921',
    status: 'completed',
    currency: 'INR',
    total: 1250,
    subtotal: 1250,
    shipping_total: 0,
    discount_total: 0,
    tax_total: 0,
    date_created: 'Nov 18, 2026',
    billing: {
      first_name: 'Rahul',
      last_name: 'Sharma',
      email: 'rahul.sharma@example.com',
      phone: '9876543210',
      address_1: 'Flat 402, Lotus Residency, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postcode: '560038',
      country: 'India',
    },
    shipping: {
      first_name: 'Rahul',
      last_name: 'Sharma',
      email: 'rahul.sharma@example.com',
      phone: '9876543210',
      address_1: 'Flat 402, Lotus Residency, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postcode: '560038',
      country: 'India',
    },
    items: [
      {
        id: 1,
        product_id: 17,
        name: 'Kumkumadi Radiance Youth Elixir Serum',
        quantity: 1,
        subtotal: 1250,
        total: 1250,
        image: 'https://dev-medinerbz.pantheonsite.io/wp-content/uploads/2026/11/product-kumkumadi-radiance-elixir.jpg',
      },
    ],
    shipping_carrier: 'BlueDart Express',
    tracking_id: 'BD-847291039IN',
    payment_method: 'razorpay',
    payment_method_title: 'Razorpay (UPI - Google Pay)',
    is_paid: true,
  },
];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: {
        first_name: 'Rahul',
        last_name: 'Sharma',
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
        dosha: 'Pitta',
        wellness_goal: 'Radiant Skin & Deep Restorative Hair Vitality',
      },
      savedAddresses: DEFAULT_ADDRESSES,
      orders: DEFAULT_ORDERS,
      isLoggedIn: true,

      login: (data) => {
        set((state) => ({
          isLoggedIn: true,
          profile: {
            first_name: data.first_name || state.profile?.first_name || 'Ayurvedic',
            last_name: data.last_name || state.profile?.last_name || 'Customer',
            email: data.email,
            phone: data.phone || state.profile?.phone || '',
            dosha: state.profile?.dosha || 'Tridoshic',
            wellness_goal: state.profile?.wellness_goal || 'Holistic Herbal Wellness',
          },
        }));
      },

      logout: () => {
        set({
          isLoggedIn: false,
          profile: null,
        });
      },

      updateProfile: (data) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...data } : (data as UserProfile),
        }));
      },

      addAddress: (address) => {
        const newAddress: SavedAddress = {
          ...address,
          id: `addr_${Date.now()}`,
          is_default: address.is_default || get().savedAddresses.length === 0,
        };
        set((state) => {
          const list = address.is_default
            ? state.savedAddresses.map((a) => ({ ...a, is_default: false }))
            : [...state.savedAddresses];
          return { savedAddresses: [...list, newAddress] };
        });
        return newAddress;
      },

      updateAddress: (id, updated) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.map((a) => {
            if (a.id === id) {
              return { ...a, ...updated };
            }
            if (updated.is_default) {
              return { ...a, is_default: false };
            }
            return a;
          }),
        }));
      },

      deleteAddress: (id) => {
        set((state) => {
          const filtered = state.savedAddresses.filter((a) => a.id !== id);
          if (filtered.length > 0 && !filtered.some((a) => a.is_default)) {
            filtered[0].is_default = true;
          }
          return { savedAddresses: filtered };
        });
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          savedAddresses: state.savedAddresses.map((a) => ({
            ...a,
            is_default: a.id === id,
          })),
        }));
      },

      getDefaultAddress: () => {
        const addresses = get().savedAddresses;
        return addresses.find((a) => a.is_default) || addresses[0];
      },

      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders.filter((o) => o.order_number !== order.order_number)],
        }));
      },

      setOrders: (orders) => {
        set({ orders });
      },
    }),
    {
      name: 'mediherbz-customer-storage',
    }
  )
);
