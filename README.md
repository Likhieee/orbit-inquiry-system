# Orbit

An inquiry desk for an EdTech business. Parents, students and schools send an inquiry through a public form. Admins log in to search, filter and track every inquiry in one dashboard.

   - Live demo: https://orbit-inquiry-systems.vercel.app
   - Demo video: https://drive.google.com/file/d/1ffaIkzbGfDUloXqzlRiD6zf8zcoZl1-3/view?usp=sharing
   - Demo admin login: admin@orbit.demo / OrbitDemo@2026

## Stack

- Frontend: React 18, Vite, Tailwind CSS, Framer Motion
- Backend: Node.js, Express
- Database: Supabase (PostgreSQL), accessed with `pg`
- Auth: written from scratch. bcrypt password hashes, JWT in the `Authorization` header, and a middleware that guards the admin routes. Supabase Auth is not used.

## Folders

```
backend/     Express API: src/routes, src/middleware, src/validators, scripts/
frontend/    React app: src/pages, src/components, src/lib
schema.sql   Tables, constraints and indexes
```

## Run it locally

You need Node 18 or newer and a Supabase project.

**1. Database**

1. Open the SQL editor in Supabase and run `schema.sql` (or run `npm run db:setup` in `backend/` once your `.env` is filled in).
2. Click **Connect** in your project and copy the **Session pooler** connection string. Use that one rather than the direct connection, which is IPv6 only and fails on hosts like Render.

**2. Backend**

```bash
cd backend
cp .env.example .env      # fill in the values, see the table below
npm install
npm run seed:demo         # creates the admin account and 40 sample inquiries
npm run dev               # http://localhost:4000
```

Run `npm run seed` instead if you do not want sample data.

**3. Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

The public form is at `/inquiry` and the admin login is at `/admin/login`.

## Environment variables

`backend/.env`

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase connection string (session pooler) |
| `JWT_SECRET` | Signing key, at least 32 characters |
| `JWT_EXPIRES_IN` | Token lifetime, default `2h` |
| `PORT` | Default `4000` |
| `FRONTEND_URL` | Allowed frontend origins for CORS, comma separated, no trailing slash |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Used only by `npm run seed` to create the admin |

`frontend/.env`

| Name | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend URL, default `http://localhost:4000` |

## Test the JWT auth

```bash
API=http://localhost:4000/api

# 1. No token: 401
curl -i $API/inquiries

# 2. Log in and keep the token
TOKEN=$(curl -s -X POST $API/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"YOUR_ADMIN_EMAIL","password":"YOUR_ADMIN_PASSWORD"}' \
  | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')

# 3. With the token: 200
curl -s "$API/inquiries?category=scholarship&limit=3" -H "Authorization: Bearer $TOKEN"

# 4. A changed token: 401
curl -i $API/inquiries -H "Authorization: Bearer ${TOKEN}x"
```

## API

| Method | Path | Auth | What it does |
| --- | --- | --- | --- |
| POST | `/api/inquiries` | no | Submit an inquiry |
| POST | `/api/auth/login` | no | Returns a JWT |
| GET | `/api/auth/me` | yes | Current admin |
| GET | `/api/inquiries` | yes | List. Query: `page`, `limit`, `category`, `user_type`, `status`, `q` (name or phone) |
| GET | `/api/inquiries/stats` | yes | Counts per status |
| PATCH | `/api/inquiries/:id` | yes | Change status: `new`, `in_progress`, `resolved`, `closed` |
| GET | `/api/health` | no | Server and database check |

## Security

- Passwords are stored as bcrypt hashes. Login takes the same time whether or not the email exists.
- JWTs are HS256 and expire after 2 hours. The middleware pins the algorithm, so unsigned or tampered tokens are rejected.
- All SQL uses placeholders. Input is validated with Zod on the server (the form validates the same rules in the browser).
- Helmet, a CORS allow-list, rate limits on login (10 failures per 15 minutes) and on the public form (20 per hour), and a hidden honeypot field to catch bots.
- Row Level Security is on for both tables with no policies, so Supabase's public API cannot read them. Only this backend can.

## Deploy

- **Backend (Render):** root directory `backend`, build command `npm install`, start command `npm start`. Add `DATABASE_URL`, `JWT_SECRET` and `FRONTEND_URL`. Then run `npm run seed` once, locally with the same `DATABASE_URL`, to create the admin.
- **Frontend (Vercel):** root directory `frontend`, Vite preset, set `VITE_API_URL` to the Render URL. Add the Vercel URL to `FRONTEND_URL` on the backend.

Render's free plan sleeps when idle, so the first request can take about a minute. The forms show a message while they wait.
