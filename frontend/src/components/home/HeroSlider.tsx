import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Leaf, HeartPulse } from 'lucide-react';

interface Slide {
  id: number;
  tag: string;
  tagIcon: 'sparkles' | 'leaf' | 'shield';
  headingRegular: string;
  headingAccent: string;
  tagline: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  bgGradient: string;
  floatingBadge: string;
  productCard: {
    title: string;
    category: string;
    rating: string;
    price: string;
    regularPrice: string;
    image: string;
    link: string;
    badge: string;
  };
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    tag: 'Authentic Ayurvedic Formulation',
    tagIcon: 'sparkles',
    headingRegular: 'For Young &',
    headingAccent: 'Vibrant Look.',
    tagline: 'Pure Himalayan Botanicals • Time-Honored Healing',
    description: 'Experience clinical-grade botanical synergy with our sacred Kumkumadi face elixir. Infused with pure high-altitude Kashmiri saffron, red sandalwood, and 26 sacred herbs to illuminate and deeply revitalize your natural glow.',
    primaryCtaText: 'Shop Radiance Elixir',
    primaryCtaLink: '/product/kumkumadi-radiance-youth-elixir-serum',
    secondaryCtaText: 'Explore All Formulations',
    secondaryCtaLink: '/shop',
    bgGradient: 'from-[#0e4822] via-[#12632F] to-[#18833B]',
    floatingBadge: '100% Wild Saffron Infused',
    productCard: {
      title: 'Kumkumadi Radiance Youth Elixir Serum',
      category: 'Natural Beauty & Radiance',
      rating: '★★★★★ 5.0 (98 reviews)',
      price: '₹1,250',
      regularPrice: '₹1,499',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      link: '/product/kumkumadi-radiance-youth-elixir-serum',
      badge: 'Award Winner',
    },
  },
  {
    id: 2,
    tag: '72-Hour Kshir Pak Vidhi',
    tagIcon: 'leaf',
    headingRegular: 'Revitalize Roots with',
    headingAccent: 'Kesh Ratna Oil.',
    tagline: 'Ancient Milk-Simmered Hair Vitalizer',
    description: 'Slow-simmered whole Bhringraj, Brahmi, and Amalaki in pure cow’s milk and virgin cold-pressed sesame oil. Arrests hair thinning, stops premature grays, and awakens dormant follicles naturally without mineral oil or silicones.',
    primaryCtaText: 'Discover Hair Vitalizer',
    primaryCtaLink: '/product/kesh-ratna-herbal-hair-vitalizer-oil',
    secondaryCtaText: 'View Hair Care Range',
    secondaryCtaLink: '/shop?category=herbal-hair-care',
    bgGradient: 'from-[#0b3b1c] via-[#13592c] to-[#1c783c]',
    floatingBadge: '72hr Slow Kshir Pak Vidhi',
    productCard: {
      title: 'Kesh Ratna Herbal Hair Vitalizer Oil',
      category: 'Herbal Hair & Scalp Nutrition',
      rating: '★★★★★ 4.9 (142 reviews)',
      price: '₹649',
      regularPrice: '₹799',
      image: 'https://images.unsplash.com/photo-1608248597359-009f485dbbc9?auto=format&fit=crop&w=800&q=80',
      link: '/product/kesh-ratna-herbal-hair-vitalizer-oil',
      badge: 'Best Seller',
    },
  },
  {
    id: 3,
    tag: 'Certified AYUSH Wellness Trio',
    tagIcon: 'shield',
    headingRegular: 'The Total Radiance',
    headingAccent: 'Combo Regimen.',
    tagline: 'Luxury Wooden Gift Box • Complete Holistic Ritual',
    description: 'Transform your daily regimen with our flagship 3-step ritual: Kesh Ratna Hair Vitalizer, Kumkumadi Youth Elixir, and Sandalwood Ubtan. Handcrafted for maximum rejuvenation and total vitality from crown to toe.',
    primaryCtaText: 'Claim Combo Offer (21% Off)',
    primaryCtaLink: '/product/total-youth-glow-complete-herbal-combo-kit',
    secondaryCtaText: 'Browse Kits & Bundles',
    secondaryCtaLink: '/shop?category=herbal-kits-combos',
    bgGradient: 'from-[#194e2a] via-[#1c6936] to-[#258a47]',
    floatingBadge: 'Complete 3-Step Ritual',
    productCard: {
      title: 'Total Youth & Glow Complete Herbal Combo',
      category: 'Curated Wellness Bundles',
      rating: '★★★★★ 5.0 (52 reviews)',
      price: '₹2,199',
      regularPrice: '₹2,797',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      link: '/product/total-youth-glow-complete-herbal-combo-kit',
      badge: 'Luxury Gift Box',
    },
  },
];

export const HeroSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const slide = HERO_SLIDES[current];

  return (
    <div
      className="relative overflow-hidden min-h-[580px] lg:min-h-[640px] flex items-center bg-stone-900 select-none text-white transition-all duration-700"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Background with dynamic smooth gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} transition-colors duration-1000`}
      />

      {/* Decorative Botanical Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#A6C928_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Glowing Ambient Spotlights */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#A6C928]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#F28A13]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Slide Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-fadeIn">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#A6C928]/20 border border-[#A6C928]/40 px-4 py-1.5 rounded-full text-xs font-bold text-[#A6C928] uppercase tracking-wider shadow-xs backdrop-blur-xs">
              {slide.tagIcon === 'sparkles' && <Sparkles className="w-4 h-4" />}
              {slide.tagIcon === 'leaf' && <Leaf className="w-4 h-4" />}
              {slide.tagIcon === 'shield' && <ShieldCheck className="w-4 h-4" />}
              <span>{slide.tag}</span>
            </div>

            {/* Main Headings */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight leading-[1.12]">
                {slide.headingRegular}{' '}
                <span className="text-[#A6C928] drop-shadow-xs">{slide.headingAccent}</span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-emerald-200 uppercase">
                {slide.tagline}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-emerald-50/90 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {slide.description}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to={slide.primaryCtaLink}
                className="w-full sm:w-auto px-8 py-4 bg-[#A6C928] hover:bg-[#b8dd32] text-[#12632F] font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <span>{slide.primaryCtaText}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={slide.secondaryCtaLink}
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold rounded-2xl transition-all text-sm sm:text-base text-center backdrop-blur-xs"
              >
                {slide.secondaryCtaText}
              </Link>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-white/15 max-w-lg mx-auto lg:mx-0">
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-black text-[#A6C928]">100%</p>
                <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">Pure Botanicals</p>
              </div>
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-black text-[#A6C928]">AYUSH</p>
                <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">Govt. Verified</p>
              </div>
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-black text-[#A6C928]">Free</p>
                <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium">Delivery &gt; ₹999</p>
              </div>
            </div>
          </div>

          {/* Right Hero Product Card Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl text-[#26352A] border-4 border-white/25 transition-all duration-500 hover:scale-[1.02]">
              
              {/* Image with overlay badge */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 mb-5 shadow-inner">
                <img
                  src={slide.productCard.image}
                  alt={slide.productCard.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <span className="absolute top-3 left-3 bg-[#18833B] text-white text-xs font-black px-3.5 py-1 rounded-full shadow-md uppercase tracking-wide">
                  {slide.productCard.badge}
                </span>
                <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-[#12632F] text-[11px] font-bold px-3 py-1 rounded-lg shadow-sm">
                  {slide.floatingBadge}
                </span>
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#18833B] uppercase tracking-wider">{slide.productCard.category}</span>
                  <span className="text-[#F28A13]">{slide.productCard.rating}</span>
                </div>

                <h3 className="text-base sm:text-lg font-black line-clamp-1 text-[#26352A]">
                  {slide.productCard.title}
                </h3>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#18833B]">
                      {slide.productCard.price}
                    </span>
                    <span className="text-xs text-stone-400 line-through">
                      {slide.productCard.regularPrice}
                    </span>
                  </div>
                  <Link
                    to={slide.productCard.link}
                    className="px-5 py-2.5 bg-[#18833B] hover:bg-[#12632F] text-white text-xs font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Prev / Next Slider Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicator Dots & Progress Bars */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {HERO_SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            className={`transition-all duration-300 rounded-full ${
              current === idx
                ? 'w-9 h-2.5 bg-[#A6C928] shadow-md'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
