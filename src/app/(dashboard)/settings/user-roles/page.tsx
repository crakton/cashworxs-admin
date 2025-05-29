'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchUsers, addUser, toggleUserStatus, clearSuccessMessage, MOCK_STATES } from '@/store/slices/userManagementSlice';
import { fetchOrganizations } from '@/store/slices/organizationsSlice';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert
} from '@mui/material';

// Form validation
interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  role?: string;
  organizationId?: string;
  state?: string;
}

const UserRolesPage = () => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { users, currentUser, isLoading, error, successMessage } = useAppSelector(state => state.userManagement);
  const { organizations } = useAppSelector(state => state.organizations);
  
  // Local state for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'operator',
    organizationId: '',
    state: ''
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Filter users to exclude current user
  const filteredUsers = users.filter(user => currentUser && user.id !== currentUser.id);
  
  // Load users and organizations when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchOrganizations());
  }, [dispatch]);
  
  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Dialog handlers
  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    resetForm();
  };
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      role: 'operator',
      organizationId: '',
      state: ''
    });
    setFormErrors({});
    setShowPassword(false);
  };
  
  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // Toggle user active status
  const handleToggleUserStatus = (userId: string) => {
    dispatch(toggleUserStatus(userId));
  };
  
  // Validate form
  const validateForm = () => {
    const errors: FormErrors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\+\d{10,15}$/.test(formData.phone)) {
      errors.phone = 'Phone must be in international format (e.g., +2347012345678)';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.role) {
      errors.role = 'Role is required';
    }
    
    if (!formData.organizationId) {
      errors.organizationId = 'Organization is required';
    }
    
    if (!formData.state) {
      errors.state = 'State is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Submit form
  const handleSubmitForm = () => {
    if (validateForm()) {
      dispatch(addUser({ ...formData, role: formData.role as "operator" | "admin" }));
      handleCloseAddDialog();
    }
  };
  
  // Close success notification
  const handleCloseSuccessAlert = () => {
    dispatch(clearSuccessMessage());
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',});
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  return (
    <Grid container spacing={6}>
      {/* Success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={handleCloseSuccessAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccessAlert} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Error display */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        </Grid>
      )}
      
      {/* Page Header */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="User Role Management" 
            subheader="Manage admin users and operators"
            action={
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAddDialog}
                startIcon={<i className="ri-user-add-line"></i>}
              >
                Add User
              </Button>
            }
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <Box sx={{ width: '100%', mt: -1 }}>
              <LinearProgress />
            </Box>
          )}
          
          <CardContent>
            {/* Users Table */}
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table sx={{ minWidth: 750 }} aria-label="users table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Organization</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    (rowsPerPage > 0
                      ? filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : filteredUsers
                    ).map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={1}>
                            <Typography variant="body2">
                              <strong>Email:</strong> {user.email}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Phone:</strong> {user.phone}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role.toUpperCase()} 
                            color={user.role === 'admin' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.organization.name}</TableCell>
                        <TableCell>{user.state}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell align="center">
                          <Tooltip title={user.isActive ? 'Deactivate User' : 'Activate User'}>
                            <Switch
                              checked={user.isActive}
                              onChange={() => handleToggleUserStatus(user.id)}
                              color="success"
                              disabled={isLoading}
                            />
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        {isLoading ? (
                          <Typography>Loading users...</Typography>
                        ) : (
                          <Typography>No users found</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </CardContent>
        </Card>
      </Grid>
      
      {/* Add User Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Fill in the details below to add a new user. Select their organization, state, and role.
          </DialogContentText>
          
          <Grid container spacing={3}>
            {/* Organization and State Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.organizationId} sx={{ mb: 2 }}>
                <InputLabel>Organization</InputLabel>
                <Select
                  name="organizationId"
                  value={formData.organizationId}
                  onChange={handleSelectChange}
                  label="Organization"
                >
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.organizationId && (
                  <FormHelperText>{formErrors.organizationId}</FormHelperText>
                )}
              </FormControl>
              
              <FormControl fullWidth error={!!formErrors.state} sx={{ mb: 2 }}>
                <InputLabel>State</InputLabel>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleSelectChange}
                  label="State"
                >
                  {MOCK_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.state && (
                  <FormHelperText>{formErrors.state}</FormHelperText>
                )}
              </FormControl>
              
              <FormControl fullWidth error={!!formErrors.role}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleSelectChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="operator">Operator</MenuItem>
                </Select>
                {formErrors.role && (
                  <FormHelperText>{formErrors.role}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* User Information Fields */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+2347012345678"
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitForm}
            variant="contained"
            color="primary"
            startIcon={isLoading ? <i className="ri-loader-4-line"></i> : <i className="ri-save-line"></i>}
            disabled={isLoading}
          >
            {isLoading ? 'Adding...' : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UserRolesPage;