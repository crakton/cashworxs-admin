'use client';

// MUI Imports
import type { FC } from 'react';
import { useMemo } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// Types Import
import type { Payment } from '@/store/slices/paymentsSlice';

// React Imports
import { formateNumber } from '@/utils/formatDate';

interface PaymentOverviewProps {
  payments: Payment[]
}

const PaymentOverview: FC<PaymentOverviewProps> = ({ payments }) => {
  const theme = useTheme();

  // Calculate payment statistics
  const stats = useMemo(() => {
    if (!payments || payments.length === 0) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        completedTransactions: 0,
        completedAmount: 0,
        pendingTransactions: 0
      };
    }

    const totalAmount = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const completedPayments = payments.filter(payment => payment.status === 1);
    const pendingPayments = payments.filter(payment => payment.status === 0);
    const completedAmount = completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return {
      totalTransactions: payments.length,
      totalAmount,
      completedTransactions: completedPayments.length,
      completedAmount,
      pendingTransactions: pendingPayments.length
    };
  }, [payments]);

  return (
    <Card>
      <CardContent className='flex flex-col gap-2 relative items-start'>
        <div>
          <Typography variant='h5'>Payments Overview</Typography>
          <Typography>Manage all payment transactions</Typography>
        </div>
        <Box sx={{ mt: 2 }}>
          <Typography variant='h4' color='primary'>
            {formateNumber(stats.totalAmount)}
          </Typography>
          <Typography variant='body2'>{stats.totalTransactions} Total Transactions</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant='body1' sx={{ fontWeight: 500, color: theme.palette.success.main }}>
            {formateNumber(stats.completedAmount)} Completed
          </Typography>
          <Typography variant='body2'>{stats.completedTransactions} Completed Transactions</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant='body1' sx={{ fontWeight: 500, color: theme.palette.warning.main }}>
            {stats.pendingTransactions} Pending Transactions
          </Typography>
        </Box>
        {/* <Button size='small' variant='contained' sx={{ mt: 2 }}>
          View Details
        </Button> */}
      </CardContent>
    </Card>
  );
};

export default PaymentOverview;
