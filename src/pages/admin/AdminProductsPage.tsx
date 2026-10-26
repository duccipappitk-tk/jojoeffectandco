import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Star, 
  Eye, 
  EyeOff, 
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Product, Category } from '../../types';
import { storeService, resolveImageUrl } from '../../services/storeService';

interface AdminProductsPageProps {
  onNavigateAdmin: (route: string) => void;
  onNavigatePublic: (route: string) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  onNavigateAdmin,
  onNavigatePublic,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      storeService.getProducts(),
      storeService.getCategories(),
    ]);
    setProducts(p);
    setCategories(c);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePublish = async (product: Product) => {
    const updated = { ...product, is_published: !product.is_published };
    await storeService.saveProduct(updated);
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
  };

  const handleToggleFeatured = async (product: Product) => {
    const updated = { ...product, is_featured: !product.is_featured };
    await storeService.saveProduct(updated);
    setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from your catalog?`)) {
      await storeService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filtered = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF62] block">
            Inventory &amp; Merchandising
          </span>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Product Management
          </h1>
        </div>

        <button
          onClick={() => onNavigateAdmin('/admin/products/new')}
          className="px-4 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
          />
        </div>

        {/* Category filter */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 bg-neutral-50 border border-neutral-200 text-xs font-semibold text-[#111111] py-2 px-3 rounded-md focus:outline-none focus:border-[#D4AF62]"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-bold uppercase">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-xs text-neutral-500 space-y-2">
            <p>No products found matching your search.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="text-[#D4AF62] font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (USD)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F5F5]">
                {filtered.map(product => {
                  const cat = categories.find(c => c.id === product.category_id)?.name;
                  const img = product.images.find(i => i.is_primary)?.url || product.images[0]?.url;
                  const price = product.sale_price || product.base_price;

                  return (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                      {/* Product Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-neutral-100 rounded-md overflow-hidden shrink-0 border border-neutral-200">
                            {img ? (
                              <img 
                                src={resolveImageUrl(img)} 
                                alt={product.name} 
                                onError={(e) => {
                                  e.currentTarget.src = '/images/hero_luxe_collection.jpg';
                                }}
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400">JJE</div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-semibold text-[#111111] block truncate">{product.name}</span>
                            <span className="text-[11px] text-neutral-400 font-mono">/{product.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-medium text-neutral-700">
                        {cat || 'Unassigned'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-bold text-[#111111] tabular-nums">
                        ${price.toFixed(2)}
                        {product.sale_price && (
                          <span className="block text-[10px] text-neutral-400 line-through">
                            ${product.base_price.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tabular-nums ${
                          product.stock_quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : product.stock_quantity <= 5
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {product.stock_quantity} in stock
                        </span>
                      </td>

                      {/* Status Toggles */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePublish(product)}
                            title={product.is_published ? 'Published (Click to hide)' : 'Hidden (Click to publish)'}
                            className={`p-1.5 rounded transition-colors ${
                              product.is_published ? 'text-emerald-700 bg-emerald-50' : 'text-neutral-400 bg-neutral-100'
                            }`}
                          >
                            {product.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleToggleFeatured(product)}
                            title={product.is_featured ? 'Featured on Homepage' : 'Standard'}
                            className={`p-1.5 rounded transition-colors ${
                              product.is_featured ? 'text-[#D4AF62] bg-[#D4AF62]/10' : 'text-neutral-300 hover:text-neutral-500'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onNavigatePublic(`/product/${product.slug}`)}
                            title="View on public store"
                            className="p-1.5 text-neutral-400 hover:text-[#111111] transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onNavigateAdmin(`/admin/products/edit/${product.id}`)}
                            title="Edit product"
                            className="p-1.5 text-neutral-500 hover:text-[#D4AF62] transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            title="Delete product"
                            className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
