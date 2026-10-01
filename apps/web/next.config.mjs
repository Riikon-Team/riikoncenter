import dotenv from 'dotenv';
import { join } from 'path';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

// Load root workspace .env
dotenv.config({ path: join(process.cwd(), '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@riikoncenter/ui", "@riikoncenter/types"],
};

export default (phase) => {
  // Auto-override URLs for local development
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    process.env.NEXT_PUBLIC_API_URL = `http://localhost:${process.env.PORT || 3305}`;
    process.env.FRONTEND_URL = 'http://localhost:3003';
  }
  return nextConfig;
};
