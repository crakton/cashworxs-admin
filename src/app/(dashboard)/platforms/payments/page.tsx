'use client';

// React Imports
import { useEffect } from 'react';

// MUI Imports
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

// Component Imports
import PaymentsTable from '@views/payments/PaymentsTable';

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchAllPayments } from '@/store/slices/paymentsSlice';
import PaymentOverview from '@/views/payments/PaymentOverview';
import PaymentStats from '@/views/payments/PaymentStats';

const PaymentsPage = () => {
  const dispatch = useAppDispatch();
  const { payments, isLoading, error } = useAppSelector(state => state.payments);

  useEffect(() => {
    dispatch(fetchAllPayments());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 4 }}>
        {error}
      </Alert>
    );
  }

  if (!payments || payments.length === 0) {
    return <Alert severity='info'>No payments data available</Alert>;
  }

  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h5'>Payments Management</Typography>
        <Typography variant='body2'>Monitor and manage all payment transactions</Typography>
      </Box>

      <Grid container spacing={6}>
        {/* Payment Overview */}
        <Grid item xs={12} md={4}>
          <PaymentOverview payments={payments} />
        </Grid>

        {/* Payment Stats */}
        <Grid item xs={12} md={8}>
          <PaymentStats payments={payments} />
        </Grid>

        {/* Payments Table */}
        <Grid item xs={12}>
          <PaymentsTable payments={payments} />
        </Grid>
      </Grid>
    </>
  );
};

export default PaymentsPage;
