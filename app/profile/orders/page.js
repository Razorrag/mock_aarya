'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Eye, Truck, Clock, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { ordersApi } from '@/lib/customerApi';

// Mock orders
const MOCK_ORDERS = [
  {
    id: 1,
    order_number: 'AC123456789',
    status: 'delivered',
    total: 5999,
    items_count: 2,
    created_at: '2024-01-15',
    delivered_at: '2024-01-20',
    items: [
      { name: 'Silk Evening Gown', quantity: 1, price: 5999, image: '/products/gown-1.jpg' },
    ],
  },
  {
    id: 2,
    order_number: 'AC123456788',
    status: 'shipped',
    total: 3999,
    items_count: 1,
    created_at: '2024-01-18',
    estimated_delivery: '2024-01-25',
    items: [
      { name: 'Velvet Blazer', quantity: 1, price: 3999, image: '/products/blazer-1.jpg' },
    ],
  },
  {
    id: 3,
    order_number: 'AC123456787',
    status: 'processing',
    total: 8999,
    items_count: 1,
    created_at: '2024-01-20',
    items: [
      { name: 'Embroidered Saree', quantity: 1, price: 8999, image: '/products/saree-1.jpg' },
    ],
  },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: CheckCircle },
  processing: { label: 'Processing', color: 'text-purple-400', bg: 'bg-purple-400/10', icon: Package },
  shipped: { label: 'Shipped', color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: Truck },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      try {
        const data = await ordersApi.list();
        setOrders(data.orders || data || MOCK_ORDERS);
      } catch (apiError) {
        console.log('Using mock orders data');
        setOrders(MOCK_ORDERS);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
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

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#F2C29A]">My Orders</h2>
        
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40 text-sm"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-[#B76E79]/10 rounded-2xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl text-center">
          <Package className="w-16 h-16 text-[#B76E79]/30 mx-auto mb-4" />
          <p className="text-[#EAE0D5]/50">No orders found</p>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            
            return (
              <div
                key={order.id}
                className="p-4 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl hover:border-[#B76E79]/30 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[#F2C29A]">{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${statusConfig.bg} ${statusConfig.color} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#EAE0D5]/70">
                      {order.items_count} item{order.items_count > 1 ? 's' : ''} • {formatDate(order.created_at)}
                    </p>
                  </div>

                  {/* Items Preview */}
                  <div className="flex items-center gap-2">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-14 bg-[#7A2F57]/10 rounded-lg flex items-center justify-center"
                      >
                        <Package className="w-5 h-5 text-[#B76E79]/30" />
                      </div>
                    ))}
                    {order.items_count > 3 && (
                      <div className="w-12 h-14 bg-[#7A2F57]/10 rounded-lg flex items-center justify-center text-xs text-[#EAE0D5]/50">
                        +{order.items_count - 3}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#F2C29A]">{formatCurrency(order.total)}</p>
                  </div>

                  {/* Actions */}
                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="flex items-center gap-1 px-4 py-2 text-[#B76E79] hover:text-[#F2C29A] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Delivery Info */}
                {order.status === 'shipped' && order.estimated_delivery && (
                  <div className="mt-3 pt-3 border-t border-[#B76E79]/10">
                    <p className="text-sm text-[#EAE0D5]/70">
                      <Truck className="w-4 h-4 inline mr-1 text-cyan-400" />
                      Estimated delivery: {formatDate(order.estimated_delivery)}
                    </p>
                  </div>
                )}
                {order.status === 'delivered' && order.delivered_at && (
                  <div className="mt-3 pt-3 border-t border-[#B76E79]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-sm text-[#EAE0D5]/70">
                      <CheckCircle className="w-4 h-4 inline mr-1 text-green-400" />
                      Delivered on: {formatDate(order.delivered_at)}
                    </p>
                    <Link
                      href={`/profile/returns/create?order=${order.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#B76E79] hover:text-[#F2C29A] bg-[#B76E79]/10 rounded-lg hover:bg-[#B76E79]/20 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Return/Exchange
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
