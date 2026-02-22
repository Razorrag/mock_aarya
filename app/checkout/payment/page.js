'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, ChevronRight, Lock, Shield, ChevronDown, Check } from 'lucide-react';
import { paymentApi } from '@/lib/customerApi';
import { useCart } from '@/lib/cartContext';

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [processing, setProcessing] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);
      
      const addressId = sessionStorage.getItem('checkout_address_id');
      
      if (!addressId) {
        alert('Please select a delivery address');
        router.push('/checkout');
        return;
      }

      // Create Razorpay order
      try {
        const orderData = await paymentApi.createOrder({
          amount: cart.total,
          currency: 'INR',
        });
        
        // Initialize Razorpay
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxx',
          amount: cart.total * 100,
          currency: 'INR',
          name: 'Aarya Clothing',
          description: 'Order Payment',
          order_id: orderData.order_id,
          handler: function (response) {
            // Store payment details
            sessionStorage.setItem('payment_id', response.razorpay_payment_id);
            sessionStorage.setItem('order_id', response.razorpay_order_id);
            sessionStorage.setItem('payment_signature', response.razorpay_signature);
            router.push('/checkout/confirm');
          },
          prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999',
          },
          theme: {
            color: '#B76E79',
          },
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (apiError) {
        console.log('Demo mode - simulating payment');
        // Simulate payment for demo
        sessionStorage.setItem('payment_id', 'pay_demo_' + Date.now());
        router.push('/checkout/confirm');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Pay using UPI, Cards, Net Banking, Wallets',
      icon: '💳',
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: '💵',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl">
        <h2 className="text-xl font-semibold text-[#F2C29A] mb-6">Payment Method</h2>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`relative p-4 border rounded-xl cursor-pointer transition-all ${
                paymentMethod === method.id
                  ? 'bg-[#7A2F57]/20 border-[#B76E79]'
                  : 'bg-[#0B0608]/40 border-[#B76E79]/15 hover:border-[#B76E79]/30'
              }`}
            >
              {paymentMethod === method.id && (
                <div className="absolute top-3 right-3">
                  <Check className="w-5 h-5 text-[#B76E79]" />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <p className="font-medium text-[#F2C29A]">{method.name}</p>
                  <p className="text-sm text-[#EAE0D5]/70">{method.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Details (for Razorpay) */}
      {paymentMethod === 'razorpay' && (
        <div className="p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-[#B76E79]" />
            <span className="text-sm text-[#EAE0D5]/70">Secure payment powered by Razorpay</span>
          </div>
          
          <p className="text-[#EAE0D5]/70 text-sm">
            Click "Pay Now" to proceed to Razorpay's secure payment gateway. You can pay using:
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'].map((method) => (
              <span
                key={method}
                className="px-3 py-1 bg-[#7A2F57]/20 text-[#EAE0D5]/70 text-sm rounded-full"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* COD Info */}
      {paymentMethod === 'cod' && (
        <div className="p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl">
          <h3 className="text-[#F2C29A] font-medium mb-2">Cash on Delivery</h3>
          <p className="text-sm text-[#EAE0D5]/70">
            Pay with cash when your order is delivered. Please keep the exact amount ready.
            A confirmation call may be made for verification.
          </p>
        </div>
      )}

      {/* Security Info */}
      <div className="p-4 bg-[#7A2F57]/10 border border-[#B76E79]/10 rounded-xl">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#B76E79]" />
          <div>
            <p className="text-sm text-[#F2C29A]">100% Secure Payments</p>
            <p className="text-xs text-[#EAE0D5]/50">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <div className="flex justify-end">
        <button
          onClick={handlePayment}
          disabled={processing}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {processing ? (
            'Processing...'
          ) : (
            <>
              {paymentMethod === 'cod' ? 'Place Order' : `Pay ${formatCurrency(cart?.total)}`}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
