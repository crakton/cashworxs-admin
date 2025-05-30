'use client';

import { useState } from 'react';

// MUI Components
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';

import { addUser } from '@/store/slices/userSlice';

interface UserFormData {
  full_name: string
  phone_number: string
  role: string
  password: string
  email?: string
  password_confirmation: string
}

const AddUser = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.users);

  const [formData, setFormData] = useState<UserFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    role: 'user',
    password: '',
    password_confirmation: ''
  });

  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: string };

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (formData.password !== formData.password_confirmation) {
      // Handle password mismatch error
      return;
    }

    try {
      await dispatch(addUser(formData)).unwrap();
      setSuccess('User added successfully');

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone_number: '',
        role: 'user',
        password: '',
        password_confirmation: ''
      });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      // Error is handled by the reducer
    }
  };

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity='success' sx={{ mb: 4 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardHeader title='Add New User' subheader='Create new user accounts' />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Full Name'
                    name='name'
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Phone Number'
                    name='phone'
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id='role-select-label'>Role</InputLabel>
                    <Select
                      labelId='role-select-label'
                      name='role'
                      value={formData.role}
                      label='Role'
                      onChange={e =>
                        handleChange(e as React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>)
                      }
                    >
                      <MenuItem value='user'>User</MenuItem>
                      <MenuItem value='admin'>Admin</MenuItem>
                      <MenuItem value='manager'>Manager</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Password'
                    name='password'
                    type='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label='Confirm Password'
                    name='password_confirmation'
                    type='password'
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    error={
                      formData.password !== formData.password_confirmation && formData.password_confirmation !== ''
                    }
                    helperText={
                      formData.password !== formData.password_confirmation && formData.password_confirmation !== ''
                        ? 'Passwords do not match'
                        : ''
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type='submit' variant='contained' color='primary' disabled={isLoading} sx={{ mt: 2 }}>
                    {isLoading ? <CircularProgress size={24} /> : 'Add User'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AddUser;
