'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  RefreshCw,
  Package,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  History,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import DataTable from '@/components/admin/shared/DataTable';
import StatCard from '@/components/admin/shared/StatCard';
import { InventoryStatusBadge } from '@/components/admin/shared/StatusBadge';
import { inventoryApi } from '@/lib/adminApi';

// Mock inventory data
const MOCK_INVENTORY = [
  { id: 1, product_id: 15, product_name: 'Silk Evening Gown', sku: 'SEG-001-M-BUR', size: 'M', color: 'Burgundy', quantity: 15, low_stock_threshold: 10, cost_price: 2500 },
  { id: 2, product_id: 23, product_name: 'Velvet Blazer', sku: 'VB-002-L-NVY', size: 'L', color: 'Navy', quantity: 5, low_stock_threshold: 10, cost_price: 1800 },
  { id: 3, product_id: 45, product_name: 'Cashmere Sweater', sku: 'CS-003-S-CRM', size: 'S', color: 'Cream', quantity: 3, low_stock_threshold: 15, cost_price: 1200 },
  { id: 4, product_id: 67, product_name: 'Pleated Midi Skirt', sku: 'PMS-004-M-BLK', size: 'M', color: 'Black', quantity: 0, low_stock_threshold: 10, cost_price: 800 },
  { id: 5, product_id: 89, product_name: 'Satin Blouse', sku: 'SB-005-L-IVR', size: 'L', color: 'Ivory', quantity: 25, low_stock_threshold: 10, cost_price: 600 },
  { id: 6, product_id: 12, product_name: 'Embroidered Saree', sku: 'ES-006-GRN', size: 'Free', color: 'Green', quantity: 12, low_stock_threshold: 5, cost_price: 4500 },
];

const MOCK_MOVEMENTS = [
  { id: 1, inventory_id: 1, product_name: 'Silk Evening Gown', adjustment: 10, reason: 'restock', notes: 'New stock arrival', created_at: '2026-02-12T10:00:00' },
  { id: 2, inventory_id: 2, product_name: 'Velvet Blazer', adjustment: -2, reason: 'sale', notes: 'Order #1234', created_at: '2026-02-11T15:30:00' },
  { id: 3, inventory_id: 3, product_name: 'Cashmere Sweater', adjustment: -3, reason: 'sale', notes: 'Order #1235', created_at: '2026-02-10T09:15:00' },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustment, setAdjustment] = useState({ quantity: 0, reason: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      try {
        const [inventoryData, movementsData] = await Promise.all([
          inventoryApi.getLowStock(),
          inventoryApi.getMovements({ limit: 20 }),
        ]);
        setInventory(inventoryData.items || []);
        setMovements(movementsData.movements || []);
      } catch (apiError) {
        console.log('Using mock inventory data');
        setInventory(MOCK_INVENTORY);
        setMovements(MOCK_MOVEMENTS);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    if (filters.status === 'low_stock' && (item.quantity > item.low_stock_threshold || item.quantity === 0)) return false;
    if (filters.status === 'out_of_stock' && item.quantity > 0) return false;
    if (filters.status === 'in_stock' && (item.quantity === 0 || item.quantity <= item.low_stock_threshold)) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return item.product_name?.toLowerCase().includes(search) ||
             item.sku?.toLowerCase().includes(search);
    }
    return true;
  });

  // Stats
  const stats = {
    total: inventory.length,
    inStock: inventory.filter(i => i.quantity > i.low_stock_threshold).length,
    lowStock: inventory.filter(i => i.quantity > 0 && i.quantity <= i.low_stock_threshold).length,
    outOfStock: inventory.filter(i => i.quantity === 0).length,
  };

  // Handle stock adjustment
  const handleAdjustStock = async () => {
    if (!selectedItem || !adjustment.reason) return;
    
    try {
      await inventoryApi.adjustStock({
        inventory_id: selectedItem.id,
        adjustment: adjustment.quantity,
        reason: adjustment.reason,
        notes: adjustment.notes,
      });
      
      // Update local state
      setInventory(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { ...item, quantity: Math.max(0, item.quantity + adjustment.quantity) }
          : item
      ));
      
      setShowAdjustModal(false);
      setSelectedItem(null);
      setAdjustment({ quantity: 0, reason: '', notes: '' });
    } catch (err) {
      console.error('Error adjusting stock:', err);
    }
  };

  // Inventory columns
  const inventoryColumns = [
    {
      key: 'product_name',
      label: 'Product',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-[#EAE0D5]">{value}</p>
          <p className="text-xs text-[#EAE0D5]/50 font-mono">{row.sku}</p>
        </div>
      ),
    },
    {
      key: 'size',
      label: 'Variant',
      render: (value, row) => (
        <span className="text-[#EAE0D5]/70">
          {row.size} / {row.color}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: 'Stock',
      sortable: true,
      render: (value, row) => <InventoryStatusBadge quantity={value} threshold={row.low_stock_threshold} />,
    },
    {
      key: 'cost_price',
      label: 'Cost Price',
      render: (value) => (
        <span className="text-[#EAE0D5]/70">{formatCurrency(value)}</span>
      ),
    },
  ];

  // Inventory actions
  const inventoryActions = [
    {
      label: 'Add Stock',
      icon: Plus,
      onClick: (row) => {
        setSelectedItem(row);
        setAdjustment({ quantity: 0, reason: 'restock', notes: '' });
        setShowAdjustModal(true);
      },
    },
    {
      label: 'Adjust Stock',
      icon: Minus,
      onClick: (row) => {
        setSelectedItem(row);
        setAdjustment({ quantity: 0, reason: 'adjustment', notes: '' });
        setShowAdjustModal(true);
      },
    },
  ];

  // Movement columns
  const movementColumns = [
    {
      key: 'product_name',
      label: 'Product',
      render: (value) => <span className="text-[#EAE0D5]">{value}</span>,
    },
    {
      key: 'adjustment',
      label: 'Change',
      render: (value) => (
        <span className={`flex items-center gap-1 font-medium ${value > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {value > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {value > 0 ? '+' : ''}{value}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value) => (
        <span className="px-2 py-1 rounded-lg bg-[#7A2F57]/20 text-[#EAE0D5]/70 text-xs capitalize">
          {value?.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (value) => <span className="text-[#EAE0D5]/60 text-sm">{value || '-'}</span>,
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value) => <span className="text-[#EAE0D5]/50 text-sm">{formatDate(value)}</span>,
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
            Inventory
          </h1>
          <p className="text-[#EAE0D5]/60 mt-1">
            Manage stock levels and track movements
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value={stats.total}
          icon={Package}
        />
        <StatCard
          title="In Stock"
          value={stats.inStock}
          icon={Package}
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStock}
          icon={XCircle}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#B76E79]/15 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'inventory'
              ? 'bg-[#7A2F57]/30 text-[#F2C29A]'
              : 'text-[#EAE0D5]/70 hover:bg-[#B76E79]/10'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Inventory
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'movements'
              ? 'bg-[#7A2F57]/30 text-[#F2C29A]'
              : 'text-[#EAE0D5]/70 hover:bg-[#B76E79]/10'
          }`}
        >
          <History className="w-4 h-4 inline mr-2" />
          Movements
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EAE0D5]/40" />
            <input
              type="text"
              placeholder="Search products or SKU..."
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
            <option value="in_stock" className="bg-[#0B0608]">In Stock</option>
            <option value="low_stock" className="bg-[#0B0608]">Low Stock</option>
            <option value="out_of_stock" className="bg-[#0B0608]">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'inventory' ? (
        <DataTable
          columns={inventoryColumns}
          data={filteredInventory}
          actions={inventoryActions}
          loading={loading}
          pagination={true}
          pageSize={15}
          emptyMessage="No inventory items found"
        />
      ) : (
        <DataTable
          columns={movementColumns}
          data={movements}
          loading={loading}
          pagination={true}
          pageSize={15}
          emptyMessage="No stock movements recorded"
        />
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onKeyDown={(e) => e.key === 'Escape' && setShowAdjustModal(false)}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAdjustModal(false)} />
          <div className="relative bg-[#0B0608]/95 backdrop-blur-xl border border-[#B76E79]/20 rounded-2xl p-6 w-full max-w-md">
            <h3 id="modal-title" className="text-xl font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Adjust Stock
            </h3>
            
            <div className="space-y-4">
              <div className="p-3 bg-[#7A2F57]/10 border border-[#B76E79]/10 rounded-xl">
                <p className="font-medium text-[#EAE0D5]">{selectedItem.product_name}</p>
                <p className="text-sm text-[#EAE0D5]/50">{selectedItem.sku}</p>
                <p className="text-sm text-[#EAE0D5]/70 mt-1">
                  Current Stock: <span className="font-medium text-[#F2C29A]">{selectedItem.quantity}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm text-[#EAE0D5]/70 mb-2">Adjustment Quantity</label>
                <input
                  type="number"
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter quantity (positive to add, negative to subtract)"
                  className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
                />
                <p className="text-xs text-[#EAE0D5]/50 mt-1">
                  New stock will be: {Math.max(0, selectedItem.quantity + adjustment.quantity)}
                </p>
              </div>

              <div>
                <label className="block text-sm text-[#EAE0D5]/70 mb-2">Reason</label>
                <select
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40 appearance-none cursor-pointer"
                >
                  <option value="restock" className="bg-[#0B0608]">Restock</option>
                  <option value="adjustment" className="bg-[#0B0608]">Inventory Adjustment</option>
                  <option value="damage" className="bg-[#0B0608]">Damage/Loss</option>
                  <option value="return" className="bg-[#0B0608]">Customer Return</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#EAE0D5]/70 mb-2">Notes (Optional)</label>
                <textarea
                  value={adjustment.notes}
                  onChange={(e) => setAdjustment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 px-4 py-2.5 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="flex-1 px-4 py-2.5 bg-[#7A2F57]/30 border border-[#B76E79]/30 rounded-xl text-[#F2C29A] hover:bg-[#7A2F57]/40 transition-colors"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
