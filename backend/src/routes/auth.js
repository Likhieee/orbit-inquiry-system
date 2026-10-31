import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db.js';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200),
});

// 10 failed attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in a few minutes.' },
});

// Compared against when the email does not exist, so response time does not reveal valid emails
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email and password' });

    const { email, password } = parsed.data;
    const { rows } = await query('SELECT id, email, name, password_hash FROM admins WHERE email = $1', [email]);
    const admin = rows[0];

    const matches = await bcrypt.compare(password, admin ? admin.password_hash : DUMMY_HASH);
    if (!admin || !matches) return res.status(401).json({ error: 'Incorrect email or password' });

    const token = jwt.sign({ email: admin.email }, config.jwtSecret, {
      subject: admin.id,
      expiresIn: config.jwtExpiresIn,
      algorithm: 'HS256',
    });
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id, email, name FROM admins WHERE id = $1', [req.admin.id]);
    if (!rows[0]) return res.status(401).json({ error: 'Account no longer exists' });
    res.json({ admin: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
