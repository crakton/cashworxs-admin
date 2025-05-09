'use client';

// React Imports
import { useEffect, useState } from 'react';

// Next Imports
import Image from 'next/image';

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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Chip from '@mui/material/Chip';
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

// Icons
import ChevronDown from '@/assets/svg/icons/chevron-down.svg';
import PlusIcon from '@/assets/svg/icons/plus.svg';
import EditIcon from '@/assets/svg/icons/pencil-outline.svg';
import DeleteIcon from '@/assets/svg/icons/delete-outline.svg';
import AddCircleOutlineIcon from '@/assets/svg/icons/plus-circle-outline.svg';
import RemoveCircleOutlineIcon from '@/assets/svg/icons/minus-circle-outline.svg';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import type { Activity } from '@/store/slices/activitiesSlice';
import { createActivity, deleteActivity, fetchActivities, updateActivity } from '@/store/slices/activitiesSlice';

// Redux Imports

interface MetaInfo {
  name: string
  description: string
}

// Default activity template
const defaultActivity: Activity = {
  id: 0,
  type: '',
  description: '',
  title: '',
  meta_info: [{ name: '', description: '' }]
};

// Confirmation dialog interface
interface ConfirmDialog {
  open: boolean
  title: string
  message: string
  id: number | null
}

const UserActivities = () => {
  // Hooks
  const dispatch = useAppDispatch();
  const { activities, isLoading, error } = useAppSelector(state => state.activities);

  // State
  const [activityDialog, setActivityDialog] = useState<{
    open: boolean
    mode: 'add' | 'edit'
    data: Activity
  }>({
    open: false,
    mode: 'add',
    data: { ...defaultActivity }
  });

  const [expandedPanel, setExpandedPanel] = useState<number | false>(false);

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    title: '',
    message: '',
    id: null
  });

  // Effects
  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);

  // Handlers
  const handleOpenAddDialog = () => {
    setActivityDialog({
      open: true,
      mode: 'add',
      data: { ...defaultActivity, id: Date.now() } // Temporary ID
    });
  };

  const handleOpenEditDialog = (activity: Activity) => {
    setActivityDialog({
      open: true,
      mode: 'edit',
      data: { ...activity }
    });
  };

  const handleCloseDialog = () => {
    setActivityDialog({
      ...activityDialog,
      open: false
    });
  };

  const handleAccordionChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;

    if (name) {
      setActivityDialog({
        ...activityDialog,
        data: {
          ...activityDialog.data,
          [name]: value
        }
      });
    }
  };
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    if (name) {
      setActivityDialog({
        ...activityDialog,
        data: {
          ...activityDialog.data,
          [name]: value
        }
      });
    }
  };

  const handleMetaInfoChange = (index: number, field: keyof MetaInfo, value: string) => {
    const newMetaInfo = [...activityDialog.data.meta_info];

    newMetaInfo[index] = {
      ...newMetaInfo[index],
      [field]: value
    };

    setActivityDialog({
      ...activityDialog,
      data: {
        ...activityDialog.data,
        meta_info: newMetaInfo
      }
    });
  };

  const handleAddMetaInfo = () => {
    setActivityDialog({
      ...activityDialog,
      data: {
        ...activityDialog.data,
        meta_info: [...activityDialog.data.meta_info, { name: '', description: '' }]
      }
    });
  };

  const handleRemoveMetaInfo = (index: number) => {
    if (activityDialog.data.meta_info.length === 1) {
      return; // Don't remove the last item
    }

    const newMetaInfo = [...activityDialog.data.meta_info];

    newMetaInfo.splice(index, 1);

    setActivityDialog({
      ...activityDialog,
      data: {
        ...activityDialog.data,
        meta_info: newMetaInfo
      }
    });
  };

  const handleSaveActivity = () => {
    if (activityDialog.mode === 'add') {
      dispatch(createActivity(activityDialog.data));
    } else {
      dispatch(updateActivity(activityDialog.data));
    }

    handleCloseDialog();
  };

  const openDeleteConfirmDialog = (id: number) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Activity',
      message: 'Are you sure you want to delete this activity? This action cannot be undone.',
      id
    });
  };

  const handleDeleteActivity = () => {
    if (confirmDialog.id !== null) {
      dispatch(deleteActivity(confirmDialog.id));
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Validation
  const isFormValid = () => {
    const { type, description, title, meta_info } = activityDialog.data;

    if (!type || !description || !title) return false;

    // Check if all meta_info fields are filled
    return meta_info.every(item => item.name && item.description);
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant='h5'>Activities Management</Typography>
          <Button
            variant='contained'
            startIcon={<i className='ri ri-plus-circle-line'></i>}
            onClick={handleOpenAddDialog}
          >
            Add New Activity
          </Button>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <LinearProgress sx={{ mb: 4 }} />
        ) : activities?.length! === 0 ? (
          <Card>
            <CardContent>
              <Typography align='center' color='text.secondary'>
                No activities found. Click the button above to add your first activity.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          activities !== undefined &&
          activities.map(activity => (
            <Accordion
              key={activity.id}
              expanded={expandedPanel === activity.id}
              onChange={handleAccordionChange(activity.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary
                expandIcon={<i className='ri ri-arrow-down'></i>}
                aria-controls={`activity-${activity.id}-content`}
                id={`activity-${activity.id}-header`}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                      {activity.title}
                    </Typography>
                    <Chip
                      label={activity.type}
                      size='small'
                      color={activity.type === 'Pay Taxes' ? 'primary' : 'secondary'}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex' }}>
                    <IconButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation();
                        handleOpenEditDialog(activity);
                      }}
                    >
                      <i className='ri ri-pencil-line'></i>
                    </IconButton>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={e => {
                        e.stopPropagation();
                        openDeleteConfirmDialog(activity.id);
                      }}
                    >
                      <i className='ri ri-delete-bin-line'></i>
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='body2' sx={{ mb: 3 }}>
                  {activity.description}
                </Typography>
                <Typography variant='subtitle2' sx={{ mb: 2, fontWeight: 600 }}>
                  Details:
                </Typography>
                {activity.meta_info.map((info, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>
                      {info.name}
                    </Typography>
                    <Typography variant='body2'>{info.description}</Typography>
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Grid>

      {/* Activity Dialog */}
      <Dialog open={activityDialog.open} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>{activityDialog.mode === 'add' ? 'Add New Activity' : 'Edit Activity'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id='activity-type-label'>Activity Type</InputLabel>
                <Select
                  labelId='activity-type-label'
                  id='activity-type'
                  name='type'
                  value={activityDialog.data.type}
                  label='Activity Type'
                  onChange={handleSelectChange}
                >
                  <MenuItem value='Pay Taxes'>Pay Taxes</MenuItem>
                  <MenuItem value='Pay Fees'>Pay Fees</MenuItem>
                  <MenuItem value='Other'>Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Title'
                name='title'
                value={activityDialog.data.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                name='description'
                value={activityDialog.data.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='subtitle1'>Meta Information</Typography>
                <Button startIcon={<i className='ri ri-plus-circle-line'></i>} onClick={handleAddMetaInfo}>
                  Add Item
                </Button>
              </Box>

              {activityDialog.data.meta_info.map((metaInfo, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant='subtitle2'>Item {index + 1}</Typography>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => handleRemoveMetaInfo(index)}
                      disabled={activityDialog.data.meta_info.length === 1}
                    >
                      <i className='ri ri-delete-bin-line'></i>
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='Name'
                        value={metaInfo.name}
                        onChange={e => handleMetaInfoChange(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label='Description'
                        value={metaInfo.description}
                        onChange={e => handleMetaInfoChange(index, 'description', e.target.value)}
                        multiline
                        rows={2}
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant='contained' onClick={handleSaveActivity} disabled={!isFormValid()}>
            {activityDialog.mode === 'add' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseConfirmDialog}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleDeleteActivity}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default UserActivities;
