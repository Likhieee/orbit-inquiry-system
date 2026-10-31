import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { toast } from 'sonner';
import { Check, Copy, LoaderCircle, Mail, Phone, Send, User } from 'lucide-react';
import Nav from '../components/Nav.jsx';
import Field from '../components/Field.jsx';
import Dropdown from '../components/Dropdown.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import { api } from '../lib/api.js';
import { CATEGORIES, USER_TYPES, STARTERS, byValue } from '../lib/constants.js';

const DRAFT_KEY = 'orbit_inquiry_draft';
const EMPTY = { user_type: '', category: '', name: '', email: '', phone: '', message: '', website: '' };

// Same rules the server enforces, so people see problems before they hit send
const rules = {
  user_type: (v) => (v ? '' : 'Choose who you are'),
  category: (v) => (v ? '' : 'Choose a category'),
  name: (v) => (v.trim().length >= 2 ? '' : 'Enter your full name'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address'),
  phone: (v) => (/^\+?\d{10,15}$/.test(v.replace(/[\s\-().]/g, '')) ? '' : 'Enter a valid phone number, 10 to 15 digits'),
  message: (v) => {
    const n = v.trim().length;
    if (n < 10) return 'Add a few more details (at least 10 characters)';
    if (n > 2000) return 'Keep it under 2000 characters';
    return '';
  },
};
const FIELDS = Object.keys(rules);

function initialValues(params) {
  let draft = {};
  try { draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY)) || {}; } catch { /* ignore */ }
  const values = { ...EMPTY, ...draft, website: '' };
  const category = params.get('category');
  const type = params.get('type');
  if (CATEGORIES.some((c) => c.value === category)) values.category = category;
  if (USER_TYPES.some((u) => u.value === type)) values.user_type = type;
  return values;
}

function ProgressRing({ done, total }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const complete = done === total;
  return (
    <span className="relative inline-flex h-11 w-11 items-center justify-center" role="img" aria-label={`${done} of ${total} fields done`}>
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="4" />
        <motion.circle
          cx="22" cy="22" r={r} fill="none" strokeWidth="4" strokeLinecap="round"
          stroke={complete ? '#19D3C5' : '#8AA4FF'}
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - done / total) }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </svg>
      {complete ? <Check size={18} strokeWidth={3} className="text-aqua" aria-hidden="true" /> : <span className="text-xs font-bold text-white">{done}/{total}</span>}
    </span>
  );
}

function TicketRow({ label, children, filled }) {
  return (
    <div>
      <dt className="text-sm font-medium text-white/55">{label}</dt>
      <dd className="mt-1 min-h-[28px] text-[17px] font-semibold">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={filled ? 'v' : 'e'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className={filled ? 'text-white' : 'text-white/30'}>
            {children}
          </motion.div>
        </AnimatePresence>
      </dd>
    </div>
  );
}

// The memorable bit: a ticket that fills in as you type
function TicketPreview({ values, done, total }) {
  const cat = byValue(CATEGORIES, values.category);
  const type = byValue(USER_TYPES, values.user_type);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-lift">
      <div aria-hidden="true" className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-ultra/60 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-signal/40 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <span className="font-display text-lg font-bold">Your inquiry</span>
        <ProgressRing done={done} total={total} />
      </div>
      <dl className="relative mt-6 space-y-5">
        <TicketRow label="From" filled={!!type}>{type ? <span className="flex items-center gap-2"><type.icon size={18} aria-hidden="true" />{type.label}</span> : 'Not chosen yet'}</TicketRow>
        <TicketRow label="About" filled={!!cat}>
          {cat ? <span className="flex items-center gap-2" style={{ color: cat.accent }}><CategoryIcon category={cat.value} size={18} />{cat.label}</span> : 'Not chosen yet'}
        </TicketRow>
        <TicketRow label="Name" filled={!rules.name(values.name)}>{values.name.trim() || 'Waiting for your name'}</TicketRow>
        <TicketRow label="Reply to" filled={!rules.email(values.email)}>
          <span className="block truncate">{values.email.trim() || 'Waiting for your email'}</span>
        </TicketRow>
      </dl>
    </div>
  );
}

function Burst() {
  const colors = ['#2F5BFF', '#5B4DF0', '#19D3C5', '#FFB938', '#F0539B'];
  return (
    <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[80px] h-0 w-0 sm:top-[96px]">
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const radius = 95 + (i % 3) * 30;
        return (
          <motion.span
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full"
            style={{ background: colors[i % colors.length], left: -5, top: -5 }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, opacity: 0, scale: 0.4 }}
            transition={{ duration: 1.1, delay: 0.55, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

function SuccessCard({ result, onAgain }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(result.ref); toast.success('Reference copied'); }
    catch { toast.error('Could not copy. Select the code and copy it by hand.'); }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-white p-8 text-center shadow-lift ring-1 ring-ink/5 sm:p-12"
    >
      <Burst />
      <div className="relative mx-auto h-24 w-24">
        <svg viewBox="0 0 96 96" className="absolute inset-0" aria-hidden="true">
          <motion.circle cx="48" cy="48" r="43" fill="none" stroke="#19D3C5" strokeWidth="5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: 'easeOut' }} />
          <motion.path d="M30 50 l12 12 l24 -26" fill="none" stroke="#19D3C5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.55, ease: 'easeOut' }} />
        </svg>
      </div>
      <h1 className="mt-6 text-3xl font-bold">Inquiry sent</h1>
      <p className="mx-auto mt-3 max-w-md text-lg text-ink-600">We have it. The team will get back to you by email or phone.</p>
      <div className="mx-auto mt-8 flex max-w-sm items-center justify-between gap-3 rounded-2xl bg-mist px-5 py-4 text-left">
        <div>
          <p className="text-sm font-medium text-ink-500">Your reference</p>
          <p className="font-display text-xl font-bold tracking-wide">{result.ref}</p>
        </div>
        <button type="button" onClick={copy} className="btn-ghost !px-3" aria-label="Copy reference">
          <Copy size={18} aria-hidden="true" /> Copy
        </button>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onAgain} className="btn-primary">Send another inquiry</button>
        <Link to="/" className="btn-ghost">Back to home</Link>
      </div>
    </motion.div>
  );
}

export default function Inquiry() {
  document.title = 'Send an inquiry | Orbit';
  const [params] = useSearchParams();
  const [values, setValues] = useState(() => initialValues(params));
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [phase, setPhase] = useState('form'); // form | sending | done
  const [slow, setSlow] = useState(false);
  const [result, setResult] = useState(null);
  const formRef = useRef(null);
  const shake = useAnimation();

  const errors = useMemo(() => Object.fromEntries(FIELDS.map((f) => [f, rules[f](values[f])])), [values]);
  const done = FIELDS.filter((f) => !errors[f]).length;
  const err = (f) => (touched[f] && errors[f]) || serverErrors[f] || '';
  const ok = (f) => touched[f] && !errors[f] && !serverErrors[f];

  // Keep what people typed if they refresh or the request fails
  useEffect(() => {
    if (phase === 'done') return;
    const { website, ...draft } = values; // eslint-disable-line no-unused-vars
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* ignore */ }
  }, [values, phase]);

  const set = (f) => (e) => {
    const v = e?.target ? e.target.value : e;
    setValues((p) => ({ ...p, [f]: v }));
    setServerErrors((p) => (p[f] ? { ...p, [f]: undefined } : p));
  };
  const blur = (f) => () => setTouched((p) => ({ ...p, [f]: true }));

  async function onSubmit(e) {
    e.preventDefault();
    if (phase === 'sending') return;
    const firstBad = FIELDS.find((f) => errors[f]);
    if (firstBad) {
      setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));
      shake.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.4 } });
      toast.error('Please fix the highlighted fields');
      formRef.current?.querySelector(`#f-${firstBad}`)?.focus();
      return;
    }
    setPhase('sending');
    // Free hosting can take a while to wake up. Tell people instead of leaving them guessing.
    const timer = setTimeout(() => setSlow(true), 4000);
    try {
      const data = await api.post('/inquiries', values);
      try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setResult(data);
      setPhase('done');
    } catch (error) {
      setServerErrors(error.fields || {});
      setPhase('form');
      toast.error(error.message);
    } finally {
      clearTimeout(timer);
      setSlow(false);
    }
  }

  const again = () => {
    setValues({ ...EMPTY });
    setTouched({});
    setServerErrors({});
    setResult(null);
    setPhase('form');
  };

  const starters = STARTERS[values.category] || [];
  const messageLen = values.message.length;

  return (
    <div className="relative isolate min-h-screen">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
        <div className="absolute -left-20 -top-32 h-[360px] w-[360px] rounded-full bg-signal/20 blur-3xl animate-drift" />
        <div className="absolute right-0 -top-20 h-[320px] w-[320px] rounded-full bg-aqua/20 blur-3xl animate-drift [animation-delay:-8s]" />
      </div>
      <Nav />
      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[340px_1fr] lg:items-start lg:py-14">
        <aside className="hidden lg:sticky lg:top-24 lg:block">
          <TicketPreview values={values} done={done} total={FIELDS.length} />
          <p className="mt-5 px-1 text-[15px] leading-relaxed text-ink-500">We only use your details to reply to this inquiry.</p>
        </aside>

        <section>
          <AnimatePresence mode="wait">
            {phase === 'done' ? (
              <SuccessCard key="done" result={result} onAgain={again} />
            ) : (
              <motion.div key="form" animate={shake} exit={{ opacity: 0, y: -10 }} className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-ink/5 sm:p-9">
                <h1 className="text-3xl font-bold sm:text-4xl">How can we help?</h1>
                <p className="mt-2 text-lg text-ink-600">Six quick details and you are done.</p>

                <div className="mt-5 lg:hidden" role="img" aria-label={`${done} of ${FIELDS.length} fields done`}>
                  <div className="h-2 overflow-hidden rounded-full bg-ink-100">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-signal to-aqua" animate={{ width: `${(done / FIELDS.length) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
                  </div>
                </div>

                <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-7">
                  <Dropdown id="f-user_type" label="I am a" placeholder="Choose one" options={USER_TYPES} value={values.user_type} onChange={set('user_type')} onBlur={blur('user_type')} error={err('user_type')} />
                  <Dropdown id="f-category" label="My question is about" placeholder="Choose a topic" options={CATEGORIES} value={values.category} onChange={set('category')} onBlur={blur('category')} error={err('category')} />
                  <Field id="f-name" label="Full name" icon={User} autoComplete="name" placeholder="Your name" value={values.name} onChange={set('name')} onBlur={blur('name')} error={err('name')} valid={ok('name')} />
                  <Field id="f-email" label="Email" icon={Mail} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={set('email')} onBlur={blur('email')} error={err('email')} valid={ok('email')} />
                  <Field id="f-phone" label="Phone number" icon={Phone} type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={values.phone} onChange={set('phone')} onBlur={blur('phone')} error={err('phone')} valid={ok('phone')} hint="Add the country code if you are outside India" />

                  {/* Honeypot: hidden from people and screen readers. Bots fill it in and get ignored. */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor="f-website">Website</label>
                    <input id="f-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
                  </div>

                  <Field id="f-message" as="textarea" label="Your message" placeholder="What would you like to know?" value={values.message} onChange={set('message')} onBlur={blur('message')} error={err('message')} valid={ok('message')} hint={`${messageLen} / 2000`} maxLength={2100} />
                  <AnimatePresence>
                    {starters.length > 0 && values.message.trim() === '' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="-mt-1 mb-4 overflow-hidden">
                        <p className="mb-2 text-sm font-medium text-ink-500">Not sure what to write? Tap one:</p>
                        <div className="flex flex-wrap gap-2">
                          {starters.map((s) => (
                            <button key={s} type="button" onClick={() => set('message')(s)} className="min-h-[40px] rounded-full bg-signal-50 px-4 py-2 text-left text-[14px] font-medium text-signal-600 transition-colors hover:bg-signal-100">
                              {s}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={phase === 'sending'} className="btn-primary mt-2 w-full">
                    {phase === 'sending' ? (
                      <>
                        <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
                        <span>{slow ? 'Waking the server, this can take up to a minute' : 'Sending'}</span>
                      </>
                    ) : (
                      <>
                        <Send size={19} aria-hidden="true" /> Send inquiry
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
