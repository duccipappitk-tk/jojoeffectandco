import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Phone, 
  MapPin, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { storeService } from '../../services/storeService';

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const handleWhatsApp = () => {
    const link = storeService.getWhatsAppGeneralLink();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const hasFacebook = Boolean(settings.social_links?.facebook);
  const hasInstagram = Boolean(settings.social_links?.instagram);
  const hasTikTok = Boolean(settings.social_links?.tiktok);

  return (
    <footer className="bg-[#111111] text-white border-t border-[#222222] pt-16 pb-12">
      {/* Trust Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-[#222222]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded-lg border border-[#333333] text-[#D4AF62] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-white uppercase">US Nationwide Delivery</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">Direct shipping to your doorstep with tracking updates.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded-lg border border-[#333333] text-[#D4AF62] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-white uppercase">Direct Sourcing Value</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">Carefully chosen inventory from verified international sources.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded-lg border border-[#333333] text-[#D4AF62] shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-white uppercase">Personal WhatsApp Help</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">Direct communication for stock inquiries and order status.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#1e1e1e] rounded-lg border border-[#333333] text-[#D4AF62] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wider text-white uppercase">Trusted Payment Options</h4>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">Pay with Cash App, Venmo, Zelle, or PayPal in USD.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/Jo_Jo_Effects___Co._Luxe_Emblem_5e3cd1b0.png"
                alt="JO JO EFFECTS & CO."
                className="h-10 w-10 object-contain rounded-md"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="font-bold text-base tracking-wider text-white block uppercase">
                  JO JO EFFECTS
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#D4AF62] font-semibold block">
                  &amp; CO.
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {settings.tagline} Bringing together quality-conscious hair, designer handbags, watches, and phone essentials in one convenient shopping destination.
            </p>

            {/* Social Media Links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href={settings.social_links?.facebook || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-[#333333] flex items-center justify-center text-neutral-300 hover:text-[#D4AF62] hover:border-[#D4AF62] transition-colors"
                aria-label="Facebook"
                title="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>

              {hasInstagram && (
                <a
                  href={settings.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-[#333333] flex items-center justify-center text-neutral-300 hover:text-[#D4AF62] hover:border-[#D4AF62] transition-colors"
                  aria-label="Instagram"
                  title="Follow us on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}

              {hasTikTok && (
                <a
                  href={settings.social_links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-[#1e1e1e] border border-[#333333] flex items-center justify-center text-neutral-300 hover:text-[#D4AF62] hover:border-[#D4AF62] transition-colors"
                  aria-label="TikTok"
                >
                  {/* Clean TikTok SVG */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-[#D4AF62] uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop')} className="hover:text-white transition-colors cursor-pointer">
                  Shop All Products
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-[#D4AF62] uppercase mb-4">Categories</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <button onClick={() => onNavigate('/shop?category=womens-hair')} className="hover:text-white transition-colors cursor-pointer">
                  Women's Hair
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=womens-fashion-handbags')} className="hover:text-white transition-colors cursor-pointer">
                  Women's Fashion Handbags
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=phone-accessories')} className="hover:text-white transition-colors cursor-pointer">
                  Phone Accessories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=watches')} className="hover:text-white transition-colors cursor-pointer">
                  Watches
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold tracking-widest text-[#D4AF62] uppercase mb-4">Contact Info</h4>
            <div className="space-y-3 text-xs text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4AF62] shrink-0 mt-0.5" />
                <span>{settings.business_location}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#D4AF62] shrink-0 mt-0.5" />
                <a href={`tel:${settings.business_contact_number.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                  {settings.business_contact_number}
                </a>
              </div>
              
              {/* WhatsApp Inquiry Button (No visible phone number) */}
              <div className="pt-2">
                <button
                  onClick={handleWhatsApp}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-[#1e1e1e] hover:bg-[#282828] text-white border border-[#333333] hover:border-emerald-500 rounded-md text-xs font-medium transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp Inquiries</span>
                </button>
              </div>

              {/* Admin Portal Link */}
              <div className="pt-3">
                <button
                  onClick={() => onNavigate('/admin/dashboard')}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                >
                  <span>Admin Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Accepted Payment Methods & Copyright */}
        <div className="pt-12 mt-12 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} JO JO EFFECTS &amp; CO. All rights reserved.
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-neutral-400">Supported USD Payments:</span>
            <span className="px-2 py-1 bg-[#1e1e1e] border border-[#333333] text-neutral-300 rounded text-[11px] font-medium">Cash App</span>
            <span className="px-2 py-1 bg-[#1e1e1e] border border-[#333333] text-neutral-300 rounded text-[11px] font-medium">Venmo</span>
            <span className="px-2 py-1 bg-[#1e1e1e] border border-[#333333] text-neutral-300 rounded text-[11px] font-medium">Zelle</span>
            <span className="px-2 py-1 bg-[#1e1e1e] border border-[#333333] text-neutral-300 rounded text-[11px] font-medium">PayPal</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
