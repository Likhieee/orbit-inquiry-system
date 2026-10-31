import { useId } from 'react';
import { Link } from 'react-router-dom';
import { BRAND } from '../lib/constants.js';

export function BrandMark({ size = 34 }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2F5BFF" />
          <stop offset="1" stopColor="#5B4DF0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id})`} />
      <ellipse cx="16" cy="16" rx="9" ry="4.2" fill="none" stroke="#fff" strokeWidth="1.8" transform="rotate(-28 16 16)" />
      <circle cx="16" cy="16" r="3.2" fill="#fff" />
      <circle cx="23.2" cy="12" r="1.9" fill="#FFB938" />
    </svg>
  );
}

export default function Brand({ to = '/', light = false }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 font-display text-xl font-bold ${light ? 'text-white' : 'text-ink'}`} aria-label={`${BRAND} home`}>
      <BrandMark />
      {BRAND}
    </Link>
  );
}
