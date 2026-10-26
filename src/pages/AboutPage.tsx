import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  MapPin, 
  ArrowRight,
  MessageCircle,
  Truck
} from 'lucide-react';
import { SiteSettings } from '../types';
import { storeService } from '../services/storeService';

interface AboutPageProps {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ settings, onNavigate }) => {
  const handleWhatsApp = () => {
    const link = storeService.getWhatsAppGeneralLink();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Editorial Header */}
      <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.25em] text-[#D4AF62] uppercase block mb-2">
            Our Brand Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight leading-tight">
            Curating Everyday Style with Direct Value
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            {settings.tagline}
          </p>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-sm text-neutral-600 leading-relaxed">
            <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
              From Social Sourcing to a Structured Shopping Destination
            </h2>

            <p>
              <strong>JO JO EFFECTS &amp; CO.</strong> is a growing online retail business focused on bringing together carefully selected everyday products in one convenient shopping destination.
            </p>

            <p>
              From silky women&apos;s virgin hair and structured fashion handbags to precision watches and modern phone accessories, our goal is to make discovering and shopping for everyday essentials simple, reliable, and convenient.
            </p>

            <p>
              We source directly from international manufacturing centers to ensure our customers receive high aesthetic appeal, durable craftsmanship, and honest pricing without inflated retail markups.
            </p>

            <div className="p-4 bg-[#F9FAFB] border-l-2 border-[#D4AF62] rounded-r-lg text-xs italic text-neutral-700">
              &ldquo;We are building a customer-focused online shopping experience that combines product variety, convenient ordering, and personal customer support.&rdquo;
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xl">
              <img
                src="/images/hero_luxe_collection.jpg"
                alt="JO JO EFFECTS & CO. Curated Collection"
                onError={(e) => {
                  e.currentTarget.src = '/images/hero_luxe_collection.jpg';
                }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

        </div>

        {/* Core Pillars */}
        <div className="mt-24 pt-16 border-t border-[#E5E7EB]">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
              Our Commitments
            </span>
            <h3 className="text-2xl font-bold text-[#111111] mt-1">
              Why Customers Shop With Us
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#D4AF62] mb-4 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#111111]">Quality Inspection</h4>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Every hair bundle, watch movement, and handbag clasp is inspected before packing to ensure you receive pristine merchandise.
              </p>
            </div>

            <div className="p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#D4AF62] mb-4 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#111111]">Sioux Falls Base</h4>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                Centrally located in Sioux Falls, South Dakota, dispatching swiftly across all 50 US states with transparent order status.
              </p>
            </div>

            <div className="p-6 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
              <div className="w-12 h-12 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#111111]">Direct Accessibility</h4>
              <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                No automated bot maze. Connect directly with our team on WhatsApp for sizing guidance, stock confirmation, and payment questions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-20 p-8 sm:p-12 rounded-2xl bg-[#111111] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Ready to Explore Our Essentials?</h3>
            <p className="text-xs text-neutral-400 mt-1">Browse our full catalog of hair, fashion bags, watches, and phone gear.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/shop')}
              className="px-6 py-3 bg-[#D4AF62] hover:bg-[#c29e53] text-[#111111] font-bold text-xs uppercase tracking-widest rounded-md transition-colors"
            >
              Shop Collection
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-5 py-3 bg-[#222222] hover:bg-[#333333] text-white border border-[#444444] font-medium text-xs rounded-md transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Us</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
