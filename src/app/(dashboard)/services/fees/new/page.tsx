'use client'

import { useState } from 'react'
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
import { createServiceFee } from '@/store/slices/feesSlice'

const CreateFeeServicePage = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector(state => state.fees)

  const [formData, setFormData] = useState({
    name: '',
    type: 'standard'
  })

  const [formErrors, setFormErrors] = useState({
    name: ''
  })

  const [successMessage, setSuccessMessage] = useState('')

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

  const validateForm = () => {
    const errors = {}
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = 'Fee service name is required'
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
      await dispatch(createServiceFee(formData)).unwrap()
      setSuccessMessage('Fee service created successfully')

      // Reset form after successful creation
      setFormData({
        name: '',
        type: 'standard'
      })

      // Redirect after short delay
      setTimeout(() => {
        router.push('/fees')
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
                    </Select>
                    <FormHelperText>Select the type of fee service</FormHelperText>
                  </FormControl>
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
