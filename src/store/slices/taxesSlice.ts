import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface TaxService {
  id: string
  name: string
  type: string
  state: string
  amount: string | number
  description: string
  status: number | boolean
  organization_id?: string // Added this field
  metadata: {
    payment_support: string[]
    payment_type: string
  }
  created_at: string
  updated_at: string
}

export interface TaxesState {
  serviceTaxes: TaxService[]
  currentTax: TaxService | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: TaxesState = {
  serviceTaxes: [],
  currentTax: null,
  isLoading: false,
  error: null
};

// Helper function to handle API errors
const handleApiError = (error: any) => {
  // Handle token expiration
  if (error.response?.status === 401) {
    Cookies.remove('auth_token');

    return 'Your session has expired. Please login again.';
  }

  // Handle server errors
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }

  // Handle validation errors
  if (error.response?.data?.errors) {
    const errorMessages = Object.values(error.response.data.errors).flat();

    return Array.isArray(errorMessages) ? errorMessages.join(', ') : 'Validation error';
  }

  // Handle other API errors
  if (error.response?.data?.data?.error) {
    return error.response.data.data.error;
  }

  return error.response?.data?.message || error.message || 'An unexpected error occurred';
};

// Get auth token from cookies
const getAuthToken = () => {
  const token = Cookies.get('auth_token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  return token;
};

// Get organization ID from cookies or session storage
const getOrganizationId = () => {
  return Cookies.get('organization_id') || sessionStorage.getItem('organization_id') || null;
};

// Async thunks
export const fetchServiceTaxes = createAsyncThunk('taxes/fetchServiceTaxes', async (_, { rejectWithValue }) => {
  try {
    const token = getAuthToken();

    const response = await axios.get(`${API_URL}/services/taxes`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data.taxes || response.data.data.fees || [];
  } catch (error: any) {
    return rejectWithValue(handleApiError(error));
  }
});

export const fetchSingleTax = createAsyncThunk('taxes/fetchSingleTax', async (id: string, { rejectWithValue }) => {
  try {
    const token = getAuthToken();

    const response = await axios.get(`${API_URL}/services/taxes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data.tax || response.data.data.fee;
  } catch (error: any) {
    return rejectWithValue(handleApiError(error));
  }
});

export const createServiceTax = createAsyncThunk(
  'taxes/createServiceTax',
  async (taxData: Partial<TaxService>, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      // Format data to ensure it matches what the server expects
      const formattedData = {
        ...taxData,

        // Add organization_id
        organization_id: organizationId,

        // Ensure amount is a string if that's what the API expects
        amount: typeof taxData.amount === 'number' ? String(taxData.amount) : taxData.amount,

        // Ensure status is in the format the server expects (boolean or number)
        status: typeof taxData.status === 'boolean' ? (taxData.status ? 1 : 0) : taxData.status
      };

      // Add timeout for better error handling
      const response = await axios.post(`${API_URL}/services/taxes`, formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      return response.data.data.tax;
    } catch (error: any) {
      // Enhanced error logging
      console.error('Error creating tax service:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestData: error.config?.data
      });

      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateServiceTax = createAsyncThunk(
  'taxes/updateServiceTax',
  async ({ id, taxData }: { id: string; taxData: Partial<TaxService> }, { rejectWithValue }) => {
    try {
      const token = getAuthToken();
      const organizationId = getOrganizationId();

      const formattedData = {
        ...taxData,
        organization_id: organizationId,
        amount: typeof taxData.amount === 'number' ? String(taxData.amount) : taxData.amount,
        status: typeof taxData.status === 'boolean' ? (taxData.status ? 1 : 0) : taxData.status
      };

      const response = await axios.put(`${API_URL}/services/taxes/${id}`, formattedData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // The API returns fee, not tax
      return response.data.data.tax;
    } catch (error: any) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteServiceTax = createAsyncThunk('taxes/deleteServiceTax', async (id: string, { rejectWithValue }) => {
  try {
    const token = getAuthToken();

    await axios.delete(`${API_URL}/services/taxes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return id;
  } catch (error: any) {
    return rejectWithValue(handleApiError(error));
  }
});

// Taxes slice
const taxesSlice = createSlice({
  name: 'taxes',
  initialState,
  reducers: {
    clearTaxError: state => {
      state.error = null;
    },
    clearCurrentTax: state => {
      state.currentTax = null;
    }
  },
  extraReducers: builder => {
    // Fetch service taxes
    builder.addCase(fetchServiceTaxes.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchServiceTaxes.fulfilled, (state, action: PayloadAction<TaxService[]>) => {
      state.isLoading = false;
      state.serviceTaxes = action.payload;
      state.error = null;
    });
    builder.addCase(fetchServiceTaxes.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch single tax
    builder.addCase(fetchSingleTax.pending, state => {
      state.isLoading = true;
      state.currentTax = null;
      state.error = null;
    });
    builder.addCase(fetchSingleTax.fulfilled, (state, action: PayloadAction<TaxService>) => {
      state.isLoading = false;
      state.currentTax = action.payload;

      // Also update the tax in the tax list if it exists
      const index = state.serviceTaxes.findIndex(tax => tax.id === action.payload.id);

      if (index !== -1) {
        state.serviceTaxes[index] = action.payload;
      }

      state.error = null;
    });
    builder.addCase(fetchSingleTax.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create service tax
    builder.addCase(createServiceTax.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createServiceTax.fulfilled, (state, action: PayloadAction<TaxService>) => {
      state.isLoading = false;
      state.serviceTaxes = [...state.serviceTaxes, action.payload];
      state.error = null;
    });
    builder.addCase(createServiceTax.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update service tax
    builder.addCase(updateServiceTax.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateServiceTax.fulfilled, (state, action: PayloadAction<TaxService>) => {
      state.isLoading = false;
      state.serviceTaxes = state.serviceTaxes.map(tax => (tax.id === action.payload.id ? action.payload : tax));
      state.currentTax = action.payload;
      state.error = null;
    });
    builder.addCase(updateServiceTax.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete service tax
    builder.addCase(deleteServiceTax.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteServiceTax.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.serviceTaxes = state.serviceTaxes.filter(tax => tax.id !== action.payload);

      if (state.currentTax && state.currentTax.id === action.payload) {
        state.currentTax = null;
      }

      state.error = null;
    });
    builder.addCase(deleteServiceTax.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearTaxError, clearCurrentTax } = taxesSlice.actions;

export default taxesSlice.reducer;
