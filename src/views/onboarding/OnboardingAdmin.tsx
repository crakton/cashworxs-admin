'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
	Card,
	CardHeader,
	CardContent,
	Grid,
	TextField,
	Button,
	Typography,
	Alert,
	CircularProgress,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	IconButton,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle
} from '@mui/material';

import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchOnboardingData, updateOnboardingItem, addOnboardingItem } from '@/store/slices/onboardingSlice';

interface OnboardingItem {
	id?: string;
	title: string;
	description: string;
	image_url: string;
}

const OnboardingAdmin = () => {
	const dispatch = useAppDispatch();
	const { onboardingData, isLoading, error } = useAppSelector(state => state.onboarding);

	const [items, setItems] = useState<OnboardingItem[]>([]);
	const [itemIndex, setItemIndex] = useState<number>();
	const [currentItem, setCurrentItem] = useState<OnboardingItem | null>(null);
	const [openDialog, setOpenDialog] = useState(false);
	const [previewDialog, setPreviewDialog] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const [isNewItem, setIsNewItem] = useState(false);

	useEffect(() => {
		dispatch(fetchOnboardingData());
	}, [dispatch]);

	useEffect(() => {
		if (Array.isArray(onboardingData)) {
			setItems(onboardingData);
		}
	}, [onboardingData]);

	const openNewDialog = () => {
		setCurrentItem({ title: '', description: '', image_url: '' });
		setIsNewItem(true);
		setOpenDialog(true);
	};

	const openEditDialog = (item: OnboardingItem, index: number) => {
		console.log('Edit index:', index);
		setItemIndex(index);
		setCurrentItem({ ...item });
		setIsNewItem(false);
		setOpenDialog(true);
	};

	const openPreviewDialog = (item: OnboardingItem) => {
		setCurrentItem(item);
		setPreviewDialog(true);
	};

	const closeDialogs = () => {
		setOpenDialog(false);
		setPreviewDialog(false);
		setCurrentItem(null);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		console.log('Field Change:', name, value);

		setCurrentItem(prev => (prev ? { ...prev, [name]: value } : prev));
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadingImage(true);
		const token = Cookies.get('auth_token');

		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload-image`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token}`
				}
			});

			if (response.data?.url) {
				setCurrentItem(prev => (prev ? { ...prev, image_url: response.data.url } : prev));
				console.log('Image uploaded:', response.data.url);
			} else {
				console.warn('No image URL returned from upload.');
			}
		} catch (err) {
			console.error('Image upload error:', err);
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSaveItem = async () => {
		if (!currentItem || itemIndex === undefined) {
			console.warn('No item to save.');
			return;
		}
		console.log('Saving item:', currentItem);
		try {
			if (isNewItem) {
				await dispatch(addOnboardingItem(currentItem)).unwrap();
				console.log('Item added successfully.');
			} else if (currentItem.id) {
				await dispatch(updateOnboardingItem({ index: itemIndex, data: currentItem })).unwrap();
				console.log('Item updated successfully.');
			}

			closeDialogs();
			dispatch(fetchOnboardingData());
		} catch (error) {
			console.error('Save failed:', error);
		}
	};

	if (isLoading && !items.length) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Grid container spacing={6}>
			<Grid item xs={12}>
				{error && (
					<Alert severity='error' sx={{ mb: 4 }}>
						{error}
					</Alert>
				)}

				<Card>
					<CardHeader
						title='Onboarding Content Management'
						subheader='Manage onboarding content items shown to users'
						action={
							<Button variant='contained' onClick={openNewDialog}>
								Add New Item
							</Button>
						}
					/>
					<CardContent>
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Title</TableCell>
										<TableCell>Description</TableCell>
										<TableCell>Image</TableCell>
										<TableCell align='right'>Actions</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{items.map((item, i) => (
										<TableRow key={item.id || i}>
											<TableCell>{item.title}</TableCell>
											<TableCell>
												{item.description.length > 100 ? item.description.slice(0, 100) + '...' : item.description}
											</TableCell>
											<TableCell>
												{item.image_url && (
													<Box
														component='img'
														src={item.image_url}
														sx={{ width: 80, height: 60, objectFit: 'cover' }}
													/>
												)}
											</TableCell>
											<TableCell align='right'>
												<IconButton onClick={() => openPreviewDialog(item)}>
													<i className='ri ri-eye-line'></i>
												</IconButton>
												<IconButton onClick={() => openEditDialog(item, i)}>
													<i className='ri ri-pencil-line'></i>
												</IconButton>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</CardContent>
				</Card>
			</Grid>

			{/* Edit Dialog */}
			<Dialog open={openDialog} onClose={closeDialogs} fullWidth maxWidth='md'>
				<DialogTitle>
					{isNewItem ? 'Add New Onboarding Item' : 'Edit Onboarding Item'}
					<IconButton aria-label='close' onClick={closeDialogs} sx={{ position: 'absolute', right: 8, top: 8 }}>
						<i className='ri ri-close-line'></i>
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Grid container spacing={3} sx={{ mt: 1 }}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								name='title'
								label='Title'
								value={currentItem?.title || ''}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<TextField
								fullWidth
								name='description'
								label='Description'
								multiline
								rows={4}
								value={currentItem?.description || ''}
								onChange={handleInputChange}
							/>
						</Grid>
						<Grid item xs={12}>
							<Box sx={{ mb: 2 }}>
								<Typography variant='body1'>Image</Typography>
								<input
									accept='image/*'
									style={{ display: 'none' }}
									id='image-upload'
									type='file'
									onChange={handleImageUpload}
								/>
								<label htmlFor='image-upload'>
									<Button variant='outlined' component='span' disabled={uploadingImage}>
										{uploadingImage ? 'Uploading...' : 'Upload Image'}
									</Button>
								</label>
							</Box>
							{currentItem?.image_url && (
								<Box
									component='img'
									src={currentItem.image_url}
									alt='Preview'
									sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', mt: 2 }}
								/>
							)}
							<TextField
								fullWidth
								label='Image URL'
								name='image_url'
								value={currentItem?.image_url || ''}
								onChange={handleInputChange}
								sx={{ mt: 2 }}
							/>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button onClick={closeDialogs}>Cancel</Button>
					<Button onClick={handleSaveItem} variant='contained' disabled={isLoading || uploadingImage}>
						{isLoading ? <CircularProgress size={24} /> : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Preview Dialog */}
			<Dialog open={previewDialog} onClose={closeDialogs} fullWidth maxWidth='md'>
				<DialogTitle>
					Preview
					<IconButton aria-label='close' onClick={closeDialogs} sx={{ position: 'absolute', right: 8, top: 8 }}>
						<i className='ri ri-close-line'></i>
					</IconButton>
				</DialogTitle>
				<DialogContent>
					{currentItem && (
						<Box sx={{ p: 2 }}>
							<Box
								component='img'
								src={currentItem.image_url}
								alt={currentItem.title}
								sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', mb: 3 }}
							/>
							<Typography variant='h5' gutterBottom>
								{currentItem.title}
							</Typography>
							<Typography variant='body1'>{currentItem.description}</Typography>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={closeDialogs}>Close</Button>
				</DialogActions>
			</Dialog>
		</Grid>
	);
};

export default OnboardingAdmin;
