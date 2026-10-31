import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const cartSubtotal = subtotal();
  const discountAmount = couponApplied ? Math.round(cartSubtotal * 0.1) : 0;
  const shippingFee = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 99;
  const grandTotal = cartSubtotal - discountAmount + shippingFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'MED10' || coupon.trim().toUpperCase() === 'AYURVEDA') {
      setCouponApplied(true);
    } else {
      alert('Invalid coupon code. Try using MED10 for 10% off!');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#FAF9F2] text-[#18833B] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">Your Herbal Cart is Empty</h2>
        <p className="text-sm text-stone-500">Discover pure botanical oils, face elixirs, and holistic teas.</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#18833B] text-white font-bold rounded-xl text-xs hover:bg-[#12632F] transition-all"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-3xl font-black text-[#26352A] font-serif">Shopping Cart</h1>
          <p className="text-xs text-stone-500 mt-1">{items.length} unique products in your bag</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-stone-400 hover:text-red-500 transition-colors"
        >
          Clear Bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Item Table */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const itemPrice = item.variation?.price ?? item.product.price;
            return (
              <div
                key={`${item.product.id}-${item.variation?.id || 'none'}`}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-5 justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.product.images[0]?.src}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-stone-100 shrink-0"
                  />
                  <div>
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="font-bold text-sm text-[#26352A] hover:text-[#18833B] transition-colors"
                    >
                      {item.product.name}
                    </Link>
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
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 rounded-lg"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id)}
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 rounded-lg"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="hidden sm:inline font-black text-sm text-stone-900 w-20 text-right">
                    ₹{itemPrice * item.quantity}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.product.id, item.variation?.id)}
                    className="text-stone-400 hover:text-red-500 p-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-[#26352A] border-b border-stone-100 pb-3">
              Order Calculation
            </h2>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Promo Code (try MED10)"
                className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-hidden uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-stone-800 hover:bg-black text-white text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </form>

            {couponApplied && (
              <p className="text-xs text-emerald-700 font-bold">
                ✓ Coupon MED10 Applied (10% Discount)
              </p>
            )}

            <div className="border-t border-stone-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Cart Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
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

            <Link
              to="/checkout"
              className="w-full py-4 bg-[#18833B] hover:bg-[#12632F] text-white font-black rounded-2xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-[#18833B]" />
              <span>Safe &amp; Encrypted Checkout Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

