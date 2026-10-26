import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { storeService } from '../services/storeService';
import { SiteSettings, PaymentMethod } from '../types';

interface CheckoutPageProps {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ settings, onNavigate }) => {
  const { items, subtotal, shippingFee, totalAmount, clearCart } = useCart();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country] = useState('United States');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  
  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cashapp');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white text-center">
        <h2 className="text-xl font-bold text-[#111111]">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-neutral-500 mt-2">Add items to your bag before proceeding to checkout.</p>
        <button
          onClick={() => onNavigate('/shop')}
          className="mt-6 px-6 py-2.5 bg-[#111111] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const activePaymentConfig = settings.payment_methods[paymentMethod];

  const handleCopyIdentifier = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setErrorMsg('Please complete all required customer and delivery fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Structure order items
      const orderItems = items.map(item => ({
        id: 'oi-' + Math.random().toString(36).substring(2, 7),
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.images[0]?.url,
        variant_name: item.variant?.name,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        total_price: item.unitPrice * item.quantity,
      }));

      const createdOrder = await storeService.createOrder({
        customer: {
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
          country,
          delivery_instructions: deliveryInstructions.trim(),
        },
        items: orderItems,
        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        currency: 'USD',
        payment_method: paymentMethod,
        payment_status: 'awaiting_verification',
        order_status: 'new',
      });

      // Clear shopping bag
      clearCart();

      // Navigate to order confirmation
      onNavigate(`/checkout/success?ref=${createdOrder.order_reference}`);
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMsg('An error occurred while saving your order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('/shop')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Checkout Forms */}
          <div className="lg:col-span-7 space-y-8">
            
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-8">
              
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Customer Information */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                    1. Contact Details
                  </h2>
                  <span className="text-xs text-neutral-400">* Required</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Sarah Williams"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="sarah@example.com"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#111111] mb-4">
                  2. Delivery Address (USA)
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="1234 Main Street, Apt 4B"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="Sioux Falls"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={e => setState(e.target.value)}
                        placeholder="SD"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        placeholder="57104"
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryInstructions}
                      onChange={e => setDeliveryInstructions(e.target.value)}
                      placeholder="e.g. Leave at front porch behind the planter"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Official Payment Method */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                    3. Payment Method (USD)
                  </h2>
                  <span className="text-xs text-neutral-500 font-medium">Verified Payment Instructions</span>
                </div>

                {/* Method Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {(['cashapp', 'venmo', 'zelle', 'paypal'] as PaymentMethod[]).map(method => {
                    const isSelected = paymentMethod === method;
                    const labels: Record<PaymentMethod, string> = {
                      cashapp: 'Cash App',
                      venmo: 'Venmo',
                      zelle: 'Zelle',
                      paypal: 'PayPal',
                    };
                    return (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-3 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'border-[#111111] bg-[#111111] text-[#D4AF62] shadow-sm'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        {labels[method]}
                      </button>
                    );
                  })}
                </div>

                {/* Instructions Box for Selected Method */}
                {activePaymentConfig && (
                  <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111111] uppercase tracking-wide">
                        Recipient Handle / Identifier:
                      </span>
                      {activePaymentConfig.identifier && (
                        <button
                          type="button"
                          onClick={() => handleCopyIdentifier(activePaymentConfig.identifier)}
                          className="inline-flex items-center gap-1 text-[11px] text-[#D4AF62] hover:text-[#111111] font-semibold cursor-pointer"
                        >
                          {copiedId ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Handle</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <div className="p-2.5 bg-white border border-neutral-200 rounded font-mono text-xs font-bold text-[#111111]">
                      {activePaymentConfig.identifier || 'Configured via Admin'}
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {activePaymentConfig.instructions}
                    </p>

                    <p className="text-[11px] text-neutral-500 italic">
                      Note: Your order will be placed with status <strong>Awaiting Verification</strong>. Once submitted, click the WhatsApp button on the confirmation screen to confirm payment immediately.
                    </p>
                  </div>
                )}
              </div>

            </form>

          </div>

          {/* Right Column: Order Summary & Place Order Button */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-6">
              
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
              </h3>

              {/* Items List */}
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto pr-2">
                {items.map(item => {
                  const img = item.product.images[0]?.url;
                  return (
                    <div key={item.id} className="py-3 flex items-center gap-3">
                      <div className="w-14 h-14 bg-neutral-100 rounded-md overflow-hidden shrink-0 border border-neutral-200">
                        {img ? (
                          <img src={img} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">JJE</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-[#111111] truncate">{item.product.name}</h4>
                        {item.variant && <span className="text-[11px] text-neutral-500 block">{item.variant.name}</span>}
                        <span className="text-xs text-neutral-500 tabular-nums">Qty: {item.quantity} &times; ${item.unitPrice.toFixed(2)}</span>
                      </div>
                      <span className="text-xs font-bold text-[#111111] tabular-nums shrink-0">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Math breakdown */}
              <div className="space-y-2 pt-4 border-t border-neutral-200 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#111111] tabular-nums">${subtotal.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>US Nationwide Shipping</span>
                  <span className="font-semibold text-[#111111] tabular-nums">
                    {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)} USD`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#111111] pt-3 border-t border-neutral-100">
                  <span>Total Due</span>
                  <span className="tabular-nums">${totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold text-xs uppercase tracking-widest rounded-md transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing Order...' : 'Place Order Now'}</span>
              </button>

              <div className="text-[11px] text-neutral-500 text-center space-y-1">
                <p>🔒 Secure client validation &amp; server order record</p>
                <p>Immediate WhatsApp order confirmation provided</p>
              </div>

            </div>

            {/* Sourcing Guarantee Note */}
            <div className="p-4 bg-white rounded-xl border border-[#E5E7EB] flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#D4AF62] shrink-0" />
              <div className="text-xs text-neutral-600">
                <strong className="text-[#111111] block">Direct US Dispatch</strong>
                Orders verified and coordinated from Sioux Falls, South Dakota.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
