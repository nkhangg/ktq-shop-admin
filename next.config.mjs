/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        isrFlushToDisk: false, // Tắt cache ISR (Incremental Static Regeneration)
    },
    reactStrictMode: false,
    productionBrowserSourceMaps: false,
    headers() {
        return [
            {
                source: '/(.*)', // Áp dụng cho tất cả các route
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'no-store, max-age=0', // Vô hiệu hóa cache
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
