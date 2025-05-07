'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import {
  createServiceTax,
  updateServiceTax,
  fetchSingleTax,
  clearTaxError,
  TaxService
} from '@/store/slices/taxesSlice'
import Cookies from 'js-cookie'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Form validation
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { LinearProgress } from '@mui/material'
import { taxTypes, nigerianStates, paymentSupportOptions, paymentTypeOptions } from '@/libs/constant'

interface TaxFormProps {
  isEdit?: boolean
  taxId?: string
}

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  type: yup.string().required('Type is required'),
  state: yup.string().required('State is required'),
  amount: yup.number().required('Amount is required').positive('Amount must be positive'),
  description: yup.string().nullable(),
  status: yup.boolean().default(true),
  organization_id: yup.string(), // Added this field
  metadata: yup
    .object()
    .shape({
      payment_support: yup.array().of(yup.string()),
      payment_type: yup.string()
    })
    .default({ payment_support: [], payment_type: '' })
})

type FormData = yup.InferType<typeof schema>

const TaxForm = ({ isEdit = false, taxId }: TaxFormProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error, currentTax } = useAppSelector(state => state.taxes)

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Get current organization ID
  const getOrganizationId = () => {
    return Cookies.get('organization_id') || sessionStorage.getItem('organization_id') || ''
  }

  // Handle form validation
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver<FormData, any, any>(schema),
    defaultValues: {
      name: '',
      type: '',
      state: '',
      amount: 0,
      description: '',
      status: true,
      organization_id: getOrganizationId(), // Set initial value
      metadata: {
        payment_support: [],
        payment_type: ''
      }
    }
  })

  // Fetch tax data if editing
  useEffect(() => {
    if (isEdit && taxId) {
      dispatch(fetchSingleTax(taxId))
    }

    // Always set organization ID
    setValue('organization_id', getOrganizationId())

    // Clear any errors when unmounting
    return () => {
      dispatch(clearTaxError())
    }
  }, [dispatch, isEdit, taxId, setValue])

  // Populate form when tax data is available
  useEffect(() => {
    if (isEdit && currentTax) {
      reset({
        name: currentTax.name,
        type: currentTax.type,
        state: currentTax.state,
        amount: typeof currentTax.amount === 'string' ? parseFloat(currentTax.amount) : currentTax.amount,
        description: currentTax.description || '',
        status: typeof currentTax.status === 'number' ? Boolean(currentTax.status) : currentTax.status,
        organization_id: currentTax.organization_id || getOrganizationId(),
        metadata: {
          payment_support: currentTax.metadata?.payment_support || [],
          payment_type: currentTax.metadata?.payment_type || ''
        }
      })
    }
  }, [currentTax, isEdit, reset])

  // Track selected payment support options
  const watchPaymentSupport = watch('metadata.payment_support', [])

  // Handle payment support selection
  const handlePaymentSupportChange = (supportType: string) => {
    const currentSupport = watchPaymentSupport || []

    if (currentSupport.includes(supportType)) {
      // Remove from selection
      setValue(
        'metadata.payment_support',
        currentSupport.filter(item => item !== supportType)
      )
    } else {
      // Add to selection
      setValue('metadata.payment_support', [...currentSupport, supportType])
    }
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      // Prepare data for API
      const taxData: Partial<TaxService> = {
        name: data.name,
        type: data.type,
        state: data.state,
        amount: data.amount,
        description: data.description || '',
        status: data.status ? 1 : 0,
        organization_id: data.organization_id || getOrganizationId(),
        metadata: {
          payment_support: data.metadata.payment_support as string[],
          payment_type: data.metadata.payment_type || ''
        }
      }

      let result

      if (isEdit && taxId) {
        // Update existing tax
        result = await dispatch(updateServiceTax({ id: taxId, taxData }))
      } else {
        // Create new tax
        result = await dispatch(createServiceTax(taxData))
      }

      if (createServiceTax.fulfilled.match(result) || updateServiceTax.fulfilled.match(result)) {
        setSnackbar({
          open: true,
          message: `Tax service ${isEdit ? 'updated' : 'created'} successfully`,
          severity: 'success'
        })

        // Navigate back to taxes list after short delay
        setTimeout(() => {
          router.push('/services/taxes')
        }, 1500)
      } else {
        setSnackbar({
          open: true,
          message: (result.payload as string) || `Failed to ${isEdit ? 'update' : 'create'} tax service`,
          severity: 'error'
        })
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || `An error occurred`,
        severity: 'error'
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={isEdit ? 'Edit Tax Service' : 'Create Tax Service'}
            subheader={isEdit ? 'Update existing tax service details' : 'Add a new tax service to the system'}
          />
          <CardContent>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }} onClose={() => dispatch(clearTaxError())}>
                {error}
              </Alert>
            )}

            {isEdit && isLoading && !currentTax ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                <LinearProgress />
              </Box>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={4}>
                  {/* Name */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='name'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Tax Name'
                          placeholder='e.g. Value Added Tax (VAT)'
                          error={Boolean(errors.name)}
                          helperText={errors.name?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Type */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='type'
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.type)}>
                          <InputLabel>Tax Type</InputLabel>
                          <Select {...field} label='Tax Type'>
                            {taxTypes.map(type => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* State */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='state'
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.state)}>
                          <InputLabel>State</InputLabel>
                          <Select {...field} label='State'>
                            {nigerianStates.map(state => (
                              <MenuItem key={state} value={state}>
                                {state}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.state && <FormHelperText>{errors.state.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Amount */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='amount'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type='number'
                          label='Amount (%)'
                          placeholder='e.g. 7.5'
                          error={Boolean(errors.amount)}
                          helperText={errors.amount?.message}
                          InputProps={{
                            endAdornment: <Typography variant='subtitle2'>%</Typography>
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <Controller
                      name='description'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          multiline
                          rows={4}
                          label='Description'
                          placeholder='Enter tax service description'
                          error={Boolean(errors.description)}
                          helperText={errors.description?.message}
                        />
                      )}
                    />
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12}>
                    <Controller
                      name='status'
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <FormControlLabel
                          control={<Switch checked={value} onChange={onChange} color='primary' />}
                          label={value ? 'Active' : 'Inactive'}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider>
                      <Chip label='Payment Details' color='primary' />
                    </Divider>
                  </Grid>

                  {/* Hidden organization_id field */}
                  <Controller
                    name='organization_id'
                    control={control}
                    render={({ field }) => <input type='hidden' {...field} />}
                  />

                  {/* Payment Support */}
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' sx={{ mb: 2 }}>
                      Payment Support Methods
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {paymentSupportOptions.map(option => (
                        <Chip
                          key={option}
                          label={option}
                          onClick={() => handlePaymentSupportChange(option)}
                          color={watchPaymentSupport?.includes(option) ? 'primary' : 'default'}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                    {errors.metadata?.payment_support && (
                      <FormHelperText error>{errors.metadata.payment_support.message}</FormHelperText>
                    )}
                  </Grid>

                  {/* Payment Type */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='metadata.payment_type'
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.metadata?.payment_type)}>
                          <InputLabel>Payment Type</InputLabel>
                          <Select {...field} label='Payment Type'>
                            {paymentTypeOptions.map(type => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.metadata?.payment_type && (
                            <FormHelperText>{errors.metadata.payment_type.message}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* Form Buttons */}
                  <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant='outlined' onClick={() => router.push('/services/taxes')}>
                      Cancel
                    </Button>
                    <Button type='submit' variant='contained' disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 2 }} />
                          {isEdit ? 'Updating...' : 'Creating...'}
                        </>
                      ) : isEdit ? (
                        'Update Tax'
                      ) : (
                        'Create Tax'
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  )
}

export default TaxForm
