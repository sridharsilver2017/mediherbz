import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Tag, Check, Sparkles, Plus, Truck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { api } from '../api/client';
import { Product } from '../types';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getDiscountAmount,
    getShippingFee,
    getGrandTotal,
    getFreeShippingRemaining,
    addItem,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const cartSubtotal = subtotal();
  const discountAmount = getDiscountAmount();
  const shippingFee = getShippingFee();
  const grandTotal = getGrandTotal();
  const freeShippingRemaining = getFreeShippingRemaining();
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / 999) * 100));

  // Load recommended products not currently in cart
  useEffect(() => {
    api.getProducts().then((prods) => {
      const itemIds = new Set(items.map((i) => i.product.id));
      const unadded = prods.filter((p) => !itemIds.has(p.id));
      setRecommendedProducts(unadded.slice(0, 3));
    });
  }, [items]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await api.validateCoupon(code, cartSubtotal);
      applyCoupon(res);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code. Try MED10');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-stone-100 text-[#18833B] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#26352A] font-serif">Your Herbal Cart is Empty</h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Discover our cold-pressed botanical hair oils, youth elixirs, organic ashwagandha, and therapeutic wellness teas.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-2xl text-sm transition-all shadow-md hover:shadow-lg"
        >
          <span>Explore Botanical Shop</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Your Selection</span>
          <h1 className="text-3xl font-black text-[#26352A] font-serif mt-0.5">Shopping Cart</h1>
          <p className="text-xs text-stone-500 mt-1">{items.length} unique formulation{items.length > 1 ? 's' : ''} in your cart</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Meter */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#18833B]/20 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#26352A] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#18833B]" />
            {freeShippingRemaining > 0 ? (
              <>
                Add <strong className="text-[#18833B]">₹{freeShippingRemaining}</strong> more to unlock <strong className="text-[#18833B]">FREE Express Shipping</strong>!
              </>
            ) : (
              <span className="text-[#18833B] flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-[#18833B]" /> Congratulations! You unlocked FREE Express Shipping
              </span>
            )}
          </span>
          <span className="font-bold text-stone-500">{freeShippingProgress}%</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#18833B] to-[#A6C928] h-full rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Item Table */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const itemPrice = item.variation?.price ?? item.product.price;
            return (
              <div
                key={`${item.product.id}-${item.variation?.id || 'none'}`}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-5 justify-between transition-all hover:border-stone-300"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.product.images[0]?.src}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-stone-50 shrink-0 border border-stone-100"
                  />
                  <div>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="font-bold text-sm text-[#26352A] hover:text-[#18833B] transition-colors line-clamp-1"
                    >
                      {item.product.name}
                    </Link>
                    {item.product.herbal_fields?.botanical_name && (
                      <p className="text-[11px] text-stone-400 italic mt-0.5 line-clamp-1">
                        {item.product.herbal_fields.botanical_name}
                      </p>
                    )}
                    {item.variation && (
                      <p className="text-xs text-stone-500 mt-0.5">{item.variation.name}</p>
                    )}
                    <p className="text-xs font-bold text-[#18833B] sm:hidden mt-1">₹{itemPrice}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8">
                  {/* Quantity Control */}
                  <div className="flex items-center border border-stone-200 rounded-xl bg-white p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variation?.id)}
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id)}
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="hidden sm:inline font-black text-sm text-stone-900 w-24 text-right">
                    ₹{itemPrice * item.quantity}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.product.id, item.variation?.id)}
                    className="text-stone-400 hover:text-red-500 p-2 transition-colors cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Continue Shopping Link */}
          <div className="pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#18833B] hover:text-[#12632F]"
            >
              ← Continue Shopping for More Herbs
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-[#26352A] border-b border-stone-100 pb-3">
              Order Calculation
            </h2>

            {/* Promo Code Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 block">Have a Promo Code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code (e.g. MED10)"
                  className="flex-1 px-3.5 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B] uppercase"
                />
                <button
                  type="button"
                  disabled={couponLoading || !couponInput.trim()}
                  onClick={() => handleApplyCoupon()}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-red-500">{couponError}</p>
              )}

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> {appliedCoupon.code} Applied
                    </span>
                    <p className="text-[11px] text-emerald-600 mt-0.5">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-red-500 text-xs font-semibold underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="pt-1 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-stone-400">Available:</span>
                  <button
                    onClick={() => handleApplyCoupon('MED10')}
                    className="text-[11px] bg-stone-100 hover:bg-[#FAF9F2] hover:text-[#18833B] hover:border-[#18833B] text-stone-700 font-semibold px-2 py-0.5 rounded-md border border-stone-200 transition-all cursor-pointer"
                  >
                    MED10 (10% OFF)
                  </button>
                  <button
                    onClick={() => handleApplyCoupon('AYURVEDA')}
                    className="text-[11px] bg-stone-100 hover:bg-[#FAF9F2] hover:text-[#18833B] hover:border-[#18833B] text-stone-700 font-semibold px-2 py-0.5 rounded-md border border-stone-200 transition-all cursor-pointer"
                  >
                    AYURVEDA (15% OFF)
                  </button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-stone-100 pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-800">₹{cartSubtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Savings</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Shipping Delivery</span>
                <span className="text-[#18833B] font-semibold">
                  {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-[#26352A] pt-3 border-t border-stone-200">
                <span>Order Total</span>
                <span className="text-[#18833B]">₹{grandTotal}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <Link
              to="/checkout"
              className="w-full py-4 bg-[#18833B] hover:bg-[#12632F] text-white font-black rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-[#18833B]" />
              <span>Safe &amp; Encrypted Ayurvedic Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together / Quick Upsell Carousel */}
      {recommendedProducts.length > 0 && (
        <div className="pt-8 border-t border-stone-200 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F28A13]" />
            <h3 className="font-bold text-base text-[#26352A]">Frequently Bought Together</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recommendedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={p.images[0]?.src}
                    alt={p.name}
                    className="w-14 h-14 object-cover rounded-xl bg-stone-50 border border-stone-100"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-[#26352A] line-clamp-1">{p.name}</h4>
                    <p className="text-xs font-black text-[#18833B] mt-0.5">₹{p.price}</p>
                  </div>
                </div>
                <button
                  onClick={() => addItem(p)}
                  className="px-3 py-1.5 bg-[#FAF9F2] hover:bg-[#18833B] text-[#18833B] hover:text-white border border-[#18833B]/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
