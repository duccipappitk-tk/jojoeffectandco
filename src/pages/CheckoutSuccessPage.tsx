import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  MessageCircle, 
  Printer, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check 
} from 'lucide-react';
import { Order } from '../types';
import { storeService } from '../services/storeService';

interface CheckoutSuccessPageProps {
  orderReference?: string;
  onNavigate: (route: string) => void;
}

export const CheckoutSuccessPage: React.FC<CheckoutSuccessPageProps> = ({
  orderReference,
  onNavigate,
}) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedRef, setCopiedRef] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderReference) {
        const found = await storeService.getOrderByReference(orderReference);
        setOrder(found);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderReference]);

  const handleCopy = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleWhatsAppConfirm = () => {
    if (!order) return;
    const link = storeService.getWhatsAppOrderLink(order);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Loading Order Confirmation...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white text-center">
        <h2 className="text-xl font-bold text-[#111111]">Order Not Found</h2>
        <p className="text-xs text-neutral-500 mt-2">
          We could not locate this order reference. Please check your reference or contact customer care.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="mt-6 px-6 py-2.5 bg-[#111111] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Success Container */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-lg overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-[#111111] text-white p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-white/10 text-[#D4AF62] rounded-full flex items-center justify-center mx-auto border border-white/20">
              <CheckCircle className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
              Order Received
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
              Your order has been recorded in our system. Please confirm via WhatsApp to ensure immediate processing.
            </p>
          </div>

          {/* WhatsApp Primary Callout */}
          <div className="p-6 bg-emerald-50 border-b border-emerald-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5 justify-center sm:justify-start">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Immediate WhatsApp Confirmation</span>
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md">
                  Send your order details to JO JO EFFECTS &amp; CO. via WhatsApp to confirm your payment and track delivery updates.
                </p>
              </div>

              {/* Functional WhatsApp Link (No phone number displayed) */}
              <button
                onClick={handleWhatsAppConfirm}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Order Details Body */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Order Reference Box */}
            <div className="p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Official Order Reference
                </span>
                <span className="font-mono text-base font-extrabold text-[#111111]">
                  {order.order_reference}
                </span>
              </div>
              <button
                onClick={() => handleCopy(order.order_reference)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200 text-xs font-semibold text-[#111111] hover:border-[#D4AF62] rounded-md transition-colors"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Reference</span>
                  </>
                )}
              </button>
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white rounded-lg border border-neutral-200">
                <span className="text-neutral-500 block mb-1">Payment Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting Verification</span>
                </span>
                <span className="text-[11px] text-neutral-400 block mt-1.5">
                  Method: {order.payment_method.toUpperCase()}
                </span>
              </div>

              <div className="p-4 bg-white rounded-lg border border-neutral-200">
                <span className="text-neutral-500 block mb-1">Fulfillment Status:</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>New Order Placed</span>
                </span>
                <span className="text-[11px] text-neutral-400 block mt-1.5">
                  Coordinated from Sioux Falls, SD
                </span>
              </div>
            </div>

            {/* Customer & Delivery Address */}
            <div className="p-5 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] space-y-3 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-[#111111]">
                Delivery Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-neutral-600">
                <div>
                  <span className="font-semibold text-[#111111] block">Customer:</span>
                  <span>{order.customer.full_name}</span>
                  <span className="block">{order.customer.email}</span>
                  <span className="block">{order.customer.phone}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#111111] block">Shipping Address:</span>
                  <span>{order.customer.address}</span>
                  <span className="block">{order.customer.city}, {order.customer.state} {order.customer.postal_code}</span>
                  <span className="block">{order.customer.country}</span>
                  {order.customer.delivery_instructions && (
                    <span className="block text-[11px] text-neutral-500 italic mt-1">
                      Note: {order.customer.delivery_instructions}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Itemized Order List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Items in this Order
              </h4>
              <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                {order.items.map(item => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between text-xs bg-white">
                    <div className="min-w-0 pr-4">
                      <span className="font-semibold text-[#111111] block truncate">{item.product_name}</span>
                      {item.variant_name && <span className="text-[11px] text-neutral-500 block">{item.variant_name}</span>}
                      <span className="text-[11px] text-neutral-400 tabular-nums">Qty: {item.quantity} &times; ${item.unit_price.toFixed(2)}</span>
                    </div>
                    <span className="font-bold text-[#111111] tabular-nums shrink-0">
                      ${item.total_price.toFixed(2)} USD
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Row */}
            <div className="pt-4 border-t border-neutral-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium">${order.subtotal.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="tabular-nums font-medium">
                  {order.shipping_fee === 0 ? 'FREE' : `$${order.shipping_fee.toFixed(2)} USD`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-[#111111] pt-2 border-t border-neutral-100">
                <span>Total Amount Due</span>
                <span className="text-base tabular-nums">${order.total_amount.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Action Buttons: Print & Back to Store */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-[#111111] font-semibold transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Order Summary</span>
              </button>

              <button
                onClick={() => onNavigate('/shop')}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
