'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Loader2, Mail, Phone, RotateCcw, TriangleAlert } from 'lucide-react';
import {
  CONTACT,
  displayPhone,
  mailLink,
  nationalMx,
  telLink,
  waLink,
} from '@/lib/contact';
import {
  CONTACT_FIELDS,
  CONTACT_LIMITS,
  CONTACT_TYPES,
  buildPayload,
  fieldError,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactInput,
} from '@/lib/contactForm';
import { submitContact, submitErrorMessage } from '@/lib/contactSubmit';
import { DEFAULT_COUNTRY, formatNational } from '@/lib/phone';
import { WhatsAppIcon } from './brand-icons';
import { SocialLinks } from './socials';
import { Container, H2, Kicker, Lead } from './bits';

const EMPTY: ContactInput = {
  name: '',
  email: '',
  phone: '',
  contact_type: '',
  message: '',
  consent: false,
};

const INPUT =
  'h-12 w-full rounded-btn border bg-[#0A1830] px-3.5 text-[15px] text-lp-text placeholder:text-[var(--lp-dim)] transition-[border-color,box-shadow] duration-150 hover:border-[rgba(90,176,255,0.32)] focus:border-[var(--lp-cyan)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(24,193,255,0.18)]';
const OK_BORDER = 'border-lp-line';
const ERR_BORDER = 'border-[#ff8a8a]';

function FieldShell({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-[var(--lp-soft)]">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-[12.5px] text-[#ff9b9b]">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-[var(--lp-dim)]">{hint}</p>
      ) : null}
    </div>
  );
}

type Status = 'idle' | 'sending' | 'success' | 'error';

function ContactForm() {
  const [v, setV] = useState<ContactInput>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<ContactField, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [failMsg, setFailMsg] = useState('');
  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Marca de tiempo de cuando se muestra el formulario (el servidor exige ≥ 3 s).
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const errorOf = (f: ContactField) =>
    touched[f] ? (fieldError(f, v) ?? serverErrors[f]) : undefined;

  const set = <K extends ContactField>(f: K, val: ContactInput[K]) => {
    setV(s => ({ ...s, [f]: val }));
    setServerErrors(s => ({ ...s, [f]: undefined }));
  };
  const touch = (f: ContactField) => setTouched(t => ({ ...t, [f]: true }));
  const aria = (f: ContactField) => ({
    'aria-invalid': errorOf(f) ? true : undefined,
    'aria-describedby': errorOf(f) ? `ct-${f}-err` : undefined,
  });
  const border = (f: ContactField) => (errorOf(f) ? ERR_BORDER : OK_BORDER);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    const errors = validateContact(v);
    setTouched(Object.fromEntries(CONTACT_FIELDS.map(f => [f, true])));
    const first = CONTACT_FIELDS.find(f => errors[f]);
    if (first) {
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field="${first}"]`)
        ?.focus();
      return;
    }
    setStatus('sending');
    const r = await submitContact(
      buildPayload(v, startedAt.current, honeypot.current?.value ?? ''),
    );
    if (r.ok) {
      setStatus('success');
      return;
    }
    if (r.kind === 'invalid') setServerErrors(r.errors);
    setFailMsg(submitErrorMessage(r));
    setStatus('error');
  }

  function reset() {
    setV(EMPTY);
    setTouched({});
    setServerErrors({});
    setStatus('idle');
    startedAt.current = Date.now();
  }

  if (status === 'success')
    return (
      <div
        role="status"
        className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--lp-ok-bg)] text-[var(--lp-ok)]">
          <Check size={26} strokeWidth={2.6} aria-hidden />
        </span>
        <h3 className="font-display text-[26px] font-extrabold tracking-[-0.6px] text-lp-text">
          ¡Gracias! Recibimos tu mensaje
        </h3>
        <p className="max-w-[380px] text-[15px] leading-[1.6] text-lp-body">
          Nuestro equipo te responderá por correo o teléfono lo antes posible,
          normalmente en un día hábil.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-1 inline-flex h-11 items-center gap-2 rounded-btn border border-white/[0.22] px-4 font-display text-[14px] font-bold text-white transition-colors hover:bg-white/[0.08]"
        >
          <RotateCcw size={15} aria-hidden /> Enviar otro mensaje
        </button>
      </div>
    );

  const len = v.message.trim().length;
  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell id="ct-name" label="Nombre" error={errorOf('name')}>
          <input
            id="ct-name"
            data-field="name"
            name="name"
            autoComplete="name"
            maxLength={CONTACT_LIMITS.nameMax + 20}
            value={v.name}
            onChange={e => set('name', e.target.value)}
            onBlur={() => touch('name')}
            placeholder="Tu nombre completo"
            className={`${INPUT} ${border('name')}`}
            {...aria('name')}
          />
        </FieldShell>
        <FieldShell id="ct-email" label="Correo" error={errorOf('email')}>
          <input
            id="ct-email"
            data-field="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={v.email}
            onChange={e => set('email', e.target.value)}
            onBlur={() => touch('email')}
            placeholder="tu@correo.com"
            className={`${INPUT} ${border('email')}`}
            {...aria('email')}
          />
        </FieldShell>
      </div>

      <FieldShell
        id="ct-phone"
        label="Teléfono"
        error={errorOf('phone')}
        hint="10 dígitos, con o sin +52."
      >
        <div className="flex gap-2">
          <span
            aria-hidden
            className="flex h-12 flex-shrink-0 items-center rounded-btn border border-lp-line bg-[#0A1830] px-3 font-mono text-[13px] text-[var(--lp-soft)]"
          >
            🇲🇽 +52
          </span>
          <input
            id="ct-phone"
            data-field="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={v.phone}
            onChange={e => {
              const raw = e.target.value;
              const national =
                nationalMx(raw) ??
                raw.replace(/\D/g, '').replace(/^52(?=\d{10,})/, '').slice(0, 10);
              set('phone', formatNational(national, DEFAULT_COUNTRY));
            }}
            onBlur={() => touch('phone')}
            placeholder="33 1234 5678"
            className={`${INPUT} min-w-0 flex-1 ${border('phone')}`}
            {...aria('phone')}
          />
        </div>
      </FieldShell>

      <div>
        <span id="ct-type-l" className="mb-1.5 block text-[13px] font-semibold text-[var(--lp-soft)]">
          Soy…
        </span>
        <div
          role="radiogroup"
          aria-labelledby="ct-type-l"
          className="flex gap-1 rounded-btn bg-[#0A1830] p-1"
        >
          {CONTACT_TYPES.map(t => {
            const on = v.contact_type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={on}
                data-field={t.value === 'client' ? 'contact_type' : undefined}
                onClick={() => {
                  set('contact_type', t.value);
                  touch('contact_type');
                }}
                className={`min-h-[40px] min-w-0 flex-1 rounded-lg px-1.5 text-[13.5px] font-semibold transition-all duration-150 ${
                  on
                    ? 'bg-white text-navy shadow-[0_1px_2px_rgba(14,44,86,0.1)]'
                    : 'text-lp-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {errorOf('contact_type') && (
          <p role="alert" className="mt-1.5 text-[12.5px] text-[#ff9b9b]">
            {errorOf('contact_type')}
          </p>
        )}
      </div>

      <FieldShell id="ct-message" label="Mensaje" error={errorOf('message')}>
        <textarea
          id="ct-message"
          data-field="message"
          name="message"
          rows={5}
          value={v.message}
          onChange={e => set('message', e.target.value)}
          onBlur={() => touch('message')}
          placeholder="Cuéntanos qué necesitas…"
          className={`${INPUT} h-auto resize-y py-3 leading-[1.55] ${border('message')}`}
          {...aria('message')}
        />
        <p
          className={`mt-1 text-right font-mono text-[11px] ${
            len > CONTACT_LIMITS.messageMax ? 'text-[#ff9b9b]' : 'text-[var(--lp-dim)]'
          }`}
          aria-hidden
        >
          {len}/{CONTACT_LIMITS.messageMax}
        </p>
      </FieldShell>

      {/* Honeypot: invisible y fuera del orden de tabulación; solo los bots lo llenan. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Sitio web
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-[1.5] text-[var(--lp-soft)]">
          <input
            type="checkbox"
            data-field="consent"
            checked={v.consent}
            onChange={e => {
              set('consent', e.target.checked);
              touch('consent');
            }}
            aria-invalid={errorOf('consent') ? true : undefined}
            aria-describedby={errorOf('consent') ? 'ct-consent-err' : undefined}
            className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 cursor-pointer accent-[var(--lp-blue)]"
          />
          <span>
            Acepto el{' '}
            <Link
              href="/aviso-de-privacidad"
              target="_blank"
              rel="noopener"
              className="font-semibold text-[var(--lp-link)] underline underline-offset-2 hover:text-white"
            >
              Aviso de privacidad
            </Link>
            .
          </span>
        </label>
        {errorOf('consent') && (
          <p id="ct-consent-err" role="alert" className="mt-1.5 text-[12.5px] text-[#ff9b9b]">
            {errorOf('consent')}
          </p>
        )}
      </div>

      {status === 'error' && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-btn border border-[rgba(255,138,138,0.4)] bg-[rgba(255,138,138,0.08)] px-3.5 py-3 text-[13.5px] text-[#ffb4b4]"
        >
          <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" aria-hidden />
          {failMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex h-[52px] items-center justify-center gap-2 rounded-btn bg-[var(--lp-blue)] px-6 font-display text-[15px] font-bold text-white transition-colors hover:bg-[var(--lp-blue-hover)] disabled:cursor-wait disabled:opacity-80"
      >
        {status === 'sending' ? (
          <>
            <Loader2 size={17} className="animate-spin" aria-hidden /> Enviando…
          </>
        ) : (
          'Enviar mensaje'
        )}
      </button>
    </form>
  );
}

const CARD =
  'lp-glass group flex items-center gap-4 rounded-[14px] p-4 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:!border-[var(--lp-cyan)]';
const TILE =
  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--lp-tile)] text-[var(--lp-cyan)]';

function Channel({
  href,
  icon,
  title,
  value,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={CARD}
    >
      <span className={TILE}>{icon}</span>
      <span className="min-w-0">
        <span className="block font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-dim)]">
          {title}
        </span>
        <span className="block break-words font-display text-[15px] font-bold text-lp-text sm:text-[16px]">
          {value}
        </span>
      </span>
    </a>
  );
}

/** Sección #contacto: formulario + canales directos + redes. */
export function ContactSection() {
  const wa = waLink();
  const tel = telLink();
  const mail = mailLink();
  return (
    <section id="contacto" className="scroll-mt-16">
      <Container className="pb-28 pt-6">
        <div className="mb-10 max-w-[620px]">
          <Kicker>Contacto</Kicker>
          <H2>Hablemos</H2>
          <Lead>
            Escríbenos si eres cliente, empresa o técnico. Te respondemos por el
            canal que prefieras.
          </Lead>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div
            data-reveal="0.05"
            className="lp-glass relative min-w-0 rounded-[20px] p-[clamp(20px,4vw,36px)]"
          >
            <ContactForm />
          </div>
          <div data-reveal="0.1" className="flex min-w-0 flex-col gap-3">
            {wa && (
              <Channel
                href={wa}
                external
                icon={<WhatsAppIcon size={24} />}
                title="WhatsApp"
                value={displayPhone(CONTACT.whatsapp)}
              />
            )}
            {tel && (
              <Channel
                href={tel}
                icon={<Phone size={22} aria-hidden />}
                title="Teléfono"
                value={displayPhone(CONTACT.phone)}
              />
            )}
            {mail && (
              <Channel
                href={mail}
                icon={<Mail size={22} aria-hidden />}
                title="Correo"
                value={CONTACT.email ?? ''}
              />
            )}
            {Object.values(CONTACT.socials).some(Boolean) && (
              <div className="lp-glass rounded-[14px] p-4">
                <p className="mb-3 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--lp-dim)]">
                  Síguenos
                </p>
                <SocialLinks />
              </div>
            )}
            <p className="px-1 pt-1 text-[13px] leading-[1.6] text-[var(--lp-dim)]">
              Atendemos en la Zona Metropolitana de Guadalajara. Para
              emergencias en un servicio activo, usa el chat dentro de la app.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Botón flotante de WhatsApp (solo móvil). Se oculta sobre #contacto y el footer. */
export function WhatsAppFab() {
  const [hidden, setHidden] = useState(false);
  const wa = waLink();
  useEffect(() => {
    const els = ['contacto', 'site-footer']
      .map(id => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    const seen = new Set<Element>();
    const io = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (en.isIntersecting) seen.add(en.target);
        else seen.delete(en.target);
      }
      setHidden(seen.size > 0);
    });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  if (!wa) return null;
  return (
    <a
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp (se abre en una pestaña nueva)"
      tabIndex={hidden ? -1 : undefined}
      className={`fixed bottom-4 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#1FAF5A] text-white shadow-[0_12px_28px_-8px_rgba(31,175,90,0.7)] transition-[opacity,transform] duration-200 active:scale-95 sm:hidden ${
        hidden ? 'pointer-events-none translate-y-3 opacity-0' : ''
      }`}
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}
