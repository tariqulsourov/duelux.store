import { Router, Request, Response } from 'express';
import { db, inventoryLevels, inventoryLedger, productVariants, products, outlets } from '@duelux/db';
import { eq, and, desc } from 'drizzle-orm';
import { InventoryLedgerService } from '../services/inventory-ledger.service.js';
import { InventoryEventType } from '@duelux/shared';

export const inventoryRouter = Router();

/**
 * List All Inventory Levels across Outlets
 * GET /api/v1/inventory/levels
 */
inventoryRouter.get('/levels', async (req: Request, res: Response) => {
  try {
    const levels = await db
      .select({
        level: inventoryLevels,
        variant: productVariants,
        product: products,
        outlet: outlets,
      })
      .from(inventoryLevels)
      .innerJoin(productVariants, eq(inventoryLevels.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(outlets, eq(inventoryLevels.outletId, outlets.id));

    res.json({ success: true, data: levels });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * List Inventory Levels for an Outlet
 * GET /api/v1/inventory/levels/:outletId
 */
inventoryRouter.get('/levels/:outletId', async (req: Request, res: Response) => {
  try {
    const outletId = String(req.params.outletId);

    const levels = await db
      .select({
        level: inventoryLevels,
        variant: productVariants,
        product: products,
        outlet: outlets,
      })
      .from(inventoryLevels)
      .innerJoin(productVariants, eq(inventoryLevels.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(outlets, eq(inventoryLevels.outletId, outlets.id))
      .where(eq(inventoryLevels.outletId, outletId));

    res.json({ success: true, data: levels });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Receive Stock (Purchase Order / Goods Received Note)
 * POST /api/v1/inventory/receive
 */
inventoryRouter.post('/receive', async (req: Request, res: Response) => {
  try {
    const { variantId, outletId, quantity, referenceId, notes, userId } = req.body;

    const result = await InventoryLedgerService.addStockAtomic({
      variantId,
      outletId,
      quantity,
      eventType: InventoryEventType.PURCHASE_RECEIPT,
      referenceType: 'PURCHASE_ORDER',
      referenceId: referenceId || `GRN-${Date.now()}`,
      userId,
      notes,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * View Immutable Inventory Ledger for a Variant
 * GET /api/v1/inventory/ledger/:variantId
 */
inventoryRouter.get('/ledger/:variantId', async (req: Request, res: Response) => {
  try {
    const variantId = String(req.params.variantId);

    const history = await db
      .select()
      .from(inventoryLedger)
      .where(eq(inventoryLedger.variantId, variantId))
      .orderBy(desc(inventoryLedger.createdAt))
      .limit(100);

    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
