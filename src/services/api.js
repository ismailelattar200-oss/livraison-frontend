import axios from 'axios';

// Set up Axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.withCredentials = true; // Required for Sanctum CSRF

// Create an axios instance with /api prefix for admin/API calls
const apiInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api',
  withCredentials: true,
});

// Add auth token interceptor
apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Attach named convenience methods for public/auth API
const api = apiInstance;

// ── Public API (named methods) ───────────────────────────────
api.getCategories = () => apiInstance.get('/categories');
api.getMenuItems = (categoryId = null) => {
  const url = categoryId ? `/menu-items?category_id=${categoryId}` : '/menu-items';
  return apiInstance.get(url);
};
api.getGallery = () => apiInstance.get('/gallery');
api.getEvents = () => apiInstance.get('/events');

api.createOrder = (data) => apiInstance.post('/orders', data);
api.getOrder = (orderNumber) => apiInstance.get(`/orders/${orderNumber}`);

api.submitContact = (data) => apiInstance.post('/contact', data);
api.submitJobApplication = (data) => apiInstance.post('/job-applications', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// ── Auth ──────────────────────────────────────────────────────
api.login = (credentials) => {
    // Get CSRF cookie first for Sanctum
    return axios.get('/sanctum/csrf-cookie').then(() => {
        return apiInstance.post('/login', credentials);
    });
};
api.logout = (token) => apiInstance.post('/logout', {}, {
    headers: { Authorization: `Bearer ${token}` }
});
api.getUser = (token) => apiInstance.get('/user', {
    headers: { Authorization: `Bearer ${token}` }
});

api.updateAvatar = (formData) => apiInstance.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

api.deleteAvatar = () => apiInstance.delete('/user/avatar');

api.getUserOrders = () => apiInstance.get('/user/orders');
api.updateProfile = (data) => apiInstance.put('/user/profile', data);
api.updatePassword = (data) => apiInstance.put('/user/password', data);
api.deleteAccount = () => apiInstance.delete('/user');

// ── Admin ─────────────────────────────────────────────────────
api.getAdminStats = () => apiInstance.get('/admin/stats');
api.getDriverAlerts = () => apiInstance.get('/admin/driver-alerts');
api.getPerformanceAnalytics = () => apiInstance.get('/admin/performance-analytics');
api.getAiRecommendations = () => apiInstance.get('/admin/ai-recommendations');
api.getPromotions = () => apiInstance.get('/admin/promotions');
api.createPromotion = (data) => apiInstance.post('/admin/promotions', data);
api.getPromotionsSuggestions = () => apiInstance.get('/admin/promotions/ai-suggestions');
api.getLiveTracking = () => apiInstance.get('/admin/live-tracking');
api.getFeedbacks = () => apiInstance.get('/admin/feedbacks');
api.getFeedbacksAiSummary = () => apiInstance.get('/admin/feedbacks/ai-summary');
api.getRevenueAnalytics = () => apiInstance.get('/admin/revenue-analytics');

// ── Delivery AI Agent ──────────────────────────────────────────
api.getDeliveryUnifiedDashboard = () => apiInstance.get('/delivery/unified-dashboard');
api.acceptDeliveryOrder = (id) => apiInstance.post(`/delivery/orders/${id}/accept`);
api.rejectDeliveryOrder = (id) => apiInstance.post(`/delivery/orders/${id}/reject`);
api.updateDeliveryStatus = (id, status) => apiInstance.put(`/delivery/orders/${id}/status`, { status });

export default api;
