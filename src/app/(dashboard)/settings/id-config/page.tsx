'use client';

import {
	Card,
	CardHeader,
	CardContent,
	Button,
	Grid,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Checkbox,
	Box,
	LinearProgress,
	Alert,
	Snackbar,
	Tooltip,
	Paper,
	Divider,
	FormControl,
	InputLabel,
	Select,
	MenuItem
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useEffect, useState, useMemo } from 'react';
import { fetchOrganizations } from '@/store/slices/organizationsSlice';
import { fetchIdentityConfig, updateIdentityConfig, clearSuccessMessage } from '@/store/slices/identityConfigSlice';

interface IdentityType {
	id: number;
	type: string;
	description: string;
	isCompulsory: boolean;
	isActive: boolean;
}

const IdentityConfigurationPage = () => {
	const dispatch = useAppDispatch();

	// Get organizations from Redux store
	const { organizations, isLoading: orgsLoading } = useAppSelector(state => state.organizations);
	const { identityTypes, isLoading, error, successMessage } = useAppSelector(state => state.identityConfig);

	const [selectedOrganization, setSelectedOrganization] = useState<string>('');
	const [localIdentityTypes, setLocalIdentityTypes] = useState<IdentityType[]>([]);
	const [initialLoad, setInitialLoad] = useState(true);

	// Load organizations when component mounts
	useEffect(() => {
		dispatch(fetchOrganizations());
	}, [dispatch]);

	// Set initial organization when organizations are loaded
	useEffect(() => {
		if (organizations.length > 0 && !selectedOrganization) {
			setSelectedOrganization(organizations[0].id);
		}
	}, [organizations, selectedOrganization]);

	// Load identity config when organization is selected
	useEffect(() => {
		if (selectedOrganization) {
			dispatch(fetchIdentityConfig(selectedOrganization));
		}
	}, [selectedOrganization, dispatch]);

	// Update initialLoad state when data is loaded
	useEffect(() => {
		if (selectedOrganization && !isLoading && identityTypes.length > 0) {
			setInitialLoad(false);
		}
	}, [selectedOrganization, isLoading, identityTypes]);

	// Initialize local state when identityTypes changes
	useEffect(() => {
		if (identityTypes.length > 0) {
			setLocalIdentityTypes([...identityTypes]);
		}
	}, [identityTypes]);

	// Track if there are any changes compared to the original data
	const hasChanges = useMemo(() => {
		if (identityTypes.length === 0 || localIdentityTypes.length === 0) return false;
		return JSON.stringify(identityTypes) !== JSON.stringify(localIdentityTypes);
	}, [identityTypes, localIdentityTypes]);

	// Handle organization selection change
	const handleOrganizationChange = (event: any) => {
		setSelectedOrganization(event.target.value);
		setInitialLoad(true); // Reset loading state when changing organization
	};

	// Handle checkbox change for compulsory status
	const handleCompulsoryChange = (id: number) => {
		setLocalIdentityTypes(prevTypes =>
			prevTypes.map(type => (type.id === id ? { ...type, isCompulsory: !type.isCompulsory } : type))
		);
	};

	// Handle checkbox change for active status
	const handleActiveChange = (id: number) => {
		setLocalIdentityTypes(prevTypes =>
			prevTypes.map(type => {
				if (type.id === id) {
					const newActive = !type.isActive;
					return {
						...type,
						isActive: newActive,
						isCompulsory: newActive ? type.isCompulsory : false
					};
				}
				return type;
			})
		);
	};

	// Save changes
	const handleSaveChanges = () => {
		if (selectedOrganization) {
			dispatch(
				updateIdentityConfig({
					organizationId: selectedOrganization,
					configData: localIdentityTypes
				})
			);
		}
	};

	// Discard changes and revert to original data
	const handleDiscardChanges = () => {
		setLocalIdentityTypes([...identityTypes]);
	};

	// Close success notification
	const handleCloseSuccess = () => {
		dispatch(clearSuccessMessage());
	};

	// Show loading state when organizations are being fetched
	if (orgsLoading && organizations.length === 0) {
		return (
			<Card>
				<CardHeader title='Identity Configuration' />
				<CardContent>
					<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<Typography variant='body1' sx={{ mr: 2 }}>
							Loading organizations...
						</Typography>
						<LinearProgress sx={{ width: '50%' }} />
					</Box>
				</CardContent>
			</Card>
		);
	}

	// Show error if any
	if (error) {
		return (
			<Alert severity='error' sx={{ mb: 4 }}>
				{error}
			</Alert>
		);
	}

	return (
		<Grid container spacing={6}>
			{/* Success message */}
			<Snackbar
				open={!!successMessage}
				autoHideDuration={5000}
				onClose={handleCloseSuccess}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert onClose={handleCloseSuccess} severity='success' sx={{ width: '100%' }}>
					{successMessage}
				</Alert>
			</Snackbar>

			{/* Organization Selection and Identity Configuration Overview */}
			<Grid item xs={12} md={4}>
				<Card>
					<CardHeader title='Organization Selection' />
					<CardContent>
						<FormControl fullWidth sx={{ mb: 4 }}>
							<InputLabel id='organization-select-label'>Select Organization</InputLabel>
							<Select
								labelId='organization-select-label'
								id='organization-select'
								value={selectedOrganization}
								label='Select Organization'
								onChange={handleOrganizationChange}
								disabled={isLoading}
							>
								{organizations.map(org => (
									<MenuItem key={org.id} value={org.id}>
										{org.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{selectedOrganization && (
							<>
								<Typography variant='body1' sx={{ mb: 2 }}>
									Configure identity requirements for the selected organization.
								</Typography>

								{isLoading ? (
									<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
										<LinearProgress sx={{ width: '100%' }} />
									</Box>
								) : (
									<>
										<Box sx={{ mb: 2 }}>
											<Typography variant='subtitle2' color='primary' gutterBottom>
												Active Identity Types
											</Typography>
											<Typography variant='h4'>
												{localIdentityTypes.filter(t => t.isActive).length}/{localIdentityTypes.length}
											</Typography>
										</Box>

										<Box sx={{ mb: 2 }}>
											<Typography variant='subtitle2' color='secondary' gutterBottom>
												Compulsory Identity Types
											</Typography>
											<Typography variant='h4'>
												{localIdentityTypes.filter(t => t.isCompulsory).length}/{localIdentityTypes.length}
											</Typography>
										</Box>
									</>
								)}
							</>
						)}
					</CardContent>
				</Card>
			</Grid>

			{/* Main Identity Configuration Table */}
			<Grid item xs={12} md={8}>
				<Card>
					<CardHeader
						title='Identity Configuration'
						subheader={
							selectedOrganization
								? `Managing identity requirements for ${organizations.find(o => o.id === selectedOrganization)?.name}`
								: 'Select an organization to manage identity requirements'
						}
						action={
							hasChanges && (
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Button
										variant='outlined'
										color='secondary'
										onClick={handleDiscardChanges}
										startIcon={<i className='ri ri-close-line'></i>}
										disabled={isLoading}
									>
										Cancel
									</Button>
									<Button
										variant='contained'
										color='primary'
										onClick={handleSaveChanges}
										startIcon={
											isLoading ? <i className='ri ri-loader-4-line'></i> : <i className='ri ri-save-line'></i>
										}
										disabled={isLoading}
									>
										{isLoading ? 'Saving...' : 'Save Changes'}
									</Button>
								</Box>
							)
						}
					/>

					{selectedOrganization ? (
						isLoading || localIdentityTypes.length === 0 ? (
							<CardContent>
								<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
									<Typography variant='body1' sx={{ mr: 2 }}>
										Loading configuration...
									</Typography>
									<LinearProgress sx={{ width: '50%' }} />
								</Box>
							</CardContent>
						) : (
							<>
								<TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
									<Table sx={{ minWidth: 650 }} aria-label='identity configuration table'>
										<TableHead>
											<TableRow>
												<TableCell width='40%'>Type</TableCell>
												<TableCell width='30%' align='center'>
													Compulsory
												</TableCell>
												<TableCell width='30%' align='center'>
													Active
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{localIdentityTypes.map(type => (
												<TableRow key={type.id} hover sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
													<TableCell>
														<Box>
															<Typography variant='body1' sx={{ fontWeight: 500 }}>
																{type.type}
															</Typography>
															<Typography variant='body2' color='text.secondary'>
																{type.description}
															</Typography>
														</Box>
													</TableCell>
													<TableCell align='center'>
														<Tooltip title={`Make ${type.type} ${type.isCompulsory ? 'optional' : 'compulsory'}`}>
															<span>
																<Checkbox
																	checked={type.isCompulsory}
																	onChange={() => handleCompulsoryChange(type.id)}
																	disabled={!type.isActive || isLoading}
																	color='primary'
																/>
															</span>
														</Tooltip>
													</TableCell>
													<TableCell align='center'>
														<Tooltip title={`${type.isActive ? 'Disable' : 'Enable'} ${type.type}`}>
															<span>
																<Checkbox
																	checked={type.isActive}
																	onChange={() => handleActiveChange(type.id)}
																	disabled={isLoading}
																	color='success'
																/>
															</span>
														</Tooltip>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</TableContainer>

								{/* Bottom action bar for mobile view */}
								{hasChanges && (
									<Box sx={{ p: 2, display: { md: 'none', xs: 'flex' }, justifyContent: 'flex-end', gap: 2 }}>
										<Button variant='outlined' color='secondary' onClick={handleDiscardChanges} disabled={isLoading}>
											Cancel
										</Button>
										<Button variant='contained' color='primary' onClick={handleSaveChanges} disabled={isLoading}>
											{isLoading ? 'Saving...' : 'Save Changes'}
										</Button>
									</Box>
								)}
							</>
						)
					) : (
						<CardContent>
							<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
								<Typography variant='body1'>
									Please select an organization to view and manage identity configuration
								</Typography>
							</Box>
						</CardContent>
					)}
				</Card>
			</Grid>
		</Grid>
	);
};

export default IdentityConfigurationPage;
