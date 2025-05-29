'use client';

import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

// Form validation
import * as yup from 'yup';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  createOrganization,
  updateOrganization,
  fetchOrganizationById,
  clearError
} from '@/store/slices/organizationsSlice';
import type { Organization } from '@/store/slices/organizationsSlice';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { FeeService } from '@/store/slices/feesSlice';
import { nigerianStates, paymentSupportOptions, organizationTypes, serviceTypes } from '@/libs/constant';

interface OrganizationFormProps {
  isEdit?: boolean
  isPreview?: boolean
  organizationId?: string
}

// Service validation schema
const serviceSchema = yup.object().shape({
  name: yup.string().required('Service name is required'),
  type: yup.string().required('Service type is required'),
  state: yup.string().required('State is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .required('Amount is required')
    .positive('Amount must be positive'),
  description: yup.string().nullable(),
  status: yup.boolean().default(true),
  metadata: yup
    .object()
    .shape({
      payment_type: yup.string().nullable(),
      payment_support: yup.array().of(yup.string()).nullable()
    })
    .nullable()
    .default({})
});

// Organization validation schema
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  type: yup.string().required('Type is required'),

  // Make services optional but validate when present
  services: yup.array().of(serviceSchema).optional().default([]),

  // Add a temporary service field for the add service dialog
  tempService: serviceSchema.nullable().default(null)
});

type FormData = yup.InferType<typeof schema>;

const OrganizationForm = ({ isEdit = false, isPreview = false, organizationId }: OrganizationFormProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, currentOrganization } = useAppSelector(state => state.organizations);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number | null>(null);

  // Handle form validation
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData & { tempService?: any }>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      type: '',
      services: [],
      tempService: null // Add this
    }
  });

  // Field array for services
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'services'
  });

  // Fetch organization data if editing or previewing
  useEffect(() => {
    if ((isEdit || isPreview) && organizationId) {
      dispatch(fetchOrganizationById(organizationId));
    }

    // Clear any errors when unmounting
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, isEdit, isPreview, organizationId]);

  // Populate form when organization data is available
  useEffect(() => {
    if ((isEdit || isPreview) && currentOrganization) {
      reset({
        name: currentOrganization.name || '',
        type: currentOrganization.type || '',
        services: currentOrganization.services?.map(service => ({
          name: service.name || '',
          type: service.type || '',
          state: service.state || '',
          amount: typeof service.amount === 'string' ? Number(service.amount) : service.amount || 0,
          description: service.description || '',
          status: Boolean(service.status !== undefined ? service.status : true),
          metadata: service.metadata || { payment_type: '', payment_support: [] }
        })) || [
          {
            name: '',
            type: '',
            state: '',
            amount: 0,
            description: '',
            status: true,
            metadata: {
              payment_type: '',
              payment_support: []
            }
          }
        ]
      });
    }
  }, [currentOrganization, isEdit, isPreview, reset]);

  // Watch services to validate
  const services = watch('services');

  // Handle form submission
  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        // Prepare data for API
        const organizationData = {
          name: data.name,
          type: data.type,

          services: data.services?.map((service, index) => ({
            id: currentOrganization?.services?.[index]?.id,
            name: service.name,
            type: service.type,
            state: service.state,
            amount: Number(service.amount),
            description: service.description || '',
            status: service.status,
            created_at: currentOrganization?.services?.[index]?.created_at,
            updated_at: currentOrganization?.services?.[index]?.updated_at,
            services: currentOrganization?.services?.[index]?.services || [],
            metadata: {
              payment_type: service.metadata?.payment_type || '',
              payment_support: service.metadata?.payment_support || []
            }
          })) as unknown as Partial<FeeService>[]
        };

        let result: any;

        if (isEdit && organizationId) {
          // Update existing organization
          result = await dispatch(
            updateOrganization({ id: organizationId, data: organizationData as Partial<Organization> })
          );
        } else {
          result = await dispatch(createOrganization(organizationData));
        }

        if (createOrganization.fulfilled.match(result) || updateOrganization.fulfilled.match(result)) {
          setSnackbar({
            open: true,
            message: `Organization ${isEdit ? 'updated' : 'created'} successfully`,
            severity: 'success'
          });

          // Navigate back to organizations list after short delay
          setTimeout(() => {
            router.push('/organizations');
          }, 1500);
        } else {
          setSnackbar({
            open: true,
            message: (result?.payload as string) || `Failed to ${isEdit ? 'update' : 'create'} organization`,
            severity: 'error'
          });
        }
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err.message || `An error occurred`,
          severity: 'error'
        });
      }
    },
    [dispatch, isEdit, organizationId, router]
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleServiceDialogOpen = useCallback(
    (index?: number) => {
      if (index !== undefined) {
        // Editing existing service
        setCurrentServiceIndex(index);
      } else {
        // Adding new service - prepare empty data but don't add to array yet
        setCurrentServiceIndex(null);

        // Just set temporary data for the form, don't update the fields array yet
        setValue('tempService', {
          name: '',
          type: '',
          state: '',
          amount: 0,
          description: '',
          status: true,
          metadata: {
            payment_type: '',
            payment_support: []
          }
        });
      }

      setServiceDialogOpen(true);
    },
    [setValue]
  );

  const handleServiceDialogClose = useCallback(() => {
    setServiceDialogOpen(false);
    setCurrentServiceIndex(null);
  }, []);

  // Handle service save
  const handleServiceSave = useCallback(() => {
    const serviceData =
      currentServiceIndex !== null
        ? watch(`services.${currentServiceIndex}`)
        : watch(`services.${services?.length || 0}`);

    if (currentServiceIndex !== null) {
      // Update existing service
      update(currentServiceIndex, serviceData);
    } else {
      const newServiceData = watch('tempService');

      if (newServiceData) {
        append(newServiceData);
      }
    }

    handleServiceDialogClose();
  }, [currentServiceIndex, services, append, update, watch]);

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

                  {/* Services Section */}
                  <Grid item xs={12}>
                    <Divider>
                      <Chip label='Services' color='primary' />
                    </Divider>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant='subtitle1'>
                        Organization Services
                        {errors.services && (
                          <Typography color='error' variant='caption' sx={{ ml: 2 }}>
                            {errors.services?.message}
                          </Typography>
                        )}
                      </Typography>
                      {!isPreview && (
                        <Button
                          variant='contained'
                          startIcon={<i className='ri ri-add' />}
                          onClick={() => {
                            handleServiceDialogOpen();
                          }}
                        >
                          Add Service
                        </Button>
                      )}
                    </Box>

                    {fields.length > 0 ? (
                      <TableContainer component={Paper}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>State</TableCell>
                              <TableCell>Amount</TableCell>
                              <TableCell>Status</TableCell>
                              {!isPreview && <TableCell align='right'>Actions</TableCell>}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {fields.map((service, index) => (
                              <TableRow key={service.id}>
                                <TableCell>{watch(`services.${index}.name`)}</TableCell>
                                <TableCell>{watch(`services.${index}.type`)}</TableCell>
                                <TableCell>{watch(`services.${index}.state`)}</TableCell>
                                <TableCell>₦{Number(watch(`services.${index}.amount`)).toLocaleString()}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={watch(`services.${index}.status`) ? 'Active' : 'Inactive'}
                                    color={watch(`services.${index}.status`) ? 'success' : 'default'}
                                    size='small'
                                  />
                                </TableCell>
                                {!isPreview && (
                                  <TableCell align='right'>
                                    <IconButton size='small' onClick={() => handleServiceDialogOpen(index)}>
                                      <Chip label='Edit' color='info' size='small' />
                                    </IconButton>
                                    <IconButton
                                      size='small'
                                      onClick={() => remove(index)}
                                      disabled={fields.length <= 1}
                                    >
                                      <i className='ri ri-delete-bin-5-line' />
                                    </IconButton>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity='info'>No services added yet. Please add at least one service.</Alert>
                    )}
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

      {/* Service Dialog */}
      <Dialog open={serviceDialogOpen} onClose={handleServiceDialogClose} maxWidth='md' fullWidth>
        <DialogTitle>{currentServiceIndex !== null ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Service Name */}
            <Grid item xs={12} md={6}>
              <Controller
                name={currentServiceIndex !== null ? `services.${currentServiceIndex}.name` : 'tempService.name'}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label='Service Name'
                    placeholder='e.g. Business Registration'
                    error={Boolean(
                      currentServiceIndex !== null
                        ? errors?.services?.[currentServiceIndex]?.name
                        : (errors?.tempService as any)?.name
                    )}
                    helperText={
                      currentServiceIndex !== null
                        ? errors?.services?.[currentServiceIndex]?.name?.message
                        : (errors?.tempService as any)?.name?.message
                    }
                  />
                )}
              />
            </Grid>

            {/* Service Type */}
            <Grid item xs={12} md={6}>
              <Controller
                name={currentServiceIndex !== null ? `services.${currentServiceIndex}.type` : 'tempService.type'}
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={Boolean(
                      currentServiceIndex !== null
                        ? errors?.services?.[currentServiceIndex]?.type
                        : errors?.tempService?.type
                    )}
                  >
                    <InputLabel>Service Type</InputLabel>
                    <Select {...field} label='Service Type'>
                      {serviceTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {(currentServiceIndex !== null
                      ? errors?.services?.[currentServiceIndex]?.type
                      : errors?.tempService?.type) && (
                      <FormHelperText>
                        {currentServiceIndex !== null
                          ? (errors?.services?.[currentServiceIndex]?.type as { message?: string })?.message
                          : (errors?.tempService?.type as { message?: string })?.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* State */}
            <Grid item xs={12} md={6}>
              <Controller
                name={currentServiceIndex !== null ? `services.${currentServiceIndex}.state` : 'tempService.state'}
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={Boolean(
                      currentServiceIndex !== null
                        ? errors?.services?.[currentServiceIndex]?.state
                        : (errors?.tempService as any)?.state
                    )}
                  >
                    <InputLabel>State</InputLabel>
                    <Select {...field} label='State'>
                      {nigerianStates.map(state => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </Select>
                    {(currentServiceIndex !== null
                      ? errors?.services?.[currentServiceIndex]?.state
                      : (errors?.tempService as any)?.state) && (
                      <FormHelperText>
                        {currentServiceIndex !== null
                          ? errors?.services?.[currentServiceIndex]?.state?.message
                          : (errors?.tempService as any)?.state?.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Amount */}
            <Grid item xs={12} md={6}>
              <Controller
                name={currentServiceIndex !== null ? `services.${currentServiceIndex}.amount` : 'tempService.amount'}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Amount (₦)'
                    placeholder='5000'
                    error={Boolean(
                      currentServiceIndex !== null
                        ? errors?.services?.[currentServiceIndex]?.amount
                        : (errors?.tempService as any)?.amount
                    )}
                    helperText={
                      currentServiceIndex !== null
                        ? errors?.services?.[currentServiceIndex]?.amount?.message
                        : (errors?.tempService as any)?.amount?.message
                    }
                  />
                )}
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={6}>
              <Controller
                name={currentServiceIndex !== null ? `services.${currentServiceIndex}.status` : 'tempService.status'}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                    label={`Service Status: ${field.value ? 'Active' : 'Inactive'}`}
                  />
                )}
              />
            </Grid>

            {/* Payment Type */}
            <Grid item xs={12} md={6}>
              <Controller
                name={
                  currentServiceIndex !== null
                    ? `services.${currentServiceIndex}.metadata.payment_type`
                    : 'tempService.metadata.payment_type'
                }
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Payment Type</InputLabel>
                    <Select {...field} label='Payment Type'>
                      {paymentSupportOptions.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name={
                  currentServiceIndex !== null
                    ? `services.${currentServiceIndex}.description`
                    : 'tempService.description'
                }
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label='Description'
                    placeholder='Enter service description'
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleServiceDialogClose} color='inherit'>
            Cancel
          </Button>
          <Button onClick={handleServiceSave} variant='contained'>
            Save Service
          </Button>
        </DialogActions>
      </Dialog>

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
  );
};

export default OrganizationForm;
