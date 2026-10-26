import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Star, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Product, Category, ProductImage, ProductVariant } from '../../types';
import { storeService } from '../../services/storeService';

interface AdminProductFormPageProps {
  productId?: string;
  onNavigateAdmin: (route: string) => void;
}

export const AdminProductFormPage: React.FC<AdminProductFormPageProps> = ({
  productId,
  onNavigateAdmin,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  // Dynamic Lists
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Material', value: '' },
    { key: 'Dimensions', value: '' },
  ]);

  useEffect(() => {
    const init = async () => {
      const cats = await storeService.getCategories();
      setCategories(cats);

      if (productId) {
        const products = await storeService.getProducts();
        const existing = products.find(p => p.id === productId);
        if (existing) {
          setName(existing.name);
          setSlug(existing.slug);
          setCategoryId(existing.category_id);
          setDescription(existing.description);
          setBasePrice(existing.base_price);
          setSalePrice(existing.sale_price !== null && existing.sale_price !== undefined ? String(existing.sale_price) : '');
          setStockQuantity(existing.stock_quantity);
          setIsPublished(existing.is_published);
          setIsFeatured(existing.is_featured);
          setIsNewArrival(existing.is_new_arrival);
          setImages(existing.images || []);
          setVariants(existing.variants || []);
          if (existing.specifications) {
            setSpecs(
              Object.entries(existing.specifications).map(([key, value]) => ({ key, value }))
            );
          }
        }
      } else if (cats.length > 0) {
        setCategoryId(cats[0].id);
      }
      setLoading(false);
    };
    init();
  }, [productId]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!productId) {
      // Auto-generate clean slug
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generated);
    }
  };

  // Direct File Upload from Mobile or Desktop
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await storeService.uploadImage(file);
        setImages(prev => [
          ...prev,
          {
            id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            url,
            is_primary: prev.length === 0,
            display_order: prev.length + 1,
            alt_text: name || file.name,
          },
        ]);
      } catch (err) {
        console.error('Failed to process image:', err);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (filtered.length > 0 && !filtered.some(i => i.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const handleSetPrimaryImage = (id: string) => {
    setImages(prev =>
      prev.map(img => ({
        ...img,
        is_primary: img.id === id,
      }))
    );
  };

  const handleAddVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        id: 'var-' + Date.now(),
        name: 'New Option',
        price_adjustment: 0,
        stock_quantity: 5,
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const handleAddSpec = () => {
    setSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !categoryId) {
      setErrorMsg('Please provide product name, slug, and category.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      // Build specifications map
      const specMap: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key.trim() && s.value.trim()) {
          specMap[s.key.trim()] = s.value.trim();
        }
      });

      const productPayload: Product = {
        id: productId || 'prod-' + Date.now(),
        category_id: categoryId,
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        specifications: specMap,
        base_price: Number(basePrice),
        sale_price: salePrice ? Number(salePrice) : null,
        stock_quantity: Number(stockQuantity),
        is_published: isPublished,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
        images: images.length > 0 ? images : [
          {
            id: 'fallback-img',
            url: '/src/assets/images/hero_luxe_collection_1793019935404.jpg',
            is_primary: true,
            display_order: 1,
            alt_text: name,
          }
        ],
        variants,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await storeService.saveProduct(productPayload);
      onNavigateAdmin('/admin/products');
    } catch (err: any) {
      setErrorMsg('Failed to save product: ' + (err.message || 'Unknown error'));
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-neutral-400 font-bold uppercase">Loading editor...</div>;
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <button
          onClick={() => onNavigateAdmin('/admin/products')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <h1 className="text-lg font-bold uppercase tracking-wider text-[#111111]">
          {productId ? 'Edit Product' : 'Create New Product'}
        </h1>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62] mb-3">
            1. General Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Luxury Two-Tone Fluted Bezel Watch"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="e.g. luxury-two-tone-watch"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] font-mono focus:outline-none focus:border-[#D4AF62]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Base Price ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={basePrice}
                onChange={e => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] font-mono focus:outline-none focus:border-[#D4AF62]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Sale Price ($ USD, Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={e => setSalePrice(e.target.value)}
                placeholder="Leave blank if no sale"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] font-mono focus:outline-none focus:border-[#D4AF62]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Available Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={e => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] font-mono focus:outline-none focus:border-[#D4AF62]"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="rounded text-[#111111] focus:ring-[#D4AF62]"
                />
                <span>Published</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={e => setIsFeatured(e.target.checked)}
                  className="rounded text-[#111111] focus:ring-[#D4AF62]"
                />
                <span>Featured</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={e => setIsNewArrival(e.target.checked)}
                  className="rounded text-[#111111] focus:ring-[#D4AF62]"
                />
                <span>New Arrival</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe materials, texture, styling recommendations..."
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
            />
          </div>
        </div>

        {/* 2. Product Photography & Image Upload */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62]">
                2. Product Imagery
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Upload photos directly from your phone, laptop, or desktop. Set one as primary.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Image Previews Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {images.map(img => (
              <div
                key={img.id}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 bg-neutral-100 group ${
                  img.is_primary ? 'border-[#D4AF62]' : 'border-neutral-200'
                }`}
              >
                <img
                  src={img.url}
                  alt="Product view"
                  className="w-full h-full object-cover"
                />
                
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryImage(img.id)}
                    title="Set as Primary"
                    className={`p-1.5 rounded-full ${img.is_primary ? 'bg-[#D4AF62] text-[#111111]' : 'bg-white text-neutral-700'}`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    title="Remove Image"
                    className="p-1.5 rounded-full bg-white text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {img.is_primary && (
                  <span className="absolute top-2 left-2 bg-[#D4AF62] text-[#111111] text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                    Primary
                  </span>
                )}
              </div>
            ))}

            {images.length === 0 && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-[#D4AF62] transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-neutral-400 mb-1" />
                <span className="text-xs font-semibold text-neutral-600">Click to upload photo</span>
                <span className="text-[10px] text-neutral-400">JPG, PNG, WebP</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Product Variations (Options) */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62]">
                3. Variations &amp; Sizes
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add size, hair length, colorway, or strap options.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Option</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={v.id} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <input
                  type="text"
                  placeholder="Option Name (e.g. 26 Inches)"
                  value={v.name}
                  onChange={e => {
                    const val = e.target.value;
                    setVariants(prev => prev.map((item, i) => i === idx ? { ...item, name: val } : item));
                  }}
                  className="flex-1 px-3 py-1.5 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
                />

                <div className="w-36 flex items-center gap-1">
                  <span className="text-xs text-neutral-500">+$</span>
                  <input
                    type="number"
                    step="1"
                    placeholder="Adj Price"
                    value={v.price_adjustment}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setVariants(prev => prev.map((item, i) => i === idx ? { ...item, price_adjustment: val } : item));
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded text-xs text-[#111111] font-mono"
                  />
                </div>

                <div className="w-28 flex items-center gap-1">
                  <span className="text-xs text-neutral-500">Stock</span>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock_quantity}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setVariants(prev => prev.map((item, i) => i === idx ? { ...item, stock_quantity: val } : item));
                    }}
                    className="w-full px-2 py-1.5 bg-white border border-neutral-200 rounded text-xs text-[#111111] font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveVariant(v.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {variants.length === 0 && (
              <p className="text-xs text-neutral-400 py-1 italic">
                No variants added. Product will be sold as a single standard item.
              </p>
            )}
          </div>
        </div>

        {/* 4. Specifications */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62]">
              4. Technical Specifications
            </h2>
            <button
              type="button"
              onClick={handleAddSpec}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#111111] rounded text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Spec Row</span>
            </button>
          </div>

          <div className="space-y-3">
            {specs.map((s, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Specification Name (e.g. Lace Type)"
                  value={s.key}
                  onChange={e => {
                    const val = e.target.value;
                    setSpecs(prev => prev.map((item, i) => i === idx ? { ...item, key: val } : item));
                  }}
                  className="w-1/3 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-semibold"
                />
                <input
                  type="text"
                  placeholder="Specification Value (e.g. 13x4 HD Transparent)"
                  value={s.value}
                  onChange={e => {
                    const val = e.target.value;
                    setSpecs(prev => prev.map((item, i) => i === idx ? { ...item, value: val } : item));
                  }}
                  className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="p-2 text-neutral-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => onNavigateAdmin('/admin/products')}
            className="px-6 py-2.5 bg-white border border-neutral-300 text-neutral-700 font-semibold rounded text-xs uppercase tracking-wider hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold rounded text-xs uppercase tracking-widest shadow-md cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : productId ? 'Update Product' : 'Create Product'}
          </button>
        </div>

      </form>
    </div>
  );
};
