'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const CashworxsWeeklyOverview = () => {
  // Hooks
  const theme = useTheme()

  // Sample data - in a real app, you would calculate this from your backend data
  const series = [
    {
      name: 'Users',
      data: [28, 40, 36, 52, 38, 60, 55]
    },
    {
      name: 'Transactions',
      data: [14, 25, 20, 34, 20, 40, 25]
    }
  ]

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
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
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
  }

  return (
    <Card>
      <CardHeader title='Weekly Overview' />
      <CardContent>
        <AppReactApexCharts type='bar' height={300} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default CashworxsWeeklyOverview
