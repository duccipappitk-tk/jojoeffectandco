import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onNavigate: (route: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { 
    items, 
    isDrawerOpen, 
    closeDrawer, 
    removeFromCart, 
    updateQuantity, 
    subtotal, 
    shippingFee, 
    totalAmount,
    totalItems 
  } = useCart();

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = 100;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    closeDrawer();
    onNavigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={closeDrawer}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#E5E7EB]">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#111111]" />
              <h2 className="text-base font-bold text-[#111111] uppercase tracking-wider">
                Shopping Bag ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-5 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <div className="text-xs font-medium text-neutral-600 mb-1.5 flex justify-between">
              {amountToFreeShipping > 0 ? (
                <span>Add <strong className="text-[#111111]">${amountToFreeShipping.toFixed(2)}</strong> more for free US delivery!</span>
              ) : (
                <span className="text-emerald-700 font-semibold">🎉 You unlocked Free US Nationwide Shipping!</span>
              )}
              <span className="text-neutral-400 font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#D4AF62] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#F5F5F5]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">Your bag is empty</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Explore our carefully selected hair, fashion bags, watches, and phone essentials.
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    onNavigate('/shop');
                  }}
                  className="mt-6 px-6 py-2.5 bg-[#111111] text-[#D4AF62] rounded-md text-xs font-bold tracking-widest uppercase hover:bg-[#222222] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => {
                const img = item.product.images.find(i => i.is_primary)?.url || item.product.images[0]?.url;
                return (
                  <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                    <div className="w-20 h-20 bg-neutral-100 rounded-md overflow-hidden shrink-0 border border-neutral-200">
                      {img ? (
                        <img 
                          src={img} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                          JJE
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-semibold text-[#111111] line-clamp-1 leading-snug">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.variant && (
                          <span className="text-[11px] text-neutral-500 block mt-0.5">
                            {item.variant.name}
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#111111] tabular-nums mt-1 block">
                          ${item.unitPrice.toFixed(2)} USD
                        </span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="inline-flex items-center border border-neutral-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-bold tabular-nums text-[#111111]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs text-neutral-400 tabular-nums font-medium">
                          Total: ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E5E7EB] bg-white space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111111] tabular-nums">${subtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)} USD`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#111111] pt-2 border-t border-neutral-100">
                  <span>Total</span>
                  <span className="text-base text-[#111111] tabular-nums">${totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 px-4 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded-md font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-neutral-400">
                Direct WhatsApp order confirmation &amp; USD payments supported
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
