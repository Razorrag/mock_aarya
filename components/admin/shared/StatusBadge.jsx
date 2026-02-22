'use client';

import React from 'react';

/**
 * StatusBadge - Displays status with appropriate styling
 * 
 * @param {string} status - Status value
 * @param {string} variant - Predefined variant or auto-detect
 */
export default function StatusBadge({ status, variant = 'auto', size = 'md' }) {
  // Auto-detect variant based on status value
  const getVariant = () => {
    if (variant !== 'auto') return variant;
    
    const statusLower = status?.toLowerCase() || '';
    
    // Order statuses
    if (['pending', 'processing'].includes(statusLower)) return 'warning';
    if (['confirmed', 'shipped', 'delivered', 'completed', 'active', 'paid'].includes(statusLower)) return 'success';
    if (['cancelled', 'refunded', 'failed', 'inactive'].includes(statusLower)) return 'danger';
    if (['on_hold', 'hold'].includes(statusLower)) return 'info';
    
    // Default
    return 'default';
  };

  const currentVariant = getVariant();

  const variants = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    default: 'bg-[#B76E79]/20 text-[#EAE0D5]/70 border-[#B76E79]/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1
        border rounded-full font-medium
        ${variants[currentVariant]}
        ${sizes[size]}
      `}
    >
      {/* Status indicator dot */}
      <span className={`w-1.5 h-1.5 rounded-full ${
        currentVariant === 'success' ? 'bg-green-400' :
        currentVariant === 'warning' ? 'bg-yellow-400' :
        currentVariant === 'danger' ? 'bg-red-400' :
        currentVariant === 'info' ? 'bg-blue-400' :
        'bg-[#EAE0D5]/50'
      }`} />
      
      {/* Status text */}
      <span className="capitalize">{status?.replace(/_/g, ' ') || 'Unknown'}</span>
    </span>
  );
}

// Order status badge with timeline colors
export function OrderStatusBadge({ status }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400' },
    confirmed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    processing: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', dot: 'bg-purple-400' },
    shipped: { color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', dot: 'bg-indigo-400' },
    delivered: { color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' },
    cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
    refunded: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        border rounded-full font-medium
        px-2.5 py-1 text-xs
        ${config.color}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="capitalize">{status?.replace(/_/g, ' ') || 'Pending'}</span>
    </span>
  );
}

// Payment status badge
export function PaymentStatusBadge({ status }) {
  const statusConfig = {
    pending: { color: 'bg-yellow-500/20 text-yellow-400', icon: '⏳' },
    processing: { color: 'bg-blue-500/20 text-blue-400', icon: '🔄' },
    completed: { color: 'bg-green-500/20 text-green-400', icon: '✓' },
    paid: { color: 'bg-green-500/20 text-green-400', icon: '✓' },
    failed: { color: 'bg-red-500/20 text-red-400', icon: '✗' },
    refunded: { color: 'bg-orange-500/20 text-orange-400', icon: '↩' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full font-medium
        px-2.5 py-1 text-xs
        ${config.color}
      `}
    >
      <span>{config.icon}</span>
      <span className="capitalize">{status?.replace(/_/g, ' ') || 'Pending'}</span>
    </span>
  );
}

// Inventory status badge
export function InventoryStatusBadge({ quantity, threshold = 10 }) {
  if (quantity === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-2.5 py-1 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Out of Stock
      </span>
    );
  }
  
  if (quantity <= threshold) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full px-2.5 py-1 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        Low Stock ({quantity})
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2.5 py-1 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      In Stock ({quantity})
    </span>
  );
}
