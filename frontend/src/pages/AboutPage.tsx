import React from 'react';
import { Leaf, Award, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Our Heritage &amp; Philosophy</span>
        <h1 className="text-4xl sm:text-5xl font-black text-[#26352A] font-serif">
          Rooted in Ayurvedic Wisdom, Crafted for Modern Living.
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Mediherbz was born out of a singular dedication: to make genuine, unadulterated botanical healing accessible without compromise. Tagline: <em>For Young &amp; Vibrant Look</em>.
        </p>
      </div>

      <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80"
          alt="Ayurvedic Botanical Sanctuary"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-serif text-[#26352A]">
            The Sacred Kshir Pak Method
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            In modern commercial production, cosmetic oils are typically mass-produced in high-speed blenders using petroleum by-products like liquid paraffin and synthetic fragrances. At Mediherbz, we refuse these shortcuts.
          </p>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We faithfully adhere to the classical Kshir Pak Vidhi described in the Charaka Samhita. Hand-picked whole herbs—including wild Bhringraj, Brahmi, and Amalaki—are simmered slowly with cow’s milk and cold-pressed unrefined sesame oil over 72 hours. This gentle extraction draws out lipid-soluble phyto-nutrients without burning or degrading vital enzymes.
          </p>
        </div>

        <div className="bg-[#FAF9F2] p-8 rounded-3xl border border-stone-200/80 space-y-5">
          <h3 className="font-bold text-base text-[#18833B]">Our Five Purity Commitments:</h3>
          <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
            <li className="flex items-center gap-3">
              <Leaf className="w-5 h-5 text-[#18833B] shrink-0" />
              <span>100% Wild-Harvested &amp; Ethically Foraged Herbs</span>
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#18833B] shrink-0" />
              <span>0% Mineral Oils, Parabens, Silicones, or Dyes</span>
            </li>
            <li className="flex items-center gap-3">
              <Award className="w-5 h-5 text-[#18833B] shrink-0" />
              <span>Standardized High-Potency Botanical Extracts</span>
            </li>
            <li className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#18833B] shrink-0" />
              <span>Cruelty-Free &amp; Environmentally Responsible</span>
            </li>
            <li className="flex items-center gap-3">
              <HeartHandshake className="w-5 h-5 text-[#18833B] shrink-0" />
              <span>Direct Fair Trade Support for Tribal Harvesters</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

