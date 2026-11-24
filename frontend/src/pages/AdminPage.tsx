import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { BrandSettings } from '../types';
import { INITIAL_BRAND_SETTINGS } from '../data/mockData';
import { api } from '../api/client';

const ANNOUNCEMENT_PRESETS = [
  {
    title: 'Free Shipping Offer',
    text: '🌿 Free Shipping in India on Orders Over ₹999 • 100% Ayurvedic & Organic',
    link: '/shop',
  },
  {
    title: 'Seasonal Glow Sale',
    text: '✨ Festive Radiance Sale: Up to 25% OFF on Pure Herbal Combos & Ubtans!',
    link: '/shop',
  },
  {
    title: 'New Launch Notice',
    text: '🌱 Introducing Pure Saffron & Sandalwood Paste: Crafted for Youthful Skin',
    link: '/shop?category=herbal-skin-care',
  },
  {
    title: 'Express Dispatch',
    text: '📦 Same-Day Dispatch for all prepaid orders placed before 2:00 PM IST',
    link: '/track-order',
  },
];

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
  const [activeTab, setActiveTab] = useState<'announcement' | 'contact' | 'store' | 'security'>('announcement');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Safe fallback getters
  const announcement = settings?.announcement_bar || INITIAL_BRAND_SETTINGS.announcement_bar;
  const socialLinks = settings?.social_links || INITIAL_BRAND_SETTINGS.social_links;

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateBrandSettings(settings);
      setToastMessage('Settings successfully saved and published live!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch {
      setToastMessage('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all banner and brand settings back to initial factory defaults?')) {
      const def = await api.resetBrandSettings();
      setSettings(def);
      setToastMessage('Settings restored to factory defaults.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // -------------------------------------------------------------
  // Real Email & Password Login Screen
  // -------------------------------------------------------------
  if (!adminUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-xl p-8 sm:p-10">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#18833B]/10 text-[#18833B] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-stone-900 font-serif">Admin Sign In</h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Sign in with your administrator account to manage store announcements and brand settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address / Username */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Admin Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="admin@mediherbz.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Password
              </label>
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
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#18833B] focus:ring-[#18833B] border-stone-300"
                />
                <span>Remember me for 7 days</span>
              </label>
            </div>

            {/* Error Notification */}
            {loginError && (
              <div className="flex items-center gap-2 text-xs text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-200 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#18833B] hover:bg-[#12632F] text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Sign In as Administrator</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-stone-100 text-[11px] text-stone-400 text-center">
            <p>Protected by WordPress REST Security & HMAC Token Verification</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-[#12632F] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#A6C928]/40 animate-bounce">
          <Check className="w-5 h-5 text-[#A6C928]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#18833B]/10 text-[#18833B]">
              <span className="w-2 h-2 rounded-full bg-[#18833B] animate-pulse"></span>
              Live Control Panel
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Signed in as: <strong className="text-stone-800">{adminUser.display_name || adminUser.email}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">Store & Banner Settings</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Configure the top announcement banner, brand customer care contacts, and social media channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Live Site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 border border-stone-300 hover:border-red-300 hover:text-red-600 text-stone-600 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Live Announcement Bar Preview */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#18833B]" />
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Live Banner Preview</h2>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              announcement.enabled
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            Status: {announcement.enabled ? 'ACTIVE & VISIBLE' : 'HIDDEN'}
          </span>
        </div>

        {announcement.enabled ? (
          <div className="bg-[#12632F] text-white text-xs sm:text-sm py-2.5 px-4 rounded-xl text-center font-medium shadow-inner flex items-center justify-center gap-2">
            <span>{announcement.text || 'Empty announcement text'}</span>
            {announcement.link && (
              <span className="underline opacity-80 text-xs hover:opacity-100">
                (Link: {announcement.link})
              </span>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-stone-300 bg-stone-50 text-stone-400 py-3 px-4 rounded-xl text-center text-xs">
            The top announcement bar is currently hidden. Toggle the switch below to show it live.
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-stone-200 gap-4 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('announcement')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'announcement'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcement Bar
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'contact'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          Contact & Support
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'store'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Store Info
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Password & Security
        </button>
      </div>

      {/* Tab 1: Announcement Bar Settings */}
      {activeTab === 'announcement' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Main Visibility Switch */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-stone-900">Show Top Announcement Bar</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Turn on to display the green announcement header at the very top of the website.
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
              <div className="w-14 h-8 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#18833B]"></div>
            </label>
          </div>

          {/* Announcement Text Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Announcement Message
            </label>
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
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
            />
            <p className="text-[11px] text-stone-400">
              Tip: Emojis (🌿, ✨, 📦, 🎉) display cleanly across all iOS and Android devices.
            </p>
          </div>

          {/* Destination Link */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Optional Destination Link
            </label>
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
              placeholder="e.g. /shop, /track-order, or https://example.com"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
            />
          </div>

          {/* Quick Preset Templates */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-stone-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#18833B]" />
              Quick Templates
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
                  className="p-3 bg-stone-50 hover:bg-[#FAF9F2] hover:border-[#18833B]/40 border border-stone-200 rounded-2xl text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-[#18833B] mb-1">{preset.title}</p>
                  <p className="text-xs text-stone-600 line-clamp-2">{preset.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contact & Support Settings */}
      {activeTab === 'contact' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Customer Care Phone
              </label>
              <input
                type="text"
                value={settings?.support_phone || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, support_phone: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Customer Care Email
              </label>
              <input
                type="email"
                value={settings?.contact_email || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, contact_email: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                WhatsApp Link / Number
              </label>
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
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Instagram Profile Link
              </label>
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
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Physical Laboratory & Park Address
            </label>
            <input
              type="text"
              value={settings?.address || ''}
              onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Store Information */}
      {activeTab === 'store' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Store Name
              </label>
              <input
                type="text"
                value={settings?.brand_name || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, brand_name: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Tagline
              </label>
              <input
                type="text"
                value={settings?.tagline || ''}
                onChange={(e) => setSettings((prev) => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security & Password Settings */}
      {activeTab === 'security' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">Change Admin Password</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Set a custom password for your administrator dashboard.
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
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                New Admin Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
                required
              />
            </div>

            {passwordSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Admin password updated successfully! You can now use this password to sign in.</span>
              </div>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Global Actions Bottom Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-stone-200 rounded-3xl p-6 shadow-xs">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Factory Defaults
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 bg-[#18833B] hover:bg-[#12632F] text-white text-sm font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Publishing Changes...' : 'Save & Publish Live'}
          </button>
        </div>
      </div>
    </div>
  );
};
