import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Check, 
  AlertCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { storeService, resolveImageUrl } from '../../services/storeService';

export const AdminContentPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(storeService.getSettings());
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(storeService.getSettings());
  }, []);

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await storeService.uploadImage(file);
      setSettings(prev => ({
        ...prev,
        hero_section: {
          ...prev.hero_section,
          image_url: url,
        },
      }));
    } catch (err) {
      console.error('Image upload failed', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await storeService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF62] block">
          Website Content Management
        </span>
        <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
          Homepage &amp; Editorial Content
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Customize your hero banner, top announcement, and brand narrative without writing code.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Website content saved and published successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. Top Announcement Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62]">
                1. Top Announcement Bar
              </h2>
              <p className="text-xs text-neutral-500">
                Slim banner shown at the very top of all public pages.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={settings.announcement_bar?.enabled}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  announcement_bar: { ...prev.announcement_bar, enabled: e.target.checked }
                }))}
                className="rounded text-[#111111] focus:ring-[#D4AF62]"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Announcement Text
              </label>
              <input
                type="text"
                value={settings.announcement_bar?.text || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  announcement_bar: { ...prev.announcement_bar, text: e.target.value }
                }))}
                placeholder="e.g. Free shipping on orders over $100 across the USA"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Destination Link URL
              </label>
              <input
                type="text"
                value={settings.announcement_bar?.link_url || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  announcement_bar: { ...prev.announcement_bar, link_url: e.target.value }
                }))}
                placeholder="/shop"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-mono focus:outline-none focus:border-[#D4AF62]"
              />
            </div>
          </div>
        </div>

        {/* 2. Hero Section Content */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62]">
                2. Hero Section
              </h2>
              <p className="text-xs text-neutral-500">
                Luxe split-layout above the fold on the homepage.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={settings.hero_section?.enabled}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  hero_section: { ...prev.hero_section, enabled: e.target.checked }
                }))}
                className="rounded text-[#111111] focus:ring-[#D4AF62]"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Hero Headline
              </label>
              <input
                type="text"
                value={settings.hero_section?.headline || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  hero_section: { ...prev.hero_section, headline: e.target.value }
                }))}
                placeholder="Discover Your Everyday Essentials."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-bold focus:outline-none focus:border-[#D4AF62]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Supporting Description
              </label>
              <textarea
                rows={3}
                value={settings.hero_section?.description || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  hero_section: { ...prev.hero_section, description: e.target.value }
                }))}
                placeholder="Explore carefully selected hair, fashion handbags, watches..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                  Primary Button Text &amp; Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.hero_section?.primary_button_text || ''}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      hero_section: { ...prev.hero_section, primary_button_text: e.target.value }
                    }))}
                    placeholder="SHOP NOW"
                    className="w-1/2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
                  />
                  <input
                    type="text"
                    value={settings.hero_section?.primary_button_link || ''}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      hero_section: { ...prev.hero_section, primary_button_link: e.target.value }
                    }))}
                    placeholder="/shop"
                    className="w-1/2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                  Secondary Button Text &amp; Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.hero_section?.secondary_button_text || ''}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      hero_section: { ...prev.hero_section, secondary_button_text: e.target.value }
                    }))}
                    placeholder="EXPLORE COLLECTIONS"
                    className="w-1/2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
                  />
                  <input
                    type="text"
                    value={settings.hero_section?.secondary_button_link || ''}
                    onChange={e => setSettings(prev => ({
                      ...prev,
                      hero_section: { ...prev.hero_section, secondary_button_link: e.target.value }
                    }))}
                    placeholder="#collections"
                    className="w-1/2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Hero Image Photography
              </label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-24 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 shrink-0">
                  <img
                    src={resolveImageUrl(settings.hero_section?.image_url)}
                    alt="Hero preview"
                    onError={(e) => {
                      e.currentTarget.src = '/images/hero_luxe_collection.jpg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload New Hero Image</span>
                  </button>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Upload from laptop, desktop, or mobile phone. Clean white studio photo recommended.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroImageUpload}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. About Us Narrative */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62] pb-2 border-b border-neutral-100">
            3. About Us Editorial Content
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Main Headline
              </label>
              <input
                type="text"
                value={settings.about_us?.heading || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  about_us: { ...prev.about_us, heading: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Narrative Content
              </label>
              <textarea
                rows={5}
                value={settings.about_us?.content || ''}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  about_us: { ...prev.about_us, content: e.target.value }
                }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-3 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold text-xs uppercase tracking-widest rounded-md shadow-md cursor-pointer"
          >
            Save All Content Updates
          </button>
        </div>

      </form>
    </div>
  );
};
