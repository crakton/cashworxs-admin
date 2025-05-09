import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface FeeServiceItem {
  id: string
  name: string
  type: string
  state: string
  amount: string
  status: number
  description: string
  metadata: {
    payment_support: string[]
    payment_type: string
  }
  created_at: string
  updated_at: string
}

export interface FeeService {
  id: string
  name: string
  type: string
  state: string
  amount?: string
  status?: number
  description?: string
  organization_id?: string
  metadata?: {
    payment_support?: string[]
    payment_type?: string
  }
  created_at: string
  updated_at: string
  services: FeeServiceItem[]
}

export interface CreateFeeServiceDTO {
  name: string
  type: string
  state: string
  amount: string | number
  description?: string
  status: number | boolean
  organization_id: string
  metadata?: {
    payment_support?: string[]
    payment_type?: string
  }
}

export interface UpdateFeeServiceDTO {
  name?: string
  type?: string
  state?: string
  amount?: string | number
  description?: string
  status?: number | boolean
  organization_id?: string
  metadata?: {
    payment_support?: string[]
    payment_type?: string
  }
}

export interface CreateServiceItemDTO {
  organization_id: string
  fee_id: string
  name: string
  type: string
  state: string
  amount: string | number
  description?: string
  status: number | boolean
  metadata?: {
    payment_support?: string[]
    payment_type?: string
  }
}

export interface FeesState {
  serviceFees: FeeService[]
  currentFee: FeeService | null
  isLoading: boolean
  error: string | null
  organizations: { id: string; name: string }[]
}

// Initial state
const initialState: FeesState = {
  serviceFees: [],
  currentFee: null,
  isLoading: false,
  error: null,
  organizations: []
};

// Fetch organizations
export const fetchOrganizations = createAsyncThunk('fees/fetchOrganizations', async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token');

    if (!token) {
      return rejectWithValue('No token found');
    }

    const response = await axios.get(`${API_URL}/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data.organizations;
  } catch (error: any) {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
    }

    return rejectWithValue(error.response?.data?.message || 'Failed to fetch organizations');
  }
});

// Async thunks
export const fetchServiceFees = createAsyncThunk('fees/fetchServiceFees', async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token');

    if (!token) {
      return rejectWithValue('No token found');
    }

    const response = await axios.get(`${API_URL}/services/fees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data.services;
  } catch (error: any) {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
    }

    return rejectWithValue(error.response?.data?.message || 'Failed to fetch service fees');
  }
});

export const createServiceFee = createAsyncThunk(
  'fees/createServiceFee',
  async (feeData: CreateFeeServiceDTO, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      // Handle error case gracefully
      const response = await axios.post(`${API_URL}/services/fees`, feeData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.data.fee;
    } catch (error: any) {
      // Extract detailed error message if available
      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || 'Failed to create service fee';

      return rejectWithValue(errorMessage);
    }
  }
);

export const updateServiceFee = createAsyncThunk(
  'fees/updateServiceFee',
  async ({ id, feeData }: { id: string; feeData: UpdateFeeServiceDTO }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(`${API_URL}/services/fees/${id}`, feeData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.data.fee;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to update service fee');
    }
  }
);

export const deleteServiceFee = createAsyncThunk('fees/deleteServiceFee', async (id: string, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token');

    if (!token) {
      return rejectWithValue('No token found');
    }

    await axios.delete(`${API_URL}/services/fees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return id;
  } catch (error: any) {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
    }

    return rejectWithValue(error.response?.data?.message || 'Failed to delete service fee');
  }
});

// Service item thunks
export const addServiceItem = createAsyncThunk(
  'fees/addServiceItem',
  async (itemData: CreateServiceItemDTO, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(`${API_URL}/services/fees`, itemData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return {
        feeId: itemData.fee_id,
        item: response.data.data.item
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to add service item');
    }
  }
);

export const updateServiceItem = createAsyncThunk(
  'fees/updateServiceItem',
  async (
    { feeId, itemId, itemData }: { feeId: string; itemId: string; itemData: Partial<FeeServiceItem> },
    { rejectWithValue }
  ) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.put(`${API_URL}/services/fees/${feeId}/items/${itemId}`, itemData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return {
        feeId,
        item: response.data.data.item
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to update service item');
    }
  }
);

export const deleteServiceItem = createAsyncThunk(
  'fees/deleteServiceItem',
  async ({ feeId, itemId }: { feeId: string; itemId: string }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      await axios.delete(`${API_URL}/services/fees/${feeId}/items/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return { feeId, itemId };
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to delete service item');
    }
  }
);

// Fees slice
const feesSlice = createSlice({
  name: 'fees',
  initialState,
  reducers: {
    clearFeeError: state => {
      state.error = null;
    },
    clearCurrentFee: state => {
      state.currentFee = null;
    }
  },
  extraReducers: builder => {
    // Fetch organizations
    builder.addCase(fetchOrganizations.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizations.fulfilled, (state, action) => {
      state.isLoading = false;
      state.organizations = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOrganizations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch service fees
    builder.addCase(fetchServiceFees.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchServiceFees.fulfilled, (state, action: PayloadAction<FeeService[]>) => {
      state.isLoading = false;
      state.serviceFees = action.payload;
      state.error = null;
    });
    builder.addCase(fetchServiceFees.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create service fee
    builder.addCase(createServiceFee.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createServiceFee.fulfilled, (state, action: PayloadAction<FeeService>) => {
      state.isLoading = false;
      state.serviceFees = [...state.serviceFees, action.payload];
      state.error = null;
    });
    builder.addCase(createServiceFee.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update service fee
    builder.addCase(updateServiceFee.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateServiceFee.fulfilled, (state, action: PayloadAction<FeeService>) => {
      state.isLoading = false;
      state.serviceFees = state.serviceFees.map(fee => (fee.id === action.payload.id ? action.payload : fee));
      state.error = null;
    });
    builder.addCase(updateServiceFee.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete service fee
    builder.addCase(deleteServiceFee.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteServiceFee.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.serviceFees = state.serviceFees.filter(fee => fee.id !== action.payload);
      state.error = null;
    });
    builder.addCase(deleteServiceFee.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add service item
    builder.addCase(addServiceItem.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addServiceItem.fulfilled, (state, action) => {
      state.isLoading = false;
      const { feeId, item } = action.payload;

      state.serviceFees = state.serviceFees.map(fee => {
        if (fee.id === feeId) {
          return {
            ...fee,
            services: [...fee.services, item]
          };
        }

        return fee;
      });
      state.error = null;
    });
    builder.addCase(addServiceItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update service item
    builder.addCase(updateServiceItem.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateServiceItem.fulfilled, (state, action) => {
      state.isLoading = false;
      const { feeId, item } = action.payload;

      state.serviceFees = state.serviceFees.map(fee => {
        if (fee.id === feeId) {
          return {
            ...fee,
            services: fee.services.map(service => (service.id === item.id ? item : service))
          };
        }

        return fee;
      });
      state.error = null;
    });
    builder.addCase(updateServiceItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete service item
    builder.addCase(deleteServiceItem.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteServiceItem.fulfilled, (state, action) => {
      state.isLoading = false;
      const { feeId, itemId } = action.payload;

      state.serviceFees = state.serviceFees.map(fee => {
        if (fee.id === feeId) {
          return {
            ...fee,
            services: fee.services.filter(service => service.id !== itemId)
          };
        }

        return fee;
      });
      state.error = null;
    });
    builder.addCase(deleteServiceItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearFeeError, clearCurrentFee } = feesSlice.actions;

export default feesSlice.reducer;
