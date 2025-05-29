'use client';

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
	Typography,
	TextField,
	MenuItem,
	Alert,
	Box,
	LinearProgress,
	TablePagination,
	useTheme,
  Chip,
  Link,
  Menu
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useEffect, useMemo, useState } from 'react';
import { exportToCSV } from '@/utils';
import formatDate, { formateNumber } from '@/utils/formatDate';
import { fetchAllPayments, Payment } from '@/store/slices/paymentsSlice';

const PaymentsPage = () => {
	const dispatch = useAppDispatch();
	const { payments, isLoading, error } = useAppSelector(state => state.payments);
	const theme = useTheme();
	const [searchTerm, setSearchTerm] = useState('');
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for menu anchor and selected invoice
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuReceipt, setMenuReceipt] = useState<Payment | null>(null);

	useEffect(() => {
		dispatch(fetchAllPayments());
	}, [dispatch]);

  // Handle page change
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	// Handle rows per page change
	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

  // Get status color based on payment status
	const getStatusColor = (status: number) => {
		switch (status) {
			case 1:
				return 'success';
			case 0:
				return 'warning';
			default:
				return 'error';
		}
	};

	// Filter payments based on search, status, and date criteria
	const filteredPayments = useMemo(() => {
		if (!payments) return [];

		let result = [...payments];

		if (searchTerm) {
			result = result.filter(
				payment =>
					payment.invoice.c_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					payment.receipt_no?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (statusFilter !== 'all') {
			const statusCode = statusFilter === 'completed' ? 1 : 0;
			result = result.filter(payment => payment.status === statusCode);
		}

		if (fromDate || toDate) {
			result = result.filter(payment => {
				const date = new Date(payment.tdate);
				const from = fromDate ? new Date(fromDate) : null;
				const to = toDate ? new Date(toDate) : null;
				if (to) to.setHours(23, 59, 59, 999);
				return (!from || date >= from) && (!to || date <= to);
			});
		}

		return result;
	}, [payments, searchTerm, statusFilter, fromDate, toDate]);

  // Reset to first page when filters change
  useEffect(() => {
		setPage(0);
	}, [searchTerm, statusFilter, fromDate, toDate]);

  // Calculate payments for current page
	const paginatedPayments = useMemo(
		() => filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[filteredPayments, page, rowsPerPage]
	);

	// Calculate stats based on ALL filtered payments (not just current page)
	const stats = useMemo(() => {
		if (!filteredPayments || filteredPayments.length === 0) {
			return {
				totalTransactions: 0,
				totalAmount: 0,
				completedTransactions: 0,
				completedAmount: 0,
				pendingTransactions: 0
			};
		}

		const totalAmount = filteredPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0);
		const completedPayments = filteredPayments.filter(payment => payment.status === 1);
		const pendingPayments = filteredPayments.filter(payment => payment.status === 0);
		const completedAmount = completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

		return {
			totalTransactions: filteredPayments.length,
			totalAmount,
			completedTransactions: completedPayments.length,
			completedAmount,
			pendingTransactions: pendingPayments.length
		};
	}, [filteredPayments]);

	if (isLoading) {
		return (
			<Card>
				<CardHeader title='Receipts' />
				<CardContent>
					<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
						<LinearProgress sx={{ width: '100%' }} />
					</Box>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Alert severity='error' sx={{ mb: 4 }}>
				{error as unknown as string}
			</Alert>
		);
	}

	if (!payments || payments.length === 0) {
		return <Alert severity='info'>No Receipts available</Alert>;
	}

	return (
		<Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            action={
              <Button
                variant='contained'
                onClick={() => exportToCSV<Payment>(filteredPayments)}
                startIcon={<i className='ri ri-download-line'></i>}
              >
                Export to CSV
              </Button>
            }
          />
          <CardContent>
            <Grid container spacing={4}>
              {/* Stats Column */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent className='flex flex-col gap-2 relative items-start'>
                    <div>
                      <Typography variant='h5'>Payments Overview</Typography>
                      <Typography>
                        {filteredPayments.length === payments.length
                          ? 'Manage all payment transactions'
                          : `Showing ${filteredPayments.length} of ${payments.length} transactions based on filters`}
                      </Typography>
                    </div>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant='h4' color='primary'>
                        {formateNumber(stats.totalAmount)}
                      </Typography>
                      <Typography variant='body2'>{stats.totalTransactions} Total Transactions</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant='body1' sx={{ fontWeight: 500, color: theme.palette.success.main }}>
                        {formateNumber(stats.completedAmount)} Completed
                      </Typography>
                      <Typography variant='body2'>{stats.completedTransactions} Completed Transactions</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant='body1' sx={{ fontWeight: 500, color: theme.palette.warning.main }}>
                        {stats.pendingTransactions} Pending Transactions
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              {/* Summary Column */}
              <Grid item xs={12} md={6}>
                <Box sx={{ mt: { xs: 4, md: 0 } }}>
                  <Typography variant='h6' sx={{ mb: 2 }}>
                    Payment Status Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.success.light, borderRadius: 1 }}>
                        <Typography variant='h6'>{filteredPayments.filter(p => p.status === 1).length}</Typography>
                        <Typography variant='body2'>Completed</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.warning.light, borderRadius: 1 }}>
                        <Typography variant='h6'>{filteredPayments.filter(p => p.status === 0).length}</Typography>
                        <Typography variant='body2'>Pending</Typography>
                      </Box>
                    </Grid>
                    {/* Uncomment if you want to show failed */}
                    {/* <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: theme.palette.error.light, borderRadius: 1 }}>
                        <Typography variant='h6'>{filteredPayments.filter(p => p.status !== 0 && p.status !== 1).length}</Typography>
                        <Typography variant='body2'>Failed</Typography>
                      </Box>
                    </Grid> */}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Payments Table */}
			<Grid item xs={12}>
				<Card>
					<CardHeader
						title={'Receipts'}
						action={
							<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
								<TextField
									label='From'
									type='date'
									size='small'
									InputLabelProps={{ shrink: true }}
									value={fromDate}
									onChange={e => setFromDate(e.target.value)}
								/>
								<TextField
									label='To'
									type='date'
									size='small'
									InputLabelProps={{ shrink: true }}
									value={toDate}
									onChange={e => setToDate(e.target.value)}
								/>
								<TextField
									label='Status'
									select
									size='small'
									value={statusFilter}
									onChange={e => setStatusFilter(e.target.value as any)}
								>
									<MenuItem value='all'>All</MenuItem>
									<MenuItem value='pending'>Pending</MenuItem>
									<MenuItem value='completed'>Completed</MenuItem>
								</TextField>
								<TextField
									label='Search by Payer or Ref'
									variant='outlined'
									size='small'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
								/>
							</Box>
						}
					/>
					<TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label='payments table'>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice Number</TableCell>
                  <TableCell>Receipt Number</TableCell>
                  <TableCell>Payer</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Org. ID</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>Date</Box>
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.map(payment => (
                  <TableRow
                    hover
                    key={payment.invoice_number}
                    sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}
                  >
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {payment.invoice_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {payment.receipt_no}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.invoice.c_name}</TableCell>
                    <TableCell>
                      <Typography variant='body2'>{formateNumber(Number(payment.amount))}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {payment.note}
                      </Typography>
                    </TableCell>
                    <TableCell>{payment.payload.InstitutionName}</TableCell>
                    <TableCell>{payment.payload.InstitutionId}</TableCell>
    
                    <TableCell>
                      <Typography variant='body2'>{formatDate(payment.tdate)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status === 1 ? 'Completed' : payment.status === 0 ? 'Pending' : 'Failed'}
                        color={getStatusColor(payment.status) as 'success' | 'warning' | 'error' | 'default'}
                        size='small'
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          component={Link}
                          href={`/platforms/payments/${payment.invoice_number}`}
                          size='large'
                        >
                          <i className='ri ri-eye-line'></i>
                        </Button>
                        {/* Action ellipse */}
                        <Box sx={{ position: 'relative' }}>
                          <Button
                            startIcon={<i className='ri ri-more-2-line'></i>}
                            variant='text'
                            color='inherit'
                            size='large'
                            onClick={e => {
                              e.stopPropagation();
                              setMenuAnchorEl(e.currentTarget);
                              setMenuReceipt(payment);
                            }}
                          />
                          {/* Menu */}
                          {menuReceipt?.invoice_number === payment.invoice_number && (
                            <Menu
                              anchorEl={menuAnchorEl}
                              open={Boolean(menuAnchorEl)}
                              onClose={() => {
                                setMenuAnchorEl(null);
                                setMenuReceipt(null);
                              }}
                              anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                              }}
                              transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                              }}
                            >
                              <MenuItem
                                onClick={() => {
                                  exportToCSV([payment]);
                                  setMenuAnchorEl(null);
                                  setMenuReceipt(null);
                                }}
                              >
                                <i className='ri ri-download-line' style={{ marginRight: 8 }} />
                                Export Receipt
                              </MenuItem>
                            </Menu>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component='div'
            count={filteredPayments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
				</Card>
			</Grid>
		</Grid>
	);
};

export default PaymentsPage;