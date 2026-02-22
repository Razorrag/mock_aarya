'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit,
  Eye,
  Save,
  Plus,
  X,
} from 'lucide-react';
import { landingApi, uploadApi } from '@/lib/adminApi';

// Mock landing config
const MOCK_CONFIG = {
  hero: {
    tagline: 'Designed with Elegance, Worn with Confidence',
    is_active: true,
  },
  newArrivals: {
    title: 'New Arrivals',
    subtitle: 'Discover our latest collection',
    is_active: true,
  },
  collections: {
    title: 'Curated Collections',
    is_active: true,
  },
  about: {
    title: 'The Art of Elegance',
    is_active: true,
  },
};

// Mock images
const MOCK_IMAGES = [
  { id: 1, section: 'hero', image_url: '/hero/hero-1.jpg', title: 'Hero Slide 1', display_order: 1 },
  { id: 2, section: 'hero', image_url: '/hero/hero-2.jpg', title: 'Hero Slide 2', display_order: 2 },
  { id: 3, section: 'hero', image_url: '/hero/hero-3.jpg', title: 'Hero Slide 3', display_order: 3 },
  { id: 4, section: 'collections', image_url: '/collections/skd.jpg', title: 'SKD Collection', display_order: 1 },
  { id: 5, section: 'about', image_url: '/about/craftsmanship.jpg', title: 'Craftsmanship', display_order: 1 },
];

const SECTIONS = [
  { id: 'hero', name: 'Hero Section', description: 'Main banner slides' },
  { id: 'newArrivals', name: 'New Arrivals', description: 'Latest products section' },
  { id: 'collections', name: 'Collections', description: 'Category showcase' },
  { id: 'about', name: 'About Section', description: 'Brand story' },
];

export default function LandingPageConfig() {
  const [config, setConfig] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      try {
        const [configData, imagesData] = await Promise.all([
          landingApi.getConfig(),
          landingApi.getImages(),
        ]);
        setConfig(configData.sections?.reduce((acc, s) => {
          acc[s.section] = s.config;
          return acc;
        }, {}) || {});
        setImages(imagesData.images || []);
      } catch (apiError) {
        console.log('Using mock landing data');
        setConfig(MOCK_CONFIG);
        setImages(MOCK_IMAGES);
      }
    } catch (err) {
      console.error('Error fetching landing config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSection = (sectionId) => {
    setEditingSection(sectionId);
    setEditForm(config[sectionId] || {});
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;
    
    try {
      await landingApi.updateSection(editingSection, editForm);
      setConfig(prev => ({
        ...prev,
        [editingSection]: editForm,
      }));
      setEditingSection(null);
      setEditForm({});
    } catch (err) {
      console.error('Error saving section:', err);
      // Update locally for demo
      setConfig(prev => ({
        ...prev,
        [editingSection]: editForm,
      }));
      setEditingSection(null);
      setEditForm({});
    }
  };

  const handleImageUpload = async (e, section) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      
      // Create preview
      const preview = URL.createObjectURL(file);
      setImages(prev => [...prev, {
        id: Date.now(),
        section,
        image_url: preview,
        title: file.name,
        display_order: prev.filter(i => i.section === section).length + 1,
      }]);
      
      // Upload to server
      // const result = await landingApi.uploadImage(file, section);
    } catch (err) {
      console.error('Error uploading image:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return;
    
    try {
      await landingApi.deleteImage(imageId);
      setImages(prev => prev.filter(i => i.id !== imageId));
    } catch (err) {
      console.error('Error deleting image:', err);
      setImages(prev => prev.filter(i => i.id !== imageId));
    }
  };

  const getSectionImages = (sectionId) => {
    return images.filter(img => img.section === sectionId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl md:text-3xl font-bold text-[#F2C29A]"
            style={{ fontFamily: 'Cinzel, serif' }}
          >
            Landing Page
          </h1>
          <p className="text-[#EAE0D5]/60 mt-1">
            Configure homepage sections and images
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </a>
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-[#B76E79]/20 text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sections List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#F2C29A]" style={{ fontFamily: 'Cinzel, serif' }}>
            Sections
          </h2>
          
          {SECTIONS.map(section => (
            <div
              key={section.id}
              className={`
                p-4 rounded-xl border cursor-pointer transition-all
                ${activeSection === section.id
                  ? 'bg-[#7A2F57]/20 border-[#B76E79]/30'
                  : 'bg-[#0B0608]/40 border-[#B76E79]/15 hover:border-[#B76E79]/30'
                }
              `}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#EAE0D5]">{section.name}</p>
                  <p className="text-sm text-[#EAE0D5]/50">{section.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSection(section.id);
                  }}
                  className="p-2 rounded-lg hover:bg-[#B76E79]/10 transition-colors"
                >
                  <Edit className="w-4 h-4 text-[#EAE0D5]/70" />
                </button>
              </div>
              
              {/* Status indicator */}
              <div className="mt-3 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${config[section.id]?.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-xs text-[#EAE0D5]/50">
                  {config[section.id]?.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-[#EAE0D5]/30 ml-auto">
                  {getSectionImages(section.id).length} images
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Section Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Config */}
          <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#F2C29A]" style={{ fontFamily: 'Cinzel, serif' }}>
                {SECTIONS.find(s => s.id === activeSection)?.name} Configuration
              </h2>
              <button
                onClick={() => handleEditSection(activeSection)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#B76E79]/20 rounded-lg text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
            
            {/* Config Preview */}
            <div className="space-y-3">
              {Object.entries(config[activeSection] || {}).map(([key, value]) => (
                <div key={key} className="flex items-start gap-3">
                  <span className="text-sm text-[#EAE0D5]/50 capitalize min-w-[100px]">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-sm text-[#EAE0D5]">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section Images */}
          <div className="bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#F2C29A]" style={{ fontFamily: 'Cinzel, serif' }}>
                Images
              </h2>
              <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#7A2F57]/30 border border-[#B76E79]/30 rounded-lg text-[#F2C29A] hover:bg-[#7A2F57]/40 transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, activeSection)}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getSectionImages(activeSection).map(image => (
                <div
                  key={image.id}
                  className="relative aspect-video rounded-xl overflow-hidden bg-[#7A2F57]/10 group"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-[#B76E79]/30" />
                  </div>
                  
                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm text-white truncate">{image.title}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Empty state */}
              {getSectionImages(activeSection).length === 0 && (
                <div className="col-span-full py-8 text-center">
                  <ImageIcon className="w-12 h-12 text-[#B76E79]/30 mx-auto mb-3" />
                  <p className="text-[#EAE0D5]/50">No images uploaded</p>
                  <p className="text-sm text-[#EAE0D5]/30 mt-1">
                    Upload images for this section
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setEditingSection(null)} />
          <div className="relative bg-[#0B0608]/95 backdrop-blur-xl border border-[#B76E79]/20 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#F2C29A]" style={{ fontFamily: 'Cinzel, serif' }}>
                Edit {SECTIONS.find(s => s.id === editingSection)?.name}
              </h3>
              <button
                onClick={() => setEditingSection(null)}
                className="p-1.5 rounded-lg hover:bg-[#B76E79]/10 transition-colors"
              >
                <X className="w-5 h-5 text-[#EAE0D5]/70" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Dynamic form fields based on section */}
              {editingSection === 'hero' && (
                <>
                  <div>
                    <label className="block text-sm text-[#EAE0D5]/70 mb-2">Tagline</label>
                    <input
                      type="text"
                      value={editForm.tagline || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, tagline: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                    />
                  </div>
                </>
              )}
              
              {editingSection === 'newArrivals' && (
                <>
                  <div>
                    <label className="block text-sm text-[#EAE0D5]/70 mb-2">Title</label>
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#EAE0D5]/70 mb-2">Subtitle</label>
                    <textarea
                      value={editForm.subtitle || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40 resize-none"
                    />
                  </div>
                </>
              )}
              
              {(editingSection === 'collections' || editingSection === 'about') && (
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                  />
                </div>
              )}
              
              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_active !== false}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 rounded border-[#B76E79]/30 bg-[#0B0608]/60 text-[#B76E79] focus:ring-[#B76E79]/30"
                />
                <span className="text-[#EAE0D5]">Section Active</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingSection(null)}
                className="flex-1 px-4 py-2.5 border border-[#B76E79]/20 rounded-xl text-[#EAE0D5]/70 hover:bg-[#B76E79]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7A2F57]/30 border border-[#B76E79]/30 rounded-xl text-[#F2C29A] hover:bg-[#7A2F57]/40 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
