import { mysqlTable, varchar, boolean, text, timestamp, json } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { HeaderMenuItem, LayoutBlockConfig } from '@duelux/shared';

export const homepageLayouts = mysqlTable('homepage_layouts', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`(UUID())`),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 150 }).notNull().unique(),
  description: text('description'),
  previewImage: varchar('preview_image', { length: 1000 }),
  isActive: boolean('is_active').default(false).notNull(),
  menuConfig: json('menu_config').$type<HeaderMenuItem[]>().notNull(),
  blocks: json('blocks').$type<LayoutBlockConfig[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
