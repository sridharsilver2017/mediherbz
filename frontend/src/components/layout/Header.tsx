import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, Menu, X, Phone, Mail, ChevronDown } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { INITIAL_CATEGORIES } from '../../data/mockData';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdown, setCategoryDropdown] = useState(false);

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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#12632F] text-white text-xs sm:text-sm py-2 px-4 text-center font-medium tracking-wide flex items-center justify-between">
        <div className="hidden md:flex items-center gap-4 text-xs opacity-90">
          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#A6C928]" /> +91 98765 43210</span>
          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#A6C928]" /> care@mediherbz.com</span>
        </div>
        <div className="mx-auto flex items-center gap-2">
          <span>🌿 Free Shipping in India on Orders Over ₹999 • 100% Ayurvedic & Organic</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs">
          <Link to="/track-order" className="hover:text-[#A6C928] transition-colors">Track Order</Link>
          <span>|</span>
          <Link to="/about" className="hover:text-[#A6C928] transition-colors">Why Mediherbz</Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-stone-700 hover:text-[#18833B] focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mediherbz Official Brand Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src="/brand/mediherbz-logo.png"
                alt="Mediherbz - For Young & Vibrant Look"
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-102"
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
                  {INITIAL_CATEGORIES.map((cat) => (
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
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-stone-700 hover:text-[#18833B] transition-colors"
              aria-label="Search herbal products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative p-2 text-stone-700 hover:text-[#18833B] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#F28A13] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={openCart}
              className="relative flex items-center gap-2 bg-[#18833B] hover:bg-[#12632F] text-white px-3.5 py-2 rounded-full font-medium text-sm transition-all shadow-sm hover:shadow-md cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-[#A6C928] text-[#12632F] font-bold text-xs px-2 py-0.5 rounded-full">
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
            {INITIAL_CATEGORIES.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm text-stone-600 hover:text-[#18833B]"
              >
                {c.name}
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
  );
};
