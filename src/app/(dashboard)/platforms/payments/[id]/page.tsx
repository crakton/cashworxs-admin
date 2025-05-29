'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  Box,
  Divider,
  Skeleton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchPaymentDetails } from '@/store/slices/paymentsSlice';
import { formateNumber } from '@/utils/formatDate';
import formatDate from '@/utils/formatDate';
import { exportToCSV } from '@/utils';

const PaymentReceiptPreviewPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { currentPayment: payment, isLoading, error } = useAppSelector(state => state.payments);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (typeof id === 'string') {
      dispatch(fetchPaymentDetails(id))
        .unwrap()
        .catch(err => {
          setFetchError(err.message || 'Failed to load payment receipt details');
        });
    }
  }, [dispatch, id]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'success';
      case 0:
        return 'warning';
      default:
        return 'error';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'Completed';
      case 0:
        return 'Pending';
      default:
        return 'Failed';
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleExportReceipt = () => {
    if (payment) {
      exportToCSV([payment]);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={<Skeleton width='60%' />} />
            <LinearProgress sx={{ height: 4 }} />
            <CardContent>
              <Skeleton variant='text' width='40%' height={40} sx={{ mb: 2 }} />
              <Skeleton variant='text' width='30%' height={30} sx={{ mb: 2 }} />
              <Skeleton variant='text' width='25%' height={30} sx={{ mb: 2 }} />
              <Skeleton variant='text' width='35%' height={30} sx={{ mb: 2 }} />
              <Skeleton variant='rectangular' width={180} height={40} sx={{ mt: 4 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // Error state
  if (fetchError || error || !payment) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert
            severity='error'
            sx={{ mb: 4 }}
            action={
              <Button color='inherit' size='small' onClick={handleGoBack}>
                Go Back
              </Button>
            }
          >
            <AlertTitle>Error</AlertTitle>
            {fetchError || error || 'Payment receipt not found'}
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={6}>
      {/* Receipt Header */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={`Receipt #${payment.receipt_no}`}
            action={
              <Button variant='outlined' onClick={handleGoBack}>
                <i className='ri ri-arrow-left-line' style={{ marginRight: '8px' }}></i>
                Back to Receipts
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Box>
                <Typography variant='h6' sx={{ mb: 2 }}>Receipt Status</Typography>
                <Chip
                  label={getStatusLabel(payment.status)}
                  color={getStatusColor(payment.status)}
                  sx={{ fontSize: '1rem', py: 1, px: 2, mb: 2 }}
                />
              </Box>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 2, md: 0 } }}>
                <Typography variant='h6' sx={{ mb: 2 }}>Receipt Date</Typography>
                <Typography variant='body1'>{formatDate(payment.tdate)}</Typography>
              </Box>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: theme.palette.background.default }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' color='text.secondary'>Payer</Typography>
                  <Typography variant='h6' sx={{ mb: 2, fontWeight: 'medium' }}>{payment?.invoice?.c_name??'N/A'}</Typography>
                  
                  <Typography variant='subtitle2' color='text.secondary'>Description</Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>{payment.note}</Typography>
                  
                  <Typography variant='subtitle2' color='text.secondary'>Invoice Number</Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>{payment.invoice_number}</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' color='text.secondary'>Organization</Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>{payment.payload?.InstitutionName??'N/A'}</Typography>
                  
                  <Typography variant='subtitle2' color='text.secondary'>Organization ID</Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>{payment.payload?.InstitutionId??'N/A'}</Typography>
                  
                  <Typography variant='subtitle2' color='text.secondary'>Receipt Number</Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>{payment.receipt_no}</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead sx={{ bgcolor: theme.palette.primary.light }}>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{payment.note || 'Payment for services'}</TableCell>
                    <TableCell align="right">{formateNumber(Number(payment.amount))}</TableCell>
                  </TableRow>
                  <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: `1px solid ${theme.palette.divider}` } }}>
                    <TableCell>Total</TableCell>
                    <TableCell align="right">{formateNumber(Number(payment.amount))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant='contained' 
                onClick={handleExportReceipt}
                startIcon={<i className='ri ri-download-line'></i>}
              >
                Export Receipt
              </Button>
              {payment.status === 0 && (
                <Button 
                  variant='outlined' 
                  color='success'
                  startIcon={<i className='ri ri-check-line'></i>}
                >
                  Mark as Completed
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Additional Information */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title="Payment Information" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>Payment Method</Typography>
                    <Typography variant='body1'>
                      {payment.payload?.PaymentMethod  || 'Online Payment'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>Transaction ID</Typography>
                    <Typography variant='body1'>{payment.payload?.PaymentLogId || payment.receipt_no}</Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>Payment Date</Typography>
                    <Typography variant='body1'>{formatDate(payment.tdate)}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant='subtitle2' color='text.secondary'>Amount Paid</Typography>
                    <Typography variant='h5' color={theme.palette.success.main}>
                      {formateNumber(Number(payment.amount))}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PaymentReceiptPreviewPage;