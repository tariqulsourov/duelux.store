import { db, inventoryLevels, inventoryLedger, type DatabaseInstance } from '@duelux/db';
import { eq, and, sql } from 'drizzle-orm';
import { InventoryEventType, MoneyUtil } from '@duelux/shared';

export interface DeductStockParams {
  variantId: string;
  outletId: string;
  quantity: string | number; // Exact amount e.g. "1.0000"
  eventType: InventoryEventType;
  referenceType: 'ORDER' | 'MANUAL' | 'TRANSFER';
  referenceId: string;
  userId?: string;
  notes?: string;
}

export interface AddStockParams {
  variantId: string;
  outletId: string;
  quantity: string | number;
  eventType: InventoryEventType;
  referenceType: 'PURCHASE_ORDER' | 'MANUAL' | 'TRANSFER' | 'RETURN';
  referenceId: string;
  userId?: string;
  notes?: string;
}

export class InventoryLedgerService {
  /**
   * Concurrency-Safe Stock Deduction using MySQL Row-Level Exclusive Lock (FOR UPDATE)
   */
  static async deductStockAtomic(params: DeductStockParams, externalTx?: Parameters<Parameters<DatabaseInstance['transaction']>[0]>[0]) {
    const executeInTransaction = async (tx: any) => {
      const qtyToDeduct = Number(params.quantity);
      if (qtyToDeduct <= 0) {
        throw new Error('Quantity to deduct must be greater than zero');
      }

      // 1. Lock the inventory row for update
      const [currentLevel] = await tx
        .select()
        .from(inventoryLevels)
        .where(
          and(
            eq(inventoryLevels.variantId, params.variantId),
            eq(inventoryLevels.outletId, params.outletId)
          )
        )
        .for('update');

      if (!currentLevel) {
        throw new Error(`Inventory record not found for variant ${params.variantId} at outlet ${params.outletId}`);
      }

      const onHand = Number(currentLevel.onHandQty);
      const reserved = Number(currentLevel.reservedQty);
      const available = onHand - reserved;

      if (available < qtyToDeduct) {
        throw new Error(
          `Insufficient stock for variant ${params.variantId}. Available: ${available}, Requested: ${qtyToDeduct}`
        );
      }

      const newOnHand = onHand - qtyToDeduct;
      const newOnHandStr = MoneyUtil.toDbDecimal(newOnHand);

      // 2. Decrement on-hand level
      await tx
        .update(inventoryLevels)
        .set({
          onHandQty: newOnHandStr,
          updatedAt: new Date(),
        })
        .where(eq(inventoryLevels.id, currentLevel.id));

      // 3. Append to immutable inventory ledger
      const changeQtyStr = MoneyUtil.toDbDecimal(-qtyToDeduct);
      await tx.insert(inventoryLedger).values({
        variantId: params.variantId,
        outletId: params.outletId,
        changeQty: changeQtyStr,
        resultingOnHand: newOnHandStr,
        eventType: params.eventType,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        notes: params.notes,
        createdByUserId: params.userId,
      });

      return {
        variantId: params.variantId,
        outletId: params.outletId,
        previousOnHand: onHand,
        newOnHand,
      };
    };

    if (externalTx) {
      return executeInTransaction(externalTx);
    }
    return db.transaction(executeInTransaction);
  }

  /**
   * Add stock (Purchase Receipts, Returns, Cycle Count surplus)
   */
  static async addStockAtomic(params: AddStockParams, externalTx?: Parameters<Parameters<DatabaseInstance['transaction']>[0]>[0]) {
    const executeInTransaction = async (tx: any) => {
      const qtyToAdd = Number(params.quantity);
      if (qtyToAdd <= 0) {
        throw new Error('Quantity to add must be greater than zero');
      }

      // Check if inventory level row exists
      const [existingLevel] = await tx
        .select()
        .from(inventoryLevels)
        .where(
          and(
            eq(inventoryLevels.variantId, params.variantId),
            eq(inventoryLevels.outletId, params.outletId)
          )
        )
        .for('update');

      let newOnHand: number;
      let levelId: string;

      if (existingLevel) {
        const onHand = Number(existingLevel.onHandQty);
        newOnHand = onHand + qtyToAdd;
        levelId = existingLevel.id;

        await tx
          .update(inventoryLevels)
          .set({
            onHandQty: MoneyUtil.toDbDecimal(newOnHand),
            updatedAt: new Date(),
          })
          .where(eq(inventoryLevels.id, levelId));
      } else {
        newOnHand = qtyToAdd;
        const [insertResult] = await tx.insert(inventoryLevels).values({
          variantId: params.variantId,
          outletId: params.outletId,
          onHandQty: MoneyUtil.toDbDecimal(newOnHand),
          reservedQty: '0.0000',
          safetyStockBuffer: '0.0000',
        });
      }

      const changeQtyStr = MoneyUtil.toDbDecimal(qtyToAdd);
      const newOnHandStr = MoneyUtil.toDbDecimal(newOnHand);

      // Append to ledger
      await tx.insert(inventoryLedger).values({
        variantId: params.variantId,
        outletId: params.outletId,
        changeQty: changeQtyStr,
        resultingOnHand: newOnHandStr,
        eventType: params.eventType,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        notes: params.notes,
        createdByUserId: params.userId,
      });

      return {
        variantId: params.variantId,
        outletId: params.outletId,
        newOnHand,
      };
    };

    if (externalTx) {
      return executeInTransaction(externalTx);
    }
    return db.transaction(executeInTransaction);
  }
}
