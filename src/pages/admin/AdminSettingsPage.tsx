import React, { useState } from 'react';
import { 
  Settings, 
  Phone, 
  MapPin, 
  MessageCircle, 
  ShieldCheck, 
  CreditCard, 
  Check, 
  Database,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { storeService } from '../../services/storeService';
import { updateSupabaseConfig, getActiveSupabaseConfig, isSupabaseConfigured } from '../../lib/supabase';
import { PaymentMethodIcon } from '../../components/common/PaymentIcons';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(storeService.getSettings());
  const [saved, setSaved] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(getActiveSupabaseConfig());

  // Supabase Inputs
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseStatus.url);
  const [supabaseKey, setSupabaseKey] = useState(supabaseStatus.rawKey);
  const [supabaseMsg, setSupabaseMsg] = useState('');

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await storeService.saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleConnectSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateSupabaseConfig(supabaseUrl, supabaseKey);
    setSupabaseMsg(result.message);
    setSupabaseStatus(getActiveSupabaseConfig());
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF62] block">
          Store Configuration
        </span>
        <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
          Business &amp; System Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Configure official contact numbers, internal WhatsApp endpoints, USD payment handles, and database integrations.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Store settings saved successfully!</span>
        </div>
      )}

      {/* 1. Official Business Contact Information */}
      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62] pb-2 border-b border-neutral-100">
            1. Official Business Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Official Business Name *
              </label>
              <input
                type="text"
                required
                value={settings.business_name}
                onChange={e => setSettings(prev => ({ ...prev, business_name: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Business Location *
              </label>
              <input
                type="text"
                required
                value={settings.business_location}
                onChange={e => setSettings(prev => ({ ...prev, business_location: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Official Business Contact Number (Publicly Displayed) *
              </label>
              <input
                type="text"
                required
                value={settings.business_contact_number}
                onChange={e => setSettings(prev => ({ ...prev, business_contact_number: e.target.value }))}
                placeholder="+1 (605) 900-8992"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-medium"
              />
              <span className="text-[11px] text-neutral-400 block mt-1">
                Displayed on Contact Us page and footer for customer phone inquiries.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Internal WhatsApp Number (Strictly Confidential) *
              </label>
              <input
                type="text"
                required
                value={settings.whatsapp_number}
                onChange={e => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                placeholder="+1 (443) 743-5959"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-medium"
              />
              <span className="text-[11px] text-amber-700 block mt-1 font-medium">
                🔒 Security Note: Used internally to build wa.me links. Never displayed as visible website text.
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
              Brand Positioning Statement / Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={e => setSettings(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Your Everyday Finds, Made Easy."
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
            />
          </div>
        </div>

        {/* 2. Official Payment Methods (Cash App, Venmo, Zelle, PayPal) */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62]">
              2. Official USD Payment Methods
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Configure handles and instructions shown to customers during checkout.
            </p>
          </div>

          {/* Cash App */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center p-0.5 border border-neutral-200 shadow-2xs">
                  <PaymentMethodIcon method="cashapp" className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Cash App Configuration
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment_methods.cashapp.enabled}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    payment_methods: {
                      ...prev.payment_methods,
                      cashapp: { ...prev.payment_methods.cashapp, enabled: e.target.checked }
                    }
                  }))}
                  className="rounded text-[#111111]"
                />
                <span className="text-neutral-700 font-semibold">Enable</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Cashtag (e.g. $JoJoEffectsCo)"
                value={settings.payment_methods.cashapp.identifier}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payment_methods: {
                    ...prev.payment_methods,
                    cashapp: { ...prev.payment_methods.cashapp, identifier: e.target.value }
                  }
                }))}
                className="px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
              />
              <input
                type="text"
                placeholder="Payment instructions shown on checkout"
                value={settings.payment_methods.cashapp.instructions}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payment_methods: {
                    ...prev.payment_methods,
                    cashapp: { ...prev.payment_methods.cashapp, instructions: e.target.value }
                  }
                }))}
                className="px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
              />
            </div>
          </div>

          {/* Venmo */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center p-0.5 border border-neutral-200 shadow-2xs">
                  <PaymentMethodIcon method="venmo" className="h-4 w-auto" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Venmo Configuration
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment_methods.venmo.enabled}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    payment_methods: {
                      ...prev.payment_methods,
                      venmo: { ...prev.payment_methods.venmo, enabled: e.target.checked }
                    }
                  }))}
                  className="rounded text-[#111111]"
                />
                <span className="text-neutral-700 font-semibold">Enable</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Venmo Handle (e.g. @JoJoEffects-Co)"
                value={settings.payment_methods.venmo.identifier}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payment_methods: {
                    ...prev.payment_methods,
                    venmo: { ...prev.payment_methods.venmo, identifier: e.target.value }
                  }
                }))}
                className="px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
              />
              <input
                type="text"
                placeholder="Venmo instructions"
                value={settings.payment_methods.venmo.instructions}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payment_methods: {
                    ...prev.payment_methods,
                    venmo: { ...prev.payment_methods.venmo, instructions: e.target.value }
                  }
                }))}
                className="px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
              />
            </div>
          </div>

          {/* Zelle */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center p-0.5 border border-neutral-200 shadow-2xs">
                  <PaymentMethodIcon method="zelle" className="h-4 w-auto" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Zelle Configuration
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment_methods.zelle.enabled}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    payment_methods: {
                      ...prev.payment_methods,
                      zelle: { ...prev.payment_methods.zelle, enabled: e.target.checked }
                    }
                  }))}
                  className="rounded text-[#111111]"
                />
                <span className="text-neutral-700 font-semibold">Enable</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Zelle Recipient (Email or Phone)"
                value={settings.payment_methods.zelle.identifier}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payment_methods: {
                    ...prev.payment_methods,
                    zelle: { ...prev.payment_methods.zelle, identifier: e.target.value }
                  }
                }))}
                className="px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
              />
              <input
                type="text"
                placeholder="Zelle payment memo instructions"
                value={settings.payment_methods.zelle.instructions}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payment_methods: {
                    ...prev.payment_methods,
                    zelle: { ...prev.payment_methods.zelle, instructions: e.target.value }
                  }
                }))}
                className="px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
              />
            </div>
          </div>

          {/* PayPal */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center p-0.5 border border-neutral-200 shadow-2xs">
                  <PaymentMethodIcon method="paypal" className="h-4 w-auto" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  PayPal Configuration
                </span>
              </div>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.payment_methods.paypal.enabled}
                  onChange={e => setSettings(prev => ({
                    ...prev,
                    payment_methods: {
                      ...prev.payment_methods,
                      paypal: { ...prev.payment_methods.paypal, enabled: e.target.checked }
                    }
                  }))}
                  className="rounded text-[#111111]"
                />
                <span className="text-neutral-700 font-semibold">Enable</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="PayPal handle (e.g. paypal.me/jojoeffectsco)"
                value={settings.payment_methods.paypal.identifier}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payment_methods: {
                    ...prev.payment_methods,
                    paypal: { ...prev.payment_methods.paypal, identifier: e.target.value }
                  }
                }))}
                className="px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
              />
              <input
                type="text"
                placeholder="PayPal instructions"
                value={settings.payment_methods.paypal.instructions}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  payment_methods: {
                    ...prev.payment_methods,
                    paypal: { ...prev.payment_methods.paypal, instructions: e.target.value }
                  }
                }))}
                className="px-3 py-2 bg-white border border-neutral-200 rounded text-xs text-[#111111]"
              />
            </div>
          </div>
        </div>

        {/* 3. Social Media URLs */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#D4AF62] pb-2 border-b border-neutral-100">
            3. Social Media Presence
          </h2>
          <p className="text-xs text-neutral-500">
            Icons will only display in the footer if a valid URL is provided. Leave empty to hide.
          </p>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Facebook Page URL
              </label>
              <input
                type="text"
                value={settings.social_links.facebook}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links, facebook: e.target.value }
                }))}
                placeholder="https://facebook.com/jojoeffects"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                Instagram Profile URL
              </label>
              <input
                type="text"
                value={settings.social_links.instagram}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links, instagram: e.target.value }
                }))}
                placeholder="https://instagram.com/jojoeffects"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
                TikTok Profile URL
              </label>
              <input
                type="text"
                value={settings.social_links.tiktok}
                onChange={e => setSettings(prev => ({
                  ...prev,
                  social_links: { ...prev.social_links, tiktok: e.target.value }
                }))}
                placeholder="https://tiktok.com/@jojoeffects"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111]"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold text-xs uppercase tracking-widest rounded-md shadow-md cursor-pointer"
            >
              Save Store Settings
            </button>
          </div>
        </div>

      </form>

      {/* 4. Supabase Database Integration Box */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E7EB] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#D4AF62]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              4. Supabase Backend Connection
            </h2>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
            isSupabaseConfigured
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-neutral-100 text-neutral-600'
          }`}>
            {isSupabaseConfigured ? 'Connected' : 'Local Store Active'}
          </span>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          The store is fully functional out-of-the-box with reactive local persistence. To sync with your remote Supabase PostgreSQL database, enter your Supabase Project URL and Anon Key below or configure <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in Vercel.
        </p>

        {supabaseMsg && (
          <div className="p-3 bg-neutral-100 text-neutral-800 text-xs rounded border border-neutral-200">
            {supabaseMsg}
          </div>
        )}

        <form onSubmit={handleConnectSupabase} className="space-y-3 pt-2">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-mono focus:outline-none focus:border-[#D4AF62]"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={e => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded text-xs text-[#111111] font-mono focus:outline-none focus:border-[#D4AF62]"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              Full SQL schema file available in <code className="font-mono">supabase/migrations/</code>
            </span>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold text-xs uppercase tracking-wider rounded"
            >
              Update Supabase Connection
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
