'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import {
  fetchOrganizationById,
  clearError,
  clearCurrentOrganization,
  fetchOrganizationServices
} from '@/store/slices/organizationsSlice'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'

interface OrganizationDetailProps {
  organizationId: string
}

const OrganizationDetail = ({ organizationId }: OrganizationDetailProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isLoading, error, currentOrganization, services } = useAppSelector(state => state.organizations)

  const [servicesPage, setServicesPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  // Fetch organization data
  useEffect(() => {
    if (organizationId) {
      dispatch(fetchOrganizationById(organizationId))
      dispatch(fetchOrganizationServices(organizationId))
    }

    // Clear current organization when unmounting
    return () => {
      dispatch(clearCurrentOrganization())
      dispatch(clearError())
    }
  }, [dispatch, organizationId])

  // Handle page change for services table
  const handleChangePage = (_event: unknown, newPage: number) => {
    setServicesPage(newPage)
  }

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setServicesPage(0)
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mt: 4 }} onClose={() => dispatch(clearError())}>
        {error}
      </Alert>
    )
  }

  if (!currentOrganization) {
    return (
      <Alert severity='info' sx={{ mt: 4 }}>
        Organization not found
      </Alert>
    )
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
              <Button
                size='small'
                variant='contained'
                onClick={() => router.push(`/services/create?org=${currentOrganization.id}`)}
                startIcon={<i className='ri-add-line' />}
              >
                Add Service
              </Button>
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
                                  onClick={() => router.push(`/services/${service.id}`)}
                                >
                                  <i className='ri-eye-line' />
                                </IconButton>
                                <IconButton
                                  size='small'
                                  color='primary'
                                  onClick={() => router.push(`/services/edit/${service.id}`)}
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
                  onClick={() => router.push(`/services/create?org=${currentOrganization.id}`)}
                  startIcon={<i className='ri-add-line' />}
                  sx={{ mt: 2 }}
                >
                  Add First Service
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default OrganizationDetail
