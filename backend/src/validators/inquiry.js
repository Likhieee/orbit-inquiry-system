import { z } from 'zod';

export const USER_TYPES = ['parent', 'student', 'school'];
export const CATEGORIES = ['scholarship', 'concert', 'admission', 'general_query'];
export const STATUSES = ['new', 'in_progress', 'resolved', 'closed'];

// "+91 98765-43210" becomes "+919876543210"
export const normalizePhone = (value) => value.replace(/[\s\-().]/g, '');

export const createInquirySchema = z.object({
  user_type: z.enum(USER_TYPES, { error: 'Choose who you are' }),
  category: z.enum(CATEGORIES, { error: 'Choose a category' }),
  name: z.string({ error: 'Enter your full name' }).trim().min(2, 'Enter your full name').max(100, 'Name is too long'),
  email: z.string({ error: 'Enter a valid email address' }).trim().toLowerCase().email('Enter a valid email address').max(254),
  phone: z
    .string({ error: 'Enter a valid phone number' })
    .trim()
    .transform(normalizePhone)
    .refine((v) => /^\+?\d{10,15}$/.test(v), 'Enter a valid phone number'),
  message: z.string({ error: 'Write a short message' }).trim().min(10, 'Add a few more details (at least 10 characters)').max(2000, 'Keep it under 2000 characters'),
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.enum(CATEGORIES).optional(),
  user_type: z.enum(USER_TYPES).optional(),
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
});

export const updateStatusSchema = z.object({ status: z.enum(STATUSES) });
export const idSchema = z.string().uuid();
