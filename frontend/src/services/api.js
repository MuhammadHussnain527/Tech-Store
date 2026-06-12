const BASE = import.meta.env.VITE_API_BASE || '';

export function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE}${url.startsWith('/') ? url : '/' + url}`;
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }
  return json;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login:          (email, password) => request('/login',           { method: 'POST', body: JSON.stringify({ email, password }) }),
  register:       (data)            => request('/register',        { method: 'POST', body: JSON.stringify(data) }),
  logout:         ()                => request('/logout',          { method: 'POST' }),
  session:        ()                => request('/session'),
  forgotPassword: (email, newPassword) => request('/forgot-password', { method: 'POST', body: JSON.stringify({ email, newPassword }) }),
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const profileApi = {
  get:            ()     => request('/profile'),
  update:         (data) => request('/profile',          { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => request('/profile/password', { method: 'PUT', body: JSON.stringify(data) }),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productApi = {
  getAll:      (params = {}) => request(`/products?${new URLSearchParams(params)}`),
  getById:     (id)          => request(`/products?id=${id}`),
  search:      (keyword)     => request(`/products?search=${encodeURIComponent(keyword)}`),
  byCategory:  (categoryId)  => request(`/products?categoryId=${categoryId}`),
};

// ─── Ratings ─────────────────────────────────────────────────────────────────
export const ratingApi = {
  getByProduct: (productId)           => request(`/products/${productId}/ratings`),
  submit:       (productId, data)    => request(`/products/${productId}/ratings`, { method: 'POST', body: JSON.stringify(data) }),
  update:       (productId, data)    => request(`/products/${productId}/ratings`, { method: 'PUT',  body: JSON.stringify(data) }),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll:  ()    => request('/categories'),
  getById: (id)  => request(`/categories?id=${id}`),
};

// ─── Cart ────────────────────────────────────────────────────────────────────
export const cartApi = {
  get:      ()                       => request('/cart'),
  add:      (productId, quantity)    => request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  update:   (productId, quantity)    => request('/cart', { method: 'PUT',  body: JSON.stringify({ productId, quantity }) }),
  remove:   (productId)              => request(`/cart?productId=${productId}`, { method: 'DELETE' }),
  clear:    ()                       => request('/cart', { method: 'DELETE' }),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderApi = {
  getMyOrders: ()       => request('/orders'),
  getById:     (id)     => request(`/orders?id=${id}`),
  place:       (data)   => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => request('/admin/dashboard'),

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${BASE}/admin/products/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || 'Upload failed');
    return json;
  },

  // Products
  getAllProducts:   ()        => request('/admin/products'),
  createProduct:   (data)    => request('/admin/products', { method: 'POST',   body: JSON.stringify(data) }),
  updateProduct:   (data)    => request('/admin/products', { method: 'PUT',    body: JSON.stringify(data) }),
  deleteProduct:   (id)      => request(`/admin/products?id=${id}`, { method: 'DELETE' }),
  updateDiscount:  (productId, percentage) => {
    const url = productId ? `/admin/products/discount?productId=${productId}&percentage=${percentage}` : `/admin/products/discount?percentage=${percentage}`;
    return request(url, { method: 'PUT' });
  },

  // Categories
  getAllCategories: ()        => request('/admin/categories'),
  createCategory:  (data)    => request('/admin/categories', { method: 'POST',   body: JSON.stringify(data) }),
  updateCategory:  (data)    => request('/admin/categories', { method: 'PUT',    body: JSON.stringify(data) }),
  deleteCategory:  (id)      => request(`/admin/categories?id=${id}`, { method: 'DELETE' }),

  // Orders
  getAllOrders:     ()        => request('/admin/orders'),
  updateStatus:    (orderId, status) =>
    request(`/admin/orders?orderId=${orderId}&status=${status}`, { method: 'PUT' }),

  // Wishlists
  getAllWishlists:  ()        => request('/admin/wishlists'),
};

// ─── Wishlist ────────────────────────────────────────────────────────────────
export const wishlistApi = {
  getWishlist:        () => request('/wishlist').then(r => r.data),
  addToWishlist:      (productId) => request('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }).then(r => r.data),
  removeFromWishlist: (productId) => request(`/wishlist?productId=${productId}`, { method: 'DELETE' }).then(r => r.data),
  checkWishlist:      (productId) => request(`/wishlist/check?productId=${productId}`).then(r => r.data),
};

// ─── Notifications ───────────────────────────────────────────────────────────
export const notificationApi = {
  getNotifications: () => request('/notifications').then(r => r.data),
  getUnreadCount:   () => request('/notifications/unread-count').then(r => r.data),
  markAsRead:       (id) => request(`/notifications/${id}/read`, { method: 'PUT' }).then(r => r.data),
  markAllAsRead:    () => request('/notifications/read-all', { method: 'PUT' }).then(r => r.data),
};
