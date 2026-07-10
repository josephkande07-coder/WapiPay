// src/store/slices/cartSlice.js
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    shopId: null,
    shopName: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, shopId, shopName } = action.payload;
      // Si panier d'une autre boutique → vider d'abord
      if (state.shopId && state.shopId !== shopId) {
        state.items = [];
      }
      state.shopId = shopId;
      state.shopName = shopName;
      const existing = state.items.find(i => i.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...product, quantity: 1 });
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      if (state.items.length === 0) {
        state.shopId = null;
        state.shopName = null;
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i.id === id);
      if (item) {
        item.quantity = quantity;
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.id !== id);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.shopId = null;
      state.shopName = null;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Sélecteurs
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export default cartSlice.reducer;
