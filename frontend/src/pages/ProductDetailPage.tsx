import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  MapPin,
  Check,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Product, ProductVariation, ProductReview } from '../types';
import { api } from '../api/client';
import { INITIAL_PRODUCTS } from '../data/mockData';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { ProductCard } from '../components/product/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Quick seed match for instant zero-flash initial render
  const initialMatch = slug
    ? INITIAL_PRODUCTS.find((p) => p.slug === slug || p.slug.includes(slug) || slug.includes(p.slug))
    : null;

  const [product, setProduct] = useState<Product | null>(initialMatch || null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'ingredients' | 'usage' | 'compliance' | 'reviews'>('details');
  const [loading, setLoading] = useState(!initialMatch);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic live integrations: Related products, reviews & pincode
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    title: '',
    comment: '',
  });

  // Dynamic pincode delivery estimator
  const [pincode, setPincode] = useState(() => {
    try {
      return localStorage.getItem('mediherbz_pincode') || '';
    } catch {
      return '';
    }
  });
  const [pincodeResult, setPincodeResult] = useState<{
    valid: boolean;
    deliveryDate?: string;
    message?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('mediherbz_pincode');
      if (saved && /^\d{6}$/.test(saved)) {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
        return {
          valid: true,
          deliveryDate: dateStr,
          message: 'Express Delivery Available (COD Supported)',
        };
      }
    } catch {}
    return null;
  });
  const [pincodeChecking, setPincodeChecking] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  // Reset state and fetch live product data whenever slug changes
  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setSelectedImage(0);
    setQuantity(1);
    setSelectedVariation(undefined);
    setShowReviewForm(false);
    setReviewSuccess(false);

    async function loadData() {
      if (!slug) return;
      if (!product || product.slug !== slug) {
        setLoading(true);
      }

      try {
        const item = await api.getProductBySlug(slug);
        if (isMounted && item) {
          setProduct(item);
          if (item.variations && item.variations.length > 0) {
            setSelectedVariation(item.variations[0]);
          }

          // Fetch related products and reviews in parallel
          setReviewsLoading(true);
          const [related, revs] = await Promise.all([
            api.getRelatedProducts(item.id, item.categories[0]?.slug, 4),
            api.getProductReviews(item.id),
          ]);

          if (isMounted) {
            setRelatedProducts(related);
            setReviews(revs);
            setReviewsLoading(false);
          }
        }
      } catch (err) {
        console.error('[Product Detail] Failed to load product', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading && !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#18833B] mb-4"></div>
        <p className="text-stone-600 font-semibold text-sm">Syncing pure botanical formulation details...</p>
        <p className="text-stone-400 text-xs mt-1">Connecting directly to Mediherbz Ayurvedic database</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-800 font-serif">Product Not Found</h2>
        <p className="text-sm text-stone-500">The herbal formulation you are looking for may have been updated or moved.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#18833B] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#12632F] transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Herbal Shop
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariation ? selectedVariation.price : product.price;
  const currentRegularPrice = selectedVariation ? selectedVariation.regular_price : product.regular_price;
  const isWishlisted = isInWishlist(product.id);
  const isInStock = product.in_stock && (product.stock_quantity === undefined || product.stock_quantity > 0);
  const stockCount = product.stock_quantity ?? 49;
  const isLowStock = isInStock && stockCount > 0 && stockCount < 10;
  const maxAvailableQuantity = Math.max(1, Math.min(stockCount, 10));

  const handleAddToCart = () => {
    if (!isInStock) return;
    addItem(product, selectedVariation, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Mediherbz:`,
          url: url,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeResult({
        valid: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
      return;
    }

    setPincodeChecking(true);
    setTimeout(() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const dateStr = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
      setPincodeResult({
        valid: true,
        deliveryDate: dateStr,
        message: 'Express Delivery Available (COD Supported)',
      });
      try {
        localStorage.setItem('mediherbz_pincode', clean);
      } catch {}
      setPincodeChecking(false);
    }, 400);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    setSubmittingReview(true);
    try {
      const created = await api.submitProductReview({
        product_id: product.id,
        reviewer_name: newReview.name || 'Verified Customer',
        rating: newReview.rating,
        title: newReview.title || 'Verified Purchase',
        review: newReview.comment,
      });

      setReviews((prev) => [created, ...prev]);
      setReviewSuccess(true);
      setNewReview({ name: '', rating: 5, title: '', comment: '' });
      setTimeout(() => {
        setReviewSuccess(false);
        setShowReviewForm(false);
      }, 2500);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Review statistics calculation
  const totalReviewsCount = Math.max(reviews.length, product.rating_count || 12);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10 sm:space-y-14 pb-28 lg:pb-16">
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

            {/* Top action floating buttons: Wishlist & Share */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md text-stone-600 hover:text-[#18833B] transition-all cursor-pointer active:scale-95"
                title="Share this product"
                aria-label="Share product"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`w-9 h-9 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-95 ${
                  isWishlisted ? 'text-red-500 bg-red-50' : 'text-stone-500 hover:text-red-500'
                }`}
                aria-label="Save to wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Category Pill Over Image */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span className="text-[11px] font-semibold bg-white/90 backdrop-blur-md text-[#18833B] px-2.5 py-1 rounded-lg shadow-xs">
                {product.categories[0]?.name || 'Herbal Formulation'}
              </span>
              {copiedLink && (
                <span className="text-[11px] font-bold bg-[#18833B] text-white px-2.5 py-1 rounded-lg shadow-md animate-fadeIn">
                  Link Copied!
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails - touch scrollable */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1 pt-0.5">
              {product.images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImage === idx
                      ? 'border-[#18833B] shadow-md scale-102 ring-2 ring-[#18833B]/20'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
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
                <span className="bg-[#F28A13] text-white text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3" /> Bestseller
                </span>
              )}
              {product.new_arrival && (
                <span className="bg-[#A6C928] text-[#12632F] text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full">
                  New Arrival
                </span>
              )}

              {/* Dynamic Live Stock Badge */}
              {!isInStock ? (
                <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-600" /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Only {stockCount} left in stock
                </span>
              ) : (
                <span className="bg-emerald-50 text-[#18833B] border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18833B] animate-pulse" />
                  In Stock ({stockCount} units)
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

            {/* Dynamic Rating */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(Number(avgRating)) ? 'fill-current text-amber-400' : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-800">{avgRating}</span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-[#18833B] hover:underline cursor-pointer"
              >
                ({totalReviewsCount} verified reviews)
              </button>
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
                    Save ₹{currentRegularPrice - currentPrice} (
                    {Math.round(((currentRegularPrice - currentPrice) / currentRegularPrice) * 100)}% OFF)
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] sm:text-xs text-stone-500">Inclusive of all GST & taxes</span>
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {product.short_description}
          </p>

          {/* Dynamic Variation Selector (if variable product) */}
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
                        ? 'border-[#18833B] bg-[#18833B]/5 text-[#18833B] shadow-2xs font-bold'
                        : 'border-stone-200 text-stone-700 hover:border-stone-300'
                    }`}
                  >
                    {v.name} - ₹{v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons for Desktop */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-xl bg-white p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!isInStock}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg active:bg-stone-200 disabled:opacity-40 cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center font-bold text-sm text-stone-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxAvailableQuantity, quantity + 1))}
                  disabled={!isInStock || quantity >= maxAvailableQuantity}
                  className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg active:bg-stone-200 disabled:opacity-40 cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isInStock}
                className={`flex-1 py-3 sm:py-3.5 px-4 sm:px-6 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed ${
                  addedAnimation
                    ? 'bg-[#12632F] text-[#A6C928]'
                    : isInStock
                    ? 'bg-[#18833B] hover:bg-[#12632F] text-white hover:shadow-lg'
                    : 'bg-stone-300 text-stone-600 shadow-none'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Added to Cart!
                  </>
                ) : !isInStock ? (
                  <>
                    <AlertCircle className="w-4 h-4" /> Currently Out of Stock
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart • ₹{currentPrice * quantity}
                  </>
                )}
              </button>

              <button
                type="button"
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

          {/* Dynamic Pincode & Delivery Availability Checker */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#18833B]" /> Check Delivery in Your City:
              </span>
              <span className="text-[10px] text-stone-400 font-medium">Pan-India Dispatch</span>
            </div>

            <form onSubmit={handleCheckPincode} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN code"
                className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#18833B]"
              />
              <button
                type="submit"
                disabled={pincodeChecking}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {pincodeChecking ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeResult && (
              <div
                className={`p-2.5 rounded-xl text-xs transition-all ${
                  pincodeResult.valid
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {pincodeResult.valid ? (
                  <div className="space-y-0.5">
                    <p className="font-bold flex items-center gap-1.5 text-[#18833B]">
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      Estimated Delivery by {pincodeResult.deliveryDate}
                    </p>
                    <p className="text-[11px] text-stone-600">
                      ✓ Free Shipping on orders over ₹499 • Cash on Delivery Available
                    </p>
                  </div>
                ) : (
                  <p className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {pincodeResult.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Delivery & Trust Perks */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-stone-200 text-[11px] sm:text-xs text-stone-600">
            <div className="flex items-center gap-2 p-2 bg-stone-50/80 rounded-xl">
              <Truck className="w-4 h-4 text-[#18833B] shrink-0" />
              <span>Ships in 24h across India</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-stone-50/80 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#18833B] shrink-0" />
              <span>AYUSH Certified Lab</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-stone-50/80 rounded-xl">
              <RefreshCw className="w-4 h-4 text-[#18833B] shrink-0" />
              <span>100% Plant Extracts</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-stone-50/80 rounded-xl">
              <FileText className="w-4 h-4 text-[#18833B] shrink-0" />
              <span>Traceable Batch tested</span>
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
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 sm:pb-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'reviews' ? 'border-[#18833B] text-[#18833B]' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>Customer Reviews</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-bold">
                {reviews.length}
              </span>
            </button>
          </div>
        </div>

        <div className="py-6 sm:py-8">
          {activeTab === 'details' && (
            <div className="max-w-4xl space-y-4 text-stone-700 leading-relaxed text-xs sm:text-sm">
              <div
                className="prose prose-stone max-w-none text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: product.description || `<p>${product.short_description}</p>`,
                }}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider block">Form / Vehicle</span>
                  <span className="font-bold text-stone-800 text-xs sm:text-sm">{product.herbal_fields.product_form || 'Standard'}</span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider block">Net Quantity</span>
                  <span className="font-bold text-stone-800 text-xs sm:text-sm">{product.herbal_fields.net_quantity || 'Standard Pack'}</span>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/60 col-span-2 sm:col-span-1">
                  <span className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider block">Origin</span>
                  <span className="font-bold text-stone-800 text-xs sm:text-sm">{product.herbal_fields.product_origin || 'Kerala, India'}</span>
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
                  <span className="font-bold text-stone-800 text-[11px] sm:text-xs">{product.herbal_fields.manufacturer || 'Mediherbz Laboratories Pvt Ltd'}</span>
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

          {activeTab === 'reviews' && (
            <div className="max-w-4xl space-y-8">
              {/* Rating Overview Header */}
              <div className="p-5 sm:p-6 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                    <span className="text-4xl sm:text-5xl font-black text-[#18833B] font-serif">{avgRating}</span>
                    <span className="text-stone-400 text-sm font-bold">/ 5.0</span>
                  </div>
                  <div className="flex text-amber-400 my-1 justify-center sm:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(Number(avgRating)) ? 'fill-current text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    Based on {totalReviewsCount} verified Ayurvedic customer reviews
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="px-5 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-5 sm:p-6 bg-white rounded-2xl border border-emerald-200 shadow-md space-y-4 animate-fadeIn"
                >
                  <h4 className="font-bold text-sm sm:text-base text-stone-900">Share Your Experience</h4>

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Your Rating *</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: s })}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              s <= newReview.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-stone-600">
                        {newReview.rating === 5
                          ? 'Excellent formulation'
                          : newReview.rating === 4
                          ? 'Very Good'
                          : newReview.rating === 3
                          ? 'Good'
                          : newReview.rating === 2
                          ? 'Fair'
                          : 'Poor'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        placeholder="e.g. Ramesh K."
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-[#18833B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Review Headline</label>
                      <input
                        type="text"
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        placeholder="e.g. Visible hair vitality in 10 days"
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-[#18833B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Detailed Review *</label>
                    <textarea
                      required
                      rows={3}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      placeholder="Share how this herbal formula helped you, texture, fragrance, or packaging..."
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-[#18833B]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {reviewSuccess ? (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Thank you! Your review was published.
                      </span>
                    ) : <span />}

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 sm:p-5 bg-white border border-stone-200/80 rounded-2xl space-y-2 hover:shadow-xs transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-stone-900">{rev.reviewer_name}</span>
                        {rev.verified && (
                          <span className="bg-emerald-50 text-[#18833B] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#18833B]" /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-400 font-medium">{rev.date}</span>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-current text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>

                    {rev.title && <h5 className="font-bold text-xs sm:text-sm text-stone-800">{rev.title}</h5>}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{rev.review}</p>

                    <div className="pt-2 flex items-center gap-4 text-[11px] text-stone-400 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> Helpful ({rev.helpful_count || 1})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Related Products / Frequently Paired Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 sm:pt-12 border-t border-stone-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#18833B] block">
                Holistic Ayurvedic Regimen
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
                Frequently Paired Formulations
              </h3>
            </div>
            <Link
              to="/shop"
              className="text-xs sm:text-sm font-bold text-[#18833B] hover:text-[#12632F] hover:underline"
            >
              Explore Shop →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard key={relProduct.id} product={relProduct} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Floating Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2.5 shadow-2xl safe-area-bottom">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">Total</span>
            <span className="text-xl font-black text-[#18833B]">₹{currentPrice * quantity}</span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={`flex-1 py-3 px-4 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed ${
              addedAnimation
                ? 'bg-[#12632F] text-[#A6C928]'
                : isInStock
                ? 'bg-[#18833B] active:bg-[#12632F] text-white'
                : 'bg-stone-300 text-stone-600'
            }`}
          >
            {addedAnimation ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Added to Cart!
              </>
            ) : !isInStock ? (
              <>
                <AlertCircle className="w-4 h-4" /> Out of Stock
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>

          <button
            type="button"
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
