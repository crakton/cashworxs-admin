'use client'

import { useParams } from 'next/navigation'

// Components
import OrganizationForm from '@/components/layout/shared/OrganizationForm'

// MUI Imports
import { Breadcrumbs, Link, Typography } from '@mui/material'

const EditOrganizationPage = () => {
  // Get the organization ID from the URL parameters
  const params = useParams()
  const organizationId = params.id as string

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
      <OrganizationForm isEdit={true} organizationId={organizationId} />
    </>
  )
}

export default EditOrganizationPage
