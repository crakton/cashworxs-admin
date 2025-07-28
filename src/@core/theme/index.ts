// Import the font CSS
import '@fontsource-variable/inter';
import overrides from './overrides';
import colorSchemes from './colorSchemes';
import { Theme } from '@mui/material';
import { SystemMode } from '../types';
import shadows from './shadows';
import customShadows from './customShadows';
import typography from './typography';
import spacing from './spacing';

// Remove the Inter import from next/font/google
// import { Inter } from 'next/font/google';

// Update your theme function
const theme = (mode: SystemMode, direction: Theme['direction']): Theme => {
	return {
		direction,
		components: overrides(),
		colorSchemes: colorSchemes(),
		...spacing,
		shape: {
			borderRadius: 6,
			customBorderRadius: {
				xs: 2,
				sm: 4,
				md: 6,
				lg: 8,
				xl: 10
			}
		},
		shadows: shadows(mode),
		typography: typography('Inter Variable, Inter, sans-serif'), // Use the font family name directly
		customShadows: customShadows(mode),
		mainColorChannels: {
			light: '46 38 61',
			dark: '231 227 252',
			lightShadow: '46 38 61',
			darkShadow: '19 17 32'
		}
	} as Theme;
};

export default theme;
