'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  Box,
  Divider,
  Skeleton
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { fetchInvoiceDetails } from '@/store/slices/invoicesSlice'
import { formateNumber } from '@/utils/formatDate'

const InvoiceDetailsPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { currentInvoice: invoice, isLoading, error } = useAppSelector(state => state.invoices)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    if (typeof id === 'string') {
      dispatch(fetchInvoiceDetails(id))
        .unwrap()
        .catch(err => {
          setFetchError(err.message || 'Failed to load invoice details')
        })
    }
  }, [dispatch, id])

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'success'
      case 0:
        return 'warning'
      default:
        return 'error'
    }
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'Paid'
      case 0:
        return 'Pending'
      default:
        return 'Overdued'
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  // Loading state
  if (isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={<Skeleton width='60%' />} />
            <LinearProgress sx={{ height: 4 }} />
            <CardContent>
              <Skeleton variant='text' width='40%' height={40} sx={{ mb: 2 }} />
              <Skeleton variant='text' width='30%' height={30} sx={{ mb: 2 }} />
              <Skeleton variant='text' width='25%' height={30} sx={{ mb: 2 }} />
              <Skeleton variant='text' width='35%' height={30} sx={{ mb: 2 }} />
              <Skeleton variant='rectangular' width={180} height={40} sx={{ mt: 4 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // Error state
  if (fetchError || error || !invoice) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert
            severity='error'
            sx={{ mb: 4 }}
            action={
              <Button color='inherit' size='small' onClick={handleGoBack}>
                Go Back
              </Button>
            }
          >
            <AlertTitle>Error</AlertTitle>
            {fetchError || error || 'Invoice not found'}
          </Alert>
        </Grid>
      </Grid>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={`Invoice #${invoice.id}`}
            action={
              <Button variant='outlined' onClick={handleGoBack}>
                <i className='ri ri-arrow-left-line mr-2'></i>
                Back to Invoices
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Client
                </Typography>
                <Typography variant='body1' sx={{ mb: 3 }}>
                  {invoice.c_name}
                </Typography>

                <Typography variant='subtitle2' color='text.secondary'>
                  Amount
                </Typography>
                <Typography variant='body1' sx={{ mb: 3, fontWeight: 'bold' }}>
                  {formateNumber(Number(invoice.amount))}
                </Typography>

                <Typography variant='subtitle2' color='text.secondary'>
                  Status
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Chip label={getStatusLabel(invoice.status)} color={getStatusColor(invoice.status)} size='small' />
                </Box>

                <Typography variant='subtitle2' color='text.secondary'>
                  Date
                </Typography>
                <Typography variant='body1' sx={{ mb: 3 }}>
                  {new Date(invoice.tdate).toLocaleDateString()}
                </Typography>
              </Grid>

              {invoice.invoice_number && (
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    Invoice Number
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 3 }}>
                    {invoice.invoice_number}
                  </Typography>
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button variant='contained'>
                <i className='ri ri-download-line mr-2'></i>
                Download Invoice
              </Button>
              {invoice.status === 0 && (
                <Button variant='outlined' color='success'>
                  <i className='ri ri-check-line mr-2'></i>
                  Mark as Paid
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default InvoiceDetailsPage
