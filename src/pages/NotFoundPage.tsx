import React from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (route: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <span className="text-4xl font-extrabold text-[#D4AF62] block mb-2 font-mono">
          404
        </span>
        <h1 className="text-2xl font-bold text-[#111111] uppercase tracking-wider">
          Page Not Found
        </h1>
        <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
          The destination you requested might have been moved, renamed, or is temporarily unavailable.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="px-6 py-2.5 bg-[#111111] text-[#D4AF62] rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#222222] transition-colors"
          >
            Return Home
          </button>
          <button
            onClick={() => onNavigate('/shop')}
            className="px-5 py-2.5 bg-white border border-neutral-300 text-[#111111] rounded-md text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors"
          >
            Browse Shop
          </button>
        </div>
      </div>
    </div>
  );
};
