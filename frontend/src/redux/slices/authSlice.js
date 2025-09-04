import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { register, login, updateUserProfile } from '../../services/api';

// Helper function to check token expiration
const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch (error) {
        return false;
    }
};

// Thunk: Cập nhật hồ sơ người dùng
export const updateUserProfileAsync = createAsyncThunk(
    'auth/updateUserProfile',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await updateUserProfile(userData); // API PUT
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Update failed');
        }
    }
);

// Thunk: Đăng ký
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await register(userData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Registration failed');
        }
    }
);

// Thunk: Đăng nhập
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await login(credentials);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

// Lấy trạng thái ban đầu từ localStorage
const getInitialState = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    return {
        user: user ? JSON.parse(user) : null,
        token: token,
        isAuthenticated: token ? isTokenValid(token) : false,
        loading: false,
        error: null,
        lastActivity: localStorage.getItem('lastActivity') || null
    };
};

// Slice chính
const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialState(),
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('lastActivity');
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        setLastActivity: (state) => {
            state.lastActivity = new Date().toISOString();
            localStorage.setItem('lastActivity', state.lastActivity);
        }
    },
    extraReducers: (builder) => {
        builder
            // Đăng ký
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                localStorage.setItem('lastActivity', new Date().toISOString());

                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.lastActivity = new Date().toISOString();
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Đăng nhập
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                localStorage.setItem('lastActivity', new Date().toISOString());

                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.lastActivity = new Date().toISOString();
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Cập nhật hồ sơ
            .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            });
    }
});

// Tự động đăng xuất nếu không hoạt động
export const checkAuthTimeout = () => (dispatch, getState) => {
    const { lastActivity } = getState().auth;
    if (!lastActivity) return;

    const inactivePeriod = 30 * 60 * 1000; // 30 phút
    const now = new Date();
    const lastActiveTime = new Date(lastActivity);

    if (now - lastActiveTime > inactivePeriod) {
        dispatch(logout());
    }
};

// Export các action và reducer
export const { logout, clearError, setUser, setLastActivity } = authSlice.actions;
export default authSlice.reducer;
