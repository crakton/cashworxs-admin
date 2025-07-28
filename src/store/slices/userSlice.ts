import { Cookie } from 'next/font/google';

import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface User {
	is_active: boolean;
	id: string;
	email: string;
	name?: string;
	full_name?: string;
	phone_number?: string;
	role?: string;
	is_admin?: boolean;
	created_at?: string;
	updated_at?: string;
}

interface UserFormData {
	full_name: string;
	phone_number: string;
	role: string;
	password: string;
	password_confirmation: string;
	email?: string;
}

interface Activity {
	id: number;
	type: string;
	description: string;
	title: string;
	meta_info: Array<{
		name: string;
		description: string;
	}>;
}

interface Transaction {
	id: string;
	user_id: string;
	amount: number;
	status: string;
	type: string; // 'tax' or 'fee'
	created_at: string;
	updated_at: string;
}

interface UserState {
	users: User[];
	currentUser: User | null;
	activities: Activity[];
	transactions: Transaction[];
	isLoading: boolean;
	error: string | null;
}

// Initial state
const initialState: UserState = {
	users: [],
	currentUser: null,
	activities: [],
	transactions: [],
	isLoading: false,
	error: null
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
export const fetchAllUsers = createAsyncThunk('users/fetchAllUsers', async (_, { getState, rejectWithValue }) => {
	try {
		const state = getState() as { auth: { token: string | null } };
		const token = Cookies.get('auth_token') || state.auth.token;

		if (!token) {
			return rejectWithValue('Authentication required');
		}

		const { data } = await axios.get(`${API_URL}/users`, getAuthHeaders());

		1;

		return data;
	} catch (error: any) {
		return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
	}
});

export const fetchUserById = createAsyncThunk(
	'users/fetchUserById',
	async (userId: string, { getState, rejectWithValue }) => {
		try {
			const response = await axios.get(`${API_URL}/users/${userId}`, getAuthHeaders());

			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
		}
	}
);

export const addUser = createAsyncThunk('auth/register', async (userData: UserFormData, { rejectWithValue }) => {
	try {
		const token = Cookies.get('auth_token');

		if (!token) {
			return rejectWithValue('No token found');
		}

		const response = await axios.post(`${API_URL}/auth/register`, userData, getAuthHeaders());

		return response.data.data;
	} catch (error: any) {
		return rejectWithValue(error.response?.data?.message || 'Failed to add user');
	}
});

export const updateUser = createAsyncThunk(
	'users/updateUser',
	async ({ userId, userData }: { userId: string; userData: Partial<User> }, { getState, rejectWithValue }) => {
		try {
			// exempt role
			const { role, ...payload } = userData;

			const response = await axios.put(`${API_URL}/users/${userId}`, payload, getAuthHeaders());

			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update user');
		}
	}
);

export const deleteUser = createAsyncThunk(
	'users/deleteUser',
	async (userId: string, { getState, rejectWithValue }) => {
		try {
			const response = await axios.delete(`${API_URL}/users/${userId}`, getAuthHeaders());

			return { userId, response: response.data };
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
		}
	}
);

export const fetchActivities = createAsyncThunk('users/fetchActivities', async (_, { getState, rejectWithValue }) => {
	try {
		const response = await axios.get(`${API_URL}/users/activity`, getAuthHeaders());

		return response.data;
	} catch (error: any) {
		return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
	}
});

export const fetchUserTransactions = createAsyncThunk(
	'users/fetchUserTransactions',
	async (_, { getState, rejectWithValue }) => {
		try {
			const state = getState() as { auth: { token: string | null } };
			const token = state.auth.token;

			if (!token) {
				return rejectWithValue('Authentication required');
			}

			const response = await axios.get(`${API_URL}/transactions/user`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
		}
	}
);

export const toggleUserStatus = createAsyncThunk(
	'users/toggleStatus',
	async ({ userId, isActive }: { userId: string; isActive: boolean }, { rejectWithValue }) => {
		try {
			// API call to update user status
			const response = await axios.put(`/users/${userId}/status`, { isActive });
			return response.data;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
		}
	}
);

// User slice
const userSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		clearUserError: state => {
			state.error = null;
		},
		clearCurrentUser: state => {
			state.currentUser = null;
		}
	},
	extraReducers: builder => {
		// Fetch all users
		builder.addCase(fetchAllUsers.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<any>) => {
			state.isLoading = false;
			const users = action.payload.data.users.filter((user: User) => !user.is_admin);

			state.users = users;
		});
		builder.addCase(fetchAllUsers.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Fetch user by ID
		builder.addCase(fetchUserById.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchUserById.fulfilled, (state, action: PayloadAction<any>) => {
			state.isLoading = false;
			state.currentUser = action.payload.data.user;
		});
		builder.addCase(fetchUserById.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Add user
		builder.addCase(addUser.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(addUser.fulfilled, (state, action: PayloadAction<User>) => {
			state.isLoading = false;
			state.users.push(action.payload);
			state.error = null;
		});
		builder.addCase(addUser.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Update user
		builder.addCase(updateUser.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(updateUser.fulfilled, (state, action: PayloadAction<any>) => {
			state.isLoading = false;

			if (state.currentUser && action.payload.data.user) {
				state.currentUser = action.payload.data.user;
			}

			// Update the user in the users array
			const index = state.users.findIndex(user => user.id === action.payload.data.user.id);

			if (index !== -1) {
				state.users[index] = action.payload.data.user;
			}
		});
		builder.addCase(updateUser.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Delete user
		builder.addCase(deleteUser.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<any>) => {
			state.isLoading = false;

			// Remove the user from the users array
			state.users = state.users.filter(user => user.id !== action.payload.data.userId);

			if (state.currentUser && state.currentUser.id === action.payload.data.userId) {
				state.currentUser = null;
			}
		});
		builder.addCase(deleteUser.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Fetch activities
		builder.addCase(fetchActivities.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchActivities.fulfilled, (state, action: PayloadAction<any>) => {
			state.isLoading = false;
			state.activities = action.payload.activities;
		});
		builder.addCase(fetchActivities.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Fetch user transactions
		builder.addCase(fetchUserTransactions.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchUserTransactions.fulfilled, (state, action: PayloadAction<any>) => {
			state.isLoading = false;
			state.transactions = action.payload.transactions;
		});
		builder.addCase(fetchUserTransactions.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});
	}
});

export const { clearUserError, clearCurrentUser } = userSlice.actions;

export default userSlice.reducer;
