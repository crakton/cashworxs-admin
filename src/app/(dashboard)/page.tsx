'use client';

// Next Imports
import { useEffect } from 'react';

// MUI Imports
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Components Imports
import { LinearProgress } from '@mui/material';

import CashworxsOverview from '@views/dashboard/CashworxsOverview';
import MetricsOverview from '@views/dashboard/MetricsOverview';
import RecentTransactions from '@views/dashboard/RecentTransactions';
import RecentUsers from '@views/dashboard/RecentUsers';
import CashworxsWeeklyOverview from '@views/dashboard/CashworxsWeeklyOverview';
import FeesDistribution from '@views/dashboard/FeesDistribution';
import CardStatVertical from '@components/card-statistics/Vertical';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchDashboardStats } from '@/store/slices/dashboardSlice';

const CashworxsAdminDashboard = () => {
	const dispatch = useAppDispatch();
	const { stats, isLoading, error } = useAppSelector(state => state.dashboard);

	useEffect(() => {
		dispatch(fetchDashboardStats());
	}, [dispatch]);

	if (isLoading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
				<LinearProgress />
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

	if (!stats) {
		return <Alert severity='info'>No dashboard data available</Alert>;
	}

	return (
		<Grid container spacing={6}>
			{/* Overview Card */}
			<Grid item xs={12} md={4}>
				<CashworxsOverview totalUsers={stats.total_users} total_transactions={stats.total_transactions} />
			</Grid>

			{/* Metrics Overview */}
			<Grid item xs={12} md={8}>
				<MetricsOverview dashboardData={stats} />
			</Grid>

			{/* Weekly Overview Chart */}
			<Grid item xs={12} md={16} lg={8}>
				<CashworxsWeeklyOverview />
			</Grid>

			{/* Stats Grid */}
			<Grid item xs={12} md={6} lg={4}>
				<Grid container spacing={6}>
					<Grid item xs={12} sm={6}>
						<CardStatVertical
							title='User Growth'
							stats={stats.success_rate?.toPrecision(2) + '%'}
							avatarIcon='ri-user-add-line'
							avatarColor='success'
							subtitle='This month'
							trendNumber='16%'
							trend='positive'
						/>
					</Grid>
					<Grid item xs={12} sm={6}>
						<CardStatVertical
							stats={'$' + stats.total_revenue?.toLocaleString()}
							trend='positive'
							trendNumber='8.2%'
							title='Total Revenue'
							subtitle='This quarter'
							avatarColor='primary'
							avatarIcon='ri-money-dollar-circle-line'
						/>
					</Grid>
					<Grid item xs={12} sm={6}>
						<CardStatVertical
							stats={stats.new_transactions?.toLocaleString()}
							trend='negative'
							trendNumber='3%'
							title='New Transactions'
							subtitle='This week'
							avatarColor='warning'
							avatarIcon='ri-exchange-dollar-line'
						/>
					</Grid>
				</Grid>
			</Grid>

			{/* Recent Users */}
			<Grid item xs={12} md={6} lg={4}>
				<RecentUsers users={stats.recent_users} />
			</Grid>
			{/* Recent Transactions */}
			<Grid item xs={12} lg={4}>
				<RecentTransactions transactions={stats.recent_transactions} />
			</Grid>
		</Grid>
	);
};

export default CashworxsAdminDashboard;
