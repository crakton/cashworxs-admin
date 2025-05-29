// Component Imports

// Server Action Imports
import UserActivities from '@/views/users/UserActivities';
import { getServerMode } from '@core/utils/serverHelpers';

const UserActivitiesPage = () => {
  // Vars
  const mode = getServerMode();

  return <UserActivities />;
};

export default UserActivitiesPage;
