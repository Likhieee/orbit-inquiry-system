// npm run seed        creates (or updates) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD
// npm run seed:demo   also adds 40 sample inquiries so the dashboard is not empty
import bcrypt from 'bcryptjs';
import { pool } from '../src/db.js';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
const name = process.env.ADMIN_NAME || 'Admin';

if (!email || password.length < 10) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 10 characters) in .env first.');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
await pool.query(
  `INSERT INTO admins (email, password_hash, name) VALUES ($1, $2, $3)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name`,
  [email, hash, name],
);
console.log(`Admin ready: ${email}`);

if (process.argv.includes('--demo')) {
  const people = [
    'Aarav Sharma', 'Ananya Rao', 'Vihaan Gowda', 'Diya Nair', 'Rohan Iyer', 'Meera Pillai', 'Kabir Singh', 'Isha Reddy',
    'Arjun Menon', 'Saanvi Joshi', 'Aditya Kulkarni', 'Priya Hegde', 'Rahul Verma', 'Kavya Shetty', 'Nikhil Bhat', 'Sneha Patil',
  ];
  const messages = {
    scholarship: [
      'What are the eligibility rules for the merit scholarship, and when is the last date to apply?',
      'Could you share the list of documents needed for the need-based scholarship?',
      'Is the scholarship available for students joining mid-year?',
    ],
    concert: [
      'How can I book tickets for the next concert for a group of 12?',
      'Do students get a discount on concert passes?',
      'We would like to know the concert schedule for the coming month.',
    ],
    admission: [
      'What is the admission process for the next batch and what are the fees?',
      'My son is in grade 9. Are there seats available for this year?',
      'Please share the admission dates and the entrance test details.',
    ],
    general_query: [
      'I could not find a contact number on the website. Who should I speak to about a general question?',
      'Can someone call me back to explain the programs you offer?',
      'We are a school and would like to partner with you. Whom should we contact?',
    ],
  };
  const categories = Object.keys(messages);
  const userTypes = ['parent', 'student', 'school'];
  const statuses = ['new', 'new', 'new', 'in_progress', 'in_progress', 'resolved', 'resolved', 'closed'];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM inquiries');
  if (rows[0].n > 0) {
    console.log('Inquiries already exist, skipping demo data.');
  } else {
    for (let i = 0; i < 40; i++) {
      const person = pick(people);
      const category = pick(categories);
      const daysAgo = Math.random() * 30;
      await pool.query(
        `INSERT INTO inquiries (user_type, category, name, email, phone, message, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now() - ($8 || ' days')::interval)`,
        [
          pick(userTypes),
          category,
          person,
          `${person.toLowerCase().replace(/[^a-z]+/g, '.')}${i}@example.com`,
          `9${String(Math.floor(100000000 + Math.random() * 899999999))}`,
          pick(messages[category]),
          pick(statuses),
          daysAgo.toFixed(2),
        ],
      );
    }
    console.log('Added 40 demo inquiries.');
  }
}

await pool.end();
