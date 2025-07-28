import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types based on your PHP controller structure
export interface IdConfig {
  id: number;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'number' | 'email' | 'phone' | 'file';
  is_required: boolean;
  validation_rules?: string | null;
  help_text?: string | null;
  is_active: boolean;
  sort_order: number;
  organization_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Organization {
  id: number;
  name: string;
}

export interface FieldType {
  [key: string]: string;
}

export interface IdentityConfigState {
  idConfigs: IdConfig[];
  organization: Organization | null;
  fieldTypes: FieldType;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// Initial state
const initialState: IdentityConfigState = {
  idConfigs: [],
  organization: null,
  fieldTypes: {},
  isLoading: false,
  error: null,
  successMessage: null
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = Cookies.get('auth_token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Async thunks
export const fetchIdConfigs = createAsyncThunk(
  'identityConfig/fetchAll',
  async (organizationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/organizations/${organizationId}/id-configs`,
        getAuthHeaders()
      );
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ID configurations');
    }
  }
);

export const createIdConfig = createAsyncThunk(
  'identityConfig/create',
  async ({ organizationId, configData }: { organizationId: string, configData: Partial<IdConfig> }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/organizations/${organizationId}/id-configs`,
        configData,
        getAuthHeaders()
      );
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to create ID configuration');
    }
  }
);

export const updateIdConfig = createAsyncThunk(
  'identityConfig/update',
  async ({ organizationId, configId, configData }: { 
    organizationId: string, 
    configId: number, 
    configData: Partial<IdConfig> 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/organizations/${organizationId}/id-configs/${configId}`,
        configData,
        getAuthHeaders()
      );
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to update ID configuration');
    }
  }
);

export const deleteIdConfig = createAsyncThunk(
  'identityConfig/delete',
  async ({ organizationId, configId }: { organizationId: string, configId: number }, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_URL}/organizations/${organizationId}/id-configs/${configId}`,
        getAuthHeaders()
      );
      
      return configId;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete ID configuration');
    }
  }
);

export const reorderIdConfigs = createAsyncThunk(
  'identityConfig/reorder',
  async ({ organizationId, configs }: { 
    organizationId: string, 
    configs: { id: number, sort_order: number }[] 
  }, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_URL}/organizations/${organizationId}/id-configs/reorder`,
        { configs },
        getAuthHeaders()
      );
      
      return configs;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder ID configurations');
    }
  }
);

export const fetchFieldTypes = createAsyncThunk(
  'identityConfig/fetchFieldTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/organizations/id-configs/field-types`,
        getAuthHeaders()
      );
      
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch field types');
    }
  }
);

// Identity config slice
const identityConfigSlice = createSlice({
  name: 'identityConfig',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearSuccessMessage: state => {
      state.successMessage = null;
    },
    updateLocalConfig: (state, action) => {
      const { id, updates } = action.payload;
      const configIndex = state.idConfigs.findIndex(config => config.id === id);
      if (configIndex !== -1) {
        state.idConfigs[configIndex] = { ...state.idConfigs[configIndex], ...updates };
      }
    },
    revertLocalChanges: (state, action) => {
      // This would be used to revert local changes before saving
      state.idConfigs = action.payload;
    }
  },
  extraReducers: builder => {
    // Fetch ID configs
    builder.addCase(fetchIdConfigs.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchIdConfigs.fulfilled, (state, action) => {
      state.isLoading = false;
      state.idConfigs = action.payload.identities || [];
      state.organization = action.payload.organization || null;
      state.error = null;
    });
    builder.addCase(fetchIdConfigs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create ID config
    builder.addCase(createIdConfig.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createIdConfig.fulfilled, (state, action) => {
      state.isLoading = false;
      state.idConfigs.push(action.payload.data);
      state.successMessage = 'ID configuration created successfully';
      state.error = null;
    });
    builder.addCase(createIdConfig.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update ID config
    builder.addCase(updateIdConfig.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateIdConfig.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.idConfigs.findIndex(config => config.id === action.payload.data.id);
      if (index !== -1) {
        state.idConfigs[index] = action.payload.data;
      }
      state.successMessage = 'ID configuration updated successfully';
      state.error = null;
    });
    builder.addCase(updateIdConfig.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete ID config
    builder.addCase(deleteIdConfig.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteIdConfig.fulfilled, (state, action) => {
      state.isLoading = false;
      state.idConfigs = state.idConfigs.filter(config => config.id !== action.payload);
      state.successMessage = 'ID configuration deleted successfully';
      state.error = null;
    });
    builder.addCase(deleteIdConfig.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Reorder ID configs
    builder.addCase(reorderIdConfigs.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(reorderIdConfigs.fulfilled, (state, action) => {
      state.isLoading = false;
      // Update sort orders locally
      action.payload.forEach(({ id, sort_order }) => {
        const config = state.idConfigs.find(c => c.id === id);
        if (config) {
          config.sort_order = sort_order;
        }
      });
      // Re-sort the array
      state.idConfigs.sort((a, b) => a.sort_order - b.sort_order);
      state.successMessage = 'ID configurations reordered successfully';
      state.error = null;
    });
    builder.addCase(reorderIdConfigs.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch field types
    builder.addCase(fetchFieldTypes.pending, state => {
      state.error = null;
    });
    builder.addCase(fetchFieldTypes.fulfilled, (state, action) => {
      state.fieldTypes = action.payload;
      state.error = null;
    });
    builder.addCase(fetchFieldTypes.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  }
});

export const { 
  clearError, 
  clearSuccessMessage, 
  updateLocalConfig, 
  revertLocalChanges 
} = identityConfigSlice.actions;

export default identityConfigSlice.reducer;