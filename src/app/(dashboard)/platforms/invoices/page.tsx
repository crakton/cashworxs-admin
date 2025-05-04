'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Typography,
  Chip,
  TablePagination
} from '@mui/material'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import { fetchAllInvoices } from '@/store/slices/invoicesSlice'
import { formateNumber } from '@/utils/formatDate'

const InvoicesPage = () => {
  const dispatch = useAppDispatch()
  const { invoices, isLoading } = useAppSelector(state => state.invoices)

  // Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    dispatch(fetchAllInvoices())
  }, [dispatch])

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'success'
      case 0:
        return 'warning'
      default:
        return 'error'
    }
  }

  // Pagination handlers
  const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Apply pagination to the invoices data
  const paginatedInvoices = invoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Invoices'
            // action={
            //   <Button variant='contained' component={Link} href='/invoices/new'>
            //     <i className='ri ri-file-add-line'></i>
            //     <span className='ml-2'>New Invoice</span>
            //   </Button>
            // }
          />
          <CardContent>
            {isLoading ? (
              <LinearProgress sx={{ height: 4, mb: 4 }} />
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedInvoices.length > 0 ? (
                        paginatedInvoices.map(invoice => (
                          <TableRow key={invoice.id} hover>
                            <TableCell>#{invoice.id}</TableCell>
                            <TableCell>{invoice.c_name}</TableCell>
                            <TableCell>{formateNumber(Number(invoice.amount))}</TableCell>
                            <TableCell>
                              <Chip
                                label={invoice.status === 0 ? 'Pending' : invoice.status === 1 ? 'Paid' : 'Overdued'}
                                color={getStatusColor(invoice.status)}
                                size='small'
                              />
                            </TableCell>
                            <TableCell>{new Date(invoice.tdate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                component={Link}
                                href={`/platforms/invoices/${invoice.invoice_number}`}
                                size='small'
                              >
                                <i className='ri ri-eye-line'></i>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align='center'>
                            <Typography variant='body2'>No invoices found</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component='div'
                  count={invoices.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default InvoicesPage
