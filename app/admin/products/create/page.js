'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { productsApi, categoriesApi, uploadApi } from '@/lib/adminApi';

// Mock categories
const MOCK_CATEGORIES = [
  { id: 1, name: 'SKD (Pant Kurti Dupatta Set)' },
  { id: 2, name: 'Pant Kurti Set' },
  { id: 3, name: 'Cord Sets' },
  { id: 4, name: 'Gowns' },
  { id: 5, name: 'Kurtis' },
  { id: 6, name: 'Sarees' },
  { id: 7, name: 'Dupatta' },
];

const INITIAL_FORM = {
  name: '',
  slug: '',
  description: '',
  price: '',
  mrp: '',
  category_id: '',
  is_active: true,
  is_featured: false,
  meta_title: '',
  meta_description: '',
};

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.list();
      setCategories(data.categories || data || MOCK_CATEGORIES);
    } catch {
      setCategories(MOCK_CATEGORIES);
    }
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug
    if (name === 'name') {
      setForm(prev => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));
    }

    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Add variant
  const addVariant = () => {
    setVariants(prev => [...prev, { size: '', color: '', quantity: '', sku: '' }]);
  };

  // Remove variant
  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  // Update variant
  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        // For now, create a local preview
        const preview = URL.createObjectURL(file);
        setImages(prev => [...prev, { file, preview, uploading: false }]);
        
        // Upload to server
        // const result = await uploadApi.uploadImage(file, 'products');
        // setImages(prev => prev.map(img => 
        //   img.preview === preview ? { ...img, url: result.image_url } : img
        // ));
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  // Remove image - cleanup blob URL to prevent memory leak
  const removeImage = (index) => {
    setImages(prev => {
      const imageToRemove = prev[index];
      // Revoke blob URL to free memory
      if (imageToRemove?.preview && imageToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  // Validate form
  const validate = () => {
    const newErrors = {};
    
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Valid price is required';
    if (!form.category_id) newErrors.category_id = 'Category is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      
      const productData = {
        ...form,
        price: parseFloat(form.price),
        mrp: parseFloat(form.mrp) || parseFloat(form.price),
        category_id: parseInt(form.category_id),
      };
      
      try {
        const result = await productsApi.create(productData);
        router.push(`/admin/products/${result.id}`);
      } catch (apiError) {
        console.log('Mock product creation');
        router.push('/admin/products');
      }
    } catch (err) {
      console.error('Error creating product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#F2C29A]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Add New Product
          </h1>
          <p className="text-[#EAE0D5]/60 mt-1">
            Create a new product in your catalog
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Basic Information
              </h2>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className={`
                      w-full px-4 py-2.5
                      bg-[#0B0608]/60 border rounded-xl
                      text-[#EAE0D5] placeholder-[#EAE0D5]/40
                      focus:outline-none transition-colors
                      ${errors.name ? 'border-red-500/50' : 'border-[#B76E79]/20 focus:border-[#B76E79]/40'}
                    `}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="product-url-slug"
                    className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter product description..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Pricing
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">
                    Selling Price <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EAE0D5]/50">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0"
                      className={`
                        w-full pl-8 pr-4 py-2.5
                        bg-[#0B0608]/60 border rounded-xl
                        text-[#EAE0D5] placeholder-[#EAE0D5]/40
                        focus:outline-none transition-colors
                        ${errors.price ? 'border-red-500/50' : 'border-[#B76E79]/20 focus:border-[#B76E79]/40'}
                      `}
                    />
                  </div>
                  {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">
                    MRP
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EAE0D5]/50">₹</span>
                    <input
                      type="number"
                      name="mrp"
                      value={form.mrp}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Product Images
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-[#7A2F57]/10">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <label className="aspect-square rounded-xl border-2 border-dashed border-[#B76E79]/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#B76E79]/50 transition-colors">
                  <Upload className="w-6 h-6 text-[#B76E79]/50 mb-2" />
                  <span className="text-sm text-[#EAE0D5]/50">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#F2C29A]" style={{ fontFamily: 'Cinzel, serif' }}>
                  Variants (Size/Color)
                </h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1 text-sm text-[#B76E79] hover:text-[#F2C29A] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Variant
                </button>
              </div>
              
              {variants.length > 0 ? (
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-[#0B0608]/60 border border-[#B76E79]/10 rounded-xl">
                      <input
                        type="text"
                        placeholder="Size"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Color"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={variant.quantity}
                        onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                        className="w-20 px-3 py-2 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#EAE0D5]/50 text-sm">
                  No variants added. Click "Add Variant" to create size/color options.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Category
              </h2>
              
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className={`
                  w-full px-4 py-2.5
                  bg-[#0B0608]/60 border rounded-xl
                  text-[#EAE0D5]
                  focus:outline-none transition-colors
                  appearance-none cursor-pointer
                  ${errors.category_id ? 'border-red-500/50' : 'border-[#B76E79]/20 focus:border-[#B76E79]/40'}
                `}
              >
                <option value="" className="bg-[#0B0608]">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-[#0B0608]">{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-400 text-sm mt-1">{errors.category_id}</p>}
            </div>

            {/* Status */}
            <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Status
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-[#B76E79]/30 bg-[#0B0608]/60 text-[#B76E79] focus:ring-[#B76E79]/30"
                  />
                  <span className="text-[#EAE0D5]">Active</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={form.is_featured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-[#B76E79]/30 bg-[#0B0608]/60 text-[#B76E79] focus:ring-[#B76E79]/30"
                  />
                  <span className="text-[#EAE0D5]">Featured</span>
                </label>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#F2C29A] mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                SEO Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={form.meta_title}
                    onChange={handleChange}
                    placeholder="SEO title"
                    className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 transition-colors text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={form.meta_description}
                    onChange={handleChange}
                    placeholder="SEO description..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40 transition-colors resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link
                href="/admin/products"
                className="flex-1 px-4 py-2.5 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7A2F57]/30 border border-[#B76E79]/30 rounded-xl text-[#F2C29A] hover:bg-[#7A2F57]/40 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
