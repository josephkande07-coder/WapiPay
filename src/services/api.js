import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://192.168.1.145:3000/api';

let authToken = null;

export const loadToken = async () => {
  try {
    const token = await SecureStore.getItemAsync('wapipay_token');
    if (token) authToken = token;
  } catch (e) {
    console.log('Erreur chargement token:', e);
  }
};

export const saveToken = async (token) => {
  try {
    authToken = token;
    await SecureStore.setItemAsync('wapipay_token', token);
  } catch (e) {
    console.log('Erreur sauvegarde token:', e);
  }
};

export const removeToken = async () => {
  try {
    authToken = null;
    await SecureStore.deleteItemAsync('wapipay_token');
  } catch (e) {
    console.log('Erreur suppression token:', e);
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    let token = authToken;
    if (!token) {
      try {
        token = await SecureStore.getItemAsync('wapipay_token');
        if (token) authToken = token;
      } catch (e) {}
    }
    if (token) config.headers.Authorization = 'Bearer ' + token;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => Promise.reject(error.response?.data || error)
);

export const authAPI = {
  sendOTP:   (phone)          => api.post('/auth/send-otp',   { phone }),
  verifyOTP: (phone, otp)     => api.post('/auth/verify-otp', { phone, otp }),
  register:  (data)           => api.post('/auth/register',   data),
  login:     (phone, pin)     => api.post('/auth/login',      { phone, pin }),
  setPin:    (pin)            => api.post('/auth/set-pin',    { pin }),
  changePin: (oldPin, newPin) => api.post('/auth/change-pin', { oldPin, newPin }),
  getMe:     ()                => api.get('/auth/me'),
  updateMe:  (data)           => api.put('/auth/me', data),
};

export const shopsAPI = {
  getAll:      (params) => api.get('/shops', { params }),
  getFeatured: ()       => api.get('/shops/featured'),
  getById:     (id)     => api.get('/shops/' + id),
  getMyShop:   ()       => api.get('/shops/me'),
  create:      (data)   => api.post('/shops', data),
  update:      (id, d)  => api.put('/shops/' + id, d),
  uploadKYC:   (data)   => api.post('/shops/kyc/upload', data),
  getReviews:  (id)     => api.get('/shops/' + id + '/reviews'),
  getProducts: (id)     => api.get('/shops/' + id + '/products'),
};

export const productsAPI = {
  search:  (params)   => api.get('/products/search', { params }),
  getById: (id)       => api.get('/products/' + id),
  create:  (data)     => api.post('/products', data),
  update:  (id, data) => api.put('/products/' + id, data),
  delete:  (id)       => api.delete('/products/' + id),
};

export const ordersAPI = {
  create:              (data)       => api.post('/orders', data),
  getMyOrders:         ()           => api.get('/orders/mine'),
  getShopOrders:       ()           => api.get('/orders/shop'),
  getShopStats:        (period)     => api.get('/orders/shop/stats', { params: { period } }),
  getShopNotifications: ()          => api.get('/orders/shop/notifications'),
  getById:             (id)         => api.get('/orders/' + id),
  updateStatus:        (id, status) => api.put('/orders/' + id + '/status', { status }),
  addReview:           (id, data)   => api.post('/orders/' + id + '/review', data),
};

export const paymentsAPI = {
  initiate:        (data) => api.post('/payments/initiate', data),
  getStatus:       (id)   => api.get('/payments/' + id + '/status'),
  paySubscription: (data) => api.post('/payments/subscription', data),
  withdraw:        (data) => api.post('/payments/withdraw', data),
};

export default api;