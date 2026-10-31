import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { Product, ProductCategory } from '../types';
import { api } from '../api/client';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const selectedCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'default';

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          api.getCategories(),
          api.getProducts({
            category: selectedCategory,
            search: searchQuery,
            sort: currentSort,
          }),
        ]);
        setCategories(cats);
        setProducts(prods);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory, searchQuery, currentSort]);

  const handleCategoryChange = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
    setMobileFilterOpen(false);
  };

  const handleSortChange = (sort: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sort === 'default') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', sort);
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-[#18833B] font-semibold">Herbal Shop</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#26352A] font-serif">
          {searchQuery ? `Search results for "${searchQuery}"` : 'All Botanical Formulations'}
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Showing {products.length} verified pure herbal and Ayurvedic wellness products
        </p>

        {searchQuery && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-xs font-semibold text-stone-700">
            <span>Query: {searchQuery}</span>
            <button onClick={clearSearch} className="hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid with Sidebar Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-sm text-[#26352A] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#18833B]" /> Categories
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-[#18833B] text-white'
                      : 'text-stone-600 hover:bg-[#FAF9F2] hover:text-[#18833B]'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-[#18833B] text-white'
                        : 'text-stone-600 hover:bg-[#FAF9F2] hover:text-[#18833B]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === cat.slug ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ayurvedic Purity Pledge */}
            <div className="p-4 rounded-xl bg-[#FAF9F2] border border-[#18833B]/20 text-xs space-y-2">
              <p className="font-bold text-[#18833B]">🌱 100% Guaranteed Purity</p>
              <p className="text-stone-600 leading-relaxed">
                All formulations adhere strictly to classical Ayurvedic pharmacopoeia standards and AYUSH department regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Product Listing Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Sort & Mobile Filter Trigger Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-4">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#18833B]" /> Filters
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-500 font-medium">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-xs font-semibold text-stone-800 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="default">Featured / Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
              <p className="text-4xl">🌿</p>
              <h3 className="text-lg font-bold text-stone-800">No herbal products matched your criteria</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try clearing active filters or searching with alternative keywords like Bhringraj, Kumkumadi, or Ashwagandha.
              </p>
              <button
                onClick={() => handleCategoryChange('all')}
                className="px-6 py-2.5 bg-[#18833B] text-white text-xs font-bold rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

