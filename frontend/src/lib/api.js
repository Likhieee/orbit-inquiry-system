const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const KEY = 'orbit_session';

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

// The admin session lives in sessionStorage, so it ends when the tab closes
const readSession = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
};
let session = readSession();

export const getSession = () => session;
export const setSession = (next) => {
  session = next;
  try {
    if (next) sessionStorage.setItem(KEY, JSON.stringify(next));
    else sessionStorage.removeItem(KEY);
  } catch { /* storage can be blocked; the in-memory session still works */ }
};

async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // An expired or invalid token on a protected call sends the admin back to login
    if (res.status === 401 && session) {
      setSession(null);
      window.dispatchEvent(new Event('orbit:unauthorized'));
    }
    throw new ApiError(data.error || 'Something went wrong. Please try again.', res.status, data.fields);
  }
  return data;
}

export const api = {
  get: (path, opts) => request(path, opts),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
};
