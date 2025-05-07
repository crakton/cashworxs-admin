'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { createServiceFee, fetchOrganizations } from '@/store/slices/feesSlice'

const CreateFeeServicePage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error, organizations } = useAppSelector(state => state.fees)

  const [formData, setFormData] = useState({
    name: '',
    type: 'standard',
    state: 'active',
    amount: '',
    description: '',
    status: 1,
    organization_id: '', // Added organization_id field
    metadata: {
      payment_type: 'one_time',
      payment_support: ['card', 'bank']
    }
  })

  const [formErrors, setFormErrors] = useState({
    name: '',
    amount: '',
    organization_id: '' // Added organization_id validation
  })

  const [successMessage, setSuccessMessage] = useState('')

  // Fetch organizations when component mounts
  useEffect(() => {
    dispatch(fetchOrganizations())
  }, [dispatch])

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleStatusChange = e => {
    setFormData(prev => ({
      ...prev,
      status: e.target.value === 'active' ? 1 : 0
    }))
  }

  const handleMetadataChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value
      }
    }))
  }

  const validateForm = () => {
    const errors = {
      name: '',
      amount: '',
      organization_id: ''
    }
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Fee service name is required'
      isValid = false
    }

    if (!formData.amount) {
      errors.amount = 'Amount is required'
      isValid = false
    }

    if (!formData.organization_id) {
      errors.organization_id = 'Organization is required'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await dispatch(
        createServiceFee({
          ...formData,
          amount: formData.amount.toString()
        })
      ).unwrap()

      setSuccessMessage('Fee service created successfully')

      // Reset form after successful creation
      setFormData({
        name: '',
        type: 'standard',
        state: 'active',
        amount: '',
        description: '',
        status: 1,
        organization_id: '',
        metadata: {
          payment_type: 'one_time',
          payment_support: ['card', 'bank']
        }
      })

      // Redirect after short delay
      setTimeout(() => {
        router.push('/services/fees')
      }, 1500)
    } catch (err) {
      console.error('Failed to create fee service:', err)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
          <Link underline='hover' color='inherit' href='/dashboard'>
            Dashboard
          </Link>
          <Link underline='hover' color='inherit' href='/fees'>
            Fee Services
          </Link>
          <Typography color='text.primary'>Create New</Typography>
        </Breadcrumbs>

        <Card>
          <CardHeader title='Create New Fee Service' subheader='Add a new fee service to the system' />
          <Divider />
          <CardContent>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }}>
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity='success' sx={{ mb: 4 }}>
                <AlertTitle>Success</AlertTitle>
                {successMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Fee Service Name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    required
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!formErrors.organization_id}>
                    <InputLabel id='organization-label'>Organization</InputLabel>
                    <Select
                      labelId='organization-label'
                      name='organization_id'
                      value={formData.organization_id}
                      onChange={handleInputChange}
                      label='Organization'
                      disabled={isLoading}
                    >
                      {organizations.map(org => (
                        <MenuItem key={org.id} value={org.id}>
                          {org.name}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText error={!!formErrors.organization_id}>
                      {formErrors.organization_id || 'Select the organization this fee belongs to'}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id='fee-type-label'>Fee Type</InputLabel>
                    <Select
                      labelId='fee-type-label'
                      name='type'
                      value={formData.type}
                      onChange={handleInputChange}
                      label='Fee Type'
                      disabled={isLoading}
                    >
                      <MenuItem value='standard'>Standard</MenuItem>
                      <MenuItem value='premium'>Premium</MenuItem>
                      <MenuItem value='custom'>Custom</MenuItem>
                      <MenuItem value='government'>Government</MenuItem>
                      <MenuItem value='private'>Private</MenuItem>
                    </Select>
                    <FormHelperText>Select the type of fee service</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Amount'
                    name='amount'
                    type='number'
                    value={formData.amount}
                    onChange={handleInputChange}
                    error={!!formErrors.amount}
                    helperText={formErrors.amount || 'Enter the base amount for this fee service'}
                    required
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id='fee-state-label'>State</InputLabel>
                    <Select
                      labelId='fee-state-label'
                      name='state'
                      value={formData.state}
                      onChange={handleInputChange}
                      label='State'
                      disabled={isLoading}
                    >
                      <MenuItem value='active'>Active</MenuItem>
                      <MenuItem value='inactive'>Inactive</MenuItem>
                      <MenuItem value='pending'>Pending</MenuItem>
                      <MenuItem value='federal'>Federal</MenuItem>
                      <MenuItem value='lagos'>Lagos</MenuItem>
                      <MenuItem value='nationwide'>Nationwide</MenuItem>
                    </Select>
                    <FormHelperText>Current state of this fee service</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id='fee-status-label'>Status</InputLabel>
                    <Select
                      labelId='fee-status-label'
                      name='status'
                      value={formData.status === 1 ? 'active' : 'inactive'}
                      onChange={handleStatusChange}
                      label='Status'
                      disabled={isLoading}
                    >
                      <MenuItem value='active'>Active</MenuItem>
                      <MenuItem value='inactive'>Inactive</MenuItem>
                    </Select>
                    <FormHelperText>Set the status of this fee service</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id='payment-type-label'>Payment Type</InputLabel>
                    <Select
                      labelId='payment-type-label'
                      name='payment_type'
                      value={formData.metadata.payment_type}
                      onChange={handleMetadataChange}
                      label='Payment Type'
                      disabled={isLoading}
                    >
                      <MenuItem value='one_time'>One-time</MenuItem>
                      <MenuItem value='recurring'>Recurring</MenuItem>
                      <MenuItem value='installment'>Installment</MenuItem>
                      <MenuItem value='annual'>Annual</MenuItem>
                    </Select>
                    <FormHelperText>Type of payment for this fee service</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Description'
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={3}
                    helperText='Provide a description of this fee service (optional)'
                    disabled={isLoading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Paper elevation={0} variant='outlined' sx={{ p: 3, backgroundColor: 'background.paper' }}>
                    <Typography variant='subtitle1' gutterBottom>
                      Note:
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      After creating the fee service, you can add specific service items to it from the details page.
                      Service items will include specific amounts, payment methods, and other details.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button variant='outlined' onClick={handleCancel} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      variant='contained'
                      disabled={isLoading}
                      startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    >
                      {isLoading ? 'Creating...' : 'Create Fee Service'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default CreateFeeServicePage
