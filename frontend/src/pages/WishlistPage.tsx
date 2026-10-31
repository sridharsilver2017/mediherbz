import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';

export const WishlistPage: React.FC = () => {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  const handleMoveToCart = (product: any) => {
    addItem(product, product.variations ? product.variations[0] : undefined, 1);
    removeItem(product.id);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">Your Wishlist is Empty</h2>
        <p className="text-sm text-stone-500">Save your favorite Ayurvedic elixirs and oils for later.</p>
        <Link
          to="/shop"
          className="inline-block px-6 py-3 bg-[#18833B] text-white font-bold rounded-xl text-xs hover:bg-[#12632F] transition-all"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-3xl font-black text-[#26352A] font-serif">Saved Wishlist</h1>
          <p className="text-xs text-stone-500 mt-1">{items.length} items saved</p>
        </div>
        <button
          onClick={clearWishlist}
          className="text-xs font-semibold text-stone-400 hover:text-red-500 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div className="relative aspect-square">
              <img
                src={product.images[0]?.src}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeItem(product.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full text-stone-400 hover:text-red-500 shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <Link to={`/product/${product.slug}`}>
                <h3 className="font-bold text-sm text-[#26352A] hover:text-[#18833B] line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black text-[#18833B]">₹{product.price}</span>
                {product.regular_price > product.price && (
                  <span className="text-xs text-stone-400 line-through">₹{product.regular_price}</span>
                )}
              </div>

              <button
                onClick={() => handleMoveToCart(product)}
                className="w-full py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

