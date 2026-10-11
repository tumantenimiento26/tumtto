'use client';

import { useRef } from 'react';
import './landing.css';
import { useReducedMotion, useReveal } from './hooks';
import { Background, Hero, Nav, Stats } from './top';
import { ContactSection, WhatsAppFab } from './contact';
import { Categories, HowItWorks, Verified } from './middle';
import {
  Coverage,
  Faq,
  FinalCta,
  Footer,
  ForTechs,
  Pricing,
  Reviews,
} from './bottom';

/**
 * Landing pública (handoff web, sección A). Tema azul fijo; efectos de
 * scroll/cursor desactivados con prefers-reduced-motion o ?movimiento=reducido.
 */
export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useReveal(root, reduced);

  return (
    <div
      ref={root}
      className={`lp-root relative min-h-screen font-sans ${reduced ? 'lp-still' : 'lp-rv'}`}
    >
      <noscript>
        <style>{'.lp-rv [data-reveal]{opacity:1;transform:none}'}</style>
      </noscript>
      <Background />
      <Nav />
      <main>
        <Hero reduced={reduced} />
        <Stats reduced={reduced} />
        <Categories reduced={reduced} />
        <HowItWorks />
        <Verified reduced={reduced} />
        <Reviews />
        <Coverage />
        <Pricing />
        <ForTechs />
        <Faq />
        <FinalCta />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
