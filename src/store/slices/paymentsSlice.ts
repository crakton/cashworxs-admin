import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Define API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface Invoice {
  id: number
  tdate: string
  c_code: string
  c_name: string
  c_address: string
  c_phone: string
  c_number: string
  amount: string
  note: string
  status: number
  log_time: string
  created_at: string
  updated_at: string
  mda_id: number
  invoice_number: string
  c_tin: string | null
  c_email: string
  client_invoice_number: string
  deleted_at: string | null
  customer_id: string
}

export interface PaymentPayload {
  ServiceUrl: string
  ServiceUsername: string
  ServicePassword: string
  FtpUrl: string
  FtpUsername: string
  FtpPassword: string
  PaymentLogId: string
  CustReference: string
  AlternateCustReference: string
  Amount: string
  PaymentMethod: string
  PaymentReference: string
  TerminalId: string
  ChannelName: string
  Location: string
  PaymentDate: string
  InstitutionId: string
  InstitutionName: string
  BranchName: string
  BankName: string
  CustomerName: string
  OtherCustomerInfo: string
  ReceiptNo: string
  CollectionsAccount: string
  BankCode: string
  CustomerAddress: string
  CustomerPhoneNumber: string
  DepositorName: string
  DepositSlipNumber: string
  PaymentCurrency: string
  ItemName: string
  ItemCode: string
  ItemAmount: string
  LeadBankCode: string
  LeadBankCbnCode: string
  LeadBankName: string
  CategoryCode: string
  CategoryName: string
  ProductGroupCode: string
  PaymentStatus: string
  IsReversal: string
  SettlementDate: string
  FeeName: string
  ThirdPartyCode: string
  OriginalPaymentReference: string
  OriginalPaymentLogId: string
  Teller: string
}

export interface Payment {
  invoice_number: string
  receipt_no: string
  tdate: string
  amount: string
  note: string
  status: number
  log_time: string
  invoice: Invoice
  payload: PaymentPayload
}

export interface PaymentsState {
  payments: Payment[]
  currentPayment: Payment | null
  isLoading: boolean
  error: string | null
}

// Initial state
const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  isLoading: false,
  error: null
};

// Async thunks
export const fetchAllPayments = createAsyncThunk('payments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const token = Cookies.get('auth_token');

    if (!token) {
      return rejectWithValue('No token found');
    }

    const response = await axios.get(`${API_URL}/platforms/payments`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.data.payments;
  } catch (error: any) {
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
    }

    return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
  }
});

export const fetchPaymentDetails = createAsyncThunk(
  'payments/fetchDetails',
  async (invoiceNumber: string, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.get(`${API_URL}/platforms/payments/${invoiceNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment details');
    }
  }
);

export const processPayment = createAsyncThunk(
  'payments/processPayment',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const token = Cookies.get('auth_token');

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(`${API_URL}/platforms/payments`, paymentData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        Cookies.remove('auth_token');
      }

      return rejectWithValue(error.response?.data?.message || 'Failed to process payment');
    }
  }
);

// Payments slice
const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearPaymentError: state => {
      state.error = null;
    },
    clearCurrentPayment: state => {
      state.currentPayment = null;
    }
  },
  extraReducers: builder => {
    // Fetch all payments
    builder.addCase(fetchAllPayments.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllPayments.fulfilled, (state, action: PayloadAction<Payment[]>) => {
      state.isLoading = false;
      state.payments = action.payload;
      state.error = null;
    });
    builder.addCase(fetchAllPayments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch payment details
    builder.addCase(fetchPaymentDetails.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchPaymentDetails.fulfilled, (state, action: PayloadAction<Payment>) => {
      state.isLoading = false;
      state.currentPayment = action.payload;
      state.error = null;
    });
    builder.addCase(fetchPaymentDetails.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Process payment
    builder.addCase(processPayment.pending, state => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(processPayment.fulfilled, (state, action: PayloadAction<Payment>) => {
      state.isLoading = false;
      state.payments = [...state.payments, action.payload];
      state.error = null;
    });
    builder.addCase(processPayment.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { clearPaymentError, clearCurrentPayment } = paymentsSlice.actions;

export default paymentsSlice.reducer;
