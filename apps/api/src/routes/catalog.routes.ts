import { Router, Request, Response } from 'express';
import { db, products, productVariants, barcodeAliases, categories, brands } from '@duelux/db';
import { eq } from 'drizzle-orm';
import { MoneyUtil } from '@duelux/shared';

export const catalogRouter = Router();

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
    const { title, slug, description, brandId, categoryId, taxRatePercent, variants } = req.body;

    const result = await db.transaction(async (tx) => {
      // 1. Insert product
      await tx.insert(products).values({
        title,
        slug,
        description,
        brandId,
        categoryId,
        taxRatePercent: taxRatePercent ? String(taxRatePercent) : '0.00',
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
