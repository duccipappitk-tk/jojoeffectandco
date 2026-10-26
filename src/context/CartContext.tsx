import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, OrderItem } from '../types';

export interface CartItem {
  id: string; // unique item key: productId + variantId
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'jojo_cart_items_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, variant?: ProductVariant, quantity: number = 1) => {
    const unitPrice = (product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.base_price) + (variant?.price_adjustment || 0);
    const itemKey = `${product.id}-${variant?.id || 'standard'}`;

    setItems(prevItems => {
      const existing = prevItems.find(i => i.id === itemKey);
      if (existing) {
        return prevItems.map(i =>
          i.id === itemKey
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prevItems, { id: itemKey, product, variant, quantity, unitPrice }];
    });

    setIsDrawerOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  // Free shipping above $100, otherwise standard $9.95 flat rate across USA
  const shippingFee = subtotal >= 100 || subtotal === 0 ? 0 : 9.95;

  const totalAmount = subtotal + shippingFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingFee,
        totalAmount,
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
