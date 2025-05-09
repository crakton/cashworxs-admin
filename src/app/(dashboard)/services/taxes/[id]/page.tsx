'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  Box,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';

import { fetchSingleTax, deleteServiceTax } from '@/store/slices/taxesSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';

const ViewTaxPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentTax, isLoading, error } = useAppSelector(state => state.taxes);

  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (params.id) {
      dispatch(fetchSingleTax(params.id));
    }
  }, [dispatch, params.id]);

  const handleOpenDeleteDialog = () => {
    setDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog(false);
  };

  const handleDelete = async () => {
    if (params.id) {
      setIsDeleting(true);
      const result = await dispatch(deleteServiceTax(params.id));

      if (deleteServiceTax.fulfilled.match(result)) {
        setSnackbar({
          open: true,
          message: 'Tax service deleted successfully',
          severity: 'success'
        });

        // Navigate back to taxes list after short delay
        setTimeout(() => {
          router.push('/services/taxes');
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: (result.payload as string) || 'Failed to delete tax service',
          severity: 'error'
        });
      }

      setIsDeleting(false);
      handleCloseDeleteDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>;
  }

  if (!currentTax) {
    return <Typography>Tax not found</Typography>;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleString();
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Tax Service Details'
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='outlined'
                  component={Link}
                  href='/services/taxes'
                  startIcon={<i className='ri-arrow-left-line' />}
                >
                  Back to List
                </Button>
                <Button
                  variant='contained'
                  color='primary'
                  component={Link}
                  href={`/services/taxes/edit/${params.id}`}
                  startIcon={<i className='ri-edit-line' />}
                >
                  Edit
                </Button>
                <Button
                  variant='outlined'
                  color='error'
                  onClick={handleOpenDeleteDialog}
                  startIcon={<i className='ri-delete-bin-line' />}
                >
                  Delete
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Chip
                  label={currentTax.status === 1 || currentTax.status === true ? 'Active' : 'Inactive'}
                  color={currentTax.status === 1 || currentTax.status === true ? 'success' : 'default'}
                  sx={{ mb: 4 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Name
                </Typography>
                <Typography variant='body1' sx={{ fontWeight: 500 }}>
                  {currentTax.name}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Type
                </Typography>
                <Typography variant='body1'>{currentTax.type}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  State
                </Typography>
                <Typography variant='body1'>{currentTax.state}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Amount
                </Typography>
                <Typography variant='body1'>{currentTax.amount}%</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant='subtitle2' color='text.secondary'>
                  Description
                </Typography>
                <Typography variant='body1'>{currentTax.description || 'No description provided'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant='h6' sx={{ mb: 2 }}>
                  Payment Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Payment Type
                    </Typography>
                    <Typography variant='body1'>{currentTax.metadata?.payment_type || 'Not specified'}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1 }}>
                      Payment Support Methods
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(currentTax.metadata?.payment_support || []).length > 0 ? (
                        currentTax.metadata.payment_support.map((method: string) => (
                          <Chip key={method} label={method} color='info' size='small' />
                        ))
                      ) : (
                        <Typography variant='body2'>No payment methods specified</Typography>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant='h6' sx={{ mb: 2 }}>
                  System Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      ID
                    </Typography>
                    <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                      {currentTax.id}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Created
                    </Typography>
                    <Typography variant='body2'>{formatDate(currentTax.created_at)}</Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='text.secondary'>
                      Last Updated
                    </Typography>
                    <Typography variant='body2'>{formatDate(currentTax.updated_at)}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the tax service "{currentTax.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color='error'
            variant='contained'
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : <i className='ri-delete-bin-line' />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
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

export default ViewTaxPage;
