'use client'

import TaxForm from '@/components/layout/shared/TaxForm'

const EditTaxPage = ({ params }: { params: { id: string } }) => {
  return <TaxForm isEdit={true} taxId={params.id} />
}

export default EditTaxPage
