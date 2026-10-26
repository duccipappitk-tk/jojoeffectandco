import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Product, Category } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onNavigate: (route: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = products.filter(p => {
    const matchesQuery = 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = 
      selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  const handleSelectProduct = (slug: string) => {
    onClose();
    onNavigate(`/product/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center gap-3 bg-[#F9FAFB]">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search hair, bags, watches, phone accessories..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#111111] placeholder:text-neutral-400 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-neutral-400 hover:text-neutral-600 px-2 py-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-4 py-2.5 bg-white border-b border-[#E5E7EB] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#111111] text-[#D4AF62]'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Items
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#111111] text-[#D4AF62]'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-[#F5F5F5]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-neutral-500">No products found matching &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-neutral-400 mt-1">Try searching for hair, handbag, watch, or case.</p>
            </div>
          ) : (
            filtered.map(product => {
              const img = product.images.find(i => i.is_primary)?.url || product.images[0]?.url;
              const cat = categories.find(c => c.id === product.category_id)?.name;
              const price = product.sale_price || product.base_price;

              return (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.slug)}
                  className="py-3 flex items-center gap-4 hover:bg-[#F9FAFB] -mx-4 px-4 transition-colors cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-neutral-100 rounded-md overflow-hidden shrink-0 border border-neutral-200">
                    {img ? (
                      <img
                        src={img}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 font-bold">
                        JJE
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-semibold text-[#D4AF62] tracking-wider block">
                      {cat}
                    </span>
                    <h4 className="text-xs font-semibold text-[#111111] truncate group-hover:text-[#D4AF62] transition-colors">
                      {product.name}
                    </h4>
                    <span className="text-xs font-bold text-[#111111] tabular-nums mt-0.5 block">
                      ${price.toFixed(2)} USD
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#111111] group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
