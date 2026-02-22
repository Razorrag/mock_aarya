'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import EnhancedHeader from '@/components/landing/EnhancedHeader';
import HeroSection from '@/components/landing/HeroSection';
import IntroVideo from '@/components/landing/IntroVideo';

// Lazy load below-fold sections for faster initial load
const NewArrivals = dynamic(() => import('@/components/landing/NewArrivals'), {
  loading: () => <div className="min-h-[400px]" />,
  ssr: true,
});

const Collections = dynamic(() => import('@/components/landing/Collections'), {
  loading: () => <div className="min-h-[400px]" />,
  ssr: true,
});

const AboutSection = dynamic(() => import('@/components/landing/AboutSection'), {
  loading: () => <div className="min-h-[600px]" />,
  ssr: true,
});

const Footer = dynamic(() => import('@/components/landing/Footer'), {
  loading: () => <div className="min-h-[300px]" />,
  ssr: false, // Footer doesn't need SSR for SEO
});

// Mock Data - defined outside component to prevent re-renders
const landingData = {
  hero: {
    tagline: "Designed with Elegance, Worn with Confidence",
    // Hero slideshow images from public/hero folder
    slides: [
      { image: "/hero/hero1.png" },
      { image: "/hero/hero2.png" },
      { image: "/hero/hero3.png" }
    ],
    buttons: [
      { text: "Shop New Arrivals", link: "/new-arrivals", variant: "heroLuxury" },
      { text: "Explore Collections", link: "/collections", variant: "heroLuxuryOutline" }
    ]
  },
  newArrivals: {
    title: "New Arrivals",
    subtitle: "Discover our latest collection of timeless pieces, crafted for the modern individual who values elegance and comfort.",
    products: [
      {
        id: 1,
        name: "Silk Evening Gown",
        price: 299.00,
        category: "Dresses",
        image: "/products/product1.jpeg",
        isNew: true
      },
      {
        id: 2,
        name: "Velvet Blazer",
        price: 189.00,
        category: "Outerwear",
        image: "/products/product2.jpeg",
        isNew: true
      },
      {
        id: 3,
        name: "Pleated Midi Skirt",
        price: 129.00,
        category: "Skirts",
        image: "/products/product3.jpeg",
        isNew: false
      },
      {
        id: 4,
        name: "Cashmere Sweater",
        price: 159.00,
        category: "Knitwear",
        image: "/products/product4.jpeg",
        isNew: true
      },
      {
        id: 5,
        name: "Satin Blouse",
        price: 89.00,
        category: "Tops",
        image: "/products/product5.jpeg",
        isNew: false
      }
    ]
  },
  collections: {
    title: "Curated Collections",
    categories: [
      {
        id: 1,
        name: "SKD (Pant Kurti Dupatta Set)",
        image: "/collections/collection1.jpeg",
        link: "/collections/skd",
        count: 25
      },
      {
        id: 2,
        name: "Pant Kurti Set",
        image: "/collections/collection2.jpeg",
        link: "/collections/pant-kurti",
        count: 18
      },
      {
        id: 3,
        name: "Cord Sets",
        image: "/collections/collection3.jpeg",
        link: "/collections/cord-sets",
        count: 12
      },
      {
        id: 4,
        name: "Gowns",
        image: "/collections/collection4.jpeg",
        link: "/collections/gowns",
        count: 15
      },
      {
        id: 5,
        name: "Kurtis",
        image: "/collections/collection5.jpeg",
        link: "/collections/kurtis",
        count: 30
      },
      {
        id: 6,
        name: "Sarees",
        image: "/collections/collection6.jpeg",
        link: "/collections/sarees",
        count: 20
      },
      {
        id: 7,
        name: "Dupatta",
        image: "/collections/collection7.jpeg",
        link: "/collections/dupatta",
        count: 22
      }
    ]
  },
  about: {
    title: "The Art of Elegance",
    story: "Aarya Clothing is a Jaipur-based fashion brand founded in 2020, created with a simple vision — to offer stylish, high-quality clothing at reasonable prices, just a click away.\n\nWhat began with a few live sessions on Facebook soon grew into a trusted independent brand, powered by customer love and support. Rooted in Jaipur's rich textile heritage and inspired by modern fashion trends, our collections blend style, comfort, and affordability.\n\nAt Aarya Clothing, we make it easy for every woman to discover fashion she truly loves — updated, accessible, and confidently chosen.",
    stats: [
      { label: "Years of Heritage", value: "5+" },
      { label: "Collections", value: "500+" },
      { label: "Happy Clients", value: "10k+" }
    ],
    images: [
      "/about/kurti1.jpg",
      "/about/kurti2.jpg"
    ]
  }
};

export default function Home() {
  const [showLanding, setShowLanding] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check if user has already seen the intro video in this session
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntroVideo');
    if (hasSeenIntro) {
      setShowLanding(true);
    }
  }, []);

  const handleVideoEnd = () => {
    setShowLanding(true);
  };

  // Don't render anything on server to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Intro Video Overlay */}
      {!showLanding && (
        <IntroVideo onVideoEnd={handleVideoEnd} />
      )}

      {/* Main Landing Page */}
      <main className={`min-h-screen text-[#EAE0D5] overflow-x-hidden selection:bg-[#F2C29A] selection:text-[#050203] transition-opacity duration-700 ${showLanding ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background is now handled by root layout - no duplicate SilkBackground here */}
        
        {/* Scrollable Content Layer */}
        <div className="relative z-10">
          <EnhancedHeader />
          
          <HeroSection 
            tagline={landingData.hero.tagline}
            slides={landingData.hero.slides}
            buttons={landingData.hero.buttons}
          />
          
          <NewArrivals 
            id="new-arrivals"
            title={landingData.newArrivals.title}
            subtitle={landingData.newArrivals.subtitle}
            products={landingData.newArrivals.products}
          />
          
          <Collections 
            id="collections"
            title={landingData.collections.title}
            categories={landingData.collections.categories}
          />
          
          <AboutSection 
            id="about"
            title={landingData.about.title}
            story={landingData.about.story}
            stats={landingData.about.stats}
            images={landingData.about.images}
          />
          
          <Footer 
            id="footer"
          />
        </div>
      </main>
    </>
  );
}
