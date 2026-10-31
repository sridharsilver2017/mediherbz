import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, HeartPulse, Award, CheckCircle, Clock } from 'lucide-react';
import { HeroSlider } from '../components/home/HeroSlider';
import { ProductCard } from '../components/product/ProductCard';
import { Product, ProductCategory, BlogPost } from '../types';
import { api } from '../api/client';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [feat, best, cats, blgs] = await Promise.all([
          api.getFeaturedProducts(),
          api.getBestsellers(),
          api.getCategories(),
          api.getBlogs(),
        ]);
        setFeaturedProducts(feat);
        setBestsellers(best);
        setCategories(cats);
        setBlogs(blgs);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* Big Hero Slider */}
      <HeroSlider />

      {/* Shop By Herbal Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Categorized Wellness</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#26352A] font-serif mt-1">
              Shop by Botanical Category
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-[#18833B] hover:text-[#12632F] flex items-center gap-1 mt-3 md:mt-0">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group p-5 bg-white rounded-2xl border border-stone-200/80 hover:border-[#18833B] hover:shadow-lg transition-all text-center flex flex-col items-center justify-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FAF9F2] group-hover:bg-[#18833B] text-[#18833B] group-hover:text-white flex items-center justify-center transition-all mb-3">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-[#26352A] group-hover:text-[#18833B] transition-colors">
                {cat.name}
              </h3>
              <span className="text-[11px] text-stone-400 mt-1">
                {cat.count} items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Botanical Formulations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Curated Selections</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#26352A] font-serif mt-1">
              Featured Formulations
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-[#18833B] hover:text-[#12632F] flex items-center gap-1">
            See More <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Why Mediherbz Value Section */}
      <section className="bg-white py-16 sm:py-20 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">The Mediherbz Difference</span>
            <h2 className="text-3xl font-black text-[#26352A] font-serif mt-1">
              Ancient Wisdom, Proven Purity
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              We uphold rigorous classical Ayurvedic protocols ensuring every bottle and jar offers true healing potency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#FAF9F2] border border-stone-200/60 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#18833B] text-[#A6C928] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#26352A]">Authentic Kshir Pak Vidhi</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Our oils are never cold-blended with perfumes. We slow-simmer whole medicinal roots in pure milk and cold-pressed oils for 72 consecutive hours.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#FAF9F2] border border-stone-200/60 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#12632F] text-[#A6C928] flex items-center justify-center mx-auto shadow-md">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#26352A]">Zero Synthetic Adulterants</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Free from mineral oil, paraffin, silicones, artificial fragrance, parabens, and micro-plastics. Pure, wholesome nutrition for scalp and skin.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#FAF9F2] border border-stone-200/60 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F28A13] text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#26352A]">Standardized Extracts</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Every batch of our supplements undergoes HPLC testing to verify active bio-markers such as Withanolides and Curcuminoids.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-bold text-[#F28A13] uppercase tracking-wider">Customer Favorites</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#26352A] font-serif mt-1">
              Most Loved Products
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-[#18833B] hover:text-[#12632F] flex items-center gap-1">
            Shop All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Wellness Journal & Educational Blog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <span className="text-xs font-bold text-[#18833B] uppercase tracking-wider">Ayurvedic Wisdom</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#26352A] font-serif mt-1">
              From Our Wellness Journal
            </h2>
          </div>
          <Link to="/blog" className="text-sm font-bold text-[#18833B] hover:text-[#12632F] flex items-center gap-1">
            Read All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((blog) => (
            <article
              key={blog.id}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col"
            >
              <div className="aspect-16/10 overflow-hidden bg-stone-100">
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                    <span className="bg-[#18833B]/10 text-[#18833B] font-bold px-2.5 py-0.5 rounded-full">
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {blog.read_time}
                    </span>
                  </div>
                  <Link to={`/blog/${blog.slug}`}>
                    <h3 className="font-bold text-base text-[#26352A] hover:text-[#18833B] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-stone-500 mt-2 line-clamp-3">
                    {blog.excerpt}
                  </p>
                </div>
                <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between">
                  <span className="text-xs text-stone-500 italic">{blog.author}</span>
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="text-xs font-bold text-[#18833B] hover:underline"
                  >
                    Read Story →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#18833B] rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-xl">
          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black font-serif">
              Join the Mediherbz Wellness Circle
            </h2>
            <p className="text-sm text-emerald-100">
              Receive seasonal Ayurvedic lifestyle guides, secret herbal remedies, and enjoy 10% off your very first order.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Mediherbz Wellness!'); }} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white text-[#26352A] text-sm focus:outline-hidden placeholder:text-stone-400"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#A6C928] hover:bg-[#b8dd32] text-[#12632F] font-black rounded-xl text-sm transition-all shadow-md cursor-pointer"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[11px] text-emerald-200">
              We respect your privacy. Zero spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

