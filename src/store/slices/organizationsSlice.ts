import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

import type { FeeService } from './feesSlice';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Organization {
  id: string
  name: string
  type: string
  services?: FeeService[]
  created_at?: string
  updated_at?: string
}

interface OrganizationState {
  organizations: Organization[]
  currentOrganization: Organization | null
  services: FeeService[]
  currentService: FeeService | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: OrganizationState = {
  organizations: [],
  currentOrganization: null,
  services: [],
  currentService: null,
  isLoading: false,
  error: null
};

// Async thunks for organizations
export const fetchOrganizations = createAsyncThunk('organizations/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token');

    if (!token) {
      return rejectWithValue('Authentication required');
    }

    const response = await axios.get(`${API_URL}/organizations`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch organizations');
  }
});

export const fetchOrganizationById = createAsyncThunk(
  'organizations/fetchOne',
  async (organizationId: string, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await axios.get(`${API_URL}/organizations/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organization');
    }
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/create',
  async (organizationData: { name: string; type: string; services: Partial<FeeService>[] }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await axios.post(`${API_URL}/organizations`, organizationData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create organization');
    }
  }
);

export const updateOrganization = createAsyncThunk(
  'organizations/update',
  async ({ id, data }: { id: string; data: Partial<Organization> }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await axios.put(`${API_URL}/organizations/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update organization');
    }
  }
);

export const deleteOrganization = createAsyncThunk('organizations/delete', async (id: string, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token');

    if (!token) {
      return rejectWithValue('Authentication required');
    }

    const response = await axios.delete(`${API_URL}/organizations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return { id, response: response.data };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete organization');
  }
});

// Async thunks for services
// export const fetchServices = createAsyncThunk(
//   'services/fetchAll',
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = Cookies.get('auth_token')

//       if (!token) {
//         return rejectWithValue('Authentication required')
//       }

//       const response = await axios.get(`${API_URL}/services`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       })

//       return response.data
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch services')
//     }
//   }
// )

// export const fetchServiceById = createAsyncThunk(
//   'services/fetchOne',
//   async (serviceId: string, { rejectWithValue }) => {
//     try {
//       const token = Cookies.get('auth_token')

//       if (!token) {
//         return rejectWithValue('Authentication required')
//       }

//       const response = await axios.get(`${API_URL}/services/${serviceId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       })

//       return response.data
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to fetch service')
//     }
//   }
// )

export const fetchOrganizationServices = createAsyncThunk(
  'services/fetchByOrganization',
  async (organizationId: string, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('Authentication required');
      }

      const response = await axios.get(`${API_URL}/organizations/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Organization services response:', response.data);

      return { organizationId, data: response.data };
    } catch (error: any) {
      console.log('Error fetching organization services:', error);

      return rejectWithValue(error.response?.data?.message || 'Failed to fetch organization services');
    }
  }
);

// export const createService = createAsyncThunk(
//   'services/create',
//   async (serviceData: Partial<FeeService>, { rejectWithValue }) => {
//     try {
//       const token = Cookies.get('auth_token')

//       if (!token) {
//         return rejectWithValue('Authentication required')
//       }

//       const response = await axios.post(`${API_URL}/services`, serviceData, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       })

//       return response.data
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to create service')
//     }
//   }
// )

// export const updateService = createAsyncThunk(
//   'services/update',
//   async ({ id, data }: { id: string, data: Partial<FeeService> }, { rejectWithValue }) => {
//     try {
//       const token = Cookies.get('auth_token')

//       if (!token) {
//         return rejectWithValue('Authentication required')
//       }

//       const response = await axios.put(`${API_URL}/services/${id}`, data, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       })

//       return response.data
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to update service')
//     }
//   }
// )

// export const deleteService = createAsyncThunk(
//   'services/delete',
//   async (id: string, { rejectWithValue }) => {
//     try {
//       const token = Cookies.get('auth_token')

//       if (!token) {
//         return rejectWithValue('Authentication required')
//       }

//       const response = await axios.delete(`${API_URL}/services/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       })

//       return { id, response: response.data }
//     } catch (error: any) {
//       return rejectWithValue(error.response?.data?.message || 'Failed to delete service')
//     }
//   }
// )

// Organizations slice
const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearCurrentOrganization: state => {
      state.currentOrganization = null;
    },
    clearCurrentService: state => {
      state.currentService = null;
    }
  },
  extraReducers: builder => {
    // Fetch all organizations
    builder.addCase(fetchOrganizations.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizations.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.organizations = action.payload.organizations || action.payload.data.organizations || [];
    });
    builder.addCase(fetchOrganizations.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch organization by ID
    builder.addCase(fetchOrganizationById.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizationById.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.currentOrganization = action.payload.organization || action.payload.data.organization || null;

      if (state.currentOrganization?.services) {
        state.services = state.currentOrganization.services;
      }
    });
    builder.addCase(fetchOrganizationById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create organization
    builder.addCase(createOrganization.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createOrganization.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const newOrganization = action.payload.organization || action.payload.data.organization;

      if (newOrganization) {
        state.organizations.push(newOrganization);
        state.currentOrganization = newOrganization;
      }
    });
    builder.addCase(createOrganization.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update organization
    builder.addCase(updateOrganization.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateOrganization.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const updatedOrganization = action.payload.organization || action.payload.data.organization;

      if (updatedOrganization) {
        state.organizations = state.organizations.map(org =>
          org.id === updatedOrganization.id ? updatedOrganization : org
        );
        state.currentOrganization = updatedOrganization;
      }
    });
    builder.addCase(updateOrganization.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Delete organization
    builder.addCase(deleteOrganization.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteOrganization.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.organizations = state.organizations.filter(org => org.id !== action.payload.id);

      if (state.currentOrganization && state.currentOrganization.id === action.payload.id) {
        state.currentOrganization = null;
      }
    });
    builder.addCase(deleteOrganization.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch organization services
    builder.addCase(fetchOrganizationServices.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizationServices.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const orgServices = action.payload.data.organization.services || [];

      // Update the services list
      state.services = orgServices;

      // If the current organization matches, update its services as well
      if (state.currentOrganization && state.currentOrganization.id === action.payload.organizationId) {
        state.currentOrganization.services = orgServices;
      }
    });
    builder.addCase(fetchOrganizationServices.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearError, clearCurrentOrganization, clearCurrentService } = organizationsSlice.actions;

export default organizationsSlice.reducer;
