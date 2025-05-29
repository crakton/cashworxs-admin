// create an CSV exporting function
export const exportToCSV = <T extends object>(data: T[]) => {
	if (!data.length) return;

	// Get all unique keys from all data
	const allKeys = Array.from(
		data.reduce((keys, invoice) => {
			Object.keys(invoice).forEach(key => keys.add(key));
			return keys;
		}, new Set<string>())
	);

	const csvContent = [
		allKeys,
		...data.map(invoice =>
			allKeys.map(key => {
				const rawValue = invoice[key as keyof T];
				const stringValue = typeof rawValue === 'object' && rawValue !== null ? JSON.stringify(rawValue) : rawValue;
				return `"${String(stringValue ?? '')}"`;
			})
		)
	]
		.map(row => row.join(','))
		.join('\n');

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `csv_data_${new Date().toISOString()}.csv`;
	a.click();
	URL.revokeObjectURL(url);
};
// create an CSV exporting function for individual
export const exportToIndividualCSV = <T extends object>(invoice: T) => {
	if (!invoice) return;

	// Get all unique keys from all data
	const allKeys = Array.from(Object.keys(invoice));

	const csvContent = [
		allKeys,
		Object.values(invoice).map(value => {
			if (typeof value === 'object' && value !== null) {
				value = JSON.stringify(value);
			}
			return `"${String(value ?? '')}"`;
		})
	]
		.map(row => row.join(','))
		.join('\n');

	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `csv_${new Date().toISOString()}.csv`;
	a.click();
	URL.revokeObjectURL(url);
};
