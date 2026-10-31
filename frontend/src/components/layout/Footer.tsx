import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Leaf, Award, Truck, Mail, Phone, MapPin, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#12632F] text-white pt-16 pb-8 border-t border-[#18833B]/40">
      {/* Trust Badges Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#18833B] flex items-center justify-center mb-3 text-[#A6C928]">
              <Leaf className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm">100% Herbal &amp; Pure</h4>
            <p className="text-xs text-white/70 mt-1">Zero parabens, sulfates or mineral oils</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#18833B] flex items-center justify-center mb-3 text-[#A6C928]">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm">AYUSH &amp; GMP Certified</h4>
            <p className="text-xs text-white/70 mt-1">Manufactured in certified clean rooms</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#18833B] flex items-center justify-center mb-3 text-[#A6C928]">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm">Free Express Shipping</h4>
            <p className="text-xs text-white/70 mt-1">Across all Indian pin codes over ₹999</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#18833B] flex items-center justify-center mb-3 text-[#A6C928]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm">Secure Razorpay Payments</h4>
            <p className="text-xs text-white/70 mt-1">UPI, Cards, NetBanking, 100% Protected</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <img
              src="/brand/mediherbz-logo.png"
              alt="Mediherbz Logo"
              className="h-12 w-auto bg-white/95 p-1.5 rounded-lg"
            />
            <p className="text-sm text-white/80 leading-relaxed pr-6">
              Mediherbz brings sacred Ayurvedic wisdom to contemporary daily rituals. Every herbal oil, churna, and botanical serum is slow-infused to deliver deep nourishment for a young &amp; vibrant look.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-[#A6C928] font-bold flex items-center gap-1.5">
                <Share2 className="w-4 h-4" /> Follow @mediherbz
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm text-[#A6C928] uppercase tracking-wider mb-4">Shop Categories</h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link to="/shop?category=herbal-hair-care" className="hover:text-[#A6C928] transition-colors">Herbal Hair Oils</Link></li>
              <li><Link to="/shop?category=herbal-skin-care" className="hover:text-[#A6C928] transition-colors">Herbal Skin Serums</Link></li>
              <li><Link to="/shop?category=ayurvedic-products" className="hover:text-[#A6C928] transition-colors">Classical Ayurvedic</Link></li>
              <li><Link to="/shop?category=herbal-supplements" className="hover:text-[#A6C928] transition-colors">Organic Supplements</Link></li>
              <li><Link to="/shop?category=herbal-kits-combos" className="hover:text-[#A6C928] transition-colors">Combos &amp; Kits</Link></li>
              <li><Link to="/shop" className="hover:text-[#A6C928] transition-colors font-medium">Browse All (11)</Link></li>
            </ul>
          </div>

          {/* Help & Policies */}
          <div>
            <h3 className="font-semibold text-sm text-[#A6C928] uppercase tracking-wider mb-4">Customer Care</h3>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li><Link to="/track-order" className="hover:text-[#A6C928] transition-colors">Track Order</Link></li>
              <li><Link to="/about" className="hover:text-[#A6C928] transition-colors">Shipping &amp; Delivery</Link></li>
              <li><Link to="/about" className="hover:text-[#A6C928] transition-colors">Returns &amp; Refunds</Link></li>
              <li><Link to="/about" className="hover:text-[#A6C928] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/about" className="hover:text-[#A6C928] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-semibold text-sm text-[#A6C928] uppercase tracking-wider mb-4">Direct Contact</h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A6C928] shrink-0 mt-0.5" />
                <span>Mediherbz Herbal Laboratories, Botanical Park, Kerala, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A6C928] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A6C928] shrink-0" />
                <span>care@mediherbz.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-white/60 gap-4">
        <p>© {new Date().getFullYear()} Mediherbz. All rights reserved. For Young &amp; Vibrant Look.</p>
        <p className="text-center md:text-right">
          Disclaimer: Ayurvedic descriptions are based on traditional knowledge systems and do not claim to treat, cure, or diagnose chronic diseases without medical consultation.
        </p>
      </div>
    </footer>
  );
};
