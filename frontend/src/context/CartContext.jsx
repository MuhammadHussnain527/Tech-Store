import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../services/api';
import { useAuthContext } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuthContext();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setItems([]); return; }
    setLoading(true);
    try {
      const res = await cartApi.get();
      setItems(res.data ?? []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    await cartApi.add(productId, quantity);
    await fetchCart();
  }, [fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    await cartApi.update(productId, quantity);
    await fetchCart();
  }, [fetchCart]);

  const removeFromCart = useCallback(async (productId) => {
    await cartApi.remove(productId);
    await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    await cartApi.clear();
    setItems([]);
  }, []);

  const itemCount = items.reduce((acc, i) => acc + (i.quantity ?? 0), 0);

  return (
    <CartContext.Provider value={{ items, loading, itemCount, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used inside <CartProvider>');
  return ctx;
}
