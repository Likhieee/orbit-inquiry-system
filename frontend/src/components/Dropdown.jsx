import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, CircleAlert } from 'lucide-react';

// A real dropdown (button + listbox) with big touch rows, icons and full keyboard support.
export default function Dropdown({ id, label, value, onChange, onBlur, options, placeholder, error, className = '' }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (!wrapRef.current?.contains(e.target)) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open, onBlur]);

  const choose = (v) => {
    onChange(v);
    setOpen(false);
    onBlur?.();
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setActive(Math.max(0, options.findIndex((o) => o.value === value)));
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => (i + 1) % options.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => (i - 1 + options.length) % options.length); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(options[active].value); }
    else if (e.key === 'Escape') { setOpen(false); onBlur?.(); }
    else if (e.key === 'Tab') { setOpen(false); onBlur?.(); }
  };

  const Icon = selected?.icon;
  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <span id={`${uid}-label`} className="mb-1.5 block text-[15px] font-semibold text-ink-700">{label}</span>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-labelledby={`${uid}-label`}
        aria-invalid={error ? 'true' : 'false'}
        aria-activedescendant={open ? `${uid}-opt-${active}` : undefined}
        onClick={() => { setActive(Math.max(0, options.findIndex((o) => o.value === value))); setOpen((o) => !o); }}
        onKeyDown={onKeyDown}
        className={`flex h-12 w-full items-center gap-3 rounded-xl border bg-white px-3.5 text-left text-base outline-none transition-shadow ${
          error
            ? 'border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,.22)]'
            : 'border-ink-200 focus:border-signal focus:shadow-[0_0_0_4px_rgba(47,91,255,.16)]'
        }`}
      >
        {Icon && <Icon size={20} className="shrink-0 text-signal" aria-hidden="true" />}
        <span className={`flex-1 truncate ${selected ? 'text-ink' : 'text-ink-300'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={18} className={`shrink-0 text-ink-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={`${uid}-list`}
            role="listbox"
            aria-labelledby={`${uid}-label`}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 z-30 mt-2 origin-top overflow-hidden rounded-2xl border border-ink/10 bg-white p-1.5 shadow-lift"
          >
            {options.map((o, i) => {
              const OptIcon = o.icon;
              const isSel = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${uid}-opt-${i}`}
                  role="option"
                  aria-selected={isSel}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(o.value)}
                  className={`flex min-h-[56px] cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${i === active ? 'bg-signal-50' : ''}`}
                >
                  {OptIcon && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal-50 text-signal-600">
                      <OptIcon size={19} aria-hidden="true" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink">{o.label}</span>
                    {o.desc && <span className="block truncate text-sm text-ink-500">{o.desc}</span>}
                  </span>
                  {isSel && <Check size={18} className="shrink-0 text-signal" aria-hidden="true" />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      <div aria-live="polite" className="min-h-[22px] pt-1 text-sm">
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 font-medium text-red-600">
            <CircleAlert size={15} aria-hidden="true" /> {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}
