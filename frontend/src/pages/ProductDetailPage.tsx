import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShieldCheck, Truck, RefreshCw, Heart, Plus, Minus, ShoppingBag, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product, ProductVariation } from '../types';
import { api } from '../api/client';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'usage' | 'compliance'>('details');
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const item = await api.getProductBySlug(slug);
        if (item) {
          setProduct(item);
          if (item.variations && item.variations.length > 0) {
            setSelectedVariation(item.variations[0]);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500 text-sm">Loading botanical product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-800">Product Not Found</h2>
        <p className="text-sm text-stone-500">The herbal formulation you are looking for may have been moved.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-[#18833B] text-white rounded-xl text-sm font-semibold">
          Browse Shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariation ? selectedVariation.price : product.price;
  const currentRegularPrice = selectedVariation ? selectedVariation.regular_price : product.regular_price;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product, selectedVariation, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-[#18833B]">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#18833B]">Shop</Link>
        <span>/</span>
        {product.categories[0] && (
          <>
            <Link to={`/shop?category=${product.categories[0].slug}`} className="hover:text-[#18833B]">
              {product.categories[0].name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#18833B] font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-white border border-stone-200/80 shadow-md">
            <img
              src={product.images[selectedImage]?.src || product.images[0]?.src}
              alt={product.images[selectedImage]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-[#18833B] shadow-md scale-102' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buy Box & Product Info */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#18833B]/10 text-[#18833B] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product.categories[0]?.name || 'Herbal Formulation'}
              </span>
              {product.bestseller && (
                <span className="bg-[#F28A13] text-white text-xs font-bold px-3 py-1 rounded-full">
                  Bestseller
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#26352A] font-serif leading-tight">
              {product.name}
            </h1>

            {product.herbal_fields.botanical_name && (
              <p className="text-xs sm:text-sm text-[#5C6E61] italic mt-1 font-medium">
                Botanical Source: {product.herbal_fields.botanical_name}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-stone-400">({product.rating_count} verified reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-[#FAF9F2] border border-stone-200/80 flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#18833B]">₹{currentPrice}</span>
            {currentRegularPrice > currentPrice && (
              <>
                <span className="text-sm text-stone-400 line-through">₹{currentRegularPrice}</span>
                <span className="bg-[#F28A13] text-white text-xs font-black px-2 py-0.5 rounded-md">
                  Save ₹{currentRegularPrice - currentPrice}
                </span>
              </>
            )}
            <span className="text-xs text-stone-500 ml-auto">Inclusive of all taxes</span>
          </div>

          {/* Short description */}
          <p className="text-sm text-stone-600 leading-relaxed">
            {product.short_description}
          </p>

          {/* Variation Selector (if variable product) */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Select Packaging / Size:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
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

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-stone-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 px-6 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 border rounded-xl transition-colors ${
                  isWishlisted ? 'border-red-500 text-red-500 bg-red-50' : 'border-stone-300 text-stone-600 hover:border-stone-400'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery & Trust Perks */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#18833B]" />
              <span>Ships in 24 hours across India</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#18833B]" />
              <span>Govt. AYUSH License Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#18833B]" />
              <span>100% Genuine Plant Extracts</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#18833B]" />
              <span>Standardized Batch Testing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Herbal Product Tabs */}
      <div className="border-t border-stone-200 pt-10">
        <div className="flex border-b border-stone-200 space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'details' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ingredients' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Ingredients &amp; Botanical Composition
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'usage' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Directions &amp; Precautions
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`pb-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'compliance' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            AYUSH Regulatory &amp; Batch Traceability
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'details' && (
            <div className="max-w-4xl space-y-4 text-stone-700 leading-relaxed text-sm">
              <p>{product.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-400 uppercase tracking-wider block">Form / Vehicle</span>
                  <span className="font-bold text-stone-800">{product.herbal_fields.product_form || 'Standard'}</span>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl">
                  <span className="text-xs text-stone-400 uppercase tracking-wider block">Net Quantity</span>
                  <span className="font-bold text-stone-800">{product.herbal_fields.net_quantity}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h3 className="font-bold text-sm text-[#26352A] mb-3">Active Herbal Ingredients:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {product.herbal_fields.ingredients?.map((ing, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-white border border-stone-200 rounded-xl text-xs text-stone-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#18833B] shrink-0" />
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {product.herbal_fields.composition && (
                <div className="p-4 bg-[#FAF9F2] rounded-xl border border-stone-200/80">
                  <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider block mb-1">Decoction / Composition:</span>
                  <p className="text-xs text-stone-600">{product.herbal_fields.composition}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="max-w-4xl space-y-6 text-sm text-stone-700">
              <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-stone-900">How to Use:</h4>
                <p className="leading-relaxed text-stone-600">{product.herbal_fields.directions_for_use}</p>
              </div>

              {product.herbal_fields.recommended_usage && (
                <div className="p-5 bg-white border border-stone-200 rounded-2xl space-y-2">
                  <h4 className="font-bold text-stone-900">Recommended Frequency:</h4>
                  <p className="text-stone-600">{product.herbal_fields.recommended_usage}</p>
                </div>
              )}

              {product.herbal_fields.precautions && (
                <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900">Precautions &amp; Advisory:</h4>
                    <p className="text-xs text-amber-800 leading-relaxed mt-1">{product.herbal_fields.precautions}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="max-w-4xl space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-stone-400 block mb-1">AYUSH / FSSAI License:</span>
                  <span className="font-bold text-stone-800">{product.herbal_fields.licence_number}</span>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-stone-400 block mb-1">Batch Number:</span>
                  <span className="font-bold text-stone-800">{product.herbal_fields.batch_number}</span>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-stone-400 block mb-1">Manufacturer:</span>
                  <span className="font-bold text-stone-800">{product.herbal_fields.manufacturer}</span>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-stone-400 block mb-1">Mfg Date:</span>
                  <span className="font-bold text-stone-800">{product.herbal_fields.manufacturing_date}</span>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-stone-400 block mb-1">Best Before / Expiry:</span>
                  <span className="font-bold text-stone-800">{product.herbal_fields.expiry_date}</span>
                </div>
                <div className="p-4 bg-white border border-stone-200 rounded-xl">
                  <span className="text-stone-400 block mb-1">Country of Origin:</span>
                  <span className="font-bold text-stone-800">{product.herbal_fields.country_of_origin}</span>
                </div>
              </div>

              {product.herbal_fields.certifications && (
                <div className="pt-4 flex flex-wrap gap-2">
                  {product.herbal_fields.certifications.map((cert, idx) => (
                    <span key={idx} className="px-3 py-1 bg-stone-100 rounded-full font-bold text-stone-700">
                      ✓ {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

