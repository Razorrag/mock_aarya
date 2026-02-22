'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Package,
  Eye,
  Edit,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import DataTable from '@/components/admin/shared/DataTable';
import { InventoryStatusBadge } from '@/components/admin/shared/StatusBadge';
import { productsApi, categoriesApi } from '@/lib/adminApi';

// Mock products data
const MOCK_PRODUCTS = [
  { id: 1, name: 'Silk Evening Gown', slug: 'silk-evening-gown', price: 5999, mrp: 7999, category_id: 1, category_name: 'Gowns', total_stock: 15, is_active: true, created_at: '2026-01-15T10:00:00' },
  { id: 2, name: 'Velvet Blazer', slug: 'velvet-blazer', price: 3999, mrp: 4999, category_id: 2, category_name: 'Pant Kurti Set', total_stock: 8, is_active: true, created_at: '2026-01-14T09:30:00' },
  { id: 3, name: 'Cashmere Sweater', slug: 'cashmere-sweater', price: 2999, mrp: 3999, category_id: 3, category_name: 'Kurtis', total_stock: 3, is_active: true, created_at: '2026-01-13T14:20:00' },
  { id: 4, name: 'Pleated Midi Skirt', slug: 'pleated-midi-skirt', price: 1999, mrp: 2499, category_id: 4, category_name: 'SKD', total_stock: 0, is_active: false, created_at: '2026-01-12T11:45:00' },
  { id: 5, name: 'Satin Blouse', slug: 'satin-blouse', price: 1499, mrp: 1999, category_id: 3, category_name: 'Kurtis', total_stock: 25, is_active: true, created_at: '2026-01-11T16:00:00' },
  { id: 6, name: 'Embroidered Saree', slug: 'embroidered-saree', price: 8999, mrp: 11999, category_id: 5, category_name: 'Sarees', total_stock: 12, is_active: true, created_at: '2026-01-10T08:15:00' },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Gowns' },
  { id: 2, name: 'Pant Kurti Set' },
  { id: 3, name: 'Kurtis' },
  { id: 4, name: 'SKD' },
  { id: 5, name: 'Sarees' },
  { id: 6, name: 'Cord Sets' },
  { id: 7, name: 'Dupatta' },
];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsApi.list({ limit: 100 }),
          categoriesApi.list(),
        ]);
        setProducts(productsData.products || productsData);
        setCategories(categoriesData.categories || categoriesData);
      } catch (apiError) {
        console.log('Using mock data');
        setProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
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

  // Filter products
  const filteredProducts = products.filter(product => {
    if (filters.category && product.category_id !== parseInt(filters.category)) return false;
    if (filters.status === 'active' && !product.is_active) return false;
    if (filters.status === 'inactive' && product.is_active) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return product.name.toLowerCase().includes(search) || 
             product.slug.toLowerCase().includes(search);
    }
    return true;
  });

  // Table columns
  const columns = [
    {
      key: 'image',
      label: '',
      sortable: false,
      width: '60px',
      render: (_, row) => (
        <div className="w-10 h-10 rounded-lg bg-[#7A2F57]/20 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-[#B76E79]/50" />
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-[#EAE0D5]">{value}</p>
          <p className="text-xs text-[#EAE0D5]/50">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'category_name',
      label: 'Category',
      render: (value) => (
        <span className="text-[#EAE0D5]/70">{value}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-[#EAE0D5]">{formatCurrency(value)}</p>
          {row.mrp > value && (
            <p className="text-xs text-[#EAE0D5]/50 line-through">{formatCurrency(row.mrp)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'total_stock',
      label: 'Stock',
      sortable: true,
      render: (value) => <InventoryStatusBadge quantity={value} />,
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
  ];

  // Table actions
  const actions = [
    {
      label: 'View',
      icon: Eye,
      onClick: (row) => router.push(`/admin/products/${row.id}`),
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => router.push(`/admin/products/${row.id}?edit=true`),
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      onClick: (row) => {
        if (confirm(`Delete "${row.name}"?`)) {
          console.log('Delete product:', row.id);
        }
      },
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
            Products
          </h1>
          <p className="text-[#EAE0D5]/60 mt-1">
            Manage your product catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#7A2F57]/30 border border-[#B76E79]/30 rounded-xl text-[#F2C29A] hover:bg-[#7A2F57]/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
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
              placeholder="Search products..."
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

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="
              px-4 py-2.5
              bg-[#0B0608]/60 border border-[#B76E79]/20
              rounded-xl text-[#EAE0D5]
              focus:outline-none focus:border-[#B76E79]/40
              transition-colors text-sm appearance-none cursor-pointer
            "
          >
            <option value="" className="bg-[#0B0608]">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id} className="bg-[#0B0608]">{cat.name}</option>
            ))}
          </select>

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

          {/* Refresh */}
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-4">
          <p className="text-[#EAE0D5]/60 text-sm">Total Products</p>
          <p className="text-2xl font-bold text-[#F2C29A] mt-1">{products.length}</p>
        </div>
        <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-4">
          <p className="text-[#EAE0D5]/60 text-sm">Active</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {products.filter(p => p.is_active).length}
          </p>
        </div>
        <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-4">
          <p className="text-[#EAE0D5]/60 text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {products.filter(p => p.total_stock > 0 && p.total_stock <= 10).length}
          </p>
        </div>
        <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-4">
          <p className="text-[#EAE0D5]/60 text-sm">Out of Stock</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {products.filter(p => p.total_stock === 0).length}
          </p>
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        actions={actions}
        loading={loading}
        pagination={true}
        pageSize={10}
        onRowClick={(row) => router.push(`/admin/products/${row.id}`)}
        emptyMessage="No products found"
      />
    </div>
  );
}
