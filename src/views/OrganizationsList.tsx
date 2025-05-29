'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import {
	Card,
	CardHeader,
	CardContent,
	Button,
	Box,
	Typography,
	Chip,
	LinearProgress,
	Grid,
	IconButton,
	Alert,
	Snackbar,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TablePagination
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { Organization } from '@/store/slices/organizationsSlice';
import { fetchOrganizations, deleteOrganization, clearError } from '@/store/slices/organizationsSlice';

// MUI Imports

const OrganizationsList = () => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const { organizations, isLoading, error } = useAppSelector(state => state.organizations);

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [organizationToDelete, setOrganizationToDelete] = useState<string | null>(null);

	const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
		open: false,
		message: '',
		severity: 'success'
	});

	// Fetch organizations on component mount
	useEffect(() => {
		dispatch(fetchOrganizations());
	}, [dispatch]);

	// Handle page change
	const handleChangePage = (_event: unknown, newPage: number) => {
		setPage(newPage);
	};

	// Handle rows per page change
	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Handle delete organization
	const handleDeleteClick = (organizationId: string) => {
		setOrganizationToDelete(organizationId);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (organizationToDelete) {
			try {
				const resultAction = await dispatch(deleteOrganization(organizationToDelete));

				if (deleteOrganization.fulfilled.match(resultAction)) {
					setSnackbar({
						open: true,
						message: 'Organization deleted successfully',
						severity: 'success'
					});
				} else {
					setSnackbar({
						open: true,
						message: 'Failed to delete organization',
						severity: 'error'
					});
				}
			} catch (error) {
				setSnackbar({
					open: true,
					message: 'An error occurred',
					severity: 'error'
				});
			}
		}

		setDeleteDialogOpen(false);
		setOrganizationToDelete(null);
	};

	const handleCloseSnackbar = () => {
		setSnackbar({ ...snackbar, open: false });
	};

	// View organization details
	const handleViewOrganization = (organizationId: string) => {
		router.push(`/organizations/${organizationId}`);
	};

	// Edit organization
	const handleEditOrganization = (organizationId: string) => {
		router.push(`/organizations/edit/${organizationId}`);
	};

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				<Box display='flex' justifyContent='space-between' alignItems='center' mb={4}>
					<Typography variant='h4'>Organizations</Typography>
					<Button
						variant='contained'
						startIcon={<i className='ri-add-line' />}
						onClick={() => router.push('/organizations/new')}
					>
						Add Organization
					</Button>
				</Box>

				{error && (
					<Alert severity='error' sx={{ mb: 4 }} onClose={() => dispatch(clearError())}>
						{error}
					</Alert>
				)}

				<Card>
					<CardHeader title='All Organizations' />
					<CardContent>
						{isLoading ? (
							<Box sx={{ width: '100%', mb: 4 }}>
								<LinearProgress />
							</Box>
						) : organizations.length === 0 ? (
							<Typography align='center' sx={{ py: 5 }}>
								No organizations found. Click "Add Organization" to create one.
							</Typography>
						) : (
							<Paper sx={{ width: '100%', overflow: 'hidden' }}>
								<TableContainer sx={{ maxHeight: 440 }}>
									<Table stickyHeader aria-label='sticky table'>
										<TableHead>
											<TableRow>
												<TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>Services Count</TableCell>
												<TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{organizations
												.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
												.map((organization: Organization) => (
													<TableRow hover key={organization.id}>
														<TableCell>{organization.name}</TableCell>
														<TableCell>
															<Chip
																label={organization.type}
																color={organization.type === 'Government' ? 'primary' : 'secondary'}
																size='small'
															/>
														</TableCell>
														<TableCell>{organization.services ? organization.services.length : 0}</TableCell>
														<TableCell>
															<Box sx={{ display: 'flex', gap: 1 }}>
																<IconButton
																	size='small'
																	color='primary'
																	onClick={() => handleViewOrganization(organization.id)}
																>
																	<i className='ri-eye-line' />
																</IconButton>
																{/* <IconButton
                                  size='small'
                                  color='primary'
                                  onClick={() => handleEditOrganization(organization.id)}
                                >
                                  <i className='ri-edit-line' />
                                </IconButton> */}
																<IconButton
																	size='small'
																	color='error'
																	onClick={() => handleDeleteClick(organization.id)}
																>
																	<i className='ri-delete-bin-5-line' />
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
									count={organizations.length}
									rowsPerPage={rowsPerPage}
									page={page}
									onPageChange={handleChangePage}
									onRowsPerPageChange={handleChangeRowsPerPage}
								/>
							</Paper>
						)}
					</CardContent>
				</Card>
			</Grid>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
				<DialogTitle>Delete Organization</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete this organization? This action will also delete all services associated with
						this organization and cannot be undone.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button onClick={handleDeleteConfirm} color='error'>
						Delete
					</Button>
				</DialogActions>
			</Dialog>

			{/* Snackbar for notifications */}
			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={handleCloseSnackbar}
				anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			>
				<Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</Grid>
	);
};

export default OrganizationsList;
