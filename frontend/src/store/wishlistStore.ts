import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface WishlistStore {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  removeItem: (productId: number) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product: Product) => {
        const current = get().items;
        const exists = current.some((p) => p.id === product.id);
        if (exists) {
          set({ items: current.filter((p) => p.id !== product.id) });
        } else {
          set({ items: [...current, product] });
        }
      },
      isInWishlist: (productId: number) => {
        return get().items.some((p) => p.id === productId);
      },
      removeItem: (productId: number) => {
        set((state) => ({ items: state.items.filter((p) => p.id !== productId) }));
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'mediherbz-wishlist-storage',
    }
  )
);

