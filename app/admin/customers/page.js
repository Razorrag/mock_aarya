'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  RefreshCw,
  User,
  Mail,
  Phone,
  Eye,
  ShoppingBag,
  IndianRupee,
} from 'lucide-react';
import DataTable from '@/components/admin/shared/DataTable';
import StatCard from '@/components/admin/shared/StatCard';
import { usersApi } from '@/lib/adminApi';

// Mock customers data
const MOCK_CUSTOMERS = [
  { id: 101, email: 'priya.sharma@email.com', username: 'priya_s', full_name: 'Priya Sharma', role: 'customer', is_active: true, created_at: '2026-01-15T10:00:00', order_count: 12, total_spent: 45670 },
  { id: 102, email: 'ananya.patel@email.com', username: 'ananya_p', full_name: 'Ananya Patel', role: 'customer', is_active: true, created_at: '2026-01-14T09:30:00', order_count: 8, total_spent: 32450 },
  { id: 103, email: 'meera.gupta@email.com', username: 'meera_g', full_name: 'Meera Gupta', role: 'customer', is_active: true, created_at: '2026-01-13T14:20:00', order_count: 5, total_spent: 18999 },
  { id: 104, email: 'kavita.singh@email.com', username: 'kavita_s', full_name: 'Kavita Singh', role: 'customer', is_active: false, created_at: '2026-01-12T11:45:00', order_count: 3, total_spent: 8999 },
  { id: 105, email: 'deepa.nair@email.com', username: 'deepa_n', full_name: 'Deepa Nair', role: 'customer', is_active: true, created_at: '2026-01-11T16:00:00', order_count: 15, total_spent: 67890 },
  { id: 106, email: 'rita.menon@email.com', username: 'rita_m', full_name: 'Rita Menon', role: 'customer', is_active: true, created_at: '2026-01-10T08:15:00', order_count: 2, total_spent: 5999 },
];

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      try {
        const data = await usersApi.list({ role: 'customer' });
        setCustomers(data.users || data);
      } catch (apiError) {
        console.log('Using mock customers data');
        setCustomers(MOCK_CUSTOMERS);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
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
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    if (filters.status === 'active' && !customer.is_active) return false;
    if (filters.status === 'inactive' && customer.is_active) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return customer.full_name?.toLowerCase().includes(search) ||
             customer.email?.toLowerCase().includes(search) ||
             customer.username?.toLowerCase().includes(search);
    }
    return true;
  });

  // Table columns
  const columns = [
    {
      key: 'full_name',
      label: 'Customer',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7A2F57]/30 flex items-center justify-center">
            <User className="w-5 h-5 text-[#B76E79]" />
          </div>
          <div>
            <p className="font-medium text-[#EAE0D5]">{value}</p>
            <p className="text-xs text-[#EAE0D5]/50">@{row.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (value) => (
        <div>
          <p className="text-[#EAE0D5]/70 flex items-center gap-1">
            <Mail className="w-3 h-3" /> {value}
          </p>
        </div>
      ),
    },
    {
      key: 'order_count',
      label: 'Orders',
      sortable: true,
      render: (value) => (
        <span className="flex items-center gap-1 text-[#EAE0D5]">
          <ShoppingBag className="w-4 h-4 text-[#B76E79]/50" />
          {value}
        </span>
      ),
    },
    {
      key: 'total_spent',
      label: 'Total Spent',
      sortable: true,
      render: (value) => (
        <span className="flex items-center gap-1 font-medium text-[#F2C29A]">
          <IndianRupee className="w-3 h-3" />
          {value.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (value) => (
        <span className="text-[#EAE0D5]/60 text-sm">{formatDate(value)}</span>
      ),
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'View Profile',
      icon: Eye,
      onClick: (row) => router.push(`/admin/customers/${row.id}`),
    },
  ];

  // Stats
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.is_active).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
    avgOrderValue: customers.length > 0 
      ? customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / customers.reduce((sum, c) => sum + (c.order_count || 0), 0)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#F2C29A]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Customers
          </h1>
          <p className="text-[#EAE0D5]/60 mt-1">
            Manage your customer database
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          className="p-2 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={stats.total}
          icon={User}
        />
        <StatCard
          title="Active Customers"
          value={stats.active}
          icon={User}
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          format="currency"
          prefix="₹"
          icon={IndianRupee}
        />
        <StatCard
          title="Avg Order Value"
          value={Math.round(stats.avgOrderValue)}
          format="currency"
          prefix="₹"
          icon={ShoppingBag}
        />
      </div>

      {/* Filters */}
      <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EAE0D5]/40" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="
              px-4 py-2.5
              bg-[#0B0608]/60 border border-[#B76E79]/20
              rounded-xl text-[#EAE0D5]
              focus:outline-none focus:border-[#B76E79]/40
              transition-colors text-sm appearance-none cursor-pointer
            "
          >
            <option value="" className="bg-[#0B0608]">All Status</option>
            <option value="active" className="bg-[#0B0608]">Active</option>
            <option value="inactive" className="bg-[#0B0608]">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <DataTable
        columns={columns}
        data={filteredCustomers}
        actions={actions}
        loading={loading}
        pagination={true}
        pageSize={10}
        onRowClick={(row) => router.push(`/admin/customers/${row.id}`)}
        emptyMessage="No customers found"
      />
    </div>
  );
}
