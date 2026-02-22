'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Mail, Phone, Calendar, Edit2, Camera, Save } from 'lucide-react';
import { userApi } from '@/lib/customerApi';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      
      try {
        const data = await userApi.getProfile();
        setUser(data.user || data);
        setFormData({
          first_name: data.user?.first_name || data.first_name || '',
          last_name: data.user?.last_name || data.last_name || '',
          email: data.user?.email || data.email || '',
          phone: data.user?.phone || data.phone || '',
        });
      } catch (apiError) {
        console.log('Using mock user data');
        const mockUser = {
          id: 1,
          first_name: 'Priya',
          last_name: 'Sharma',
          email: 'priya.sharma@example.com',
          phone: '+91 98765 43210',
          created_at: '2024-01-15',
          total_orders: 12,
          total_spent: 45999,
        };
        setUser(mockUser);
        setFormData({
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          email: mockUser.email,
          phone: mockUser.phone,
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      try {
        const data = await userApi.updateProfile(formData);
        setUser(data.user || data);
      } catch (apiError) {
        // Update locally
        setUser(prev => ({ ...prev, ...formData }));
      }
      
      setEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 bg-[#B76E79]/10 rounded-2xl" />
        <div className="h-32 bg-[#B76E79]/10 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#F2C29A]">Profile Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#B76E79] hover:text-[#F2C29A] border border-[#B76E79]/20 rounded-lg hover:border-[#B76E79]/40 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#7A2F57] to-[#B76E79] flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#B76E79] rounded-full flex items-center justify-center text-white hover:bg-[#7A2F57] transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#EAE0D5]/70 mb-1">First Name</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#EAE0D5]/70 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#EAE0D5]/70 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-2.5 border border-[#B76E79]/20 text-[#EAE0D5]/70 rounded-xl hover:border-[#B76E79]/40 hover:text-[#EAE0D5] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#B76E79]" />
                  <span className="text-lg text-[#F2C29A]">{user?.first_name} {user?.last_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#B76E79]" />
                  <span className="text-[#EAE0D5]">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#B76E79]" />
                  <span className="text-[#EAE0D5]">{user?.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#B76E79]" />
                  <span className="text-[#EAE0D5]/70">Member since {formatDate(user?.created_at || '2024-01-01')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl">
        <h3 className="text-lg font-semibold text-[#F2C29A] mb-6">Personal Information</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#EAE0D5]/70 mb-2">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-sm text-[#EAE0D5]/70 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-4 py-3 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-[#EAE0D5]/70 mb-2">Screen Name</label>
            <input
              type="text"
              value={`${formData.first_name} ${formData.last_name}`}
              readOnly
              className="w-full px-4 py-3 bg-[#0B0608]/40 border border-[#B76E79]/10 rounded-lg text-[#EAE0D5]/50 cursor-not-allowed"
              placeholder="Screen name will be generated automatically"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#EAE0D5]/70 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
              placeholder="Enter your email address"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#EAE0D5]/70 mb-2">Date of Birth</label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
            />
          </div>
          
          <div>
            <label className="block text-sm text-[#EAE0D5]/70 mb-2">Gender</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  className="w-4 h-4 text-[#B76E79] bg-[#0B0608]/60 border-[#B76E79]/20 focus:ring-[#B76E79]/40"
                />
                <span className="text-[#EAE0D5]">Female</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  className="w-4 h-4 text-[#B76E79] bg-[#0B0608]/60 border-[#B76E79]/20 focus:ring-[#B76E79]/40"
                />
                <span className="text-[#EAE0D5]">Male</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-[#EAE0D5]/70 mb-2">Telephone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] focus:outline-none focus:border-[#B76E79]/40"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
            >
              {saving ? 'Updating...' : 'UPDATE'}
            </button>
            <button
              onClick={() => setFormData({
                first_name: user?.first_name || '',
                last_name: user?.last_name || '',
                email: user?.email || '',
                phone: user?.phone || '',
              })}
              className="px-8 py-3 border border-[#B76E79]/20 text-[#EAE0D5]/70 rounded-lg hover:border-[#B76E79]/40 hover:text-[#EAE0D5] transition-colors font-medium"
            >
              RESTORE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
