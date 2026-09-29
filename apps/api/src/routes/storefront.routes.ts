import { Router, Request, Response } from 'express';
import { db, products, productVariants, inventoryLevels, inventoryLedger, orders, orderItems, orderPayments, deliveryZones, courierConsignments, outlets, customers, customerAddresses } from '@duelux/db';
import { eq, and, sql, desc } from 'drizzle-orm';
import { SalesChannel, OrderStatus, PaymentStatus, TenderType, InventoryEventType, MoneyUtil } from '@duelux/shared';
import Decimal from 'decimal.js';

export const storefrontRouter = Router();

/**
 * List Public Delivery Zones
 * GET /api/v1/storefront/delivery-zones
 */
storefrontRouter.get('/delivery-zones', async (req: Request, res: Response) => {
  try {
    const zones = await db.select().from(deliveryZones).where(eq(deliveryZones.isActive, true));

    // If empty in DB, provide default zones
    if (zones.length === 0) {
      const defaultZones = [
        { id: 'zone-inside-dhaka', name: 'Inside Dhaka', city: 'Dhaka', baseRate: '60.0000', estimatedDays: 1, isActive: true },
        { id: 'zone-outside-dhaka', name: 'Outside Dhaka', city: 'All Districts', baseRate: '120.0000', estimatedDays: 3, isActive: true },
        { id: 'zone-express-dhaka', name: 'Dhaka Express (Same-Day)', city: 'Dhaka', baseRate: '150.0000', estimatedDays: 1, isActive: true },
      ];
      res.json({ success: true, data: defaultZones });
      return;
    }

    res.json({ success: true, data: zones });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Atomically Reserve Stock for Checkout (Prevents overselling against concurrent POS counter checkouts)
 * POST /api/v1/storefront/checkout/reserve
 */
storefrontRouter.post('/checkout/reserve', async (req: Request, res: Response) => {
  try {
    const { variantId, quantity = 1, outletId } = req.body;

    // Use default warehouse or flagship store outlet
    const targetOutletId = outletId || '87b12521-bbd7-11f1-a3cb-20c19b705e3f';

    const result = await db.transaction(async (tx) => {
      const [level] = await tx
        .select()
        .from(inventoryLevels)
        .where(
          and(
            eq(inventoryLevels.variantId, variantId),
            eq(inventoryLevels.outletId, targetOutletId)
          )
        )
        .for('update'); // Lock row in InnoDB

      if (!level) {
        throw new Error('Stock record not found for variant');
      }

      const onHand = Number(level.onHandQty);
      const reserved = Number(level.reservedQty);
      const buffer = Number(level.safetyStockBuffer);
      const sellableOnline = onHand - reserved - buffer;

      if (sellableOnline < Number(quantity)) {
        throw new Error(`Insufficient stock for online purchase. Available: ${Math.max(0, sellableOnline)}`);
      }

      // Increment reserved quantity
      const newReserved = reserved + Number(quantity);
      await tx
        .update(inventoryLevels)
        .set({
          reservedQty: MoneyUtil.toDbDecimal(newReserved),
          updatedAt: new Date(),
        })
        .where(eq(inventoryLevels.id, level.id));

      // Append reservation ledger entry
      await tx.insert(inventoryLedger).values({
        variantId,
        outletId: targetOutletId,
        changeQty: MoneyUtil.toDbDecimal(quantity),
        resultingOnHand: MoneyUtil.toDbDecimal(onHand),
        eventType: InventoryEventType.RESERVATION_HOLD,
        referenceType: 'ORDER',
        referenceId: 'WEB-RESERVATION',
        notes: `Reserved for active online checkout`,
      });

      return {
        variantId,
        reservedQty: newReserved,
        ttlSeconds: 600, // 10 minute checkout hold
      };
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Place E-Commerce Order (Multi-Channel Online Storefront)
 * POST /api/v1/storefront/checkout/order
 */
storefrontRouter.post('/checkout/order', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      city,
      zoneName,
      shippingCharge = 60,
      paymentMethod = 'COD', // COD, BKASH, CARD
      items,
      notes,
    } = req.body;

    if (!customerPhone || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Missing required customer or items data' });
      return;
    }

    const defaultOutletId = '87b12521-bbd7-11f1-a3cb-20c19b705e3f'; // Central Flagship Store

    const checkoutResult = await db.transaction(async (tx) => {
      // 1. Resolve or Create Customer by Phone Number
      let [existingCustomer] = await tx
        .select()
        .from(customers)
        .where(eq(customers.phone, customerPhone))
        .limit(1);

      let customerId: string;
      if (!existingCustomer) {
        const [insertedCust] = await tx.insert(customers).values({
          phone: customerPhone,
          firstName: customerName || 'Valued Customer',
          email: customerEmail,
        });
        const [created] = await tx.select().from(customers).where(eq(customers.phone, customerPhone));
        customerId = created.id;
      } else {
        customerId = existingCustomer.id;
      }

      // 2. Compute Item Totals and Deduct Inventory Atomically
      let subtotal = new Decimal(0);
      let taxTotal = new Decimal(0);
      const preparedLines: any[] = [];

      for (const item of items) {
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

        const qty = new Decimal(item.quantity || 1);
        const unitPrice = new Decimal(variantData.variant.sellingPrice);
        const lineBase = unitPrice.times(qty);

        let lineTax = new Decimal(0);
        if (!variantData.product.isTaxExempt && Number(variantData.product.taxRatePercent) > 0) {
          lineTax = MoneyUtil.calculateTax(lineBase, variantData.product.taxRatePercent);
        }

        subtotal = subtotal.plus(lineBase);
        taxTotal = taxTotal.plus(lineTax);

        preparedLines.push({
          variantId: variantData.variant.id,
          sku: variantData.variant.sku,
          productTitle: variantData.product.title,
          variantTitle: variantData.variant.title,
          quantity: qty,
          unitPrice,
          taxAmount: lineTax,
          totalPrice: lineBase.plus(lineTax),
        });

        // 3. Atomically Lock and Deduct Inventory in MySQL
        const [level] = await tx
          .select()
          .from(inventoryLevels)
          .where(
            and(
              eq(inventoryLevels.variantId, variantData.variant.id),
              eq(inventoryLevels.outletId, defaultOutletId)
            )
          )
          .for('update');

        if (!level || Number(level.onHandQty) < qty.toNumber()) {
          throw new Error(`Insufficient stock for ${variantData.product.title}`);
        }

        const currentOnHand = Number(level.onHandQty);
        const currentReserved = Number(level.reservedQty);
        const newOnHand = currentOnHand - qty.toNumber();
        const newReserved = Math.max(0, currentReserved - qty.toNumber()); // Release reservation

        await tx
          .update(inventoryLevels)
          .set({
            onHandQty: MoneyUtil.toDbDecimal(newOnHand),
            reservedQty: MoneyUtil.toDbDecimal(newReserved),
            updatedAt: new Date(),
          })
          .where(eq(inventoryLevels.id, level.id));

        // Append to immutable inventory ledger
        await tx.insert(inventoryLedger).values({
          variantId: variantData.variant.id,
          outletId: defaultOutletId,
          changeQty: MoneyUtil.toDbDecimal(-qty.toNumber()),
          resultingOnHand: MoneyUtil.toDbDecimal(newOnHand),
          eventType: InventoryEventType.ONLINE_SALE,
          referenceType: 'ORDER',
          referenceId: 'WEB-ORDER-PENDING',
          notes: 'Fulfilled via Online E-Commerce Storefront',
        });
      }

      const shippingDec = new Decimal(shippingCharge);
      const grandTotal = subtotal.plus(taxTotal).plus(shippingDec);

      // 4. Create Order
      const orderNumber = `WEB-${Date.now().toString().slice(-8)}`;

      await tx.insert(orders).values({
        orderNumber,
        channel: SalesChannel.ECOMMERCE_WEB,
        outletId: defaultOutletId,
        customerId,
        status: OrderStatus.CONFIRMED,
        paymentStatus: paymentMethod === 'COD' ? PaymentStatus.PENDING : PaymentStatus.PAID,
        subtotal: MoneyUtil.toDbDecimal(subtotal),
        discountTotal: '0.0000',
        taxTotal: MoneyUtil.toDbDecimal(taxTotal),
        shippingCharge: MoneyUtil.toDbDecimal(shippingDec),
        grandTotal: MoneyUtil.toDbDecimal(grandTotal),
        paidAmount: paymentMethod === 'COD' ? '0.0000' : MoneyUtil.toDbDecimal(grandTotal),
        changeGiven: '0.0000',
        notes: `Zone: ${zoneName || 'Standard'} | ${notes || 'Online order'}`,
      });

      const [createdOrder] = await tx.select().from(orders).where(eq(orders.orderNumber, orderNumber));

      // 5. Insert Line Items
      for (const line of preparedLines) {
        await tx.insert(orderItems).values({
          orderId: createdOrder.id,
          variantId: line.variantId,
          sku: line.sku,
          productTitle: line.productTitle,
          variantTitle: line.variantTitle,
          quantity: MoneyUtil.toDbDecimal(line.quantity),
          unitPrice: MoneyUtil.toDbDecimal(line.unitPrice),
          discountAmount: '0.0000',
          taxAmount: MoneyUtil.toDbDecimal(line.taxAmount),
          totalPrice: MoneyUtil.toDbDecimal(line.totalPrice),
        });
      }

      // 6. Create Courier Draft Consignment
      const trackingNumber = `TRK-${Date.now().toString().slice(-6)}`;
      await tx.insert(courierConsignments).values({
        orderId: createdOrder.id,
        courierName: 'Steadfast Courier',
        trackingNumber,
        status: 'BOOKED',
        shippingCharge: MoneyUtil.toDbDecimal(shippingDec),
        codAmountToCollect: paymentMethod === 'COD' ? MoneyUtil.toDbDecimal(grandTotal) : '0.0000',
      });

      return {
        orderId: createdOrder.id,
        orderNumber,
        trackingNumber,
        grandTotal: grandTotal.toFixed(2),
        paymentMethod,
      };
    });

    res.status(201).json({ success: true, data: checkoutResult });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});
