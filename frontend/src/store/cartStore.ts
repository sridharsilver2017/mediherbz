import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariation } from '../types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variation?: ProductVariation, quantity?: number) => void;
  removeItem: (productId: number, variationId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variationId?: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      addItem: (product: Product, variation?: ProductVariation, quantity: number = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => {
            if (variation) {
              return item.product.id === product.id && item.variation?.id === variation.id;
            }
            return item.product.id === product.id && !item.variation;
          });

          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated, isOpen: true };
          }

          return {
            items: [...state.items, { product, variation, quantity }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId: number, variationId?: number) => {
        set((state) => ({
          items: state.items.filter((item) => {
            if (variationId) {
              return !(item.product.id === productId && item.variation?.id === variationId);
            }
            return item.product.id !== productId;
          }),
        }));
      },

      updateQuantity: (productId: number, quantity: number, variationId?: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, variationId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            const match = variationId
              ? item.product.id === productId && item.variation?.id === variationId
              : item.product.id === productId && !item.variation;
            return match ? { ...item, quantity } : item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => {
          const unitPrice = item.variation?.price ?? item.product.price;
          return sum + unitPrice * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'mediherbz-cart-storage',
    }
  )
);

