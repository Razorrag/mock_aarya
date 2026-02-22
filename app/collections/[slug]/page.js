'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ChevronDown,
  Grid,
  List,
  ArrowLeft,
  Filter,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import EnhancedHeader from '@/components/landing/EnhancedHeader';
import Footer from '@/components/landing/Footer';
import { productsApi, categoriesApi } from '@/lib/customerApi';
import { QuickViewModal } from '@/components/ui/Modal';
import { useCart } from '@/lib/cartContext';
import { useToast } from '@/components/ui/Toast';

// Collection metadata - maps slug to display info
const COLLECTION_INFO = {
  'skd': {
    name: 'SKD (Pant Kurti Dupatta Set)',
    description: 'Complete ethnic elegance with our curated Pant Kurti Dupatta sets',
    image: '/collections/skd.jpg',
  },
  'pant-kurti': {
    name: 'Pant Kurti Set',
    description: 'Stylish and comfortable pant kurti combinations for modern women',
    image: '/collections/pant-kurti.jpg',
  },
  'cord-sets': {
    name: 'Cord Sets',
    description: 'Trendy cord sets for a contemporary ethnic look',
    image: '/collections/cord-sets.jpg',
  },
  'gowns': {
    name: 'Gowns',
    description: 'Elegant gowns for special occasions and celebrations',
    image: '/collections/gowns.jpg',
  },
  'kurtis': {
    name: 'Kurtis',
    description: 'Beautiful kurtis for everyday elegance and style',
    image: '/collections/kurtis.jpg',
  },
  'sarees': {
    name: 'Sarees',
    description: 'Traditional sarees with modern designs and patterns',
    image: '/collections/sarees.jpg',
  },
  'dupatta': {
    name: 'Dupatta',
    description: 'Stunning dupattas to complement your ethnic wardrobe',
    image: '/collections/dupatta.jpg',
  },
};

// Category slug mapping for API calls
const CATEGORY_MAPPING = {
  'skd': ['skd', 'pant kurti dupatta set'],
  'pant-kurti': ['pant kurti set', 'pant-kurti-set', 'pant kurti'],
  'cord-sets': ['cord sets', 'cord-sets'],
  'gowns': ['gowns', 'gown'],
  'kurtis': ['kurtis', 'kurti'],
  'sarees': ['sarees', 'saree'],
  'dupatta': ['dupatta', 'dupattas'],
};

// Mock products data for each collection
const MOCK_PRODUCTS = {
  'skd': [
    { id: 1, name: 'Royal Blue SKD Set', slug: 'royal-blue-skd-set', price: 4999, mrp: 6999, category: 'SKD', image: '/products/kurti-1.jpg', is_new: true, rating: 4.5, reviews: 28, description: 'A stunning royal blue SKD set featuring intricate embroidery work. This elegant ensemble includes a beautifully designed kurti, comfortable pants, and a matching dupatta. Perfect for festive occasions and celebrations.', material: 'Silk Blend', care: 'Dry Clean Only' },
    { id: 2, name: 'Floral Print SKD', slug: 'floral-print-skd', price: 3999, mrp: 5499, category: 'SKD', image: '/products/kurti-1.jpg', is_new: false, rating: 4.7, reviews: 45, description: 'A beautiful floral print SKD set that combines traditional aesthetics with modern design. The set includes a printed kurti, solid pants, and a coordinated dupatta.', material: 'Cotton Silk', care: 'Machine Wash' },
    { id: 3, name: 'Embroidered SKD Set', slug: 'embroidered-skd-set', price: 5999, mrp: 7999, category: 'SKD', image: '/products/kurti-1.jpg', is_new: true, rating: 4.8, reviews: 32, description: 'An exquisite embroidered SKD set with hand-crafted details. The intricate embroidery adds a touch of elegance to this premium ensemble.', material: 'Pure Silk', care: 'Dry Clean Only' },
    { id: 4, name: 'Casual Cotton SKD', slug: 'casual-cotton-skd', price: 2999, mrp: 3999, category: 'SKD', image: '/products/kurti-1.jpg', is_new: false, rating: 4.3, reviews: 19, description: 'A comfortable cotton SKD set perfect for everyday wear. The breathable fabric ensures all-day comfort while maintaining style.', material: 'Pure Cotton', care: 'Machine Wash' },
  ],
  'pant-kurti': [
    { id: 5, name: 'Designer Pant Kurti', slug: 'designer-pant-kurti', price: 3499, mrp: 4999, category: 'Pant Kurti Set', image: '/products/kurti-1.jpg', is_new: true, rating: 4.6, reviews: 38, description: 'A designer pant kurti set featuring contemporary patterns and comfortable fit. Perfect for both casual and semi-formal occasions.', material: 'Rayon', care: 'Gentle Wash' },
    { id: 6, name: 'Printed Pant Set', slug: 'printed-pant-set', price: 2499, mrp: 3499, category: 'Pant Kurti Set', image: '/products/kurti-1.jpg', is_new: false, rating: 4.4, reviews: 52, description: 'A stylish printed pant set with vibrant colors and modern design. The comfortable fit makes it ideal for daily wear.', material: 'Cotton Blend', care: 'Machine Wash' },
    { id: 7, name: 'Festive Pant Kurti', slug: 'festive-pant-kurti', price: 4499, mrp: 5999, category: 'Pant Kurti Set', image: '/products/kurti-1.jpg', is_new: true, rating: 4.9, reviews: 67, description: 'A festive pant kurti set with beautiful embellishments and rich colors. Perfect for celebrations and special occasions.', material: 'Art Silk', care: 'Dry Clean Only' },
  ],
  'cord-sets': [
    { id: 8, name: 'Premium Cord Set', slug: 'premium-cord-set', price: 4499, mrp: 5999, category: 'Cord Sets', image: '/products/cord-1.jpg', is_new: true, rating: 4.5, reviews: 41, description: 'A premium cord set featuring luxurious corduroy fabric with a modern silhouette. This trendy ensemble is perfect for a contemporary ethnic look.', material: 'Corduroy', care: 'Dry Clean Only' },
    { id: 9, name: 'Casual Cord Set', slug: 'casual-cord-set', price: 2999, mrp: 3999, category: 'Cord Sets', image: '/products/cord-1.jpg', is_new: false, rating: 4.2, reviews: 23, description: 'A comfortable casual cord set perfect for everyday wear. The soft corduroy fabric provides warmth and style.', material: 'Cotton Corduroy', care: 'Machine Wash' },
    { id: 10, name: 'Party Wear Cord Set', slug: 'party-wear-cord-set', price: 5499, mrp: 7499, category: 'Cord Sets', image: '/products/cord-1.jpg', is_new: true, rating: 4.7, reviews: 35, description: 'An elegant party wear cord set with premium finish and sophisticated design. Perfect for evening events and gatherings.', material: 'Premium Corduroy', care: 'Dry Clean Only' },
  ],
  'gowns': [
    { id: 11, name: 'Silk Evening Gown', slug: 'silk-evening-gown', price: 8999, mrp: 11999, category: 'Gowns', image: '/products/gown-1.jpg', is_new: true, rating: 4.8, reviews: 56, description: 'A luxurious silk evening gown crafted with the finest materials. Features intricate embroidery and a flattering silhouette perfect for special occasions.', material: 'Pure Silk', care: 'Dry Clean Only' },
    { id: 12, name: 'Floor Length Gown', slug: 'floor-length-gown', price: 7499, mrp: 9999, category: 'Gowns', image: '/products/gown-2.jpg', is_new: false, rating: 4.6, reviews: 42, description: 'An elegant floor length gown with graceful draping and beautiful details. Perfect for weddings and formal events.', material: 'Chiffon', care: 'Dry Clean Only' },
    { id: 13, name: 'Designer Party Gown', slug: 'designer-party-gown', price: 9999, mrp: 13999, category: 'Gowns', image: '/products/gown-1.jpg', is_new: true, rating: 4.9, reviews: 78, description: 'A stunning designer party gown with hand-crafted embellishments and premium fabric. Make a statement at any event.', material: 'Raw Silk', care: 'Dry Clean Only' },
  ],
  'kurtis': [
    { id: 14, name: 'Designer Kurti', slug: 'designer-kurti', price: 2499, mrp: 3499, category: 'Kurtis', image: '/products/kurti-1.jpg', is_new: true, rating: 4.7, reviews: 23, description: 'A beautiful designer kurti with unique patterns and premium quality fabric. Perfect for both casual and festive occasions.', material: 'Cotton Silk', care: 'Gentle Wash' },
    { id: 15, name: 'Cotton Printed Kurti', slug: 'cotton-printed-kurti', price: 1499, mrp: 1999, category: 'Kurtis', image: '/products/kurti-1.jpg', is_new: false, rating: 4.4, reviews: 67, description: 'A comfortable cotton printed kurti with vibrant prints. Ideal for everyday wear with breathable fabric.', material: 'Pure Cotton', care: 'Machine Wash' },
    { id: 16, name: 'Anarkali Kurti', slug: 'anarkali-kurti', price: 3499, mrp: 4999, category: 'Kurtis', image: '/products/kurti-1.jpg', is_new: true, rating: 4.8, reviews: 89, description: 'An elegant Anarkali kurti with beautiful flare and intricate embroidery. Perfect for festive celebrations.', material: 'Georgette', care: 'Dry Clean Only' },
    { id: 17, name: 'Straight Cut Kurti', slug: 'straight-cut-kurti', price: 1999, mrp: 2999, category: 'Kurtis', image: '/products/kurti-1.jpg', is_new: false, rating: 4.3, reviews: 34, description: 'A classic straight cut kurti with modern design elements. Versatile piece for any wardrobe.', material: 'Rayon', care: 'Machine Wash' },
  ],
  'sarees': [
    { id: 18, name: 'Embroidered Saree', slug: 'embroidered-saree', price: 8999, mrp: 11999, category: 'Sarees', image: '/products/saree-1.jpg', is_new: false, rating: 4.9, reviews: 78, description: 'An exquisite embroidered saree with intricate handwork and premium fabric. A timeless piece for special occasions.', material: 'Banarasi Silk', care: 'Dry Clean Only' },
    { id: 19, name: 'Silk Designer Saree', slug: 'silk-designer-saree', price: 12999, mrp: 15999, category: 'Sarees', image: '/products/saree-1.jpg', is_new: true, rating: 4.8, reviews: 56, description: 'A luxurious silk designer saree with contemporary design and rich pallu. Perfect for weddings and celebrations.', material: 'Pure Silk', care: 'Dry Clean Only' },
    { id: 20, name: 'Casual Cotton Saree', slug: 'casual-cotton-saree', price: 2999, mrp: 3999, category: 'Sarees', image: '/products/saree-1.jpg', is_new: false, rating: 4.5, reviews: 92, description: 'A comfortable casual cotton saree with beautiful prints. Perfect for daily wear and casual occasions.', material: 'Pure Cotton', care: 'Machine Wash' },
  ],
  'dupatta': [
    { id: 21, name: 'Embroidered Dupatta', slug: 'embroidered-dupatta', price: 1499, mrp: 1999, category: 'Dupatta', image: '/collections/dupatta.jpg', is_new: true, rating: 4.6, reviews: 45, description: 'A beautiful embroidered dupatta with intricate thread work. Perfect to complement your ethnic outfits.', material: 'Chiffon', care: 'Gentle Wash' },
    { id: 22, name: 'Bandhani Dupatta', slug: 'bandhani-dupatta', price: 999, mrp: 1499, category: 'Dupatta', image: '/collections/dupatta.jpg', is_new: false, rating: 4.4, reviews: 67, description: 'A traditional Bandhani dupatta with vibrant colors and classic tie-dye patterns.', material: 'Georgette', care: 'Dry Clean Only' },
    { id: 23, name: 'Chiffon Dupatta', slug: 'chiffon-dupatta', price: 799, mrp: 1199, category: 'Dupatta', image: '/collections/dupatta.jpg', is_new: true, rating: 4.3, reviews: 34, description: 'A lightweight chiffon dupatta with elegant design. Perfect for everyday use with any ethnic ensemble.', material: 'Chiffon', care: 'Gentle Wash' },
  ],
};

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug;
  const { addItem, openCart } = useCart();
  const toast = useToast();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    search: '',
  });
  
  // Quick view modal state
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Get collection info
  const collectionInfo = COLLECTION_INFO[slug] || {
    name: 'Collection',
    description: 'Browse our collection',
    image: '/placeholder-category.jpg',
  };
  
  // Handle opening quick view modal
  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };
  
  // Handle add to cart from modal
  const handleAddToCart = async (productData) => {
    try {
      await addItem(productData.id || productData.id, productData.quantity || 1, { 
        size: productData.size, 
        color: productData.color 
      });
      toast.success('Added to Cart', `${productData.name} has been added to your cart`);
      setShowQuickView(false);
      openCart();
    } catch (error) {
      toast.error('Error', 'Failed to add item to cart');
    }
  };
  
  // Handle wishlist
  const handleWishlist = (product) => {
    toast.success('Added to Wishlist', `${product.name} added to your wishlist`);
  };

  useEffect(() => {
    fetchProducts();
  }, [slug]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const categoryFilters = CATEGORY_MAPPING[slug] || [slug];
        const response = await productsApi.list({ 
          category: categoryFilters[0],
          limit: 50 
        });
        
        if (response.products && response.products.length > 0) {
          setProducts(response.products);
        } else {
          // Fall back to mock data
          setProducts(MOCK_PRODUCTS[slug] || []);
        }
      } catch (apiError) {
        console.log('Using mock data for collection:', slug);
        setProducts(MOCK_PRODUCTS[slug] || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts(MOCK_PRODUCTS[slug] || []);
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

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (filters.minPrice && product.price < parseInt(filters.minPrice)) return false;
    if (filters.maxPrice && product.price > parseInt(filters.maxPrice)) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return product.name.toLowerCase().includes(search);
    }
    return true;
  }).sort((a, b) => {
    switch (filters.sort) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'popular': return (b.reviews || 0) - (a.reviews || 0);
      default: return b.id - a.id;
    }
  });

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
      search: '',
    });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.search;

  // Check if collection exists
  if (!COLLECTION_INFO[slug]) {
    return (
      <main className="min-h-screen text-[#EAE0D5] selection:bg-[#F2C29A] selection:text-[#050203]">
        <div className="relative z-10 page-wrapper">
          <EnhancedHeader />
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Collection Not Found
            </h1>
            <p className="text-[#EAE0D5]/60 mb-8">
              The collection you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A2F57] text-[#F2C29A] rounded-xl hover:bg-[#7A2F57]/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
          <Footer />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-[#EAE0D5] selection:bg-[#F2C29A] selection:text-[#050203]">
      <div className="relative z-10 page-wrapper">
        <EnhancedHeader />
        
        <div className="page-content">
          {/* Collection Hero */}
          <div className="relative h-[300px] md:h-[400px] overflow-hidden">
            <div className="absolute inset-0 bg-[#0B0608]/60">
              {collectionInfo.image && (
                <Image
                  src={collectionInfo.image}
                  alt={collectionInfo.name}
                  fill
                  className="object-cover opacity-60"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-[#050203]/50 via-transparent to-[#050203]" />
            </div>
            
            <div className="relative h-full container mx-auto px-4 sm:px-6 md:px-8 flex flex-col justify-end pb-8">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-[#EAE0D5]/60 mb-4">
                <Link href="/" className="hover:text-[#F2C29A] transition-colors">Home</Link>
                <span>/</span>
                <Link href="/#collections" className="hover:text-[#F2C29A] transition-colors">Collections</Link>
                <span>/</span>
                <span className="text-[#F2C29A]">{collectionInfo.name}</span>
              </nav>
              
              <h1 
                className="text-3xl md:text-5xl font-bold text-[#F2C29A] mb-2"
                style={{ fontFamily: 'Cinzel, serif' }}
              >
                {collectionInfo.name}
              </h1>
              <p className="text-[#EAE0D5]/70 max-w-2xl">
                {collectionInfo.description}
              </p>
            </div>
          </div>

          {/* Products Section */}
          <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EAE0D5]/40" />
                <input
                  type="text"
                  placeholder="Search in this collection..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 transition-colors"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="appearance-none px-4 py-2.5 pr-10 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40 transition-colors cursor-pointer"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value} className="bg-[#0B0608]">{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#EAE0D5]/50 pointer-events-none" />
              </div>

              {/* Filter Toggle (Mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5]"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              {/* View Mode */}
              <div className="hidden md:flex items-center gap-1 p-1 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#7A2F57]/30 text-[#F2C29A]' : 'text-[#EAE0D5]/50 hover:text-[#EAE0D5]'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#7A2F57]/30 text-[#F2C29A]' : 'text-[#EAE0D5]/50 hover:text-[#EAE0D5]'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-6">
              {/* Filters Sidebar */}
              <aside className={`
                fixed md:static inset-y-0 left-0 z-50 w-72 
                bg-[#0B0608]/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none
                transform transition-transform duration-300
                ${showFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                md:w-64 flex-shrink-0
              `}>
                <div className="h-full md:h-auto overflow-y-auto p-6 md:p-0">
                  {/* Mobile Close */}
                  <div className="flex items-center justify-between mb-6 md:hidden">
                    <h3 className="text-lg font-semibold text-[#F2C29A]">Filters</h3>
                    <button onClick={() => setShowFilters(false)}>
                      <X className="w-5 h-5 text-[#EAE0D5]/70" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Price Range */}
                    <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-[#F2C29A] mb-3">Price Range</h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice}
                          onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 text-sm"
                        />
                        <span className="text-[#EAE0D5]/50">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                          className="w-full px-3 py-2 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 text-sm"
                        />
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="w-full py-2.5 text-sm text-[#B76E79] hover:text-[#F2C29A] border border-[#B76E79]/20 rounded-xl hover:border-[#B76E79]/40 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {/* Results Count */}
                <p className="text-sm text-[#EAE0D5]/50 mb-4">
                  Showing {filteredProducts.length} products
                </p>

                {/* Products */}
                {loading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[3/4] bg-[#B76E79]/10 rounded-2xl mb-3" />
                        <div className="h-4 bg-[#B76E79]/10 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-[#B76E79]/10 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#EAE0D5]/50">No products found in this collection</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-[#B76E79] hover:text-[#F2C29A] transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className={`
                    grid gap-4 md:gap-6
                    ${viewMode === 'grid' 
                      ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                      : 'grid-cols-1'
                    }
                  `}>
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleQuickView(product)}
                        className="group cursor-pointer"
                      >
                        <div className={`
                          bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 
                          rounded-2xl overflow-hidden
                          hover:border-[#B76E79]/30 hover:shadow-[0_0_30px_rgba(183,110,121,0.1)]
                          transition-all duration-300
                          ${viewMode === 'list' ? 'flex' : ''}
                        `}>
                          {/* Image */}
                          <div className={`
                            relative overflow-hidden
                            ${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-[3/4]'}
                          `}>
                            <div className="absolute inset-0 bg-[#7A2F57]/20 flex items-center justify-center">
                              <span className="text-[#B76E79]/30 text-sm">Image</span>
                            </div>
                            {product.is_new && (
                              <span className="absolute top-2 left-2 px-2 py-1 bg-[#7A2F57]/80 text-[#F2C29A] text-xs rounded-lg">
                                New
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-4">
                            <p className="text-xs text-[#B76E79] mb-1">{product.category}</p>
                            <h3 className="font-medium text-[#EAE0D5] group-hover:text-[#F2C29A] transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-semibold text-[#F2C29A]">{formatCurrency(product.price)}</span>
                              {product.mrp > product.price && (
                                <span className="text-sm text-[#EAE0D5]/50 line-through">
                                  {formatCurrency(product.mrp)}
                                </span>
                              )}
                            </div>
                            {product.rating && (
                              <div className="flex items-center gap-1 mt-2">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm text-[#EAE0D5]/70">{product.rating}</span>
                                <span className="text-xs text-[#EAE0D5]/50">({product.reviews})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
      
      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onWishlist={handleWishlist}
      />
    </main>
  );
}
