import { mysqlTable, varchar, decimal, int, boolean, timestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { orders } from './orders';

export const deliveryZones = mysqlTable('delivery_zones', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar('name', { length: 100 }).notNull(), // Inside Dhaka, Outside Dhaka, Suburbs
  city: varchar('city', { length: 100 }),
  baseRate: decimal('base_rate', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  perKgRate: decimal('per_kg_rate', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  estimatedDays: int('estimated_days').default(2).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const courierConsignments = mysqlTable('courier_consignments', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  orderId: varchar('order_id', { length: 36 }).notNull().references(() => orders.id, { onDelete: 'cascade' }),
  courierName: varchar('courier_name', { length: 100 }).notNull(), // Steadfast, Pathao, RedX, DHL
  trackingNumber: varchar('tracking_number', { length: 150 }).notNull(),
  consignmentId: varchar('consignment_id', { length: 150 }),
  status: varchar('status', { length: 50 }).default('BOOKED').notNull(), // BOOKED, IN_TRANSIT, DELIVERED, RETURNED
  shippingCharge: decimal('shipping_charge', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  codAmountToCollect: decimal('cod_amount_to_collect', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  labelUrl: varchar('label_url', { length: 500 }),
  statusUpdatedAt: timestamp('status_updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type CourierConsignment = typeof courierConsignments.$inferSelect;
