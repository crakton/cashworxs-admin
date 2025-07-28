'use client';

import { useState, useEffect, useCallback } from 'react';
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
	FormControl,
	FormHelperText,
	Grid,
	InputLabel,
	LinearProgress,
	MenuItem,
	Paper,
	Select,
	Snackbar,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Typography,
	Alert,
	Tabs,
	Tab,
	List,
	ListItem,
	ListItemText,
	ListItemAvatar,
	Avatar,
	Badge
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

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

// Initial form data
const initialFormData: NewNotification = {
	title: '',
	message: '',
	type: 'admin'
};

// Default empty arrays to prevent undefined issues
const defaultNotifications: any[] = [];
const defaultUserNotifications: any[] = [];
const defaultAvailableStates: any[] = [];
const defaultUsers: any[] = [];

export default function NotificationsPage() {
	const [mounted, setMounted] = useState(false);
	const dispatch = useAppDispatch();

	// Get data from Redux store with safe defaults
	const notificationsState = useAppSelector(state => state.notifications || {});
	const authState = useAppSelector(state => state.auth || {});

	const {
		notifications = defaultNotifications,
		userNotifications = defaultUserNotifications,
		availableStates = defaultAvailableStates,
		users = defaultUsers,
		isLoading = false,
		error = null,
		successMessage = null
	} = notificationsState;

	const { user = null } = authState;

	// Local state for pagination
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Tab state
	const [currentTab, setCurrentTab] = useState<TabType>('all');

	// Form state
	const [formData, setFormData] = useState<NewNotification>(initialFormData);

	// Form validation state
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	// Set mounted state
	useEffect(() => {
		setMounted(true);
	}, []);

	// Load initial data when component mounts
	useEffect(() => {
		if (!mounted) return;

		const loadData = async () => {
			try {
				await Promise.all([
					dispatch(getUserProfile()),
					dispatch(fetchNotifications()),
					dispatch(fetchUserNotifications()),
					dispatch(fetchAvailableStates()),
					dispatch(fetchUsersForNotification())
				]);
			} catch (error) {
				console.error('Error loading initial data:', error);
			}
		};

		loadData();
	}, [dispatch, mounted]);

	// Clear error handler
	const handleClearError = useCallback(() => {
		if (error && mounted) {
			const timer = setTimeout(() => {
				dispatch(clearNotificationError());
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [error, dispatch, mounted]);

	// Clear error when component unmounts or error changes
	useEffect(() => {
		return handleClearError();
	}, [handleClearError]);

	// Early return for SSR/hydration
	if (!mounted) {
		return (
			<Grid container spacing={6}>
				<Grid item xs={12}>
					<Card>
						<CardContent>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
								<LinearProgress sx={{ flex: 1 }} />
								<Typography variant='body2'>Loading notifications...</Typography>
							</Box>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		);
	}

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
		const value = parseInt(event.target.value, 10);
		setRowsPerPage(value);
		setPage(0);
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
	const validateForm = (): boolean => {
		const errors: FormErrors = {};

		if (!formData.title?.trim()) {
			errors.title = 'Title is required';
		}

		if (!formData.message?.trim()) {
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

	// Submit form with better error handling
	const handleSubmitForm = async () => {
		if (!validateForm()) return;

		try {
			await dispatch(sendNotification(formData)).unwrap();
			// Reset form on success
			setFormData(initialFormData);
			setFormErrors({});
		} catch (error) {
			console.error('Failed to send notification:', error);
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

	// Format date with error handling
	const formatDate = (dateString: string): string => {
		if (!dateString) return 'Invalid date';

		try {
			const date = new Date(dateString);
			if (isNaN(date.getTime())) return 'Invalid date';

			return date.toLocaleDateString('en-US', {
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
	const getTypeColor = (type: string): 'primary' | 'secondary' | 'success' | 'default' => {
		switch (type) {
			case 'admin':
				return 'primary';
			case 'state':
				return 'secondary';
			case 'personal':
				return 'success';
			default:
				return 'default';
		}
	};

	// Get status color
	const getStatusColor = (status: string): 'success' | 'error' | 'default' => {
		switch (status) {
			case 'sent':
				return 'success';
			case 'failed':
				return 'error';
			default:
				return 'default';
		}
	};

	// Filter unread notifications safely
	const unreadCount = Array.isArray(userNotifications) ? userNotifications.filter(n => n && !n.read_at).length : 0;

	// Get paginated notifications
	const paginatedNotifications = Array.isArray(notifications)
		? rowsPerPage > 0
			? notifications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
			: notifications
		: [];

	return (
		<Grid container spacing={6}>
			{/* Success message */}
			{successMessage && (
				<Snackbar
					open={!!successMessage}
					autoHideDuration={5000}
					onClose={handleCloseSuccessAlert}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				>
					<Alert onClose={handleCloseSuccessAlert} severity='success' sx={{ width: '100%' }}>
						{successMessage}
					</Alert>
				</Snackbar>
			)}

			{/* Error display */}
			{error && (
				<Snackbar
					open={!!error}
					autoHideDuration={8000}
					onClose={handleCloseErrorAlert}
					anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				>
					<Alert onClose={handleCloseErrorAlert} severity='error' sx={{ width: '100%' }}>
						{error}
					</Alert>
				</Snackbar>
			)}

			{/* Page Header */}
			<Grid item xs={12}>
				<Card>
					<CardHeader title='Notification Management' subheader='Send and manage system notifications' />

					{/* Loading indicator */}
					{isLoading && (
						<Box sx={{ width: '100%', mt: -1 }}>
							<LinearProgress />
						</Box>
					)}

					<CardContent>
						{/* Tabs */}
						<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
							<Tabs value={currentTab} onChange={handleTabChange} aria-label='notification tabs'>
								<Tab label='All Notifications' value='all' />
								<Tab
									label={
										<Badge badgeContent={unreadCount} color='error'>
											My Notifications
										</Badge>
									}
									value='user'
								/>
								<Tab label='Send Notification' value='send' />
							</Tabs>
						</Box>

						{/* Tab Content */}
						{currentTab === 'all' && (
							<TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
								<Table sx={{ minWidth: 750 }} aria-label='notifications table'>
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
										{paginatedNotifications.length > 0 ? (
											paginatedNotifications.map((notification, index) => (
												<TableRow key={notification?.id || index} hover>
													<TableCell>
														<Typography variant='body1' sx={{ fontWeight: 500 }}>
															{notification?.title || 'No title'}
														</Typography>
													</TableCell>
													<TableCell>
														<Typography
															variant='body2'
															sx={{
																whiteSpace: 'nowrap',
																overflow: 'hidden',
																textOverflow: 'ellipsis',
																maxWidth: '200px'
															}}
														>
															{notification?.message || 'No message'}
														</Typography>
													</TableCell>
													<TableCell>
														<Chip
															label={(notification?.type || 'unknown').toUpperCase()}
															color={getTypeColor(notification?.type || '')}
															size='small'
														/>
													</TableCell>
													<TableCell>{notification?.sender?.name || 'System'}</TableCell>
													<TableCell>
														{notification?.type === 'personal' && notification?.user?.name}
														{notification?.type === 'state' && notification?.stateInfo?.name}
														{notification?.type === 'admin' && 'All Admins'}
													</TableCell>
													<TableCell>
														<Chip
															label={(notification?.status || 'unknown').toUpperCase()}
															color={getStatusColor(notification?.status || '')}
															size='small'
														/>
													</TableCell>
													<TableCell>{formatDate(notification?.created_at || '')}</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={7} align='center' sx={{ py: 3 }}>
													<Typography>{isLoading ? 'Loading notifications...' : 'No notifications found'}</Typography>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>

								{/* Pagination */}
								{Array.isArray(notifications) && notifications.length > 0 && (
									<TablePagination
										rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
										component='div'
										count={notifications.length}
										rowsPerPage={rowsPerPage}
										page={page}
										onPageChange={handleChangePage}
										onRowsPerPageChange={handleChangeRowsPerPage}
									/>
								)}
							</TableContainer>
						)}

						{currentTab === 'user' && (
							<Box>
								<List sx={{ width: '100%' }}>
									{Array.isArray(userNotifications) && userNotifications.length > 0 ? (
										userNotifications.map((notification, index) => (
											<ListItem
												key={notification?.id || index}
												alignItems='flex-start'
												sx={{
													cursor: 'pointer',
													'&:hover': { backgroundColor: 'action.hover' }
												}}
												onClick={() => {
													if (notification?.id && !notification.read_at) {
														handleMarkAsRead(notification.id);
													}
												}}
											>
												<ListItemAvatar>
													<Avatar>{notification?.sender?.name?.charAt(0) || 'S'}</Avatar>
												</ListItemAvatar>
												<ListItemText
													primary={
														<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
															<Typography sx={{ fontWeight: !notification?.read_at ? 600 : 400 }}>
																{notification?.title || 'No title'}
															</Typography>
															<Typography variant='caption' color='text.secondary'>
																{notification?.created_at &&
																	formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
															</Typography>
														</Box>
													}
													secondary={
														<>
															<Typography
																sx={{ display: 'inline' }}
																component='span'
																variant='body2'
																color='text.primary'
															>
																{notification?.message || 'No message'}
															</Typography>
															<Chip
																label={(notification?.type || 'unknown').toUpperCase()}
																color={getTypeColor(notification?.type || '')}
																size='small'
																sx={{ ml: 1, mt: 0.5 }}
															/>
														</>
													}
												/>
											</ListItem>
										))
									) : (
										<Typography variant='body1' sx={{ py: 3, textAlign: 'center' }}>
											{isLoading ? 'Loading your notifications...' : 'You have no notifications'}
										</Typography>
									)}
								</List>
							</Box>
						)}

						{currentTab === 'send' && (
							<Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
								<Typography variant='h6' gutterBottom>
									Send a New Notification
								</Typography>
								<Typography variant='body2' color='text.secondary' gutterBottom>
									Select the type of notification you want to send and fill in the details.
								</Typography>

								<Grid container spacing={3} sx={{ mt: 2 }}>
									<Grid item xs={12} md={6}>
										<FormControl fullWidth error={!!formErrors.type} sx={{ mb: 3 }}>
											<InputLabel>Notification Type</InputLabel>
											<Select
												name='type'
												value={formData.type || 'admin'}
												onChange={handleSelectChange}
												label='Notification Type'
											>
												<MenuItem value='admin'>Admin Notification (to all admins)</MenuItem>
												<MenuItem value='state'>State Notification (to all users in a state)</MenuItem>
												<MenuItem value='personal'>Personal Notification (to a specific user)</MenuItem>
											</Select>
											{formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
										</FormControl>

										{formData.type === 'state' && (
											<FormControl fullWidth error={!!formErrors.state_id} sx={{ mb: 3 }}>
												<InputLabel>State</InputLabel>
												<Select
													name='state_id'
													value={formData.state_id || ''}
													onChange={handleSelectChange}
													label='State'
												>
													{Array.isArray(availableStates) &&
														availableStates.map((state, index) => (
															<MenuItem key={state || index} value={state}>
																{state}
															</MenuItem>
														))}
												</Select>
												{formErrors.state_id && <FormHelperText>{formErrors.state_id}</FormHelperText>}
											</FormControl>
										)}

										{formData.type === 'personal' && (
											<FormControl fullWidth error={!!formErrors.user_id} sx={{ mb: 3 }}>
												<InputLabel>User</InputLabel>
												<Select
													name='user_id'
													value={formData.user_id || ''}
													onChange={handleSelectChange}
													label='User'
												>
													{Array.isArray(users) &&
														users.map(user => (
															<MenuItem key={user?.id} value={user?.id}>
																{user?.name} ({user?.email})
															</MenuItem>
														))}
												</Select>
												{formErrors.user_id && <FormHelperText>{formErrors.user_id}</FormHelperText>}
											</FormControl>
										)}
									</Grid>

									<Grid item xs={12} md={6}>
										<TextField
											fullWidth
											label='Title'
											name='title'
											value={formData.title || ''}
											onChange={handleInputChange}
											error={!!formErrors.title}
											helperText={formErrors.title}
											sx={{ mb: 3 }}
										/>

										<TextField
											fullWidth
											label='Message'
											name='message'
											value={formData.message || ''}
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
										variant='contained'
										color='primary'
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
}
