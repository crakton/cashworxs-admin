'use client';

// React Imports
import { useEffect, useState } from 'react';

// Next Imports
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import TablePagination from '@mui/material/TablePagination';
import Snackbar from '@mui/material/Snackbar';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

// Redux Imports
import { Box } from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchServiceTaxes, deleteServiceTax, clearTaxError } from '@/store/slices/taxesSlice';

const TaxesServices = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { serviceTaxes: taxes, isLoading, error } = useAppSelector(state => state.taxes);

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  });

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTaxes, setFilteredTaxes] = useState(taxes || []);

  // Fetch tax data on component mount
  useEffect(() => {
    dispatch(fetchServiceTaxes());

    // Clear any errors when unmounting
    return () => {
      dispatch(clearTaxError());
    };
  }, [dispatch]);

  // Filter taxes when search query or taxes change
  useEffect(() => {
    if (taxes) {
      const filtered = taxes.filter(
        tax =>
          tax.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tax.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tax.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setFilteredTaxes(filtered);
      setPage(0); // Reset to first page when filtering
    }
  }, [searchQuery, taxes]);

  const handleOpenDeleteDialog = (id: string) => {
    setDeleteDialog({ open: true, id });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, id: null });
  };

  const handleDelete = async () => {
    if (deleteDialog.id) {
      const result = await dispatch(deleteServiceTax(deleteDialog.id));

      if (deleteServiceTax.fulfilled.match(result)) {
        setSnackbar({
          open: true,
          message: 'Tax service deleted successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: (result.payload as string) || 'Failed to delete tax service',
          severity: 'error'
        });
      }

      handleCloseDeleteDialog();
    }
  };

  const handleRefresh = () => {
    dispatch(fetchServiceTaxes());
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate pagination
  const paginatedTaxes = filteredTaxes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Tax Services'
            action={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='outlined'
                  onClick={handleRefresh}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <i className='ri-refresh-line' />}
                >
                  Refresh
                </Button>
                <Button
                  variant='contained'
                  component={Link}
                  href='/services/taxes/new'
                  startIcon={<i className='ri-add-line' />}
                >
                  Add Tax
                </Button>
              </Box>
            }
          />
          <CardContent>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }} onClose={() => dispatch(clearTaxError())}>
                {error}
              </Alert>
            )}

            {/* Search bar */}
            <TextField
              fullWidth
              variant='outlined'
              placeholder='Search tax services...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-line' />
                  </InputAdornment>
                )
              }}
            />

            {isLoading ? (
              <Box sx={{ width: '100%', mt: 3 }}>
                <LinearProgress />
                <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading tax services...</Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>State</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTaxes.length > 0 ? (
                        paginatedTaxes.map(tax => (
                          <TableRow key={tax.id} hover>
                            <TableCell>{tax.id.substring(0, 8)}...</TableCell>
                            <TableCell>{tax.name}</TableCell>
                            <TableCell>{tax.type}</TableCell>
                            <TableCell>{tax.state}</TableCell>
                            <TableCell>{tax.amount}</TableCell>
                            <TableCell>
                              <Chip
                                label={tax.status === 1 ? 'Active' : 'Inactive'}
                                color={tax.status === 1 ? 'success' : 'default'}
                                size='small'
                              />
                            </TableCell>
                            <TableCell>
                              {tax.created_at ? new Date(tax.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Tooltip title='View Details'>
                                <IconButton
                                  component={Link}
                                  href={`/services/taxes/${tax.id}`}
                                  size='small'
                                  color='primary'
                                >
                                  <i className='ri-eye-line'></i>
                                </IconButton>
                              </Tooltip>

                              <Tooltip title='Delete'>
                                <IconButton onClick={() => handleOpenDeleteDialog(tax.id)} size='small' color='error'>
                                  <i className='ri-delete-bin-5-line'></i>
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align='center'>
                            <Typography variant='body1' sx={{ py: 5 }}>
                              {searchQuery ? 'No matching tax records found' : 'No tax records found'}
                            </Typography>
                            {searchQuery && (
                              <Button variant='text' onClick={() => setSearchQuery('')} sx={{ mt: 1 }}>
                                Clear search
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component='div'
                  count={filteredTaxes.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this tax entry? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color='error' variant='contained' disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
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

export default TaxesServices;
