'use client';

import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// Components Imports
import OptionMenu from '@core/components/option-menu';
import CustomAvatar from '@core/components/mui/Avatar';

// Type Imports
import type { ThemeColor } from '@core/types';
import { DashboardStats } from '@/store/slices/dashboardSlice';

type DataType = {
	icon: string;
	stats: string | number;
	title: string;
	color: ThemeColor;
	isAccordion?: boolean;
};

const MetricsOverview = ({ dashboardData }: { dashboardData: DashboardStats }) => {
	// Format metrics data
	const data: DataType[] = [
		{
			stats: dashboardData?.total_users || '0',
			title: 'Total Users',
			color: 'success',
			icon: 'ri-group-line'
		},
		{
			stats: dashboardData?.total_service_fees || '0',
			title: 'Total Fee Services',
			color: 'primary',
			icon: 'ri-money-dollar-circle-line',
			isAccordion: true
		},
		{
			stats: dashboardData?.total_service_taxes || '0',
			title: 'Total Tax Services',
			color: 'warning',
			icon: 'ri-file-list-3-line',
			isAccordion: true
		}
	];

	return (
		<Card className='bs-full'>
			<CardHeader
				title='Platform Metrics'
				action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Export']} />}
				subheader={
					<p className='mbs-3'>
						<span className='font-medium text-textPrimary'>System Overview</span>
						<span className='text-textSecondary'> - current stats</span>
					</p>
				}
			/>
			<CardContent className='!pbs-5'>
				<Grid container spacing={2}>
					{data.map((item, index) => (
						<Grid item xs={6} md={4} key={index}>
							{item.isAccordion ? (
								<Accordion className='shadow-none'>
									<AccordionSummary expandIcon={<i className='ri-arrow-down-s-line' />}>
										<div className='flex items-center gap-3'>
											<CustomAvatar variant='rounded' color={item.color} className='shadow-xs'>
												<i className={item.icon}></i>
											</CustomAvatar>
											<div>
												<Typography>{item.title}</Typography>
												<Typography variant='h5'>{item.stats}</Typography>
											</div>
										</div>
									</AccordionSummary>
									<AccordionDetails>
										{item.title.toLocaleLowerCase().includes('fee') ? (
											<div className='flex flex-col gap-2'>
												<Typography variant='subtitle1'>Breakdown</Typography>
												<Typography>Businesses: {dashboardData?.service_fees_business || 0}</Typography>
												<Typography>Government: {dashboardData?.service_fees_government || 0}</Typography>
											</div>
										) : (
											<div className='flex flex-col gap-2'>
												<Typography variant='subtitle1'> Breakdown</Typography>
												<Typography>Private Sector: {dashboardData?.service_taxes_private || 0}</Typography>
												<Typography>Governmental: {dashboardData?.service_taxes_governmental || 0}</Typography>
											</div>
										)}
									</AccordionDetails>
								</Accordion>
							) : (
								<div className='flex items-center gap-3'>
									<CustomAvatar variant='rounded' color={item.color} className='shadow-xs'>
										<i className={item.icon}></i>
									</CustomAvatar>
									<div>
										<Typography>{item.title}</Typography>
										<Typography variant='h5'>{item.stats}</Typography>
									</div>
								</div>
							)}
						</Grid>
					))}
				</Grid>
			</CardContent>
		</Card>
	);
};

export default MetricsOverview;
