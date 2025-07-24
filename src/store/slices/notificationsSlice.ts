import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'admin' | 'state' | 'personal';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  sender: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
  stateInfo?: {
    id: string;
    name: string;
  };
  metadata?: any;
  scheduled_at?: string;
  created_at: string;
}

export interface NewNotification {
  title: string;
  message: string;
  type: 'admin' | 'state' | 'personal';
  state_id?: string;
  user_id?: string;
  metadata?: any;
  scheduled_at?: string;
}

interface NotificationState {
  notifications: Notification[];
  userNotifications: Notification[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  availableStates: any[];
  users: any[];
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  userNotifications: [],
  isLoading: false,
  error: null,
  successMessage: null,
  availableStates: [],
  users: []
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUserNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/notifications/user/my-notifications`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user notifications');
    }
  }
);

export const sendNotification = createAsyncThunk(
  'notifications/sendNotification',
  async (notificationData: NewNotification, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/notifications`, notificationData, {
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        return rejectWithValue(errorMessages);
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to send notification');
    }
  }
);

export const fetchAvailableStates = createAsyncThunk(
  'notifications/fetchAvailableStates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/roles/users/states`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available states');
    }
  }
);

export const fetchUsersForNotification = createAsyncThunk(
  'notifications/fetchUsersForNotification',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/roles/users`, {
        headers: getAuthHeaders()
      });
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/notifications/user/${notificationId}/mark-read`,
        {},
        { headers: getAuthHeaders() }
      );
      return { notificationId, success: response.data.success };
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

// Notification slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError: state => {
      state.error = null;
    },
    clearNotificationSuccess: state => {
      state.successMessage = null;
    }
  },
  extraReducers: builder => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch user notifications
    builder.addCase(fetchUserNotifications.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUserNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userNotifications = action.payload;
    });
    builder.addCase(fetchUserNotifications.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Send notification
    builder.addCase(sendNotification.pending, state => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(sendNotification.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = action.payload.message;
      state.notifications.unshift(action.payload.data);
    });
    builder.addCase(sendNotification.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch available states
    builder.addCase(fetchAvailableStates.fulfilled, (state, action) => {
      state.availableStates = action.payload;
    });

    // Fetch users for notification
    builder.addCase(fetchUsersForNotification.fulfilled, (state, action) => {
      state.users = action.payload;
    });

    // Mark notification as read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const notification = state.userNotifications.find(n => n.id === action.payload.notificationId);
      if (notification) {
        // notification.read_at = new Date().toISOString();
      }
    });
  }
});

export const { clearNotificationError, clearNotificationSuccess } = notificationsSlice.actions;

export default notificationsSlice.reducer;