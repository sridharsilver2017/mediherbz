import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, Phone, Mail, ChevronDown, User } from 'lucide-react';
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
  const [categories, setCategories] = useState<ProductCategory[]>(() =>
    INITIAL_CATEGORIES.filter((c) => (c.count || 0) > 0)
  );
  const [announcement, setAnnouncement] = useState(() => INITIAL_BRAND_SETTINGS.announcement_bar);
  const [showHeader, setShowHeader] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  // Measure base header height so spacer perfectly preserves layout without jumps
  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => {
      if (headerRef.current && !mobileMenuOpen) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [mobileMenuOpen, announcement.enabled]);

  // Reset header visibility and close menus on route changes
  useEffect(() => {
    setShowHeader(true);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let lastY = window.scrollY || document.documentElement.scrollTop || 0;

    const handleScroll = () => {
      const currentY = window.scrollY || document.documentElement.scrollTop || 0;
      setIsScrolled(currentY > 40);

      // Always show when near top of the page (< 60px) or iOS overscroll
      if (currentY <= 60) {
        setShowHeader(true);
        lastY = currentY;
        return;
      }

      // If mobile menu or search input is actively open, keep header visible
      if (mobileMenuOpen || searchOpen) {
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
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-transform duration-300 ease-in-out w-full ${
          showHeader ? 'translate-y-0' : '-translate-y-full'
        } ${isScrolled ? 'shadow-md' : 'shadow-xs'} ${mobileMenuOpen ? 'max-h-screen overflow-y-auto' : ''}`}
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
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-md text-stone-700 hover:text-[#18833B] focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>

          {/* Mediherbz Official Brand Logo */}
          <div className="shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
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
              <button className="flex items-center gap-1 hover:text-[#18833B] transition-colors py-2">
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
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 text-stone-700 hover:text-[#18833B] transition-colors"
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
              className="p-1.5 sm:p-2 text-stone-700 hover:text-[#18833B] transition-colors"
              aria-label="My Account"
              title="My Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex items-center justify-center gap-1.5 bg-[#18833B] hover:bg-[#12632F] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
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

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <div className="py-3 border-t border-stone-200">
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-800 font-semibold hover:text-[#18833B]"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-800 font-semibold hover:text-[#18833B]"
          >
            Shop All Products
          </Link>
          <div className="pl-4 space-y-1.5 border-l-2 border-[#A6C928]">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Categories</p>
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-sm text-stone-600 hover:text-[#18833B] pr-4 py-1"
              >
                <span>{c.name}</span>
                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{c.count}</span>
              </Link>
            ))}
          </div>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-800 font-semibold hover:text-[#18833B]"
          >
            Our Story & Ingredients
          </Link>
          <Link
            to="/account"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-800 font-semibold hover:text-[#18833B] flex items-center gap-2"
          >
            <User className="w-4 h-4 text-[#18833B]" /> My Account & Orders
          </Link>
          <Link
            to="/quality"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-800 font-semibold hover:text-[#18833B]"
          >
            Quality & AYUSH
          </Link>
          <Link
            to="/blog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-800 font-semibold hover:text-[#18833B]"
          >
            Wellness Journal
          </Link>
          <Link
            to="/track-order"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-stone-800 font-semibold hover:text-[#18833B]"
          >
            Track My Order
          </Link>
        </div>
      )}
    </header>
    </>
  );
};
