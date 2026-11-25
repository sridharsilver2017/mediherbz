import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Unlock,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Megaphone,
  Phone,
  Mail,
  User,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  LogOut,
  Sliders,
  Smartphone,
  Monitor,
  ShoppingBag,
  Truck,
  ArrowRight,
  RefreshCw,
  Copy,
  CheckCircle2,
  Globe,
  MessageCircle,
  MapPin,
  Building2,
  KeyRound,
  Shield,
  Layers,
  Share2,
  AlertTriangle,
  Power,
  Wrench,
  Clock,
  AlertOctagon,
} from 'lucide-react';
import { BrandSettings } from '../types';
import { INITIAL_BRAND_SETTINGS } from '../data/mockData';
import { api } from '../api/client';

const MAINTENANCE_PRESETS = [
  {
    title: '🌿 Scheduled Sanctuary Upgrades',
    tag: 'Default',
    message: 'Mediherbz is currently undergoing scheduled wellness upgrades and inventory replenishment. We will be back online shortly with fresh Ayurvedic harvests!',
    expected: 'Back online in 1-2 hours',
  },
  {
    title: '📦 Annual Harvest Inventory Restock',
    tag: 'Restock',
    message: 'We are currently restocking our cold-pressed herbal oils, organic ubtans, and Himalayan saffron. New orders will resume shortly!',
    expected: 'Back today by 6:00 PM IST',
  },
  {
    title: '🛠️ Essential Platform Upgrades',
    tag: 'Technical',
    message: 'We are performing critical technical optimizations to improve your checkout and order tracking experience. Thank you for your patience!',
    expected: 'Back in approximately 30 minutes',
  },
];

const ANNOUNCEMENT_PRESETS = [
  {
    title: 'Free Shipping Offer',
    tag: 'Popular',
    text: '🌿 Free Shipping in India on Orders Over ₹999 • 100% Ayurvedic & Organic',
    link: '/shop',
  },
  {
    title: 'Seasonal Glow Sale',
    tag: 'Promotional',
    text: '✨ Festive Radiance Sale: Up to 25% OFF on Pure Herbal Combos & Ubtans!',
    link: '/shop?category=herbal-skin-care',
  },
  {
    title: 'New Launch Notice',
    tag: 'Announcement',
    text: '🌱 Introducing Pure Saffron & Sandalwood Paste: Crafted for Youthful Skin',
    link: '/shop?category=ayurvedic-products',
  },
  {
    title: 'Express Dispatch Notice',
    tag: 'Shipping',
    text: '📦 Same-Day Dispatch for all prepaid orders placed before 2:00 PM IST',
    link: '/track-order',
  },
];

const EMOJI_CHIPS = ['🌿', '✨', '📦', '🌱', '🪔', '🧘‍♀️', '⭐', '🚚', '🎉', '💧'];

export const AdminPage: React.FC = () => {
  // Authentication states
  const [adminUser, setAdminUser] = useState(() => api.getAdminUser());
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard states
  const [settings, setSettings] = useState<BrandSettings>(INITIAL_BRAND_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'announcement' | 'maintenance' | 'orders' | 'contact' | 'store' | 'security'>('announcement');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Tracking Lookup state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackContact, setTrackContact] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Safe fallback getters
  const announcement = settings?.announcement_bar || INITIAL_BRAND_SETTINGS.announcement_bar;
  const socialLinks = settings?.social_links || INITIAL_BRAND_SETTINGS.social_links;
  const maintenance = settings?.maintenance_mode || INITIAL_BRAND_SETTINGS.maintenance_mode;

  // Load brand settings on mount
  useEffect(() => {
    let isMounted = true;
    api.getBrandSettings().then((data) => {
      if (isMounted && data) {
        setSettings({
          ...INITIAL_BRAND_SETTINGS,
          ...data,
          announcement_bar: {
            ...INITIAL_BRAND_SETTINGS.announcement_bar,
            ...(data.announcement_bar || {}),
          },
          social_links: {
            ...INITIAL_BRAND_SETTINGS.social_links,
            ...(data.social_links || {}),
          },
          maintenance_mode: {
            ...INITIAL_BRAND_SETTINGS.maintenance_mode,
            ...(data.maintenance_mode || {}),
          },
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.adminLogin(emailInput.trim(), passwordInput, rememberMe);
      setAdminUser(res.user);
      setEmailInput('');
      setPasswordInput('');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    api.adminLogout();
    setAdminUser(null);
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await api.updateBrandSettings(settings);
      setToastMessage('Settings successfully saved & published live!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage('Error saving settings. Please try again.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleToggleMaintenance = async () => {
    const newEnabled = !maintenance?.enabled;
    const updated = {
      ...settings,
      maintenance_mode: {
        ...(maintenance || {}),
        enabled: newEnabled,
      },
    };
    setSettings(updated);
    setSaving(true);
    try {
      await api.updateBrandSettings(updated);
      setToastMessage(newEnabled ? 'Maintenance Mode activated live & synced!' : 'Store is now LIVE and accepting orders!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage('Error syncing with server. Please click Save & Publish.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (adminUser && !saving) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adminUser, saving, handleSave]);

  const handleReset = async () => {
    if (window.confirm('Reset all banner and brand settings back to initial factory defaults?')) {
      const def = await api.resetBrandSettings();
      setSettings(def);
      setToastMessage('Settings restored to factory defaults.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleQuickTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackResult(null);

    try {
      const res = await api.trackOrder(trackQuery.trim(), trackContact.trim());
      if (res) {
        setTrackResult(res);
      } else {
        setTrackingError('No order found matching the given details.');
      }
    } catch (err: any) {
      setTrackingError(err?.message || 'Could not fetch order.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // -------------------------------------------------------------
  // LUXURY SIGN IN SCREEN
  // -------------------------------------------------------------
  if (!adminUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-[#FAF9F2] via-white to-[#FAF9F2]">
        <div className="w-full max-w-md">
          {/* Brand Emblem */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-linear-to-tr from-[#12632F] to-[#18833B] text-white shadow-xl shadow-emerald-900/15 mb-4 relative ring-8 ring-[#18833B]/10">
              <ShieldCheck className="w-10 h-10" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#A6C928] border-2 border-white flex items-center justify-center text-[10px] font-black text-emerald-950">
                ✓
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif tracking-tight">
              Mediherbz Control Suite
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-xs mx-auto">
              Administrator portal for live storefront banners, brand identity, and fulfillment.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-stone-200/90 rounded-lg shadow-xl shadow-stone-200/50 p-7 sm:p-9 relative overflow-hidden">
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#18833B] via-[#A6C928] to-[#12632F]" />

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username / Email */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="admin or admin email"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 hover:bg-stone-50/80 focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#18833B] focus:ring-3 focus:ring-[#18833B]/10 transition-all"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[10px] text-stone-400">WooCommerce Auth</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-stone-50 hover:bg-stone-50/80 focus:bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#18833B] focus:ring-3 focus:ring-[#18833B]/10 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#18833B] focus:ring-[#18833B] border-stone-300"
                  />
                  <span className="font-medium text-stone-700">Remember credentials (7 days)</span>
                </label>
              </div>

              {/* Error Alert */}
              {loginError && (
                <div className="flex items-center gap-2 text-xs text-red-700 font-medium bg-red-50 p-3 rounded-xl border border-red-200 text-left animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg shadow-emerald-800/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loginLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <Shield className="w-3.5 h-3.5 text-[#18833B]" />
              <span>WooCommerce REST &amp; HMAC Signature Encrypted</span>
            </div>
          </div>

          {/* Back to store navigation */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-[#18833B] transition-colors"
            >
              <span>← Return to Mediherbz Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LUXURY AUTHENTICATED DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FBFBF7] pb-24 sm:pb-32">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#12632F] text-white px-5 py-3.5 rounded-lg shadow-2xl flex items-center gap-3 border border-[#A6C928]/40 animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-[#A6C928]" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Navigation Bar */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/95 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-tr from-[#12632F] to-[#18833B] text-white flex items-center justify-center shadow-md shadow-emerald-900/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-base sm:text-lg text-stone-900 leading-tight">
                  Mediherbz
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#18833B]/10 text-[#18833B]">
                  Admin Pro
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Live Storefront Control &bull; {adminUser.display_name || adminUser.email}
              </p>
            </div>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Orders App Shortcut */}
            <a
              href="https://mediherbz-orders.pages.dev"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] h-11 gap-1.5 px-3.5 sm:px-4 py-2 bg-[#FAF9F2] hover:bg-[#F3EED9] text-[#12632F] border border-[#18833B]/30 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
              title="Open Standalone Mobile Orders App"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#18833B]" />
              <span className="hidden sm:inline">Orders App</span>
              <span className="sm:hidden">Orders</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* View Live Store */}
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center justify-center min-h-[44px] h-11 gap-1.5 px-3.5 sm:px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Store</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Link>

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] h-11 px-3 py-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        
        {/* Hub Overview Card */}
        <div className="bg-linear-to-r from-[#12632F] via-[#18833B] to-[#12632F] text-white rounded-lg p-6 sm:p-8 shadow-xl shadow-emerald-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A6C928] animate-pulse" />
              <span className="text-[11px] uppercase tracking-widest font-black text-[#A6C928]">
                WooCommerce &bull; Cloudflare Synced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
              Store Control Center
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Modify the live green announcement banner, verify customer care hotline numbers, manage orders, and configure store metadata in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 z-10">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-white hover:bg-emerald-50 text-[#12632F] rounded-lg text-xs sm:text-sm font-black shadow-lg shadow-black/10 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#18833B]" />
              <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
            </button>
          </div>

          {/* Decorative background watermarks */}
          <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-white">
            <Sparkles className="w-64 h-64" />
          </div>
        </div>

        {/* Tab Navigation Segmented Bar */}
        <div className="bg-white p-1.5 sm:p-2 rounded-lg border border-stone-200/80 shadow-xs flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('announcement')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'announcement'
                ? 'bg-[#18833B] text-white shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcement Bar</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-amber-600 text-white shadow-xs font-black'
                : (maintenance?.enabled
                    ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold border border-amber-300'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50')
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Maintenance</span>
            {maintenance?.enabled && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" title="Maintenance Mode Active" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#18833B] text-white shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Orders &amp; Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#18833B] text-white shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Customer Care</span>
          </button>

          <button
            onClick={() => setActiveTab('store')}
            className={`flex-1 min-w-[110px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'store'
                ? 'bg-[#18833B] text-white shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Brand Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 min-w-[110px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#18833B] text-white shadow-xs font-black'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Security &amp; PIN</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ANNOUNCEMENT BAR & REAL-TIME PREVIEW               */}
        {/* ========================================================= */}
        {activeTab === 'announcement' && (
          <div className="space-y-6">
            
            {/* Real-time Interactive Device Preview */}
            <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-7 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#18833B]" />
                    <h2 className="text-sm font-black text-stone-900 uppercase tracking-wider">
                      Interactive Live Banner Preview
                    </h2>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    See exactly how customers will view this bar on desktop screens vs mobile smartphones.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Device toggle */}
                  <div className="bg-stone-100 p-1 rounded-xl flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        previewDevice === 'desktop'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        previewDevice === 'mobile'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile</span>
                    </button>
                  </div>

                  {/* Status Indicator Badge */}
                  <span
                    className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${
                      announcement.enabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {announcement.enabled ? '● Active' : '○ Hidden'}
                  </span>
                </div>
              </div>

              {/* Viewport Sandbox */}
              <div className="p-4 sm:p-6 bg-stone-100/70 rounded-lg flex items-center justify-center">
                {previewDevice === 'desktop' ? (
                  <div className="w-full bg-white rounded-xl shadow-xs overflow-hidden border border-stone-200">
                    {/* Simulated browser top bar */}
                    <div className="bg-stone-200/70 px-4 py-2 flex items-center gap-2 border-b border-stone-300/60">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="bg-white/80 rounded-md px-3 py-0.5 text-[10px] text-stone-500 font-mono flex-1 max-w-sm text-center mx-auto">
                        https://mediherbz.pages.dev
                      </div>
                    </div>

                    {/* Announcement Bar */}
                    {announcement.enabled ? (
                      <div className="bg-[#12632F] text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium flex items-center justify-center gap-2">
                        <span>{announcement.text || 'Add your announcement text below...'}</span>
                        {announcement.link && (
                          <span className="underline opacity-80 text-xs hover:opacity-100 font-bold">
                            (Link: {announcement.link})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="bg-stone-100 py-3 text-center text-xs text-stone-400 italic">
                        Banner is currently disabled. Customers will not see this header.
                      </div>
                    )}

                    {/* Fake Header Below */}
                    <div className="p-4 flex items-center justify-between border-b border-stone-100 bg-white">
                      <span className="font-serif font-black text-stone-900 text-sm">🌿 Mediherbz</span>
                      <div className="flex gap-4 text-xs text-stone-400">
                        <span>Shop</span>
                        <span>Ayurvedic</span>
                        <span>Track Order</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mobile Smartphone Mockup */
                  <div className="w-full max-w-xs bg-stone-900 rounded-[36px] p-2.5 shadow-2xl border-4 border-stone-800">
                    {/* Phone speaker notch */}
                    <div className="w-24 h-4 bg-stone-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-stone-900 mr-2" />
                      <div className="w-8 h-1 bg-stone-700 rounded-full" />
                    </div>

                    <div className="bg-white rounded-[28px] overflow-hidden">
                      {/* Mobile announcement bar */}
                      {announcement.enabled ? (
                        <div className="bg-[#12632F] text-white text-[11px] py-2 px-3 text-center font-medium leading-snug">
                          {announcement.text || 'Add announcement text...'}
                        </div>
                      ) : (
                        <div className="bg-stone-100 py-2 text-center text-[10px] text-stone-400 italic">
                          Banner Hidden
                        </div>
                      )}

                      <div className="p-3 border-b border-stone-100 flex items-center justify-between">
                        <span className="font-serif font-black text-xs text-stone-900">🌿 Mediherbz</span>
                        <span className="text-[10px] text-stone-400">☰ Menu</span>
                      </div>
                      <div className="p-6 text-center text-[11px] text-stone-400 bg-stone-50">
                        Storefront Page Content
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Controls Card */}
            <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
              
              {/* Main Toggle Switch */}
              <div className="flex items-center justify-between pb-6 border-b border-stone-100">
                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900">
                    Display Announcement Header
                  </h3>
                  <p className="text-xs text-stone-500">
                    When active, this banner appears at the very top of all storefront pages.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcement.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        announcement_bar: {
                          ...(prev?.announcement_bar || INITIAL_BRAND_SETTINGS.announcement_bar),
                          enabled: e.target.checked,
                        },
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#18833B]" />
                </label>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Banner Message
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {(announcement.text || '').length} characters
                  </span>
                </div>
                <input
                  type="text"
                  value={announcement.text || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      announcement_bar: {
                        ...(prev?.announcement_bar || INITIAL_BRAND_SETTINGS.announcement_bar),
                        text: e.target.value,
                      },
                    }))
                  }
                  placeholder="e.g. 🌿 Free Shipping in India on Orders Over ₹999 • 100% Ayurvedic & Organic"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white focus:ring-3 focus:ring-[#18833B]/10 transition-all font-medium"
                />

                {/* Emoji Quick Picker Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-400 mr-1">Insert icon:</span>
                  {EMOJI_CHIPS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          announcement_bar: {
                            ...(prev?.announcement_bar || INITIAL_BRAND_SETTINGS.announcement_bar),
                            text: `${emoji} ${prev?.announcement_bar?.text || ''}`,
                          },
                        }))
                      }
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-sm flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Link */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Click Destination Link (Optional)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={announcement.link || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        announcement_bar: {
                          ...(prev?.announcement_bar || INITIAL_BRAND_SETTINGS.announcement_bar),
                          link: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. /shop or /track-order"
                    className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white transition-all font-mono"
                  />
                  {/* Preset Quick links */}
                  <div className="flex items-center gap-1">
                    {['/shop', '/track-order', '/cart'].map((route) => (
                      <button
                        key={route}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            announcement_bar: {
                              ...(prev?.announcement_bar || INITIAL_BRAND_SETTINGS.announcement_bar),
                              link: route,
                            },
                          }))
                        }
                        className="px-3 py-2.5 bg-stone-100 hover:bg-[#FAF9F2] hover:border-[#18833B]/40 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 transition-all cursor-pointer"
                      >
                        {route}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Template Cards */}
              <div className="pt-6 border-t border-stone-100 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#18833B]" />
                  <span>Curated High-Converting Templates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ANNOUNCEMENT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          announcement_bar: {
                            enabled: true,
                            text: preset.text,
                            link: preset.link,
                          },
                        }))
                      }
                      className="p-4 bg-stone-50 hover:bg-[#FAF9F2] hover:border-[#18833B]/50 border border-stone-200/90 rounded-lg text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#18833B] group-hover:underline">
                          {preset.title}
                        </span>
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-stone-200/60 text-stone-600">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {preset.text}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: MAINTENANCE MODE MANAGEMENT                          */}
        {/* ========================================================= */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            {/* Master Switch Banner */}
            <div
              className={`rounded-xl border p-6 sm:p-8 shadow-xs transition-all ${
                maintenance?.enabled
                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-full ${
                        maintenance?.enabled ? 'bg-red-500 animate-ping' : 'bg-[#18833B]'
                      }`}
                    />
                    <h2 className="text-xl sm:text-2xl font-black font-serif text-stone-900 tracking-tight">
                      {maintenance?.enabled
                        ? '🔴 Maintenance Mode is ACTIVE'
                        : '🟢 Store is LIVE (Online)'}
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-xl font-medium leading-relaxed">
                    {maintenance?.enabled
                      ? 'Public customers visiting your storefront currently see the botanical maintenance page. Normal checkout and browsing are paused.'
                      : 'Your store is currently live and accepting customer orders normally. Flip this switch when you need to perform catalog updates, inventory audits, or scheduled maintenance.'}
                  </p>
                </div>

                {/* Master Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleMaintenance}
                  disabled={saving}
                  className={`px-6 py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer active:scale-95 shrink-0 ${
                    maintenance?.enabled
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-700/20'
                      : 'bg-[#18833B] hover:bg-[#12632F] text-white shadow-emerald-700/20'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{maintenance?.enabled ? 'Turn OFF (Go Live)' : 'Turn ON Maintenance'}</span>
                </button>
              </div>

              {/* Admin Bypass Setting */}
              <div className="mt-6 pt-5 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenance?.allow_admin_bypass !== false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenance_mode: {
                          ...(maintenance || {}),
                          allow_admin_bypass: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-[#18833B] focus:ring-[#18833B]"
                  />
                  <span>Allow logged-in Admins to preview the full store while in Maintenance Mode</span>
                </label>
                <span className="text-[11px] font-bold text-stone-400">
                  (Route /admin is always accessible to prevent lockouts)
                </span>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block">
                Quick Preset Templates
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MAINTENANCE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        maintenance_mode: {
                          ...(maintenance || {}),
                          title: preset.title,
                          message: preset.message,
                          expected_back_time: preset.expected,
                        },
                      })
                    }
                    className="text-left p-3.5 rounded-xl border border-stone-200 hover:border-[#18833B] hover:bg-emerald-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 group-hover:bg-emerald-100 group-hover:text-[#18833B]">
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-stone-900 group-hover:text-[#18833B] truncate">
                      {preset.title}
                    </p>
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                      {preset.message}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Message Customization Form */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#18833B]" />
                <span>Customize Maintenance Notice</span>
              </h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Notice Headline
                  </label>
                  <input
                    type="text"
                    value={maintenance?.title || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenance_mode: {
                          ...(maintenance || {}),
                          title: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. 🌿 We are Refreshing our Herbal Sanctuary"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:border-[#18833B] focus:bg-white focus:ring-1 focus:ring-[#18833B]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Customer Message
                  </label>
                  <textarea
                    rows={3}
                    value={maintenance?.message || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maintenance_mode: {
                          ...(maintenance || {}),
                          message: e.target.value,
                        },
                      })
                    }
                    placeholder="Provide details about why the site is down and when you plan to reopen..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-[#18833B] focus:bg-white focus:ring-1 focus:ring-[#18833B]"
                  />
                </div>

                {/* Expected Time */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Estimated Reopen Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={maintenance?.expected_back_time || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          maintenance_mode: {
                            ...(maintenance || {}),
                            expected_back_time: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Back today by 6:00 PM IST or Back in 30 minutes"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-hidden focus:border-[#18833B] focus:bg-white focus:ring-1 focus:ring-[#18833B]"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Save within Tab */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  Remember to save your changes to publish live.
                </span>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save & Publish Live'}</span>
                </button>
              </div>
            </div>

            {/* Live Customer Preview */}
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#18833B]" />
                  <span className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Live Customer Screen Preview
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">
                  What visitors see when accessing https://mediherbz.pages.dev
                </span>
              </div>

              <div className="rounded-xl border border-stone-300 overflow-hidden bg-[#FAF9F2] p-8 text-center space-y-4 shadow-inner">
                <img
                  src="/brand/mediherbz-logo.png"
                  alt="Mediherbz"
                  className="h-9 w-auto mx-auto object-contain"
                />
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  Scheduled Botanical Enhancements
                </span>
                <h4 className="text-xl font-bold font-serif text-stone-900">
                  {maintenance?.title || '🌿 We are Refreshing our Herbal Sanctuary'}
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  {maintenance?.message || 'Mediherbz is currently undergoing scheduled wellness upgrades...'}
                </p>
                {maintenance?.expected_back_time && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg border border-stone-200 text-xs text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-[#18833B]" />
                    <span>Estimated return: <strong>{maintenance.expected_back_time}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ORDERS & FULFILLMENT HUB                           */}
        {/* ========================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Standalone Orders App Card */}
            <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#18833B]">
                    ⚡ Mobile First Dispatch
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
                    Standalone Orders Management App
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
                    Dedicated, lightning-fast order processing app with thermal packing slip printing, 1-tap WhatsApp notifications, instant phone dialing, and real-time courier tracking updates.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <a
                    href="https://mediherbz-orders.pages.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 bg-[#18833B] hover:bg-[#12632F] text-white font-bold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Launch Orders App</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <a
                    href="https://dev-medinerbz.pantheonsite.io/wp-admin/admin.php?page=wc-orders"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Layers className="w-4 h-4 text-stone-500" />
                    <span>WP-Admin Orders</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>

              {/* Key Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#18833B] flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-stone-900">Courier Waybill Sync</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Update BlueDart, Delhivery, or SpeedPost tracking numbers directly to WooCommerce orders in 1 click.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-stone-900">1-Tap WhatsApp Alerts</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Send pre-formatted Ayurvedic dispatch notes and live order tracking links directly to customer phones.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80 space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-stone-900">Thermal Packing Slips</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Instant 80mm thermal receipt and full-page invoice print layouts for your warehouse packing team.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Live Order Inspection Tool */}
            <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#18833B]" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Live Order &amp; Tracking Tester
                </h3>
              </div>
              <p className="text-xs text-stone-500">
                Inspect any order's live WooCommerce status and tracking metadata right now.
              </p>

              <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Order # (e.g. MED-58 or 58)"
                  className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                  required
                />
                <input
                  type="text"
                  value={trackContact}
                  onChange={(e) => setTrackContact(e.target.value)}
                  placeholder="Phone or Email (e.g. 919876543210)"
                  className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                  required
                />
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${trackingLoading ? 'animate-spin' : ''}`} />
                  <span>{trackingLoading ? 'Checking...' : 'Check Live'}</span>
                </button>
              </form>

              {trackingError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}

              {trackResult && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-stone-900 text-sm">
                      {trackResult.order_number || `Order #${trackResult.id}`}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {trackResult.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-stone-400 block">Total:</span>
                      <strong className="text-stone-800">₹{trackResult.total}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Carrier:</span>
                      <strong className="text-stone-800">{trackResult.shipping_carrier || 'Standard Express'}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Tracking ID:</span>
                      <strong className="text-stone-800 font-mono">{trackResult.tracking_id || 'Pending Dispatch'}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Payment:</span>
                      <strong className="text-stone-800 uppercase">{trackResult.payment_method || 'COD'}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CONTACT & CUSTOMER CARE                            */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Customer Care &amp; Support Channels
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                These contact details appear in the website header, footer, checkout guarantee, and email receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Support Helpline Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings?.support_phone || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, support_phone: e.target.value }))}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Support Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={settings?.contact_email || ''}
                    onChange={(e) => setSettings((prev) => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="care@mediherbz.com"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  WhatsApp Direct Support Link
                </label>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={socialLinks.whatsapp || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        social_links: {
                          ...(prev?.social_links || INITIAL_BRAND_SETTINGS.social_links),
                          whatsapp: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://wa.me/919876543210"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Instagram Profile URL
                </label>
                <div className="relative">
                  <Share2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={socialLinks.instagram || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        social_links: {
                          ...(prev?.social_links || INITIAL_BRAND_SETTINGS.social_links),
                          instagram: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://instagram.com/mediherbz"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Laboratory &amp; Herbal Park Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={3}
                  value={settings?.address || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Mediherbz Herbal Wellness Laboratories..."
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STORE IDENTITY & BRAND COLORS                      */}
        {/* ========================================================= */}
        {activeTab === 'store' && (
          <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Brand Name, Tagline &amp; Aesthetics
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Core identity variables used across SEO meta titles, browser tabs, and footers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={settings?.brand_name || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, brand_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Brand Tagline
                </label>
                <input
                  type="text"
                  value={settings?.tagline || ''}
                  onChange={(e) => setSettings((prev) => ({ ...prev, tagline: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white"
                />
              </div>
            </div>

            {/* Brand Colors Palette Preview */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                Official Mediherbz Ayurvedic Color System
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#18833B] shadow-xs shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-stone-800 block">Primary Leaf</span>
                    <span className="text-[10px] text-stone-500 font-mono">#18833B</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#12632F] shadow-xs shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-stone-800 block">Deep Forest</span>
                    <span className="text-[10px] text-stone-500 font-mono">#12632F</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#A6C928] shadow-xs shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-stone-800 block">Herbal Lime</span>
                    <span className="text-[10px] text-stone-500 font-mono">#A6C928</span>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF9F2] border border-stone-300 shadow-xs shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-stone-800 block">Ayurvedic Cream</span>
                    <span className="text-[10px] text-stone-500 font-mono">#FAF9F2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: SECURITY & ADMIN PIN                               */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Administrator Password &amp; Access Controls
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Set a custom PIN or password for quick admin login to this control suite.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPassword.trim().length < 6) {
                  alert('Password must be at least 6 characters long.');
                  return;
                }
                try {
                  localStorage.setItem('mediherbz_admin_pin', newPassword.trim());
                } catch {}
                setNewPassword('');
                setPasswordSuccess(true);
                setTimeout(() => setPasswordSuccess(false), 3500);
              }}
              className="space-y-4 max-w-md"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  New Admin Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:bg-white font-mono"
                    required
                  />
                </div>
              </div>

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-[#18833B] shrink-0" />
                  <span>Admin password updated successfully! You can now use this password to sign in.</span>
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Update Password
              </button>
            </form>

            <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#18833B]" />
                <span>Current Session: Verified Super Admin</span>
              </div>
              <span className="font-mono text-[11px] text-stone-400">HMAC-SHA256 Token</span>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* FLOATING ACTION BOTTOM BAR                                */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-red-600 transition-colors cursor-pointer px-2 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset to Factory Defaults</span>
            <span className="sm:hidden">Reset</span>
          </button>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-stone-400 font-medium">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-300 rounded text-[10px] font-mono">⌘ + S</kbd> to save
            </span>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#18833B] hover:bg-[#12632F] text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-lg transition-all shadow-md hover:shadow-lg shadow-emerald-800/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing Changes...' : 'Save & Publish Live'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
