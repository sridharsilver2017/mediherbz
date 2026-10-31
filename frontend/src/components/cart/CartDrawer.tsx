import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();

  if (!isOpen) return null;

  const currentSubtotal = subtotal();
  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, (currentSubtotal / freeShippingThreshold) * 100);
  const remainingForFree = freeShippingThreshold - currentSubtotal;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-[#FAF9F2]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#18833B]" />
              <h2 className="text-lg font-bold text-[#26352A]">Your Herbal Cart</h2>
              <span className="bg-[#18833B] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                {items.length}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#12632F]/5 p-3.5 border-b border-[#18833B]/10">
            {remainingForFree > 0 ? (
              <p className="text-xs text-[#12632F] font-medium mb-1.5 text-center">
                Add <span className="font-bold">₹{remainingForFree.toFixed(0)}</span> more for <span className="text-[#F28A13] font-bold">FREE Express Delivery</span>!
              </p>
            ) : (
              <p className="text-xs text-[#18833B] font-bold mb-1.5 text-center flex items-center justify-center gap-1">
                🎉 Congratulations! You have unlocked Free Shipping!
              </p>
            )}
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#18833B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 bg-[#FAF9F2] text-[#18833B] rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-stone-800">Your basket is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our pure Ayurvedic herbs, organic serums, and revitalizing oils.
                </p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="inline-block mt-2 px-6 py-2.5 bg-[#18833B] text-white text-sm font-semibold rounded-xl hover:bg-[#12632F] transition-all"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.variation?.price ?? item.product.price;
                return (
                  <div
                    key={`${item.product.id}-${item.variation?.id || 'none'}`}
                    className="flex gap-4 p-3 rounded-xl border border-stone-100 bg-[#FAF9F2]/40 hover:bg-[#FAF9F2] transition-colors"
                  >
                    <img
                      src={item.product.images[0]?.src}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-[#26352A] line-clamp-1">
                          {item.product.name}
                        </h4>
                        {item.variation && (
                          <p className="text-xs text-stone-500 mt-0.5">
                            {item.variation.name}
                          </p>
                        )}
                        <p className="text-sm font-bold text-[#18833B] mt-1">
                          ₹{itemPrice}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variation?.id)}
                            className="p-1 hover:bg-stone-100 text-stone-600 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id)}
                            className="p-1 hover:bg-stone-100 text-stone-600 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          onClick={() => removeItem(item.product.id, item.variation?.id)}
                          className="text-stone-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="p-5 border-t border-stone-200 bg-white space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{currentSubtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-[#18833B]">
                    {currentSubtotal >= freeShippingThreshold ? 'FREE' : '₹99'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#26352A] pt-2 border-t border-stone-200">
                  <span>Estimated Total</span>
                  <span className="text-[#18833B]">
                    ₹{currentSubtotal >= freeShippingThreshold ? currentSubtotal : currentSubtotal + 99}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="py-3 px-4 border border-stone-300 hover:bg-stone-50 text-stone-700 text-sm font-semibold rounded-xl text-center transition-colors"
                >
                  View Full Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="py-3 px-4 bg-[#18833B] hover:bg-[#12632F] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <p className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1">
                🔒 256-Bit SSL Encrypted Razorpay Checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

