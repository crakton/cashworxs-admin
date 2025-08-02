/** @type {import('next').NextConfig} */
const nextConfig = {
	basePath: process.env.BASEPATH,
	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
	}
};
export default nextConfig;
