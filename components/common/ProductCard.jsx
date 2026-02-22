'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickViewModal } from '@/components/ui/Modal';
import { useCart } from '@/lib/cartContext';
import { useToast } from '@/components/ui/Toast';
import { AddToCartButton } from '@/components/cart/CartAnimation';

const ProductCard = ({ product, className }) => {
  const { id, name, price, image, category, isNew, originalPrice, description, sizes } = product;
  const [showQuickView, setShowQuickView] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem, openCart } = useCart();
  const toast = useToast();

  const handleAddToCart = async (productData) => {
    try {
      await addItem(productData.id || id, productData.quantity || 1, { 
        size: productData.size, 
        color: productData.color 
      });
      toast.success('Added to Cart', `${productData.name || name} has been added to your cart`);
      openCart();
    } catch (error) {
      toast.error('Error', 'Failed to add item to cart');
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(
      isWishlisted ? 'Removed from Wishlist' : 'Added to Wishlist',
      isWishlisted ? `${name} removed from your wishlist` : `${name} added to your wishlist`
    );
  };

  return (
    <>
      <div className={cn("group relative w-full product-card-enhanced", className)}>
        <div className="relative aspect-[3/4] overflow-hidden bg-[#1A1A1A] rounded-2xl">
          {/* Premium New Badge with Animation */}
          {isNew && (
            <div className="absolute top-4 left-4 z-20">
              <span className="relative px-4 py-1.5 text-xs tracking-[0.2em] text-[#050203] bg-gradient-to-r from-[#F2C29A] via-[#EAE0D5] to-[#F2C29A] font-cinzel font-semibold rounded-full overflow-hidden">
                <span className="relative z-10">NEW</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
              </span>
            </div>
          )}

          {/* Sale Badge */}
          {originalPrice && originalPrice > price && (
            <div className="absolute top-4 left-4 z-20">
              <span className="px-3 py-1 text-xs tracking-wider text-white bg-[#7A2F57] font-medium rounded-full">
                {Math.round((1 - price / originalPrice) * 100)}% OFF
              </span>
            </div>
          )}

          {/* Premium Wishlist Button with Glow */}
          <button 
            onClick={handleWishlist}
            className={cn(
              "absolute top-4 right-4 z-20 p-2.5 transition-all duration-500 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 rounded-full bg-[#0B0608]/60 backdrop-blur-sm border hover:shadow-[0_0_20px_rgba(242,194,154,0.3)]",
              isWishlisted 
                ? "opacity-100 translate-x-0 text-[#F2C29A] border-[#F2C29A]/50" 
                : "text-[#EAE0D5] border-[#B76E79]/20 hover:text-[#F2C29A] hover:border-[#F2C29A]/50"
            )}
          >
            <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
          </button>

          {/* Product Image */}
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            priority={isNew}
          />

          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050203]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Premium Overlay Actions with Staggered Animation */}
          <div className="absolute inset-0 bg-[#050203]/50 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 backdrop-blur-[4px] rounded-2xl">
            <AddToCartButton
              onClick={() => handleAddToCart(product)}
              className="p-4 bg-gradient-to-r from-[#EAE0D5] to-[#F2C29A] text-[#050203] rounded-full transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 hover:shadow-[0_0_30px_rgba(242,194,154,0.5)] hover:scale-110 active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
            </AddToCartButton>
            <button 
              onClick={() => setShowQuickView(true)}
              className="p-4 bg-gradient-to-r from-[#B76E79] to-[#7A2F57] text-[#EAE0D5] rounded-full transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-200 hover:shadow-[0_0_30px_rgba(183,110,121,0.5)] hover:scale-110 active:scale-95"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Gradient Line Animation */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7A2F57] via-[#B76E79] to-[#F2C29A] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
        </div>

        {/* Premium Product Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#B76E79] uppercase tracking-[0.2em] mb-2 font-medium">{category}</p>
          <Link href={`/products/${id}`}>
            <h3 className="text-lg font-cinzel text-[#EAE0D5] group-hover:text-[#F2C29A] transition-colors duration-300 truncate px-2 hover:drop-shadow-[0_0_10px_rgba(242,194,154,0.3)]">
              {name}
            </h3>
          </Link>
          <div className="mt-2 flex items-center justify-center gap-2">
            <p className="font-playfair text-[#F2C29A] text-lg font-medium tracking-wide">
              ₹{price?.toLocaleString()}
            </p>
            {originalPrice && originalPrice > price && (
              <p className="text-sm text-[#8B7B8F] line-through">
                ₹{originalPrice?.toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={product}
        onAddToCart={handleAddToCart}
        onWishlist={handleWishlist}
      />
    </>
  );
};

export default ProductCard;
