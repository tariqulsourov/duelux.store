import { mysqlTable, varchar, decimal, text, timestamp, uniqueIndex } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { outlets } from './outlets';
import { productVariants } from './catalog';
import { users } from './rbac';

export const inventoryLevels = mysqlTable('inventory_levels', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  variantId: varchar('variant_id', { length: 36 }).notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  outletId: varchar('outlet_id', { length: 36 }).notNull().references(() => outlets.id, { onDelete: 'cascade' }),
  onHandQty: decimal('on_hand_qty', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  reservedQty: decimal('reserved_qty', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  safetyStockBuffer: decimal('safety_stock_buffer', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
}, (t) => [
  uniqueIndex('idx_variant_outlet').on(t.variantId, t.outletId),
]);

export const inventoryLedger = mysqlTable('inventory_ledger', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  variantId: varchar('variant_id', { length: 36 }).notNull().references(() => productVariants.id),
  outletId: varchar('outlet_id', { length: 36 }).notNull().references(() => outlets.id),
  changeQty: decimal('change_qty', { precision: 12, scale: 4 }).notNull(),
  resultingOnHand: decimal('resulting_on_hand', { precision: 12, scale: 4 }).notNull(),
  eventType: varchar('event_type', { length: 50 }).notNull(), // PURCHASE_RECEIPT, POS_SALE, ONLINE_SALE, etc.
  referenceType: varchar('reference_type', { length: 50 }),  // ORDER, PURCHASE_ORDER, TRANSFER
  referenceId: varchar('reference_id', { length: 100 }),      // Order ID, Shift ID, etc.
  notes: text('notes'),
  createdByUserId: varchar('created_by_user_id', { length: 36 }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type InventoryLevel = typeof inventoryLevels.$inferSelect;
export type InventoryLedgerEntry = typeof inventoryLedger.$inferSelect;
