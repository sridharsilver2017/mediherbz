import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ScrollToTop } from './components/common/ScrollToTop';
import { BackToTopButton } from './components/common/BackToTopButton';
import { MaintenanceScreen } from './components/common/MaintenanceScreen';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { WishlistPage } from './pages/WishlistPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ContactPage } from './pages/ContactPage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';
import { BrandSettings } from './types';
import { INITIAL_BRAND_SETTINGS } from './data/mockData';
import { api } from './api/client';

const AppContent: React.FC = () => {
  const [settings, setSettings] = useState<BrandSettings>(() => INITIAL_BRAND_SETTINGS);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    api.getBrandSettings().then((data) => {
      if (isMounted && data) setSettings(data);
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (isMounted && customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };
    window.addEventListener('mediherbz_settings_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('mediherbz_settings_updated', handleUpdate);
    };
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLoggedIn = Boolean(
    sessionStorage.getItem('mediherbz_admin_user') || localStorage.getItem('mediherbz_admin_user')
  );

  const isMaintenanceActive = Boolean(settings?.maintenance_mode?.enabled);

  // If maintenance mode is active AND visitor is NOT on /admin:
  if (isMaintenanceActive && !isAdminRoute) {
    // If Admin is logged in and bypass allowed, show store with emergency warning bar
    if (isAdminLoggedIn && settings?.maintenance_mode?.allow_admin_bypass !== false) {
      return (
        <div className="min-h-screen flex flex-col bg-[#FAF9F2] text-[#26352A] overflow-x-clip w-full max-w-full">
          {/* Admin Warning Bar */}
          <div className="bg-amber-500 text-stone-950 px-4 py-2 text-xs font-black flex items-center justify-between sticky top-0 z-50 shadow-md">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              ⚠️ STORE IN MAINTENANCE MODE — Public visitors see the maintenance page. You are viewing as Admin.
            </span>
            <Link to="/admin" className="underline hover:text-white transition-colors">
              Manage in Admin →
            </Link>
          </div>
          <Header />
          <main className="flex-1 overflow-x-clip w-full max-w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/track-order" element={<TrackOrderPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/my-account" element={<AccountPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/quality" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route
                path="*"
                element={
                  <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
                    <h1 className="text-4xl font-black text-stone-900 font-serif">404</h1>
                    <p className="text-sm text-stone-500">The botanical page you are looking for does not exist.</p>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
          <CartDrawer />
          <BackToTopButton />
        </div>
      );
    }

    // Public visitors see the full maintenance screen
    return <MaintenanceScreen settings={settings?.maintenance_mode} brandSettings={settings} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F2] text-[#26352A] overflow-x-clip w-full max-w-full">
      <Header />
      <main className="flex-1 overflow-x-clip w-full max-w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/my-account" element={<AccountPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/quality" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="*"
            element={
              <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
                <h1 className="text-4xl font-black text-stone-900 font-serif">404</h1>
                <p className="text-sm text-stone-500">The botanical page you are looking for does not exist.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <BackToTopButton />
    </div>
  );
};

export function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
