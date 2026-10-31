// Runs ../schema.sql against DATABASE_URL. Alternative: paste schema.sql into the Supabase SQL editor.
import { readFile } from 'node:fs/promises';
import { pool } from '../src/db.js';

const sql = await readFile(new URL('../../schema.sql', import.meta.url), 'utf8');
await pool.query(sql);
console.log('Database schema is ready.');
await pool.end();
