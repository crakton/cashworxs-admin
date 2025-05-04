'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Component Imports
import Link from '@components/Link'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'

const RecentTransactions = ({ transactions = [] }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader
        title='Recent Transactions'
        action={
          <Typography component={Link} className='font-medium' color='primary'>
            View All
          </Typography>
        }
      />
      <CardContent className='flex flex-col gap-5'>
        {transactions.map((item, index) => (
          <div key={index} className='flex items-center gap-4'>
            <CustomAvatar color='success' variant='rounded'>
              <i className='ri-money-dollar-circle-line'></i>
            </CustomAvatar>
            <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  {item.description || `Fee #${item.id || index + 1}`}
                </Typography>
                <Typography>{item.user?.name || 'Unknown User'}</Typography>
              </div>
              <div className='flex flex-col items-end gap-0.5'>
                <Typography color='success.main' className='font-medium'>
                  ${item.amount?.toFixed(2) || '0.00'}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {formatDate(item.created_at)}
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default RecentTransactions
