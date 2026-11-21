'use client';
import { motion } from 'framer-motion';

/**
 * Primitivas de animación compartidas (framer-motion con la curva de los
 * prototipos). La consola las envuelve en <MotionConfig reducedMotion="user">
 * (admin-shell): con «reducir movimiento» solo quedan los fundidos.
 */
export const EASE = [0.2, 0.7, 0.3, 1] as const;

export { motion };

/** Entrada de la pantalla al navegar dentro de la consola. */
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
