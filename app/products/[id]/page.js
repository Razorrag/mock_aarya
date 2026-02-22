'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Star,
  MessageCircle,
} from 'lucide-react';
import EnhancedHeader from '@/components/landing/EnhancedHeader';
import Footer from '@/components/landing/Footer';
import { productsApi, reviewsApi, wishlistApi } from '@/lib/customerApi';
import { useCart } from '@/lib/cartContext';

// Mock product data
const MOCK_PRODUCT = {
  id: 1,
  name: 'Silk Evening Gown',
  slug: 'silk-evening-gown',
  description: 'An exquisite silk evening gown crafted with the finest materials. This stunning piece features intricate embroidery and a flattering silhouette that will make you the center of attention at any event. Made from pure silk with hand-crafted details.',
  price: 5999,
  mrp: 7999,
  category: 'Gowns',
  category_slug: 'gowns',
  images: [
    '/products/gown-1.jpg',
    '/products/gown-2.jpg',
    '/products/gown-3.jpg',
    '/products/gown-4.jpg',
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors: [
    { name: 'Burgundy', hex: '#722F37' },
    { name: 'Navy', hex: '#1B2838' },
    { name: 'Emerald', hex: '#046307' },
  ],
  in_stock: true,
  stock_quantity: 15,
  is_new: true,
  is_featured: true,
  rating: 4.5,
  reviews_count: 28,
  sku: 'AG-SILK-001',
  material: 'Pure Silk',
  weight: '0.8 kg',
  dimensions: 'Free Size',
  care_instructions: 'Dry clean only. Store in a cool, dry place away from direct sunlight.',
  tags: ['evening wear', 'silk', 'gown', 'party', 'wedding'],
};

const MOCK_REVIEWS = [
  { id: 1, user: 'Priya S.', rating: 5, comment: 'Absolutely stunning! The quality is amazing and it fits perfectly.', date: '2024-01-15', helpful: 12 },
  { id: 2, user: 'Ananya M.', rating: 4, comment: 'Beautiful dress, but the color is slightly different from the photos. Still love it!', date: '2024-01-10', helpful: 8 },
  { id: 3, user: 'Ritu K.', rating: 5, comment: 'Perfect for my engagement party. Got so many compliments!', date: '2024-01-05', helpful: 15 },
];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  const { addItem, openCart } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      
      try {
        const [productData, reviewsData] = await Promise.all([
          productsApi.get(productId),
          reviewsApi.list(productId),
        ]);
        setProduct(productData.product || productData);
        setReviews(reviewsData.reviews || reviewsData || MOCK_REVIEWS);
      } catch (apiError) {
        console.log('Using mock product data');
        setProduct(MOCK_PRODUCT);
        setReviews(MOCK_REVIEWS);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    
    try {
      setAddingToCart(true);
      await addItem(product.id, quantity, { size: selectedSize, color: selectedColor });
      openCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    try {
      if (isWishlisted) {
        await wishlistApi.remove(product.id);
      } else {
        await wishlistApi.add(product.id);
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      // Toggle anyway for demo
      setIsWishlisted(!isWishlisted);
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

  // Calculate discount percentage
  const discountPercent = product?.mrp > product?.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  if (loading) {
    return (
      <main className="min-h-screen text-[#EAE0D5] selection:bg-[#F2C29A] selection:text-[#050203]">
        {/* Background is now handled by root layout */}
        <div className="relative z-10">
          <EnhancedHeader />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse grid md:grid-cols-2 gap-8">
              <div className="aspect-[3/4] bg-[#B76E79]/10 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-[#B76E79]/10 rounded w-3/4" />
                <div className="h-4 bg-[#B76E79]/10 rounded w-1/2" />
                <div className="h-6 bg-[#B76E79]/10 rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen text-[#EAE0D5] selection:bg-[#F2C29A] selection:text-[#050203]">
        {/* Background is now handled by root layout */}
        <div className="relative z-10">
          <EnhancedHeader />
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl text-[#F2C29A] mb-4">Product Not Found</h1>
            <Link href="/products" className="text-[#B76E79] hover:text-[#F2C29A]">
              Back to Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-[#EAE0D5] selection:bg-[#F2C29A] selection:text-[#050203]">
      {/* Background is now handled by root layout */}
      
      <div className="relative z-10">
        <EnhancedHeader />
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-[#EAE0D5]/50 hover:text-[#EAE0D5]">Home</Link>
            <ChevronRight className="w-4 h-4 text-[#EAE0D5]/30" />
            <Link href="/products" className="text-[#EAE0D5]/50 hover:text-[#EAE0D5]">Products</Link>
            <ChevronRight className="w-4 h-4 text-[#EAE0D5]/30" />
            <Link href={`/products?category=${product.category_slug || product.category}`} className="text-[#EAE0D5]/50 hover:text-[#EAE0D5]">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-[#EAE0D5]/30" />
            <span className="text-[#F2C29A]">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[#B76E79]/30">Product Image {selectedImage + 1}</span>
                </div>
                {product.is_new && (
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-[#7A2F57]/80 text-[#F2C29A] text-sm rounded-lg">
                    New Arrival
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="absolute top-4 right-4 px-3 py-1.5 bg-[#B76E79]/80 text-white text-sm rounded-lg">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(product.images || ['/products/placeholder.jpg']).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === idx 
                        ? 'border-[#B76E79]' 
                        : 'border-[#B76E79]/20 hover:border-[#B76E79]/40'
                    }`}
                  >
                    <div className="w-full h-full bg-[#0B0608]/40 flex items-center justify-center">
                      <span className="text-xs text-[#B76E79]/30">{idx + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title & Rating */}
              <div>
                <p className="text-sm text-[#B76E79] mb-2">{product.category}</p>
                <h1 
                  className="text-2xl md:text-3xl font-bold text-[#F2C29A]"
                  style={{ fontFamily: 'Cinzel, serif' }}
                >
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-[#EAE0D5]/20'}`}
                      />
                    ))}
                    <span className="text-sm text-[#EAE0D5]/70 ml-1">
                      {product.rating} ({product.reviews_count} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#F2C29A]">{formatCurrency(product.price)}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-lg text-[#EAE0D5]/50 line-through">{formatCurrency(product.mrp)}</span>
                    <span className="text-sm text-[#B76E79]">Save {formatCurrency(product.mrp - product.price)}</span>
                  </>
                )}
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <p className="text-sm text-[#EAE0D5]/70 mb-2">Color: <span className="text-[#EAE0D5]">{selectedColor?.name || 'Select'}</span></p>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor?.name === color.name 
                        ? 'border-[#F2C29A] scale-110' 
                        : 'border-[#B76E79]/20 hover:border-[#B76E79]/40'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#EAE0D5]/70">Size: <span className="text-[#EAE0D5]">{selectedSize || 'Select'}</span></p>
                  <button className="text-sm text-[#B76E79] hover:text-[#F2C29A]">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'bg-[#7A2F57]/30 border-[#B76E79] text-[#F2C29A]'
                          : 'bg-[#0B0608]/40 border-[#B76E79]/20 text-[#EAE0D5]/70 hover:border-[#B76E79]/40'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <p className="text-sm text-[#EAE0D5]/70 mb-2">Quantity</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#B76E79]/20 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 text-[#EAE0D5]/70 hover:text-[#EAE0D5] hover:bg-[#B76E79]/10 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-[#EAE0D5]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                      className="p-2.5 text-[#EAE0D5]/70 hover:text-[#EAE0D5] hover:bg-[#B76E79]/10 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-[#EAE0D5]/50">
                    {product.in_stock ? `${product.stock_quantity} available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || addingToCart}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isWishlisted 
                      ? 'bg-[#B76E79]/20 border-[#B76E79] text-[#B76E79]' 
                      : 'border-[#B76E79]/20 text-[#EAE0D5]/70 hover:border-[#B76E79]/40 hover:text-[#EAE0D5]'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3.5 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:border-[#B76E79]/40 hover:text-[#EAE0D5] transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#B76E79]/15">
                <div className="text-center">
                  <Truck className="w-5 h-5 mx-auto text-[#B76E79] mb-1" />
                  <p className="text-xs text-[#EAE0D5]/70">Free Shipping</p>
                </div>
                <div className="text-center">
                  <Shield className="w-5 h-5 mx-auto text-[#B76E79] mb-1" />
                  <p className="text-xs text-[#EAE0D5]/70">Secure Payment</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-5 h-5 mx-auto text-[#B76E79] mb-1" />
                  <p className="text-xs text-[#EAE0D5]/70">Easy Returns</p>
                </div>
              </div>

              {/* SKU */}
              <p className="text-sm text-[#EAE0D5]/50">SKU: {product.sku}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <div className="flex gap-6 border-b border-[#B76E79]/15">
              {['description', 'details', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab 
                      ? 'text-[#F2C29A] border-b-2 border-[#B76E79]' 
                      : 'text-[#EAE0D5]/50 hover:text-[#EAE0D5]'
                  }`}
                >
                  {tab} {tab === 'reviews' && `(${reviews.length})`}
                </button>
              ))}
            </div>

            <div className="py-6">
              {activeTab === 'description' && (
                <div className="prose prose-invert max-w-none">
                  <p className="text-[#EAE0D5]/80 leading-relaxed">{product.description}</p>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-[#B76E79]/10">
                      <span className="text-[#EAE0D5]/50">Material</span>
                      <span className="text-[#EAE0D5]">{product.material || 'Premium Quality'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#B76E79]/10">
                      <span className="text-[#EAE0D5]/50">Weight</span>
                      <span className="text-[#EAE0D5]">{product.weight || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#B76E79]/10">
                      <span className="text-[#EAE0D5]/50">Dimensions</span>
                      <span className="text-[#EAE0D5]">{product.dimensions || 'Standard'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#F2C29A] mb-2">Care Instructions</h4>
                    <p className="text-[#EAE0D5]/70 text-sm">{product.care_instructions || 'Dry clean recommended'}</p>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Summary */}
                  <div className="flex items-center gap-6 p-4 bg-[#0B0608]/40 rounded-xl">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-[#F2C29A]">{product.rating}</p>
                      <div className="flex items-center justify-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-[#EAE0D5]/20'}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-[#EAE0D5]/50 mt-1">{product.reviews_count} reviews</p>
                    </div>
                    <button className="ml-auto px-4 py-2 bg-[#7A2F57]/30 text-[#F2C29A] rounded-lg hover:bg-[#7A2F57]/40 transition-colors">
                      Write a Review
                    </button>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 bg-[#0B0608]/40 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-[#EAE0D5]">{review.user}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-[#EAE0D5]/20'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-[#EAE0D5]/50">{review.date}</span>
                        </div>
                        <p className="text-[#EAE0D5]/70 mt-2 text-sm">{review.comment}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button className="flex items-center gap-1 text-xs text-[#EAE0D5]/50 hover:text-[#EAE0D5]">
                            <Check className="w-3 h-3" />
                            Helpful ({review.helpful})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
}
