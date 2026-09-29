import { db, pool } from './client';
import {
  outlets,
  roles,
  permissions,
  rolePermissions,
  users,
  posCashierProfiles,
  categories,
  brands,
  products,
  productVariants,
  inventoryLevels,
  inventoryLedger,
  posRegisters,
} from './schema/index';
import { InventoryEventType, BarcodeUtil } from '@duelux/shared';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seeding for Duelux Store...');

  try {
    // 1. Create Outlets (Multi-Store)
    console.log('-> Creating Outlets...');
    const [flagshipOutlet] = await db.insert(outlets).values({
      code: 'STORE-01',
      name: 'Duelux Flagship Store',
      phone: '+8801700000001',
      email: 'flagship@duelux.store',
      addressLine1: 'House 12, Road 5, Dhanmondi',
      city: 'Dhaka',
      state: 'Dhaka Division',
      postalCode: '1205',
      country: 'Bangladesh',
      isWarehouse: false,
      receiptHeader: 'DUELUX STORE - LUXURY & STYLE\nVAT Reg: 123456789',
      receiptFooter: 'Exchange within 7 days with original receipt.\nwww.duelux.store',
    });

    const [centralWarehouse] = await db.insert(outlets).values({
      code: 'WH-01',
      name: 'Central Fulfillment Warehouse',
      phone: '+8801700000002',
      email: 'warehouse@duelux.store',
      addressLine1: 'Plot 45, Tejgaon I/A',
      city: 'Dhaka',
      state: 'Dhaka Division',
      postalCode: '1208',
      country: 'Bangladesh',
      isWarehouse: true,
    });

    // Query back the created outlet IDs
    const [storeOutlet] = await db.select().from(outlets).limit(1);

    // 2. Create Roles & Permissions
    console.log('-> Creating Roles & Permissions...');
    const [adminRole] = await db.insert(roles).values({
      name: 'SUPER_ADMIN',
      description: 'System Super Administrator with full capabilities',
      isSystem: true,
    });

    const [cashierRole] = await db.insert(roles).values({
      name: 'CASHIER',
      description: 'POS Counter Cashier Operator',
      isSystem: true,
    });

    const [superRole] = await db.select().from(roles).limit(1);

    // 3. Create Super Admin User & POS Cashier
    console.log('-> Creating Staff Users...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const pinHash = await bcrypt.hash('1234', 10); // 4-digit POS unlock PIN

    await db.insert(users).values({
      name: 'Tariqul Admin',
      email: 'admin@duelux.store',
      phone: '+8801711111111',
      passwordHash,
      roleId: superRole.id,
      primaryOutletId: storeOutlet.id,
    });

    const [createdUser] = await db.select().from(users).limit(1);

    await db.insert(posCashierProfiles).values({
      userId: createdUser.id,
      pinHash,
      canApplyManualDiscount: true,
      maxDiscountPercent: '15.00',
      canVoidItems: true,
      canOpenDrawerManual: true,
    });

    // 4. Create POS Register
    console.log('-> Creating POS Registers...');
    await db.insert(posRegisters).values({
      outletId: storeOutlet.id,
      name: 'Counter 01 (Main)',
      code: 'REG-01',
      defaultPrinterType: 'USB_ESC_POS',
    });

    // 5. Create Brand & Category
    console.log('-> Creating Categories & Brands...');
    await db.insert(brands).values({
      name: 'Duelux Signature',
      slug: 'duelux-signature',
    });
    const [brand] = await db.select().from(brands).limit(1);

    await db.insert(categories).values({
      name: 'Premium Apparel',
      slug: 'premium-apparel',
      description: 'Curated premium fashion apparel for men and women',
    });
    const [category] = await db.select().from(categories).limit(1);

    // 6. Create Products & Variants with DECIMAL(12, 4)
    console.log('-> Creating Products & Variants...');
    await db.insert(products).values({
      title: 'Duelux Royal Oxford Shirt',
      slug: 'duelux-royal-oxford-shirt',
      description: '100% Egyptian Giza Cotton royal oxford weave with mother-of-pearl buttons.',
      brandId: brand.id,
      categoryId: category.id,
      taxRatePercent: '5.00',
    });
    const [product] = await db.select().from(products).limit(1);

    const shirtBarcodeM = BarcodeUtil.generateInternalEan13(1001);
    const shirtBarcodeL = BarcodeUtil.generateInternalEan13(1002);

    await db.insert(productVariants).values([
      {
        productId: product.id,
        sku: 'DX-SHIRT-WHT-M',
        barcode: shirtBarcodeM,
        title: 'White / M',
        sellingPrice: '3500.0000',
        costPrice: '1800.0000',
        compareAtPrice: '4200.0000',
        weightGrams: '350.00',
        attributesJson: { color: 'White', size: 'M' },
      },
      {
        productId: product.id,
        sku: 'DX-SHIRT-WHT-L',
        barcode: shirtBarcodeL,
        title: 'White / L',
        sellingPrice: '3500.0000',
        costPrice: '1800.0000',
        compareAtPrice: '4200.0000',
        weightGrams: '370.00',
        attributesJson: { color: 'White', size: 'L' },
      },
    ]);

    const variants = await db.select().from(productVariants);

    // 7. Seed Inventory Levels & Ledger
    console.log('-> Initializing Atomic Inventory Ledger...');
    for (const v of variants) {
      await db.insert(inventoryLevels).values({
        variantId: v.id,
        outletId: storeOutlet.id,
        onHandQty: '50.0000',
        reservedQty: '0.0000',
        safetyStockBuffer: '2.0000',
      });

      await db.insert(inventoryLedger).values({
        variantId: v.id,
        outletId: storeOutlet.id,
        changeQty: '50.0000',
        resultingOnHand: '50.0000',
        eventType: InventoryEventType.PURCHASE_RECEIPT,
        referenceType: 'PURCHASE_ORDER',
        referenceId: 'PO-INITIAL-STOCK',
        notes: 'Initial opening stock receipt',
        createdByUserId: createdUser.id,
      });
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
