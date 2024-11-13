// lib/hooks/use-cart.ts
import { useContext } from 'react';
import { CartContext } from '@/components/providers/cart-provider';
import { CartContextType } from '@/types/cart';

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};