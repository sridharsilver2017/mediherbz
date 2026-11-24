import React from 'react';
import {
  Package,
  RefreshCw,
  LogOut,
  Globe,
  ExternalLink,
  Bell,
  BellRing,
  Volume2,
  Download,
} from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  onLogout: () => void;
  adminUsername: string;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onTestChime: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  loading,
  onLogout,
  adminUsername,
  notificationsEnabled,
  onToggleNotifications,
  onTestChime,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 shadow-xs pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Left */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-lg bg-linear-to-tr from-[#12632F] to-[#18833B] flex items-center justify-center text-white shadow-md shadow-emerald-900/15">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-black text-stone-900 text-base sm:text-lg tracking-tight">
                Mediherbz
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#18833B] flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18833B] animate-pulse" />
                Live Hub
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block font-medium">
              Headless Orders Management &amp; Dispatch Terminal
            </p>
          </div>
        </div>

        {/* Actions Right */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Notification Alert Toggle */}
          <button
            type="button"
            onClick={onToggleNotifications}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              notificationsEnabled
                ? 'bg-emerald-50 text-[#18833B] border border-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
            title={
              notificationsEnabled
                ? 'Push alerts & audio chime active for new orders'
                : 'Click to enable instant push notifications & chime'
            }
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-[#18833B] animate-bounce" />
                <span className="hidden sm:inline">Alerts On</span>
                <span className="sm:hidden">Alerts</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Enable Alerts</span>
                <span className="sm:hidden">Alerts</span>
              </>
            )}
          </button>

          {/* Test Sound Chime & Notification Button (visible when enabled) */}
          {notificationsEnabled && (
            <button
              type="button"
              onClick={onTestChime}
              className="p-1.5 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all cursor-pointer flex items-center justify-center"
              title="Test order notification & audio chime"
            >
              <Volume2 className="w-3.5 h-3.5 text-[#18833B]" />
            </button>
          )}

          {/* Download Native Android APK */}
          <a
            href="/mediherbz-orders.apk"
            download="mediherbz-orders.apk"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-all shadow-2xs"
            title="Download Standalone Android APK to install on phone"
          >
            <Download className="w-3.5 h-3.5 text-[#18833B]" />
            <span>Android APK</span>
          </a>

          {/* External Storefront link */}
          <a
            href="https://mediherbz.pages.dev"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition-all"
            title="View Live Storefront"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Storefront</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          {/* Refresh Orders Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
            title="Pull fresh orders from WooCommerce database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#18833B] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync'}</span>
          </button>

          <div className="h-6 w-px bg-stone-200 mx-0.5" />

          {/* Admin Avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-[#12632F] to-[#18833B] text-white flex items-center justify-center text-xs font-black uppercase shadow-xs">
              {adminUsername.slice(0, 1) || 'A'}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-stone-900 block leading-tight">{adminUsername}</span>
              <span className="text-[10px] text-stone-400 block leading-none">Super Admin</span>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
