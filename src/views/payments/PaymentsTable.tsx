'use client';

// React Imports
import { useState } from 'react';

// MUI Imports
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// Types Import
import type { Payment } from '@/store/slices/paymentsSlice';
import formatDate, { formateNumber } from '@/utils/formatDate';
import { MenuItem } from '@mui/material';

// Format Date

interface PaymentsTableProps {
	payments: Payment[];
}

const PaymentsTable = ({ payments }: PaymentsTableProps) => {
	// States
	const [page, setPage] = useState<number>(0);
	const [rowsPerPage, setRowsPerPage] = useState<number>(10);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

	// Handle page change
	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	// Handle rows per page change
	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	// Filter payments based on search query
	const filteredPayments = payments.filter(payment => {
		const searchString = searchQuery.toLowerCase();

		return (
			payment.invoice_number.toLowerCase().includes(searchString) ||
			payment.receipt_no.toLowerCase().includes(searchString) ||
			payment.invoice.c_name?.toLowerCase().includes(searchString) ||
			payment.receipt_no.toLowerCase().includes(searchString)
		);
	});

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

	const sortedPayments = [...filteredPayments].sort((a, b) => {
		if (sortBy === 'date') {
			return new Date(b.tdate).getTime() - new Date(a.tdate).getTime();
		} else if (sortBy === 'status') {
			return b.status - a.status;
		}
		if (sortBy === 'amount') {
			return Number(b.amount) - Number(a.amount);
		}
		return 0;
	});

	return (
		<Card>
			<CardHeader
				title='Payment Transactions'
				action={
					<>
						<Box sx={{ display: 'flex', alignItems: 'center' }}>
							<TextField
								select
								label='Sort By'
								size='small'
								value={sortBy}
								onChange={e => setSortBy(e.target.value as 'date' | 'status')}
								sx={{ width: 150, mr: 2 }}
							>
								<MenuItem value='date'>Date</MenuItem>
								<MenuItem value='status'>Status</MenuItem>
								<MenuItem value='amount'>Amount</MenuItem>
							</TextField>

							<TextField
								size='small'
								placeholder='Search payments'
								value={searchQuery}
								onChange={e => setSearchQuery(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position='start'>
											<i className='ri-search-line' />
										</InputAdornment>
									)
								}}
							/>
						</Box>
					</>
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
						</TableRow>
					</TableHead>
					<TableBody>
						{sortedPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(payment => (
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
	);
};

export default PaymentsTable;
