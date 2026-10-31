import { motion } from 'framer-motion';
import { USER_TYPES, CATEGORIES } from '../lib/constants.js';
import { BrandMark } from './Brand.jsx';

const place = (index, total) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return { left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` };
};

function Satellite({ item, index, total, counter, tinted }) {
  const Icon = item.icon;
  return (
    <span className="absolute" style={{ ...place(index, total), transform: 'translate(-50%, -50%)' }}>
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lift ring-1 ring-ink/5 sm:h-14 sm:w-14 ${counter}`}
        style={tinted ? { color: item.text, background: item.bg } : { color: '#2347D6' }}
      >
        <Icon size={24} strokeWidth={2} aria-hidden="true" />
      </span>
    </span>
  );
}

// Decorative: the people who write in (inner ring) circling the topics they ask about (outer ring)
export default function OrbitScene({ className = '' }) {
  return (
    <motion.div
      aria-hidden="true"
      className={`relative mx-auto aspect-square w-full max-w-[520px] ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
    >
      <div className="absolute inset-7">
        <div className="absolute inset-0 rounded-full border border-signal/20 animate-spin-slower">
          {CATEGORIES.map((c, i) => (
            <Satellite key={c.value} item={c} index={i} total={CATEGORIES.length} counter="animate-counter-slower" tinted />
          ))}
        </div>
        <div className="absolute inset-[24%] rounded-full border border-dashed border-signal/30 animate-spin-slow">
          {USER_TYPES.map((u, i) => (
            <Satellite key={u.value} item={u} index={i} total={USER_TYPES.length} counter="animate-counter-slow" />
          ))}
        </div>
        <div className="absolute left-1/2 top-1/2 h-[20%] w-[20%] -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 rounded-full border-2 border-signal/40 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full border-2 border-signal/40 animate-pulse-ring [animation-delay:1.6s]" />
          <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-glow ring-1 ring-signal/20">
            <BrandMark size={44} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
