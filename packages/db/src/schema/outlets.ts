import { mysqlTable, varchar, boolean, text, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const outlets = mysqlTable('outlets', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  phone: varchar('phone', { length: 30 }),
  email: varchar('email', { length: 150 }),
  addressLine1: varchar('address_line_1', { length: 255 }),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('Bangladesh'),
  isWarehouse: boolean('is_warehouse').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  receiptHeader: text('receipt_header'),
  receiptFooter: text('receipt_footer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type Outlet = typeof outlets.$inferSelect;
export type NewOutlet = typeof outlets.$inferInsert;
