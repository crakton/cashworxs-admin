import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// MOCK DATA FOR DEVELOPMENT
// This mock data simulates what would come from the API
const MOCK_IDENTITY_TYPES = [
  { 
    id: 1, 
    type: 'Org ID', 
    description: 'Organization Identification Number',
    isCompulsory: true,
    isActive: true
  },
  { 
    id: 2, 
    type: 'NIN', 
    description: 'National Identification Number',
    isCompulsory: false,
    isActive: true
  },
  { 
    id: 3, 
    type: 'BVN', 
    description: 'Bank Verification Number',
    isCompulsory: true,
    isActive: true
  },
  { 
    id: 4, 
    type: 'Email', 
    description: 'Email Address',
    isCompulsory: true,
    isActive: true
  },
  { 
    id: 5, 
    type: 'Address', 
    description: 'Physical Address',
    isCompulsory: false,
    isActive: true
  },
  { 
    id: 6, 
    type: 'Phone', 
    description: 'Phone Number',
    isCompulsory: true,
    isActive: true
  },
  { 
    id: 7, 
    type: 'Passport', 
    description: 'International Passport Number',
    isCompulsory: false,
    isActive: false
  },
  { 
    id: 8, 
    type: 'TIN', 
    description: 'Tax Identification Number',
    isCompulsory: false,
    isActive: false
  }
];

// Types
export interface IdentityType {
  id: number;
  type: string;
  description: string;
  isCompulsory: boolean;
  isActive: boolean;
}

export interface IdentityConfigState {
  identityTypes: IdentityType[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// Initial state
const initialState: IdentityConfigState = {
  identityTypes: [],
  isLoading: false,
  error: null,
  successMessage: null
};

// Async thunks
export const fetchIdentityConfig = createAsyncThunk(
  'identityConfig/fetchAll',
   async (organizationId: string, { rejectWithValue }) =>  {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      // UNCOMMENT THIS WHEN BACKEND IS READY
      /* 
      const response = await axios.get(`${API_URL}/platforms/identity-config`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
      */
      
      // FOR DEVELOPMENT: Return mock data after simulating API delay
      return new Promise<IdentityType[]>((resolve) => {
        setTimeout(() => {
          resolve([...MOCK_IDENTITY_TYPES]);
        }, 800);
      });
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to fetch identity configuration');
    }
  }
);

export const updateIdentityConfig = createAsyncThunk(
  'identityConfig/update',
 async ({ organizationId, configData }: { organizationId: string, configData: IdentityType[] }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      // UNCOMMENT THIS WHEN BACKEND IS READY
      /* 
      const response = await axios.put(`${API_URL}/platforms/identity-config`, { identityTypes: configData }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.data;
      */
      
      // FOR DEVELOPMENT: Return the updated data after simulating API delay
      return new Promise<IdentityType[]>((resolve) => {
        setTimeout(() => {
          resolve([...configData]);
        }, 1000);
      });
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to update identity configuration');
    }
  }
);

// Identity config slice
const identityConfigSlice = createSlice({
  name: 'identityConfig',
  initialState,
  reducers: {
    clearIdentityConfigError: state => {
      state.error = null;
    },
    clearSuccessMessage: state => {
      state.successMessage = null;
    }
  },
  extraReducers: builder => {
    // Fetch identity config
    builder.addCase(fetchIdentityConfig.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchIdentityConfig.fulfilled, (state, action) => {
      state.isLoading = false;
      state.identityTypes = action.payload;
      state.error = null;
    });
    builder.addCase(fetchIdentityConfig.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update identity config
    builder.addCase(updateIdentityConfig.pending, state => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(updateIdentityConfig.fulfilled, (state, action) => {
      state.isLoading = false;
      state.identityTypes = action.payload;
      state.successMessage = 'Identity configuration updated successfully';
      state.error = null;
    });
    builder.addCase(updateIdentityConfig.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.successMessage = null;
    });
  }
});

export const { clearIdentityConfigError, clearSuccessMessage } = identityConfigSlice.actions;

export default identityConfigSlice.reducer;