// src/store/slices/shopSlice.js
import { createSlice } from '@reduxjs/toolkit';

const shopSlice = createSlice({
  name: 'shop',
  initialState: {
    myShop: null,
    loading: false,
    error: null,
  },
  reducers: {
    setShop: (state, action) => {
      state.myShop = action.payload;
    },
    updateShop: (state, action) => {
      state.myShop = { ...state.myShop, ...action.payload };
    },
    clearShop: (state) => {
      state.myShop = null;
    },
  },
});

export const { setShop, updateShop, clearShop } = shopSlice.actions;
export default shopSlice.reducer;
