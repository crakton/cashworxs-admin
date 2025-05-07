'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CardHeader from '@mui/material/CardHeader'
import TableContainer from '@mui/material/TableContainer'
import LinearProgress from '@mui/material/LinearProgress'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TablePagination from '@mui/material/TablePagination'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Skeleton from '@mui/material/Skeleton'

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { fetchServiceFees, deleteServiceFee, clearFeeError } from '@/store/slices/feesSlice'

const FeesServicesPage = () => {
  const dispatch = useAppDispatch()
  const { serviceFees: fees, isLoading, error } = useAppSelector(state => state.fees)

  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    feeId: '',
    feeName: ''
  })

  // Refresh state
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    dispatch(fetchServiceFees())
      .unwrap()
      .catch(err => {
        console.error('Failed to fetch fees:', err)
      })
  }, [dispatch, refreshTrigger])

  // Pagination handlers
  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle delete confirmation
  const openDeleteDialog = (id: string, name: string) => {
    setDeleteDialog({
      open: true,
      feeId: id,
      feeName: name
    })
  }

  const closeDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      feeId: '',
      feeName: ''
    })
  }

  const confirmDelete = () => {
    dispatch(deleteServiceFee(deleteDialog.feeId))
      .unwrap()
      .then(() => {
        closeDeleteDialog()
      })
      .catch(err => {
        console.error('Failed to delete fee:', err)
        closeDeleteDialog()
      })
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Clear error
  const handleDismissError = () => {
    dispatch(clearFeeError())
  }

  // Apply pagination to the fees data
  const paginatedFees = fees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Loading skeleton
  const renderSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton variant='text' width={80} />
          </TableCell>
          <TableCell>
            <Skeleton variant='text' width={150} />
          </TableCell>
          <TableCell>
            <Skeleton variant='text' width={120} />
          </TableCell>
          <TableCell>
            <Skeleton variant='text' width={100} />
          </TableCell>
        </TableRow>
      ))
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Fees Services'
            action={
              <div>
                <Button variant='outlined' color='primary' onClick={handleRefresh} sx={{ mr: 2 }} disabled={isLoading}>
                  <i className='ri ri-refresh-line'></i>
                  <span className='ml-2'>Refresh</span>
                </Button>
                <Button variant='contained' component={Link} href='/services/fees/new'>
                  <i className='ri ri-add-line'></i>
                  <span className='ml-2'>Add Fee</span>
                </Button>
              </div>
            }
          />
          <CardContent>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }} onClose={handleDismissError}>
                <AlertTitle>Error</AlertTitle>
                {error}
              </Alert>
            )}

            {isLoading ? (
              <>
                <LinearProgress sx={{ height: 4, mb: 4 }} />
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>{renderSkeleton()}</TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedFees.length > 0 ? (
                        paginatedFees.map(fee => (
                          <TableRow key={fee.id} hover>
                            <TableCell>{fee.id.substring(0, 8)}...</TableCell>
                            <TableCell>{fee.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={fee.type || 'Standard'}
                                size='small'
                                color={fee.type === 'premium' ? 'primary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              {fee.created_at ? new Date(fee.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Tooltip title='View Details'>
                                <IconButton component={Link} href={`/services/fees/${fee.id}`} size='small'>
                                  <i className='ri ri-eye-line'></i>
                                </IconButton>
                              </Tooltip>

                              <Tooltip title='Delete'>
                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => openDeleteDialog(fee.id, fee.name)}
                                >
                                  <i className='ri ri-delete-bin-line'></i>
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align='center'>
                            <Typography>No fees available</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component='div'
                  count={fees.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{ mt: 2 }}
                />
              </>
            )}
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
            Are you sure you want to delete the fee "{deleteDialog.feeName}"? This action cannot be undone.
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
  )
}

export default FeesServicesPage
