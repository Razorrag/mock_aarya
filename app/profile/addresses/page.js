'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Phone, Edit2, Trash2, X, Check } from 'lucide-react';
import { addressesApi } from '@/lib/customerApi';

// Mock addresses
const MOCK_ADDRESSES = [
  {
    id: 1,
    name: 'Home',
    full_name: 'Priya Sharma',
    phone: '+91 98765 43210',
    address_line1: '123, MG Road',
    address_line2: 'Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    is_default: true,
  },
  {
    id: 2,
    name: 'Office',
    full_name: 'Priya Sharma',
    phone: '+91 98765 43210',
    address_line1: '456, Tech Park',
    address_line2: 'Electronic City',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560100',
    is_default: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      
      try {
        const data = await addressesApi.list();
        setAddresses(data.addresses || data || MOCK_ADDRESSES);
      } catch (apiError) {
        console.log('Using mock addresses');
        setAddresses(MOCK_ADDRESSES);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      full_name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      pincode: '',
      is_default: false,
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowAddForm(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (editingId) {
        // Update existing
        try {
          const data = await addressesApi.update(editingId, formData);
          setAddresses(prev => prev.map(a => a.id === editingId ? (data.address || data) : a));
        } catch (apiError) {
          setAddresses(prev => prev.map(a => a.id === editingId ? { ...formData, id: editingId } : a));
        }
      } else {
        // Create new
        try {
          const data = await addressesApi.create(formData);
          setAddresses(prev => [...prev, data.address || data]);
        } catch (apiError) {
          const newAddress = { ...formData, id: Date.now() };
          setAddresses(prev => [...prev, newAddress]);
        }
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      try {
        await addressesApi.delete(id);
      } catch (apiError) {
        // Delete locally anyway
      }
      setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      try {
        await addressesApi.setDefault(id);
      } catch (apiError) {
        // Update locally anyway
      }
      setAddresses(prev => prev.map(a => ({
        ...a,
        is_default: a.id === id,
      })));
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#F2C29A]">My Addresses</h2>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="p-6 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-[#F2C29A]">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button onClick={resetForm} className="text-[#EAE0D5]/50 hover:text-[#EAE0D5]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#EAE0D5]/70 mb-1">Address Name</label>
              <input
                type="text"
                placeholder="Home, Office, etc."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
            </div>
            <div>
              <label className="block text-sm text-[#EAE0D5]/70 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
            </div>
            <div>
              <label className="block text-sm text-[#EAE0D5]/70 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
            </div>
            <div>
              <label className="block text-sm text-[#EAE0D5]/70 mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[#EAE0D5]/70 mb-1">Address Line 1</label>
              <input
                type="text"
                value={formData.address_line1}
                onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[#EAE0D5]/70 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={formData.address_line2}
                onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
            </div>
            <div>
              <label className="block text-sm text-[#EAE0D5]/70 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
            </div>
            <div>
              <label className="block text-sm text-[#EAE0D5]/70 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#0B0608]/60 border border-[#B76E79]/20 rounded-lg text-[#EAE0D5] placeholder-[#EAE0D5]/40 focus:outline-none focus:border-[#B76E79]/40"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
              className="w-4 h-4 rounded border-[#B76E79]/30 bg-[#0B0608]/60 text-[#B76E79] focus:ring-[#B76E79]/30"
            />
            <label htmlFor="is_default" className="text-sm text-[#EAE0D5]/70">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Address'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 border border-[#B76E79]/20 text-[#EAE0D5]/70 rounded-xl hover:border-[#B76E79]/40 hover:text-[#EAE0D5] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-[#B76E79]/10 rounded-2xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-8 bg-[#0B0608]/40 backdrop-blur-md border border-[#B76E79]/15 rounded-2xl text-center">
          <MapPin className="w-16 h-16 text-[#B76E79]/30 mx-auto mb-4" />
          <p className="text-[#EAE0D5]/50">No addresses saved yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-[#7A2F57] to-[#B76E79] text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 bg-[#0B0608]/40 backdrop-blur-md border rounded-2xl ${
                address.is_default ? 'border-[#B76E79]' : 'border-[#B76E79]/15'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#F2C29A]">{address.name}</span>
                  {address.is_default && (
                    <span className="px-2 py-0.5 bg-[#7A2F57]/30 text-[#F2C29A] text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-1.5 text-[#EAE0D5]/50 hover:text-[#B76E79] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-1.5 text-[#EAE0D5]/50 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-[#EAE0D5]">{address.full_name}</p>
                <p className="text-[#EAE0D5]/70">
                  {address.address_line1}
                  {address.address_line2 && `, ${address.address_line2}`}
                </p>
                <p className="text-[#EAE0D5]/70">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="text-[#EAE0D5]/70 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {address.phone}
                </p>
              </div>

              {!address.is_default && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-3 text-sm text-[#B76E79] hover:text-[#F2C29A] transition-colors"
                >
                  Set as default
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
