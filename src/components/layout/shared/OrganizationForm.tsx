'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import {
  createOrganization,
  updateOrganization,
  fetchOrganizationById,
  clearError,
  Organization
} from '@/store/slices/organizationsSlice'

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
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'

// Form validation
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { FeeService } from '@/store/slices/feesSlice'

// Organization types
const organizationTypes = ['Government', 'Private', 'NGO', 'International']

interface OrganizationFormProps {
  isEdit?: boolean
  isPreview?: boolean
  organizationId?: string
}

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  type: yup.string().required('Type is required'),
  description: yup.string().nullable(),
  address: yup.string().nullable(),
  contact_email: yup.string().email('Must be a valid email').nullable(),
  contact_phone: yup.string().nullable(),
  website: yup.string().url('Must be a valid URL').nullable()
})

type FormData = yup.InferType<typeof schema>

const OrganizationForm = ({ isEdit = false, isPreview = false, organizationId }: OrganizationFormProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error, currentOrganization } = useAppSelector(state => state.organizations)

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  })

  // Handle form validation
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver<FormData, any, any>(schema),
    defaultValues: {
      name: '',
      type: '',
      description: '',
      address: '',
      contact_email: '',
      contact_phone: '',
      website: ''
    }
  })

  // Fetch organization data if editing or previewing
  useEffect(() => {
    if ((isEdit || isPreview) && organizationId) {
      dispatch(fetchOrganizationById(organizationId))
    }

    // Clear any errors when unmounting
    return () => {
      dispatch(clearError())
    }
  }, [dispatch, isEdit, isPreview, organizationId])

  // Populate form when organization data is available
  useEffect(() => {
    if ((isEdit || isPreview) && currentOrganization) {
      reset({
        name: currentOrganization.name || '',
        type: currentOrganization.type || ''
        // description: currentOrganization.description || '',
        // address: currentOrganization.address || '',
        // contact_email: currentOrganization.contact_email || '',
        // contact_phone: currentOrganization.contact_phone || '',
        // website: currentOrganization.website || ''
      })
    }
  }, [currentOrganization, isEdit, isPreview, reset])

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      // Prepare data for API
      const organizationData = {
        name: data.name,
        type: data.type,
        services: [] as Partial<FeeService>[]
        // description: data.description || '',
        // address: data.address || '',
        // contact_email: data.contact_email || '',
        // contact_phone: data.contact_phone || '',
        // website: data.website || ''
      }

      let result

      if (isEdit && organizationId) {
        // Update existing organization
        result = await dispatch(updateOrganization({ id: organizationId, data: organizationData }))
      } else {
        // Create new organization
        result = await dispatch(createOrganization(organizationData))
      }

      if (createOrganization.fulfilled.match(result) || updateOrganization.fulfilled.match(result)) {
        setSnackbar({
          open: true,
          message: `Organization ${isEdit ? 'updated' : 'created'} successfully`,
          severity: 'success'
        })

        // Navigate back to organizations list after short delay
        setTimeout(() => {
          router.push('/organizations')
        }, 1500)
      } else {
        setSnackbar({
          open: true,
          message: (result.payload as string) || `Failed to ${isEdit ? 'update' : 'create'} organization`,
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
            title={isPreview ? 'Organization Details' : isEdit ? 'Edit Organization' : 'Create Organization'}
            subheader={
              isPreview
                ? 'View organization information'
                : isEdit
                  ? 'Update existing organization details'
                  : 'Add a new organization to the system'
            }
          />
          <CardContent>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            {(isEdit || isPreview) && isLoading && !currentOrganization ? (
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
                          label='Organization Name'
                          placeholder='e.g. Ministry of Finance'
                          error={Boolean(errors.name)}
                          helperText={errors.name?.message}
                          disabled={isPreview}
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
                        <FormControl fullWidth error={Boolean(errors.type)} disabled={isPreview}>
                          <InputLabel>Organization Type</InputLabel>
                          <Select {...field} label='Organization Type'>
                            {organizationTypes.map(type => (
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

                  <Grid item xs={12}>
                    <Divider>
                      <Chip label='Contact Information' color='primary' />
                    </Divider>
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='contact_email'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Contact Email'
                          placeholder='contact@organization.com'
                          error={Boolean(errors.contact_email)}
                          helperText={errors.contact_email?.message}
                          disabled={isPreview}
                        />
                      )}
                    />
                  </Grid>

                  {/* Phone */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='contact_phone'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Contact Phone'
                          placeholder='+234 000 0000 000'
                          error={Boolean(errors.contact_phone)}
                          helperText={errors.contact_phone?.message}
                          disabled={isPreview}
                        />
                      )}
                    />
                  </Grid>

                  {/* Website */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='website'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Website'
                          placeholder='https://www.organization.gov.ng'
                          error={Boolean(errors.website)}
                          helperText={errors.website?.message}
                          disabled={isPreview}
                        />
                      )}
                    />
                  </Grid>

                  {/* Address */}
                  <Grid item xs={12} md={6}>
                    <Controller
                      name='address'
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label='Address'
                          placeholder='Organization address'
                          error={Boolean(errors.address)}
                          helperText={errors.address?.message}
                          disabled={isPreview}
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
                          placeholder='Enter organization description'
                          error={Boolean(errors.description)}
                          helperText={errors.description?.message}
                          disabled={isPreview}
                        />
                      )}
                    />
                  </Grid>

                  {/* Form Buttons */}
                  <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant='outlined' onClick={() => router.push('/organizations')}>
                      {isPreview ? 'Back' : 'Cancel'}
                    </Button>
                    {!isPreview && (
                      <Button type='submit' variant='contained' disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 2 }} />
                            {isEdit ? 'Updating...' : 'Creating...'}
                          </>
                        ) : isEdit ? (
                          'Update Organization'
                        ) : (
                          'Create Organization'
                        )}
                      </Button>
                    )}
                    {isPreview && (
                      <Button variant='contained' onClick={() => router.push(`/organizations/edit/${organizationId}`)}>
                        Edit
                      </Button>
                    )}
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

export default OrganizationForm
