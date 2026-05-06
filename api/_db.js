import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema.js';

// Load environment variables for local serverless functions
try {
  const dotenv = await import('dotenv');
  dotenv.config({ path: '.env.local' });
  dotenv.config();
} catch (e) {
  // Ignore if dotenv is not available in production
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('No database connection string was provided. Please check process.env.DATABASE_URL');
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}
