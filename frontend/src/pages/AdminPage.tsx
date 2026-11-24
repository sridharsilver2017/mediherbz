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
  Globe,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BrandSettings } from '../types';
import { INITIAL_BRAND_SETTINGS } from '../data/mockData';
import { api } from '../api/client';

const DEFAULT_PIN = 'mediherbz2026';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('mediherbz_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [settings, setSettings] = useState<BrandSettings>(INITIAL_BRAND_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'announcement' | 'contact' | 'security'>('announcement');

  const [customPin, setCustomPin] = useState(() => {
    return localStorage.getItem('mediherbz_admin_pin') || DEFAULT_PIN;
  });
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.getBrandSettings().then((data) => {
      if (isMounted) {
        setSettings(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPin = localStorage.getItem('mediherbz_admin_pin') || DEFAULT_PIN;
    if (pinInput.trim() === storedPin.trim()) {
      setIsAuthenticated(true);
      sessionStorage.setItem('mediherbz_admin_auth', 'true');
      setPinError('');
    } else {
      setPinError('Invalid admin passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('mediherbz_admin_auth');
    setPinInput('');
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
    if (window.confirm('Reset all brand and announcement settings back to system defaults?')) {
      const def = await api.resetBrandSettings();
      setSettings(def);
      setToastMessage('Settings restored to initial factory defaults.');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      alert('Passcode must be at least 4 characters long.');
      return;
    }
    localStorage.setItem('mediherbz_admin_pin', newPinInput.trim());
    setCustomPin(newPinInput.trim());
    setNewPinInput('');
    setPinChangeSuccess(true);
    setTimeout(() => setPinChangeSuccess(false), 3000);
  };

  // -------------------------------------------------------------
  // Passcode Lock Screen
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-xl p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-[#18833B]/10 text-[#18833B] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-stone-900 font-serif mb-2">Mediherbz Admin</h1>
          <p className="text-xs sm:text-sm text-stone-500 mb-6">
            Enter your admin passcode to configure banner announcements and brand settings.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder="Enter admin passcode"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-center text-base tracking-widest font-mono focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label="Toggle password visibility"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {pinError && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#18833B] hover:bg-[#12632F] text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              Unlock Admin Dashboard
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 text-[11px] text-stone-400">
            <span>Default passcode: </span>
            <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-mono">mediherbz2026</code>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated Admin Dashboard
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

      {/* Top Header Bar */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#18833B]/10 text-[#18833B]">
              <span className="w-2 h-2 rounded-full bg-[#18833B] animate-pulse"></span>
              Live Control Panel
            </span>
            <span className="text-xs text-stone-400">• Mediherbz v1.2</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">Store & Banner Settings</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Toggle and customize the top announcement bar, brand contact information, and store notices.
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
            <Lock className="w-3.5 h-3.5" />
            Lock
          </button>
        </div>
      </div>

      {/* Live Announcement Bar Preview Banner */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#18833B]" />
            <h2 className="text-sm font-bold text-stone-800 uppercase tracking-wider">Live Banner Preview</h2>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              settings.announcement_bar.enabled
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            Status: {settings.announcement_bar.enabled ? 'ACTIVE & VISIBLE' : 'HIDDEN'}
          </span>
        </div>

        {settings.announcement_bar.enabled ? (
          <div className="bg-[#12632F] text-white text-xs sm:text-sm py-2.5 px-4 rounded-xl text-center font-medium shadow-inner flex items-center justify-center gap-2">
            <span>{settings.announcement_bar.text || 'Empty announcement text'}</span>
            {settings.announcement_bar.link && (
              <span className="underline opacity-80 text-xs hover:opacity-100">
                (Link: {settings.announcement_bar.link})
              </span>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-stone-300 bg-stone-50 text-stone-400 py-3 px-4 rounded-xl text-center text-xs">
            The top announcement bar is currently disabled and not shown to website visitors.
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
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'border-[#18833B] text-[#18833B]'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Admin Passcode
        </button>
      </div>

      {/* Tab 1: Announcement Bar Settings */}
      {activeTab === 'announcement' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Main Visibility Switch */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-stone-900">Show Announcement Bar</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Turn on to display the green announcement header at the very top of the website.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement_bar.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement_bar: {
                      ...settings.announcement_bar,
                      enabled: e.target.checked,
                    },
                  })
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
              value={settings.announcement_bar.text}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcement_bar: {
                    ...settings.announcement_bar,
                    text: e.target.value,
                  },
                })
              }
              placeholder="e.g. 🌿 Free Shipping in India on Orders Over ₹999 • 100% Ayurvedic & Organic"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
            />
            <p className="text-[11px] text-stone-400">
              Tip: You can use emojis (🌿, ✨, 📦, 🎉) to make announcements stand out.
            </p>
          </div>

          {/* Destination Link */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Optional Destination Link
            </label>
            <input
              type="text"
              value={settings.announcement_bar.link || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcement_bar: {
                    ...settings.announcement_bar,
                    link: e.target.value,
                  },
                })
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
                    setSettings({
                      ...settings,
                      announcement_bar: {
                        enabled: true,
                        text: preset.text,
                        link: preset.link,
                      },
                    })
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
                Support Phone Number
              </label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Support Email Address
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                WhatsApp Link / Number
              </label>
              <input
                type="text"
                value={settings.social_links.whatsapp || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, whatsapp: e.target.value },
                  })
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
                value={settings.social_links.instagram || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, instagram: e.target.value },
                  })
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
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Security & Passcode */}
      {activeTab === 'security' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-stone-900">Change Admin Passcode</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Update the passcode required to access this control panel.
            </p>
          </div>

          <form onSubmit={handleUpdatePin} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                New Passcode
              </label>
              <input
                type="text"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="Enter new 4+ character passcode"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-hidden focus:border-[#18833B] focus:ring-1 focus:ring-[#18833B]"
              />
            </div>

            {pinChangeSuccess && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Admin passcode updated successfully!
              </p>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Update Passcode
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
