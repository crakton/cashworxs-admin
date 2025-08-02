'use client';

import { useEffect, useState } from 'react';
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
	setCurrentUser
} from '@/store/slices/userManagementSlice';

// MUI Imports
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';

// Types
import type { User, NewUser } from '@/store/slices/userManagementSlice';

// Default user template
const defaultUser: NewUser = {
	name: '',
	phone: '',
	email: '',
	password: '',
	role: 'operator',
	state: ''
};

// Confirmation dialog interface
interface ConfirmDialog {
	open: boolean;
	title: string;
	message: string;
	userId: string | null;
	action: 'delete' | 'toggleStatus' | null;
}

const RoleControlPage = () => {
	// Hooks
	const dispatch = useAppDispatch();
	const { users, currentUser, availableStates, availableRoles, isLoading, error, successMessage } = useAppSelector(
		state => state.userManagement
	);

	// State
	const [userDialog, setUserDialog] = useState<{
		open: boolean;
		mode: 'add' | 'edit' | 'view';
		data: NewUser | User;
	}>({
		open: false,
		mode: 'add',
		data: { ...defaultUser }
	});

	const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
		open: false,
		title: '',
		message: '',
		userId: null,
		action: null
	});

	const [passwordVisible, setPasswordVisible] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	// Pagination state
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Effects
	useEffect(() => {
		dispatch(fetchUsers());
		dispatch(fetchStates());
		dispatch(fetchAvailableRoles());
	}, [dispatch]);

	useEffect(() => {
		if (successMessage) {
			const timer = setTimeout(() => {
				dispatch(clearSuccessMessage());
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [successMessage, dispatch]);

	// Handlers
	const handleOpenAddDialog = () => {
		setUserDialog({
			open: true,
			mode: 'add',
			data: { ...defaultUser }
		});
	};

	const handleOpenEditDialog = (user: User) => {
		setUserDialog({
			open: true,
			mode: 'edit',
			data: { ...user }
		});
	};

	const handleOpenViewDialog = (user: User) => {
		setUserDialog({
			open: true,
			mode: 'view',
			data: { ...user }
		});
	};

	const handleCloseDialog = () => {
		setUserDialog({
			...userDialog,
			open: false
		});
		setPasswordVisible(false);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setUserDialog({
			...userDialog,
			data: {
				...userDialog.data,
				[name]: value
			}
		});
	};

	const handleSelectChange = (e: SelectChangeEvent<string>) => {
		const { name, value } = e.target;

		setUserDialog({
			...userDialog,
			data: {
				...userDialog.data,
				[name]: value
			}
		});
	};

	const handleSaveUser = () => {
		if (userDialog.mode === 'add') {
			dispatch(addUser(userDialog.data as NewUser));
		} else {
			const { id, ...userData } = userDialog.data as User;
			dispatch(updateUser({ userId: id, userData }));
		}

		handleCloseDialog();
	};

	const openDeleteConfirmDialog = (userId: string) => {
		setConfirmDialog({
			open: true,
			title: 'Delete User',
			message: 'Are you sure you want to delete this user? This action cannot be undone.',
			userId,
			action: 'delete'
		});
	};

	const openStatusConfirmDialog = (userId: string, isActive: boolean) => {
		setConfirmDialog({
			open: true,
			title: isActive ? 'Deactivate User' : 'Activate User',
			message: isActive
				? 'Are you sure you want to deactivate this user? They will no longer be able to access the system.'
				: 'Are you sure you want to activate this user? They will regain access to the system.',
			userId,
			action: 'toggleStatus'
		});
	};

	const handleConfirmAction = () => {
		if (confirmDialog.userId) {
			if (confirmDialog.action === 'delete') {
				dispatch(deleteUser(confirmDialog.userId));
			} else if (confirmDialog.action === 'toggleStatus') {
				dispatch(toggleUserStatus(confirmDialog.userId));
			}
		}
		setConfirmDialog({ ...confirmDialog, open: false });
	};

	const handleCloseConfirmDialog = () => {
		setConfirmDialog({ ...confirmDialog, open: false });
	};

	const handleClearError = () => {
		dispatch(clearUserError());
	};

	const handleClearSuccess = () => {
		dispatch(clearSuccessMessage());
	};

	// Pagination handlers
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Filter users based on search term
	const filteredUsers = users.filter(
		user =>
			user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.phone?.includes(searchTerm)
	);

	// Get paginated users
	const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	// Role colors
	const getRoleColor = (role: string) => {
		switch (role) {
			case 'admin':
				return 'primary';
			case 'irs_specialist':
				return 'secondary';
			case 'operator':
				return 'info';
			default:
				return 'default';
		}
	};

	// Validation with null checks and optional email
	const isFormValid = () => {
		const { name, phone, role, state } = userDialog.data;

		// Check required fields (email is now optional)
		if (!name || !phone || !role || !state) return false;

		// Additional validation for add mode
		if (userDialog.mode === 'add') {
			const { password } = userDialog.data as NewUser;
			return !!password;
		}

		return true;
	};

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<Typography variant='h5'>User Role Management</Typography>
					<Button
						variant='contained'
						startIcon={<i className='ri-user-add-line' />}
						onClick={handleOpenAddDialog}
						disabled={isLoading}
					>
						Add New User
					</Button>
				</Box>

				{error && (
					<Alert severity='error' sx={{ mb: 4 }} onClose={handleClearError}>
						{error}
					</Alert>
				)}

				{successMessage && (
					<Alert severity='success' sx={{ mb: 4 }} onClose={handleClearSuccess}>
						{successMessage}
					</Alert>
				)}

				<Card>
					<CardContent>
						<Box sx={{ mb: 4 }}>
							<TextField
								fullWidth
								variant='outlined'
								placeholder='Search users...'
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								InputProps={{
									startAdornment: <i className='ri-search-line' style={{ marginRight: 8 }} />
								}}
							/>
						</Box>

						{isLoading && users.length === 0 ? (
							<LinearProgress sx={{ mb: 4 }} />
						) : users.length === 0 ? (
							<Typography align='center' color='text.secondary'>
								No users found. Click the button above to add your first user.
							</Typography>
						) : (
							<TableContainer component={Paper} elevation={0}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>User</TableCell>
											<TableCell>Contact</TableCell>
											<TableCell>Role</TableCell>

											<TableCell>Status</TableCell>
											<TableCell>Actions</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{paginatedUsers.map(user => (
											<TableRow key={user.id} hover>
												<TableCell>
													<Box sx={{ display: 'flex', alignItems: 'center' }}>
														<Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
															{user.name?.charAt(0)?.toUpperCase() || '?'}
														</Avatar>
														<Box>
															<Typography variant='subtitle2'>{user.name || 'N/A'}</Typography>
															<Typography variant='caption' color='text.secondary'>
																{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
															</Typography>
														</Box>
													</Box>
												</TableCell>
												<TableCell>
													<Typography variant='body2'>{user.email || 'No email'}</Typography>
													<Typography variant='body2'>{user.phone || 'N/A'}</Typography>
												</TableCell>
												<TableCell>
													<Chip
														label={user.role || 'N/A'}
														color={getRoleColor(user.role)}
														size='small'
														sx={{ textTransform: 'capitalize' }}
													/>
												</TableCell>

												<TableCell>
													<Box sx={{ display: 'flex', alignItems: 'center' }}>
														{user.isActive ? (
															<>
																<i className='ri-check-line' style={{ color: 'green' }} />
																<Typography variant='body2' sx={{ ml: 1 }}>
																	Active
																</Typography>
															</>
														) : (
															<>
																<i className='ri-close-line' style={{ color: 'red' }} />
																<Typography variant='body2' sx={{ ml: 1 }}>
																	Inactive
																</Typography>
															</>
														)}
													</Box>
												</TableCell>
												<TableCell>
													<Box sx={{ display: 'flex' }}>
														<Tooltip title='View'>
															<IconButton size='small' onClick={() => handleOpenViewDialog(user)}>
																<i className='ri-eye-line' />
															</IconButton>
														</Tooltip>
														<Tooltip title='Edit'>
															<IconButton size='small' onClick={() => handleOpenEditDialog(user)}>
																<i className='ri-edit-line' />
															</IconButton>
														</Tooltip>
														<Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
															<IconButton
																size='small'
																color={user.isActive ? 'warning' : 'success'}
																onClick={() => openStatusConfirmDialog(user.id, user.isActive)}
															>
																{user.isActive ? <i className='ri-eye-off-line' /> : <i className='ri-eye-line' />}
															</IconButton>
														</Tooltip>
														<Tooltip title='Delete'>
															<IconButton size='small' color='error' onClick={() => openDeleteConfirmDialog(user.id)}>
																<i className='ri-delete-bin-line' />
															</IconButton>
														</Tooltip>
													</Box>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								<TablePagination
									rowsPerPageOptions={[5, 10, 25, 50]}
									component='div'
									count={filteredUsers.length}
									rowsPerPage={rowsPerPage}
									page={page}
									onPageChange={handleChangePage}
									onRowsPerPageChange={handleChangeRowsPerPage}
								/>
							</TableContainer>
						)}
					</CardContent>
				</Card>
			</Grid>

			{/* User Dialog */}
			<Dialog open={userDialog.open} onClose={handleCloseDialog} maxWidth='md' fullWidth>
				<DialogTitle>
					{userDialog.mode === 'add' ? 'Add New User' : userDialog.mode === 'edit' ? 'Edit User' : 'User Details'}
				</DialogTitle>
				<DialogContent dividers>
					<Grid container spacing={3}>
						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								label='Full Name'
								name='name'
								value={userDialog.data.name || ''}
								onChange={handleInputChange}
								required
								disabled={userDialog.mode === 'view'}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								label='Email (Optional)'
								name='email'
								type='email'
								value={userDialog.data.email || ''}
								onChange={handleInputChange}
								disabled={userDialog.mode === 'view'}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<TextField
								fullWidth
								label='Phone Number'
								name='phone'
								value={userDialog.data.phone || ''}
								onChange={handleInputChange}
								required
								disabled={userDialog.mode === 'view'}
							/>
						</Grid>
						<Grid item xs={12} md={6}>
							<FormControl fullWidth required disabled={userDialog.mode === 'view'}>
								<InputLabel id='role-label'>Role</InputLabel>
								<Select
									labelId='role-label'
									id='role'
									name='role'
									value={userDialog.data.role || ''}
									label='Role'
									onChange={handleSelectChange}
								>
									{availableRoles.map(role => (
										<MenuItem key={role} value={role} sx={{ textTransform: 'capitalize' }}>
											{role.replace('_', ' ')}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
						<Grid item xs={12} md={6}>
							<FormControl fullWidth required disabled={userDialog.mode === 'view'}>
								<InputLabel id='state-label'>State</InputLabel>
								<Select
									labelId='state-label'
									id='state'
									name='state'
									value={userDialog.data.state || ''}
									label='State'
									onChange={handleSelectChange}
								>
									{availableStates.map(state => (
										<MenuItem key={state} value={state}>
											{state}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						{userDialog.mode === 'add' && (
							<Grid item xs={12}>
								<TextField
									fullWidth
									label='Password'
									name='password'
									type={passwordVisible ? 'text' : 'password'}
									value={(userDialog.data as NewUser).password || ''}
									onChange={handleInputChange}
									required
									InputProps={{
										endAdornment: (
											<IconButton size='small' onClick={() => setPasswordVisible(!passwordVisible)}>
												{passwordVisible ? <i className='ri-eye-off-line' /> : <i className='ri-eye-line' />}
											</IconButton>
										)
									}}
								/>
							</Grid>
						)}

						{userDialog.mode === 'view' && (
							<>
								<Grid item xs={12} md={6}>
									<FormControlLabel
										control={<Switch checked={(userDialog.data as User).isActive || false} color='primary' disabled />}
										label={(userDialog.data as User).isActive ? 'Active' : 'Inactive'}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<Typography variant='body2'>
										<strong>Created At:</strong>{' '}
										{(userDialog.data as User).createdAt
											? new Date((userDialog.data as User).createdAt).toLocaleString()
											: 'N/A'}
									</Typography>
								</Grid>
							</>
						)}
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog}>{userDialog.mode === 'view' ? 'Close' : 'Cancel'}</Button>
					{userDialog.mode !== 'view' && (
						<Button variant='contained' onClick={handleSaveUser} disabled={!isFormValid() || isLoading}>
							{isLoading ? <CircularProgress size={24} /> : userDialog.mode === 'add' ? 'Create' : 'Update'}
						</Button>
					)}
				</DialogActions>
			</Dialog>

			{/* Confirm Action Dialog */}
			<Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog}>
				<DialogTitle>{confirmDialog.title}</DialogTitle>
				<DialogContent>
					<Typography>{confirmDialog.message}</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseConfirmDialog}>Cancel</Button>
					<Button
						variant='contained'
						color={
							confirmDialog.action === 'delete'
								? 'error'
								: confirmDialog.action === 'toggleStatus'
									? 'warning'
									: 'primary'
						}
						onClick={handleConfirmAction}
						disabled={isLoading}
					>
						{isLoading ? <CircularProgress size={24} /> : 'Confirm'}
					</Button>
				</DialogActions>
			</Dialog>
		</Grid>
	);
};

export default RoleControlPage;
