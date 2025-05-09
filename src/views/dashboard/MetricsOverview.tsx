'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Type Imports
import type { ThemeColor } from '@core/types'
import { DashboardStats } from '@/store/slices/dashboardSlice'

type DataType = {
  icon: string
  stats: string | number
  title: string
  color: ThemeColor
}

const MetricsOverview = ({ dashboardData }: { dashboardData: DashboardStats }) => {
  // Format metrics data
  const data: DataType[] = [
    {
      stats: dashboardData?.total_users || '0',
      title: 'Users',
      color: 'success',
      icon: 'ri-group-line'
    },
    {
      stats: dashboardData?.total_fees || '0',
      title: 'Fees',
      color: 'primary',
      icon: 'ri-money-dollar-circle-line'
    },
    {
      stats: dashboardData?.total_taxes || '0',
      color: 'warning',
      title: 'Taxes',
      icon: 'ri-file-list-3-line'
    },
    {
      stats: dashboardData?.total_service_fees || '0',
      color: 'info',
      title: 'Service Fees',
      icon: 'ri-service-line'
    },
    {
      stats: dashboardData?.total_service_taxes || '0',
      color: 'error',
      title: 'Service Taxes',
      icon: 'ri-file-list-3-line'
    }
  ]

  return (
    <Card className='bs-full'>
      <CardHeader
        title='Platform Metrics'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Export', 'Details']} />}
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
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' color={item.color} className='shadow-xs'>
                  <i className={item.icon}></i>
                </CustomAvatar>
                <div>
                  <Typography>{item.title}</Typography>
                  <Typography variant='h5'>{item.stats}</Typography>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default MetricsOverview
