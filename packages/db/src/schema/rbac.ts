import { mysqlTable, varchar, boolean, text, timestamp, primaryKey, decimal } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { outlets } from './outlets';

export const roles = mysqlTable('roles', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar('name', { length: 50 }).notNull().unique(), // SUPER_ADMIN, STORE_MANAGER, CASHIER, WAREHOUSE_OPERATOR
  description: varchar('description', { length: 255 }),
  isSystem: boolean('is_system').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const permissions = mysqlTable('permissions', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  code: varchar('code', { length: 80 }).notNull().unique(), // e.g. 'pos:checkout', 'pos:void_item', 'inventory:adjust'
  module: varchar('module', { length: 50 }).notNull(),     // 'pos', 'inventory', 'orders', 'catalog', 'users'
  description: varchar('description', { length: 255 }),
});

export const rolePermissions = mysqlTable('role_permissions', {
  roleId: varchar('role_id', { length: 36 }).notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: varchar('permission_id', { length: 36 }).notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.roleId, t.permissionId] }),
]);

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar('name', { length: 150 }).notNull(),
  email: varchar('email', { length: 150 }).notNull().unique(),
  phone: varchar('phone', { length: 30 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  roleId: varchar('role_id', { length: 36 }).notNull().references(() => roles.id),
  primaryOutletId: varchar('primary_outlet_id', { length: 36 }).references(() => outlets.id),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const posCashierProfiles = mysqlTable('pos_cashier_profiles', {
  userId: varchar('user_id', { length: 36 }).primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(), // 4-6 digit fast-switch PIN
  canApplyManualDiscount: boolean('can_apply_manual_discount').default(false).notNull(),
  maxDiscountPercent: decimal('max_discount_percent', { precision: 5, scale: 2 }).default('10.00').notNull(),
  canVoidItems: boolean('can_void_items').default(false).notNull(),
  canOpenDrawerManual: boolean('can_open_drawer_manual').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
