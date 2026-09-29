import { mysqlTable, varchar, decimal, boolean, text, timestamp, json } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { outlets } from './outlets';
import { users } from './rbac';

export const posRegisters = mysqlTable('pos_registers', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  outletId: varchar('outlet_id', { length: 36 }).notNull().references(() => outlets.id),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  defaultPrinterType: varchar('default_printer_type', { length: 30 }).default('USB_ESC_POS').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posRegisterShifts = mysqlTable('pos_register_shifts', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  registerId: varchar('register_id', { length: 36 }).notNull().references(() => posRegisters.id),
  outletId: varchar('outlet_id', { length: 36 }).notNull().references(() => outlets.id),
  cashierId: varchar('cashier_id', { length: 36 }).notNull().references(() => users.id),
  openedAt: timestamp('opened_at').defaultNow().notNull(),
  closedAt: timestamp('closed_at'),
  openingFloat: decimal('opening_float', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  cashSales: decimal('cash_sales', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  cardSales: decimal('card_sales', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  mobileWalletSales: decimal('mobile_wallet_sales', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  totalDiscounts: decimal('total_discounts', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  cashInTotal: decimal('cash_in_total', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  cashOutTotal: decimal('cash_out_total', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  expectedCash: decimal('expected_cash', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  countedCash: decimal('counted_cash', { precision: 12, scale: 4 }),
  variance: decimal('variance', { precision: 12, scale: 4 }),
  status: varchar('status', { length: 20 }).default('OPEN').notNull(), // OPEN, CLOSED
  notes: text('notes'),
});

export const cashDrawerEvents = mysqlTable('cash_drawer_events', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  shiftId: varchar('shift_id', { length: 36 }).notNull().references(() => posRegisterShifts.id),
  cashierId: varchar('cashier_id', { length: 36 }).notNull().references(() => users.id),
  eventType: varchar('event_type', { length: 50 }).notNull(), // CASH_IN, CASH_OUT, NO_SALE_OPEN, SHIFT_CLOSE_DEPOSIT
  amount: decimal('amount', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  reason: varchar('reason', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posParkedOrders = mysqlTable('pos_parked_orders', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  registerId: varchar('register_id', { length: 36 }).notNull().references(() => posRegisters.id),
  outletId: varchar('outlet_id', { length: 36 }).notNull().references(() => outlets.id),
  cashierId: varchar('cashier_id', { length: 36 }).notNull().references(() => users.id),
  tag: varchar('tag', { length: 100 }), // e.g., "Customer in black jacket"
  cartStateJson: json('cart_state_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PosRegister = typeof posRegisters.$inferSelect;
export type PosRegisterShift = typeof posRegisterShifts.$inferSelect;
export type CashDrawerEvent = typeof cashDrawerEvents.$inferSelect;
export type PosParkedOrder = typeof posParkedOrders.$inferSelect;
