/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		// Disable static optimization for pages that use client-side features
		forceSwcTransforms: true
	},

	// Add build configuration to handle client-side only code
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Handle client-side only modules
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false
			};
		}

		return config;
	},

	// Add output configuration
	output: 'standalone',

	// Handle build errors more gracefully
	onDemandEntries: {
		maxInactiveAge: 25 * 1000,
		pagesBufferLength: 2
	},

	// Optimize for production
	swcMinify: true,

	// Handle environment variables
	env: {
		CUSTOM_KEY: process.env.CUSTOM_KEY
	},

	// Add headers for better performance
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY'
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff'
					}
				]
			}
		];
	}
};

// Use ES Modules export instead of module.exports
export default nextConfig;
