import { motion } from 'framer-motion';

// Each word rises out of a mask. Plays once, on load.
export default function KineticText({ text, className = '', delay = 0 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span key={i} aria-hidden="true">
          {i > 0 && ' '}
          <span className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: '115%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.75, delay: delay + i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {word}
            </motion.span>
          </span>
        </span>
      ))}
    </span>
  );
}
