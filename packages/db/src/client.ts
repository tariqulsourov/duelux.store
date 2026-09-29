import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema/index';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'duelux_store',
  waitForConnections: true,
  connectionLimit: 30, // Optimized for concurrent POS scanning and web traffic
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export const db = drizzle(pool, { schema, mode: 'default' });

export type DatabaseInstance = typeof db;
export * from './schema/index.js';
