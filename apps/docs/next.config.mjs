import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ['@artui/registry'],
  serverExternalPackages: ['@modelcontextprotocol/sdk'],
};

export default withMDX(config);
