import { Router, Request, Response } from 'express';
import { db, products, productVariants, barcodeAliases, categories, brands, inventoryLevels, inventoryLedger } from '@duelux/db';
import { eq } from 'drizzle-orm';
import { MoneyUtil } from '@duelux/shared';

export const catalogRouter = Router();

/**
 * List Categories
 * GET /api/v1/catalog/categories
 */
catalogRouter.get('/categories', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(categories).where(eq(categories.isActive, true));
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Create Category
 * POST /api/v1/catalog/categories
 */
catalogRouter.post('/categories', async (req: Request, res: Response) => {
  try {
    const { name, slug, description } = req.body;
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await db.insert(categories).values({
      name,
      slug: finalSlug,
      description,
    });
    const [created] = await db.select().from(categories).where(eq(categories.slug, finalSlug));
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * List Brands
 * GET /api/v1/catalog/brands
 */
catalogRouter.get('/brands', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(brands).where(eq(brands.isActive, true));
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Create Brand
 * POST /api/v1/catalog/brands
 */
catalogRouter.post('/brands', async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await db.insert(brands).values({
      name,
      slug: finalSlug,
    });
    const [created] = await db.select().from(brands).where(eq(brands.slug, finalSlug));
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * List Products with Variants and Inventory
 * GET /api/v1/catalog/products
 */
catalogRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const allProducts = await db.query.products.findMany({
      where: eq(products.isActive, true),
      with: {
        brand: true,
        category: true,
        variants: {
          with: {
            barcodeAliases: true,
            inventoryLevels: true,
          },
        },
      },
    });

    res.json({ success: true, data: allProducts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Create Product with Variants and Barcodes
 * POST /api/v1/catalog/products
 */
catalogRouter.post('/products', async (req: Request, res: Response) => {
  try {
    const { title, slug, description, brandId, categoryId, taxRatePercent, variants, outletId } = req.body;

    const result = await db.transaction(async (tx) => {
      // 1. Insert product (tax rate defaults to 0.00 per policy)
      await tx.insert(products).values({
        title,
        slug,
        description,
        brandId: brandId || null,
        categoryId: categoryId || null,
        taxRatePercent: taxRatePercent ? String(taxRatePercent) : '0.00',
        isTaxExempt: true,
      });

      const [createdProduct] = await tx
        .select()
        .from(products)
        .where(eq(products.slug, slug));

      // 2. Insert variants & barcodes
      const createdVariants: any[] = [];
      if (Array.isArray(variants)) {
        for (const v of variants) {
          await tx.insert(productVariants).values({
            productId: createdProduct.id,
            sku: v.sku,
            barcode: v.barcode,
            title: v.title || 'Default',
            sellingPrice: MoneyUtil.toDbDecimal(v.sellingPrice),
            costPrice: MoneyUtil.toDbDecimal(v.costPrice || 0),
            compareAtPrice: v.compareAtPrice ? MoneyUtil.toDbDecimal(v.compareAtPrice) : null,
            weightGrams: v.weightGrams ? String(v.weightGrams) : '0.00',
            attributesJson: v.attributesJson || {},
          });

          const [createdVariant] = await tx
            .select()
            .from(productVariants)
            .where(eq(productVariants.sku, v.sku));

          // If aliases provided
          if (Array.isArray(v.barcodeAliases)) {
            for (const alias of v.barcodeAliases) {
              await tx.insert(barcodeAliases).values({
                variantId: createdVariant.id,
                barcode: alias.barcode,
                barcodeType: alias.barcodeType || 'CODE128',
                notes: alias.notes,
              });
            }
          }

          // Optional Initial Stock allocation
          const targetOutlet = v.outletId || outletId;
          const initialQty = Number(v.initialStock || 0);
          if (targetOutlet && initialQty > 0) {
            await tx.insert(inventoryLevels).values({
              variantId: createdVariant.id,
              outletId: targetOutlet,
              onHandQty: initialQty.toFixed(4),
              reservedQty: '0.0000',
              safetyStockBuffer: Number(v.safetyStockBuffer || 5).toFixed(4),
            });

            await tx.insert(inventoryLedger).values({
              variantId: createdVariant.id,
              outletId: targetOutlet,
              changeQty: initialQty.toFixed(4),
              resultingOnHand: initialQty.toFixed(4),
              eventType: 'PURCHASE_RECEIPT',
              referenceType: 'INITIAL_STOCK',
              referenceId: `INIT-${createdVariant.sku}`,
              notes: 'Initial stock recorded on product creation',
            });
          }

          createdVariants.push(createdVariant);
        }
      }

      return {
        product: createdProduct,
        variants: createdVariants,
      };
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

