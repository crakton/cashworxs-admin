'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'
import { DashboardStats } from '@/store/slices/dashboardSlice'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const FeesDistribution = ({ dashboardData }: { dashboardData: DashboardStats }) => {
  // Hooks
  const theme = useTheme()

  // Calculate percentages based on total fees
  const totalFeesCount = dashboardData?.total_fees || 0
  const totalTaxesCount = dashboardData?.total_taxes || 0
  const totalServiceFeesCount = dashboardData?.total_service_fees || 0
  const totalServiceTaxesCount = dashboardData?.total_service_taxes || 0

  const total = totalFeesCount + totalTaxesCount + totalServiceFeesCount

  const feePercentage = total > 0 ? Math.round((totalFeesCount / total) * 100) : 0
  const taxPercentage = total > 0 ? Math.round((totalTaxesCount / total) * 100) : 0
  const serviceFeesPercentage = total > 0 ? Math.round((totalServiceFeesCount / total) * 100) : 0
  const serviceTaxesPercentage = total > 0 ? Math.round((totalServiceTaxesCount / total) * 100) : 0

  // Chart data
  const series = [feePercentage, taxPercentage, serviceFeesPercentage, serviceTaxesPercentage]

  // Chart options
  const options: ApexOptions = {
    stroke: { width: 0 },
    labels: ['Fees', 'Taxes', 'Service Fees', 'Service Taxes'],
    colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.info.main],
    dataLabels: {
      enabled: true,
      formatter: val => `${val}%`
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true
            },
            value: {
              show: true,
              formatter: val => `${val}%`
            },
            total: {
              show: true,
              label: 'Total',
              formatter: () => `${total}`
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 992,
        options: {
          chart: {
            height: 380
          },
          legend: {
            position: 'bottom'
          }
        }
      },
      {
        breakpoint: 576,
        options: {
          chart: {
            height: 320
          },
          plotOptions: {
            pie: {
              donut: {
                labels: {
                  show: true,
                  name: {
                    show: true
                  },
                  value: {
                    show: true
                  },
                  total: {
                    show: true
                  }
                }
              }
            }
          }
        }
      }
    ]
  }

  return (
    <Card>
      <CardHeader title='Fee Distribution' subheader='Breakdown of fees by type' />
      <CardContent>
        <Typography variant='h6' align='center' sx={{ mb: 2 }}>
          Total Records: {total}
        </Typography>
        <AppReactApexCharts type='donut' height={300} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default FeesDistribution
