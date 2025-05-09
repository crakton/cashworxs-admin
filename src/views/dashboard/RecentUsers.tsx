'use client';

// MUI Imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

// Component Imports
import Link from '@components/Link';
import CustomAvatar from '@core/components/mui/Avatar';
import type { User } from '@/store/slices/userSlice';

const RecentUsers = ({ users = [] }: { users: User[] }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';

    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRandomColor = (str: string) => {
    const colors: ('primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info')[] = [
      'primary',
      'secondary',
      'success',
      'error',
      'warning',
      'info'
    ];

    // Simple hash function to choose a color based on the string
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return colors[hash % colors.length];
  };

  return (
    <Card>
      <CardHeader
        title='Recent Users'
        action={
          <Typography component={Link} className='font-medium' color='primary'>
            View All
          </Typography>
        }
      />
      <CardContent className='flex flex-col gap-5'>
        {users.map((user, index) => (
          <div key={index} className='flex items-center gap-4'>
            <CustomAvatar color={getRandomColor(user?.name || 'User')}>
              {getInitials(user?.full_name! || user?.name!)}
            </CustomAvatar>
            <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
              <div className='flex flex-col gap-0.5'>
                <Typography color='text.primary' className='font-medium'>
                  {user.full_name || 'Unknown User'}
                </Typography>
                <Typography>{user.phone_number?.substring(0, 4) + '***' + user.phone_number?.substring(9)}</Typography>
              </div>
              <div>
                <Typography variant='caption' color='text.secondary'>
                  Joined {formatDate(user?.created_at!)}
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentUsers;
