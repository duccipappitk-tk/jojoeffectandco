import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  ShoppingBag, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  ExternalLink,
  Menu,
  X,
  Database,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLayoutProps {
  currentAdminRoute: string;
  onNavigateAdmin: (route: string) => void;
  onNavigatePublic: (route: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentAdminRoute,
  onNavigateAdmin,
  onNavigatePublic,
  children,
}) => {
  const { adminUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', route: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', route: '/admin/products', icon: Package },
    { label: 'Categories', route: '/admin/categories', icon: Layers },
    { label: 'Orders', route: '/admin/orders', icon: ShoppingBag },
    { label: 'Inquiries', route: '/admin/inquiries', icon: MessageSquare },
    { label: 'Website Content', route: '/admin/content', icon: FileText },
    { label: 'Store Settings', route: '/admin/settings', icon: Settings },
  ];

  const handleNav = (route: string) => {
    onNavigateAdmin(route);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col md:flex-row">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] text-white border-r border-[#222222] shrink-0 min-h-screen">
        
        {/* Brand Area */}
        <div className="p-5 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/Jo_Jo_Effects___Co._Luxe_Emblem_5e3cd1b0.png"
              alt="JO JO EFFECTS & CO."
              className="h-9 w-9 object-contain rounded"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-white block">
                JO JO EFFECTS
              </span>
              <span className="text-[10px] text-[#D4AF62] font-semibold tracking-widest block">
                ADMIN CONSOLE
              </span>
            </div>
          </div>
        </div>

        {/* Supabase Status Pill */}
        <div className="px-5 py-2.5 bg-[#181818] border-b border-[#222222] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Database className="w-3.5 h-3.5 text-[#D4AF62]" />
            <span>Database</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
            isSupabaseConfigured 
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
              : 'bg-neutral-800 text-neutral-300'
          }`}>
            {isSupabaseConfigured ? 'Supabase Live' : 'Local Store'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentAdminRoute === item.route || 
              (item.route === '/admin/products' && currentAdminRoute.startsWith('/admin/products'));
            return (
              <button
                key={item.route}
                onClick={() => handleNav(item.route)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#D4AF62] text-[#111111] shadow-sm'
                    : 'text-neutral-300 hover:bg-[#222222] hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#222222] space-y-3">
          <button
            onClick={() => onNavigatePublic('/')}
            className="w-full flex items-center justify-between px-3 py-2 bg-[#1e1e1e] hover:bg-[#282828] text-neutral-300 hover:text-white rounded text-xs transition-colors cursor-pointer"
          >
            <span>View Public Store</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4AF62]" />
          </button>

          <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-[#222222]">
            <div className="truncate mr-2">
              <span className="block font-semibold text-white truncate">{adminUser?.name || 'Admin'}</span>
              <span className="block text-[10px] text-neutral-500 truncate">{adminUser?.email}</span>
            </div>
            <button
              onClick={() => logout()}
              title="Logout"
              className="p-1.5 text-neutral-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-[#111111] text-white p-4 flex items-center justify-between border-b border-[#222222]">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/aistudio/Jo_Jo_Effects___Co._Luxe_Emblem_5e3cd1b0.png"
            alt="Logo"
            className="h-8 w-8 object-contain rounded"
          />
          <span className="font-bold text-xs uppercase text-white tracking-wider">
            ADMIN PORTAL
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-neutral-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#111111] text-white p-4 border-b border-[#222222] space-y-2">
          {navItems.map(item => (
            <button
              key={item.route}
              onClick={() => handleNav(item.route)}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-[#222222] rounded"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
          <hr className="border-[#222222] my-2" />
          <button
            onClick={() => onNavigatePublic('/')}
            className="w-full text-left px-3 py-2 text-xs text-[#D4AF62] font-semibold"
          >
            Go to Public Store
          </button>
          <button
            onClick={() => logout()}
            className="w-full text-left px-3 py-2 text-xs text-red-400 font-semibold"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
};
