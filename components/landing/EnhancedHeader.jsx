'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cartContext';

// Static navigation links - defined outside component to prevent re-renders
const NAV_LINKS = [
  { name: 'New Arrivals', href: '/#new-arrivals' },
  { name: 'Collections', href: '/#collections' },
  { name: 'About', href: '/#about' },
  { name: 'Contact', href: '/#footer' },
];

/**
 * Debounce hook for search input
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * EnhancedHeader - Header with glass effect and logo image
 * 
 * Features:
 * - Logo image from auth pages (optimized with Next.js Image)
 * - Glass morphism effect when scrolled
 * - Smooth transitions
 * - Mobile responsive menu
 * - Cart integration with item count
 * - Performance optimized with throttled scroll handler
 * - Debounced search input
 */
const EnhancedHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { itemCount, toggleCart } = useCart();
  const tickingRef = useRef(false);

  // Throttled scroll handler using requestAnimationFrame
  useEffect(() => {
    const handleScroll = () => {
      if (!tickingRef.current) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          tickingRef.current = false;
        });
        tickingRef.current = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle debounced search query (can be used for API calls)
  useEffect(() => {
    if (debouncedSearchQuery) {
      // Trigger search API call here when backend is integrated
      // For now, this prevents excessive re-renders
    }
  }, [debouncedSearchQuery]);

  // Memoize navLinks reference
  const navLinks = NAV_LINKS;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-500",
          isScrolled 
            ? "py-2" 
            : "py-3"
        )}
      >
        {/* Glass Background - only visible when scrolled */}
        <div 
          className={cn(
            "absolute inset-0 transition-all duration-500",
            isScrolled 
              ? "bg-[#0B0608]/60 backdrop-blur-md border-b border-[#B76E79]/10" 
              : "bg-transparent border-b border-transparent"
          )}
        />
        
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo - Using Next.js Image for optimization */}
            <Link href="/" className="relative z-50 group">
              <Image 
                src="/logo.png" 
                alt="Aarya Clothing"
                width={80}
                height={80}
                priority
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(242,194,154,0.2)] group-hover:drop-shadow-[0_0_25px_rgba(242,194,154,0.4)] transition-all duration-300"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative text-sm font-medium text-[#EAE0D5]/80 hover:text-[#F2C29A] transition-colors duration-300 py-2 group"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#F2C29A] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Action Icons */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/profile/wishlist" className="text-[#EAE0D5] hover:text-[#F2C29A] transition-colors duration-300">
                <Heart className="w-5 h-5" />
              </Link>
              <Link href="/profile" className="text-[#EAE0D5] hover:text-[#F2C29A] transition-colors duration-300">
                <User className="w-5 h-5" />
              </Link>
              <input
                key="search-input"
                suppressHydrationWarning
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-transparent border border-[#3D322C] rounded-lg text-[#EAE0D5] placeholder-[#8B7D77] focus:outline-none focus:border-[#F2C29A] transition-all duration-300"
              />
              <button 
                key="cart-button"
                suppressHydrationWarning
                onClick={toggleCart}
                className="relative text-[#EAE0D5] hover:text-[#F2C29A] transition-colors duration-300 group"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#7A2F57] text-[#EAE0D5] text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden relative z-50 text-[#EAE0D5] hover:text-[#F2C29A]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center transition-all duration-500 md:hidden",
          isMobileMenuOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Glass Background */}
        <div className="absolute inset-0 bg-[#0B0608]/95 backdrop-blur-lg" />
        
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        
        {/* Mobile Logo */}
        <div className="relative z-10 mb-12">
          <Image 
            src="/logo.png" 
            alt="Aarya Clothing"
            width={80}
            height={80}
            className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(242,194,154,0.2)]"
          />
        </div>
        
        <nav className="relative z-10 flex flex-col items-center gap-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-2xl text-[#EAE0D5] hover:text-[#F2C29A] transition-colors duration-300"
              style={{ fontFamily: 'Cinzel, serif', transitionDelay: `${index * 100}ms` }}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex gap-8 mt-8">
            <Link href="/profile/wishlist" className="text-[#EAE0D5] hover:text-[#F2C29A]" onClick={() => setIsMobileMenuOpen(false)}>
              <Heart className="w-6 h-6" />
            </Link>
            <Link href="/profile" className="text-[#EAE0D5] hover:text-[#F2C29A]" onClick={() => setIsMobileMenuOpen(false)}>
              <User className="w-6 h-6" />
            </Link>
            <button 
              onClick={() => {
                toggleCart();
                setIsMobileMenuOpen(false);
              }}
              className="relative text-[#EAE0D5] hover:text-[#F2C29A]"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#7A2F57] text-[#EAE0D5] text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default EnhancedHeader;
