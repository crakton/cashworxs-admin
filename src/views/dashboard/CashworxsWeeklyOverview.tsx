'use client';

// Next Imports
import dynamic from 'next/dynamic';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// Third-party Imports
import type { ApexOptions } from 'apexcharts';
import theme from '@/@core/theme';
import { useAppSelector } from '@/hooks/useRedux';

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'));

const CashworxsWeeklyOverview = () => {
	const { stats } = useAppSelector(state => state.dashboard);
	const theme = useTheme();

	const series = [
		{
			name: 'Users',
			data: stats?.weekly_data?.users || []
		},
		{
			name: 'Transactions',
			data: stats?.weekly_data?.transactions || []
		}
	];

	// Chart options
	const options: ApexOptions = {
		chart: {
			parentHeightOffset: 0,
			toolbar: { show: false }
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: '30%'
			}
		},
		colors: [theme.palette.primary.main, theme.palette.success.main],
		grid: {
			borderColor: theme.palette.divider,
			padding: { top: -10 },
			xaxis: {
				lines: { show: false }
			}
		},
		xaxis: {
			axisBorder: { show: false },
			axisTicks: { show: false },
			categories: stats?.weekly_data?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
		},
		yaxis: {
			labels: {
				formatter: val => `${val}`
			}
		},
		legend: {
			show: true,
			position: 'top',
			fontSize: '14px',
			itemMargin: { horizontal: 8 }
		}
	};

	return (
		<Card>
			<CardHeader title='Weekly Overview' />
			<CardContent>
				<AppReactApexCharts type='bar' height={300} options={options} series={series} />
			</CardContent>
		</Card>
	);
};

export default CashworxsWeeklyOverview;
