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
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	IconButton,
	Chip
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useEffect, useState, useMemo } from 'react';
import { fetchOrganizations } from '@/store/slices/organizationsSlice';
import {
	fetchIdConfigs,
	updateIdConfig,
	createIdConfig,
	deleteIdConfig,
	fetchFieldTypes,
	clearSuccessMessage,
	clearError,
	type IdConfig,
	type FieldType
} from '@/store/slices/identityConfigSlice';

interface CreateConfigDialogData {
	field_name: string;
	field_label: string;
	field_type: 'text' | 'number' | 'email' | 'phone' | 'file';
	is_required: boolean;
	help_text: string;
}

const IdentityConfigurationPage = () => {
	const dispatch = useAppDispatch();

	// Get data from Redux store
	const { organizations, isLoading: orgsLoading } = useAppSelector(state => state.organizations);
	const { idConfigs, organization, fieldTypes, isLoading, error, successMessage } = useAppSelector(
		state => state.identityConfig
	);

	const [selectedOrganization, setSelectedOrganization] = useState<string>('');
	const [localIdConfigs, setLocalIdConfigs] = useState<IdConfig[]>([]);
	const [initialLoad, setInitialLoad] = useState(true);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [createDialogData, setCreateDialogData] = useState<CreateConfigDialogData>({
		field_name: '',
		field_label: '',
		field_type: 'text',
		is_required: false,
		help_text: ''
	});

	// Load organizations and field types when component mounts
	useEffect(() => {
		dispatch(fetchOrganizations());
		dispatch(fetchFieldTypes());
	}, [dispatch]);

	// Set initial organization when organizations are loaded
	useEffect(() => {
		if (organizations.length > 0 && !selectedOrganization) {
			setSelectedOrganization(organizations[0].id.toString());
		}
	}, [organizations, selectedOrganization]);

	// Load ID configs when organization is selected
	useEffect(() => {
		if (selectedOrganization) {
			dispatch(fetchIdConfigs(selectedOrganization));
		}
	}, [selectedOrganization, dispatch]);

	// Update initialLoad state when data is loaded
	useEffect(() => {
		if (selectedOrganization && !isLoading && idConfigs.length >= 0) {
			setInitialLoad(false);
		}
	}, [selectedOrganization, isLoading, idConfigs]);

	// Initialize local state when idConfigs changes
	useEffect(() => {
		setLocalIdConfigs([...idConfigs]);
	}, [idConfigs]);

	// Track if there are any changes compared to the original data
	const hasChanges = useMemo(() => {
		if (idConfigs.length === 0 && localIdConfigs.length === 0) return false;
		return JSON.stringify(idConfigs) !== JSON.stringify(localIdConfigs);
	}, [idConfigs, localIdConfigs]);

	// Handle organization selection change
	const handleOrganizationChange = (event: any) => {
		setSelectedOrganization(event.target.value);
		setInitialLoad(true);
	};

	// Handle checkbox change for required status
	const handleRequiredChange = (id: number) => {
		setLocalIdConfigs(prevConfigs =>
			prevConfigs.map(config => (config.id === id ? { ...config, is_required: !config.is_required } : config))
		);
	};

	// Handle checkbox change for active status
	const handleActiveChange = (id: number) => {
		setLocalIdConfigs(prevConfigs =>
			prevConfigs.map(config => {
				if (config.id === id) {
					const newActive = !config.is_active;
					return {
						...config,
						is_active: newActive,
						is_required: newActive ? config.is_required : false
					};
				}
				return config;
			})
		);
	};

	// Save individual config changes
	const handleSaveConfig = async (config: IdConfig) => {
		if (selectedOrganization) {
			try {
				await dispatch(
					updateIdConfig({
						organizationId: selectedOrganization,
						configId: config.id,
						configData: {
							field_name: config.field_name,
							field_label: config.field_label,
							field_type: config.field_type,
							is_required: config.is_required,
							is_active: config.is_active,
							help_text: config.help_text,
							validation_rules: config.validation_rules
						}
					})
				).unwrap();
			} catch (error) {
				console.error('Failed to update config:', error);
			}
		}
	};

	// Save all changes at once
	const handleSaveAllChanges = async () => {
		if (selectedOrganization) {
			const changedConfigs = localIdConfigs.filter((localConfig, index) => {
				const originalConfig = idConfigs[index];
				return originalConfig && JSON.stringify(localConfig) !== JSON.stringify(originalConfig);
			});

			for (const config of changedConfigs) {
				await handleSaveConfig(config);
			}
		}
	};

	// Discard changes and revert to original data
	const handleDiscardChanges = () => {
		setLocalIdConfigs([...idConfigs]);
	};

	// Handle delete config
	const handleDeleteConfig = async (configId: number) => {
		if (selectedOrganization && window.confirm('Are you sure you want to delete this configuration?')) {
			try {
				await dispatch(
					deleteIdConfig({
						organizationId: selectedOrganization,
						configId
					})
				).unwrap();
			} catch (error) {
				console.error('Failed to delete config:', error);
			}
		}
	};

	// Handle create new config
	const handleCreateConfig = async () => {
		if (selectedOrganization) {
			try {
				await dispatch(
					createIdConfig({
						organizationId: selectedOrganization,
						configData: createDialogData
					})
				).unwrap();

				setCreateDialogOpen(false);
				setCreateDialogData({
					field_name: '',
					field_label: '',
					field_type: 'text',
					is_required: false,
					help_text: ''
				});
			} catch (error) {
				console.error('Failed to create config:', error);
			}
		}
	};

	// Close notifications
	const handleCloseSuccess = () => {
		dispatch(clearSuccessMessage());
	};

	const handleCloseError = () => {
		dispatch(clearError());
	};

	// Get field type display name
	const getFieldTypeLabel = (type: string) => {
		return fieldTypes[type] || type;
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

	return (
		<Grid container spacing={6}>
			{/* Success/Error messages */}
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

			<Snackbar
				open={!!error}
				autoHideDuration={6000}
				onClose={handleCloseError}
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
			>
				<Alert onClose={handleCloseError} severity='error' sx={{ width: '100%' }}>
					{error}
				</Alert>
			</Snackbar>

			{/* Organization Selection and Overview */}
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
									<MenuItem key={org.id} value={org.id.toString()}>
										{org.name}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{selectedOrganization && organization && (
							<>
								<Typography variant='body1' sx={{ mb: 2 }}>
									Configure identity requirements for {organization.name}.
								</Typography>

								{isLoading ? (
									<Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
										<LinearProgress sx={{ width: '100%' }} />
									</Box>
								) : (
									<>
										<Box sx={{ mb: 2 }}>
											<Typography variant='subtitle2' color='primary' gutterBottom>
												Active Configurations
											</Typography>
											<Typography variant='h4'>
												{localIdConfigs.filter(c => c.is_active).length}/{localIdConfigs.length}
											</Typography>
										</Box>

										<Box sx={{ mb: 2 }}>
											<Typography variant='subtitle2' color='secondary' gutterBottom>
												Required Fields
											</Typography>
											<Typography variant='h4'>
												{localIdConfigs.filter(c => c.is_required).length}/
												{localIdConfigs.filter(c => c.is_active).length}
											</Typography>
										</Box>

										<Button
											variant='contained'
											color='primary'
											fullWidth
											onClick={() => setCreateDialogOpen(true)}
											startIcon={<i className='ri-add-line'></i>}
											sx={{ mt: 2 }}
										>
											Add New Field
										</Button>
									</>
								)}
							</>
						)}
					</CardContent>
				</Card>
			</Grid>

			{/* Main ID Configuration Table */}
			<Grid item xs={12} md={8}>
				<Card>
					<CardHeader
						title='Identity Configuration'
						subheader={
							organization
								? `Managing identity requirements for ${organization.name}`
								: 'Select an organization to manage identity requirements'
						}
						action={
							hasChanges && (
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Button
										variant='outlined'
										color='secondary'
										onClick={handleDiscardChanges}
										startIcon={<i className='ri-close-line'></i>}
										disabled={isLoading}
									>
										Cancel
									</Button>
									<Button
										variant='contained'
										color='primary'
										onClick={handleSaveAllChanges}
										startIcon={isLoading ? <i className='ri-loader-4-line'></i> : <i className='ri-save-line'></i>}
										disabled={isLoading}
									>
										{isLoading ? 'Saving...' : 'Save Changes'}
									</Button>
								</Box>
							)
						}
					/>

					{selectedOrganization ? (
						isLoading && initialLoad ? (
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
												<TableCell width='30%'>Field</TableCell>
												<TableCell width='20%'>Type</TableCell>
												<TableCell width='15%' align='center'>
													Required
												</TableCell>
												<TableCell width='15%' align='center'>
													Active
												</TableCell>
												<TableCell width='10%' align='center'>
													Order
												</TableCell>
												<TableCell width='10%' align='center'>
													Actions
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{localIdConfigs.length === 0 ? (
												<TableRow>
													<TableCell colSpan={6} align='center' sx={{ py: 4 }}>
														<Typography variant='body1' color='text.secondary'>
															No ID configurations found. Click "Add New Field" to create one.
														</Typography>
													</TableCell>
												</TableRow>
											) : (
												localIdConfigs.map(config => (
													<TableRow
														key={config.id}
														hover
														sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
													>
														<TableCell>
															<Box>
																<Typography variant='body1' sx={{ fontWeight: 500 }}>
																	{config.field_label}
																</Typography>
																<Typography variant='body2' color='text.secondary'>
																	{config.field_name}
																</Typography>
																{config.help_text && (
																	<Typography variant='caption' color='text.secondary'>
																		{config.help_text}
																	</Typography>
																)}
															</Box>
														</TableCell>
														<TableCell>
															<Chip label={getFieldTypeLabel(config.field_type)} size='small' variant='outlined' />
														</TableCell>
														<TableCell align='center'>
															<Tooltip
																title={`Make ${config.field_label} ${config.is_required ? 'optional' : 'required'}`}
															>
																<span>
																	<Checkbox
																		checked={config.is_required}
																		onChange={() => handleRequiredChange(config.id)}
																		disabled={!config.is_active || isLoading}
																		color='primary'
																	/>
																</span>
															</Tooltip>
														</TableCell>
														<TableCell align='center'>
															<Tooltip title={`${config.is_active ? 'Disable' : 'Enable'} ${config.field_label}`}>
																<span>
																	<Checkbox
																		checked={config.is_active}
																		onChange={() => handleActiveChange(config.id)}
																		disabled={isLoading}
																		color='success'
																	/>
																</span>
															</Tooltip>
														</TableCell>
														<TableCell align='center'>
															<Typography variant='body2'>{config.sort_order}</Typography>
														</TableCell>
														<TableCell align='center'>
															<Tooltip title='Delete configuration'>
																<IconButton
																	size='small'
																	color='error'
																	onClick={() => handleDeleteConfig(config.id)}
																	disabled={isLoading}
																>
																	<i className='ri-delete-bin-line'></i>
																</IconButton>
															</Tooltip>
														</TableCell>
													</TableRow>
												))
											)}
										</TableBody>
									</Table>
								</TableContainer>

								{/* Bottom action bar for mobile view */}
								{hasChanges && (
									<Box sx={{ p: 2, display: { md: 'none', xs: 'flex' }, justifyContent: 'flex-end', gap: 2 }}>
										<Button variant='outlined' color='secondary' onClick={handleDiscardChanges} disabled={isLoading}>
											Cancel
										</Button>
										<Button variant='contained' color='primary' onClick={handleSaveAllChanges} disabled={isLoading}>
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

			{/* Create New Config Dialog */}
			<Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth='sm' fullWidth>
				<DialogTitle>Add New Identity Field</DialogTitle>
				<DialogContent>
					<Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
						<TextField
							label='Field Name'
							value={createDialogData.field_name}
							onChange={e => setCreateDialogData(prev => ({ ...prev, field_name: e.target.value }))}
							fullWidth
							helperText='Internal field name (e.g., nin, bvn, email)'
						/>

						<TextField
							label='Field Label'
							value={createDialogData.field_label}
							onChange={e => setCreateDialogData(prev => ({ ...prev, field_label: e.target.value }))}
							fullWidth
							helperText='Display label for users'
						/>

						<FormControl fullWidth>
							<InputLabel>Field Type</InputLabel>
							<Select
								value={createDialogData.field_type}
								label='Field Type'
								onChange={e =>
									setCreateDialogData(prev => ({
										...prev,
										field_type: e.target.value as 'text' | 'number' | 'email' | 'phone' | 'file'
									}))
								}
							>
								{Object.entries(fieldTypes).map(([k, label]) => {
									// get key value from label
									if (!label) return null; // Skip if label is empty
									return Object.entries(label).map(([key, value]) => (
										<MenuItem key={key} value={key}>
											{value}
										</MenuItem>
									));
								})}
							</Select>
						</FormControl>

						<TextField
							label='Help Text'
							value={createDialogData.help_text}
							onChange={e => setCreateDialogData(prev => ({ ...prev, help_text: e.target.value }))}
							fullWidth
							multiline
							rows={2}
							helperText='Optional help text for users'
						/>

						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Checkbox
								checked={createDialogData.is_required}
								onChange={e => setCreateDialogData(prev => ({ ...prev, is_required: e.target.checked }))}
							/>
							<Typography>Make this field required</Typography>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
					<Button
						onClick={handleCreateConfig}
						variant='contained'
						disabled={!createDialogData.field_name || !createDialogData.field_label || isLoading}
					>
						{isLoading ? 'Creating...' : 'Create Field'}
					</Button>
				</DialogActions>
			</Dialog>
		</Grid>
	);
};

export default IdentityConfigurationPage;
