/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    level: process.env.NODE_ENV === 'test' ? 'error' : 'warn'
  }
}

module.exports = nextConfig
