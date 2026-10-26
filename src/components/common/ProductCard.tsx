import React, { useState } from 'react';
import { ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (route: string) => void;
  categoryName?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  categoryName,
}) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const primaryImage = product.images.find(i => i.is_primary)?.url || product.images[0]?.url || '';
  const price = product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.base_price;
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.base_price;
  const isOutOfStock = product.stock_quantity <= 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, product.variants[0]);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1600);
  };

  return (
    <div
      onClick={() => onNavigate(`/product/${product.slug}`)}
      className="group relative flex flex-col bg-white border border-[#E5E7EB] rounded-lg overflow-hidden transition-all duration-300 hover:border-[#D4AF62] hover:shadow-lg cursor-pointer"
    >
      {/* Product Image Stage (65-75% visual weight) */}
      <div className="relative aspect-[4/3] w-full bg-[#F5F5F5] overflow-hidden">
        {primaryImage && !imgError ? (
          <img
            src={primaryImage}
            alt={product.name}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-400 p-4 text-center">
            <span className="text-xs uppercase tracking-widest font-semibold text-neutral-500">
              {product.name}
            </span>
          </div>
        )}

        {/* Status flags (Quiet subtle badges without gaudy pill clutter) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.is_new_arrival && (
            <span className="bg-[#111111] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm">
              New Arrival
            </span>
          )}
          {hasDiscount && (
            <span className="bg-[#D4AF62] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm">
              Sale
            </span>
          )}
        </div>

        {/* Quick View / Add Floating Action on Hover */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isOutOfStock
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#111111] hover:bg-[#222222] text-[#D4AF62]'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/product/${product.slug}`);
            }}
            className="p-2 bg-white text-[#111111] hover:text-[#D4AF62] rounded-md shadow-md transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata (Zero-Pill discipline) */}
          <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 mb-1.5">
            {categoryName && <span>{categoryName}</span>}
            {categoryName && <span aria-hidden="true">·</span>}
            <span className={isOutOfStock ? 'text-red-500' : 'text-emerald-700'}>
              {isOutOfStock ? 'Sold Out' : 'In Stock'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-semibold text-[#111111] line-clamp-2 group-hover:text-[#D4AF62] transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Price Row */}
        <div className="mt-3 pt-3 border-t border-[#F5F5F5] flex items-baseline gap-2">
          <span className="text-base font-bold text-[#111111] tabular-nums tracking-tight">
            ${price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through tabular-nums">
              ${product.base_price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
