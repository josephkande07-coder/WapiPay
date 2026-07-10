// src/services/api.js
// 🔌 Service API — WapiPay Backend

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚠️ Remplace par l'URL de ton backend déployé
const BASE_URL = 'https://api.wapipay.cd/v1';
// Pour tester en local : 'http://192.168.X.X:3000/v1'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ── Intercepteur : ajoute le token JWT automatiquement ──
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('wapipay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Intercepteur : gère les erreurs globalement ──
api.interceptors.response.use(
  response => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré → déconnexion
      await SecureStore.deleteItemAsync('wapipay_token');
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ════════════════════════════════════════
// AUTH
// ════════════════════════════════════════
export const authAPI = {
  sendOTP:    (phone) => api.post('/auth/send-otp', { phone }),
  verifyOTP:  (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  register:   (data) => api.post('/auth/register', data),
  login:      (phone, pin) => api.post('/auth/login', { phone, pin }),
  setPin:     (pin) => api.post('/auth/set-pin', { pin }),
};

// ════════════════════════════════════════
// BOUTIQUES
// ════════════════════════════════════════
export const shopsAPI = {
  getAll:       (params) => api.get('/shops', { params }),
  getById:      (id) => api.get(`/shops/${id}`),
  getFeatured:  () => api.get('/shops/featured'),
  create:       (data) => api.post('/shops', data),
  update:       (id, data) => api.put(`/shops/${id}`, data),
  uploadIdDoc:  (formData) => api.post('/shops/kyc/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyShop:    () => api.get('/shops/me'),
};

// ════════════════════════════════════════
// PRODUITS
// ════════════════════════════════════════
export const productsAPI = {
  getByShop:  (shopId) => api.get(`/shops/${shopId}/products`),
  getById:    (id)     => api.get(`/products/${id}`),
  create:     (data)   => api.post('/products', data),
  update:     (id, d)  => api.put(`/products/${id}`, d),
  delete:     (id)     => api.delete(`/products/${id}`),
  search:     (q)      => api.get('/products/search', { params: { q } }),
};

// ════════════════════════════════════════
// COMMANDES
// ════════════════════════════════════════
export const ordersAPI = {
  create:       (data) => api.post('/orders', data),
  getMyOrders:  () => api.get('/orders/mine'),
  getById:      (id)   => api.get(`/orders/${id}`),
  getShopOrders:() => api.get('/orders/shop'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ════════════════════════════════════════
// PAIEMENTS
// ════════════════════════════════════════
export const paymentsAPI = {
  initiate: (orderId, method, phone, pin) =>
    api.post('/payments/initiate', { orderId, method, phone, pin }),
  getStatus: (txnId) => api.get(`/payments/${txnId}/status`),
  // Abonnement marchand
  paySubscription: (shopId, plan, method, phone) =>
    api.post('/payments/subscription', { shopId, plan, method, phone }),
};

// ════════════════════════════════════════
// AVIS
// ════════════════════════════════════════
export const reviewsAPI = {
  create:    (orderId, rating, comment) =>
    api.post('/reviews', { orderId, rating, comment }),
  getByShop: (shopId) => api.get(`/shops/${shopId}/reviews`),
};

export default api;

