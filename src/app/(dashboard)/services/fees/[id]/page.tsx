'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// MUI Imports
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { FeeService } from '@/store/slices/feesSlice';
import { fetchServiceFees, deleteServiceFee } from '@/store/slices/feesSlice';

const FeeDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { serviceFees: fees, isLoading, error } = useAppSelector(state => state.fees);

  const [feeDetails, setFeeDetails] = useState<FeeService>();
  const [fetchError, setFetchError] = useState<string>();

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
        setFeeDetails(fee);
      } else {
        setFetchError('Fee service not found');
      }
    }
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  // Delete service item dialog handlers
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
  if (isLoading) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={<Skeleton width='60%' />} />
            <LinearProgress sx={{ height: 4 }} />
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Skeleton variant='text' width='40%' height={30} />
                  <Skeleton variant='text' width='60%' height={30} sx={{ mb: 2 }} />

                  <Skeleton variant='text' width='40%' height={30} />
                  <Skeleton variant='text' width='30%' height={30} sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Skeleton variant='text' width='40%' height={30} />
                  <Skeleton variant='text' width='70%' height={30} sx={{ mb: 2 }} />

                  <Skeleton variant='text' width='40%' height={30} />
                  <Skeleton variant='text' width='50%' height={30} sx={{ mb: 2 }} />
                </Grid>
              </Grid>

              <Skeleton variant='rectangular' height={200} sx={{ mt: 4 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  // Error state
  if (fetchError || error || !feeDetails) {
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
            {fetchError || error || 'Fee service not found'}
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={`Fee Service: ${feeDetails.name}`}
            subheader={`ID: ${feeDetails.id.substring(0, 8)}...`}
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant='outlined' onClick={handleGoBack}>
                  <i className='ri ri-arrow-left-line mr-2'></i>
                  Back
                </Button>
                <Button
                  variant='outlined'
                  color='primary'
                  component={Link}
                  href={`/services/fees/edit/${feeDetails.id}`}
                >
                  <i className='ri ri-edit-line mr-2'></i>
                  Edit
                </Button>
                <Button
                  variant='outlined'
                  color='error'
                  onClick={() => openDeleteDialog(feeDetails.id, feeDetails.name)}
                >
                  <i className='ri ri-delete-bin-line mr-2'></i>
                  Delete
                </Button>
              </Box>
            }
          />
          <Divider />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Name
                </Typography>
                <Typography variant='body1' sx={{ mb: 3 }}>
                  {feeDetails.name}
                </Typography>

                <Typography variant='subtitle2' color='text.secondary'>
                  Type
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={feeDetails.type || 'Standard'}
                    color={feeDetails.type === 'premium' ? 'primary' : 'default'}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Created At
                </Typography>
                <Typography variant='body1' sx={{ mb: 3 }}>
                  {feeDetails.created_at ? new Date(feeDetails.created_at).toLocaleString() : 'N/A'}
                </Typography>

                <Typography variant='subtitle2' color='text.secondary'>
                  Updated At
                </Typography>
                <Typography variant='body1' sx={{ mb: 3 }}>
                  {feeDetails.updated_at ? new Date(feeDetails.updated_at).toLocaleString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>

            {/* <Typography variant='h6' sx={{ mt: 4, mb: 2 }}>
              Service Items
            </Typography> */}

            {/* {feeDetails.services && feeDetails.services.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeDetails.services.map(service => (
                      <TableRow key={service.id} hover>
                        <TableCell>{service.name}</TableCell>
                        <TableCell>{service.type}</TableCell>
                        <TableCell>{service.amount}</TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(service.status)}
                            color={getStatusColor(service.status)}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>{service.metadata?.payment_type || 'N/A'}</TableCell>
                        <TableCell>
                          <Tooltip title='View Details'>
                            <IconButton size='small'>
                              <i className='ri ri-eye-line'></i>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Edit'>
                            <IconButton size='small' color='primary'>
                              <i className='ri ri-edit-line'></i>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Delete'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => openDeleteDialog(service.id, service.name)}
                            >
                              <i className='ri ri-delete-bin-line'></i>
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null} */}
          </CardContent>
        </Card>
      </Grid>

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
            Are you sure you want to delete "{deleteDialog.serviceName}"? This action cannot be undone.
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

export default FeeDetailsPage;
