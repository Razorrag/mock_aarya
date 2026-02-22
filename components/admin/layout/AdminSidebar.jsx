'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Warehouse,
  BarChart3,
  MessageCircle,
  Settings,
  Image,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  RotateCcw,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: Package },
  { name: 'Returns', href: '/admin/returns', icon: RotateCcw },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory', href: '/admin/inventory', icon: Warehouse },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Chat Support', href: '/admin/chat', icon: MessageCircle },
  { name: 'Landing Page', href: '/admin/landing', icon: Image },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-40
        bg-[#0B0608]/95 backdrop-blur-xl
        border-r border-[#B76E79]/15
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#B76E79]/15">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <span 
              className="text-xl font-bold text-[#F2C29A]"
              style={{ fontFamily: 'Cinzel, serif' }}
            >
              Aarya
            </span>
            <span className="text-sm text-[#EAE0D5]/60">Admin</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[#B76E79]/10 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-[#EAE0D5]/70" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-[#EAE0D5]/70" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${active 
                      ? 'bg-[#7A2F57]/30 text-[#F2C29A] border border-[#B76E79]/30' 
                      : 'text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 hover:text-[#EAE0D5]'
                    }
                  `}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#F2C29A]' : ''}`} />
                  {!collapsed && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-[#B76E79]/15 p-4">
        {/* Notifications */}
        <Link
          href="/admin/notifications"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 hover:text-[#EAE0D5]
            transition-all duration-200 mb-2
          `}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#B76E79] rounded-full" />
          </div>
          {!collapsed && <span className="font-medium text-sm">Notifications</span>}
        </Link>

        {/* Logout */}
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-[#EAE0D5]/70 hover:bg-red-500/10 hover:text-red-400
            transition-all duration-200
          `}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
