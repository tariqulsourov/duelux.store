import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { pool } from '@duelux/db';
import { posRouter } from './routes/pos.routes.js';
import { inventoryRouter } from './routes/inventory.routes.js';
import { catalogRouter } from './routes/catalog.routes.js';
import { outletsRouter } from './routes/outlets.routes.js';
import { storefrontRouter } from './routes/storefront.routes.js';
import { adminRouter } from './routes/admin.routes.js';

dotenv.config({ path: '../../.env' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
  })
);
app.use(express.json());

// Health Check
app.get('/health', async (req, res) => {
  try {
    // Quick ping to MySQL connection pool
    await pool.query('SELECT 1');
    res.json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'DOWN',
      database: 'DISCONNECTED',
      error: error.message,
    });
  }
});

// Mount Core API Routes
app.use('/api/v1/pos', posRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/outlets', outletsRouter);
app.use('/api/v1/storefront', storefrontRouter);
app.use('/api/v1/admin', adminRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Duelux Store Core API server listening on http://localhost:${PORT}`);
  console.log(`📡 Precision Engine: DECIMAL(12, 4) Active`);
  console.log(`🏬 Multi-Store Architecture: Enabled`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('Initiating graceful shutdown...');
  server.close(async () => {
    try {
      await pool.end();
      console.log('MySQL connection pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing database pool:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
