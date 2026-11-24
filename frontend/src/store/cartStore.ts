import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductVariation, CouponDiscount } from '../types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  appliedCoupon: CouponDiscount | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, variation?: ProductVariation, quantity?: number) => void;
  removeItem: (productId: number, variationId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variationId?: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: CouponDiscount) => void;
  removeCoupon: () => void;
  totalItems: () => number;
  subtotal: () => number;
  getDiscountAmount: () => number;
  getShippingFee: () => number;
  getGrandTotal: () => number;
  getFreeShippingRemaining: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,
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

      clearCart: () => set({ items: [], appliedCoupon: null }),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => {
          const unitPrice = item.variation?.price ?? item.product.price;
          return sum + unitPrice * item.quantity;
        }, 0);
      },

      getDiscountAmount: () => {
        const coupon = get().appliedCoupon;
        if (!coupon) return 0;
        const sub = get().subtotal();
        return Math.min(coupon.discount_amt, sub);
      },

      getShippingFee: () => {
        const sub = get().subtotal();
        if (sub === 0) return 0;
        if (get().appliedCoupon?.free_shipping) return 0;
        return sub >= 999 ? 0 : 99;
      },

      getGrandTotal: () => {
        const sub = get().subtotal();
        if (sub === 0) return 0;
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingFee();
        return Math.max(0, sub - discount + shipping);
      },

      getFreeShippingRemaining: () => {
        const sub = get().subtotal();
        return Math.max(0, 999 - sub);
      },
    }),
    {
      name: 'mediherbz-cart-storage',
    }
  )
);

