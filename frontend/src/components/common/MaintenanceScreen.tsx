import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, Clock, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { BrandSettings } from '../../types';

interface MaintenanceScreenProps {
  settings?: BrandSettings['maintenance_mode'];
  brandSettings?: BrandSettings;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ settings, brandSettings }) => {
  const title = settings?.title || '🌿 We are Refreshing our Herbal Sanctuary';
  const message =
    settings?.message ||
    'Mediherbz is currently undergoing scheduled wellness upgrades and inventory replenishment. We will be back online shortly with fresh Ayurvedic harvests!';
  const expectedTime = settings?.expected_back_time || 'Back online shortly';
  const phone = brandSettings?.support_phone || '+91 98765 43210';
  const email = brandSettings?.contact_email || 'care@mediherbz.com';
  const whatsappUrl = brandSettings?.social_links?.whatsapp || 'https://wa.me/919876543210';

  return (
    <div className="min-h-screen bg-[#FAF9F2] text-[#26352A] flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#18833B] selection:text-white">
      {/* Top Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pt-2">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/brand/mediherbz-logo.png"
            alt="Mediherbz"
            className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-102"
          />
        </Link>
        <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Maintenance Active
        </span>
      </div>

      {/* Main Content Centerpiece */}
      <div className="max-w-2xl mx-auto w-full my-auto py-12 text-center space-y-6 animate-fadeIn">
        {/* Animated Botanical Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#18833B] text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Scheduled Botanical Enhancements</span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif text-stone-900 tracking-tight leading-tight">
          {title}
        </h1>

        {/* Message */}
        <p className="text-sm sm:text-base text-stone-600 font-medium max-w-lg mx-auto leading-relaxed">
          {message}
        </p>

        {/* Expected Time Notice */}
        {expectedTime && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-stone-200/80 shadow-2xs text-xs font-semibold text-stone-700">
            <Clock className="w-4 h-4 text-[#18833B]" />
            <span>Estimated return: <strong className="text-stone-900">{expectedTime}</strong></span>
          </div>
        )}

        {/* Direct Contact & Support Cards */}
        <div className="pt-6">
          <p className="text-xs uppercase tracking-wider font-bold text-stone-400 mb-3">
            Urgent queries or ongoing orders?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-emerald-50 text-stone-800 hover:text-[#18833B] rounded-xl border border-stone-200 transition-all shadow-2xs text-xs font-bold"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Us</span>
            </a>

            {/* Direct Call */}
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-emerald-50 text-stone-800 hover:text-[#18833B] rounded-xl border border-stone-200 transition-all shadow-2xs text-xs font-bold"
            >
              <Phone className="w-4 h-4 text-[#18833B]" />
              <span>Call Helpline</span>
            </a>

            {/* Email Support */}
            <a
              href={`mailto:${email}`}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-emerald-50 text-stone-800 hover:text-[#18833B] rounded-xl border border-stone-200 transition-all shadow-2xs text-xs font-bold"
            >
              <Mail className="w-4 h-4 text-[#18833B]" />
              <span>Email Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer & Admin Entry Point */}
      <div className="max-w-4xl mx-auto w-full pt-8 pb-2 border-t border-stone-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#18833B]" />
          <span>&copy; {new Date().getFullYear()} Mediherbz. Authentic Ayurvedic Wellness.</span>
        </div>

        {/* Discreet link to /admin so staff can log in and turn off maintenance */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-800 transition-colors font-medium text-[11px] px-2 py-1 rounded-md hover:bg-stone-100"
          title="Staff and Store Administrator Portal"
        >
          <Lock className="w-3 h-3" />
          <span>Staff Login</span>
        </Link>
      </div>
    </div>
  );
};
