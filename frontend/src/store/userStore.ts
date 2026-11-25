import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, SavedAddress, Order } from '../types';

interface UserStore {
  profile: UserProfile | null;
  savedAddresses: SavedAddress[];
  orders: Order[];
  isLoggedIn: boolean;

  // Actions
  login: (data: {
    email: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    dosha?: 'Vata' | 'Pitta' | 'Kapha' | 'Tridoshic' | 'Unknown';
    member_since?: string;
    wellness_goal?: string;
    savedAddresses?: SavedAddress[];
  }) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Omit<SavedAddress, 'id'>) => SavedAddress;
  updateAddress: (id: string, address: Partial<SavedAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => SavedAddress | undefined;
  addOrder: (order: Order) => void;
  setOrders: (orders: Order[]) => void;
  syncOrders: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      savedAddresses: [],
      orders: [],
      isLoggedIn: false,

      login: (data) => {
        const addresses = data.savedAddresses && data.savedAddresses.length > 0
          ? data.savedAddresses
          : get().savedAddresses;

        set(() => ({
          isLoggedIn: true,
          profile: {
            first_name: data.first_name || 'Ayurvedic',
            last_name: data.last_name || '',
            email: data.email,
            phone: data.phone || '',
            dosha: (data.dosha as any) || 'Tridoshic',
            member_since: data.member_since || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            wellness_goal: data.wellness_goal || 'Holistic Herbal Wellness',
          },
          savedAddresses: addresses,
        }));

        // Trigger background sync for live orders and cloud wishlist
        get().syncOrders();
        import('./wishlistStore').then(({ useWishlistStore }) => {
          useWishlistStore.getState().syncWithCloud(data.email);
        });
      },

      logout: () => {
        set({
          isLoggedIn: false,
          profile: null,
          orders: [],
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

      syncOrders: async () => {
        const profile = get().profile;
        if (!profile?.email && !profile?.phone) return;
        try {
          const { api } = await import('../api/client');
          const liveOrders = await api.getCustomerOrders(profile.email || profile.phone);
          if (Array.isArray(liveOrders)) {
            set({ orders: liveOrders });
          }
        } catch (err) {
          console.warn('[UserStore] Could not sync live customer orders', err);
        }
      },
    }),
    {
      name: 'mediherbz-customer-storage',
    }
  )
);

