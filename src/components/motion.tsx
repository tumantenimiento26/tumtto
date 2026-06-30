'use client';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';

/**
 * Animation primitives shared by every screen. Wraps framer-motion with the
 * prototype's easing/timings so screens stay declarative: <FadeIn>, <Stagger>,
 * <Reveal>. Page transitions live in PageTransition (used by role layouts).
 */
const EASE = [0.2, 0.7, 0.3, 1] as const;

export { motion, AnimatePresence };

export function FadeIn({ delay = 0, y = 8, children, ...rest }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Stagger a list of children in. Wrap items in <StaggerItem>. */
export function Stagger({ children, className, gap = 0.06 }: { children: React.ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Reveal a timeline/progress step when it becomes active. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Tap/hover spring used on cards and buttons. Spread onto a motion element. */
export const pressable = {
  whileHover: { y: -2, boxShadow: 'var(--shadow-hover)' },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15, ease: EASE },
};

/** Page-level enter/exit transition for route content. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Animated progress bar fill (wizard, execution). value 0..1. */
export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}>
      <motion.div
        className="h-full bg-grad-progress"
        initial={false}
        animate={{ width: `${Math.round(value * 100)}%` }}
        transition={{ duration: 0.45, ease: EASE }}
      />
    </div>
  );
}
