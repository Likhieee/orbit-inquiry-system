import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChevronDown, ChevronLeft, ChevronRight, CircleCheck, Clock, Copy, Inbox, LayoutDashboard,
  LogOut, Mail, Phone, RefreshCw, Search, Sparkles, TriangleAlert, X,
} from 'lucide-react';
import Brand from '../components/Brand.jsx';
import Counter from '../components/Counter.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { CATEGORIES, STATUSES, USER_TYPES, byValue } from '../lib/constants.js';

const PAGE_SIZE = 10;
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtDateTime = (iso) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STAT_CARDS = [
  { key: 'total', label: 'All inquiries', icon: Inbox, status: '', tone: '#2F5BFF' },
  { key: 'new', label: 'New', icon: Sparkles, status: 'new', tone: '#2F5BFF' },
  { key: 'in_progress', label: 'In progress', icon: Clock, status: 'in_progress', tone: '#D97706' },
  { key: 'resolved', label: 'Resolved', icon: CircleCheck, status: 'resolved', tone: '#16A34A' },
];

function CategoryBadge({ value }) {
  const c = byValue(CATEGORIES, value);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-sm font-semibold" style={{ background: c.bg, color: c.text }}>
      <CategoryIcon category={value} size={15} still /> {c.label}
    </span>
  );
}

function StatusSelect({ value, onChange, label }) {
  const s = byValue(STATUSES, value);
  return (
    // Stops the click from also opening the details drawer
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <span className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <span aria-hidden="true" className="pointer-events-none absolute left-3 h-2 w-2 rounded-full" style={{ background: s.dot }} />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[36px] cursor-pointer appearance-none rounded-full py-1.5 pl-7 pr-8 text-sm font-semibold outline-none ring-1 ring-black/5"
        style={{ background: s.bg, color: s.text }}
      >
        {STATUSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={15} aria-hidden="true" className="pointer-events-none absolute right-2.5" style={{ color: s.text }} />
    </span>
  );
}

function FilterSelect({ label, value, onChange, options, all }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 min-w-[160px] cursor-pointer rounded-xl border border-ink-200 bg-white px-3.5 text-base text-ink outline-none focus:border-signal focus:shadow-[0_0_0_4px_rgba(47,91,255,.16)]"
    >
      <option value="">{all}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Drawer({ row, onClose, onStatus }) {
  const closeRef = useRef(null);
  const lastRow = useRef(row);
  if (row) lastRow.current = row; // keep the content on screen while the panel slides out
  const r = lastRow.current;

  useEffect(() => {
    if (!row) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.id]);

  const copyRef = async () => {
    try { await navigator.clipboard.writeText(r.ref); toast.success('Reference copied'); } catch { toast.error('Could not copy'); }
  };

  return createPortal(
    <AnimatePresence>
      {row && [
        <motion.div key="overlay" className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />,
        <motion.aside
          key="panel"
          role="dialog"
          aria-modal="true"
          aria-label="Inquiry details"
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        >
          <div className="flex items-start justify-between gap-4 border-b border-ink/5 p-6">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink-500">Inquiry {r.ref}</p>
              <h2 className="mt-1 truncate text-2xl font-bold">{r.name}</h2>
            </div>
            <button ref={closeRef} type="button" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-600 hover:bg-ink/5" aria-label="Close details">
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-600">Status</p>
              <StatusSelect value={r.status} onChange={(s) => onStatus(r, s)} label="Change status" />
            </div>
            <dl className="grid grid-cols-[110px_1fr] items-center gap-x-4 gap-y-4 text-[15px]">
              <dt className="text-ink-500">Email</dt>
              <dd><a href={`mailto:${r.email}`} className="inline-flex items-center gap-2 break-all font-semibold text-signal-600 hover:underline"><Mail size={16} aria-hidden="true" />{r.email}</a></dd>
              <dt className="text-ink-500">Phone</dt>
              <dd><a href={`tel:${r.phone}`} className="inline-flex items-center gap-2 font-semibold text-signal-600 hover:underline"><Phone size={16} aria-hidden="true" />{r.phone}</a></dd>
              <dt className="text-ink-500">From</dt>
              <dd className="font-semibold">{byValue(USER_TYPES, r.user_type).label}</dd>
              <dt className="text-ink-500">Topic</dt>
              <dd><CategoryBadge value={r.category} /></dd>
              <dt className="text-ink-500">Received</dt>
              <dd className="font-semibold">{fmtDateTime(r.created_at)}</dd>
            </dl>
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-600">Message</p>
              <p className="whitespace-pre-wrap rounded-2xl bg-mist p-4 text-base leading-relaxed">{r.message}</p>
            </div>
          </div>
          <div className="border-t border-ink/5 p-4">
            <button type="button" onClick={copyRef} className="btn-ghost w-full"><Copy size={17} aria-hidden="true" /> Copy reference</button>
          </div>
        </motion.aside>,
      ]}
    </AnimatePresence>,
    document.body,
  );
}

export default function Dashboard() {
  document.title = 'Inquiries | Orbit';
  const { admin, logout } = useAuth();
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const userType = params.get('user_type') || '';
  const status = params.get('status') || '';
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const [qInput, setQInput] = useState(q);
  const [list, setList] = useState({ loading: true, error: '', data: [], total: 0, totalPages: 1 });
  const [stats, setStats] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const searchRef = useRef(null);

  // Filters live in the URL, so a refresh or a shared link keeps them
  const update = useCallback((patch) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(patch)) (v ? next.set(k, v) : next.delete(k));
      if (!('page' in patch)) next.delete('page');
      return next;
    }, { replace: true });
  }, [setParams]);

  // Debounced search: wait until typing pauses, then push it to the URL.
  // pushedQ remembers the last value we pushed. URL updates can land a moment late, so comparing against
  // the URL here could replay an old filter (for example right after "Clear").
  const pushedQ = useRef(q);
  useEffect(() => {
    const t = setTimeout(() => {
      const next = qInput.trim();
      if (next !== pushedQ.current) {
        pushedQ.current = next;
        update({ q: next });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [qInput, update]);

  // Press "/" to jump to search
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const queryString = params.toString();
  useEffect(() => {
    const ctrl = new AbortController();
    setList((s) => ({ ...s, loading: true, error: '' }));
    const sp = new URLSearchParams(queryString);
    sp.set('limit', String(PAGE_SIZE));
    api.get(`/inquiries?${sp}`, { signal: ctrl.signal })
      .then((res) => setList({ loading: false, error: '', data: res.data, total: res.total, totalPages: res.totalPages }))
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setList((s) => ({ ...s, loading: false, error: err.message }));
      });
    return () => ctrl.abort();
  }, [queryString, refreshKey]);

  const loadStats = useCallback(() => {
    api.get('/inquiries/stats').then(setStats).catch(() => {});
  }, []);
  useEffect(() => { loadStats(); }, [loadStats, refreshKey]);

  const patchRow = (id, patch) => setList((s) => ({ ...s, data: s.data.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));

  async function changeStatus(row, next) {
    const prev = row.status;
    if (next === prev) return;
    patchRow(row.id, { status: next });
    try {
      await api.patch(`/inquiries/${row.id}`, { status: next });
      toast.success(`Marked as ${byValue(STATUSES, next).label.toLowerCase()}`);
      loadStats();
    } catch (err) {
      patchRow(row.id, { status: prev });
      toast.error(err.message);
    }
  }

  const hasFilters = !!(category || userType || status || q);
  const clearFilters = () => { pushedQ.current = ''; setQInput(''); setParams({}, { replace: true }); };
  const selected = list.data.find((r) => r.id === selectedId) || null;
  const from = list.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, list.total);

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink p-5 text-white lg:flex">
        <Brand light to="/admin" />
        <nav className="mt-10">
          <span aria-current="page" className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 font-semibold">
            <LayoutDashboard size={19} aria-hidden="true" /> Inquiries
          </span>
        </nav>
        <div className="mt-auto">
          <p className="truncate px-1 text-sm text-white/60">{admin?.email}</p>
          <button type="button" onClick={logout} className="mt-3 flex min-h-[44px] w-full items-center gap-3 rounded-xl px-4 font-semibold text-white/85 transition-colors hover:bg-white/10">
            <LogOut size={19} aria-hidden="true" /> Log out
          </button>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-ink/5 bg-white px-5 py-3 lg:hidden">
        <Brand to="/admin" />
        <button type="button" onClick={logout} className="btn-ghost"><LogOut size={18} aria-hidden="true" /> Log out</button>
      </header>

      <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-10 lg:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Inquiries</h1>
            <p className="mt-1 text-lg text-ink-600">Everything people have sent in, newest first.</p>
          </div>
          <button type="button" onClick={() => setRefreshKey((k) => k + 1)} className="btn-ghost ring-1 ring-ink/10">
            <RefreshCw size={17} className={list.loading ? 'animate-spin' : ''} aria-hidden="true" /> Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map((c) => {
            const Icon = c.icon;
            const active = status === c.status && (c.status !== '' || !status);
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={active}
                onClick={() => update({ status: c.status })}
                className={`rounded-2xl bg-white p-5 text-left shadow-lift ring-1 transition-all hover:-translate-y-0.5 ${active ? 'ring-2 ring-signal' : 'ring-ink/5'}`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-ink-600">{c.label}</span>
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${c.tone}1A`, color: c.tone }}>
                    <Icon size={19} aria-hidden="true" />
                    {c.key === 'new' && stats?.new > 0 && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-signal ring-2 ring-white" />}
                  </span>
                </span>
                <span className="mt-3 block font-display text-4xl font-bold">
                  {stats ? <Counter value={stats[c.key]} /> : <span className="skeleton inline-block h-9 w-16 align-middle" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-lift ring-1 ring-ink/5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search size={19} className="pointer-events-none absolute left-3.5 top-[14px] text-ink-300" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="Search by name or phone"
              placeholder="Search by name or phone. Press / to jump here."
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              className="h-12 w-full rounded-xl border border-ink-200 pl-11 pr-4 text-base outline-none placeholder:text-ink-300 focus:border-signal focus:shadow-[0_0_0_4px_rgba(47,91,255,.16)]"
            />
          </div>
          <FilterSelect label="Filter by category" value={category} onChange={(v) => update({ category: v })} options={CATEGORIES} all="All categories" />
          <FilterSelect label="Filter by user type" value={userType} onChange={(v) => update({ user_type: v })} options={USER_TYPES} all="All user types" />
          <FilterSelect label="Filter by status" value={status} onChange={(v) => update({ status: v })} options={STATUSES} all="All statuses" />
          <AnimatePresence>
            {hasFilters && (
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} type="button" onClick={clearFilters} className="btn-ghost shrink-0">
                <X size={17} aria-hidden="true" /> Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-lift ring-1 ring-ink/5">
          {list.error ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <TriangleAlert size={34} className="text-amber-500" aria-hidden="true" />
              <p className="mt-3 text-lg font-semibold">We could not load the inquiries</p>
              <p className="mt-1 text-ink-600">{list.error}</p>
              <button type="button" onClick={() => setRefreshKey((k) => k + 1)} className="btn-primary mt-6">Try again</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-[15px]">
                <thead className="bg-mist text-sm font-semibold text-ink-600">
                  <tr>
                    {['Name', 'Phone', 'Email', 'User type', 'Category', 'Date', 'Status'].map((h) => <th key={h} scope="col" className="px-4 py-3.5">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {list.loading && list.data.length === 0
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>{Array.from({ length: 7 }).map((__, j) => <td key={j} className="px-4 py-4"><div className="skeleton h-5 w-full max-w-[140px]" /></td>)}</tr>
                      ))
                    : list.data.map((r, i) => (
                        <motion.tr
                          key={r.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: list.loading ? 0.55 : 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.25 }}
                          tabIndex={0}
                          onClick={() => setSelectedId(r.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(r.id); } }}
                          className="cursor-pointer transition-colors hover:bg-signal-50/70 focus-visible:bg-signal-50/70"
                        >
                          <td className="px-4 py-3.5 font-semibold">{r.name}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{r.phone}</td>
                          <td className="max-w-[220px] truncate px-4 py-3.5 text-ink-700">{r.email}</td>
                          <td className="whitespace-nowrap px-4 py-3.5">{byValue(USER_TYPES, r.user_type).label}</td>
                          <td className="px-4 py-3.5"><CategoryBadge value={r.category} /></td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-ink-700">{fmtDate(r.created_at)}</td>
                          <td className="px-4 py-3.5"><StatusSelect value={r.status} onChange={(s) => changeStatus(r, s)} label={`Status for ${r.name}`} /></td>
                        </motion.tr>
                      ))}
                </tbody>
              </table>

              {!list.loading && list.data.length === 0 && (
                <div className="flex flex-col items-center px-6 py-16 text-center">
                  <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-signal-50 text-signal">
                    <Inbox size={32} aria-hidden="true" />
                  </motion.span>
                  <p className="mt-4 text-xl font-bold">{hasFilters ? 'No inquiries match these filters' : 'No inquiries yet'}</p>
                  <p className="mt-1 max-w-sm text-ink-600">{hasFilters ? 'Try a different search or clear the filters.' : 'New inquiries will show up here as soon as someone sends the form.'}</p>
                  {hasFilters && <button type="button" onClick={clearFilters} className="btn-primary mt-6">Clear filters</button>}
                </div>
              )}
            </div>
          )}

          {!list.error && list.total > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 px-4 py-3">
              <p className="text-[15px] text-ink-600">Showing {from} to {to} of {list.total}</p>
              <div className="flex items-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} className="btn-ghost ring-1 ring-ink/10 disabled:opacity-40"><ChevronLeft size={18} aria-hidden="true" /> Previous</button>
                <span className="px-2 text-[15px] font-semibold">Page {page} of {list.totalPages}</span>
                <button type="button" disabled={page >= list.totalPages} onClick={() => update({ page: String(page + 1) })} className="btn-ghost ring-1 ring-ink/10 disabled:opacity-40">Next <ChevronRight size={18} aria-hidden="true" /></button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Drawer row={selected} onClose={() => setSelectedId(null)} onStatus={changeStatus} />
    </div>
  );
}
