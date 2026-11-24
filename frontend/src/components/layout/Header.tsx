import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Phone,
  Mail,
  ChevronDown,
  User,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Truck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { INITIAL_CATEGORIES, INITIAL_BRAND_SETTINGS } from '../../data/mockData';
import { ProductCategory } from '../../types';
import { api } from '../../api/client';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);
  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    INITIAL_CATEGORIES.filter((c) => (c.count || 0) > 0)
  );
  const [announcement, setAnnouncement] = useState(() => INITIAL_BRAND_SETTINGS.announcement_bar);
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Prevent background body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Measure base header height so spacer perfectly preserves layout without jumps
  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [announcement.enabled]);

  // Reset header visibility and close menus on route changes
  useEffect(() => {
    setShowHeader(true);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastY = window.scrollY || document.documentElement.scrollTop || 0;

    const handleScroll = () => {
      // If mobile menu or search input is actively open, keep header strictly visible and fixed
      if (mobileMenuOpen || searchOpen) {
        setShowHeader(true);
        return;
      }

      const currentY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(currentY > 40);

      // Always show when near top of the page (< 60px) or iOS overscroll
      if (currentY <= 60) {
        setShowHeader(true);
        lastY = currentY;
        return;
      }

      // Prevent erratic behavior at the very bottom of the page
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (currentY > maxScroll - 20) {
        return;
      }

      // Jitter tolerance: ignore micro scrolls under 5px
      const diff = currentY - lastY;
      if (Math.abs(diff) < 5) return;

      if (diff > 0) {
        // Scrolling DOWN -> smoothly hide header
        setShowHeader(false);
      } else {
        // Scrolling UP -> smoothly reveal header
        setShowHeader(true);
      }

      lastY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen, searchOpen]);

  useEffect(() => {
    let isMounted = true;
    api.getCategories().then((cats) => {
      if (isMounted && cats && cats.length > 0) {
        setCategories(cats.filter((c) => (c.count || 0) > 0));
      }
    });
    api.getBrandSettings().then((settings) => {
      if (isMounted && settings?.announcement_bar) {
        setAnnouncement(settings.announcement_bar);
      }
    });

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (isMounted && customEvent.detail?.announcement_bar) {
        setAnnouncement(customEvent.detail.announcement_bar);
      }
    };
    window.addEventListener('mediherbz_settings_updated', handleSettingsUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('mediherbz_settings_updated', handleSettingsUpdate);
    };
  }, []);

  const navigate = useNavigate();
  const totalCartItems = useCartStore((state) => state.totalItems());
  const openCart = useCartStore((state) => state.openCart);
  const wishlistItems = useWishlistStore((state) => state.items);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Spacer to hold page flow so fixed header never causes layout jump or content clipping */}
      <div
        style={{ height: headerHeight ? `${headerHeight}px` : undefined }}
        className={headerHeight ? '' : (announcement.enabled ? 'h-[96px] sm:h-[112px] shrink-0' : 'h-16 sm:h-20 shrink-0')}
        aria-hidden="true"
      />
      
      {/* Header Container - Always stays pinned at top */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-transform duration-300 ease-in-out w-full ${
          showHeader || mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        } ${isScrolled || mobileMenuOpen ? 'shadow-md' : 'shadow-xs'}`}
      >
        {/* Top Announcement Bar (Toggled via announcement.enabled) */}
        {announcement.enabled && (
          <div className="bg-[#12632F] text-white text-[10px] sm:text-xs py-2 px-3 sm:px-4 text-center font-medium tracking-wide flex items-center justify-between">
            <div className="hidden md:flex items-center gap-4 text-xs opacity-90">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#A6C928]" /> +91 98765 43210</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#A6C928]" /> care@mediherbz.com</span>
            </div>
            <div className="mx-auto flex items-center gap-2">
              <span>{announcement.text}</span>
            </div>
            <div className="hidden md:flex items-center gap-3 text-xs">
              <Link to="/track-order" className="hover:text-[#A6C928] transition-colors">Track Order</Link>
              <span>|</span>
              <Link to="/account" className="hover:text-[#A6C928] transition-colors">My Account</Link>
              <span>|</span>
              <Link to="/about" className="hover:text-[#A6C928] transition-colors">Why Mediherbz</Link>
            </div>
          </div>
        )}

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Mobile Menu Button - Prominent touch target with state indication */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-colors focus:outline-hidden ${
                  mobileMenuOpen
                    ? 'bg-emerald-50 text-[#18833B] ring-1 ring-emerald-200'
                    : 'text-stone-700 hover:text-[#18833B] hover:bg-stone-50'
                }`}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mediherbz Official Brand Logo */}
            <div className="shrink-0 flex items-center">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 sm:gap-3 group"
              >
                <img
                  src="/brand/mediherbz-logo.png"
                  alt="Mediherbz - For Young & Vibrant Look"
                  className="h-9 sm:h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-102"
                />
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#26352A]">
              <Link to="/" className="hover:text-[#18833B] transition-colors">Home</Link>
              
              {/* Category Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCategoryDropdown(true)}
                onMouseLeave={() => setCategoryDropdown(false)}
              >
                <button className="flex items-center gap-1 hover:text-[#18833B] transition-colors py-2 cursor-pointer">
                  <span>Categories</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {categoryDropdown && (
                  <div className="absolute top-full -left-4 w-72 bg-white rounded-xl shadow-xl border border-stone-100 py-3 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-wider">
                      Herbal Collections
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-stone-700 hover:bg-[#FAF9F2] hover:text-[#18833B] transition-colors"
                        onClick={() => setCategoryDropdown(false)}
                      >
                        <span>{cat.name}</span>
                        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                      </Link>
                    ))}
                    <div className="p-3 border-t border-stone-100 mt-2 bg-[#FAF9F2]/60">
                      <Link
                        to="/shop"
                        className="block text-center text-xs font-bold text-[#18833B] hover:underline"
                        onClick={() => setCategoryDropdown(false)}
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/shop" className="hover:text-[#18833B] transition-colors">Shop All</Link>
              <Link to="/about" className="hover:text-[#18833B] transition-colors">Our Story</Link>
              <Link to="/quality" className="hover:text-[#18833B] transition-colors">Quality & AYUSH</Link>
              <Link to="/blog" className="hover:text-[#18833B] transition-colors">Wellness Journal</Link>
              <Link to="/contact" className="hover:text-[#18833B] transition-colors">Contact</Link>
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-4">
              {/* Search Trigger */}
              <button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                  if (mobileMenuOpen) setMobileMenuOpen(false);
                }}
                className={`p-1.5 sm:p-2 rounded-lg text-stone-700 hover:text-[#18833B] transition-colors ${
                  searchOpen ? 'bg-emerald-50 text-[#18833B]' : ''
                }`}
                aria-label="Search herbal products"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                to="/wishlist"
                className="relative p-1.5 sm:p-2 text-stone-700 hover:text-[#18833B] transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#F28A13] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* My Account Link */}
              <Link
                to="/account"
                className="hidden sm:inline-flex p-1.5 sm:p-2 text-stone-700 hover:text-[#18833B] transition-colors"
                aria-label="My Account"
                title="My Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative flex items-center justify-center gap-1.5 bg-[#18833B] hover:bg-[#12632F] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Cart</span>
                <span className="bg-[#A6C928] text-[#12632F] font-bold text-[11px] sm:text-xs px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full">
                  {totalCartItems}
                </span>
              </button>
            </div>
          </div>

          {/* Expandable Search Input Bar (Desktop / Quick Bar) */}
          {searchOpen && !mobileMenuOpen && (
            <div className="py-3 border-t border-stone-200 animate-fadeIn">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search herbal supplements, oils, ubtans, ingredients (e.g., Saffron, Bhringraj, Ashwagandha)..."
                  className="w-full pl-12 pr-28 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 bg-[#18833B] text-white text-xs font-semibold rounded-lg hover:bg-[#12632F] transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay Drawer */}
      {/* Kept outside the header scroll flow so the header bar remains permanently fixed at top */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex flex-col bg-stone-900/40 backdrop-blur-xs transition-opacity animate-fadeIn"
          style={{ top: `${headerHeight}px` }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-h-full bg-white border-b border-stone-200 shadow-2xl overflow-y-auto overscroll-contain flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Search Bar inside Menu */}
            <div className="p-4 bg-stone-50 border-b border-stone-200">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search herbs, remedies, ingredients..."
                  className="w-full pl-10 pr-20 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1 bg-[#18833B] text-white text-xs font-semibold rounded-lg hover:bg-[#12632F] transition-colors"
                >
                  Go
                </button>
              </form>
            </div>

            {/* Menu Items List */}
            <div className="p-4 space-y-1 divide-y divide-stone-100">
              {/* Primary Links */}
              <div className="pb-3 space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-emerald-50 hover:text-[#18833B] transition-colors"
                >
                  <span>Home</span>
                </Link>
                <Link
                  to="/shop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-stone-800 font-semibold hover:bg-emerald-50 hover:text-[#18833B] transition-colors"
                >
                  <span>Shop All Products</span>
                  <span className="text-[11px] font-bold text-[#18833B] bg-emerald-100 px-2 py-0.5 rounded-full">
                    100% Herbal
                  </span>
                </Link>
              </div>

              {/* Categories Accordion */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider cursor-pointer"
                >
                  <span>Herbal Categories</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-500 transition-transform ${
                      mobileCategoriesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {mobileCategoriesOpen && (
                  <div className="mt-1 pl-2 space-y-1 border-l-2 border-[#18833B]/30 ml-3">
                    {categories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/shop?category=${c.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-stone-700 hover:bg-emerald-50 hover:text-[#18833B] transition-colors"
                      >
                        <span>{c.name}</span>
                        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-medium">
                          {c.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Company & Trust Links */}
              <div className="py-3 space-y-1">
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-700 font-medium hover:bg-emerald-50 hover:text-[#18833B] transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#18833B]" />
                  <span>Our Story &amp; Ingredients</span>
                </Link>
                <Link
                  to="/quality"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-700 font-medium hover:bg-emerald-50 hover:text-[#18833B] transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-[#18833B]" />
                  <span>Quality &amp; AYUSH Standards</span>
                </Link>
                <Link
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-700 font-medium hover:bg-emerald-50 hover:text-[#18833B] transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#18833B]" />
                  <span>Wellness Journal</span>
                </Link>
                <Link
                  to="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-700 font-medium hover:bg-emerald-50 hover:text-[#18833B] transition-colors"
                >
                  <Truck className="w-4 h-4 text-[#18833B]" />
                  <span>Track My Order</span>
                </Link>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-700 font-medium hover:bg-emerald-50 hover:text-[#18833B] transition-colors"
                >
                  <User className="w-4 h-4 text-[#18833B]" />
                  <span>My Account &amp; Past Orders</span>
                </Link>
              </div>

              {/* Customer Care Hotline */}
              <div className="pt-4 pb-2 px-3 text-xs text-stone-500 space-y-2">
                <p className="font-bold uppercase tracking-wider text-[10px] text-stone-400">Need Guidance?</p>
                <div className="flex flex-col gap-1.5">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center gap-2 text-[#18833B] font-semibold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 98765 43210</span>
                  </a>
                  <a
                    href="mailto:care@mediherbz.com"
                    className="flex items-center gap-2 text-stone-600 hover:text-[#18833B]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>care@mediherbz.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
