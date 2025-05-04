'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { fetchServiceTaxes, deleteServiceTax } from '@/store/slices/taxesSlice'

const ViewTaxService = () => {
  const router = useRouter()
  const params = useParams()
  const taxId = params.id as string

  const dispatch = useAppDispatch()
  const { serviceTaxes, isLoading, error } = useAppSelector(state => state.taxes)

  const [tax, setTax] = useState<any>(null)
  const [isLoadingTax, setIsLoadingTax] = useState(true)
  const [taxNotFound, setTaxNotFound] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false)
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false)

  // Fetch tax data
  useEffect(() => {
    const fetchData = async () => {
      if (serviceTaxes.length === 0) {
        await dispatch(fetchServiceTaxes())
      }

      const foundTax = serviceTaxes.find(tax => tax.id === taxId)

      if (foundTax) {
        setTax(foundTax)
        setIsLoadingTax(false)
      } else if (serviceTaxes.length > 0) {
        // If taxes were loaded but the specific tax wasn't found
        setTaxNotFound(true)
        setIsLoadingTax(false)
      }
    }

    fetchData()
  }, [taxId, dispatch, serviceTaxes])

  const handleDeleteDialogOpen = () => {
    setDeleteDialog(true)
  }

  const handleDeleteDialogClose = () => {
    setDeleteDialog(false)
  }

  const handleDelete = async () => {
    const result = await dispatch(deleteServiceTax(taxId))

    if (deleteServiceTax.fulfilled.match(result)) {
      setDeleteSuccess(true)
      setDeleteDialog(false)
      setTimeout(() => {
        router.push('/services/taxes')
      }, 1500)
    }
  }

  if (taxNotFound) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='error' gutterBottom>
          Tax service not found
        </Typography>
        <Typography variant='body1' paragraph>
          The tax service you are looking for could not be found.
        </Typography>
        <Button
          variant='contained'
          onClick={() => router.push('/services/taxes')}
          startIcon={<i className='ri ri-arrow-left-line'></i>}
        >
          Return to Tax Services
        </Button>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant='outlined'
            onClick={() => router.push('/services/taxes')}
            startIcon={<i className='ri ri-arrow-left-line'></i>}
          >
            Back to Tax Services
          </Button>
          {!isLoadingTax && tax && (
            <Box>
              <Button
                variant='outlined'
                component={Link}
                href={`/services/taxes/edit/${taxId}`}
                startIcon={<i className='ri ri-edit-line'></i>}
                sx={{ mr: 2 }}
              >
                Edit
              </Button>
              <Button
                variant='outlined'
                color='error'
                onClick={handleDeleteDialogOpen}
                startIcon={<i className='ri ri-delete-bin-5-line'></i>}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {deleteSuccess && (
          <Alert severity='success' sx={{ mb: 4 }}>
            Tax service deleted successfully! Redirecting...
          </Alert>
        )}

        <Card>
          <CardHeader title='Tax Service Details' />
          <Divider />
          <CardContent>
            {isLoadingTax ? (
              <>
                <Skeleton variant='text' width='60%' height={40} sx={{ mb: 2 }} />
                <Skeleton variant='text' width='40%' height={30} sx={{ mb: 2 }} />
                <Skeleton variant='text' width='70%' height={30} sx={{ mb: 2 }} />
                <Skeleton variant='text' width='50%' height={30} sx={{ mb: 2 }} />
                <Skeleton variant='rectangular' width='100%' height={100} sx={{ mb: 2 }} />
              </>
            ) : tax ? (
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    ID
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {tax.id}
                  </Typography>

                  <Typography variant='subtitle1' fontWeight='bold'>
                    Name
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {tax.name}
                  </Typography>

                  <Typography variant='subtitle1' fontWeight='bold'>
                    Type
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {tax.type.replace('_', ' ')}
                  </Typography>

                  <Typography variant='subtitle1' fontWeight='bold'>
                    State
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {tax.state}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Amount
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {tax.amount}
                  </Typography>

                  <Typography variant='subtitle1' fontWeight='bold'>
                    Status
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    <Chip
                      label={tax.status === 1 ? 'Active' : 'Inactive'}
                      color={tax.status === 1 ? 'success' : 'default'}
                    />
                  </Typography>

                  <Typography variant='subtitle1' fontWeight='bold'>
                    Created At
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {tax.created_at ? new Date(tax.created_at).toLocaleString() : 'N/A'}
                  </Typography>

                  <Typography variant='subtitle1' fontWeight='bold'>
                    Updated At
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {tax.updated_at ? new Date(tax.updated_at).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Description
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 3 }}>
                    {tax.description}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Payment Type
                  </Typography>
                  <Typography variant='body1' sx={{ mb: 2 }}>
                    {tax.metadata?.payment_type || 'N/A'}
                  </Typography>

                  <Typography variant='subtitle1' fontWeight='bold'>
                    Payment Support
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {tax.metadata?.payment_support && tax.metadata.payment_support.length > 0 ? (
                      tax.metadata.payment_support.map((support: string) => (
                        <Chip key={support} label={support} color='primary' />
                      ))
                    ) : (
                      <Typography variant='body2'>No payment support methods</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Alert severity='error' sx={{ mb: 4 }}>
                Tax service not found
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ViewTaxService
