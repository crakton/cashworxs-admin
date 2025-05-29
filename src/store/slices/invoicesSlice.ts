import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface InvoiceItem {
	id: number;
	invoice_id: number;
	i_code: string;
	i_name: string;
	i_amount: string;
	note: string;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
}

export interface Invoice {
	id: number;
	mda_id: number;
	invoice_number: string;
	mda_code: string;
	tdate: string;
	amount: string;
	c_code: string;
	c_name: string;
	c_address: string;
	c_phone: string;
	c_number: string;
	c_email: string;
	client_invoice_number: string | null;
	status: number;
	note: string;
	log_time: string;
	items: InvoiceItem[];
	bills: any[]; // Type can be made more specific if bills structure is known
}

export interface InvoicesState {
	invoices: Invoice[];
	currentInvoice: Invoice | null;
	isLoading: boolean;
	error: string | null;
}

// Initial state
const initialState: InvoicesState = {
	invoices: [],
	currentInvoice: null,
	isLoading: false,
	error: null
};

// Async thunks
export const fetchAllInvoices = createAsyncThunk('invoices/fetchAll', async (_, { rejectWithValue }) => {
	try {
		const token = Cookies.get('auth_token');

		if (!token) {
			return rejectWithValue('No token found');
		}

		const response = await axios.get(`${API_URL}/platforms/invoices`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		return response.data.data.invoices;
	} catch (error: any) {
		if (error.response?.status === 401) {
			Cookies.remove('auth_token');
		}

		return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
	}
});

export const fetchInvoiceDetails = createAsyncThunk(
	'invoices/fetchDetails',
	async (invoiceNumber: string, { rejectWithValue }) => {
		try {
			const token = Cookies.get('auth_token');

			if (!token) {
				return rejectWithValue('No token found');
			}

			const response = await axios.get(`${API_URL}/platforms/invoices/${invoiceNumber}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			const invoice = response.data.data.invoice;

			return invoice;
		} catch (error: any) {
			return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice details');
		}
	}
);

export const createInvoice = createAsyncThunk('invoices/create', async (invoiceData: any, { rejectWithValue }) => {
	try {
		const token = Cookies.get('auth_token');

		if (!token) {
			return rejectWithValue('No token found');
		}

		const response = await axios.post(`${API_URL}/platforms/invoices`, invoiceData, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		});

		return response.data.data;
	} catch (error: any) {
		if (error.response?.status === 401) {
			Cookies.remove('auth_token');
		}

		return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
	}
});

// Invoices slice
const invoicesSlice = createSlice({
	name: 'invoices',
	initialState,
	reducers: {
		clearInvoiceError: state => {
			state.error = null;
		},
		clearCurrentInvoice: state => {
			state.currentInvoice = null;
		}
	},
	extraReducers: builder => {
		// Fetch all invoices
		builder.addCase(fetchAllInvoices.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchAllInvoices.fulfilled, (state, action: PayloadAction<Invoice[]>) => {
			state.isLoading = false;
			state.invoices = action.payload;
			state.error = null;
		});
		builder.addCase(fetchAllInvoices.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Fetch invoice details
		builder.addCase(fetchInvoiceDetails.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(fetchInvoiceDetails.fulfilled, (state, action: PayloadAction<Invoice>) => {
			state.isLoading = false;
			state.currentInvoice = action.payload;
			state.error = null;
		});
		builder.addCase(fetchInvoiceDetails.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});

		// Create invoice
		builder.addCase(createInvoice.pending, state => {
			state.isLoading = true;
			state.error = null;
		});
		builder.addCase(createInvoice.fulfilled, (state, action: PayloadAction<Invoice>) => {
			state.isLoading = false;
			state.invoices = [...state.invoices, action.payload];
			state.error = null;
		});
		builder.addCase(createInvoice.rejected, (state, action) => {
			state.isLoading = false;
			state.error = action.payload as string;
		});
	}
});

export const { clearInvoiceError, clearCurrentInvoice } = invoicesSlice.actions;

export default invoicesSlice.reducer;
