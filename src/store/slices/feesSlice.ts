import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import Cookies from 'js-cookie'

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

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
  created_at: string
  updated_at: string
  services: FeeServiceItem[]
}

export interface FeesState {
  serviceFees: FeeService[]
  currentFee: FeeService | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: FeesState = {
  serviceFees: [],
  currentFee: null,
  isLoading: false,
  error: null
}

// Async thunks
export const fetchServiceFees = createAsyncThunk('fees/fetchServiceFees', async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token')

    if (!token) {
      return rejectWithValue('No token found')
    }

    const response = await axios.get(`${API_URL}/services/fees`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response.data.data.fees
  } catch (error: any) {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token')
    }
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch service fees')
  }
})

export const createServiceFee = createAsyncThunk(
  'fees/createServiceFee',
  async (feeData: Partial<FeeService>, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token')

      if (!token) {
        return rejectWithValue('No token found')
      }

      const response = await axios.post(`${API_URL}/services/fees`, feeData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token')
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to create service fee')
    }
  }
)

export const updateServiceFee = createAsyncThunk(
  'fees/updateServiceFee',
  async ({ id, feeData }: { id: string; feeData: Partial<FeeService> }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token')

      if (!token) {
        return rejectWithValue('No token found')
      }

      const response = await axios.put(`${API_URL}/services/fees/${id}`, feeData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token')
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to update service fee')
    }
  }
)

export const deleteServiceFee = createAsyncThunk('fees/deleteServiceFee', async (id: string, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token')

    if (!token) {
      return rejectWithValue('No token found')
    }

    await axios.delete(`${API_URL}/services/fees/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return id
  } catch (error: any) {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token')
    }
    return rejectWithValue(error.response?.data?.message || 'Failed to delete service fee')
  }
})

// Fees slice
const feesSlice = createSlice({
  name: 'fees',
  initialState,
  reducers: {
    clearFeeError: state => {
      state.error = null
    },
    clearCurrentFee: state => {
      state.currentFee = null
    }
  },
  extraReducers: builder => {
    // Fetch service fees
    builder.addCase(fetchServiceFees.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchServiceFees.fulfilled, (state, action: PayloadAction<FeeService[]>) => {
      state.isLoading = false
      state.serviceFees = action.payload
      state.error = null
    })
    builder.addCase(fetchServiceFees.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Create service fee
    builder.addCase(createServiceFee.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(createServiceFee.fulfilled, (state, action: PayloadAction<FeeService>) => {
      state.isLoading = false
      state.serviceFees = [...state.serviceFees, action.payload]
      state.error = null
    })
    builder.addCase(createServiceFee.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Update service fee
    builder.addCase(updateServiceFee.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateServiceFee.fulfilled, (state, action: PayloadAction<FeeService>) => {
      state.isLoading = false
      state.serviceFees = state.serviceFees.map(fee => (fee.id === action.payload.id ? action.payload : fee))
      state.error = null
    })
    builder.addCase(updateServiceFee.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Delete service fee
    builder.addCase(deleteServiceFee.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(deleteServiceFee.fulfilled, (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.serviceFees = state.serviceFees.filter(fee => fee.id !== action.payload)
      state.error = null
    })
    builder.addCase(deleteServiceFee.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })
  }
})

export const { clearFeeError, clearCurrentFee } = feesSlice.actions

export default feesSlice.reducer
