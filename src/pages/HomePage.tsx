import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Award,
  ChevronRight
} from 'lucide-react';
import { Product, Category, SiteSettings } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { storeService } from '../services/storeService';

interface HomePageProps {
  categories: Category[];
  products: Product[];
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  categories,
  products,
  settings,
  onNavigate,
}) => {
  const featuredProducts = products.filter(p => p.is_featured && p.is_published).slice(0, 6);
  const hero = settings.hero_section;

  const handleWhatsAppChat = () => {
    const link = storeService.getWhatsAppGeneralLink();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. HERO SECTION (Luxe Split-Layout with white-dominant aesthetic) */}
      {hero.enabled && (
        <section className="relative overflow-hidden border-b border-[#E5E7EB] bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Brand Story & CTAs */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
                
                {/* Brand Introduction */}
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase">
                  <span className="w-6 h-[1.5px] bg-[#D4AF62]" />
                  <span>JO JO EFFECTS &amp; CO.</span>
                </div>

                {/* Hero Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
                  {hero.headline}
                </h1>

                {/* Supporting Description */}
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl">
                  {hero.description}
                </p>

                {/* Primary & Secondary Call to Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => onNavigate(hero.primary_button_link || '/shop')}
                    className="px-7 py-3.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold text-xs uppercase tracking-widest rounded-md transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <span>{hero.primary_button_text || 'SHOP NOW'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('collections');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else onNavigate('/shop');
                    }}
                    className="px-7 py-3.5 bg-white hover:bg-neutral-50 text-[#111111] font-bold text-xs uppercase tracking-widest rounded-md border border-[#111111] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>{hero.secondary_button_text || 'EXPLORE COLLECTIONS'}</span>
                  </button>
                </div>

                {/* Quiet Trust Markers (Unboxed, NO pill spam) */}
                <div className="pt-6 border-t border-[#F5F5F5] flex flex-wrap items-center gap-6 text-xs text-neutral-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#D4AF62]" />
                    <span>Nationwide US Delivery</span>
                  </div>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF62]" />
                    <span>Quality-Checked Items</span>
                  </div>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Instant WhatsApp Order Support</span>
                  </div>
                </div>

              </div>

              {/* Right Column: High Quality Product Photography */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-xl border border-[#E5E7EB] group">
                  <img
                    src={hero.image_url || '/src/assets/images/hero_luxe_collection_1793019935404.jpg'}
                    alt="JO JO EFFECTS & CO. Curated Collection"
                    className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle Floating Corner Card */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-lg border border-[#E5E7EB] shadow-lg max-w-[240px] text-left">
                    <span className="text-[10px] tracking-wider uppercase font-bold text-[#D4AF62] block">
                      Curated Selection
                    </span>
                    <p className="text-xs font-semibold text-[#111111] mt-0.5 leading-snug">
                      Luxury Handbags, Virgin Hair &amp; Timepieces
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 2. CATEGORY SPOTLIGHT SECTION */}
      <section id="collections" className="py-16 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
                Shop By Category
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-1 tracking-tight">
                Explore Our Core Collections
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#111111] hover:text-[#D4AF62] uppercase transition-colors"
            >
              <span>View All Categories</span>
              <ChevronRight className="w-4 h-4 text-[#D4AF62]" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <div
                key={category.id}
                onClick={() => onNavigate(`/shop?category=${category.slug}`)}
                className="group relative bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#D4AF62] transition-all duration-300 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base font-bold tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-[#111111] group-hover:text-[#D4AF62] transition-colors">
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (Product-Focused Grid) */}
      <section className="py-20 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
              Handpicked Essentials
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-1 tracking-tight">
              Featured Arrivals &amp; Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
              Carefully sourced and quality-checked pieces ready for swift US delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => {
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

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('/shop')}
              className="px-8 py-3.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold text-xs uppercase tracking-widest rounded-md transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Complete Store Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* 4. BRAND STORY & SOURCING PILLARS */}
      <section className="py-16 bg-[#F9FAFB] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
                The JO JO Way
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                {settings.about_us?.heading || 'Curated Finds. Direct Quality.'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {settings.about_us?.content || 'JO JO EFFECTS & CO. brings together everyday finds in hair, bags, watches, and phone essentials with personal service and verified quality.'}
              </p>
              <div className="pt-3">
                <button
                  onClick={() => onNavigate('/about')}
                  className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-[#111111] hover:text-[#D4AF62] uppercase transition-colors"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF62]" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#D4AF62] mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">Direct Sourcing</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  We eliminate middlemen by procuring directly from premier overseas manufacturing hubs to bring you accessible luxury.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#D4AF62] mb-3">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">Personal Touch</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Have questions about lace density, watch fit, or bag dimensions? Chat with us directly on WhatsApp before you buy.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#D4AF62] mb-3">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">Sioux Falls Dispatch</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Proudly based in Sioux Falls, South Dakota, serving discerning shoppers across the entire United States.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#D4AF62] mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">Multiple Payment Methods</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Seamless payment support for Cash App, Venmo, Zelle, and PayPal in official USD currency.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. WHATSAPP CONCIERGE CALLOUT (No visible phone number) */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-10 rounded-2xl bg-[#111111] text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-[#222222] shadow-xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
                Direct Customer Care
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Need Help Selecting Your Style or Placing an Order?
              </h2>
              <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
                Connect with our team directly on WhatsApp for real-time item availability, video previews, and immediate order confirmation.
              </p>
            </div>

            <button
              onClick={handleWhatsAppChat}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-widest rounded-md transition-colors flex items-center gap-2.5 shrink-0 shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Us on WhatsApp</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
