import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

export const http_header = {
	headers: { Authorization: `Bearer ${Cookies.get('auth_token')}` }
};

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

interface MetaInfo {
	name: string;
	description: string;
}

export interface Activity {
	id: number;
	type: string;
	description: string;
	title: string;
	meta_info: MetaInfo[];
}

interface ActivitiesState {
	activities: Activity[];
	isLoading: boolean;
	error: string | null;
}

const initialState: ActivitiesState = {
	activities: [],
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

// Fetch all activities
export const fetchActivities = createAsyncThunk('activities/fetchActivities', async (_, { rejectWithValue }) => {
	try {
		const response = await axios.get(`${NEXT_PUBLIC_API_URL}/users/activity`, getAuthHeaders());
		const data = response.data.data.activities;

		return data;
	} catch (error: any) {
		return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
	}
});

// Create new activity
export const createActivity = createAsyncThunk(
	'activities/createActivity',
	async (activityData: Omit<Activity, 'id'>, { rejectWithValue }) => {
		try {
			const response = await axios.post(`${NEXT_PUBLIC_API_URL}/users/activity/new`, activityData, { ...http_header });

			return response.data.data.activity;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to create activity');
		}
	}
);

// Update activity
export const updateActivity = createAsyncThunk(
	'activities/updateActivity',
	async (activity: Activity, { rejectWithValue }) => {
		try {
			const response = await axios.patch(`${NEXT_PUBLIC_API_URL}/users/activity/${activity.id}`, activity, {
				...http_header
			});

			return response.data.data.activity;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to update activity');
		}
	}
);

// Delete activity
export const deleteActivity = createAsyncThunk('activities/deleteActivity', async (id: number, { rejectWithValue }) => {
	try {
		await axios.delete(`${NEXT_PUBLIC_API_URL}/user/activities/${id}`, { ...http_header });

		return id;
	} catch (error: any) {
		return rejectWithValue(error.response?.data?.message || 'Failed to delete activity');
	}
});

const activitiesSlice = createSlice({
	name: 'activities',
	initialState,
	reducers: {},
	extraReducers: builder => {
		// Fetch activities
		builder.addCase(fetchActivities.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchActivities.fulfilled, (state, action) => {
			state.isLoading = false;
			state.activities = action.payload as unknown as Activity[];
		});
		builder.addCase(fetchActivities.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Create activity
		builder.addCase(createActivity.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(createActivity.fulfilled, (state, action) => {
			state.isLoading = false;
			state.activities.push(action.payload);
		});
		builder.addCase(createActivity.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Update activity
		builder.addCase(updateActivity.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(updateActivity.fulfilled, (state, action) => {
			state.isLoading = false;
			const index = state.activities.findIndex(activity => activity.id === action.payload.id);

			if (index !== -1) {
				state.activities[index] = action.payload;
			}
		});
		builder.addCase(updateActivity.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Delete activity
		builder.addCase(deleteActivity.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(deleteActivity.fulfilled, (state, action) => {
			state.isLoading = false;
			state.activities = state.activities.filter(activity => activity.id !== action.payload);
		});
		builder.addCase(deleteActivity.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});
	}
});

export default activitiesSlice.reducer;
