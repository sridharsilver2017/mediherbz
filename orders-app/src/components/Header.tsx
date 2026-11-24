import React from 'react';
import { Package, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
  onLogout: () => void;
  adminUsername: string;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, loading, onLogout, adminUsername }) => {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#18833B]/10 flex items-center justify-center text-[#18833B]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-stone-900 text-base sm:text-lg tracking-tight">Mediherbz Orders</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#18833B]" /> Live WC
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block">Headless Order Management &amp; Dispatch Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh orders from WooCommerce"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#18833B]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="h-6 w-px bg-stone-200" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#18833B] text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
              {adminUsername.slice(0, 1) || 'A'}
            </div>
            <span className="text-xs font-bold text-stone-800 hidden md:inline">{adminUsername}</span>
          </div>

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
