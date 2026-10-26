import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  Search, 
  SlidersHorizontal, 
  X, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  initialCategorySlug?: string;
  onNavigate: (route: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  initialCategorySlug,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name'>('newest');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [priceMax, setPriceMax] = useState<number>(250);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (initialCategorySlug) {
      setSelectedCategory(initialCategorySlug);
    }
  }, [initialCategorySlug]);

  // Dynamic Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Must be published
      if (!product.is_published) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const cat = categories.find(c => c.slug === selectedCategory);
        if (cat && product.category_id !== cat.id) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // Stock status
      if (onlyInStock && product.stock_quantity <= 0) {
        return false;
      }

      // Price range
      const effectivePrice = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.base_price;
      if (effectivePrice > priceMax) {
        return false;
      }

      return true;
    });
  }, [products, categories, selectedCategory, searchQuery, onlyInStock, priceMax]);

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => {
          const priceA = a.sale_price || a.base_price;
          const priceB = b.sale_price || b.base_price;
          return priceA - priceB;
        });
      case 'price-desc':
        return list.sort((a, b) => {
          const priceA = a.sale_price || a.base_price;
          const priceB = b.sale_price || b.base_price;
          return priceB - priceA;
        });
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [filteredProducts, sortBy]);

  const activeCategoryName = categories.find(c => c.slug === selectedCategory)?.name || 'All Collections';

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header Banner */}
      <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
              Official Store
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mt-1 tracking-tight">
              {activeCategoryName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
              Explore authentic international finds from hair extensions and luxury wigs to designer handbags, watches, and smart accessories.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
          
          {/* Interactive Category Segmented Tabs (Anti-pill: clean interactive segmented control) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#111111] text-[#D4AF62]'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-[#111111] text-[#D4AF62]'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search collection..."
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF62]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="appearance-none bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#111111] py-1.5 pl-3 pr-8 rounded-md focus:outline-none focus:border-[#D4AF62] cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Product Name</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden p-2 border border-neutral-200 rounded-md hover:bg-neutral-50 text-neutral-600"
              title="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Layout: Sidebar Filter + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 space-y-8 pr-4">
            
            {/* Stock Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-3">Availability</h3>
              <label className="flex items-center gap-2.5 text-xs text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#111111] focus:ring-[#D4AF62] h-4 w-4 border-neutral-300"
                />
                <span>In Stock Items Only</span>
              </label>
            </div>

            {/* Max Price Filter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Max Price</h3>
                <span className="text-xs font-semibold text-[#111111] tabular-nums">${priceMax} USD</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                className="w-full accent-[#111111] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                <span>$20</span>
                <span>$250+</span>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedCategory !== 'all' || searchQuery || onlyInStock || priceMax < 250) && (
              <div className="pt-4 border-t border-neutral-100">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setOnlyInStock(false);
                    setPriceMax(250);
                  }}
                  className="text-xs text-[#D4AF62] hover:text-[#111111] font-semibold transition-colors cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            )}

            {/* Direct WhatsApp Ordering Note */}
            <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] text-xs text-neutral-600 space-y-2">
              <span className="font-bold text-[#111111] uppercase tracking-wide block">Personal Sourcing</span>
              <p className="leading-relaxed text-[11px]">
                Looking for a specific hair texture, custom watch style, or wholesale inquiries? Use our WhatsApp chat button anytime.
              </p>
            </div>

          </div>

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden col-span-1 p-4 bg-neutral-50 rounded-lg border border-neutral-200 mb-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-[#111111]">Filter Options</span>
                <button onClick={() => setMobileFilterOpen(false)} className="text-neutral-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <label className="flex items-center gap-2 text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={e => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#111111]"
                />
                <span>In Stock Only</span>
              </label>
              <div>
                <span className="text-xs text-neutral-600 block mb-1">Max Price: ${priceMax}</span>
                <input
                  type="range"
                  min="20"
                  max="250"
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#111111]"
                />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
              <span>Showing <strong>{sortedProducts.length}</strong> items</span>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="py-20 text-center bg-[#F9FAFB] rounded-xl border border-dashed border-neutral-300">
                <p className="text-sm font-semibold text-neutral-700">No items match your filter criteria.</p>
                <p className="text-xs text-neutral-400 mt-1">Try broadening your search or resetting price filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setOnlyInStock(false);
                    setPriceMax(250);
                  }}
                  className="mt-4 px-4 py-2 bg-[#111111] text-[#D4AF62] rounded text-xs font-bold uppercase tracking-wider"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map(product => {
                  const catName = categories.find(c => c.id === product.category_id)?.name;
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={catName}
                      onNavigate={onNavigate}
                    />
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
