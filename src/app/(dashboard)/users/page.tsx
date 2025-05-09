// Component Imports

// Server Action Imports
import UsersList from '@/views/users/UserList';
import { getServerMode } from '@core/utils/serverHelpers';

const UserListPage = () => {
  // Vars
  const mode = getServerMode();

  return <UsersList mode={mode} />;
};

export default UserListPage;
