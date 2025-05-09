'use client'

import Cookies from 'js-cookie'
import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'

// MUI Components
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'

// Redux actions
import { fetchOnboardingData, updateOnboardingItem, addOnboardingItem } from '@/store/slices/onboardingSlice'
import axios from 'axios'

interface OnboardingItem {
  id?: string
  title: string
  description: string
  image_url: string
}

const OnboardingAdmin = () => {
  const dispatch = useAppDispatch()
  const { onboardingData, isLoading, error } = useAppSelector(state => state.onboarding)

  const [items, setItems] = useState<OnboardingItem[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [previewDialog, setPreviewDialog] = useState(false)
  const [currentItem, setCurrentItem] = useState<OnboardingItem | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // For new items
  const [isNewItem, setIsNewItem] = useState(false)

  useEffect(() => {
    dispatch(fetchOnboardingData())
  }, [dispatch])

  useEffect(() => {
    if (onboardingData && Array.isArray(onboardingData)) {
      setItems(onboardingData)
    }
  }, [onboardingData])

  const handleEditClick = (item: OnboardingItem) => {
    setCurrentItem(item)
    setIsNewItem(false)
    setOpenDialog(true)
  }

  const handlePreviewClick = (item: OnboardingItem) => {
    setCurrentItem(item)
    setPreviewDialog(true)
  }

  const handleAddNewClick = () => {
    setCurrentItem({
      title: '',
      description: '',
      image_url: ''
    })
    setIsNewItem(true)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setPreviewDialog(false)
    setCurrentItem(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    console.log('Input changed:', name, value);
    
    if (currentItem) {
      setCurrentItem({
        ...currentItem,
        [name]: value
      })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      // Replace with your actual upload endpoint
      const token = Cookies.get('auth_token')
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      if (currentItem && response.data.url) {
        setCurrentItem({
          ...currentItem,
          image_url: response.data.url
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      // Handle error here
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveItem = async () => {

    try {
    
    if (!currentItem) return
      if (isNewItem) {
        
        await dispatch(addOnboardingItem(currentItem)).unwrap()
      } else if (currentItem.id) {
        console.log('Updating item:', currentItem);
        await dispatch(
          updateOnboardingItem({
            id: currentItem.id,
            data: currentItem
          })
        ).unwrap()
      }

      handleCloseDialog()
      dispatch(fetchOnboardingData())
    } catch (error) {
      console.error('Error saving item:', error)
      // Error is handled by the reducer
    }
  }

  if (isLoading && !items.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    )
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
              <Button variant='contained' color='primary' onClick={handleAddNewClick}>
                Add New Item
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell align='right'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id || index}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                      </TableCell>
                      <TableCell>
                        {item.image_url && (
                          <Box
                            component='img'
                            src={item.image_url}
                            alt={item.title}
                            sx={{ width: 80, height: 60, objectFit: 'cover' }}
                          />
                        )}
                      </TableCell>
                      <TableCell align='right'>
                        <IconButton onClick={() => handlePreviewClick(item)}>
                          <i className='ri ri-eye-line'></i>
                        </IconButton>
                        <IconButton onClick={() => handleEditClick(item)}>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>
          {isNewItem ? 'Add New Onboarding Item' : 'Edit Onboarding Item'}
          <IconButton
            aria-label='close'
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <i className='ri ri-close-line'></i>
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Title'
                name='title'
                value={currentItem?.title || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                name='description'
                multiline
                rows={4}
                value={currentItem?.description || ''}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant='body1' gutterBottom>
                  Image
                </Typography>
                <input
                  accept='image/*'
                  style={{ display: 'none' }}
                  id='image-upload-button'
                  type='file'
                  onChange={handleImageUpload}
                />
                <label htmlFor='image-upload-button'>
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
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    mt: 2
                  }}
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveItem} variant='contained' color='primary' disabled={isLoading || uploadingImage}>
            {isLoading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>
          Preview
          <IconButton
            aria-label='close'
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
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
                sx={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'contain',
                  mb: 3
                }}
              />
              <Typography variant='h5' gutterBottom>
                {currentItem.title}
              </Typography>
              <Typography variant='body1'>{currentItem.description}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {currentItem && (
            <Button
              onClick={() => {
                handleCloseDialog()
                handleEditClick(currentItem)
              }}
              color='primary'
            >
              Edit
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default OnboardingAdmin
