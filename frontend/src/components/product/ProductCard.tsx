import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [addedAnimation, setAddedAnimation] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.variations ? product.variations[0] : undefined, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#18833B]/30 transition-all duration-300 flex flex-col h-full">
      {/* Badge Tags */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discount_percentage && product.discount_percentage > 0 && (
          <span className="bg-[#F28A13] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-xs">
            {product.discount_percentage}% OFF
          </span>
        )}
        {product.bestseller && (
          <span className="bg-[#12632F] text-[#A6C928] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Bestseller
          </span>
        )}
        {product.new_arrival && (
          <span className="bg-[#A6C928] text-[#12632F] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            New
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-all shadow-sm ${
          isFavorited ? 'text-red-500 bg-red-50' : 'text-stone-400 hover:text-red-500 hover:scale-110'
        }`}
        aria-label="Save to wishlist"
      >
        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-stone-100">
        <img
          src={product.images[0]?.src}
          alt={product.images[0]?.alt || product.name}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Category Pill Over Image */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[11px] font-semibold bg-white/90 backdrop-blur-md text-[#18833B] px-2.5 py-1 rounded-lg">
            {product.categories[0]?.name || 'Herbal'}
          </span>
        </div>
      </Link>

      {/* Product Details Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Star Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-stone-700">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-stone-400">({product.rating_count})</span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="font-bold text-sm sm:text-base text-[#26352A] group-hover:text-[#18833B] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Botanical subtitle */}
          {product.herbal_fields.botanical_name && (
            <p className="text-[11px] text-[#5C6E61] italic line-clamp-1 mt-1">
              {product.herbal_fields.botanical_name}
            </p>
          )}

          {/* Form & Quantity Badge */}
          <div className="flex items-center gap-2 mt-2">
            {product.herbal_fields.net_quantity && (
              <span className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                {product.herbal_fields.net_quantity}
              </span>
            )}
            {product.herbal_fields.product_form && (
              <span className="text-[11px] bg-[#18833B]/10 text-[#18833B] px-2 py-0.5 rounded-md font-medium">
                {product.herbal_fields.product_form}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-black text-[#18833B]">
                ₹{product.price}
              </span>
              {product.regular_price > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.regular_price}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer ${
              addedAnimation
                ? 'bg-[#A6C928] text-[#12632F]'
                : 'bg-[#18833B] hover:bg-[#12632F] text-white hover:shadow-md'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

