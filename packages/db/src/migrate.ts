import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db, pool } from './client';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🔄 Executing Drizzle MySQL migrations...');
  try {
    const migrationsFolder = path.resolve(__dirname, '../drizzle');
    await migrate(db, { migrationsFolder });
    console.log('✅ Migrations applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
