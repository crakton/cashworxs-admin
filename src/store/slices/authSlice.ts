import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import Cookies from 'js-cookie'
import { store } from '..'
import { get } from 'http'

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Types
interface User {
  id: string
  full_name: string
  phone_number: string
  provider: string | null
  provider_id: string | null
  verified: boolean
  is_admin: boolean
  last_login_at: string | null
  phone_verified_at: string
  created_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? Cookies.get('auth_token') || null : null,
  isAuthenticated: !!Cookies.get('auth_token'),
  isLoading: false,
  error: null
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { phone_number: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, credentials)

      // Set token in cookies (expires in 24h)
      Cookies.set('auth_token', data.data.token, { expires: 1 })
      localStorage.setItem('user', JSON.stringify(data.data.user))
      return data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // Call logout API endpoint
    const token = Cookies.get('auth_token')
    if (token) {
      await axios.post(
        `${API_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      // Clear user data from local storage
      localStorage.removeItem('user')
      // Clear token from cookies
      Cookies.remove('auth_token')
      // clear all store states
      store.dispatch({ type: 'auth/logout' })
      store.dispatch({ type: 'invoices/logout' })
      store.dispatch({ type: 'fees/logout' })
      store.dispatch({ type: 'auth/logout' })
      store.dispatch({ type: 'taxes/logout' })
      store.dispatch({ type: 'users/logout' })
      store.dispatch({ type: 'dashboard/logout' })
      store.dispatch({ type: 'payments/logout' })
    }

    return true
  } catch (error: any) {
    // Even if the API call fails, we still want to remove the token
    Cookies.remove('auth_token')
    return rejectWithValue(error.response?.data?.message || 'Logout failed')
  }
})

export const getUserProfile = createAsyncThunk('auth/getUserProfile', async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token')
    if (!token) {
      return rejectWithValue('No token found')
    }
    const { data } = await axios.get(`${API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return data.data.user
  } catch (error: any) {
    // If token is invalid, clear it
    if (error.response?.status === 401) {
      Cookies.remove('auth_token')
    }
    return rejectWithValue(error.response?.data?.message || 'Failed to get user profile')
  }
})

export const getUserGreeting = createAsyncThunk('auth/getUserGreeting', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { auth: AuthState }
    const token = state.auth.token

    if (!token) {
      return rejectWithValue('No token found')
    }

    const response = await axios.get(`${API_URL}/users/greeting`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response.data
  } catch (error: any) {
    // If token is invalid, clear it
    if (error.response?.status === 401) {
      Cookies.remove('auth_token')
    }
    return rejectWithValue(error.response?.data?.message || 'Failed to get user profile')
  }
})

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    getUser: state => {
      state.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null
    }
  },
  extraReducers: builder => {
    // Login
    builder.addCase(login.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
    })
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.error = action.payload as string
    })

    // Logout
    builder.addCase(logout.fulfilled, state => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
    })

    // Get user profile
    builder.addCase(getUserProfile.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(getUserProfile.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false
      state.user = action.payload
      state.error = null
    })
    builder.addCase(getUserProfile.rejected, (state, action) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.error = action.payload as string
    })
    // Get user greeting
    builder.addCase(getUserGreeting.pending, state => {
      state.isLoading = true
    })
    builder.addCase(getUserGreeting.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false
      state.user = action.payload.user
    })
    builder.addCase(getUserGreeting.rejected, (state, action) => {
      state.isLoading = false
      if (action.payload === 'No token found' || action.error.message?.includes('401')) {
        state.isAuthenticated = false
        state.user = null
        state.token = null
      }
      state.error = action.payload as string
    })
  }
})

export const { clearError, getUser } = authSlice.actions

export default authSlice.reducer
