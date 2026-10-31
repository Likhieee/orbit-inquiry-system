import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Orbit } from 'lucide-react';
import Nav from '../components/Nav.jsx';

export default function NotFound() {
  document.title = 'Page not found | Orbit';
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} className="text-signal">
          <Orbit size={72} strokeWidth={1.5} aria-hidden="true" />
        </motion.div>
        <h1 className="mt-6 text-4xl font-bold">This page drifted off</h1>
        <p className="mt-3 text-lg text-ink-500">The link may be old or mistyped. Head back and we will get you where you need to go.</p>
        <Link to="/" className="btn-primary mt-8">Back to home</Link>
      </main>
    </>
  );
}
