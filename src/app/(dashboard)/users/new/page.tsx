// Component Imports

// Server Action Imports
import AddUser from '@/views/users/AddUser';
import { getServerMode } from '@core/utils/serverHelpers';

const AddUserPage = () => {
  // Vars
  const mode = getServerMode();

  return <AddUser />;
};

export default AddUserPage;
