'use client'

// Components
import OrganizationForm from '@/components/layout/shared/OrganizationForm'

// MUI Imports
import { Breadcrumbs, Link, Typography } from '@mui/material'

const CreateOrganizationPage = () => {
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

      <OrganizationForm />
    </>
  )
}

export default CreateOrganizationPage
