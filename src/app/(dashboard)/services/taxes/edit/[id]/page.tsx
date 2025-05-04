'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import FormHelperText from '@mui/material/FormHelperText'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { updateServiceTax, fetchServiceTaxes, clearTaxError } from '@/store/slices/taxesSlice'
import { TaxService } from '@/store/slices/taxesSlice'

// Types
interface FormData {
  name: string
  type: string
  state: string
  amount: string
  description: string
  status: number
  metadata: {
    payment_support: string[]
    payment_type: string
  }
}

interface FormErrors {
  name?: string
  type?: string
  state?: string
  amount?: string
  description?: string
  payment_type?: string
}

const EditTaxService = () => {
  const router = useRouter()
  const params = useParams()
  const taxId = params.id as string

  const dispatch = useAppDispatch()
  const { serviceTaxes, isLoading, error } = useAppSelector(state => state.taxes)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    state: '',
    amount: '',
    description: '',
    status: 1,
    metadata: {
      payment_support: [],
      payment_type: ''
    }
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isLoadingTax, setIsLoadingTax] = useState(true)
  const [taxNotFound, setTaxNotFound] = useState(false)

  // Fetch tax data
  useEffect(() => {
    const fetchData = async () => {
      if (serviceTaxes.length === 0) {
        await dispatch(fetchServiceTaxes())
      }

      const tax = serviceTaxes.find(tax => tax.id === taxId)

      if (tax) {
        setFormData({
          name: tax.name,
          type: tax.type,
          state: tax.state,
          amount: tax.amount,
          description: tax.description,
          status: tax.status,
          metadata: {
            payment_support: tax.metadata.payment_support || [],
            payment_type: tax.metadata.payment_type || ''
          }
        })
        setIsLoadingTax(false)
      } else if (serviceTaxes.length > 0) {
        // If taxes were loaded but the specific tax wasn't found
        setTaxNotFound(true)
        setIsLoadingTax(false)
      }
    }

    fetchData()
  }, [taxId, dispatch, serviceTaxes])

  // Clear errors when unmounting
  useEffect(() => {
    return () => {
      dispatch(clearTaxError())
    }
  }, [dispatch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target

    if (name && name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else if (name) {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear specific error when field is changed
    if (name) {
      setFormErrors(prev => ({ ...prev, [name.replace('metadata.', '')]: undefined }))
    }
  }

  const handlePaymentSupportChange = (support: string) => {
    const currentSupport = formData.metadata.payment_support

    // Add or remove the payment support
    const updatedSupport = currentSupport.includes(support)
      ? currentSupport.filter(item => item !== support)
      : [...currentSupport, support]

    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        payment_support: updatedSupport
      }
    }))
  }

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.type.trim()) errors.type = 'Type is required'
    if (!formData.state.trim()) errors.state = 'State is required'
    if (!formData.amount.trim()) errors.amount = 'Amount is required'
    if (!formData.description.trim()) errors.description = 'Description is required'
    if (!formData.metadata.payment_type.trim()) errors.payment_type = 'Payment type is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const result = await dispatch(updateServiceTax({ id: parseInt(taxId), taxData: formData }))

    if (updateServiceTax.fulfilled.match(result)) {
      setSubmitSuccess(true)
      setTimeout(() => {
        router.push('/services/taxes')
      }, 1500)
    }
  }

  const paymentSupportOptions = ['CARD', 'BANK', 'USSD', 'QR']
  const paymentTypeOptions = ['PERCENTAGE', 'FIXED']
  const stateOptions = ['LAGOS', 'ABUJA', 'KANO', 'RIVERS', 'NATIONWIDE']
  const typeOptions = ['VAT', 'INCOME_TAX', 'BUSINESS_TAX', 'PROPERTY_TAX', 'SALES_TAX']

  if (taxNotFound) {
    return (
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant='h6' color='error' gutterBottom>
          Tax service not found
        </Typography>
        <Typography variant='body1' paragraph>
          The tax service you are looking for could not be found.
        </Typography>
        <Button variant='contained' onClick={() => router.push('/services/taxes')}>
          Return to Tax Services
        </Button>
      </Card>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Edit Tax Service' />
          <CardContent>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {submitSuccess && (
              <Alert severity='success' sx={{ mb: 4 }}>
                Tax service updated successfully! Redirecting...
              </Alert>
            )}

            {isLoading && <LinearProgress sx={{ height: 4, mb: 4 }} />}

            {isLoadingTax ? (
              <>
                <Skeleton variant='rectangular' width='100%' height={56} sx={{ mb: 2 }} />
                <Skeleton variant='rectangular' width='100%' height={56} sx={{ mb: 2 }} />
                <Skeleton variant='rectangular' width='100%' height={56} sx={{ mb: 2 }} />
                <Skeleton variant='rectangular' width='100%' height={100} sx={{ mb: 2 }} />
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Name'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                      disabled={isLoading}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!formErrors.type}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        name='type'
                        value={formData.type}
                        label='Type'
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {typeOptions.map(option => (
                          <MenuItem key={option} value={option}>
                            {option.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!formErrors.state}>
                      <InputLabel>State</InputLabel>
                      <Select
                        name='state'
                        value={formData.state}
                        label='State'
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {stateOptions.map(option => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.state && <FormHelperText>{formErrors.state}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Amount'
                      name='amount'
                      value={formData.amount}
                      onChange={handleChange}
                      error={!!formErrors.amount}
                      helperText={formErrors.amount || 'Enter percentage or fixed amount'}
                      disabled={isLoading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label='Description'
                      name='description'
                      value={formData.description}
                      onChange={handleChange}
                      error={!!formErrors.description}
                      helperText={formErrors.description}
                      disabled={isLoading}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!formErrors.payment_type}>
                      <InputLabel>Payment Type</InputLabel>
                      <Select
                        name='metadata.payment_type'
                        value={formData.metadata.payment_type}
                        label='Payment Type'
                        onChange={handleChange}
                        disabled={isLoading}
                      >
                        {paymentTypeOptions.map(option => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.payment_type && <FormHelperText>{formErrors.payment_type}</FormHelperText>}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant='subtitle1' gutterBottom>
                      Payment Support
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {paymentSupportOptions.map(option => (
                        <Chip
                          key={option}
                          label={option}
                          onClick={() => handlePaymentSupportChange(option)}
                          color={formData.metadata.payment_support.includes(option) ? 'primary' : 'default'}
                          sx={{ mr: 1, mb: 1 }}
                          disabled={isLoading}
                        />
                      ))}
                    </Box>
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant='outlined'
                      onClick={() => router.push('/services/taxes')}
                      sx={{ mr: 2 }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type='submit' variant='contained' disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Tax Service'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default EditTaxService
