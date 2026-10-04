import { Router, Request, Response } from 'express';
import { db, orders, orderItems, orderPayments, customers, courierConsignments, productVariants, products, inventoryLevels, inventoryLedger, outlets, users } from '@duelux/db';
import { eq, desc, sql, and } from 'drizzle-orm';
import { InventoryLedgerService } from '../services/inventory-ledger.service.js';
import { InventoryEventType, SalesChannel } from '@duelux/shared';

export const adminRouter = Router();

/**
 * Overview KPI Statistics
 * GET /api/v1/admin/stats
 */
adminRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    const allOrders = await db.select().from(orders);

    let totalRevenue = 0;
    let posOrdersCount = 0;
    let webOrdersCount = 0;

    for (const ord of allOrders) {
      totalRevenue += Number(ord.grandTotal);
      if (ord.channel === SalesChannel.POS_IN_STORE) posOrdersCount++;
      if (ord.channel === SalesChannel.ECOMMERCE_WEB) webOrdersCount++;
    }

    const allVariants = await db.select().from(productVariants);
    const allLevels = await db.select().from(inventoryLevels);

    let lowStockCount = 0;
    for (const lvl of allLevels) {
      if (Number(lvl.onHandQty) <= Number(lvl.safetyStockBuffer)) {
        lowStockCount++;
      }
    }

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrdersCount: allOrders.length,
        posOrdersCount,
        webOrdersCount,
        totalSkusCount: allVariants.length,
        lowStockCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Multi-Channel Orders List
 * GET /api/v1/admin/orders
 */
adminRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const ordersList = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      limit: 50,
      with: {
        customer: true,
        items: true,
        payments: true,
        courierConsignment: true,
        outlet: true,
      },
    });

    res.json({ success: true, data: ordersList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Stock Audit / Inventory Adjustment (Cycle Count & Damaged Write-off)
 * POST /api/v1/admin/inventory/adjust
 */
adminRouter.post('/inventory/adjust', async (req: Request, res: Response) => {
  try {
    const { variantId, outletId, quantity, eventType = 'CYCLE_COUNT_ADJUST', notes, userId } = req.body;

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty === 0) {
      res.status(400).json({ success: false, message: 'Invalid quantity adjustment' });
      return;
    }

    let result;
    if (numQty > 0) {
      result = await InventoryLedgerService.addStockAtomic({
        variantId,
        outletId,
        quantity: numQty,
        eventType: eventType as InventoryEventType,
        referenceType: 'MANUAL',
        referenceId: `ADJ-${Date.now()}`,
        userId,
        notes: notes || 'Admin Stock Correction',
      });
    } else {
      result = await InventoryLedgerService.deductStockAtomic({
        variantId,
        outletId,
        quantity: Math.abs(numQty),
        eventType: eventType as InventoryEventType,
        referenceType: 'MANUAL',
        referenceId: `ADJ-${Date.now()}`,
        userId,
        notes: notes || 'Admin Stock Correction',
      });
    }

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Recent Global Audit Ledger Feed
 * GET /api/v1/admin/ledger
 */
adminRouter.get('/ledger', async (req: Request, res: Response) => {
  try {
    const ledgerEntries = await db
      .select({
        id: inventoryLedger.id,
        variantId: inventoryLedger.variantId,
        outletId: inventoryLedger.outletId,
        changeQty: inventoryLedger.changeQty,
        resultingOnHand: inventoryLedger.resultingOnHand,
        eventType: inventoryLedger.eventType,
        referenceType: inventoryLedger.referenceType,
        referenceId: inventoryLedger.referenceId,
        notes: inventoryLedger.notes,
        createdAt: inventoryLedger.createdAt,
        variantTitle: productVariants.title,
        sku: productVariants.sku,
        productTitle: products.title,
        outletName: outlets.name,
      })
      .from(inventoryLedger)
      .innerJoin(productVariants, eq(inventoryLedger.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .innerJoin(outlets, eq(inventoryLedger.outletId, outlets.id))
      .orderBy(desc(inventoryLedger.createdAt))
      .limit(100);

    res.json({ success: true, data: ledgerEntries });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
