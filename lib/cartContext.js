'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { cartApi } from '@/lib/customerApi';

// Mock cart data for development
const MOCK_CART = {
  items: [
    { id: 1, product_id: 15, product_name: 'Silk Evening Gown', price: 5999, quantity: 1, image: '/products/gown-1.jpg', size: 'M', color: 'Burgundy' },
    { id: 2, product_id: 23, product_name: 'Velvet Blazer', price: 3999, quantity: 2, image: '/products/blazer-1.jpg', size: 'L', color: 'Navy' },
  ],
  subtotal: 13997,
  discount: 0,
  shipping: 0,
  total: 13997,
  coupon_code: null,
  item_count: 3,
};

// Empty cart initial state
const EMPTY_CART = { items: [], subtotal: 0, discount: 0, shipping: 0, total: 0, item_count: 0 };

const CartContext = createContext(null);

/**
 * Simple mutex lock for preventing race conditions
 */
class Mutex {
  constructor() {
    this._locked = false;
    this._queue = [];
  }

  async lock() {
    if (!this._locked) {
      this._locked = true;
      return;
    }
    return new Promise(resolve => {
      this._queue.push(resolve);
    });
  }

  unlock() {
    const next = this._queue.shift();
    if (next) {
      next();
    } else {
      this._locked = false;
    }
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const fetchingRef = useRef(false);
  const mutexRef = useRef(new Mutex());

  // Lazy fetch cart - only when needed (with mutex for race condition prevention)
  const fetchCart = useCallback(async (force = false) => {
    // Prevent duplicate fetches
    if (fetchingRef.current) return;
    if (hasFetched && !force) return;
    
    // Acquire lock to prevent race conditions
    await mutexRef.current.lock();
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      
      try {
        const data = await cartApi.get();
        setCart(data);
      } catch (apiError) {
        // Use mock data if API fails (development mode)
        if (process.env.NODE_ENV === 'development') {
          setCart(MOCK_CART);
        } else {
          setCart(EMPTY_CART);
        }
      }
      setHasFetched(true);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
      mutexRef.current.unlock();
    }
  }, [hasFetched]);

  // Fetch cart only when cart drawer is opened or on cart-related pages
  const openCart = useCallback(() => {
    setIsOpen(true);
    // Fetch cart when opening the drawer if not yet fetched
    if (!hasFetched) {
      fetchCart();
    }
  }, [hasFetched, fetchCart]);

  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      // Fetch cart when opening via toggle
      if (newState && !hasFetched) {
        fetchCart();
      }
      return newState;
    });
  }, [hasFetched, fetchCart]);

  const addItem = useCallback(async (productId, quantity = 1, variant = null) => {
    try {
      // If cart hasn't been fetched yet, fetch it first
      if (!hasFetched) {
        await fetchCart();
      }
      
      try {
        const data = await cartApi.addItem(productId, quantity, variant?.id);
        setCart(data);
      } catch (apiError) {
        // Optimistic update with mock
        setCart(prev => {
          const existingItem = prev.items.find(item => item.product_id === productId);
          
          if (existingItem) {
            return {
              ...prev,
              items: prev.items.map(item => 
                item.product_id === productId 
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              item_count: prev.item_count + quantity,
              subtotal: prev.subtotal + (existingItem.price * quantity),
              total: prev.total + (existingItem.price * quantity),
            };
          }
          
          // Add new item (mock)
          const newItem = {
            id: Date.now(),
            product_id: productId,
            product_name: 'New Product',
            price: 2999,
            quantity,
            image: '/products/placeholder.jpg',
            ...variant,
          };
          
          return {
            ...prev,
            items: [...prev.items, newItem],
            item_count: prev.item_count + quantity,
            subtotal: prev.subtotal + (newItem.price * quantity),
            total: prev.total + (newItem.price * quantity),
          };
        });
      }
      
      // Open cart drawer
      setIsOpen(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  }, [hasFetched, fetchCart]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      try {
        const data = await cartApi.updateItem(itemId, quantity);
        setCart(data);
      } catch (apiError) {
        // Optimistic update
        setCart(prev => {
          const item = prev.items.find(i => i.id === itemId);
          if (!item) return prev;
          
          const diff = quantity - item.quantity;
          
          return {
            ...prev,
            items: prev.items.map(i => 
              i.id === itemId ? { ...i, quantity } : i
            ),
            item_count: prev.item_count + diff,
            subtotal: prev.subtotal + (item.price * diff),
            total: prev.total + (item.price * diff),
          };
        });
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      try {
        const data = await cartApi.removeItem(itemId);
        setCart(data);
      } catch (apiError) {
        // Optimistic update
        setCart(prev => {
          const item = prev.items.find(i => i.id === itemId);
          if (!item) return prev;
          
          return {
            ...prev,
            items: prev.items.filter(i => i.id !== itemId),
            item_count: prev.item_count - item.quantity,
            subtotal: prev.subtotal - (item.price * item.quantity),
            total: prev.total - (item.price * item.quantity),
          };
        });
      }
    } catch (err) {
      console.error('Error removing item:', err);
      throw err;
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      try {
        await cartApi.clear();
      } catch (apiError) {
        // Mock clear
      }
      
      setCart(EMPTY_CART);
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw err;
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    try {
      const data = await cartApi.applyCoupon(code);
      setCart(data);
      return data;
    } catch (err) {
      console.error('Error applying coupon:', err);
      throw err;
    }
  }, []);

  const removeCoupon = useCallback(async () => {
    try {
      const data = await cartApi.removeCoupon();
      setCart(data);
    } catch (err) {
      console.error('Error removing coupon:', err);
      throw err;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    cart,
    loading,
    isOpen,
    itemCount: cart?.item_count || 0,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    openCart,
    closeCart,
    toggleCart,
    refreshCart: () => fetchCart(true),
  }), [cart, loading, isOpen, addItem, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, openCart, closeCart, toggleCart, fetchCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
