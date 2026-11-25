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
    <header className="bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 shadow-xs w-full max-w-full pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 w-full">
        {/* Brand Left */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#12632F] to-[#18833B] flex items-center justify-center text-white shadow-md shadow-emerald-900/15 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-serif font-black text-stone-900 text-base sm:text-lg tracking-tight truncate">
                Mediherbz
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-[#18833B] animate-pulse shrink-0" title="Live orders sync" />
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-[#18833B] shadow-2xs">
                Live Hub
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block font-medium">
              Orders Management &amp; Dispatch Terminal
            </p>
          </div>
        </div>

        {/* Actions Right - High-accessibility Touch Targets */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 h-11 min-h-[44px]">
          {/* Notification Alert Toggle */}
          <button
            type="button"
            onClick={onToggleNotifications}
            style={{ minHeight: '44px', minWidth: '44px', height: '44px' }}
            className={`min-h-[44px] min-w-[44px] h-11 px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0 active:scale-95 ${
              notificationsEnabled
                ? 'bg-emerald-50 text-[#18833B] border border-emerald-300 hover:bg-emerald-100'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
            title={
              notificationsEnabled
                ? 'Alerts active. Tap to test notification & chime'
                : 'Click to enable instant notifications & chime'
            }
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="w-4 h-4 text-[#18833B] animate-bounce shrink-0" />
                <span className="hidden sm:inline">Alerts On</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 text-stone-500 shrink-0" />
                <span className="hidden sm:inline">Alerts</span>
              </>
            )}
          </button>

          {/* Test Sound Chime Button (visible when enabled) */}
          {notificationsEnabled && (
            <button
              type="button"
              onClick={onTestChime}
              style={{ minHeight: '44px', minWidth: '44px', width: '44px', height: '44px' }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] p-2.5 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 active:scale-95 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Test store audio chime & notification"
              aria-label="Test chime"
            >
              <Volume2 className="w-4 h-4 text-[#18833B]" />
            </button>
          )}

          {/* Refresh Orders Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{ minHeight: '44px', minWidth: '44px', height: '44px' }}
            className="min-h-[44px] min-w-[44px] h-11 px-3.5 py-2 text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs shrink-0"
            title="Pull fresh orders from database"
          >
            <RefreshCw className={`w-4 h-4 text-[#18833B] ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Download Native Android APK */}
          <a
            href="https://dev-medinerbz.pantheonsite.io/wp-content/uploads/mediherbz-orders.apk"
            download="mediherbz-orders.apk"
            target="_blank"
            rel="noopener noreferrer"
            style={{ minHeight: '44px', height: '44px' }}
            className="hidden md:inline-flex items-center min-h-[44px] h-11 gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0"
            title="Download Standalone Android APK to install on phone"
          >
            <Download className="w-4 h-4 text-[#18833B]" />
            <span>APK</span>
          </a>

          {/* External Storefront link */}
          <a
            href="https://mediherbz.pages.dev"
            target="_blank"
            rel="noreferrer"
            style={{ minHeight: '44px', height: '44px' }}
            className="hidden md:inline-flex items-center min-h-[44px] h-11 gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all shrink-0"
            title="View Live Storefront"
          >
            <Globe className="w-4 h-4" />
            <span>Store</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          <div className="h-6 w-px bg-stone-200 mx-0.5 hidden sm:block" />

          {/* Admin Avatar */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              style={{ minHeight: '44px', minWidth: '44px', width: '44px', height: '44px' }}
              className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-linear-to-tr from-[#12632F] to-[#18833B] text-white flex items-center justify-center text-xs font-black uppercase shadow-xs shrink-0"
            >
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
            style={{ minHeight: '44px', minWidth: '44px', width: '44px', height: '44px' }}
            className="w-11 h-11 min-w-[44px] min-h-[44px] p-2.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center active:scale-95"
            title="Sign out of Admin Dashboard"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
