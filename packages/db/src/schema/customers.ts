import { mysqlTable, varchar, decimal, int, boolean, text, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const customers = mysqlTable('customers', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  phone: varchar('phone', { length: 30 }).notNull().unique(), // Fast lookup key for POS counter
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 150 }),
  passwordHash: varchar('password_hash', { length: 255 }), // Nullable for in-store guest lookups
  loyaltyPoints: decimal('loyalty_points', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  totalSpend: decimal('total_spend', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  totalOrdersCount: int('total_orders_count').default(0).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const customerAddresses = mysqlTable('customer_addresses', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  customerId: varchar('customer_id', { length: 36 }).notNull().references(() => customers.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 50 }).default('Home').notNull(),
  recipientName: varchar('recipient_name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 30 }).notNull(),
  addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  zone: varchar('zone', { length: 100 }), // Delivery Zone / District for pricing matrix
  postalCode: varchar('postal_code', { length: 20 }),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type CustomerAddress = typeof customerAddresses.$inferSelect;
