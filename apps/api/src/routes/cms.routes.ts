import { Router, Request, Response } from 'express';
import { db, homepageLayouts, pool } from '@duelux/db';
import { eq, or, desc } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { HeaderMenuItem, LayoutBlockConfig } from '@duelux/shared';

export const cmsRouter = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'cms');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const cleanName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    cb(null, `cms-${cleanName}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP, GIF, and SVG images are allowed'));
    }
  },
});

/**
 * List All Homepage Layouts
 * GET /api/v1/cms/layouts
 */
cmsRouter.get('/layouts', async (req: Request, res: Response) => {
  try {
    const list = await db
      .select()
      .from(homepageLayouts)
      .orderBy(desc(homepageLayouts.isActive), homepageLayouts.createdAt);

    res.json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get Active Homepage Layout for Storefront
 * GET /api/v1/cms/layouts/active
 */
cmsRouter.get('/layouts/active', async (req: Request, res: Response) => {
  try {
    const [active] = await db
      .select()
      .from(homepageLayouts)
      .where(eq(homepageLayouts.isActive, true))
      .limit(1);

    if (active) {
      return res.json({ success: true, data: active });
    }

    // Fallback to first available layout if none marked active
    const [fallback] = await db.select().from(homepageLayouts).limit(1);
    if (!fallback) {
      return res.status(404).json({ success: false, message: 'No homepage layouts found' });
    }

    res.json({ success: true, data: fallback });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get Single Homepage Layout by ID or Slug
 * GET /api/v1/cms/layouts/:idOrSlug
 */
cmsRouter.get('/layouts/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const idOrSlug = String(req.params.idOrSlug);
    const [layout] = await db
      .select()
      .from(homepageLayouts)
      .where(or(eq(homepageLayouts.id, idOrSlug), eq(homepageLayouts.slug, idOrSlug)))
      .limit(1);

    if (!layout) {
      return res.status(404).json({ success: false, message: 'Layout not found' });
    }

    res.json({ success: true, data: layout });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 1-Click Activate Homepage Layout
 * POST /api/v1/cms/layouts/:idOrSlug/activate
 */
cmsRouter.post('/layouts/:idOrSlug/activate', async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const idOrSlug = String(req.params.idOrSlug);

    await connection.beginTransaction();

    // Check if target exists
    const [check] = await connection.query(
      'SELECT id, name FROM homepage_layouts WHERE id = ? OR slug = ? LIMIT 1',
      [idOrSlug, idOrSlug]
    );

    const target = (check as any[])[0];
    if (!target) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Layout not found' });
    }

    // Deactivate all
    await connection.query('UPDATE homepage_layouts SET is_active = false');

    // Activate selected
    await connection.query('UPDATE homepage_layouts SET is_active = true WHERE id = ?', [target.id]);

    await connection.commit();

    const [updated] = await db
      .select()
      .from(homepageLayouts)
      .where(eq(homepageLayouts.id, target.id));

    res.json({
      success: true,
      message: `Layout "${target.name}" is now the active homepage!`,
      data: updated,
    });
  } catch (error: any) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
});

/**
 * Update Blocks Order, Visibility, and Settings
 * PUT /api/v1/cms/layouts/:idOrSlug/blocks
 */
cmsRouter.put('/layouts/:idOrSlug/blocks', async (req: Request, res: Response) => {
  try {
    const idOrSlug = String(req.params.idOrSlug);
    const { blocks } = req.body;

    if (!Array.isArray(blocks)) {
      return res.status(400).json({ success: false, message: 'blocks must be an array' });
    }

    // Normalize block ordering indices
    const normalizedBlocks: LayoutBlockConfig[] = blocks.map((b, idx) => ({
      ...b,
      order: idx + 1,
    }));

    await pool.query(
      'UPDATE homepage_layouts SET blocks = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR slug = ?',
      [JSON.stringify(normalizedBlocks), idOrSlug, idOrSlug]
    );

    const [updated] = await db
      .select()
      .from(homepageLayouts)
      .where(or(eq(homepageLayouts.id, idOrSlug), eq(homepageLayouts.slug, idOrSlug)))
      .limit(1);

    res.json({
      success: true,
      message: 'Layout blocks saved successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Update 2-Layer Navigation Menu Configuration
 * PUT /api/v1/cms/layouts/:idOrSlug/menu
 */
cmsRouter.put('/layouts/:idOrSlug/menu', async (req: Request, res: Response) => {
  try {
    const idOrSlug = String(req.params.idOrSlug);
    const { menuConfig } = req.body;

    if (!Array.isArray(menuConfig)) {
      return res.status(400).json({ success: false, message: 'menuConfig must be an array' });
    }

    await pool.query(
      'UPDATE homepage_layouts SET menu_config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? OR slug = ?',
      [JSON.stringify(menuConfig), idOrSlug, idOrSlug]
    );

    const [updated] = await db
      .select()
      .from(homepageLayouts)
      .where(or(eq(homepageLayouts.id, idOrSlug), eq(homepageLayouts.slug, idOrSlug)))
      .limit(1);

    res.json({
      success: true,
      message: '2-Layer navigation menu saved successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Section-Wise Image Upload Handler
 * POST /api/v1/cms/upload
 */
cmsRouter.post('/upload', upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const host = req.get('host') || 'localhost:4000';
    const protocol = req.protocol || 'http';
    const publicUrl = `${protocol}://${host}/uploads/cms/${req.file.filename}`;

    res.status(201).json({
      success: true,
      data: {
        url: publicUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
