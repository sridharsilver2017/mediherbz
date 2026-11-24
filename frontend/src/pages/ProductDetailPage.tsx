import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RefreshCw, Heart, Plus, Minus, ShoppingBag, FileText, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Product, ProductVariation } from '../types';
import { api } from '../api/client';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const initialMatch = slug ? INITIAL_PRODUCTS.find((p) => p.slug === slug || p.slug.includes(slug) || slug.includes(p.slug)) : null;
  const [product, setProduct] = useState<Product | null>(initialMatch || null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'usage' | 'compliance'>('details');
  const [loading, setLoading] = useState(!initialMatch);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      if (!slug) return;
      if (!product) setLoading(true);
      try {
        const item = await api.getProductBySlug(slug);
        if (isMounted && item) {
          setProduct(item);
          if (item.variations && item.variations.length > 0 && !selectedVariation) {
            setSelectedVariation(item.variations[0]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#18833B] mb-3"></div>
        <p className="text-stone-500 text-sm">Loading botanical product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-800 font-serif">Product Not Found</h2>
        <p className="text-sm text-stone-500">The herbal formulation you are looking for may have been updated or moved.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#18833B] text-white rounded-xl text-sm font-semibold shadow-md">
          <ArrowLeft className="w-4 h-4" /> Browse Herbal Shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariation ? selectedVariation.price : product.price;
  const currentRegularPrice = selectedVariation ? selectedVariation.regular_price : product.regular_price;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, selectedVariation, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-14 pb-28 lg:pb-12">
      {/* Breadcrumbs - horizontally scrollable on mobile */}
      <div className="flex items-center gap-1.5 text-xs text-stone-500 overflow-x-auto whitespace-nowrap scrollbar-none py-1 w-full max-w-full">
        <Link to="/" className="hover:text-[#18833B] shrink-0">Home</Link>
        <span className="shrink-0 text-stone-300">/</span>
        <Link to="/shop" className="hover:text-[#18833B] shrink-0">Shop</Link>
        <span className="shrink-0 text-stone-300">/</span>
        {product.categories[0] && (
          <>
            <Link to={`/shop?category=${product.categories[0].slug}`} className="hover:text-[#18833B] shrink-0">
              {product.categories[0].name}
            </Link>
            <span className="shrink-0 text-stone-300">/</span>
          </>
        )}
        <span className="text-[#18833B] font-semibold truncate max-w-[200px] sm:max-w-xs shrink-0">{product.name}</span>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          <div className="aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-md relative group">
            <img
              src={product.images[selectedImage]?.src || product.images[0]?.src}
              alt={product.images[selectedImage]?.alt || product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.includes('wp.com/')) {
                  target.src = target.src.replace(/https?:\/\/i\d\.wp\.com\//, 'https://');
                }
              }}
            />
            {/* Mobile overlay Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`lg:hidden absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md transition-all active:scale-95 ${
                isWishlisted ? 'text-red-500 bg-red-50' : 'text-stone-500 hover:text-red-500'
              }`}
              aria-label="Save to wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            {/* Category Pill Over Image */}
            <div className="absolute bottom-3 left-3">
              <span className="text-[11px] font-semibold bg-white/90 backdrop-blur-md text-[#18833B] px-2.5 py-1 rounded-lg shadow-xs">
                {product.categories[0]?.name || 'Herbal'}
              </span>
            </div>
          </div>

          {/* Thumbnails - touch scrollable */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1 pt-0.5">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === idx ? 'border-[#18833B] shadow-md scale-102 ring-2 ring-[#18833B]/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buy Box & Product Info */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#18833B]/10 text-[#18833B] text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {product.categories[0]?.name || 'Herbal Formulation'}
              </span>
              {product.bestseller && (
                <span className="bg-[#F28A13] text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full">
                  Bestseller
                </span>
              )}
              {product.new_arrival && (
                <span className="bg-[#A6C928] text-[#12632F] text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full">
                  New Arrival
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-[#26352A] font-serif leading-tight sm:leading-snug">
              {product.name}
            </h1>

            {product.herbal_fields.botanical_name && (
              <p className="text-xs sm:text-sm text-[#5C6E61] italic mt-1 font-medium">
                Botanical Source: {product.herbal_fields.botanical_name}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-stone-400">({product.rating_count} verified reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF9F2] border border-stone-200/80 flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-black text-[#18833B]">₹{currentPrice}</span>
              {currentRegularPrice > currentPrice && (
                <>
                  <span className="text-xs sm:text-sm text-stone-400 line-through">₹{currentRegularPrice}</span>
                  <span className="bg-[#F28A13] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md">
                    Save ₹{currentRegularPrice - currentPrice}
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] sm:text-xs text-stone-500">Inclusive of all taxes</span>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {product.short_description}
          </p>

          {/* Variation Selector (if variable product) */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Select Packaging / Size:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all cursor-pointer ${
                      selectedVariation?.id === v.id
                        ? 'border-[#18833B] bg-[#18833B]/5 text-[#18833B]'
                        : 'border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {v.name} - ₹{v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons for Tablet / Desktop */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg active:bg-stone-200"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center font-bold text-sm text-stone-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg active:bg-stone-200"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 sm:py-3.5 px-4 sm:px-6 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                  addedAnimation ? 'bg-[#12632F] text-[#A6C928]' : 'bg-[#18833B] hover:bg-[#12632F] text-white hover:shadow-lg'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`hidden lg:flex p-3 sm:p-3.5 border rounded-xl transition-colors cursor-pointer ${
                  isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-stone-300 text-stone-600 hover:border-stone-400'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Trust Perks */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-4 border-t border-stone-200 text-[11px] sm:text-xs text-stone-600">
            <div className="flex items-center gap-2 p-2 bg-stone-50/80 rounded-xl">
              <Truck className="w-4 h-4 text-[#18833B] shrink-0" />
              <span>Ships in 24h across India</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-stone-50/80 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#18833B] shrink-0" />
              <span>AYUSH Licensed</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-stone-50/80 rounded-xl">
              <RefreshCw className="w-4 h-4 text-[#18833B] shrink-0" />
              <span>100% Plant Extracts</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-stone-50/80 rounded-xl">
              <FileText className="w-4 h-4 text-[#18833B] shrink-0" />
              <span>Batch Tested</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Herbal Product Tabs */}
      <div className="border-t border-stone-200 pt-8 sm:pt-10 w-full max-w-full overflow-hidden">
        <div className="overflow-x-auto scrollbar-none w-full max-w-full">
          <div className="flex border-b border-stone-200 min-w-max space-x-3 sm:space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'details' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Product Overview
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ingredients' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Ingredients &amp; Composition
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'usage' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Directions &amp; Precautions
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'compliance' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              AYUSH &amp; Traceability
            </button>
          </div>
        </div>

        <div className="py-6 sm:py-8">
          {activeTab === 'details' && (
            <div className="max-w-4xl space-y-4 text-stone-700 leading-relaxed text-xs sm:text-sm">
              <p>{product.description}</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3">
                <div className="p-3.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider block">Form / Vehicle</span>
                  <span className="font-bold text-stone-800 text-xs sm:text-sm">{product.herbal_fields.product_form || 'Standard'}</span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl">
                  <span className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider block">Net Quantity</span>
                  <span className="font-bold text-stone-800 text-xs sm:text-sm">{product.herbal_fields.net_quantity || 'Standard Pack'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="max-w-4xl space-y-5">
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-[#26352A] mb-3">Active Herbal Ingredients:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {product.herbal_fields.ingredients?.map((ing, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 sm:p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#18833B] shrink-0" />
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {product.herbal_fields.composition && (
                <div className="p-3.5 sm:p-4 bg-[#FAF9F2] rounded-xl border border-stone-200/80">
                  <span className="text-[11px] font-bold text-[#18833B] uppercase tracking-wider block mb-1">Decoction / Composition:</span>
                  <p className="text-xs text-stone-600">{product.herbal_fields.composition}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="max-w-4xl space-y-4 sm:space-y-6 text-xs sm:text-sm text-stone-700">
              <div className="p-4 sm:p-5 bg-white border border-stone-200 rounded-2xl space-y-1.5">
                <h4 className="font-bold text-stone-900 text-xs sm:text-sm">How to Use:</h4>
                <p className="leading-relaxed text-stone-600">{product.herbal_fields.directions_for_use}</p>
              </div>

              {product.herbal_fields.recommended_usage && (
                <div className="p-4 sm:p-5 bg-white border border-stone-200 rounded-2xl space-y-1.5">
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm">Recommended Frequency:</h4>
                  <p className="text-stone-600">{product.herbal_fields.recommended_usage}</p>
                </div>
              )}

              {product.herbal_fields.precautions && (
                <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-1.5 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-xs sm:text-sm">Precautions &amp; Advisory:</h4>
                    <p className="text-xs text-amber-800 leading-relaxed mt-1">{product.herbal_fields.precautions}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="max-w-4xl space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
                <div className="p-3 sm:p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-[10px] sm:text-xs text-stone-400 block mb-0.5">AYUSH / FSSAI License:</span>
                  <span className="font-bold text-stone-800 text-[11px] sm:text-xs">{product.herbal_fields.licence_number || 'AYUSH Verified'}</span>
                </div>
                <div className="p-3 sm:p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-[10px] sm:text-xs text-stone-400 block mb-0.5">Batch Number:</span>
                  <span className="font-bold text-stone-800 text-[11px] sm:text-xs">{product.herbal_fields.batch_number || 'MED2026-LIVE'}</span>
                </div>
                <div className="p-3 sm:p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-[10px] sm:text-xs text-stone-400 block mb-0.5">Manufacturer:</span>
                  <span className="font-bold text-stone-800 text-[11px] sm:text-xs">{product.herbal_fields.manufacturer || 'Mediherbz Laboratories'}</span>
                </div>
                <div className="p-3 sm:p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-[10px] sm:text-xs text-stone-400 block mb-0.5">Mfg Date:</span>
                  <span className="font-bold text-stone-800 text-[11px] sm:text-xs">{product.herbal_fields.manufacturing_date || '2026-08'}</span>
                </div>
                <div className="p-3 sm:p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-[10px] sm:text-xs text-stone-400 block mb-0.5">Best Before:</span>
                  <span className="font-bold text-stone-800 text-[11px] sm:text-xs">{product.herbal_fields.expiry_date || '24 Months from Mfg'}</span>
                </div>
                <div className="p-3 sm:p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-[10px] sm:text-xs text-stone-400 block mb-0.5">Country of Origin:</span>
                  <span className="font-bold text-stone-800 text-[11px] sm:text-xs">{product.herbal_fields.country_of_origin || 'India'}</span>
                </div>
              </div>

              {product.herbal_fields.certifications && (
                <div className="pt-2 flex flex-wrap gap-2">
                  {product.herbal_fields.certifications.map((cert, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-stone-100 rounded-full font-bold text-stone-700 text-[11px]">
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Floating Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2.5 shadow-2xl safe-area-bottom">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Total</span>
            <span className="text-xl font-black text-[#18833B]">₹{currentPrice * quantity}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 ${
              addedAnimation ? 'bg-[#12632F] text-[#A6C928]' : 'bg-[#18833B] active:bg-[#12632F] text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Added to Cart!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
          <button
            onClick={() => toggleWishlist(product)}
            className={`p-3 border rounded-xl transition-colors shrink-0 active:scale-95 ${
              isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-stone-200 text-stone-600'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};


