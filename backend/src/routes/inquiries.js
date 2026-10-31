import { Router } from 'express';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  createInquirySchema,
  listQuerySchema,
  updateStatusSchema,
  idSchema,
  normalizePhone,
} from '../validators/inquiry.js';

const router = Router();

const makeRef = (id) => `ORB-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
const withRef = (row) => ({ ...row, ref: makeRef(row.id) });

// 20 public submissions per hour per IP
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many submissions from this network. Please try again later.' },
});

// ---------- Public: submit an inquiry ----------
router.post('/', submitLimiter, async (req, res, next) => {
  try {
    // Honeypot: real people never see this field. Bots fill it, so we pretend it worked and save nothing.
    if (req.body && req.body.website) {
      return res.status(201).json({ ref: makeRef(crypto.randomUUID()) });
    }

    const parsed = createInquirySchema.safeParse(req.body);
    if (!parsed.success) {
      const fields = {};
      for (const issue of parsed.error.issues) fields[issue.path[0]] ??= issue.message;
      return res.status(400).json({ error: 'Please check the highlighted fields', fields });
    }

    const d = parsed.data;
    const { rows } = await query(
      `INSERT INTO inquiries (user_type, category, name, email, phone, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [d.user_type, d.category, d.name, d.email, d.phone, d.message],
    );
    res.status(201).json({ ref: makeRef(rows[0].id), created_at: rows[0].created_at });
  } catch (err) {
    next(err);
  }
});

// ---------- Admin: counts for the dashboard cards ----------
router.get('/stats', requireAuth, async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'new')::int AS new,
              COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
              COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved,
              COUNT(*) FILTER (WHERE status = 'closed')::int AS closed
         FROM inquiries`,
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// ---------- Admin: list with filters, search and pagination ----------
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const cleaned = Object.fromEntries(Object.entries(req.query).filter(([, v]) => v !== ''));
    const parsed = listQuerySchema.safeParse(cleaned);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid filters' });
    const { page, limit, category, user_type, status, q } = parsed.data;

    const where = [];
    const params = [];
    const add = (sql, value) => {
      params.push(value);
      where.push(sql.replace('?', `$${params.length}`));
    };

    if (category) add('category = ?', category);
    if (user_type) add('user_type = ?', user_type);
    if (status) add('status = ?', status);
    if (q) {
      // Search by name (case-insensitive) or phone (ignoring spaces and dashes)
      const escape = (s) => s.replace(/[\\%_]/g, '\\$&');
      params.push(`%${escape(q)}%`);
      const nameParam = `$${params.length}`;
      params.push(`%${escape(normalizePhone(q))}%`);
      const phoneParam = `$${params.length}`;
      where.push(`(name ILIKE ${nameParam} OR phone ILIKE ${phoneParam})`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    const [count, data] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM inquiries ${whereSql}`, params),
      query(
        `SELECT id, user_type, category, name, email, phone, message, status, created_at, updated_at
           FROM inquiries ${whereSql}
          ORDER BY created_at DESC
          LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      ),
    ]);

    const total = count.rows[0].total;
    res.json({
      data: data.rows.map(withRef),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    next(err);
  }
});

// ---------- Admin: change status ----------
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = idSchema.safeParse(req.params.id);
    const body = updateStatusSchema.safeParse(req.body);
    if (!id.success || !body.success) return res.status(400).json({ error: 'Invalid request' });

    const { rows } = await query(
      `UPDATE inquiries SET status = $1 WHERE id = $2
       RETURNING id, user_type, category, name, email, phone, message, status, created_at, updated_at`,
      [body.data.status, id.data],
    );
    if (!rows[0]) return res.status(404).json({ error: 'Inquiry not found' });
    res.json(withRef(rows[0]));
  } catch (err) {
    next(err);
  }
});

export default router;
