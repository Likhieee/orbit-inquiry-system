import { motion } from 'framer-motion';
import { CATEGORIES, byValue } from '../lib/constants.js';

// Each category icon has its own small idle motion. Framer Motion turns movement off when the OS asks for reduced motion.
const idle = {
  scholarship: { animate: { rotate: [0, -12, 10, -6, 0], y: [0, -3, 0] }, transition: { duration: 4.5, repeat: Infinity, repeatDelay: 1.2 } },
  concert: { animate: { y: [0, -5, 0], rotate: [0, 7, -7, 0] }, transition: { duration: 2.8, repeat: Infinity } },
  admission: { animate: { scaleX: [1, 0.82, 1] }, transition: { duration: 3.2, repeat: Infinity, repeatDelay: 0.8 } },
  general_query: { animate: { scale: [1, 1.12, 1] }, transition: { duration: 2.4, repeat: Infinity } },
};

export default function CategoryIcon({ category, size = 28, still = false }) {
  const Icon = byValue(CATEGORIES, category).icon;
  return (
    <motion.span className="inline-flex" {...(still ? {} : idle[category])}>
      <Icon size={size} strokeWidth={2} aria-hidden="true" />
    </motion.span>
  );
}
