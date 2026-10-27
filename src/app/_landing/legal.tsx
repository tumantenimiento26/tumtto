import Link from 'next/link';
import { ChevronLeft, TriangleAlert } from 'lucide-react';
import { BrandMark } from '@/components/ui';
import { CONTACT, mailLink } from '@/lib/contact';
import './landing.css';

// Layout compartido de las páginas legales públicas (aviso, términos,
// eliminación de cuenta). Las tiendas enlazan aquí: deben cargar sin sesión.

export function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`s${n}`} className="border-t border-lp-line pt-7">
      <h2
        id={`s${n}`}
        className="mb-3 font-display text-[22px] font-extrabold tracking-[-0.4px] text-lp-text"
      >
        <span className="mr-2 font-mono text-[13px] font-semibold text-[var(--lp-cyan)]">
          {String(n).padStart(2, '0')}
        </span>
        {title}
      </h2>
      <div className="flex flex-col gap-3 text-[15.5px] leading-[1.7] text-lp-body">
        {children}
      </div>
    </section>
  );
}

export const ul = 'list-disc space-y-1.5 pl-5 marker:text-[var(--lp-cyan)]';

/** Correo de contacto como enlace (o texto genérico si no está configurado). */
export function ContactEmail() {
  const mail = mailLink();
  return mail ? (
    <a
      href={mail}
      className="font-semibold text-[var(--lp-link)] hover:text-white"
    >
      {CONTACT.email}
    </a>
  ) : (
    <>nuestro correo de contacto</>
  );
}

/** Marca un dato que el responsable aún debe confirmar. */
export function Pending({ children }: { children: React.ReactNode }) {
  return <span className="text-[var(--lp-warn)]">[{children}]</span>;
}

export function LegalPage({
  title,
  updated,
  draft = true,
  children,
}: {
  title: string;
  updated: string;
  draft?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="lp-root min-h-screen font-sans">
      <header className="border-b border-lp-line">
        <div className="mx-auto flex h-[68px] max-w-[860px] items-center gap-4 px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={30} />
            <span className="font-display text-[17px] font-extrabold text-white">
              Tumantenimiento
            </span>
          </Link>
          <Link
            href="/"
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-btn border border-white/[0.22] px-3.5 font-display text-[14px] font-bold text-white transition-colors hover:bg-white/[0.08]"
          >
            <ChevronLeft size={16} aria-hidden /> Volver al sitio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[860px] px-6 pb-24 pt-12">
        <p className="mb-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lp-cyan)]">
          Legal
        </p>
        <h1 className="mb-3 font-display text-[clamp(34px,5vw,50px)] font-extrabold leading-[1.05] tracking-[-1.2px] text-lp-text">
          {title}
        </h1>
        <p className="mb-6 text-[13px] text-[var(--lp-dim)]">
          Última actualización: {updated}
        </p>

        {draft && (
          <div
            role="note"
            className="mb-10 flex items-start gap-3 rounded-[14px] border border-[rgba(245,185,74,0.4)] bg-[rgba(245,185,74,0.08)] px-4 py-3.5 text-[14px] leading-[1.55] text-[var(--lp-warn)]"
          >
            <TriangleAlert
              size={18}
              className="mt-0.5 flex-shrink-0"
              aria-hidden
            />
            <p>
              <strong className="font-bold">
                Borrador pendiente de revisión legal.
              </strong>{' '}
              Este texto es provisional y puede cambiar antes de su publicación
              definitiva.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-8">{children}</div>
      </main>
    </div>
  );
}
