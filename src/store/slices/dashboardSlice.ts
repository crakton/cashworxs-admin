import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

import type { User } from './userSlice';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface DashboardStats {
	total_users: number;
	total_service_fees: number;
	total_service_taxes: number;
	recent_transactions: Transaction[];
	recent_users: User[];
	weekly_data: WeeklyData;
	service_fees_business: number;
	service_fees_government: number;
	service_taxes_governmental: number;
	service_taxes_private: number;
	user_growth: {
		count: number;
		percentage: number;
	};
	total_revenue: number;
	new_transactions: number;
	total_transactions: number;
	success_rate: number;
	total_fees: number;
	total_taxes: number;
}

export interface Transaction {
	// Add properties here if you expect transaction data to populate later
	[key: string]: any;
}

interface WeeklyData {
	labels: string[];
	users: number[];
	transactions: number[];
}

export interface DashboardState {
	stats: DashboardStats | null;
	isLoading: boolean;
	error: string | null;
}

// Initial state
const initialState: DashboardState = {
	stats: null,
	isLoading: false,
	error: null
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
	'dashboard/fetchStats',
	async (_, { getState, rejectWithValue }) => {
		try {
			const token = Cookies.get('auth_token');

			if (!token) {
				return rejectWithValue('No token found');
			}

			const response = await axios.get(`${API_URL}/dashboard/stats`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			console.log('Dashboard stats response:', response.data);

			return response.data.data;
		} catch (error: any) {
			// If token is invalid, we could handle it here
			if (error.response?.status === 401) {
				Cookies.remove('auth_token');
			}

			return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
		}
	}
);

// Dashboard slice
const dashboardSlice = createSlice({
	name: 'dashboard',
	initialState,
	reducers: {
		clearDashboardError: state => {
			state.error = null;
		}
	},
	extraReducers: builder => {
		// Fetch dashboard stats
		builder.addCase(fetchDashboardStats.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchDashboardStats.fulfilled, (state, action: PayloadAction<DashboardStats>) => {
			state.isLoading = false;
			state.stats = action.payload;
			state.error = null;
		});
		builder.addCase(fetchDashboardStats.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});
	}
});

export const { clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
