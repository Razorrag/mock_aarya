'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export default function CartDrawer() {
  const { cart, loading, isOpen, closeCart, updateQuantity, removeItem, itemCount } = useCart();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[54] cart-drawer-backdrop"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0B0608] border-l border-[#B76E79]/20 z-[55] cart-drawer flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B76E79]/15">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#B76E79]" />
            <h2 className="text-lg font-semibold text-[#F2C29A]">Shopping Cart</h2>
            <span className="px-2 py-0.5 bg-[#7A2F57]/30 text-[#F2C29A] text-xs rounded-full">
              {itemCount}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-[#EAE0D5]/50 hover:text-[#EAE0D5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4">
                  <div className="w-20 h-24 bg-[#B76E79]/10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#B76E79]/10 rounded w-3/4" />
                    <div className="h-4 bg-[#B76E79]/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !cart?.items || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-[#B76E79]/30 mb-4" />
              <p className="text-[#EAE0D5]/50 mb-4">Your cart is empty</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="px-6 py-2.5 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-[#0B0608]/40 border border-[#B76E79]/10 rounded-xl"
                >
                  {/* Image */}
                  <div className="w-20 h-24 bg-[#7A2F57]/10 rounded-lg overflow-hidden flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-[#B76E79]/30">Image</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product_id}`}
                      onClick={closeCart}
                      className="text-[#EAE0D5] hover:text-[#F2C29A] transition-colors line-clamp-2"
                    >
                      {item.product_name}
                    </Link>
                    
                    {(item.size || item.color) && (
                      <p className="text-xs text-[#EAE0D5]/50 mt-1">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span> • </span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[#F2C29A] font-medium">{formatCurrency(item.price)}</p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-[#EAE0D5]/50 hover:text-[#EAE0D5] disabled:opacity-30 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm text-[#EAE0D5]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-[#EAE0D5]/50 hover:text-[#EAE0D5] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-[#EAE0D5]/30 hover:text-[#B76E79] transition-colors self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart?.items?.length > 0 && (
          <div className="border-t border-[#B76E79]/15 p-4 space-y-4">
            {/* Coupon */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                className="flex-1 px-3 py-2 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 text-sm"
              />
              <button className="px-4 py-2 border border-[#B76E79]/20 text-[#B76E79] rounded-lg hover:border-[#B76E79]/40 transition-colors text-sm">
                Apply
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#EAE0D5]/50">Subtotal</span>
                <span className="text-[#EAE0D5]">{formatCurrency(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#EAE0D5]/50">Discount</span>
                  <span className="text-green-400">-{formatCurrency(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#EAE0D5]/50">Shipping</span>
                <span className="text-[#EAE0D5]">
                  {cart.shipping > 0 ? formatCurrency(cart.shipping) : 'Free'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#B76E79]/10">
                <span className="text-[#EAE0D5] font-medium">Total</span>
                <span className="text-[#F2C29A] font-semibold text-lg">{formatCurrency(cart.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full py-3 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white text-center font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full py-2.5 text-center text-[#B76E79] hover:text-[#F2C29A] transition-colors text-sm"
              >
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
