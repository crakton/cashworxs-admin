'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
// Redux Imports
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { clearCurrentUser, fetchUserById, fetchUserTransactions, updateUser } from '@/store/slices/userSlice'

// Custom Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode
  value: number
  index: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const UserDetailPage = () => {
  // Hooks
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const dispatch = useAppDispatch()
  const { currentUser, isLoading, error, transactions } = useAppSelector(state => state.users)
  // State
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({
    full_name: '',
    // email: '',
    phone_number: ''
    // role: ''
  })
  const [formErrors, setFormErrors] = useState({
    full_name: '',
    // email: '',
    phone_number: ''
  })

  // Effects
  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id))
      dispatch(fetchUserTransactions())
    }

    // Clean up
    return () => {
      dispatch(clearCurrentUser())
    }
  }, [dispatch, id])

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        // email: currentUser.email || '',
        phone_number: currentUser.phone_number || ''
        // role: currentUser.role || 'user'
      })
    }
  }, [currentUser])

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const errors = {
      full_name: '',
      email: '',
      phone_number: ''
    }

    if (!formData.full_name) {
      errors.full_name = 'Name is required'
      isValid = false
    }

    // if (!formData.email) {
    //   errors.email = 'Email is required'
    //   isValid = false
    // } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   errors.email = 'Email is invalid'
    //   isValid = false
    // }

    if (formData.phone_number && !/^\d{10,15}$/.test(formData.phone_number)) {
      errors.phone_number = 'Phone number must be between 10-15 digits'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (id) {
      await dispatch(updateUser({ userId: id, userData: formData }))
    }
  }

  if (isLoading && !currentUser) {
    return <LinearProgress />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h5'>User Details</Typography>
          <Button component={Link} href='/users' variant='outlined'>
            Back to Users
          </Button>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardHeader title={currentUser?.full_name || 'User Information'} />

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label='user tabs'>
              <Tab label='Profile' />
              <Tab label='Transactions' />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Full Name'
                    name='full_name'
                    value={formData.full_name}
                    onChange={handleInputChange}
                    error={!!formErrors.full_name}
                    helperText={formErrors.full_name}
                  />
                </Grid>

                {/* <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                  />
                </Grid> */}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Phone Number'
                    name='phone_number'
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    error={!!formErrors.phone_number}
                    helperText={formErrors.phone_number}
                  />
                </Grid>

                {/* <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id='role-label'>Role</InputLabel>
                    <Select
                      labelId='role-label'
                      name='role'
                      value={formData.role}
                      label='Role'
                      onChange={handleInputChange}
                    >
                      <MenuItem value='user'>User</MenuItem>
                      <MenuItem value='admin'>Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid> */}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button type='reset' variant='outlined'>
                      Reset
                    </Button>
                    <Button type='submit' variant='contained' disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions && transactions.length > 0 ? (
                    transactions.map(transaction => (
                      <TableRow key={transaction.id} hover>
                        <TableCell>{transaction.id.substring(0, 8)}...</TableCell>
                        <TableCell>{transaction.type.toUpperCase()}</TableCell>
                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>{transaction.status}</TableCell>
                        <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        <Typography variant='body1'>No transactions found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </Card>
      </Grid>
    </Grid>
  )
}

export default UserDetailPage
