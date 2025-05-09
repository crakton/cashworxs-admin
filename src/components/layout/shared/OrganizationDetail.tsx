'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

// MUI Imports
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import type { SelectChangeEvent } from '@mui/material/Select';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';

import { addServiceItem } from '@/store/slices/feesSlice';
import type { CreateServiceItemDTO } from '@/store/slices/feesSlice';

import {
  fetchOrganizationById,
  clearError,
  clearCurrentOrganization,
  fetchOrganizationServices
} from '@/store/slices/organizationsSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { nigerianStates } from '@/libs/constant';

interface OrganizationDetailProps {
  organizationId: string
}

const OrganizationDetail = ({ organizationId }: OrganizationDetailProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, currentOrganization, services } = useAppSelector(state => state.organizations);

  console.log('services', services);
  const [servicesPage, setServicesPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal state
  const [openModal, setOpenModal] = useState(false);

  const [newServiceItem, setNewServiceItem] = useState<Partial<CreateServiceItemDTO>>({
    name: '',
    type: 'Fee',
    state: 'Active',
    amount: '',
    description: '',
    status: true,
    metadata: {
      payment_support: ['card', 'bank'],
      payment_type: 'onetime'
    }
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

  // Fetch organization data
  useEffect(() => {
    if (organizationId) {
      dispatch(fetchOrganizationById(organizationId));
      dispatch(fetchOrganizationServices(organizationId));
    }

    // Clear current organization when unmounting
    return () => {
      dispatch(clearCurrentOrganization());
      dispatch(clearError());
    };
  }, [dispatch, organizationId]);

  // Handle page change for services table
  const handleChangePage = (_event: unknown, newPage: number) => {
    setServicesPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setServicesPage(0);
  };

  // Modal handlers
  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    setFormErrors({});
    setNewServiceItem({
      name: '',
      type: '',
      state: '',
      amount: '',
      description: '',
      status: false,
      metadata: {
        payment_support: ['card', 'bank'],
        payment_type: 'onetime'
      }
    });
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setNewServiceItem(prev => ({ ...prev, [name]: value }));

    // Clear error when field is being edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.name as string;
    const value = e.target.value;

    setNewServiceItem(prev => ({ ...prev, [name]: value }));

    // Clear error when field is being edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewServiceItem(prev => ({ ...prev, status: e.target.checked }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!newServiceItem.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!newServiceItem.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(newServiceItem.amount))) {
      errors.amount = 'Amount must be a valid number';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (currentOrganization) {
        const serviceData: CreateServiceItemDTO = {
          ...(newServiceItem as CreateServiceItemDTO),
          organization_id: currentOrganization.id,
          status: newServiceItem.status ? 1 : 0
        };

        await dispatch(addServiceItem(serviceData)).unwrap();

        // Show success message
        setSuccessMessage('Service item created successfully');
        setShowSuccessSnackbar(true);

        // Refresh services list
        dispatch(fetchOrganizationServices(organizationId));

        // Close modal
        handleCloseModal();
      }
    } catch (err: any) {
      // Handle the error from the API
      if (typeof err === 'string') {
        setFormErrors(prev => ({ ...prev, form: err }));
      } else {
        setFormErrors(prev => ({ ...prev, form: 'Failed to create service item' }));
      }
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccessSnackbar(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mt: 4 }} onClose={() => dispatch(clearError())}>
        {error}
      </Alert>
    );
  }

  if (!currentOrganization) {
    return (
      <Alert severity='info' sx={{ mt: 4 }}>
        Organization not found
      </Alert>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
          <Typography variant='h4'>Organization Details</Typography>
          <Box>
            <Button
              variant='outlined'
              sx={{ mr: 2 }}
              onClick={() => router.push('/organizations')}
              startIcon={<i className='ri-arrow-left-line' />}
            >
              Back
            </Button>
            <Button
              variant='contained'
              onClick={() => router.push(`/organizations/edit/${organizationId}`)}
              startIcon={<i className='ri-edit-line' />}
            >
              Edit
            </Button>
          </Box>
        </Box>

        {/* Organization Basic Info */}
        <Card sx={{ mb: 6 }}>
          <CardHeader
            title='Organization Information'
            action={
              <Chip
                label={currentOrganization.type}
                color={currentOrganization.type === 'Government' ? 'primary' : 'secondary'}
              />
            }
          />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <i className='ri-building-line' style={{ fontSize: '1.5rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Name'
                      secondary={currentOrganization.name || 'N/A'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1', fontWeight: 'medium' }}
                    />
                  </ListItem>

                  <ListItem>
                    <ListItemIcon>
                      <i className='ri-id-card-line' style={{ fontSize: '1.5rem' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary='Id'
                      secondary={currentOrganization.id || 'N/A'}
                      primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                      secondaryTypographyProps={{ variant: 'body1' }}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Organization Services */}
        <Card>
          <CardHeader
            title='Services'
            subheader={`This organization has ${services ? services.length : 0} services`}
            action={
              <Box>
                <Button
                  size='small'
                  variant='contained'
                  onClick={handleOpenModal}
                  startIcon={<i className='ri-add-line' />}
                  sx={{ mr: 2 }}
                >
                  Add Service Item
                </Button>
              </Box>
            }
          />
          <CardContent>
            {isLoading ? (
              <LinearProgress />
            ) : services && services.length > 0 ? (
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer>
                  <Table stickyHeader aria-label='services table'>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Service Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {services
                        .slice(servicesPage * rowsPerPage, servicesPage * rowsPerPage + rowsPerPage)
                        .map(service => (
                          <TableRow hover key={service.id}>
                            <TableCell>{service.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={service.type}
                                size='small'
                                color={service.type === 'Fee' ? 'info' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>
                              {service.amount ? `₦${parseFloat(service.amount).toLocaleString()}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={service.status ? 'Active' : 'Inactive'}
                                size='small'
                                color={service.status ? 'success' : 'error'}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <IconButton
                                  size='small'
                                  color='info'
                                  onClick={() => router.push(`/services/fees/${service.id}`)}
                                >
                                  <i className='ri-eye-line' />
                                </IconButton>
                                <IconButton
                                  size='small'
                                  color='primary'
                                  onClick={() => router.push(`/services/fees/edit/${service.id}`)}
                                >
                                  <i className='ri-edit-line' />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component='div'
                  count={services.length}
                  rowsPerPage={rowsPerPage}
                  page={servicesPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant='body1' color='text.secondary' gutterBottom>
                  No services found for this organization
                </Typography>
                <Button
                  variant='outlined'
                  onClick={handleOpenModal}
                  startIcon={<i className='ri-add-line' />}
                  sx={{ mt: 2, mr: 2 }}
                >
                  Add First Service Item
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Add Service Item Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth='md' fullWidth>
        <DialogTitle>
          Add Service Item
          <IconButton
            aria-label='close'
            onClick={handleCloseModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme => theme.palette.grey[500]
            }}
          >
            <i className='ri-close-line' />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {formErrors.form && (
            <Alert severity='error' sx={{ mb: 3 }}>
              {formErrors.form}
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Service Name'
                name='name'
                value={newServiceItem.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id='type-label'>Type</InputLabel>
                <Select
                  labelId='type-label'
                  name='type'
                  value={newServiceItem.type}
                  label='Type'
                  onChange={handleSelectChange}
                >
                  <MenuItem value='Fee'>Fee</MenuItem>
                  <MenuItem value='Levy'>Levy</MenuItem>
                  <MenuItem value='Tax'>Tax</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id='state-label'>State</InputLabel>
                <Select
                  labelId='state-label'
                  name='state'
                  value={newServiceItem.state}
                  label='State'
                  onChange={handleSelectChange}
                >
                  {nigerianStates.map(state => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Amount'
                name='amount'
                type='number'
                value={newServiceItem.amount}
                onChange={handleInputChange}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                required
                InputProps={{
                  startAdornment: <InputAdornment position='start'>₦</InputAdornment>
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id='payment-type-label'>Payment Type</InputLabel>
                <Select
                  labelId='payment-type-label'
                  name='paymentType'
                  value={newServiceItem.metadata?.payment_type || 'onetime'}
                  label='Payment Type'
                  onChange={e => {
                    setNewServiceItem(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        payment_type: e.target.value as string
                      }
                    }));
                  }}
                >
                  <MenuItem value='onetime'>One-time</MenuItem>
                  <MenuItem value='recurring'>Recurring</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                name='description'
                value={newServiceItem.description}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch checked={Boolean(newServiceItem.status)} onChange={handleStatusChange} name='status' />
                }
                label='Active'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} variant='outlined'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant='contained' color='primary'>
            Create Service Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
        action={
          <IconButton size='small' aria-label='close' color='inherit' onClick={handleCloseSnackbar}>
            <i className='ri-close-line' />
          </IconButton>
        }
      />
    </Grid>
  );
};

export default OrganizationDetail;
