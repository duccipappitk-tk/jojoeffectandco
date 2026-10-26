import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Facebook,
  Instagram
} from 'lucide-react';
import { SiteSettings, InquiryType } from '../types';
import { storeService } from '../services/storeService';

interface ContactPageProps {
  settings: SiteSettings;
  onNavigate: (route: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings, onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inquiryType, setInquiryType] = useState<InquiryType>('general_inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await storeService.createInquiry({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        inquiry_type: inquiryType,
        message: message.trim(),
      });

      setSubmitted(true);
      setFullName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg('Failed to send inquiry. Please reach out via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const link = storeService.getWhatsAppGeneralLink();
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const hasFacebook = Boolean(settings.social_links?.facebook);
  const hasInstagram = Boolean(settings.social_links?.instagram);
  const hasTikTok = Boolean(settings.social_links?.tiktok);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header Banner */}
      <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block mb-1">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Contact JO JO EFFECTS &amp; CO.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-lg mx-auto leading-relaxed">
            Have questions about product availability, order dispatch, or payment methods? We are here to assist.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Official Business Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            
            <div>
              <span className="text-xs font-bold tracking-[0.2em] text-[#D4AF62] uppercase block">
                Official Business Info
              </span>
              <h2 className="text-2xl font-bold text-[#111111] mt-1 tracking-tight">
                {settings.business_name}
              </h2>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                We operate from South Dakota, sourcing premium everyday essentials with direct customer service.
              </p>
            </div>

            <div className="space-y-6">
              
              {/* Location */}
              <div className="flex items-start gap-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] text-[#D4AF62] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Location</h3>
                  <p className="text-xs text-neutral-600 mt-1 font-medium">{settings.business_location}</p>
                </div>
              </div>

              {/* Official Business Contact Number (Visible here) */}
              <div className="flex items-start gap-4 p-4 bg-[#F9FAFB] rounded-xl border border-[#E5E7EB]">
                <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] text-[#D4AF62] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">Business Contact Number</h3>
                  <a
                    href={`tel:${settings.business_contact_number.replace(/\s+/g, '')}`}
                    className="text-xs font-bold text-[#111111] hover:text-[#D4AF62] transition-colors mt-1 block"
                  >
                    {settings.business_contact_number}
                  </a>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">Direct phone support &amp; dispatch inquiries</span>
                </div>
              </div>

              {/* WhatsApp Support Button (CRITICAL: WITHOUT displaying phone number) */}
              <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">WhatsApp Concierge</h3>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Chat with our store representatives for instant product inquiries, custom styling advice, or order tracking.
                </p>
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start WhatsApp Chat</span>
                </button>
              </div>

            </div>

            {/* Social Media Links */}
            <div className="pt-4 border-t border-neutral-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-3">Connect With Us</h4>
              <div className="flex items-center gap-3">
                <a
                  href={settings.social_links?.facebook || 'https://facebook.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-xs font-semibold text-neutral-700 hover:text-[#111111] hover:border-[#D4AF62] transition-colors flex items-center gap-2"
                  title="Follow us on Facebook"
                >
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook</span>
                </a>

                {hasInstagram && (
                  <a
                    href={settings.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-xs font-semibold text-neutral-700 hover:text-[#111111] hover:border-[#D4AF62] transition-colors flex items-center gap-2"
                    title="Follow us on Instagram"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#E5E7EB] shadow-md">
            
            <h3 className="text-xl font-bold text-[#111111] mb-2 tracking-tight">
              Send an Inquiry
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Fill in your details below and our team will get back to you promptly.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                  Inquiry Received!
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                  Thank you for reaching out to JO JO EFFECTS &amp; CO. We have recorded your message and will respond via phone or email shortly.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1.5">
                      Inquiry Type
                    </label>
                    <select
                      value={inquiryType}
                      onChange={e => setInquiryType(e.target.value as InquiryType)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                    >
                      <option value="product_inquiry">Product Inquiry</option>
                      <option value="order_inquiry">Order Inquiry</option>
                      <option value="delivery_inquiry">Delivery Inquiry</option>
                      <option value="general_inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us what product or assistance you need..."
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-xs text-[#111111] placeholder:text-neutral-400 focus:outline-none focus:border-[#D4AF62] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold text-xs uppercase tracking-widest rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
                </button>

              </form>
            )}

          </div>

        </div>
      </div>

    </div>
  );
};
