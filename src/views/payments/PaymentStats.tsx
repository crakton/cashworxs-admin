'use client';

// MUI Imports
import type { FC } from 'react';
import { useMemo } from 'react';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// Types Import
import type { Payment } from '@/store/slices/paymentsSlice';

// React Imports

interface PaymentMethodStat {
  name: string
  count: number
  amount: number
  percentage: number
}

interface PaymentStatsProps {
  payments: Payment[]
}

const PaymentStats: FC<PaymentStatsProps> = ({ payments }) => {
  const theme = useTheme();

  // Calculate payment method statistics
  // const paymentMethodStats = useMemo(() => {
  //   const methodCounts: Record<string, { count: number; amount: number }> = {}
  //   const totalPayments = payments.length

  //   // Count occurrences of each payment method
  //   payments.forEach(payment => {
  //     const method = payment.payment_method.toLowerCase()
  //     if (!methodCounts[method]) {
  //       methodCounts[method] = { count: 0, amount: 0 }
  //     }
  //     methodCounts[method].count++
  //     methodCounts[method].amount += payment.amount
  //   })

  //   // Convert to array and calculate percentages
  //   const stats: PaymentMethodStat[] = Object.entries(methodCounts).map(([name, { count, amount }]) => ({
  //     name,
  //     count,
  //     amount,
  //     percentage: (count / totalPayments) * 100
  //   }))

  //   // Sort by count (descending)
  //   return stats.sort((a, b) => b.count - a.count)
  // }, [payments])

  // Get color for payment method
  // const getMethodColor = (method: string) => {
  //   switch (method.toLowerCase()) {
  //     case 'credit card':
  //       return theme.palette.primary.main;
  //     case 'paypal':
  //       return theme.palette.info.main;
  //     case 'bank transfer':
  //       return theme.palette.success.main;
  //     case 'crypto':
  //       return theme.palette.warning.main;
  //     default:
  //       return theme.palette.secondary.main;
  //   }
  // };

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3 }}>
          Payment Methods
        </Typography>

        {/* <Grid container spacing={4}>
          {paymentMethodStats.map((stat, index) => (
            <Grid item xs={12} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                  {stat.name}
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                  {stat.count} ({stat.percentage.toFixed(1)}%)
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 2 }}>
                  <LinearProgress
                    variant='determinate'
                    value={stat.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 5,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getMethodColor(stat.name)
                      }
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 80 }}>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    ${stat.amount.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid> */}

        <Box sx={{ mt: 4 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Payment Status Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.success.light, borderRadius: 1 }}>
                <Typography variant='h6'>{payments.filter(p => p.status === 1).length}</Typography>
                <Typography variant='body2'>Completed</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.warning.light, borderRadius: 1 }}>
                <Typography variant='h6'>{payments.filter(p => p.status === 0).length}</Typography>
                <Typography variant='body2'>Pending</Typography>
              </Box>
            </Grid>
            {/* <Grid item xs={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.error.light, borderRadius: 1 }}>
                <Typography variant='h6'>{payments.filter(p => p.status.toLowerCase() === 'failed').length}</Typography>
                <Typography variant='body2'>Failed</Typography>
              </Box>
            </Grid> */}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentStats;
