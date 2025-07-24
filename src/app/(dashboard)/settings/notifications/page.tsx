'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { 
  fetchNotifications,
  fetchUserNotifications,
  sendNotification,
  fetchAvailableStates,
  fetchUsersForNotification,
  markNotificationAsRead,
  clearNotificationError,
  clearNotificationSuccess,
  type NewNotification
} from '@/store/slices/notificationsSlice';
import { getUserProfile } from '@/store/slices/authSlice';
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
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
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
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

// Form validation interface
interface FormErrors {
  title?: string;
  message?: string;
  type?: string;
  state_id?: string;
  user_id?: string;
}

// Tab types
type TabType = 'all' | 'user' | 'send';

const NotificationsPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Get data from Redux store
  const { 
    notifications, 
    userNotifications,
    availableStates,
    users,
    isLoading, 
    error, 
    successMessage 
  } = useAppSelector(state => state.notifications);
  const { user } = useAppSelector(state => state.auth);
  
  // Local state for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Tab state
  const [currentTab, setCurrentTab] = useState<TabType>('all');
  
  // Dialog state
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<NewNotification>({
    title: '',
    message: '',
    type: 'admin'
  });
  
  // Form validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Load initial data when component mounts
  useEffect(() => {
    dispatch(getUserProfile());
    dispatch(fetchNotifications());
    dispatch(fetchUserNotifications());
    dispatch(fetchAvailableStates());
    dispatch(fetchUsersForNotification());
  }, [dispatch]);

  // Clear error when component unmounts or error changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearNotificationError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabType) => {
    setCurrentTab(newValue);
    setPage(0);
  };

  // Handle pagination changes
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Dialog handlers
  const handleOpenSendDialog = () => {
    setSendDialogOpen(true);
  };
  
  const handleCloseSendDialog = () => {
    setSendDialogOpen(false);
    setFormData({
      title: '',
      message: '',
      type: 'admin'
    });
    setFormErrors({});
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

  // Validate form
  const validateForm = () => {
    const errors: FormErrors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }
    
    if (!formData.type) {
      errors.type = 'Notification type is required';
    }
    
    if (formData.type === 'state' && !formData.state_id) {
      errors.state_id = 'State is required for state notifications';
    }
    
    if (formData.type === 'personal' && !formData.user_id) {
      errors.user_id = 'User is required for personal notifications';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmitForm = () => {
    if (validateForm()) {
      dispatch(sendNotification(formData))
        .then(() => {
          handleCloseSendDialog();
        });
    }
  };

  // Mark notification as read
  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  // Close success/error notifications
  const handleCloseSuccessAlert = () => {
    dispatch(clearNotificationSuccess());
  };
  
  const handleCloseErrorAlert = () => {
    dispatch(clearNotificationError());
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get notification type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'primary';
      case 'state': return 'secondary';
      case 'personal': return 'success';
      default: return 'default';
    }
  };

  // Filter unread notifications
  const unreadCount = userNotifications.filter(n => !n.read_at).length;

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
            title="Notification Management" 
            subheader="Send and manage system notifications"
            // action={
            //   <Button
            //     variant="contained"
            //     color="primary"
            //     onClick={handleOpenSendDialog}
            //     startIcon={<i className='ri ri-send-plane-line'></i>}
            //     disabled={isLoading}
            //   >
            //     Send Notification
            //   </Button>
            // }
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <Box sx={{ width: '100%', mt: -1 }}>
              <LinearProgress />
            </Box>
          )}
          
          <CardContent>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={currentTab} onChange={handleTabChange} aria-label="notification tabs">
                <Tab label="All Notifications" value="all" />
                <Tab 
                  label={
                    <Badge badgeContent={unreadCount} color="error">
                      My Notifications
                    </Badge>
                  } 
                  value="user" 
                />
                <Tab label="Send Notification" value="send" />
              </Tabs>
            </Box>
            
            {/* Tab Content */}
            {currentTab === 'all' && (
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table sx={{ minWidth: 750 }} aria-label="notifications table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Sender</TableCell>
                      <TableCell>Recipient</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Sent At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notifications.length > 0 ? (
                      (rowsPerPage > 0
                        ? notifications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        : notifications
                      ).map((notification) => (
                        <TableRow key={notification.id} hover>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {notification.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ 
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '200px'
                            }}>
                              {notification.message}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={notification.type.toUpperCase()} 
                              color={getTypeColor(notification.type) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{notification.sender?.name || 'System'}</TableCell>
                          <TableCell>
                            {notification.type === 'personal' && notification.user?.name}
                            {notification.type === 'state' && notification.stateInfo?.name}
                            {notification.type === 'admin' && 'All Admins'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={notification.status.toUpperCase()} 
                              color={
                                notification.status === 'sent' ? 'success' : 
                                notification.status === 'failed' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{formatDate(notification.created_at)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          {isLoading ? (
                            <Typography>Loading notifications...</Typography>
                          ) : (
                            <Typography>No notifications found</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  component="div"
                  count={notifications.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            )}
            
            {currentTab === 'user' && (
              <Box>
                <List sx={{ width: '100%' }}>
                  {userNotifications.length > 0 ? (
                    userNotifications.map((notification) => (
                      <ListItem 
                        key={notification.id} 
                        alignItems="flex-start"
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        onClick={() => {
                          if (!notification.read_at) {
                            handleMarkAsRead(notification.id);
                          }
                          // You might want to navigate to a detailed view
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar>
                            {notification.sender?.name?.charAt(0) || 'S'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography sx={{ fontWeight: !notification.read_at ? 600 : 400 }}>
                                {notification.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                sx={{ display: 'inline' }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {notification.message}
                              </Typography>
                              <Chip 
                                label={notification.type.toUpperCase()} 
                                color={getTypeColor(notification.type) as any}
                                size="small"
                                sx={{ ml: 1, mt: 0.5 }}
                              />
                            </>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Typography variant="body1" sx={{ py: 3, textAlign: 'center' }}>
                      {isLoading ? 'Loading your notifications...' : 'You have no notifications'}
                    </Typography>
                  )}
                </List>
              </Box>
            )}
            
            {currentTab === 'send' && (
              <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Send a New Notification
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select the type of notification you want to send and fill in the details.
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!formErrors.type} sx={{ mb: 3 }}>
                      <InputLabel>Notification Type</InputLabel>
                      <Select
                        name="type"
                        value={formData.type}
                        onChange={handleSelectChange}
                        label="Notification Type"
                      >
                        <MenuItem value="admin">Admin Notification (to all admins)</MenuItem>
                        <MenuItem value="state">State Notification (to all users in a state)</MenuItem>
                        <MenuItem value="personal">Personal Notification (to a specific user)</MenuItem>
                      </Select>
                      {formErrors.type && (
                        <FormHelperText>{formErrors.type}</FormHelperText>
                      )}
                    </FormControl>
                    
                    {formData.type === 'state' && (
                      <FormControl fullWidth error={!!formErrors.state_id} sx={{ mb: 3 }}>
                        <InputLabel>State</InputLabel>
                        <Select
                          name="state_id"
                          value={formData.state_id || ''}
                          onChange={handleSelectChange}
                          label="State"
                        >
                          {availableStates.map((state) => (
                            <MenuItem key={state} value={state}>
                              {state}
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.state_id && (
                          <FormHelperText>{formErrors.state_id}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                    
                    {formData.type === 'personal' && (
                      <FormControl fullWidth error={!!formErrors.user_id} sx={{ mb: 3 }}>
                        <InputLabel>User</InputLabel>
                        <Select
                          name="user_id"
                          value={formData.user_id || ''}
                          onChange={handleSelectChange}
                          label="User"
                        >
                          {users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </MenuItem>
                          ))}
                        </Select>
                        {formErrors.user_id && (
                          <FormHelperText>{formErrors.user_id}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      error={!!formErrors.title}
                      helperText={formErrors.title}
                      sx={{ mb: 3 }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      error={!!formErrors.message}
                      helperText={formErrors.message}
                      multiline
                      rows={4}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitForm}
                    disabled={isLoading}
                    startIcon={<i className='ri ri-send-plane-line'></i>}
                  >
                    {isLoading ? 'Sending...' : 'Send Notification'}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default NotificationsPage;