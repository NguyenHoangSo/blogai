import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './slices/notificationSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        notification: notificationReducer,
        auth: authReducer,
    },
}); 