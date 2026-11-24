import React, { useState } from 'react';
import { Package, Lock, User, ArrowRight, AlertCircle, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

interface LoginScreenProps {
  onSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');

    try {
      const ok = await api.login(username.trim(), password);
      if (ok) {
        onSuccess(username.trim());
      } else {
        setError('Invalid admin credentials. Please check username and password.');
      }
    } catch {
      setError('Could not connect to WordPress authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E2818] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-[420px] h-[420px] bg-[#18833B]/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[420px] h-[420px] bg-[#A6C928]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#18833B_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Emblem */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-tr from-[#12632F] to-[#18833B] text-white shadow-xl shadow-emerald-950/60 ring-6 ring-white/10 relative">
            <Package className="w-8 h-8 text-white" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#A6C928] border-2 border-[#0E2818] flex items-center justify-center text-[9px] font-black text-emerald-950">
              ⚡
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-[#A6C928] border border-emerald-500/30 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Merchant Dispatch Terminal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-serif">
              Mediherbz Orders
            </h1>
            <p className="text-xs text-emerald-100/70 mt-1 max-w-xs mx-auto">
              Real-time WooCommerce order fulfillment, thermal packing slips &amp; live courier tracking.
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl p-7 sm:p-8 shadow-2xl shadow-black/40 border border-stone-200/90 relative overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#18833B] via-[#A6C928] to-[#12632F]" />

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                Admin Username or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-50/80 focus:bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#18833B] focus:ring-3 focus:ring-[#18833B]/10 transition-all"
                  autoFocus
                />
                <User className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">
                  Password
                </label>
                <span className="text-[10px] text-stone-400 font-medium">WooCommerce Store Admin</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 hover:bg-stone-50/80 focus:bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#18833B] focus:ring-3 focus:ring-[#18833B]/10 transition-all font-mono"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#18833B] hover:bg-[#12632F] text-white font-black rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg shadow-emerald-800/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to WooCommerce...</span>
                </>
              ) : (
                <>
                  <span>Open Orders Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Connection Status Footnote */}
          <div className="mt-6 pt-5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
            <div className="flex items-center gap-1.5 text-stone-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#18833B]" />
              <span>Pantheon Dev API Synced</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>TLS Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
