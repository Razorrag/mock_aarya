'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap, ScrollTrigger } from '@/lib/gsapConfig';
import { ArrowRight } from 'lucide-react';

/**
 * Collections - Modern section with overlapping cards
 * 
 * Features:
 * - Overlapping card layout
 * - GSAP scroll-triggered animations
 * - Staggered reveal effects
 * - Glass morphism styling
 */
const Collections = ({
  id,
  title = "Curated Collections",
  categories = []
}) => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const cards = cardRefs.current;
    if (!section) return;

    // Use gsap.context for proper cleanup - only kills THIS component's animations
    let ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(title,
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
          }
        }
      );

      // Cards staggered reveal - simple fade up
      cards.forEach((card, index) => {
        gsap.fromTo(card,
          { 
            y: 50, 
            opacity: 0, 
            scale: 0.95
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            }
          }
        );
      });
    });

    return () => ctx.revert(); // Only kills this component's GSAP animations
  }, []);

  return (
    <section id={id} ref={sectionRef} className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#7A2F57]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#F2C29A]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Title */}
        <h2 
          ref={titleRef}
          className="text-3xl sm:text-4xl md:text-5xl text-[#EAE0D5] text-center mb-10 md:mb-12"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          {title}
        </h2>

        {/* Custom Layout for 7 Categories */}
        <div ref={cardsContainerRef} className="space-y-6">
          {/* First Row - 2 Large Featured Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.slice(0, 2).map((category, index) => (
              <div 
                key={category.id}
                ref={el => cardRefs.current[index] = el}
              >
                <CollectionCard category={category} size="large" index={index} />
              </div>
            ))}
          </div>

          {/* Second Row - 3 Medium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.slice(2, 5).map((category, index) => (
              <div 
                key={category.id}
                ref={el => cardRefs.current[index + 2] = el}
              >
                <CollectionCard category={category} size="medium" index={index + 2} />
              </div>
            ))}
          </div>

          {/* Third Row - 2 Medium Cards Centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {categories.slice(5, 7).map((category, index) => (
              <div 
                key={category.id}
                ref={el => cardRefs.current[index + 5] = el}
              >
                <CollectionCard category={category} size="medium" index={index + 5} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Separate Card Component for cleaner code
const CollectionCard = ({ category, size = 'medium', index }) => {
  const heights = {
    large: 'h-[350px] sm:h-[400px] md:h-[450px]',
    medium: 'h-[280px] sm:h-[300px] md:h-[320px]',
    small: 'h-[250px] sm:h-[280px]'
  };

  return (
    <Link 
      href={category.link}
      className="
        group relative block w-full overflow-hidden rounded-2xl
        transition-all duration-500
        hover:scale-[1.02]
      "
    >
      <div 
        className={`
          relative ${heights[size]}
          bg-[#0B0608]/40 backdrop-blur-md
          border border-[#B76E79]/15
          shadow-[0_8px_32px_rgba(0,0,0,0.3)]
          overflow-hidden
        `}
      >
        {/* Background Image */}
        {category.image && (
          <div className="absolute inset-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-top object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050203]/90 via-[#050203]/30 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6">
          <span 
            className="text-[#F2C29A] text-xs tracking-[0.15em] uppercase block mb-1.5 opacity-0 transform -translate-y-3 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Collection
          </span>
          <h3 
            className="text-lg sm:text-xl md:text-2xl text-[#EAE0D5] mb-1 group-hover:text-white transition-colors"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            {category.name}
          </h3>
          <div className="h-0 overflow-hidden group-hover:h-auto transition-all duration-500">
            <div className="pt-3 flex items-center gap-2 text-[#B76E79] tracking-wider text-sm font-medium">
              EXPLORE <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Border Effect */}
        <div className="absolute inset-3 border border-[#F2C29A]/20 scale-95 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 pointer-events-none rounded-xl" />
      </div>
    </Link>
  );
};

export default Collections;
