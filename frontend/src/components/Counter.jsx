import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export default function Counter({ value }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => Math.round(v).toLocaleString('en-IN'));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: 'easeOut' });
    return () => controls.stop();
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}
