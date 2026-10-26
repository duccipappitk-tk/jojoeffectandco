import React, { useState } from 'react';
import { Search, ShoppingBag, Menu, X, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { storeService } from '../../services/storeService';
import { SiteSettings } from '../../types';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
  settings: SiteSettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
  settings,
}) => {
  const { totalItems, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'HOME', route: '/' },
    { label: 'SHOP', route: '/shop' },
    { label: 'ABOUT US', route: '/about' },
    { label: 'CONTACT US', route: '/contact' },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const handleWhatsAppClick = () => {
    const link = storeService.getWhatsAppGeneralLink();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          
          {/* Zone 1: Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-3 text-left group cursor-pointer"
              aria-label="JO JO EFFECTS & CO. Home"
            >
              <img
                src="/assets/aistudio/Jo_Jo_Effects___Co._Luxe_Emblem_5e3cd1b0.png"
                alt="JO JO EFFECTS & CO. Emblem"
                className="h-12 w-12 object-contain rounded-md transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-wider text-[#111111] leading-none uppercase">
                  JO JO EFFECTS
                </span>
                <span className="text-[10px] tracking-[0.25em] text-[#D4AF62] font-semibold mt-1">
                  &amp; CO.
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest text-[#111111]">
            {navItems.map(item => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`relative py-2 transition-colors cursor-pointer hover:text-[#D4AF62] whitespace-nowrap shrink-0 ${
                    isActive ? 'text-[#D4AF62]' : 'text-[#111111]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF62]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Interactive Affordances (Search, Cart, WhatsApp Support) */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#111111] hover:text-[#D4AF62] transition-colors rounded-full hover:bg-[#F5F5F5] cursor-pointer"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={openDrawer}
              className="relative p-2 text-[#111111] hover:text-[#D4AF62] transition-colors rounded-full hover:bg-[#F5F5F5] cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-[#111111] text-[#D4AF62] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {totalItems}
                </span>
              )}
            </button>

            {/* WhatsApp Quick Chat (Opens WhatsApp with no visible number) */}
            <button
              onClick={handleWhatsAppClick}
              title="Chat with us on WhatsApp"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full border border-emerald-200 transition-colors cursor-pointer"
              aria-label="Contact WhatsApp Support"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#111111] hover:text-[#D4AF62] transition-colors rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 bg-white border-b border-[#E5E7EB] shadow-xl animate-in slide-in-from-top-2 duration-200 px-6 py-6 z-40">
          <nav className="flex flex-col space-y-4">
            {navItems.map(item => {
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`text-left text-sm font-semibold tracking-wider py-2 transition-colors ${
                    isActive ? 'text-[#D4AF62]' : 'text-[#111111] hover:text-[#D4AF62]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <hr className="border-[#E5E7EB] my-2" />
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with us on WhatsApp</span>
            </button>
            <div className="pt-2 text-center text-xs text-neutral-500">
              {settings.business_location}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
