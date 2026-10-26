import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Layers, 
  Check, 
  X,
  ExternalLink 
} from 'lucide-react';
import { Category } from '../../types';
import { storeService, resolveImageUrl } from '../../services/storeService';

interface AdminCategoriesPageProps {
  onNavigatePublic: (route: string) => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ onNavigatePublic }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const loadCategories = async () => {
    const list = await storeService.getCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('/images/hero_luxe_collection.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImageUrl(resolveImageUrl(cat.image_url));
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await storeService.uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    const newCat: Category = {
      id: editingCategory ? editingCategory.id : 'cat-' + Date.now(),
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      image_url: imageUrl || '/images/hero_luxe_collection.jpg',
      is_active: true,
      display_order: editingCategory ? editingCategory.display_order : categories.length + 1,
    };

    await storeService.saveCategory(newCat);
    await loadCategories();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      await storeService.deleteCategory(id);
      await loadCategories();
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF62] block">
            Store Taxonomy
          </span>
          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
            Categories &amp; Collections
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[4/3] bg-neutral-100">
                <img
                  src={resolveImageUrl(cat.image_url)}
                  alt={cat.name}
                  onError={(e) => {
                    e.currentTarget.src = '/images/hero_luxe_collection.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#111111] text-[#D4AF62] text-[10px] font-bold rounded">
                  #{cat.display_order}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-[#111111]">{cat.name}</h3>
                <span className="text-[11px] text-neutral-400 font-mono block mt-0.5">/{cat.slug}</span>
                <p className="text-xs text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
              <button
                onClick={() => onNavigatePublic(`/shop?category=${cat.slug}`)}
                className="text-xs font-medium text-neutral-600 hover:text-[#111111] inline-flex items-center gap-1"
              >
                <span>View Store</span>
                <ExternalLink className="w-3 h-3 text-[#D4AF62]" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 text-neutral-500 hover:text-[#D4AF62] transition-colors"
                  title="Edit category"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E5E7EB] w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Women's Hair"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="womens-hair"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-mono focus:outline-none focus:border-[#D4AF62]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Summary of this collection..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                  Cover Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 bg-neutral-100 rounded border border-neutral-200 overflow-hidden shrink-0">
                    <img 
                      src={resolveImageUrl(imageUrl)} 
                      alt="Preview" 
                      onError={(e) => {
                        e.currentTarget.src = '/images/hero_luxe_collection.jpg';
                      }}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold rounded text-neutral-700 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 text-xs font-semibold rounded text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#111111] text-[#D4AF62] text-xs font-bold uppercase tracking-wider rounded"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
