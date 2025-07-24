import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface Organization {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'admin' | 'operator' | 'irs_specialist';
  organization: Organization;
  state: string;
  isActive: boolean;
  createdAt: string;
}

export interface NewUser {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: 'admin' | 'operator' | 'irs_specialist';
  organizationId: string;
  state: string;
}

interface UserManagementState {
  users: User[];
  currentUser: User | null;
  availableStates: string[];
  availableRoles: string[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// Initial state
const initialState: UserManagementState = {
  users: [],
  currentUser: null,
  availableStates: [],
  availableRoles: [],
  isLoading: false,
  error: null,
  successMessage: null
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
export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

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

export const addUser = createAsyncThunk(
  'userManagement/addUser',
  async (userData: NewUser, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(`${API_URL}/roles/users`, userData, {
        headers: getAuthHeaders()
      });
      
      return response.data.data;
      
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

      return rejectWithValue(error.response?.data?.message || 'Failed to add user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ userId, userData }: { userId: string; userData: Partial<NewUser> }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(`${API_URL}/roles/users/${userId}`, userData, {
        headers: getAuthHeaders()
      });
      
      return response.data.data;
      
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

      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'userManagement/toggleUserStatus',
  async (userId: string, { rejectWithValue, getState }: any) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      // Get the current user from state
      const state = getState();
      const user = state.userManagement.users.find((u: User) => u.id === userId);
      
      if (!user) {
        return rejectWithValue('User not found');
      }

      const response = await axios.patch(`${API_URL}/roles/users/${userId}/status`, {
        isActive: !user.isActive
      }, {
        headers: getAuthHeaders()
      });
      
      return response.data.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      await axios.delete(`${API_URL}/roles/users/${userId}`, {
        headers: getAuthHeaders()
      });
      
      return userId;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const fetchStates = createAsyncThunk(
  'userManagement/fetchStates',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`${API_URL}/roles/users/states`, {
        headers: getAuthHeaders()
      });
      
      return response.data.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to fetch states');
    }
  }
);

export const fetchAvailableRoles = createAsyncThunk(
  'userManagement/fetchAvailableRoles',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`${API_URL}/roles`, {
        headers: getAuthHeaders()
      });
      
      return response.data.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
        return rejectWithValue('Authentication failed');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available roles');
    }
  }
);

// User management slice
const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearUserError: state => {
      state.error = null;
    },
    clearSuccessMessage: state => {
      state.successMessage = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    }
  },
  extraReducers: builder => {
    // Fetch users
    builder.addCase(fetchUsers.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload;
      state.error = null;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add user
    builder.addCase(addUser.pending, state => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(addUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users.push(action.payload);
      state.successMessage = 'User added successfully';
      state.error = null;
    });
    builder.addCase(addUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.successMessage = null;
    });

    // Update user
    builder.addCase(updateUser.pending, state => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
      state.successMessage = 'User updated successfully';
      state.error = null;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.successMessage = null;
    });

    // Toggle user status
    builder.addCase(toggleUserStatus.pending, state => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(toggleUserStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      const { userId, isActive } = action.payload;
      const user = state.users.find(u => u.id === userId);
      if (user) {
        user.isActive = isActive;
      }
      state.successMessage = `User status updated successfully`;
      state.error = null;
    });
    builder.addCase(toggleUserStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.successMessage = null;
    });

    // Delete user
    builder.addCase(deleteUser.pending, state => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = state.users.filter(u => u.id !== action.payload);
      state.successMessage = 'User deleted successfully';
      state.error = null;
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.successMessage = null;
    });

    // Fetch states
    builder.addCase(fetchStates.fulfilled, (state, action) => {
      state.availableStates = action.payload;
    });

    // Fetch available roles
    builder.addCase(fetchAvailableRoles.fulfilled, (state, action) => {
      state.availableRoles = action.payload;
    });
  }
});

export const { clearUserError, clearSuccessMessage, setCurrentUser } = userManagementSlice.actions;

export default userManagementSlice.reducer;
