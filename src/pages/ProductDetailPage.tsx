import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Check, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Star
} from 'lucide-react';
import { Product, Category, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { storeService } from '../services/storeService';
import { ProductCard } from '../components/common/ProductCard';

interface ProductDetailPageProps {
  slug: string;
  products: Product[];
  categories: Category[];
  onNavigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  products,
  categories,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const product = products.find(p => p.slug === slug);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'shipping'>('details');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedImageIndex(0);
    setQuantity(1);
    if (product && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(undefined);
    }
  }, [slug, product]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white text-center">
        <h2 className="text-xl font-bold text-[#111111]">Product Not Found</h2>
        <p className="text-xs text-neutral-500 mt-2">The product you are looking for may have been updated or moved.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-6 px-6 py-2.5 bg-[#111111] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category_id);
  const price = (product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.base_price) + (selectedVariant?.price_adjustment || 0);
  const basePriceWithVariant = product.base_price + (selectedVariant?.price_adjustment || 0);
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.base_price;
  const isOutOfStock = product.stock_quantity <= 0;

  const images = product.images.length > 0 
    ? product.images 
    : [{ id: 'default', url: '/src/assets/images/hero_luxe_collection_1793019935404.jpg', is_primary: true, display_order: 1 }];

  const activeImage = images[selectedImageIndex]?.url || images[0]?.url;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    onNavigate('/checkout');
  };

  const handleWhatsAppInquiry = () => {
    const link = storeService.getWhatsAppProductLink(product.name, price);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const relatedProducts = products
    .filter(p => p.category_id === product.category_id && p.id !== product.id && p.is_published)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/shop')}
              className="inline-flex items-center gap-1 hover:text-[#111111] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Shop</span>
            </button>
            <span aria-hidden="true">/</span>
            {category && (
              <button
                onClick={() => onNavigate(`/shop?category=${category.slug}`)}
                className="hover:text-[#111111] transition-colors"
              >
                {category.name}
              </button>
            )}
            <span aria-hidden="true">/</span>
            <span className="text-[#111111] font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </div>

          <span className="text-[11px] text-neutral-400">Sioux Falls, SD Sourcing</span>
        </div>
      </div>

      {/* Main Product Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx ? 'border-[#D4AF62] shadow-sm' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Active Main Image Display */}
            <div className="flex-1 relative aspect-[4/3] bg-neutral-100 rounded-xl overflow-hidden border border-[#E5E7EB]">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {product.is_new_arrival && (
                  <span className="bg-[#111111] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow">
                    New Arrival
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-[#D4AF62] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm shadow">
                    Special Offer
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            <div>
              {/* Category & Sourcing Indicator (Unboxed, NO pill spam) */}
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF62] tracking-wider uppercase mb-2">
                <span>{category?.name || 'Exclusive Find'}</span>
                <span aria-hidden="true">·</span>
                <span className={isOutOfStock ? 'text-red-500' : 'text-emerald-700'}>
                  {isOutOfStock ? 'Sold Out' : `In Stock (${product.stock_quantity} available)`}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Pricing Row */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#111111] tabular-nums tracking-tight">
                  ${price.toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                  USD
                </span>
                {hasDiscount && (
                  <span className="text-sm text-neutral-400 line-through tabular-nums">
                    ${basePriceWithVariant.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Variants Selector */}
            {product.variants.length > 0 && (
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-2.5">
                  Select Option: <span className="font-normal text-neutral-500">{selectedVariant?.name}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(variant => {
                    const isSelected = selectedVariant?.id === variant.id;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3.5 py-2 text-xs font-medium rounded-md border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-[#D4AF62] shadow-sm font-semibold'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                        }`}
                      >
                        {variant.name}
                        {variant.price_adjustment > 0 && ` (+$${variant.price_adjustment})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="pt-2 flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Quantity
              </label>
              <div className="inline-flex items-center border border-neutral-200 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold tabular-nums text-[#111111]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                  className="px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-3.5 px-4 rounded-md font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isOutOfStock
                      ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                      : isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#111111] hover:bg-[#222222] text-[#D4AF62]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="py-3.5 px-4 bg-[#D4AF62] hover:bg-[#c29e53] text-[#111111] font-bold text-xs uppercase tracking-widest rounded-md transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>

              {/* Dedicated WhatsApp Inquiry Button (No visible phone number) */}
              <button
                onClick={handleWhatsAppInquiry}
                className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-md text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Inquire About This Product on WhatsApp</span>
              </button>
            </div>

            {/* Trust Assurances */}
            <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-4 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D4AF62]" />
                <span>US Postal Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#D4AF62]" />
                <span>Inspected Before Dispatch</span>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Tabs: Description, Specifications, Shipping */}
        <div className="mt-16 pt-10 border-t border-[#E5E7EB]">
          
          <div className="flex border-b border-[#E5E7EB] gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer relative ${
                activeTab === 'details' ? 'text-[#111111]' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Description
              {activeTab === 'details' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF62]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer relative ${
                activeTab === 'specs' ? 'text-[#111111]' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Specifications
              {activeTab === 'specs' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF62]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer relative ${
                activeTab === 'shipping' ? 'text-[#111111]' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Shipping &amp; Payments
              {activeTab === 'shipping' && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF62]" />
              )}
            </button>
          </div>

          <div className="py-6 max-w-3xl">
            {activeTab === 'details' && (
              <div className="prose text-xs sm:text-sm text-neutral-600 leading-relaxed space-y-4">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] overflow-hidden">
                <dl className="divide-y divide-[#E5E7EB] text-xs">
                  {Object.entries(product.specifications || {}).map(([key, value]) => (
                    <div key={key} className="py-3 px-4 grid grid-cols-3 gap-4">
                      <dt className="font-semibold text-[#111111]">{key}</dt>
                      <dd className="col-span-2 text-neutral-600">{value}</dd>
                    </div>
                  ))}
                  {Object.keys(product.specifications || {}).length === 0 && (
                    <div className="p-4 text-neutral-400">Standard manufacturer specifications apply.</div>
                  )}
                </dl>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                <p>
                  All orders are processed and verified from Sioux Falls, South Dakota. We provide reliable shipping across all US states.
                </p>
                <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB] space-y-2">
                  <h4 className="font-bold text-[#111111] uppercase tracking-wider text-xs">Payment Verification:</h4>
                  <p className="text-xs text-neutral-600">
                    We accept Cash App, Venmo, Zelle, and PayPal. After placing your order, your order reference will be generated, and you can confirm payment immediately via WhatsApp.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E5E7EB]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
                  You Might Also Like
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111111] mt-1 tracking-tight">
                  Related Products
                </h2>
              </div>
              <button
                onClick={() => onNavigate(`/shop?category=${category?.slug}`)}
                className="text-xs font-bold tracking-wider text-[#111111] hover:text-[#D4AF62] uppercase transition-colors"
              >
                View Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  categoryName={category?.name}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
