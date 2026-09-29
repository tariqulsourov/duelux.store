import { Router, Request, Response } from 'express';
import { db, outlets } from '@duelux/db';
import { eq } from 'drizzle-orm';

export const outletsRouter = Router();

outletsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(outlets).where(eq(outlets.isActive, true));
    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

outletsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { code, name, phone, email, addressLine1, city, isWarehouse, receiptHeader, receiptFooter } = req.body;

    const [outlet] = await db.insert(outlets).values({
      code,
      name,
      phone,
      email,
      addressLine1,
      city,
      isWarehouse: !!isWarehouse,
      receiptHeader,
      receiptFooter,
    });

    res.status(201).json({ success: true, data: outlet });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});
