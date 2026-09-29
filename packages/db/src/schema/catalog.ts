import { mysqlTable, varchar, boolean, text, timestamp, decimal, json } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  parentId: varchar('parent_id', { length: 36 }),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 180 }).notNull().unique(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const brands = mysqlTable('brands', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar('name', { length: 150 }).notNull().unique(),
  slug: varchar('slug', { length: 180 }).notNull().unique(),
  logoUrl: varchar('logo_url', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable('products', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  brandId: varchar('brand_id', { length: 36 }).references(() => brands.id),
  categoryId: varchar('category_id', { length: 36 }).references(() => categories.id),
  isActive: boolean('is_active').default(true).notNull(),
  isTaxExempt: boolean('is_tax_exempt').default(false).notNull(),
  taxRatePercent: decimal('tax_rate_percent', { precision: 5, scale: 2 }).default('0.00').notNull(),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const productVariants = mysqlTable('product_variants', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  productId: varchar('product_id', { length: 36 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku: varchar('sku', { length: 100 }).notNull().unique(),
  barcode: varchar('barcode', { length: 100 }).notNull().unique(),
  title: varchar('title', { length: 200 }).notNull(), // e.g. "Default" or "Black / L"
  sellingPrice: decimal('selling_price', { precision: 12, scale: 4 }).notNull(),
  costPrice: decimal('cost_price', { precision: 12, scale: 4 }).default('0.0000').notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 12, scale: 4 }),
  weightGrams: decimal('weight_grams', { precision: 10, scale: 2 }).default('0.00'),
  attributesJson: json('attributes_json').$type<Record<string, string>>(), // e.g. { size: "XL", color: "Red" }
  imageUrl: varchar('image_url', { length: 500 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const barcodeAliases = mysqlTable('barcode_aliases', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  variantId: varchar('variant_id', { length: 36 }).notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  barcode: varchar('barcode', { length: 100 }).notNull().unique(),
  barcodeType: varchar('barcode_type', { length: 30 }).default('CODE128').notNull(),
  notes: varchar('notes', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type BarcodeAlias = typeof barcodeAliases.$inferSelect;
