import pg from 'pg';
import { config } from './config.js';

const isLocal = /@(localhost|127\.0\.0\.1)/.test(config.databaseUrl);

// Supabase requires SSL. Local Postgres usually does not.
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
});

pool.on('error', (err) => console.error('Unexpected database error:', err.message));

// Every query uses placeholders ($1, $2...). Never build SQL from user input.
export const query = (text, params) => pool.query(text, params);
