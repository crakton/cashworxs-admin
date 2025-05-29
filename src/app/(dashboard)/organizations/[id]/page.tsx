'use client';

// Libraries
import { useParams } from 'next/navigation';

// Components
import { Breadcrumbs, Link, Typography } from '@mui/material';

import OrganizationDetail from '@/components/layout/shared/OrganizationDetail';

// MUI Imports

const ViewOrganizationPage = () => {
  // Get the organization ID from the URL parameters
  const params = useParams();
  const organizationId = params.id as string;

  return (
    <>
      <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
        <Link underline='hover' color='inherit' href='/'>
          Dashboard
        </Link>
        <Link underline='hover' color='inherit' href='/organizations'>
          Organizations
        </Link>
        <Typography color='text.primary'>Create Organization</Typography>
      </Breadcrumbs>
      <OrganizationDetail organizationId={organizationId} />
    </>
  );
};

export default ViewOrganizationPage;
