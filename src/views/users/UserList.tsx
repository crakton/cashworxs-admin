'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { exportToCSV } from '@/utils';
import {
	Card,
	Grid,
	Table,
	Button,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	Typography,
	IconButton,
	CardHeader,
	TableContainer,
	LinearProgress,
	CardContent,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	TextField,
	InputAdornment,
	Switch,
	FormControlLabel,
	Box,
	Tooltip,
	Chip
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { Mode } from '@/@core/types';
import { deleteUser, fetchAllUsers, toggleUserStatus } from '@/store/slices/userSlice';

const UserList = ({ mode }: { mode: Mode }) => {
	// Hooks
	const dispatch = useAppDispatch();
	const { users, isLoading, error } = useAppSelector(state => state.users);

	// State
	const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
		open: false,
		userId: null
	});
	const [searchTerm, setSearchTerm] = useState('');
	const [showInactive, setShowInactive] = useState(false);

	// Effects
	useEffect(() => {
		dispatch(fetchAllUsers());
	}, [dispatch]);

	// Filter users based on search term and active status
	const filteredUsers = useMemo(() => {
		if (!users) return [];

		return users.filter(user => {
			const matchesSearch =
				user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				user.phone_number?.includes(searchTerm) ||
				user.email?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesStatus = showInactive ? true : user.is_active !== false;

			return matchesSearch && matchesStatus;
		});
	}, [users, searchTerm, showInactive]);

	// Handlers
	const handleOpenDeleteDialog = (userId: string) => {
		setDeleteDialog({ open: true, userId });
	};

	const handleCloseDeleteDialog = () => {
		setDeleteDialog({ open: false, userId: null });
	};

	const handleDeleteUser = async () => {
		if (deleteDialog.userId) {
			await dispatch(deleteUser(deleteDialog.userId));
			handleCloseDeleteDialog();
		}
	};

	const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
		await dispatch(toggleUserStatus({ userId, isActive: !currentStatus }));
	};

	const handleExportUsers = () => {
		const dataToExport = filteredUsers.map(user => ({
			ID: user.id,
			Name: user.full_name || 'N/A',
			Email: user.email || 'N/A',
			'Phone Number': user.phone_number || 'N/A',
			Status: user.is_active ? 'Active' : 'Inactive',
			'Created At': user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'
		}));

		exportToCSV(dataToExport);
	};

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Card>
					<CardHeader
						title='Users Management'
						action={
							<Box display='flex' alignItems='center' gap={2}>
								<Button variant='contained' startIcon={<i className='ri-download-line' />} onClick={handleExportUsers}>
									Export
								</Button>
								<Button
									variant='contained'
									component={Link}
									href='/users/new'
									startIcon={<i className='ri-user-line' />}
								>
									Add User
								</Button>
							</Box>
						}
					/>
					<CardContent>
						<Box display='flex' justifyContent='space-between' mb={4}>
							<TextField
								variant='outlined'
								placeholder='Search users...'
								size='small'
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<i className='ri-search-line' />
										</InputAdornment>
									)
								}}
								sx={{ width: 300 }}
							/>
						</Box>

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
											<TableCell>Email</TableCell>
											<TableCell>Phone Number</TableCell>
											<TableCell>Status</TableCell>
											<TableCell>Created At</TableCell>
											<TableCell>Actions</TableCell>
											<TableCell>Deactivate User</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{filteredUsers.length > 0 ? (
											filteredUsers.map(user => (
												<TableRow key={user.id} hover>
													<TableCell>{user.id.substring(0, 8)}...</TableCell>
													<TableCell>{user.full_name || user.name || 'N/A'}</TableCell>
													<TableCell>{user.email || 'N/A'}</TableCell>
													<TableCell>{user.phone_number || 'N/A'}</TableCell>
													<TableCell>
														<Chip
															label={user.is_active ? 'Active' : 'Inactive'}
															color={user.is_active ? 'success' : 'error'}
															size='small'
														/>
													</TableCell>
													<TableCell>
														{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
													</TableCell>
													<TableCell>
														<Tooltip title='View user'>
															<IconButton color='primary' component={Link} href={`/users/${user.id}`} size='small'>
																<i className='ri-eye-line' />
															</IconButton>
														</Tooltip>
														<Tooltip title='Delete user'>
															<IconButton onClick={() => handleOpenDeleteDialog(user.id)} size='small' color='error'>
																<i className='ri-delete-bin-line' />
															</IconButton>
														</Tooltip>
													</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Switch
                                  onChange={() => handleToggleStatus(user.id, user.is_active)}
                                  color='primary'
                                />
                              }
                              label=''
                            />
                          </TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={7} align='center'>
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
	);
};

export default UserList;
