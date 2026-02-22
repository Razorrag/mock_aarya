'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

// Mock user for development - always use this
const MOCK_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@aaryaclothing.com',
  full_name: 'Admin User',
  role: 'admin',
};

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(MOCK_USER); // Always use mock user
  const [loading, setLoading] = useState(false); // No loading needed - bypass auth
  const isMountedRef = React.useRef(true);

  // Auth bypass - always allow access
  // No authentication check needed

  // Minimal loading state for initial render
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050203] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#B76E79]/30 border-t-[#F2C29A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#EAE0D5]/70">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050203]">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(122, 47, 87, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(183, 110, 121, 0.08) 0%, transparent 50%)
          `
        }}
      />

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50
          transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <AdminSidebar
          collapsed={false}
          onToggle={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div
        className={`
          transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
        `}
      >
        {/* Header */}
        <AdminHeader
          onMenuClick={() => setMobileMenuOpen(true)}
          user={user}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
