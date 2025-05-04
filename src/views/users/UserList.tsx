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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Alert from '@mui/material/Alert'

// Icon Imports

// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { Mode } from '@/@core/types'
import { deleteUser, fetchAllUsers } from '@/store/slices/userSlice'
import { Icon } from '@mui/material'

const UserList = ({ mode }: { mode: Mode }) => {
  // Hooks
  const dispatch = useAppDispatch()
  const { users, isLoading, error } = useAppSelector(state => state.users)

  // State
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null
  })

  // Effects
  useEffect(() => {
    dispatch(fetchAllUsers())
  }, [dispatch])

  // Handlers
  const handleOpenDeleteDialog = (userId: string) => {
    setDeleteDialog({ open: true, userId })
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, userId: null })
  }

  const handleDeleteUser = async () => {
    if (deleteDialog.userId) {
      await dispatch(deleteUser(deleteDialog.userId))
      handleCloseDeleteDialog()
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Users Management'
            action={
              <Button variant='contained' component={Link} href='/users/new'>
                <i className='ri ri-user-add-line'></i>
                <span className='ml-2'>Add User</span>
              </Button>
            }
          />
          <CardContent>
            {error && (
              <Alert severity='error' sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {isLoading ? (
              <LinearProgress sx={{ height: 4, mb: 4 }} />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Phone Number</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users !== undefined && users.length > 0 ? (
                      users.map(user => (
                        <TableRow key={user.id} hover>
                          <TableCell>{user.id.substring(0, 8)}...</TableCell>
                          <TableCell>{user.full_name || user.name || 'N/A'}</TableCell>
                          <TableCell>{user.phone_number}</TableCell>
                          <TableCell>
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <IconButton component={Link} href={`/users/${user.id}`} size='small'>
                              <i className='ri ri-eye-line'></i>
                            </IconButton>
                            <IconButton onClick={() => handleOpenDeleteDialog(user.id)} size='small' color='error'>
                              <i className='ri ri-delete-bin-line'></i>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align='center'>
                          <Typography variant='body1'>No users found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteUser} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default UserList
