import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingBag, Check, Leaf } from 'lucide-react';
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
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.variations ? product.variations[0] : undefined, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discountAmount =
    product.regular_price > product.price ? product.regular_price - product.price : 0;

  return (
    <div className="group relative bg-white rounded-3xl border border-stone-200/80 hover:border-[#18833B]/40 overflow-hidden shadow-xs hover:shadow-[0_12px_28px_rgba(24,131,59,0.09)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Product Image Section with Padded Frame */}
      <div className="relative p-2.5 sm:p-3 bg-gradient-to-b from-[#FAF9F2] to-stone-50">
        <Link
          to={`/product/${product.slug}`}
          className="block relative aspect-square overflow-hidden rounded-2xl bg-white shadow-inner"
        >
          {/* Primary Image */}
          <img
            src={product.images[0]?.src}
            alt={product.images[0]?.alt || product.name}
            className={`w-full h-full object-cover transition-all duration-500 ease-out ${
              hasMultipleImages
                ? 'group-hover:opacity-0 group-hover:scale-105'
                : 'group-hover:scale-106'
            }`}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.includes('wp.com/')) {
                target.src = target.src.replace(/https?:\/\/i\d\.wp\.com\//, 'https://');
              }
            }}
          />

          {/* Secondary Hover Image (if available) */}
          {hasMultipleImages && (
            <img
              src={product.images[1].src}
              alt={product.images[1].alt || product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-500 ease-out"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes('wp.com/')) {
                  target.src = target.src.replace(/https?:\/\/i\d\.wp\.com\//, 'https://');
                }
              }}
            />
          )}
        </Link>

        {/* Floating Badges (Top Left) */}
        <div className="absolute top-4.5 left-4.5 z-10 flex flex-col items-start gap-1.5 pointer-events-none">
          {product.discount_percentage && product.discount_percentage > 0 && (
            <span className="bg-[#F28A13] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
              {product.discount_percentage}% OFF
            </span>
          )}
          {product.bestseller && (
            <span className="bg-[#12632F]/90 backdrop-blur-xs text-[#A6C928] text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Bestseller
            </span>
          )}
          {product.new_arrival && (
            <span className="bg-[#A6C928] text-[#12632F] text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-4.5 right-4.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer ${
            isFavorited
              ? 'text-rose-500 bg-rose-50/90 shadow-rose-100'
              : 'text-stone-400 hover:text-rose-500 hover:scale-110'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 transition-transform ${isFavorited ? 'fill-current scale-110' : ''}`} />
        </button>
      </div>

      {/* Product Details Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Star Rating Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-[#18833B]">
              {product.categories[0]?.name || 'Ayurvedic Care'}
            </span>

            {/* Rating Pill */}
            <div className="flex items-center gap-1 bg-amber-50/90 px-2 py-0.5 rounded-md border border-amber-200/50 text-[11px] font-bold text-amber-900">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-stone-400 font-normal">({product.rating_count})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block group/title">
            <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover/title:text-[#18833B] transition-colors leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Botanical Name with Leaf Icon */}
          {product.herbal_fields.botanical_name ? (
            <p className="text-[11px] text-[#5C6E61] italic line-clamp-1 mt-1 flex items-center gap-1">
              <Leaf className="w-3 h-3 text-[#18833B] shrink-0" />
              <span>{product.herbal_fields.botanical_name}</span>
            </p>
          ) : product.short_description ? (
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-1">
              {product.short_description}
            </p>
          ) : null}

          {/* Herbal Form & Net Quantity Pills */}
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            {product.herbal_fields.net_quantity && (
              <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                {product.herbal_fields.net_quantity}
              </span>
            )}
            {product.herbal_fields.product_form && (
              <span className="text-[10px] bg-[#18833B]/10 text-[#18833B] px-2 py-0.5 rounded-md font-semibold">
                {product.herbal_fields.product_form}
              </span>
            )}
            {product.in_stock && (
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium ml-auto">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Full-Width Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <div className="flex items-baseline justify-between mb-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-black text-[#18833B]">
                ₹{product.price}
              </span>
              {product.regular_price > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  ₹{product.regular_price}
                </span>
              )}
            </div>

            {discountAmount > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                Save ₹{discountAmount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs active:scale-98 ${
              addedAnimation
                ? 'bg-[#A6C928] text-[#12632F] shadow-sm'
                : 'bg-[#18833B] hover:bg-[#12632F] text-white hover:shadow-md'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to Cart!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
