import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// MOCK DATA FOR DEVELOPMENT
// This mock data simulates what would come from the API
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+2347012345678',
    email: 'john.doe@example.com',
    role: 'admin',
    organization: {
      id: '1',
      name: 'Acme Corporation'
    },
    state: 'Lagos',
    isActive: true,
    createdAt: '2024-05-10T12:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+2348023456789',
    email: 'jane.smith@example.com',
    role: 'operator',
    organization: {
      id: '1',
      name: 'Acme Corporation'
    },
    state: 'Abuja',
    isActive: true,
    createdAt: '2024-05-08T14:30:00Z'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    phone: '+2349034567890',
    email: 'michael.johnson@example.com',
    role: 'admin',
    organization: {
      id: '2',
      name: 'Globex Industries'
    },
    state: 'Rivers',
    isActive: true,
    createdAt: '2024-05-07T09:15:00Z'
  },
  {
    id: '4',
    name: 'Sarah Williams',
    phone: '+2347045678901',
    email: 'sarah.williams@example.com',
    role: 'operator',
    organization: {
      id: '2',
      name: 'Globex Industries'
    },
    state: 'Lagos',
    isActive: false,
    createdAt: '2024-05-05T16:45:00Z'
  },
  {
    id: '5',
    name: 'David Brown',
    phone: '+2348056789012',
    email: 'david.brown@example.com',
    role: 'operator',
    organization: {
      id: '3',
      name: 'Umbrella Corp'
    },
    state: 'Kaduna',
    isActive: true,
    createdAt: '2024-05-03T11:20:00Z'
  }
];

// Mock current user (used to exclude from the users list)
export const CURRENT_USER: User = {
  id: '6',
  name: 'Current Admin',
  phone: '+2349067890123',
  email: 'current.admin@example.com',
  role: 'admin',
  organization: {
    id: '1',
    name: 'Acme Corporation'
  },
  state: 'Lagos',
  isActive: true,
  createdAt: '2024-05-11T10:00:00Z' // Added createdAt property
};

// MOCK STATES
export const MOCK_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

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
  role: 'admin' | 'operator';
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
  role: 'admin' | 'operator';
  organizationId: string;
  state: string;
}

interface UserManagementState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// Initial state
const initialState: UserManagementState = {
  users: [],
  currentUser: CURRENT_USER, // For development
  isLoading: false,
  error: null,
  successMessage: null
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

      // UNCOMMENT THIS WHEN BACKEND IS READY
      /* 
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
      */
      
      // FOR DEVELOPMENT: Return mock data after simulating API delay
      return new Promise<User[]>((resolve) => {
        setTimeout(() => {
          resolve([...MOCK_USERS]);
        }, 800);
      });
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
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

      // UNCOMMENT THIS WHEN BACKEND IS READY
      /* 
      const response = await axios.post(`${API_URL}/users`, userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
      */
      
      // FOR DEVELOPMENT: Simulate API call and return a new user with mock data
      return new Promise<User>((resolve) => {
        setTimeout(() => {
          const newUser: User = {
            id: `${Math.floor(Math.random() * 1000) + 10}`, // Generate random ID
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            role: userData.role,
            organization: {
              id: userData.organizationId,
              // Find the organization name from mock data - this would come from API in real implementation
              name: MOCK_USERS.find(user => user.organization.id === userData.organizationId)?.organization.name || 'Unknown Organization'
            },
            state: userData.state,
            isActive: true,
            createdAt: new Date().toISOString()
          };
          resolve(newUser);
        }, 1000);
      });
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to add user');
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

      // UNCOMMENT THIS WHEN BACKEND IS READY
      /* 
      const response = await axios.patch(`${API_URL}/users/${userId}/status`, {
        isActive: !user.isActive
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
      */
      
      // FOR DEVELOPMENT: Simulate API call and return updated user
      return new Promise<{ userId: string, isActive: boolean }>((resolve) => {
        setTimeout(() => {
          resolve({
            userId,
            isActive: !user.isActive
          });
        }, 800);
      });
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
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
  }
});

export const { clearUserError, clearSuccessMessage } = userManagementSlice.actions;

export default userManagementSlice.reducer;