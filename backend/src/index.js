import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import inquiryRoutes from './routes/inquiries.js';

const app = express();

app.set('trust proxy', 1); // correct client IPs behind Render/Vercel proxies (needed for rate limiting)
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // No origin means curl/Postman/server-to-server, which is fine
      if (!origin || config.frontendUrls.includes(origin)) return callback(null, true);
      callback(Object.assign(new Error('Origin not allowed'), { status: 403 }));
    },
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'database_unreachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiryRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
  if (err.status === 403) return res.status(403).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
});

app.listen(config.port, () => console.log(`API listening on http://localhost:${config.port}`));
