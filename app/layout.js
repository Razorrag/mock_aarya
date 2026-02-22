import './globals.css';
import { Cinzel, Playfair_Display } from 'next/font/google';
import DevBypassBanner from '../components/DevBypassBanner';
import { CartProvider } from '../lib/cartContext';
import CartDrawer from '../components/cart/CartDrawer';
import SilkBackground from '../components/SilkBackground';
import { ToastProvider } from '../components/ui/Toast';
import { CartAnimationProvider } from '../components/cart/CartAnimation';
import ErrorBoundary from '../components/ErrorBoundary';

// Optimize font loading with next/font/google
const cinzel = Cinzel({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cinzel',
  preload: true,
  weight: ['400', '500', '600'],
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  preload: true,
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

export const metadata = {
  title: 'Aarya Clothing - Premium Ethnic Wear',
  description: 'Discover exquisite ethnic wear collections at Aarya Clothing. Premium quality sarees, kurtis, gowns, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${playfair.variable}`}>
      <body className="relative font-sans">
        {/* Single centralized SilkBackground - GPU accelerated WebGL */}
        <SilkBackground />
        
        {/* Gradient Overlay - consistent across all pages */}
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050203]/40 via-transparent to-[#050203]/90 pointer-events-none" />
        
        <ErrorBoundary>
          <CartProvider>
            <CartAnimationProvider>
              <ToastProvider>
                <DevBypassBanner />
                {children}
                <CartDrawer />
              </ToastProvider>
            </CartAnimationProvider>
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
