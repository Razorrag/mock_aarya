/**
 * Admin API Client - Unified API calls for admin dashboard
 * Integrates with Admin Service (8004) and Commerce Service (8010)
 */

const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:8004';
const COMMERCE_BASE = process.env.NEXT_PUBLIC_COMMERCE_URL || 'http://localhost:8010';

// Helper to get auth token
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

// Base fetch with auth
async function adminFetch(url, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') 
    ? await response.json() 
    : await response.text();

  if (!response.ok) {
    const error = new Error(data?.detail || data?.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Build query string from params
function buildQuery(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}

// ==================== Dashboard API ====================
export const dashboardApi = {
  getOverview: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/dashboard/overview`),

  getRevenueAnalytics: (period = '30d') => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/analytics/revenue?period=${period}`),

  getCustomerAnalytics: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/analytics/customers`),

  getTopProducts: (period = '30d', limit = 10) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/analytics/products/top-selling?period=${period}&limit=${limit}`),

  getProductPerformance: (period = '30d', limit = 20) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/analytics/products/performance?period=${period}&limit=${limit}`),
};

// ==================== Orders API ====================
export const ordersApi = {
  list: (params = {}) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/orders?${buildQuery(params)}`),

  get: (id) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/orders/${id}`),

  updateStatus: (id, data) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  bulkUpdate: (data) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/orders/bulk-update`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==================== Users/Customers API ====================
export const usersApi = {
  list: (params = {}) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/users?${buildQuery(params)}`),

  get: (id) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/users/${id}`),

  updateStatus: (id, isActive) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    }),
};

// ==================== Products API ====================
export const productsApi = {
  list: (params = {}) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/products?${buildQuery(params)}`),

  get: (id) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/products/${id}`),

  create: (data) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/products/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== Categories API ====================
export const categoriesApi = {
  list: () => 
    adminFetch(`${COMMERCE_BASE}/api/v1/categories`),

  get: (id) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/categories/${id}`),

  create: (data) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/categories/${id}`, {
      method: 'DELETE',
    }),
};

// ==================== Inventory API ====================
export const inventoryApi = {
  getLowStock: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/inventory/low-stock`),

  getOutOfStock: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/inventory/out-of-stock`),

  addStock: (data) => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/inventory/add-stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adjustStock: (data) => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/inventory/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMovements: (params = {}) => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/inventory/movements?${buildQuery(params)}`),

  bulkUpdate: (data) => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/inventory/bulk-update`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==================== Chat API ====================
export const chatApi = {
  getRooms: (status = null) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/chat/rooms${status ? `?status=${status}` : ''}`),

  getMessages: (roomId) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/chat/rooms/${roomId}/messages`),

  sendMessage: (roomId, message, senderType = 'admin') => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, sender_type: senderType }),
    }),

  assignRoom: (roomId) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/chat/rooms/${roomId}/assign`, {
      method: 'PUT',
    }),

  closeRoom: (roomId) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/chat/rooms/${roomId}/close`, {
      method: 'PUT',
    }),
};

// ==================== Landing Config API ====================
export const landingApi = {
  getConfig: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/landing/config`),

  updateSection: (section, config, isActive = null) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/landing/config/${section}`, {
      method: 'PUT',
      body: JSON.stringify({ config, is_active: isActive }),
    }),

  getImages: (section = null) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/landing/images${section ? `?section=${section}` : ''}`),

  addImage: (data) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/landing/images`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadImage: async (file, section, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const params = new URLSearchParams({
      section,
      ...metadata.title && { title: metadata.title },
      ...metadata.subtitle && { subtitle: metadata.subtitle },
      ...metadata.link_url && { link_url: metadata.link_url },
      ...metadata.display_order && { display_order: metadata.display_order },
    });

    const token = getAuthToken();
    const response = await fetch(
      `${ADMIN_BASE}/api/v1/admin/landing/images/upload?${params}`,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.detail || 'Upload failed');
    }

    return response.json();
  },

  deleteImage: (imageId) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/landing/images/${imageId}`, {
      method: 'DELETE',
    }),
};

// ==================== Upload API ====================
export const uploadApi = {
  getPresignedUrl: (filename, folder = 'landing', contentType = 'image/jpeg') => 
    adminFetch(
      `${ADMIN_BASE}/api/v1/admin/upload/presigned-url?filename=${encodeURIComponent(filename)}&folder=${folder}&content_type=${contentType}`
    ),

  uploadImage: async (file, folder = 'landing') => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(
      `${ADMIN_BASE}/api/v1/admin/upload/image?folder=${folder}`,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data?.detail || 'Upload failed');
    }

    return response.json();
  },

  deleteImage: (imageUrl) => 
    adminFetch(`${ADMIN_BASE}/api/v1/admin/upload/image?image_url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE',
    }),
};

// ==================== Staff API ====================
export const staffApi = {
  getDashboard: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/dashboard`),

  getPendingOrders: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/orders/pending`),

  getProcessingOrders: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/orders/processing`),

  processOrder: (orderId, notes = '') => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/orders/${orderId}/process`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    }),

  shipOrder: (orderId, trackingNumber, notes = '') => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/orders/${orderId}/ship`, {
      method: 'PUT',
      body: JSON.stringify({ tracking_number: trackingNumber, notes }),
    }),

  bulkProcessOrders: (orderIds, notes = '') => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/orders/bulk-process`, {
      method: 'POST',
      body: JSON.stringify({ order_ids: orderIds, notes }),
    }),

  getTasks: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/tasks`),

  completeTask: (taskId, notes = '') => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  getNotifications: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/notifications`),

  markNotificationRead: (notifId) => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/notifications/${notifId}/read`, {
      method: 'PUT',
    }),

  getQuickActions: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/quick-actions`),

  getInventorySummary: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/reports/inventory/summary`),

  getProcessedOrdersReport: () => 
    adminFetch(`${ADMIN_BASE}/api/v1/staff/reports/orders/processed`),
};

// ==================== Returns API ====================
export const returnsApi = {
  // List all return requests with filters
  list: (params = {}) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/admin/returns?${buildQuery(params)}`),

  // Get return request details
  get: (id) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/returns/${id}`),

  // Approve return request
  approve: (id, refundAmount = null) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/admin/returns/${id}/approve?${refundAmount ? `refund_amount=${refundAmount}` : ''}`, {
      method: 'POST',
    }),

  // Reject return request
  reject: (id, reason) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/admin/returns/${id}/reject?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
    }),

  // Mark return item as received
  markReceived: (id, trackingNumber = null) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/admin/returns/${id}/receive?${trackingNumber ? `tracking_number=${encodeURIComponent(trackingNumber)}` : ''}`, {
      method: 'POST',
    }),

  // Process refund for return
  processRefund: (id, refundTransactionId) => 
    adminFetch(`${COMMERCE_BASE}/api/v1/admin/returns/${id}/refund?refund_transaction_id=${encodeURIComponent(refundTransactionId)}`, {
      method: 'POST',
    }),
};

// Export all APIs as a single object
export const adminApi = {
  dashboard: dashboardApi,
  orders: ordersApi,
  users: usersApi,
  products: productsApi,
  categories: categoriesApi,
  inventory: inventoryApi,
  chat: chatApi,
  landing: landingApi,
  upload: uploadApi,
  staff: staffApi,
  returns: returnsApi,
};

export default adminApi;
