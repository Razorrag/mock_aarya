'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from 'lucide-react';
import StatCard from '@/components/admin/shared/StatCard';
import DataTable from '@/components/admin/shared/DataTable';
import { OrderStatusBadge, InventoryStatusBadge } from '@/components/admin/shared/StatusBadge';
import { dashboardApi, ordersApi, inventoryApi } from '@/lib/adminApi';

// Mock data for development
const MOCK_DASHBOARD = {
  total_revenue: 1547890,
  total_orders: 1247,
  total_customers: 892,
  total_products: 156,
  pending_orders: 23,
  today_revenue: 45670,
  today_orders: 34,
  inventory_alerts: {
    low_stock: 12,
    out_of_stock: 3,
  },
  recent_orders: [
    { id: 1, user_id: 101, total_amount: 4599, status: 'pending', created_at: '2026-02-12T10:30:00' },
    { id: 2, user_id: 102, total_amount: 8999, status: 'processing', created_at: '2026-02-12T09:45:00' },
    { id: 3, user_id: 103, total_amount: 2499, status: 'shipped', created_at: '2026-02-12T08:20:00' },
    { id: 4, user_id: 104, total_amount: 6499, status: 'delivered', created_at: '2026-02-11T16:15:00' },
    { id: 5, user_id: 105, total_amount: 3299, status: 'pending', created_at: '2026-02-11T14:30:00' },
  ],
};

const MOCK_LOW_STOCK = [
  { id: 1, product_id: 15, product_name: 'Silk Evening Gown', sku: 'SEG-001', quantity: 3, low_stock_threshold: 10 },
  { id: 2, product_id: 23, product_name: 'Velvet Blazer', sku: 'VB-002', quantity: 5, low_stock_threshold: 10 },
  { id: 3, product_id: 45, product_name: 'Cashmere Sweater', sku: 'CS-003', quantity: 2, low_stock_threshold: 15 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API, use mock if fails
      try {
        const [dashboard, lowStock] = await Promise.all([
          dashboardApi.getOverview(),
          inventoryApi.getLowStock(),
        ]);
        setDashboardData(dashboard);
        setLowStockItems(lowStock.items || []);
      } catch (apiError) {
        console.log('Using mock data:', apiError.message);
        setDashboardData(MOCK_DASHBOARD);
        setLowStockItems(MOCK_LOW_STOCK);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Recent orders columns
  const orderColumns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (value) => <span className="font-medium text-[#F2C29A]">#{value}</span>,
    },
    {
      key: 'user_id',
      label: 'Customer',
      render: (value) => <span className="text-[#EAE0D5]/70">User #{value}</span>,
    },
    {
      key: 'total_amount',
      label: 'Amount',
      render: (value) => <span className="font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <OrderStatusBadge status={value} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => (
        <span className="text-[#EAE0D5]/60 text-sm">{formatDate(value)}</span>
      ),
    },
  ];

  // Low stock columns
  const lowStockColumns = [
    {
      key: 'product_name',
      label: 'Product',
      render: (value) => <span className="font-medium text-[#EAE0D5]">{value}</span>,
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (value) => <span className="text-[#EAE0D5]/60 font-mono text-sm">{value}</span>,
    },
    {
      key: 'quantity',
      label: 'Stock',
      render: (value, row) => <InventoryStatusBadge quantity={value} threshold={row.low_stock_threshold} />,
    },
  ];

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
        <p className="text-red-400">Error loading dashboard: {error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#F2C29A]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Dashboard
          </h1>
          <p className="text-[#EAE0D5]/60 mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#EAE0D5]/50">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={dashboardData?.total_revenue || 0}
          format="currency"
          prefix="₹"
          change={12.5}
          icon={IndianRupee}
        />
        <StatCard
          title="Total Orders"
          value={dashboardData?.total_orders || 0}
          change={8.2}
          icon={ShoppingBag}
        />
        <StatCard
          title="Total Customers"
          value={dashboardData?.total_customers || 0}
          change={15.3}
          icon={Users}
        />
        <StatCard
          title="Total Products"
          value={dashboardData?.total_products || 0}
          icon={Package}
        />
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Today's Revenue"
          value={dashboardData?.today_revenue || 0}
          format="currency"
          prefix="₹"
          icon={TrendingUp}
        />
        <StatCard
          title="Today's Orders"
          value={dashboardData?.today_orders || 0}
          icon={ShoppingBag}
        />
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Orders Alert */}
        <Link
          href="/admin/orders?status=pending"
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 hover:bg-yellow-500/15 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-yellow-400 font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-[#EAE0D5] mt-1">
                  {dashboardData?.pending_orders || 0}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-yellow-400/50 group-hover:text-yellow-400 transition-colors" />
          </div>
        </Link>

        {/* Low Stock Alert */}
        <Link
          href="/admin/inventory"
          className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 hover:bg-orange-500/15 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-orange-400 font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold text-[#EAE0D5] mt-1">
                  {dashboardData?.inventory_alerts?.low_stock || 0}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-orange-400/50 group-hover:text-orange-400 transition-colors" />
          </div>
        </Link>

        {/* Out of Stock Alert */}
        <Link
          href="/admin/inventory"
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 hover:bg-red-500/15 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-[#EAE0D5] mt-1">
                  {dashboardData?.inventory_alerts?.out_of_stock || 0}
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-red-400/50 group-hover:text-red-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 
              className="text-xl font-semibold text-[#F2C29A]"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-[#B76E79] hover:text-[#F2C29A] transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <DataTable
            columns={orderColumns}
            data={dashboardData?.recent_orders || []}
            loading={loading}
            pagination={false}
            onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
          />
        </div>

        {/* Low Stock Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 
              className="text-xl font-semibold text-[#F2C29A]"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Low Stock Alert
            </h2>
            <Link
              href="/admin/inventory"
              className="text-sm text-[#B76E79] hover:text-[#F2C29A] transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <DataTable
            columns={lowStockColumns}
            data={lowStockItems}
            loading={loading}
            pagination={false}
            emptyMessage="All items are well stocked!"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
        <h2 
          className="text-xl font-semibold text-[#F2C29A] mb-4"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/orders?status=pending"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#7A2F57]/10 border border-[#B76E79]/10 hover:border-[#B76E79]/30 transition-colors"
          >
            <CheckCircle className="w-6 h-6 text-[#B76E79]" />
            <span className="text-sm text-[#EAE0D5]">Process Orders</span>
          </Link>
          <Link
            href="/admin/products/create"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#7A2F57]/10 border border-[#B76E79]/10 hover:border-[#B76E79]/30 transition-colors"
          >
            <Package className="w-6 h-6 text-[#B76E79]" />
            <span className="text-sm text-[#EAE0D5]">Add Product</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#7A2F57]/10 border border-[#B76E79]/10 hover:border-[#B76E79]/30 transition-colors"
          >
            <Truck className="w-6 h-6 text-[#B76E79]" />
            <span className="text-sm text-[#EAE0D5]">Update Stock</span>
          </Link>
          <Link
            href="/admin/chat"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#7A2F57]/10 border border-[#B76E79]/10 hover:border-[#B76E79]/30 transition-colors"
          >
            <Users className="w-6 h-6 text-[#B76E79]" />
            <span className="text-sm text-[#EAE0D5]">Customer Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
