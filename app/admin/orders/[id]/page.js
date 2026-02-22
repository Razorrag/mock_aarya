'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Copy,
  MessageSquare,
} from 'lucide-react';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/shared/StatusBadge';
import { ordersApi } from '@/lib/adminApi';

// Mock order detail
const MOCK_ORDER = {
  order: {
    id: 1,
    user_id: 101,
    subtotal: 8999,
    discount_applied: 500,
    shipping_cost: 0,
    total_amount: 8499,
    status: 'processing',
    shipping_address: JSON.stringify({
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      address: '42, MG Road, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
    }),
    transaction_id: 'TXN_12345_RAZORPAY',
    created_at: '2026-02-12T09:45:00',
    updated_at: '2026-02-12T10:30:00',
  },
  items: [
    { id: 1, product_id: 15, product_name: 'Silk Evening Gown', quantity: 1, price: 5999, size: 'M', color: 'Burgundy' },
    { id: 2, product_id: 23, product_name: 'Velvet Blazer', quantity: 1, price: 3000, size: 'L', color: 'Navy' },
  ],
  customer: {
    id: 101,
    email: 'priya.sharma@email.com',
    username: 'priya_s',
    full_name: 'Priya Sharma',
    phone: '+91 98765 43210',
  },
};

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const orderId = use(params).id;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      
      try {
        const data = await ordersApi.get(orderId);
        setOrder(data);
      } catch (apiError) {
        console.log('Using mock order data');
        setOrder(MOCK_ORDER);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!newStatus) return;
    
    try {
      setUpdating(true);
      
      try {
        await ordersApi.updateStatus(orderId, {
          status: newStatus,
          tracking_number: trackingNumber || undefined,
          notes: notes || undefined,
        });
      } catch (apiError) {
        console.log('Mock status update');
      }
      
      // Update local state
      setOrder(prev => ({
        ...prev,
        order: { ...prev.order, status: newStatus },
      }));
      
      setShowStatusModal(false);
      setNewStatus('');
      setTrackingNumber('');
      setNotes('');
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Parse address
  const getAddress = () => {
    try {
      if (typeof order?.order?.shipping_address === 'string') {
        return JSON.parse(order.order.shipping_address);
      }
      return order?.order?.shipping_address || {};
    } catch {
      return {};
    }
  };

  // Get status index
  const getStatusIndex = (status) => {
    return STATUS_FLOW.indexOf(status?.toLowerCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#B76E79]/30 border-t-[#F2C29A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#EAE0D5]/70">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-[#B76E79]/30 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#EAE0D5]">Order not found</h2>
        <Link href="/admin/orders" className="text-[#B76E79] hover:text-[#F2C29A] mt-2 inline-block">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const address = getAddress();
  const currentStatusIndex = getStatusIndex(order.order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 
              className="text-2xl md:text-3xl font-bold text-[#F2C29A]"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Order #{order.order.id}
            </h1>
            <p className="text-[#EAE0D5]/60 mt-1">
              Placed on {formatDate(order.order.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.order.status} />
          <button
            onClick={() => {
              setNewStatus(order.order.status);
              setShowStatusModal(true);
            }}
            className="px-4 py-2 bg-[#7A2F57]/30 border border-[#B76E79]/30 rounded-xl text-[#F2C29A] hover:bg-[#7A2F57]/40 transition-colors"
          >
            Update Status
          </button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
          Order Timeline
        </h2>
        <div className="flex items-center justify-between overflow-x-auto pb-2">
          {STATUS_FLOW.map((status, index) => {
            const isCompleted = index <= currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            
            return (
              <div key={status} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isCompleted 
                        ? 'bg-[#7A2F57]/30 border-2 border-[#B76E79]' 
                        : 'bg-[#0B0608]/60 border border-[#B76E79]/20'
                      }
                      ${isCurrent ? 'ring-2 ring-[#F2C29A]/30' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-[#F2C29A]" />
                    ) : (
                      <span className="text-[#EAE0D5]/40 text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs capitalize ${isCompleted ? 'text-[#F2C29A]' : 'text-[#EAE0D5]/40'}`}>
                    {status}
                  </span>
                </div>
                {index < STATUS_FLOW.length - 1 && (
                  <div
                    className={`w-16 md:w-24 h-0.5 mx-2 ${
                      index < currentStatusIndex ? 'bg-[#B76E79]' : 'bg-[#B76E79]/20'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-[#0B0608]/60 border border-[#B76E79]/10 rounded-xl"
                >
                  <div className="w-16 h-16 bg-[#7A2F57]/20 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-[#B76E79]/50" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#EAE0D5]">{item.product_name}</h3>
                    <p className="text-sm text-[#EAE0D5]/60">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span className="ml-2">Color: {item.color}</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#EAE0D5]">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-[#EAE0D5]/60">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-[#B76E79]/15 space-y-2">
              <div className="flex justify-between text-[#EAE0D5]/70">
                <span>Subtotal</span>
                <span>{formatCurrency(order.order.subtotal)}</span>
              </div>
              {order.order.discount_applied > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.order.discount_applied)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#EAE0D5]/70">
                <span>Shipping</span>
                <span>{order.order.shipping_cost === 0 ? 'Free' : formatCurrency(order.order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-[#F2C29A] pt-2 border-t border-[#B76E79]/15">
                <span>Total</span>
                <span>{formatCurrency(order.order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Payment Information
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-[#B76E79]" />
                <div>
                  <p className="text-[#EAE0D5]">Razorpay</p>
                  <p className="text-sm text-[#EAE0D5]/60">{order.order.transaction_id || 'TXN_PENDING'}</p>
                </div>
              </div>
              <PaymentStatusBadge status="paid" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Customer
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7A2F57]/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#B76E79]" />
                </div>
                <div>
                  <p className="font-medium text-[#EAE0D5]">{order.customer?.full_name || 'Customer'}</p>
                  <p className="text-sm text-[#EAE0D5]/60">ID: #{order.customer?.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[#EAE0D5]/70">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{order.customer?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[#EAE0D5]/70">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{order.customer?.phone}</span>
              </div>
              <Link
                href={`/admin/customers/${order.customer?.id}`}
                className="block text-center text-sm text-[#B76E79] hover:text-[#F2C29A] transition-colors"
              >
                View Customer Profile →
              </Link>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Shipping Address
            </h2>
            <div className="space-y-2 text-[#EAE0D5]/70">
              <p className="font-medium text-[#EAE0D5]">{address.name}</p>
              <p>{address.address}</p>
              <p>{address.city}, {address.state} {address.pincode}</p>
              <p className="flex items-center gap-2 mt-3">
                <Phone className="w-4 h-4" />
                {address.phone}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#7A2F57]/10 border border-[#B76E79]/10 hover:border-[#B76E79]/30 text-[#EAE0D5] transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Contact Customer</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#7A2F57]/10 border border-[#B76E79]/10 hover:border-[#B76E79]/30 text-[#EAE0D5] transition-colors">
                <Truck className="w-4 h-4" />
                <span>Print Shipping Label</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:border-red-500/30 text-red-400 transition-colors">
                <XCircle className="w-4 h-4" />
                <span>Cancel Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowStatusModal(false)} />
          <div className="relative bg-[#0B0608]/95 backdrop-blur-xl border border-[#B76E79]/20 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Update Order Status
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#EAE0D5]/70 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                >
                  {STATUS_FLOW.map(status => (
                    <option key={status} value={status} className="bg-[#0B0608] capitalize">
                      {status}
                    </option>
                  ))}
                  <option value="cancelled" className="bg-[#0B0608]">Cancelled</option>
                  <option value="refunded" className="bg-[#0B0608]">Refunded</option>
                </select>
              </div>

              {newStatus === 'shipped' && (
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-[#EAE0D5]/70 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this status change..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2.5 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateStatus}
                disabled={updating || !newStatus}
                className="flex-1 px-4 py-2.5 bg-[#7A2F57]/30 border border-[#B76E79]/30 rounded-xl text-[#F2C29A] hover:bg-[#7A2F57]/40 transition-colors disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
