'use client';

// React Imports
import type { CSSProperties } from 'react';

// Third-party Imports
import Image from 'next/image';

import styled from '@emotion/styled';

// Component Imports

// Config Imports
import themeConfig from '@configs/themeConfig';

type LogoTextProps = {
	color?: CSSProperties['color'];
};

const LogoText = styled.span<LogoTextProps>`
	color: ${({ color }) => color ?? 'var(--mui-palette-text-primary)'};
	font-size: 1.25rem;
	line-height: 1.2;
	font-weight: 600;
	letter-spacing: 0.15px;
	text-transform: uppercase;
	margin-inline-start: 10px;
`;

const Logo = ({ color }: { color?: CSSProperties['color'] }) => {
	return (
		<div className='flex items-center min-bs-[24px]'>
			<Image src={'/images/logos/logo-original.png'} alt={'Logo'} width={124} height={96} />
		</div>
	);
};

export default Logo;
