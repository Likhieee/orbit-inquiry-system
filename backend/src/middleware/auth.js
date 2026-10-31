import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// Protects a route: expects "Authorization: Bearer <token>"
export function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    req.admin = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token';
    res.status(401).json({ error: message });
  }
}
