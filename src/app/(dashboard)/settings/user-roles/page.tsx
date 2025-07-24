'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { 
  fetchUsers, 
  addUser, 
  updateUser,
  toggleUserStatus, 
  deleteUser,
  fetchStates,
  fetchAvailableRoles,
  clearUserError,
  clearSuccessMessage,
  setCurrentUser,
  type NewUser 
} from '@/store/slices/userManagementSlice';
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
  Alert,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';

// Form validation interface
interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  role?: string;
  organizationId?: string;
  state?: string;
}

// Dialog modes
type DialogMode = 'add' | 'edit' | 'view' | null;

const UserRolesPage = () => {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const { 
    users, 
    currentUser, 
    availableStates, 
    availableRoles, 
    isLoading, 
    error, 
    successMessage 
  } = useAppSelector(state => state.userManagement);
  const { organizations } = useAppSelector(state => state.organizations);
  
  // Local state for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog state
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Menu state for actions
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  
  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'operator' as 'admin' | 'operator' | 'irs_specialist',
    organizationId: '',
    state: ''
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Filter users to exclude current user
  const filteredUsers = users.filter(user => currentUser && user.id !== currentUser.id);
  
  // Load initial data when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchOrganizations());
    dispatch(fetchStates());
    dispatch(fetchAvailableRoles());
  }, [dispatch]);
  
  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearUserError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);
  
  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };
  
  // Dialog handlers
  const handleOpenDialog = (mode: DialogMode, user?: any) => {
    setDialogMode(mode);
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '', // Never pre-fill password
        role: user.role || 'operator',
        organizationId: user.organization?.id || '',
        state: user.state || ''
      });
    } else {
      resetForm();
    }
    handleMenuClose();
  };
  
  const handleCloseDialog = () => {
    setDialogMode(null);
    setSelectedUser(null);
    resetForm();
  };
  
  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
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
  
  // Delete user handlers
  const handleDeleteConfirm = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };
  
  const handleDeleteExecute = () => {
    if (userToDelete) {
      dispatch(deleteUser(userToDelete));
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
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
    
    // Password validation - required for add mode, optional for edit
    if (dialogMode === 'add') {
      if (!formData.password.trim()) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
    } else if (dialogMode === 'edit' && formData.password && formData.password.length < 8) {
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
      const userData: NewUser | Partial<NewUser> = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        role: formData.role,
        organizationId: formData.organizationId,
        state: formData.state
      };
      
      // Add password only if provided
      if (formData.password) {
        (userData as NewUser).password = formData.password;
      }
      
      if (dialogMode === 'add') {
        dispatch(addUser(userData as NewUser));
      } else if (dialogMode === 'edit' && selectedUser) {
        dispatch(updateUser({ 
          userId: selectedUser.id, 
          userData 
        }));
      }
      
      handleCloseDialog();
    }
  };
  
  // Close success/error notifications
  const handleCloseSuccessAlert = () => {
    dispatch(clearSuccessMessage());
  };
  
  const handleCloseErrorAlert = () => {
    dispatch(clearUserError());
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'primary';
      case 'irs_specialist': return 'secondary';
      default: return 'default';
    }
  };
  
  // Dialog title based on mode
  const getDialogTitle = () => {
    switch (dialogMode) {
      case 'add': return 'Add New User';
      case 'edit': return 'Edit User';
      case 'view': return 'User Details';
      default: return '';
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
      <Snackbar
        open={!!error}
        autoHideDuration={8000}
        onClose={handleCloseErrorAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseErrorAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      {/* Page Header */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title="User Role Management" 
            subheader={`Manage admin users and operators (${filteredUsers.length} users)`}
            action={
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenDialog('add')}
                startIcon={<i className="ri-add-line" />}
                disabled={isLoading}
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
                    <TableCell align="center">Actions</TableCell>
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
                            label={user.role.replace('_', ' ').toUpperCase()} 
                            color={getRoleColor(user.role) as any}
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
                        <TableCell align="center">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, user.id)}
                            disabled={isLoading}
                          >
                            <i className="ri-more-2-line" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
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
      
      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === menuUserId);
          handleOpenDialog('view', user);
        }}>
          <ListItemIcon>
            <i className="ri-eye-line"/>
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const user = users.find(u => u.id === menuUserId);
          handleOpenDialog('edit', user);
        }}>
          <ListItemIcon>
            <i className="ri-edit-line"/>
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => menuUserId && handleDeleteConfirm(menuUserId)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <i className="ri-delete-bin-6-line" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Add/Edit User Dialog */}
      <Dialog
        open={dialogMode === 'add' || dialogMode === 'edit' || dialogMode === 'view'}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{getDialogTitle()}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            {dialogMode === 'add' && 'Fill in the details below to add a new user. Select their organization, state, and role.'}
            {dialogMode === 'edit' && 'Update the user details below. Leave password empty to keep current password.'}
            {dialogMode === 'view' && 'View user details below.'}
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
                  disabled={dialogMode === 'view'}
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
                  disabled={dialogMode === 'view'}
                >
                  {availableStates.map((state) => (
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
                  disabled={dialogMode === 'view'}
                >
                  {availableRoles.length > 0 ? (
                    availableRoles.map((role) => (
                      <MenuItem key={role} value={role}>
                        {role.replace('_', ' ').toUpperCase()}
                      </MenuItem>
                    ))
                  ) : (
                    // Fallback to default roles if availableRoles is empty
                    <>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="operator">Operator</MenuItem>
                      <MenuItem value="irs_specialist">IRS Specialist</MenuItem>
                    </>
                  )}
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
                disabled={dialogMode === 'view'}
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
                disabled={dialogMode === 'view'}
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
                disabled={dialogMode === 'view'}
                sx={{ mb: 2 }}
              />
              
              {dialogMode !== 'view' && (
                <TextField
                  fullWidth
                  label={dialogMode === 'edit' ? 'New Password (optional)' : 'Password'}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password || (dialogMode === 'edit' ? 'Leave empty to keep current password' : '')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <i className='ri-eye-off-line' /> : <i className="ri-eye-line" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmitForm}
              variant="contained"
              color="primary"
              startIcon={isLoading ? <div className="animate-spin">⏳</div> : <i className="ri-save-line" />}
              disabled={isLoading}
            >
              {isLoading ? 
                (dialogMode === 'add' ? 'Adding...' : 'Updating...') : 
                (dialogMode === 'add' ? 'Add User' : 'Update User')
              }
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteExecute}
            variant="contained"
            color="error"
            startIcon={isLoading ? <div className="animate-spin">⏳</div> : <i className='ri-delete-bin-6-line' />}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UserRolesPage;