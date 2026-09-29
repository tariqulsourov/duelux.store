import { mysqlTable, varchar, decimal, text, timestamp, json } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { outlets } from './outlets';
import { customers } from './customers';
import { users } from './rbac';
import { posRegisterShifts } from './pos';
import { productVariants } from './catalog';

export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  channel: varchar('channel', { length: 30 }).notNull(), // POS_IN_STORE, ECOMMERCE_WEB, PHONE_ORDER
  outletId: varchar('outlet_id', { length: 36 }).notNull().references(() => outlets.id),
  customerId: varchar('customer_id', { length: 36 }).references(() => customers.id),
  registerShiftId: varchar('register_shift_id', { length: 36 }).references(() => posRegisterShifts.id),
  cashierId: varchar('cashier_id', { length: 36 }).references(() => users.id),
  status: varchar('status', { length: 30 }).default('PENDING_PAYMENT').notNull(),
  paymentStatus: varchar('payment_status', { length: 30 }).default('PENDING').notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  discountTotal: decimal('discount_total', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  taxTotal: decimal('tax_total', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  shippingCharge: decimal('shipping_charge', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  grandTotal: decimal('grand_total', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  changeGiven: decimal('change_given', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable('order_items', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  orderId: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  variantId: varchar('variant_id', { length: 36 }).notNull().references(() => productVariants.id),
  sku: varchar('sku', { length: 100 }).notNull(),
  productTitle: varchar('product_title', { length: 255 }).notNull(),
  variantTitle: varchar('variant_title', { length: 200 }).notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 4 }).default('1.0000').notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 4 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 4 }).notNull(),
});

export const orderPayments = mysqlTable('order_payments', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  orderId: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  tenderType: varchar('tender_type', { length: 30 }).notNull(), // CASH, CARD, MOBILE_WALLET, etc.
  amount: decimal('amount', { precision: 12, scale: 4 }).notNull(),
  transactionRef: varchar('transaction_ref', { length: 150 }),
  tenderDetailsJson: json('tender_details_json'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orderStatusHistory = mysqlTable('order_status_history', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  orderId: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  fromStatus: varchar('from_status', { length: 30 }),
  toStatus: varchar('to_status', { length: 30 }).notNull(),
  comment: varchar('comment', { length: 255 }),
  changedByUserId: varchar('changed_by_user_id', { length: 36 }).references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderPayment = typeof orderPayments.$inferSelect;
