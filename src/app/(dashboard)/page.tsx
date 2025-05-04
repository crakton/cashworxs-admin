'use client'

// Next Imports
import { useEffect } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Components Imports
import CashworxsOverview from '@views/dashboard/CashworxsOverview'
import MetricsOverview from '@views/dashboard/MetricsOverview'
import RecentTransactions from '@views/dashboard/RecentTransactions'
import RecentUsers from '@views/dashboard/RecentUsers'
import CashworxsWeeklyOverview from '@views/dashboard/CashworxsWeeklyOverview'
import FeesDistribution from '@views/dashboard/FeesDistribution'
import CardStatVertical from '@components/card-statistics/Vertical'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { fetchDashboardStats } from '@/store/slices/dashboardSlice'
import { LinearProgress } from '@mui/material'

const CashworxsAdminDashboard = () => {
  const dispatch = useAppDispatch()
  const { stats, isLoading, error } = useAppSelector(state => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardStats())
  }, [dispatch])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mb: 4 }}>
        {error}
      </Alert>
    )
  }

  if (!stats) {
    return <Alert severity='info'>No dashboard data available</Alert>
  }

  return (
    <Grid container spacing={6}>
      {/* Overview Card */}
      <Grid item xs={12} md={4}>
        <CashworxsOverview totalUsers={stats.total_users} totalFees={stats.total_fees} />
      </Grid>

      {/* Metrics Overview */}
      <Grid item xs={12} md={8}>
        <MetricsOverview dashboardData={stats} />
      </Grid>

      {/* Weekly Overview Chart */}
      <Grid item xs={12} md={6} lg={8}>
        <CashworxsWeeklyOverview />
      </Grid>

      {/* Fee Distribution */}
      <Grid item xs={12} md={6} lg={4}>
        <FeesDistribution dashboardData={stats} />
      </Grid>

      {/* Recent Users */}
      <Grid item xs={12} md={6} lg={4}>
        <RecentUsers users={stats.recent_users} />
      </Grid>

      {/* Stats Grid */}
      <Grid item xs={12} md={6} lg={4}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              title='User Growth'
              stats='+12.4%'
              avatarIcon='ri-user-add-line'
              avatarColor='success'
              subtitle='This month'
              trendNumber='16%'
              trend='positive'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              stats='$24.5k'
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
              stats='142'
              trend='negative'
              trendNumber='3%'
              title='New Transactions'
              subtitle='This week'
              avatarColor='warning'
              avatarIcon='ri-exchange-dollar-line'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              stats='68.2%'
              trend='positive'
              trendNumber='5.4%'
              title='Success Rate'
              subtitle='This month'
              avatarColor='info'
              avatarIcon='ri-check-double-line'
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <Grid item xs={12} lg={4}>
        <RecentTransactions transactions={stats.recent_transactions} />
      </Grid>
    </Grid>
  )
}

export default CashworxsAdminDashboard
