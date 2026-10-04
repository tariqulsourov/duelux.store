import { pool } from './client.js';

async function main() {
  console.log('🔄 Checking products table columns in MySQL...');
  const [cols] = await pool.query('SHOW COLUMNS FROM products');
  const existing = (cols as any[]).map((c) => c.Field);
  console.log('Existing columns:', existing);

  const additions = [
    { name: 'short_description', ddl: 'ADD COLUMN short_description TEXT NULL AFTER slug' },
    { name: 'tags', ddl: 'ADD COLUMN tags JSON NULL AFTER category_id' },
    { name: 'weight_volume', ddl: 'ADD COLUMN weight_volume VARCHAR(100) NULL AFTER tags' },
    { name: 'rating', ddl: 'ADD COLUMN rating DECIMAL(3,2) NOT NULL DEFAULT 5.00 AFTER weight_volume' },
    { name: 'reviews_count', ddl: 'ADD COLUMN reviews_count VARCHAR(50) NOT NULL DEFAULT "0" AFTER rating' },
    { name: 'featured_review', ddl: 'ADD COLUMN featured_review TEXT NULL AFTER reviews_count' },
    { name: 'made_in_region', ddl: 'ADD COLUMN made_in_region VARCHAR(150) NOT NULL DEFAULT "Bangladesh" AFTER featured_review' },
    { name: 'image_url', ddl: 'ADD COLUMN image_url VARCHAR(1000) NULL AFTER made_in_region' },
    { name: 'gallery_images', ddl: 'ADD COLUMN gallery_images JSON NULL AFTER image_url' },
    { name: 'publish_status', ddl: 'ADD COLUMN publish_status VARCHAR(30) NOT NULL DEFAULT "PUBLISHED" AFTER gallery_images' },
  ];

  for (const add of additions) {
    if (!existing.includes(add.name)) {
      console.log(`Adding column ${add.name}...`);
      await pool.query(`ALTER TABLE products ${add.ddl}`);
      console.log(`✓ Added ${add.name}`);
    } else {
      console.log(`- Column ${add.name} already exists`);
    }
  }

  const [afterCols] = await pool.query('SHOW COLUMNS FROM products');
  console.log('Final columns in products:', (afterCols as any[]).map((c) => c.Field));
  await pool.end();
  console.log('✅ Products table schema successfully upgraded!');
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
