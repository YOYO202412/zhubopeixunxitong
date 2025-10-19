/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 警告：这允许生产构建成功完成，即使你的项目有 ESLint 错误。
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig