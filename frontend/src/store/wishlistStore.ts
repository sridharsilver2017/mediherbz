import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import { api } from '../api/client';
import { useUserStore } from './userStore';
import { useCartStore } from './cartStore';

interface WishlistStore {
  items: Product[];
  isSyncing: boolean;
  lastSynced: number | null;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  removeItem: (productId: number) => void;
  clearWishlist: () => void;
  syncWithCloud: (explicitEmail?: string) => Promise<void>;
  moveAllToCart: () => number;
}

// Helper to push updated IDs to cloud when customer is signed in
const persistCloudWishlist = (productIds: number[]) => {
  try {
    const user = useUserStore.getState();
    const email = user?.profile?.email;
    if (email && user.isLoggedIn) {
      api.saveCustomerWishlist(email, productIds);
    }
  } catch (err) {
    console.warn('[Wishlist] Could not persist to cloud', err);
  }
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      lastSynced: null,

      toggleWishlist: (product: Product) => {
        const current = get().items;
        const exists = current.some((p) => p.id === product.id);
        const updated = exists
          ? current.filter((p) => p.id !== product.id)
          : [...current, product];

        set({ items: updated });
        persistCloudWishlist(updated.map((p) => p.id));
      },

      isInWishlist: (productId: number) => {
        return get().items.some((p) => p.id === productId);
      },

      removeItem: (productId: number) => {
        const updated = get().items.filter((p) => p.id !== productId);
        set({ items: updated });
        persistCloudWishlist(updated.map((p) => p.id));
      },

      clearWishlist: () => {
        set({ items: [] });
        persistCloudWishlist([]);
      },

      syncWithCloud: async (explicitEmail?: string) => {
        const email = explicitEmail || useUserStore.getState()?.profile?.email;
        if (!email) return;

        set({ isSyncing: true });
        try {
          const remote = await api.getCustomerWishlist(email);
          const currentLocal = get().items;

          // Merge: union of local items and remote items
          const mergedMap = new Map<number, Product>();

          // First populate with remote items (they contain fresh live product prices/stock from WooCommerce)
          if (Array.isArray(remote.items)) {
            remote.items.forEach((p) => mergedMap.set(p.id, p));
          }

          // Then keep any local items that haven't synced yet
          currentLocal.forEach((p) => {
            if (!mergedMap.has(p.id)) {
              mergedMap.set(p.id, p);
            }
          });

          const finalItems = Array.from(mergedMap.values());
          set({
            items: finalItems,
            isSyncing: false,
            lastSynced: Date.now(),
          });

          // If local had new items not yet in remote, push union to cloud
          const finalIds = finalItems.map((p) => p.id);
          if (finalIds.length !== (remote.product_ids?.length || 0)) {
            await api.saveCustomerWishlist(email, finalIds);
          }
        } catch (err) {
          console.warn('[Wishlist] Cloud sync error', err);
          set({ isSyncing: false });
        }
      },

      moveAllToCart: () => {
        const items = get().items;
        if (items.length === 0) return 0;

        const cart = useCartStore.getState();
        let movedCount = 0;
        const remaining: Product[] = [];

        items.forEach((product) => {
          // If in stock, add to cart
          if (product.in_stock) {
            cart.addItem(product, product.variations ? product.variations[0] : undefined, 1);
            movedCount++;
          } else {
            remaining.push(product);
          }
        });

        set({ items: remaining });
        persistCloudWishlist(remaining.map((p) => p.id));
        return movedCount;
      },
    }),
    {
      name: 'mediherbz-wishlist-storage',
    }
  )
);
