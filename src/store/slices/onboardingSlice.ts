import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'
import Cookies from 'js-cookie'

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Types
interface OnboardingItem {
  id?: string
  title: string
  description: string
  image_url: string
}

interface ChecklistData {
  user_id?: string
  income?: number
  bvn?: string
  nin?: string
}

interface OnboardingState {
  onboardingData: OnboardingItem[] | null
  checklist: ChecklistData | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: OnboardingState = {
  onboardingData: null,
  checklist: null,
  isLoading: false,
  error: null
}

// Async thunks
export const fetchOnboardingData = createAsyncThunk('onboarding/fetchData', async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token')

    if (!token) {
      return rejectWithValue('No token found')
    }

    const response = await axios.get(`${API_URL}/onboarding`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch onboarding data')
  }
})

export const addOnboardingItem = createAsyncThunk(
  'onboarding/addItem',
  async (data: OnboardingItem, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token')

      if (!token) {
        return rejectWithValue('No token found')
      }

      const response = await axios.post(`${API_URL}/onboarding/items`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add onboarding item')
    }
  }
)

export const updateOnboardingItem = createAsyncThunk(
  'onboarding/updateItem',
  async ({ id, data }: { id: string; data: OnboardingItem }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token')

      if (!token) {
        return rejectWithValue('No token found')
      }

      const { data: response } = await axios.put(`${API_URL}/onboarding/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('Updated onboarding data:', response)

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update onboarding item')
    }
  }
)

export const addChecklist = createAsyncThunk('onboarding/add', async (data: ChecklistData, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token')

    if (!token) {
      return rejectWithValue('No token found')
    }

    const response = await axios.post(`${API_URL}/onboarding/add`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response.data.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add checklist')
  }
})

export const updateChecklist = createAsyncThunk(
  'onboarding/update',
  async ({ id, data }: { id: string; data: ChecklistData }, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token')

      if (!token) {
        return rejectWithValue('No token found')
      }

      const response = await axios.put(`${API_URL}/onboarding/update/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update checklist')
    }
  }
)

// Image upload helper function
export const uploadImage = createAsyncThunk('onboarding/uploadImage', async (file: File, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token')

    if (!token) {
      return rejectWithValue('No token found')
    }

    const formData = new FormData()
    formData.append('image', file)

    const response = await axios.post(`${API_URL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    })

    return response.data.url
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to upload image')
  }
})

// Onboarding slice
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    clearOnboardingError: state => {
      state.error = null
    }
  },
  extraReducers: builder => {
    // Fetch onboarding data
    builder.addCase(fetchOnboardingData.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(fetchOnboardingData.fulfilled, (state, action: PayloadAction<OnboardingItem[]>) => {
      state.isLoading = false
      state.onboardingData = action.payload
      state.error = null
    })
    builder.addCase(fetchOnboardingData.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Add onboarding item
    builder.addCase(addOnboardingItem.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(addOnboardingItem.fulfilled, (state, action: PayloadAction<OnboardingItem>) => {
      state.isLoading = false

      if (state.onboardingData) {
        state.onboardingData = [...state.onboardingData, action.payload]
      } else {
        state.onboardingData = [action.payload]
      }
      state.error = null
    })
    builder.addCase(addOnboardingItem.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.payload as string
    })

    // Update onboarding item
    builder.addCase(updateOnboardingItem.pending, state => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(updateOnboardingItem.fulfilled, (state, action: PayloadAction<OnboardingItem>) => {
      state.isLoading = false
      if (state.onboardingData) {
        const index = state.onboardingData.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.onboardingData[index] = action.payload
        }
      }
    })
  }
})

export const { clearOnboardingError } = onboardingSlice.actions

export default onboardingSlice.reducer
