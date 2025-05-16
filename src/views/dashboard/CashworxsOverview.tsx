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
			</CardContent>
		</Card>
	);
};

export default CashworxsOverview;
