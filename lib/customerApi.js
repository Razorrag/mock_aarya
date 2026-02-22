/**
 * Customer API Client - Unified API calls for customer-facing pages
 * Integrates with Commerce Service (8010), Core Service (8001), and Payment Service (8020)
 */

const COMMERCE_BASE = process.env.NEXT_PUBLIC_COMMERCE_URL || 'http://localhost:8010';
const CORE_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const PAYMENT_BASE = process.env.NEXT_PUBLIC_PAYMENT_URL || 'http://localhost:8020';

// Helper to get auth token
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

// Base fetch with auth
async function customerFetch(url, options = {}) {
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

// ==================== Products API ====================
export const productsApi = {
  list: (params = {}) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/products?${buildQuery(params)}`),

  get: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/products/${id}`),

  getBySlug: (slug) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/products/slug/${slug}`),

  getFeatured: (limit = 8) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/products/featured?limit=${limit}`),

  getNewArrivals: (limit = 8) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/products/new-arrivals?limit=${limit}`),

  search: (query, params = {}) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/products/search?q=${encodeURIComponent(query)}&${buildQuery(params)}`),
};

// ==================== Categories API ====================
export const categoriesApi = {
  list: () => 
    customerFetch(`${COMMERCE_BASE}/api/v1/categories`),

  get: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/categories/${id}`),

  getBySlug: (slug) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/categories/slug/${slug}`),

  getTree: () => 
    customerFetch(`${COMMERCE_BASE}/api/v1/categories/tree`),
};

// ==================== Cart API ====================
export const cartApi = {
  get: () => 
    customerFetch(`${COMMERCE_BASE}/api/v1/cart`),

  addItem: (productId, quantity = 1, variantId = null) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/cart/items`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity, variant_id: variantId }),
    }),

  updateItem: (itemId, quantity) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (itemId) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/cart/items/${itemId}`, {
      method: 'DELETE',
    }),

  clear: () => 
    customerFetch(`${COMMERCE_BASE}/api/v1/cart`, {
      method: 'DELETE',
    }),

  applyCoupon: (code) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/cart/coupon`, {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  removeCoupon: () => 
    customerFetch(`${COMMERCE_BASE}/api/v1/cart/coupon`, {
      method: 'DELETE',
    }),
};

// ==================== Orders API ====================
export const ordersApi = {
  create: (data) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (params = {}) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/orders?${buildQuery(params)}`),

  get: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/orders/${id}`),

  cancel: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/orders/${id}/cancel`, {
      method: 'POST',
    }),

  track: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/orders/${id}/tracking`),
};

// ==================== Addresses API ====================
export const addressesApi = {
  list: () => 
    customerFetch(`${COMMERCE_BASE}/api/v1/addresses`),

  get: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/addresses/${id}`),

  create: (data) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/addresses/${id}`, {
      method: 'DELETE',
    }),

  setDefault: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/addresses/${id}/default`, {
      method: 'PUT',
    }),
};

// ==================== Wishlist API ====================
export const wishlistApi = {
  get: () => 
    customerFetch(`${COMMERCE_BASE}/api/v1/wishlist`),

  add: (productId) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/wishlist/items`, {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    }),

  remove: (productId) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/wishlist/items/${productId}`, {
      method: 'DELETE',
    }),

  check: (productId) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/wishlist/check/${productId}`),
};

// ==================== Reviews API ====================
export const reviewsApi = {
  list: (productId, params = {}) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/products/${productId}/reviews?${buildQuery(params)}`),

  create: (productId, data) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (reviewId, data) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (reviewId) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
};

// ==================== User Profile API ====================
export const userApi = {
  getProfile: () => 
    customerFetch(`${CORE_BASE}/api/v1/users/me`),

  updateProfile: (data) => 
    customerFetch(`${CORE_BASE}/api/v1/users/me`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data) => 
    customerFetch(`${CORE_BASE}/api/v1/users/me/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ==================== Payment API ====================
export const paymentApi = {
  createOrder: (orderId) => 
    customerFetch(`${PAYMENT_BASE}/api/v1/payments/create-order`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    }),

  verify: (data) => 
    customerFetch(`${PAYMENT_BASE}/api/v1/payments/verify`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMethods: () => 
    customerFetch(`${PAYMENT_BASE}/api/v1/payments/methods`),
};

// ==================== Promotions API ====================
export const promotionsApi = {
  validate: (code, subtotal) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/promotions/validate`, {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    }),
};

// ==================== Returns API ====================
export const returnsApi = {
  // Create a new return/exchange request
  create: (orderId, data) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/returns`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, ...data }),
    }),

  // List user's return requests
  list: (params = {}) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/returns?${buildQuery(params)}`),

  // Get return request details
  get: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/returns/${id}`),

  // Cancel a return request
  cancel: (id) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/returns/${id}/cancel`, {
      method: 'POST',
    }),

  // Get return eligibility for an order
  getEligibility: (orderId) => 
    customerFetch(`${COMMERCE_BASE}/api/v1/returns/eligibility/${orderId}`),

  // Upload return images
  uploadImages: async (returnId, files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const token = getAuthToken();
    const response = await fetch(
      `${COMMERCE_BASE}/api/v1/returns/${returnId}/images`,
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
};

// Export all APIs as a single object
export const customerApi = {
  products: productsApi,
  categories: categoriesApi,
  cart: cartApi,
  orders: ordersApi,
  addresses: addressesApi,
  wishlist: wishlistApi,
  reviews: reviewsApi,
  user: userApi,
  payment: paymentApi,
  promotions: promotionsApi,
  returns: returnsApi,
};

export default customerApi;
