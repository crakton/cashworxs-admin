'use client';

import React, { useState } from 'react';

import {
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button
} from '@mui/material';

const usersData = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    nin: '12345678901',
    bvn: '1234567890',
    address: '123 Street, City',
    language: 'English'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    nin: '98765432109',
    bvn: '0987654321',
    address: '456 Avenue, Town',
    language: 'Yoruba'
  }
];

export default function SettingsPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEditClick = user => {
    setSelectedUser({ ...user });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setSelectedUser(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    setEditDialogOpen(false);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant='h5' gutterBottom>
          General User Settings
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>NIN</TableCell>
                <TableCell>BVN</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersData.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.nin}</TableCell>
                  <TableCell>{user.bvn}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>{user.language}</TableCell>
                  <TableCell>
                    <IconButton size='small' onClick={() => handleEditClick(user)}>
                      <i className='ri ri-edit-line'></i>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Edit User Settings</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Full Name'
                value={selectedUser?.name || ''}
                onChange={e => handleEditChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Email'
                type='email'
                value={selectedUser?.email || ''}
                onChange={e => handleEditChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='NIN'
                value={selectedUser?.nin || ''}
                onChange={e => handleEditChange('nin', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label='BVN'
                value={selectedUser?.bvn || ''}
                onChange={e => handleEditChange('bvn', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Address'
                multiline
                rows={2}
                value={selectedUser?.address || ''}
                onChange={e => handleEditChange('address', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label='Language Preference'
                value={selectedUser?.language || ''}
                onChange={e => handleEditChange('language', e.target.value)}
              >
                {['English', 'Hausa', 'Yoruba', 'Igbo'].map(lang => (
                  <MenuItem key={lang} value={lang}>
                    {lang}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveChanges} variant='contained'>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
