// lib/store.js
import { configureStore } from '@reduxjs/toolkit';
import darkModeReducer from './darkModeSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
    cart: cartReducer,
  },
});