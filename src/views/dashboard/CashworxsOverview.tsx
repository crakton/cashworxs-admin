'use client';

import type { FC } from 'react';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const CashworxsOverview: FC<{ totalUsers: number; totalFees: number }> = ({ totalUsers, totalFees }) => {
  return (
    <Card>
      <CardContent className='flex flex-col gap-2 relative items-start'>
        <div>
          <Typography variant='h5'>Welcome to Cashworxs Admin! 🚀</Typography>
        </div>
        <div>
          <Typography variant='h4' color='primary'>
            {totalUsers} Users
          </Typography>
          <Typography>{totalFees} Total Transactions 💰</Typography>
        </div>
        <Button size='small' variant='contained'>
          View Details
        </Button>
        <img
          src='/images/pages/dashboard-illustration.png'
          alt='dashboard overview'
          height={102}
          className='absolute inline-end-7 bottom-6'
        />
      </CardContent>
    </Card>
  );
};

export default CashworxsOverview;
