import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
dotenv.config();

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'duelux_store',
    port: Number(process.env.DB_PORT) || 3306,
  },
  verbose: true,
  strict: true,
});
