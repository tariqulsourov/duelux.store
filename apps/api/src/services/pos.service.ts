import {
  db,
  productVariants,
  products,
  barcodeAliases,
  inventoryLevels,
  posRegisterShifts,
  posRegisters,
  cashDrawerEvents,
  orders,
  orderItems,
  orderPayments,
  outlets,
} from '@duelux/db';
import { eq, or, and, sql } from 'drizzle-orm';
import {
  SalesChannel,
  OrderStatus,
  PaymentStatus,
  TenderType,
  InventoryEventType,
  ShiftStatus,
  CashDrawerEventType,
  MoneyUtil,
} from '@duelux/shared';
import { InventoryLedgerService } from './inventory-ledger.service.js';
import Decimal from 'decimal.js';

export interface PosCheckoutItemInput {
  variantId: string;
  quantity: number | string;
  unitPrice?: number | string; // If cashier override allowed, otherwise taken from variant
  discountAmount?: number | string;
}

export interface PosPaymentTenderInput {
  tenderType: TenderType;
  amount: number | string;
  transactionRef?: string;
  details?: Record<string, any>;
}

export interface PosCheckoutInput {
  outletId: string;
  shiftId: string;
  cashierId: string;
  customerId?: string;
  items: PosCheckoutItemInput[];
  payments: PosPaymentTenderInput[];
  notes?: string;
}

export class PosService {
  /**
   * Fast Barcode Scan Resolution for USB Scanners
   * Checks variant barcode, SKU, and barcode aliases in one query
   */
  static async scanBarcode(barcode: string, outletId: string) {
    const cleanedCode = barcode.trim();

    // 1. Direct variant barcode or SKU match
    const [variantMatch] = await db
      .select({
        variant: productVariants,
        product: products,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(
        and(
          eq(products.isActive, true),
          eq(productVariants.isActive, true),
          or(
            eq(productVariants.barcode, cleanedCode),
            eq(productVariants.sku, cleanedCode)
          )
        )
      )
      .limit(1);

    let resolvedVariantId: string | null = null;
    let resolvedProduct: typeof products.$inferSelect | null = null;
    let resolvedVariant: typeof productVariants.$inferSelect | null = null;

    if (variantMatch) {
      resolvedVariantId = variantMatch.variant.id;
      resolvedProduct = variantMatch.product;
      resolvedVariant = variantMatch.variant;
    } else {
      // 2. Check barcode aliases (vendor barcodes, alternate labels)
      const [aliasMatch] = await db
        .select({
          alias: barcodeAliases,
          variant: productVariants,
          product: products,
        })
        .from(barcodeAliases)
        .innerJoin(productVariants, eq(barcodeAliases.variantId, productVariants.id))
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(
          and(
            eq(barcodeAliases.barcode, cleanedCode),
            eq(products.isActive, true),
            eq(productVariants.isActive, true)
          )
        )
        .limit(1);

      if (aliasMatch) {
        resolvedVariantId = aliasMatch.variant.id;
        resolvedProduct = aliasMatch.product;
        resolvedVariant = aliasMatch.variant;
      }
    }

    if (!resolvedVariantId || !resolvedProduct || !resolvedVariant) {
      return null;
    }

    // 3. Fetch real-time on-hand stock at current outlet
    const [stockLevel] = await db
      .select()
      .from(inventoryLevels)
      .where(
        and(
          eq(inventoryLevels.variantId, resolvedVariantId),
          eq(inventoryLevels.outletId, outletId)
        )
      )
      .limit(1);

    const onHandQty = stockLevel ? Number(stockLevel.onHandQty) : 0;
    const reservedQty = stockLevel ? Number(stockLevel.reservedQty) : 0;
    const availableQty = onHandQty - reservedQty;

    return {
      variantId: resolvedVariant.id,
      productId: resolvedProduct.id,
      productTitle: resolvedProduct.title,
      variantTitle: resolvedVariant.title,
      sku: resolvedVariant.sku,
      barcode: resolvedVariant.barcode,
      sellingPrice: resolvedVariant.sellingPrice,
      taxRatePercent: resolvedProduct.taxRatePercent,
      isTaxExempt: resolvedProduct.isTaxExempt,
      availableQty,
      onHandQty,
    };
  }

  /**
   * Open POS Shift
   */
  static async openShift(params: {
    registerId: string;
    outletId: string;
    cashierId: string;
    openingFloat: string | number;
  }) {
    // Check if cashier or register already has an active open shift
    const [existingOpen] = await db
      .select()
      .from(posRegisterShifts)
      .where(
        and(
          eq(posRegisterShifts.registerId, params.registerId),
          eq(posRegisterShifts.status, ShiftStatus.OPEN)
        )
      )
      .limit(1);

    if (existingOpen) {
      throw new Error(`Register is already in an open shift (Shift ID: ${existingOpen.id})`);
    }

    const floatStr = MoneyUtil.toDbDecimal(params.openingFloat);

    const [shift] = await db.insert(posRegisterShifts).values({
      registerId: params.registerId,
      outletId: params.outletId,
      cashierId: params.cashierId,
      openingFloat: floatStr,
      expectedCash: floatStr,
      status: ShiftStatus.OPEN,
    });

    return shift;
  }

  /**
   * Cash Drawer Adjustment (Cash-In / Cash-Out / No-Sale)
   */
  static async recordDrawerEvent(params: {
    shiftId: string;
    cashierId: string;
    eventType: CashDrawerEventType;
    amount: string | number;
    reason?: string;
  }) {
    const amountStr = MoneyUtil.toDbDecimal(params.amount);

    return db.transaction(async (tx) => {
      const [shift] = await tx
        .select()
        .from(posRegisterShifts)
        .where(eq(posRegisterShifts.id, params.shiftId))
        .for('update');

      if (!shift || shift.status !== ShiftStatus.OPEN) {
        throw new Error('Active open shift not found');
      }

      await tx.insert(cashDrawerEvents).values({
        shiftId: params.shiftId,
        cashierId: params.cashierId,
        eventType: params.eventType,
        amount: amountStr,
        reason: params.reason,
      });

      const numAmount = Number(params.amount);
      if (params.eventType === CashDrawerEventType.CASH_IN) {
        const newCashIn = Number(shift.cashInTotal) + numAmount;
        const newExpected = Number(shift.expectedCash) + numAmount;
        await tx
          .update(posRegisterShifts)
          .set({
            cashInTotal: MoneyUtil.toDbDecimal(newCashIn),
            expectedCash: MoneyUtil.toDbDecimal(newExpected),
          })
          .where(eq(posRegisterShifts.id, params.shiftId));
      } else if (params.eventType === CashDrawerEventType.CASH_OUT) {
        const newCashOut = Number(shift.cashOutTotal) + numAmount;
        const newExpected = Number(shift.expectedCash) - numAmount;
        await tx
          .update(posRegisterShifts)
          .set({
            cashOutTotal: MoneyUtil.toDbDecimal(newCashOut),
            expectedCash: MoneyUtil.toDbDecimal(newExpected),
          })
          .where(eq(posRegisterShifts.id, params.shiftId));
      }
    });
  }

  /**
   * Close POS Shift (Z-Report generation & Cash Variance Reconciliation)
   */
  static async closeShift(params: {
    shiftId: string;
    countedCash: string | number;
    notes?: string;
  }) {
    return db.transaction(async (tx) => {
      const [shift] = await tx
        .select()
        .from(posRegisterShifts)
        .where(eq(posRegisterShifts.id, params.shiftId))
        .for('update');

      if (!shift || shift.status !== ShiftStatus.OPEN) {
        throw new Error('Shift is already closed or does not exist');
      }

      const counted = new Decimal(params.countedCash);
      const expected = new Decimal(shift.expectedCash);
      const variance = counted.minus(expected);

      await tx
        .update(posRegisterShifts)
        .set({
          closedAt: new Date(),
          countedCash: MoneyUtil.toDbDecimal(counted),
          variance: MoneyUtil.toDbDecimal(variance),
          status: ShiftStatus.CLOSED,
          notes: params.notes,
        })
        .where(eq(posRegisterShifts.id, params.shiftId));

      return {
        shiftId: shift.id,
        openingFloat: shift.openingFloat,
        cashSales: shift.cashSales,
        cashIn: shift.cashInTotal,
        cashOut: shift.cashOutTotal,
        expectedCash: expected.toFixed(4),
        countedCash: counted.toFixed(4),
        variance: variance.toFixed(4),
      };
    });
  }

  /**
   * High-Velocity POS Counter Checkout with Split-Tender & Atomic Inventory Deduction
   */
  static async processCheckout(input: PosCheckoutInput) {
    return db.transaction(async (tx) => {
      // 1. Verify Active Shift
      const [shift] = await tx
        .select()
        .from(posRegisterShifts)
        .where(eq(posRegisterShifts.id, input.shiftId))
        .for('update');

      if (!shift || shift.status !== ShiftStatus.OPEN) {
        throw new Error('Cannot checkout: POS shift is not open');
      }

      // 2. Resolve items, compute line prices and totals
      let subtotal = new Decimal(0);
      let discountTotal = new Decimal(0);
      let taxTotal = new Decimal(0);
      const preparedLines: Array<{
        variantId: string;
        sku: string;
        productTitle: string;
        variantTitle: string;
        quantity: Decimal;
        unitPrice: Decimal;
        discountAmount: Decimal;
        taxAmount: Decimal;
        totalPrice: Decimal;
      }> = [];

      for (const item of input.items) {
        const [variantData] = await tx
          .select({
            variant: productVariants,
            product: products,
          })
          .from(productVariants)
          .innerJoin(products, eq(productVariants.productId, products.id))
          .where(eq(productVariants.id, item.variantId));

        if (!variantData) {
          throw new Error(`Variant not found: ${item.variantId}`);
        }

        const qty = new Decimal(item.quantity);
        const unitPrice = item.unitPrice ? new Decimal(item.unitPrice) : new Decimal(variantData.variant.sellingPrice);
        const lineDiscount = item.discountAmount ? new Decimal(item.discountAmount) : new Decimal(0);

        const baseTotal = unitPrice.times(qty).minus(lineDiscount);

        let lineTax = new Decimal(0);
        if (!variantData.product.isTaxExempt && Number(variantData.product.taxRatePercent) > 0) {
          lineTax = MoneyUtil.calculateTax(baseTotal, variantData.product.taxRatePercent);
        }

        const lineFinal = baseTotal.plus(lineTax);

        subtotal = subtotal.plus(unitPrice.times(qty));
        discountTotal = discountTotal.plus(lineDiscount);
        taxTotal = taxTotal.plus(lineTax);

        preparedLines.push({
          variantId: variantData.variant.id,
          sku: variantData.variant.sku,
          productTitle: variantData.product.title,
          variantTitle: variantData.variant.title,
          quantity: qty,
          unitPrice,
          discountAmount: lineDiscount,
          taxAmount: lineTax,
          totalPrice: lineFinal,
        });
      }

      const grandTotal = subtotal.minus(discountTotal).plus(taxTotal);

      // 3. Validate split-tender payments
      let totalPaid = new Decimal(0);
      let cashTendered = new Decimal(0);
      let cardTendered = new Decimal(0);
      let mobileTendered = new Decimal(0);

      for (const payment of input.payments) {
        const pAmount = new Decimal(payment.amount);
        totalPaid = totalPaid.plus(pAmount);

        if (payment.tenderType === TenderType.CASH) {
          cashTendered = cashTendered.plus(pAmount);
        } else if (payment.tenderType === TenderType.CARD) {
          cardTendered = cardTendered.plus(pAmount);
        } else if (payment.tenderType === TenderType.MOBILE_WALLET) {
          mobileTendered = mobileTendered.plus(pAmount);
        }
      }

      if (totalPaid.lessThan(grandTotal)) {
        throw new Error(
          `Insufficient payment. Grand Total: ${grandTotal.toFixed(2)}, Tendered: ${totalPaid.toFixed(2)}`
        );
      }

      const changeGiven = totalPaid.minus(grandTotal);
      const netCashToKeep = cashTendered.minus(changeGiven);

      // 4. Generate unique Order Number
      const orderNumber = `POS-${Date.now().toString().slice(-8)}`;

      // 5. Insert Order
      const [orderResult] = await tx.insert(orders).values({
        orderNumber,
        channel: SalesChannel.POS_IN_STORE,
        outletId: input.outletId,
        customerId: input.customerId,
        registerShiftId: input.shiftId,
        cashierId: input.cashierId,
        status: OrderStatus.DELIVERED, // Instantly fulfilled at counter
        paymentStatus: PaymentStatus.PAID,
        subtotal: MoneyUtil.toDbDecimal(subtotal),
        discountTotal: MoneyUtil.toDbDecimal(discountTotal),
        taxTotal: MoneyUtil.toDbDecimal(taxTotal),
        shippingCharge: '0.0000',
        grandTotal: MoneyUtil.toDbDecimal(grandTotal),
        paidAmount: MoneyUtil.toDbDecimal(totalPaid),
        changeGiven: MoneyUtil.toDbDecimal(changeGiven),
        notes: input.notes,
      });

      // Retrieve inserted order ID
      const [createdOrder] = await tx
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderNumber));

      // 6. Insert Order Items & Deduct Stock Atomically
      for (const line of preparedLines) {
        await tx.insert(orderItems).values({
          orderId: createdOrder.id,
          variantId: line.variantId,
          sku: line.sku,
          productTitle: line.productTitle,
          variantTitle: line.variantTitle,
          quantity: MoneyUtil.toDbDecimal(line.quantity),
          unitPrice: MoneyUtil.toDbDecimal(line.unitPrice),
          discountAmount: MoneyUtil.toDbDecimal(line.discountAmount),
          taxAmount: MoneyUtil.toDbDecimal(line.taxAmount),
          totalPrice: MoneyUtil.toDbDecimal(line.totalPrice),
        });

        // Deduct inventory atomically with ledger entry
        await InventoryLedgerService.deductStockAtomic(
          {
            variantId: line.variantId,
            outletId: input.outletId,
            quantity: line.quantity.toString(),
            eventType: InventoryEventType.POS_SALE,
            referenceType: 'ORDER',
            referenceId: createdOrder.id,
            userId: input.cashierId,
            notes: `POS checkout ticket ${orderNumber}`,
          },
          tx
        );
      }

      // 7. Insert Payment Tender Records
      for (const payment of input.payments) {
        await tx.insert(orderPayments).values({
          orderId: createdOrder.id,
          tenderType: payment.tenderType,
          amount: MoneyUtil.toDbDecimal(payment.amount),
          transactionRef: payment.transactionRef,
          tenderDetailsJson: payment.details || {},
        });
      }

      // 8. Update POS Shift Cash Drawer Totals
      const updatedCashSales = new Decimal(shift.cashSales).plus(netCashToKeep);
      const updatedCardSales = new Decimal(shift.cardSales).plus(cardTendered);
      const updatedMobileSales = new Decimal(shift.mobileWalletSales).plus(mobileTendered);
      const updatedDiscounts = new Decimal(shift.totalDiscounts).plus(discountTotal);
      const updatedExpectedCash = new Decimal(shift.expectedCash).plus(netCashToKeep);

      await tx
        .update(posRegisterShifts)
        .set({
          cashSales: MoneyUtil.toDbDecimal(updatedCashSales),
          cardSales: MoneyUtil.toDbDecimal(updatedCardSales),
          mobileWalletSales: MoneyUtil.toDbDecimal(updatedMobileSales),
          totalDiscounts: MoneyUtil.toDbDecimal(updatedDiscounts),
          expectedCash: MoneyUtil.toDbDecimal(updatedExpectedCash),
        })
        .where(eq(posRegisterShifts.id, input.shiftId));

      return {
        orderId: createdOrder.id,
        orderNumber,
        grandTotal: grandTotal.toFixed(2),
        paidAmount: totalPaid.toFixed(2),
        changeGiven: changeGiven.toFixed(2),
      };
    });
  }

  /**
   * ESC/POS Thermal Receipt Byte/Command Generator (for 58mm/80mm USB Thermal Printers)
   */
  static async generateEscPosReceipt(orderId: string): Promise<string> {
    const [order] = await db
      .select({
        order: orders,
        outlet: outlets,
      })
      .from(orders)
      .innerJoin(outlets, eq(orders.outletId, outlets.id))
      .where(eq(orders.id, orderId));

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const payments = await db
      .select()
      .from(orderPayments)
      .where(eq(orderPayments.orderId, orderId));

    // Standard ESC/POS commands
    const ESC = '\x1B';
    const GS = '\x1D';
    const INIT = `${ESC}@`;
    const ALIGN_CENTER = `${ESC}a\x01`;
    const ALIGN_LEFT = `${ESC}a\x00`;
    const ALIGN_RIGHT = `${ESC}a\x02`;
    const BOLD_ON = `${ESC}E\x01`;
    const BOLD_OFF = `${ESC}E\x00`;
    const CUT = `${GS}V\x00`; // Full cut
    const DRAWER_KICK = `${ESC}p\x00\x19\xFA`; // RJ11 pulse to open drawer

    let receipt = INIT;
    // Drawer kick on checkout print
    receipt += DRAWER_KICK;

    // Header
    receipt += ALIGN_CENTER + BOLD_ON + `${order.outlet.name}\n` + BOLD_OFF;
    if (order.outlet.addressLine1) receipt += `${order.outlet.addressLine1}\n`;
    if (order.outlet.phone) receipt += `Tel: ${order.outlet.phone}\n`;
    receipt += '--------------------------------\n';
    receipt += ALIGN_LEFT;
    receipt += `Order: ${order.order.orderNumber}\n`;
    receipt += `Date:  ${new Date(order.order.createdAt).toLocaleString()}\n`;
    receipt += '--------------------------------\n';

    // Line Items
    for (const item of items) {
      const title = `${item.productTitle} (${item.variantTitle})`.substring(0, 32);
      const qtyPrice = `${Number(item.quantity)} x ${Number(item.unitPrice).toFixed(2)}`;
      const total = `${Number(item.totalPrice).toFixed(2)}`;
      receipt += `${title}\n`;
      receipt += `${qtyPrice.padEnd(20)}${total.padStart(12)}\n`;
    }
    receipt += '--------------------------------\n';

    // Summary
    receipt += ALIGN_RIGHT;
    receipt += `Subtotal: ${Number(order.order.subtotal).toFixed(2)}\n`;
    if (Number(order.order.discountTotal) > 0) {
      receipt += `Discount: -${Number(order.order.discountTotal).toFixed(2)}\n`;
    }
    if (Number(order.order.taxTotal) > 0) {
      receipt += `Tax: ${Number(order.order.taxTotal).toFixed(2)}\n`;
    }
    receipt += BOLD_ON + `TOTAL: ${Number(order.order.grandTotal).toFixed(2)}\n` + BOLD_OFF;

    for (const p of payments) {
      receipt += `${p.tenderType}: ${Number(p.amount).toFixed(2)}\n`;
    }
    receipt += `Change: ${Number(order.order.changeGiven).toFixed(2)}\n`;

    // Footer
    receipt += ALIGN_CENTER + '\n';
    if (order.outlet.receiptFooter) {
      receipt += `${order.outlet.receiptFooter}\n`;
    } else {
      receipt += 'Thank you for shopping with us!\n';
    }
    receipt += '\n\n\n' + CUT;

    return receipt;
  }
}
