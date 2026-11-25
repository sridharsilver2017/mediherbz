import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Trash2,
  ShoppingBag,
  CloudCheck,
  Share2,
  Check,
  Sparkles,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';

export const WishlistPage: React.FC = () => {
  const { items, removeItem, clearWishlist, isSyncing, syncWithCloud, moveAllToCart } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { isLoggedIn, profile } = useUserStore();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-sync with cloud if customer is logged in
  useEffect(() => {
    if (isLoggedIn && profile?.email) {
      syncWithCloud(profile.email);
    }
  }, [isLoggedIn, profile?.email, syncWithCloud]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMoveToCart = (product: any) => {
    if (!product.in_stock && product.in_stock !== undefined) {
      showToast(`"${product.name}" is currently out of stock.`);
      return;
    }
    addItem(product, product.variations ? product.variations[0] : undefined, 1);
    removeItem(product.id);
    showToast(`Added "${product.name}" to your herbal cart.`);
  };

  const handleMoveAllToCart = () => {
    const moved = moveAllToCart();
    if (moved > 0) {
      showToast(`Successfully moved ${moved} in-stock item${moved > 1 ? 's' : ''} to your cart!`);
      openCart();
    } else {
      showToast('All items in your wishlist are currently out of stock or cart already updated.');
    }
  };

  const handleShareWishlist = () => {
    const title = 'My Ayurvedic Wishlist on Mediherbz:';
    const itemsList = items.map((p, idx) => `${idx + 1}. ${p.name} (₹${p.price})`).join('\n');
    const url = 'https://mediherbz.pages.dev/wishlist';
    const shareText = `${title}\n${itemsList}\n\nExplore pure herbal formulations: ${url}`;

    // WhatsApp Direct Share
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Wishlist link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-20 h-20 bg-emerald-50 text-[#18833B] rounded-3xl flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
          <Heart className="w-10 h-10 text-[#18833B]" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-[#26352A] font-serif">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
            Explore our clinically backed, 100% organic Ayurvedic oils, Himalayan Shilajit, and wellness elixirs.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-800/15 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <span>Explore Pure Formulations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const inStockCount = items.filter((p) => p.in_stock !== false).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-[#122A1E] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-emerald-500/30 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cloud Sync Status Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          {isLoggedIn ? (
            <>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#18833B] flex items-center justify-center shrink-0">
                <CloudCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-stone-900 block leading-tight">
                  Cloud Synced Account
                </span>
                <span className="text-[11px] text-stone-400">
                  Your wishlist is backed up live for <strong className="text-stone-600">{profile?.email}</strong>
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-stone-900 block leading-tight">
                  Local Session Wishlist
                </span>
                <span className="text-[11px] text-stone-400">
                  Items are saved in this browser.{' '}
                  <Link to="/account" className="text-[#18833B] font-bold underline hover:text-[#12632F]">
                    Sign in
                  </Link>{' '}
                  to sync across all your phones and laptops.
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {isLoggedIn && (
            <button
              onClick={() => profile?.email && syncWithCloud(profile.email)}
              disabled={isSyncing}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              title="Refresh and sync wishlist with WordPress database"
            >
              <RefreshCw className={`w-3 h-3 text-[#18833B] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
          <button
            onClick={handleShareWishlist}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#18833B] border border-emerald-200/80 rounded-lg text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Share via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Header & Batch Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/90 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#26352A] font-serif">
              My Saved Formulations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-[#18833B]">
              {items.length}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            {inStockCount} of {items.length} items currently in stock and ready for immediate dispatch
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {inStockCount > 0 && (
            <button
              onClick={handleMoveAllToCart}
              className="px-4 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Move All In-Stock to Cart ({inStockCount})</span>
            </button>
          )}

          <button
            onClick={clearWishlist}
            className="px-3.5 py-2.5 bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Dynamic Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((product) => {
          const inStock = product.in_stock !== false;
          const discountPct = product.regular_price > product.price
            ? Math.round(((product.regular_price - product.price) / product.regular_price) * 100)
            : 0;
          const botanical = product.herbal_fields?.botanical_name;

          return (
            <div
              key={product.id}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-200/80 transition-all flex flex-col justify-between group"
            >
              {/* Product Thumbnail & Overlay Badges */}
              <div className="relative aspect-square bg-[#FBFBFA] overflow-hidden">
                <Link to={`/product/${product.slug}`} className="block w-full h-full">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0].src : '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </Link>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  {discountPct > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F28A13] text-white shadow-xs">
                      {discountPct}% OFF
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs ${
                      inStock
                        ? 'bg-emerald-100/90 text-[#18833B] backdrop-blur-xs'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Remove from Wishlist Button */}
                <button
                  type="button"
                  onClick={() => removeItem(product.id)}
                  className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
                  title="Remove from Wishlist"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info & Actions */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  {botanical && (
                    <span className="text-[10px] text-stone-400 italic block line-clamp-1 font-serif">
                      {botanical}
                    </span>
                  )}

                  <Link to={`/product/${product.slug}`}>
                    <h3 className="font-bold text-sm text-[#26352A] group-hover:text-[#18833B] transition-colors line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                  </Link>
                </div>

                {/* Price Display */}
                <div className="pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-[#18833B]">
                      ₹{product.price}
                    </span>
                    {product.regular_price > product.price && (
                      <span className="text-xs text-stone-400 line-through">
                        ₹{product.regular_price}
                      </span>
                    )}
                  </div>
                  {product.regular_price > product.price && (
                    <span className="text-[10px] font-bold text-amber-600 block">
                      Save ₹{product.regular_price - product.price}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(product)}
                    disabled={!inStock}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer ${
                      inStock
                        ? 'bg-[#18833B] hover:bg-[#12632F] text-white'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{inStock ? 'Move to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
