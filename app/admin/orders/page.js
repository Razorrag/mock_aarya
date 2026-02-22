'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Package,
  Eye,
  Truck,
  XCircle,
} from 'lucide-react';
import DataTable from '@/components/admin/shared/DataTable';
import { OrderStatusBadge } from '@/components/admin/shared/StatusBadge';
import { ordersApi } from '@/lib/adminApi';

// Mock orders data
const MOCK_ORDERS = [
  { id: 1, user_id: 101, subtotal: 4599, discount_applied: 0, shipping_cost: 99, total_amount: 4698, status: 'pending', created_at: '2026-02-12T10:30:00' },
  { id: 2, user_id: 102, subtotal: 8999, discount_applied: 500, shipping_cost: 0, total_amount: 8499, status: 'processing', created_at: '2026-02-12T09:45:00' },
  { id: 3, user_id: 103, subtotal: 2499, discount_applied: 0, shipping_cost: 99, total_amount: 2598, status: 'shipped', created_at: '2026-02-12T08:20:00' },
  { id: 4, user_id: 104, subtotal: 6499, discount_applied: 0, shipping_cost: 0, total_amount: 6499, status: 'delivered', created_at: '2026-02-11T16:15:00' },
  { id: 5, user_id: 105, subtotal: 3299, discount_applied: 200, shipping_cost: 99, total_amount: 3198, status: 'pending', created_at: '2026-02-11T14:30:00' },
  { id: 6, user_id: 106, subtotal: 12999, discount_applied: 1000, shipping_cost: 0, total_amount: 11999, status: 'confirmed', created_at: '2026-02-11T12:00:00' },
  { id: 7, user_id: 107, subtotal: 5999, discount_applied: 0, shipping_cost: 99, total_amount: 6098, status: 'cancelled', created_at: '2026-02-10T18:45:00' },
  { id: 8, user_id: 108, subtotal: 7899, discount_applied: 300, shipping_cost: 0, total_amount: 7599, status: 'processing', created_at: '2026-02-10T15:20:00' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

// Loading skeleton
function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="animate-pulse h-8 w-32 bg-[#B76E79]/20 rounded mb-2"></div>
          <div className="animate-pulse h-4 w-64 bg-[#B76E79]/10 rounded"></div>
        </div>
      </div>
      <div className="animate-pulse h-20 bg-[#B76E79]/10 rounded-2xl"></div>
      <div className="animate-pulse h-96 bg-[#B76E79]/10 rounded-2xl"></div>
    </div>
  );
}

// Main content component
function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: '',
  });

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try API, use mock if fails
      try {
        const data = await ordersApi.list({
          page,
          limit: 20,
          status: filters.status || undefined,
          search: filters.search || undefined,
        });
        setOrders(data.orders);
        setTotal(data.total);
      } catch (apiError) {
        console.log('Using mock orders data');
        let filtered = [...MOCK_ORDERS];
        
        if (filters.status) {
          filtered = filtered.filter(o => o.status === filters.status);
        }
        
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(o => 
            o.id.toString().includes(search) || 
            o.user_id.toString().includes(search)
          );
        }
        
        setOrders(filtered);
        setTotal(filtered.length);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ status: '', search: '' });
    setPage(1);
  };

  // Table columns
  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-[#F2C29A]">#{value}</span>
      ),
    },
    {
      key: 'user_id',
      label: 'Customer',
      sortable: true,
      render: (value) => (
        <div>
          <span className="text-[#EAE0D5]">User #{value}</span>
          <span className="block text-xs text-[#EAE0D5]/50">customer@email.com</span>
        </div>
      ),
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      render: (value, row) => (
        <div>
          <span className="font-medium text-[#EAE0D5]">{formatCurrency(value)}</span>
          {row.discount_applied > 0 && (
            <span className="block text-xs text-green-400">-{formatCurrency(row.discount_applied)} off</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <OrderStatusBadge status={value} />,
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-[#EAE0D5]/70 text-sm">{formatDate(value)}</span>
      ),
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (row) => router.push(`/admin/orders/${row.id}`),
    },
    {
      label: 'Mark Shipped',
      icon: Truck,
      onClick: (row) => console.log('Ship order:', row.id),
    },
    {
      label: 'Cancel Order',
      icon: XCircle,
      variant: 'danger',
      onClick: (row) => console.log('Cancel order:', row.id),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#F2C29A]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Orders
          </h1>
          <p className="text-[#EAE0D5]/60 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EAE0D5]/40" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="
                w-full pl-10 pr-4 py-2.5
                bg-[#0B0608]/60 border border-[#B76E79]/20
                rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40
                focus:outline-none focus:border-[#B76E79]/40
                transition-colors text-sm
              "
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EAE0D5]/40" />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="
                pl-10 pr-8 py-2.5
                bg-[#0B0608]/60 border border-[#B76E79]/20
                rounded-xl text-[#EAE0D5]
                focus:outline-none focus:border-[#B76E79]/40
                transition-colors text-sm appearance-none cursor-pointer
              "
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="bg-[#0B0608]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(filters.status || filters.search) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-sm text-[#B76E79] hover:text-[#F2C29A] transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {STATUS_OPTIONS.slice(1).map(status => {
          const count = orders.filter(o => o.status === status.value).length;
          return (
            <button
              key={status.value}
              onClick={() => handleFilterChange('status', filters.status === status.value ? '' : status.value)}
              className={`
                p-3 rounded-xl border transition-all text-center
                ${filters.status === status.value
                  ? 'bg-[#7A2F57]/20 border-[#B76E79]/30 text-[#F2C29A]'
                  : 'bg-[#0B0608]/40 border-[#B76E79]/15 text-[#EAE0D5]/70 hover:border-[#B76E79]/30'
                }
              `}
            >
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs capitalize">{status.label}</p>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={orders}
        actions={actions}
        loading={loading}
        pagination={true}
        pageSize={20}
        onRowClick={(row) => router.push(`/admin/orders/${row.id}`)}
        emptyMessage="No orders found"
      />
    </div>
  );
}

// Default export with Suspense wrapper
export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoadingSkeleton />}>
      <OrdersContent />
    </Suspense>
  );
}
