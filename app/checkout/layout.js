'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, ChevronRight } from 'lucide-react';
import EnhancedHeader from '@/components/landing/EnhancedHeader';
import Footer from '@/components/landing/Footer';
import { useCart } from '@/lib/cartContext';

export default function CheckoutLayout({ children }) {
  const pathname = usePathname();
  const { cart, itemCount, refreshCart } = useCart();

  // Fetch cart when checkout loads
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <main className="min-h-screen text-[#EAE0D5] selection:bg-[#F2C29A] selection:text-[#050203]">
      {/* Background is now handled by root layout */}
      
      <div className="relative z-10 page-wrapper">
        <EnhancedHeader />
        
        <div className="page-content">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 header-spacing">
            {/* Page Header */}
            <div className="mb-8">
              <h1 
                className="text-3xl md:text-4xl font-bold text-[#F2C29A]"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                Checkout
              </h1>
            </div>

            {/* Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {children}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl space-y-4">
                <h2 className="text-lg font-semibold text-[#F2C29A]">Order Summary</h2>
                
                {/* Items Preview */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-14 bg-[#7A2F57]/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-[#B76E79]/30">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#EAE0D5] line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-[#EAE0D5]/50">
                          {item.size && <span>{item.size}</span>}
                          {item.size && item.color && <span> · {item.color}</span>}
                        </p>
                      </div>
                      <span className="text-sm text-[#F2C29A]">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-4 border-t border-[#B76E79]/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#EAE0D5]/70">Subtotal ({itemCount} items)</span>
                    <span className="text-[#EAE0D5]">{formatCurrency(cart?.subtotal)}</span>
                  </div>
                  {cart?.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#EAE0D5]/70">Discount</span>
                      <span className="text-green-400">-{formatCurrency(cart.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#EAE0D5]/70">Shipping</span>
                    <span className="text-[#EAE0D5]">
                      {cart?.shipping > 0 ? formatCurrency(cart.shipping) : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#B76E79]/10">
                    <span className="text-[#EAE0D5] font-medium">Total</span>
                    <span className="text-[#F2C29A] font-bold text-lg">{formatCurrency(cart?.total)}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
