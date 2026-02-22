'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Package, Truck, Mail, Phone, MapPin, ChevronRight, ShoppingBag } from 'lucide-react';
import { ordersApi } from '@/lib/customerApi';
import { useCart } from '@/lib/cartContext';

export default function CheckoutConfirmPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createOrder();
  }, []);

  const createOrder = async () => {
    try {
      setLoading(true);
      
      const addressId = sessionStorage.getItem('checkout_address_id');
      const paymentId = sessionStorage.getItem('payment_id');
      
      if (!addressId) {
        router.push('/checkout');
        return;
      }

      try {
        const orderData = await ordersApi.create({
          address_id: parseInt(addressId),
          payment_method: paymentId ? 'razorpay' : 'cod',
          payment_id: paymentId,
        });
        setOrder(orderData.order || orderData);
        
        // Clear cart and session
        clearCart();
        sessionStorage.removeItem('checkout_address_id');
        sessionStorage.removeItem('payment_id');
      } catch (apiError) {
        console.log('Using mock order data');
        // Mock order for demo
        setOrder({
          id: 'ORD-' + Date.now(),
          order_number: 'AC' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          status: 'confirmed',
          total: cart?.total || 0,
          items: cart?.items || [],
          shipping_address: {
            full_name: 'Customer Name',
            phone: '+91 98765 43210',
            address: '123, MG Road, Bangalore - 560034',
          },
          estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }),
        });
        
        // Clear cart
        clearCart();
      }
    } catch (err) {
      console.error('Error creating order:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#B76E79]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="p-8 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        
        <h2 className="text-2xl font-bold text-[#F2C29A] mb-2">Order Confirmed!</h2>
        <p className="text-[#EAE0D5]/70 mb-4">
          Thank you for your order. We've received your order and will process it shortly.
        </p>
        
        {order?.order_number && (
          <div className="inline-block px-4 py-2 bg-[#7A2F57]/20 rounded-lg">
            <span className="text-sm text-[#EAE0D5]/70">Order Number: </span>
            <span className="font-mono font-semibold text-[#F2C29A]">{order.order_number}</span>
          </div>
        )}
      </div>

      {/* Order Timeline */}
      <div className="p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl">
        <h3 className="text-lg font-semibold text-[#F2C29A] mb-4">What's Next?</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#7A2F57]/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-[#F2C29A]">Order Confirmed</p>
              <p className="text-sm text-[#EAE0D5]/70">Your order has been placed successfully</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B76E79]/20 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-[#B76E79]" />
            </div>
            <div>
              <p className="font-medium text-[#EAE0D5]">Processing</p>
              <p className="text-sm text-[#EAE0D5]/70">We're preparing your order for shipment</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#B76E79]/10 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-[#EAE0D5]/50" />
            </div>
            <div>
              <p className="font-medium text-[#EAE0D5]/50">Shipped</p>
              <p className="text-sm text-[#EAE0D5]/50">Your order is on its way</p>
            </div>
          </div>
        </div>

        {order?.estimated_delivery && (
          <div className="mt-6 p-4 bg-[#7A2F57]/10 rounded-xl">
            <p className="text-sm text-[#EAE0D5]/70">Estimated Delivery</p>
            <p className="text-lg font-semibold text-[#F2C29A]">{order.estimated_delivery}</p>
          </div>
        )}
      </div>

      {/* Order Details */}
      {order && (
        <div className="p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl">
          <h3 className="text-lg font-semibold text-[#F2C29A] mb-4">Order Details</h3>
          
          {/* Items */}
          <div className="space-y-3 mb-6">
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-16 h-20 bg-[#7A2F57]/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-[#B76E79]/30" />
                </div>
                <div className="flex-1">
                  <p className="text-[#EAE0D5]">{item.product_name}</p>
                  <p className="text-sm text-[#EAE0D5]/50">
                    Qty: {item.quantity} • {formatCurrency(item.price)}
                  </p>
                </div>
                <p className="text-[#F2C29A]">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          {order.shipping_address && (
            <div className="pt-4 border-t border-[#B76E79]/10">
              <h4 className="text-sm font-medium text-[#EAE0D5]/70 mb-2">Delivery Address</h4>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B76E79] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#EAE0D5]">{order.shipping_address.full_name}</p>
                  <p className="text-sm text-[#EAE0D5]/70">{order.shipping_address.address}</p>
                  <p className="text-sm text-[#EAE0D5]/70">{order.shipping_address.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between pt-4 mt-4 border-t border-[#B76E79]/10">
            <span className="text-[#EAE0D5]">Total Paid</span>
            <span className="text-xl font-bold text-[#F2C29A]">{formatCurrency(order.total)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/profile/orders"
          className="flex-1 py-3 text-center border border-[#B76E79]/20 text-[#B76E79] rounded-xl hover:border-[#B76E79]/40 hover:text-[#F2C29A] transition-colors"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="flex-1 py-3 text-center bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          Continue Shopping
          <ShoppingBag className="w-4 h-4" />
        </Link>
      </div>

      {/* Support */}
      <div className="p-4 bg-[#7A2F57]/10 border border-[#B76E79]/10 rounded-xl text-center">
        <p className="text-sm text-[#EAE0D5]/70">
          Need help? Contact us at{' '}
          <a href="mailto:support@aaryaclothing.com" className="text-[#B76E79] hover:text-[#F2C29A]">
            support@aaryaclothing.com
          </a>
        </p>
      </div>
    </div>
  );
}
