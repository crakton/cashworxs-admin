'use client';

import React, { useState, useEffect } from 'react';

import { useParams, useRouter } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import LinearProgress from '@mui/material/LinearProgress';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Skeleton from '@mui/material/Skeleton';

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { FeeService } from '@/store/slices/feesSlice';
import { fetchServiceFees, updateServiceFee } from '@/store/slices/feesSlice';

// For accordion expansion icon
const ExpandMoreIcon = () => <i className='ri ri-arrow-down-s-line' style={{ fontSize: 24 }}></i>;

const EditFeeServicePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { serviceFees: fees, isLoading, error } = useAppSelector(state => state.fees);

  const [formData, setFormData] = useState({
    name: '',
    type: 'standard'
  });

  const [formErrors, setFormErrors] = useState({
    name: ''
  });

  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [fetchError, setFetchError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalFee, setOriginalFee] = useState<FeeService>();

  // Dialog for adding new service item
  const [serviceDialog, setServiceDialog] = useState({
    open: false,
    serviceData: {
      name: '',
      type: 'standard',
      amount: '',
      status: 1,
      description: '',
      metadata: {
        payment_type: 'one_time',
        payment_support: ['card', 'bank']
      }
    }
  });

  // Edit service item dialog
  const [editServiceDialog, setEditServiceDialog] = useState<{
    open: boolean
    serviceId: string
    serviceData: FeeService['services'][0] | null
  }>({
    open: false,
    serviceId: '',
    serviceData: null
  });

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    serviceId: '',
    serviceName: ''
  });

  useEffect(() => {
    if (id) {
      const fee = fees.find(f => f.id === id);

      if (fee) {
        setOriginalFee(fee);
        setFormData({
          name: fee.name,
          type: fee.type || 'standard'
        });
      } else {
        setFetchError('Fee service not found');
      }
    }
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: { name: string } = { name: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Fee service name is required';
      isValid = false;
    }

    setFormErrors(errors);

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(updateServiceFee({ id: id as string, feeData: formData })).unwrap();
      setSuccessMessage('Fee service updated successfully');

      // Reset form submission state
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Failed to update fee service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleOpenServiceDialog = () => {
    setServiceDialog({
      ...serviceDialog,
      open: true
    });
  };

  const handleCloseServiceDialog = () => {
    setServiceDialog({
      ...serviceDialog,
      open: false
    });
  };

  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setServiceDialog(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        [name]: value
      }
    }));
  };

  const handleServiceSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setServiceDialog(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        [name]: value
      }
    }));
  };

  const handleServiceMetadataChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    setServiceDialog(prev => ({
      ...prev,
      serviceData: {
        ...prev.serviceData,
        metadata: {
          ...prev.serviceData.metadata,
          [name]: value
        }
      }
    }));
  };

  const handleAddService = () => {
    // Here you would implement adding a service item to the fee service
    // For now, we'll just close the dialog
    handleCloseServiceDialog();
  };

  const handleOpenEditServiceDialog = (serviceId: string) => {
    const serviceToEdit = originalFee?.services.find(s => s.id === serviceId);

    if (serviceToEdit) {
      setEditServiceDialog({
        open: true,
        serviceId,
        serviceData: { ...serviceToEdit }
      });
    }
  };

  const handleCloseEditServiceDialog = () => {
    setEditServiceDialog({
      open: false,
      serviceId: '',
      serviceData: null
    });
  };

  const handleUpdateService = () => {
    // Here you would implement updating a service item
    // For now, we'll just close the dialog
    handleCloseEditServiceDialog();
  };

  const openDeleteDialog = (serviceId: string, serviceName: string) => {
    setDeleteDialog({
      open: true,
      serviceId,
      serviceName
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      serviceId: '',
      serviceName: ''
    });
  };

  const confirmDelete = () => {
    // Here you would implement the delete service item functionality
    // For now, we'll just close the dialog
    closeDeleteDialog();
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'success';
      case 0:
        return 'warning';
      default:
        return 'error';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'Active';
      case 0:
        return 'Inactive';
      default:
        return 'Disabled';
    }
  };

  // Loading skeleton
  if (isLoading && !originalFee) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={<Skeleton width='60%' />} />
            <LinearProgress sx={{ height: 4 }} />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Skeleton variant='rectangular' height={56} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Skeleton variant='rectangular' height={56} />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Skeleton variant='rectangular' width={100} height={36} />
                    <Skeleton variant='rectangular' width={150} height={36} />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // Error state
  if (fetchError || error || !originalFee) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Alert
            severity='error'
            sx={{ mb: 4 }}
            action={
              <Button color='inherit' size='small' onClick={handleCancel}>
                Go Back
              </Button>
            }
          >
            <AlertTitle>Error</AlertTitle>
            {fetchError || error || 'Fee service not found'}
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
          <Link underline='hover' color='inherit' href='/'>
            Dashboard
          </Link>
          <Link underline='hover' color='inherit' href='/services/fees'>
            Fee Services
          </Link>
          <Typography color='text.primary'>Edit Fee Service</Typography>
        </Breadcrumbs>

        <Card>
          <CardHeader
            title={`Edit Fee Service: ${originalFee.name}`}
            subheader={`ID: ${originalFee.id.substring(0, 8)}...`}
          />
          <Divider />

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label='fee service tabs'>
              <Tab label='Basic Details' />
              {/* <Tab label='Service Items' /> */}
            </Tabs>
          </Box>

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

            {tabValue === 0 && (
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
                      disabled={isSubmitting}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id='fee-type-label'>Fee Type</InputLabel>
                      <Select
                        labelId='fee-type-label'
                        name='type'
                        value={formData.type}
                        onChange={handleSelectChange}
                        label='Fee Type'
                        disabled={isSubmitting}
                      >
                        <MenuItem value='standard'>Standard</MenuItem>
                        <MenuItem value='premium'>Premium</MenuItem>
                        <MenuItem value='custom'>Custom</MenuItem>
                      </Select>
                      <FormHelperText>Select the type of fee service</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <Button variant='outlined' onClick={handleCancel} disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        variant='contained'
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Fee Service'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Add Service Item Dialog */}
      <Dialog open={serviceDialog.open} onClose={handleCloseServiceDialog} maxWidth='md' fullWidth>
        <DialogTitle>Add New Service Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Service Name'
                name='name'
                value={serviceDialog.serviceData.name}
                onChange={handleServiceInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Service Type'
                name='type'
                value={serviceDialog.serviceData.type}
                onChange={handleServiceInputChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Amount'
                name='amount'
                type='number'
                value={serviceDialog.serviceData.amount}
                onChange={handleServiceInputChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name='status'
                  value={String(serviceDialog.serviceData.status)}
                  onChange={handleServiceSelectChange}
                  label='Status'
                >
                  <MenuItem value={1}>Active</MenuItem>
                  <MenuItem value={0}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                name='description'
                multiline
                rows={3}
                value={serviceDialog.serviceData.description}
                onChange={handleServiceInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle1' sx={{ mb: 2 }}>
                Payment Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Type</InputLabel>
                    <Select
                      name='payment_type'
                      value={serviceDialog.serviceData.metadata.payment_type}
                      onChange={handleServiceMetadataChange}
                      label='Payment Type'
                    >
                      <MenuItem value='one_time'>One-time</MenuItem>
                      <MenuItem value='recurring'>Recurring</MenuItem>
                      <MenuItem value='installment'>Installment</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseServiceDialog}>Cancel</Button>
          <Button onClick={handleAddService} variant='contained'>
            Add Service
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Service Item Dialog */}
      {editServiceDialog.serviceData && (
        <Dialog open={editServiceDialog.open} onClose={handleCloseEditServiceDialog} maxWidth='md' fullWidth>
          <DialogTitle>Edit Service Item</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Service Name'
                  name='name'
                  value={editServiceDialog.serviceData.name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label='Service Type' name='type' value={editServiceDialog.serviceData.type} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Amount'
                  name='amount'
                  type='number'
                  value={editServiceDialog.serviceData.amount}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select name='status' value={editServiceDialog.serviceData.status} label='Status'>
                    <MenuItem value={1}>Active</MenuItem>
                    <MenuItem value={0}>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Description'
                  name='description'
                  multiline
                  rows={3}
                  value={editServiceDialog.serviceData.description}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditServiceDialog}>Cancel</Button>
            <Button onClick={handleUpdateService} variant='contained'>
              Update Service
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Are you sure you want to delete the service item "{deleteDialog.serviceName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color='primary'>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color='error' autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default EditFeeServicePage;
