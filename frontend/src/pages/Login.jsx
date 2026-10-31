import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { CircleAlert, Eye, EyeOff, Lock, LoaderCircle, Mail } from 'lucide-react';
import Brand from '../components/Brand.jsx';
import OrbitScene from '../components/OrbitScene.jsx';
import Field from '../components/Field.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Login() {
  document.title = 'Staff login | Orbit';
  const { admin, login } = useAuth();
  const location = useLocation();
  const shake = useAnimation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState('');

  if (admin) return <Navigate to={location.state?.from || '/admin'} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const timer = setTimeout(() => setSlow(true), 4000);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      shake.start({ x: [0, -9, 9, -6, 6, 0], transition: { duration: 0.4 } });
      setBusy(false);
    } finally {
      clearTimeout(timer);
      setSlow(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col">
        <div aria-hidden="true" className="absolute -left-20 top-1/3 h-96 w-96 rounded-full bg-signal/40 blur-3xl animate-drift" />
        <div aria-hidden="true" className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-ultra/40 blur-3xl animate-drift [animation-delay:-9s]" />
        <div className="relative"><Brand light /></div>
        <div className="relative my-auto">
          <div className="mx-auto max-w-[360px] opacity-95"><OrbitScene /></div>
          <h2 className="mt-8 text-4xl font-bold leading-tight">Every inquiry, in one place</h2>
          <p className="mt-3 max-w-md text-lg text-white/70">Sign in to see who wrote in, filter by topic and keep each inquiry moving.</p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-12">
        <motion.div animate={shake} className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><Brand /></div>
          <h1 className="text-3xl font-bold sm:text-4xl">Staff login</h1>
          <p className="mt-2 text-lg text-ink-600">Use the email and password your admin gave you.</p>

          <form onSubmit={onSubmit} noValidate className="mt-8">
            <Field id="login-email" label="Email" icon={Mail} type="email" inputMode="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <Field id="login-password" label="Password" icon={Lock} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1.5 top-[30px] flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-ink/5" aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
              </button>
            </div>

            {error && (
              <motion.p role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-[15px] font-medium text-red-700">
                <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
              </motion.p>
            )}

            <button type="submit" disabled={busy || !email || !password} className="btn-primary w-full">
              {busy ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
                  <span>{slow ? 'Waking the server, this can take up to a minute' : 'Signing in'}</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
