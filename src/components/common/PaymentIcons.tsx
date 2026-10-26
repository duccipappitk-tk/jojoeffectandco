import React from 'react';
import { PaymentMethod } from '../../types';

interface IconProps {
  className?: string;
}

/**
 * Official Cash App Logo
 * Brand color: #00D632 with crisp white signature angled dollar mark
 */
export const CashAppIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    {/* Cash App official green squircle container */}
    <rect width="32" height="32" rx="7" fill="#00D632" />
    {/* Official signature tilted Cash App dollar mark */}
    <g transform="rotate(-13 16 16)">
      <path
        d="M18.8 11.2c-.3-.7-.9-1.2-1.7-1.4V8.4a1.1 1.1 0 0 0-2.2 0v1.2h-1.4a3.6 3.6 0 0 0-3.6 3.6c0 3 2.5 3.8 4.6 4.5.6.2 1.3.5 1.8.7.7.3 1.1.6 1.1 1.2 0 .6-.5 1.1-1.4 1.1-1.1 0-1.9-.5-2.5-1.3a1.1 1.1 0 1 0-1.8 1.2c.9 1.4 2.4 2.1 4 2.3v1.1a1.1 1.1 0 1 0 2.2 0v-1.1h1.4a3.6 3.6 0 0 0 3.6-3.6c0-3-2.5-3.8-4.6-4.5-.6-.2-1.3-.5-1.8-.7-.7-.3-1.1-.6-1.1-1.2 0-.6.5-1.1 1.4-1.1 1.1 0 1.9.5 2.5 1.3a1.1 1.1 0 0 0 1.8-1.2z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
);

/**
 * Official Venmo Logo
 * Brand color: #008CFF with signature italic V geometry
 */
export const VenmoIcon: React.FC<IconProps> = ({ className = 'h-5 w-auto' }) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    {/* Official Venmo italic V vector */}
    <path
      d="M25.8 4.2c.8 1.4 1.2 2.8 1.2 4.4 0 5.6-4.8 12.9-8.7 18.2h-6.2L8.5 6.6l5.6-.5 2.2 14.1c1.7-2.9 3.9-7.5 3.9-10.7 0-1.5-.3-2.6-.7-3.4l6.3-1.9z"
      fill="#008CFF"
    />
  </svg>
);

/**
 * Official Zelle Logo
 * Brand color: #7414CA with cross-barred stylized Z mark
 */
export const ZelleIcon: React.FC<IconProps> = ({ className = 'h-5 w-auto' }) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    {/* Top vertical bar passing through top stroke */}
    <rect x="14" y="3.5" width="4" height="8.5" rx="2" fill="#7414CA" />
    {/* Zelle Z body */}
    <path
      d="M7.5 9.5h17v3.2L12 22.5h12.5v3.2H7.5v-3.2L20 12.7H7.5V9.5z"
      fill="#7414CA"
    />
    {/* Bottom vertical bar passing through bottom stroke */}
    <rect x="14" y="20" width="4" height="8.5" rx="2" fill="#7414CA" />
  </svg>
);

/**
 * Official PayPal Logo
 * Brand colors: Deep Blue #003087 and Light Blue #0079C1 with #00457C overlap
 */
export const PayPalIcon: React.FC<IconProps> = ({ className = 'h-5 w-auto' }) => (
  <svg
    viewBox="0 0 32 32"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    {/* Back P (Deep Navy) */}
    <path
      d="M10.8 5.5h6.8c3.2 0 5.6.8 6.9 2.3 1.2 1.4 1.6 3.4 1.2 5.9-.8 4.7-3.9 7.4-8.5 7.4H13.6l-1.8 11.4H6.5l4.3-27z"
      fill="#003087"
    />
    {/* Front P (Light Blue) */}
    <path
      d="M15.4 10.2h6.2c3.2 0 5.6.8 6.9 2.3 1.2 1.4 1.6 3.4 1.2 5.9-.8 4.9-4.2 7.8-8.9 7.8h-3.3l-1.8 11.3H11l4.4-27.3z"
      fill="#0079C1"
    />
    {/* Overlap area */}
    <path
      d="M19.2 26.2h3.8c4.7 0 8.1-2.9 8.9-7.8.2-1.3.1-2.4-.2-3.3-.9 3.5-3.6 5.8-7.7 5.8h-3.4l-1.4 9.1v.2z"
      fill="#00457C"
    />
  </svg>
);

/**
 * Universal payment method icon renderer
 */
export const PaymentMethodIcon: React.FC<{
  method: PaymentMethod;
  className?: string;
}> = ({ method, className }) => {
  switch (method) {
    case 'cashapp':
      return <CashAppIcon className={className || 'h-5 w-5'} />;
    case 'venmo':
      return <VenmoIcon className={className || 'h-5 w-auto'} />;
    case 'zelle':
      return <ZelleIcon className={className || 'h-5 w-auto'} />;
    case 'paypal':
      return <PayPalIcon className={className || 'h-5 w-auto'} />;
    default:
      return null;
  }
};

export const PAYMENT_METHOD_NAMES: Record<PaymentMethod, string> = {
  cashapp: 'Cash App',
  venmo: 'Venmo',
  zelle: 'Zelle',
  paypal: 'PayPal',
};

/**
 * Official Payment Badge for storefront display.
 * Renders the brand logo inside a crisp, uniform, neutral white badge card
 * ensuring optimal contrast against dark footers and preserving exact proportions.
 * Non-clickable visual indicator per brand & e-commerce guidelines.
 */
export const PaymentMethodBadge: React.FC<{
  method: PaymentMethod;
  className?: string;
}> = ({ method, className = '' }) => {
  const name = PAYMENT_METHOD_NAMES[method];

  return (
    <div
      role="img"
      aria-label={name}
      title={name}
      className={`inline-flex items-center justify-center h-8 w-[54px] sm:w-[58px] bg-white rounded-md shadow-xs border border-white/10 select-none shrink-0 p-1 ${className}`}
    >
      <PaymentMethodIcon method={method} className="h-5 w-auto max-w-[42px] object-contain" />
    </div>
  );
};
