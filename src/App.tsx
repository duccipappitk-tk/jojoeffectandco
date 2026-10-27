import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { storeService } from './services/storeService';
import { Category, Product, SiteSettings } from './types';

// Common Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { SearchModal } from './components/common/SearchModal';
import { CartDrawer } from './components/cart/CartDrawer';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminContentPage } from './pages/admin/AdminContentPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Route State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(storeService.getSettings());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Sync with browser history and popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load core store data
  const loadData = async () => {
    try {
      const [cats, prods] = await Promise.all([
        storeService.getCategories(),
        storeService.getProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setSettings(storeService.getSettings());
    } catch (e) {
      console.warn('Data load error:', e);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const navigate = (route: string) => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (_) {}
    setCurrentRoute(route);
    try {
      window.history.pushState(null, '', route);
    } catch (_) {
      // In sandboxed iframes pushState may be restricted
    }
  };

  const handleOpenAdminFromFooter = () => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    } else {
      setIsAdminLoginModalOpen(true);
    }
  };

  // Extract Path & Query
  const [rawPath, rawSearch] = currentRoute.split('?');
  const queryParams = new URLSearchParams(rawSearch || '');

  // Is this an Admin Route?
  const isAdminRoute = rawPath.startsWith('/admin');

  // Admin Flow
  if (isAdminRoute) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
          Verifying Administrator Privileges...
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <AdminLoginPage
          onSuccess={() => navigate('/admin/dashboard')}
          onNavigatePublic={navigate}
        />
      );
    }

    return (
      <AdminLayout
        currentAdminRoute={rawPath}
        onNavigateAdmin={navigate}
        onNavigatePublic={navigate}
      >
        {rawPath === '/admin' || rawPath === '/admin/dashboard' ? (
          <AdminDashboardPage onNavigateAdmin={navigate} />
        ) : rawPath === '/admin/products' ? (
          <AdminProductsPage onNavigateAdmin={navigate} onNavigatePublic={navigate} />
        ) : rawPath === '/admin/products/new' ? (
          <AdminProductFormPage onNavigateAdmin={navigate} />
        ) : rawPath.startsWith('/admin/products/edit/') ? (
          <AdminProductFormPage
            productId={rawPath.replace('/admin/products/edit/', '')}
            onNavigateAdmin={navigate}
          />
        ) : rawPath === '/admin/categories' ? (
          <AdminCategoriesPage onNavigatePublic={navigate} />
        ) : rawPath === '/admin/orders' ? (
          <AdminOrdersPage />
        ) : rawPath === '/admin/inquiries' ? (
          <AdminInquiriesPage />
        ) : rawPath === '/admin/content' ? (
          <AdminContentPage />
        ) : rawPath === '/admin/settings' ? (
          <AdminSettingsPage />
        ) : (
          <AdminDashboardPage onNavigateAdmin={navigate} />
        )}
      </AdminLayout>
    );
  }

  // Customer Storefront Router
  const renderPublicPage = () => {
    if (rawPath === '/' || rawPath === '') {
      return (
        <HomePage
          categories={categories}
          products={products}
          settings={settings}
          onNavigate={navigate}
        />
      );
    }

    if (rawPath === '/shop') {
      const categorySlug = queryParams.get('category') || undefined;
      return (
        <ShopPage
          products={products}
          categories={categories}
          initialCategorySlug={categorySlug}
          onNavigate={navigate}
        />
      );
    }

    if (rawPath.startsWith('/product/')) {
      const slug = rawPath.replace('/product/', '');
      return (
        <ProductDetailPage
          slug={slug}
          products={products}
          categories={categories}
          onNavigate={navigate}
        />
      );
    }

    if (rawPath === '/about') {
      return <AboutPage settings={settings} onNavigate={navigate} />;
    }

    if (rawPath === '/contact') {
      return <ContactPage settings={settings} onNavigate={navigate} />;
    }

    if (rawPath === '/checkout') {
      return <CheckoutPage settings={settings} onNavigate={navigate} />;
    }

    if (rawPath === '/checkout/success') {
      const orderRef = queryParams.get('ref') || undefined;
      return <CheckoutSuccessPage orderReference={orderRef} onNavigate={navigate} />;
    }

    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-[#D4AF62]/20 selection:text-[#111111]">
      
      {/* 1. Announcement Bar */}
      <AnnouncementBar settings={settings} onNavigate={navigate} />

      {/* 2. Primary Navigation Header */}
      <Header
        currentRoute={rawPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        settings={settings}
      />

      {/* 3. Main Page Body */}
      <main className="flex-1">
        {renderPublicPage()}
      </main>

      {/* 4. Global Footer */}
      <Footer
        settings={settings}
        onNavigate={navigate}
        onOpenAdmin={handleOpenAdminFromFooter}
      />

      {/* 5. Floating WhatsApp Support Button (Never displays phone number) */}
      <FloatingWhatsApp />

      {/* 6. Slide-Out Cart Drawer */}
      <CartDrawer onNavigate={navigate} />

      {/* 7. Instant Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        categories={categories}
        onNavigate={navigate}
      />

      {/* 8. Admin Login Pop-up Modal (Zero pre-filled credentials, discreetly opened via shield icon) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdminLoginModalOpen(false);
          navigate('/admin/dashboard');
        }}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
