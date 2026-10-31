import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleAlert } from 'lucide-react';

// Label above the input (always visible), message below. Space for the message is reserved so the layout never jumps.
export default function Field({ id, label, icon: Icon, as: Tag = 'input', error, valid, hint, className = '', ...props }) {
  const multiline = Tag === 'textarea';
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[15px] font-semibold text-ink-700">{label}</label>
      <div className="relative">
        {Icon && <Icon size={18} className={`pointer-events-none absolute left-3.5 text-ink-300 ${multiline ? 'top-[15px]' : 'top-[15px]'}`} aria-hidden="true" />}
        <Tag
          id={id}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${id}-msg`}
          className={`w-full rounded-xl border bg-white pr-11 text-base text-ink outline-none transition-shadow placeholder:text-ink-300 ${Icon ? 'pl-11' : 'pl-4'} ${
            multiline ? 'min-h-[150px] resize-y py-3' : 'h-12'
          } ${
            error
              ? 'border-red-400 focus:shadow-[0_0_0_4px_rgba(248,113,113,.22)]'
              : 'border-ink-200 focus:border-signal focus:shadow-[0_0_0_4px_rgba(47,91,255,.16)]'
          }`}
          {...props}
        />
        <AnimatePresence>
          {valid && !error && (
            <motion.span
              key="ok"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute right-3.5 top-[14px] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"
            >
              <Check size={13} strokeWidth={3} aria-hidden="true" />
              <span className="sr-only">Looks good</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div id={`${id}-msg`} aria-live="polite" className="min-h-[22px] pt-1 text-sm">
        <AnimatePresence mode="wait" initial={false}>
          {error ? (
            <motion.p key="e" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 font-medium text-red-600">
              <CircleAlert size={15} aria-hidden="true" /> {error}
            </motion.p>
          ) : hint ? (
            <motion.p key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ink-500">{hint}</motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
