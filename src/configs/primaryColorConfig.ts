export type PrimaryColorConfig = {
	name?: string;
	light?: string;
	main: string;
	dark?: string;
};

// Primary color config object
const primaryColorConfig: PrimaryColorConfig[] = [
	{
		name: 'primary-1',
		light: '#A379FF',
		main: '#DA6E2B',
		dark: '#7E4EE6'
	}
];

export default primaryColorConfig;
