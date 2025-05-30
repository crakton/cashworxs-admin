'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

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
	TablePagination,
	Box,
	MenuItem,
	TextField,
	Alert,
	useTheme,
	Menu
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchAllInvoices, Invoice } from '@/store/slices/invoicesSlice';
import { formateNumber } from '@/utils/formatDate';
import { exportToCSV } from '@/utils';

const InvoicesPage = () => {
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const { invoices, isLoading, error } = useAppSelector(state => state.invoices);
	const [searchTerm, setSearchTerm] = useState('');
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 0 | 1 | 2>('all');

	// State for menu anchor and selected invoice
	const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
	const [menuInvoice, setMenuInvoice] = useState<Invoice | null>(null);

	// Pagination states
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	useEffect(() => {
		dispatch(fetchAllInvoices());
	}, [dispatch]);

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

	// Pagination handlers
	const handleChangePage = (_event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Apply all filters in sequence
	const filteredInvoices = useMemo(() => {
		// Start with all invoices
		if (!invoices) return [];

		let result = [...invoices];

		// Apply search filter
		if (searchTerm) {
			result = result.filter(
				invoice =>
					invoice.c_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					invoice.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
					invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply status filter
		if (statusFilter !== 'all') {
			result = result.filter(invoice => invoice.status === statusFilter);
		}

		// Apply date filter
		if (fromDate || toDate) {
			result = result.filter(invoice => {
				const invoiceDate = new Date(invoice.tdate);
				const from = fromDate ? new Date(fromDate) : null;
				const to = toDate ? new Date(toDate) : null;

				// Adjust toDate to end of day for inclusive comparison
				if (to) {
					to.setHours(23, 59, 59, 999);
				}

				return (!from || invoiceDate >= from) && (!to || invoiceDate <= to);
			});
		}

		return result;
	}, [invoices, searchTerm, statusFilter, fromDate, toDate]);

	// Get paginated data
	const paginatedInvoices = useMemo(
		() => filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[filteredInvoices, page, rowsPerPage]
	);

	// When filters change, reset to first page
	useEffect(() => {
		setPage(0);
	}, [searchTerm, statusFilter, fromDate, toDate]);

	if (isLoading) {
		return (
			<Card>
				<CardHeader title='Invoices' />
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

	if (!invoices || invoices.length === 0) {
		return <Alert severity='info'>No invoices available</Alert>;
	}

	return (
		<Grid container spacing={6}>
			<Grid container spacing={6}>
				{/* Stats */}
				<Grid item xs={12}>
					<Card>
						<CardHeader
							title='Invoices'
							action={
								<Box>
									<Button
										variant='contained'
										color='primary'
										onClick={() => exportToCSV<Invoice>(filteredInvoices)}
										startIcon={<i className='ri ri-download-line'></i>}
									>
										<Typography variant='button'>Export to CSV</Typography>
									</Button>
								</Box>
							}
						/>
						<CardContent>
							<Grid container spacing={4}>
								<Grid item xs={12} sm={6} md={3}>
									<Card sx={{ bgcolor: theme.palette.primary.dark }}>
										<CardContent>
											<Typography variant='h6'>Total Invoices</Typography>
											<Typography variant='h5'>{filteredInvoices.length}</Typography>
										</CardContent>
									</Card>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Card sx={{ bgcolor: theme.palette.secondary.dark }}>
										<CardContent>
											<Typography variant='h6'>Total Amount</Typography>
											<Typography variant='h5'>
												{formateNumber(filteredInvoices.reduce((acc, curr) => acc + parseFloat(curr.amount), 0))}
											</Typography>
										</CardContent>
									</Card>
								</Grid>
								<Grid item xs={12} sm={6} md={2}>
									<Card sx={{ bgcolor: theme.palette.error.dark }}>
										<CardContent>
											<Typography variant='h6'>Pending</Typography>
											<Typography variant='h5'>{filteredInvoices.filter(i => i.status === 0).length}</Typography>
										</CardContent>
									</Card>
								</Grid>
								<Grid item xs={12} sm={6} md={2}>
									<Card sx={{ bgcolor: theme.palette.success.dark }}>
										<CardContent>
											<Typography variant='h6'>Paid</Typography>
											<Typography variant='h5'>{filteredInvoices.filter(i => i.status === 1).length}</Typography>
										</CardContent>
									</Card>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>

				<Grid item xs={12}>
					<Card>
						<CardHeader
							title='Invoices'
							action={
								<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
									{/* Date range filter */}
									<Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
										<TextField
											label='From'
											type='date'
											size='small'
											InputLabelProps={{ shrink: true }}
											value={fromDate}
											onChange={e => setFromDate(e.target.value)}
											sx={{ mr: 1, minWidth: 140 }}
											InputProps={{
												startAdornment: (
													<Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
														<i className='ri-calendar-line' />
													</Box>
												)
											}}
										/>
										<TextField
											label='To'
											type='date'
											size='small'
											InputLabelProps={{ shrink: true }}
											value={toDate}
											onChange={e => setToDate(e.target.value)}
											sx={{ mr: 2, minWidth: 140 }}
											InputProps={{
												startAdornment: (
													<Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
														<i className='ri-calendar-line' />
													</Box>
												)
											}}
										/>
									</Box>
									<TextField
										label='Sort by'
										select
										size='small'
										value={statusFilter}
										onChange={e => setStatusFilter(e.target.value as any)}
										sx={{ width: 150, mr: 2 }}
									>
										<MenuItem value='all'>All</MenuItem>
										<MenuItem value={0}>Pending</MenuItem>
										<MenuItem value={1}>Paid</MenuItem>
									</TextField>
									<TextField
										label='Search by Payer or Invoice ID'
										variant='outlined'
										size='small'
										value={searchTerm}
										onChange={e => setSearchTerm(e.target.value)}
									/>
								</Box>
							}
						/>
						<CardContent>
							<TableContainer>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell>Payer</TableCell>
											<TableCell>Amount</TableCell>
											<TableCell>Description</TableCell>
											{/* <TableCell>ID Credentail</TableCell> */}
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
													<TableCell>{invoice.note}</TableCell>
													{/* <TableCell>{invoice?.irs_no ?? 'No credentials'}</TableCell> */}
													<TableCell>
														<Chip
															label={invoice.status === 0 ? 'Pending' : invoice.status === 1 ? 'Paid' : 'Overdued'}
															color={getStatusColor(invoice.status)}
															size='small'
														/>
													</TableCell>
													<TableCell>{new Date(invoice.tdate).toLocaleDateString()}</TableCell>
													<TableCell>
														<Box sx={{ display: 'flex', gap: 1 }}>
															<Button
																component={Link}
																href={`/platforms/invoices/${invoice.invoice_number}`}
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
																		setMenuInvoice(invoice);
																	}}
																/>
																{/* Menu */}
																{menuInvoice?.id === invoice.id && (
																	<Menu
																		anchorEl={menuAnchorEl}
																		open={Boolean(menuAnchorEl)}
																		onClose={() => {
																			setMenuAnchorEl(null);
																			setMenuInvoice(null);
																		}}
																		anchorOrigin={{
																			vertical: 'bottom',
																			horizontal: 'right'
																		}}
																		transformOrigin={{
																			vertical: 'top',
																			horizontal: 'right'
																		}}
																	>
																		<MenuItem
																			onClick={() => {
																				exportToCSV([invoice]);
																				setMenuAnchorEl(null);
																				setMenuInvoice(null);
																			}}
																		>
																			<i className='ri ri-download-line' style={{ marginRight: 8 }} />
																			Export Invoice
																		</MenuItem>
																	</Menu>
																)}
															</Box>
														</Box>
													</TableCell>
												</TableRow>
											))
										) : (
											<TableRow>
												<TableCell colSpan={8} align='center'>
													<Typography variant='body2'>No invoices found</Typography>
												</TableCell>
											</TableRow>
										)}
									</TableBody>
								</Table>
							</TableContainer>
							<TablePagination
								component='div'
								count={filteredInvoices.length}
								page={page}
								onPageChange={handleChangePage}
								rowsPerPage={rowsPerPage}
								onRowsPerPageChange={handleChangeRowsPerPage}
							/>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default InvoicesPage;
