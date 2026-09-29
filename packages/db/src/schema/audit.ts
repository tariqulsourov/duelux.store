import { mysqlTable, varchar, timestamp, json } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './rbac';
import { outlets } from './outlets';

export const auditLogs = mysqlTable('audit_logs', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar('user_id', { length: 36 }).references(() => users.id),
  outletId: varchar('outlet_id', { length: 36 }).references(() => outlets.id),
  action: varchar('action', { length: 100 }).notNull(), // PRICE_CHANGE, MANUAL_DISCOUNT, SHIFT_RECONCILIATION
  entityName: varchar('entity_name', { length: 50 }).notNull(), // order, product_variant, pos_shift
  entityId: varchar('entity_id', { length: 100 }),
  oldState: json('old_state'),
  newState: json('new_state'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
