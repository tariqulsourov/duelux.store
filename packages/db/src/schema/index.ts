import { relations } from 'drizzle-orm';
import { outlets } from './outlets';
import { roles, permissions, rolePermissions, users, posCashierProfiles } from './rbac';
import { categories, brands, products, productVariants, barcodeAliases } from './catalog';
import { inventoryLevels, inventoryLedger } from './inventory';
import { customers, customerAddresses } from './customers';
import { posRegisters, posRegisterShifts, cashDrawerEvents, posParkedOrders } from './pos';
import { orders, orderItems, orderPayments, orderStatusHistory } from './orders';
import { deliveryZones, courierConsignments } from './couriers';
import { auditLogs } from './audit';

// Export all tables
export * from './outlets';
export * from './rbac';
export * from './catalog';
export * from './inventory';
export * from './customers';
export * from './pos';
export * from './orders';
export * from './couriers';
export * from './audit';

// Relations Definitions
export const outletsRelations = relations(outlets, ({ many }) => ({
  inventoryLevels: many(inventoryLevels),
  inventoryLedger: many(inventoryLedger),
  posRegisters: many(posRegisters),
  orders: many(orders),
  users: many(users),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
  barcodeAliases: many(barcodeAliases),
  inventoryLevels: many(inventoryLevels),
  orderItems: many(orderItems),
}));

export const barcodeAliasesRelations = relations(barcodeAliases, ({ one }) => ({
  variant: one(productVariants, { fields: [barcodeAliases.variantId], references: [productVariants.id] }),
}));

export const inventoryLevelsRelations = relations(inventoryLevels, ({ one }) => ({
  variant: one(productVariants, { fields: [inventoryLevels.variantId], references: [productVariants.id] }),
  outlet: one(outlets, { fields: [inventoryLevels.outletId], references: [outlets.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  outlet: one(outlets, { fields: [orders.outletId], references: [outlets.id] }),
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  cashier: one(users, { fields: [orders.cashierId], references: [users.id] }),
  shift: one(posRegisterShifts, { fields: [orders.registerShiftId], references: [posRegisterShifts.id] }),
  items: many(orderItems),
  payments: many(orderPayments),
  statusHistory: many(orderStatusHistory),
  courierConsignment: one(courierConsignments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const orderPaymentsRelations = relations(orderPayments, ({ one }) => ({
  order: one(orders, { fields: [orderPayments.orderId], references: [orders.id] }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
  changedByUser: one(users, { fields: [orderStatusHistory.changedByUserId], references: [users.id] }),
}));

export const courierConsignmentsRelations = relations(courierConsignments, ({ one }) => ({
  order: one(orders, { fields: [courierConsignments.orderId], references: [orders.id] }),
}));

export const inventoryLedgerRelations = relations(inventoryLedger, ({ one }) => ({
  variant: one(productVariants, { fields: [inventoryLedger.variantId], references: [productVariants.id] }),
  outlet: one(outlets, { fields: [inventoryLedger.outletId], references: [outlets.id] }),
  user: one(users, { fields: [inventoryLedger.createdByUserId], references: [users.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  addresses: many(customerAddresses),
}));

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  customer: one(customers, { fields: [customerAddresses.customerId], references: [customers.id] }),
}));

export const posRegisterShiftsRelations = relations(posRegisterShifts, ({ one, many }) => ({
  register: one(posRegisters, { fields: [posRegisterShifts.registerId], references: [posRegisters.id] }),
  outlet: one(outlets, { fields: [posRegisterShifts.outletId], references: [outlets.id] }),
  cashier: one(users, { fields: [posRegisterShifts.cashierId], references: [users.id] }),
  drawerEvents: many(cashDrawerEvents),
  orders: many(orders),
}));

