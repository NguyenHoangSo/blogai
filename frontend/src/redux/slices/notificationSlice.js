import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            if (!action.payload) return;

            // Ensure notifications is an array
            if (!Array.isArray(state.notifications)) {
                state.notifications = [];
            }

            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        setNotification: (state, action) => {
            // Ensure we have an array of notifications
            const notifications = Array.isArray(action.payload) ? action.payload : [];

            state.notifications = notifications;
            state.unreadCount = notifications.filter(n => n && !n.read).length;
        },
        markAsRead: (state, action) => {
            if (!action.payload) return;

            // Ensure notifications is an array
            if (!Array.isArray(state.notifications)) {
                state.notifications = [];
                return;
            }

            const notification = state.notifications.find(n => n && n.id === action.payload);
            if (notification) {
                notification.read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
});

export const { addNotification, setNotification, markAsRead, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer; 