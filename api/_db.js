import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/db/schema.js';

// Singleton instance to prevent multiple connection overhead
let dbInstance = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is missing. Please check your .env file.');
  }

  const sql = neon(url);
  dbInstance = drizzle(sql, { schema });
  return dbInstance;
}
