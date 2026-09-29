import { Router, Request, Response } from 'express';
import { PosService } from '../services/pos.service.js';

export const posRouter = Router();

/**
 * Fast Barcode Scan Interceptor Endpoint
 * GET /api/v1/pos/scan/:barcode?outletId=...
 */
posRouter.get('/scan/:barcode', async (req: Request, res: Response) => {
  try {
    const barcode = String(req.params.barcode);
    const outletId = (req.query.outletId as string) || (req.headers['x-outlet-id'] as string);

    if (!outletId) {
      res.status(400).json({ success: false, message: 'outletId is required' });
      return;
    }

    const item = await PosService.scanBarcode(barcode, outletId);

    if (!item) {
      res.status(404).json({ success: false, message: `Barcode/SKU ${barcode} not found` });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Open POS Register Shift
 * POST /api/v1/pos/shifts/open
 */
posRouter.post('/shifts/open', async (req: Request, res: Response) => {
  try {
    const { registerId, outletId, cashierId, openingFloat } = req.body;
    const shift = await PosService.openShift({ registerId, outletId, cashierId, openingFloat });
    res.status(201).json({ success: true, data: shift });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Cash Drawer Event (Cash-In, Cash-Out, No-Sale)
 * POST /api/v1/pos/shifts/drawer-event
 */
posRouter.post('/shifts/drawer-event', async (req: Request, res: Response) => {
  try {
    const { shiftId, cashierId, eventType, amount, reason } = req.body;
    await PosService.recordDrawerEvent({ shiftId, cashierId, eventType, amount, reason });
    res.json({ success: true, message: 'Drawer event recorded' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Close POS Register Shift (Z-Report)
 * POST /api/v1/pos/shifts/close
 */
posRouter.post('/shifts/close', async (req: Request, res: Response) => {
  try {
    const { shiftId, countedCash, notes } = req.body;
    const summary = await PosService.closeShift({ shiftId, countedCash, notes });
    res.json({ success: true, data: summary });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Process POS Counter Checkout (Split Tender + Atomic Stock Deduction)
 * POST /api/v1/pos/checkout
 */
posRouter.post('/checkout', async (req: Request, res: Response) => {
  try {
    const checkoutResult = await PosService.processCheckout(req.body);
    res.status(201).json({ success: true, data: checkoutResult });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * Generate ESC/POS Thermal Receipt Payload
 * GET /api/v1/pos/receipt/:orderId/escpos
 */
posRouter.get('/receipt/:orderId/escpos', async (req: Request, res: Response) => {
  try {
    const orderId = String(req.params.orderId);
    const escposRaw = await PosService.generateEscPosReceipt(orderId);
    res.setHeader('Content-Type', 'text/plain; charset=binary');
    res.send(escposRaw);
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
});
