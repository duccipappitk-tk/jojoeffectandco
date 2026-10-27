import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onNavigatePublic: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onSuccess,
  onNavigatePublic,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111]/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 selection:bg-[#D4AF62] selection:text-[#111111]">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-800 p-8 sm:p-10">
        
        {/* Dismiss Button */}
        <button
          type="button"
          onClick={() => onNavigatePublic('/')}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-[#111111] hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close Admin Portal"
          title="Return to Storefront"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <img
            src="/assets/aistudio/Jo_Jo_Effects___Co._Luxe_Emblem_5e3cd1b0.png"
            alt="JO JO EFFECTS & CO."
            className="h-16 w-16 mx-auto object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-extrabold text-[#111111] uppercase tracking-wider">
            Admin Portal
          </h1>
          <p className="text-xs text-neutral-500">
            Secure management console for JO JO EFFECTS &amp; CO.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md text-xs text-[#111111] focus:outline-none focus:border-[#D4AF62] focus:bg-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#111111] hover:bg-[#222222] text-[#D4AF62] font-bold text-xs uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigatePublic('/')}
            className="text-xs text-neutral-500 hover:text-[#111111] font-semibold transition-colors cursor-pointer"
          >
            &larr; Return to Customer Storefront
          </button>
        </div>

      </div>
    </div>
  );
};
