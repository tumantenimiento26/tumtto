import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, TriangleAlert } from 'lucide-react';
import { BrandMark } from '@/components/ui';
import { CONTACT, displayPhone, mailLink } from '@/lib/contact';
import '../_landing/landing.css';

export const metadata: Metadata = {
  title: 'Aviso de privacidad · Tumantenimiento',
  description:
    'Cómo Tumantenimiento trata tus datos personales y cómo ejercer tus derechos ARCO.',
};

// Borrador: el texto legal definitivo lo revisa y aprueba el responsable.
const UPDATED = '3 de octubre de 2026';

function Section({
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

const ul = 'list-disc space-y-1.5 pl-5 marker:text-[var(--lp-cyan)]';

export default function AvisoDePrivacidadPage() {
  const mail = mailLink();
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
          Aviso de privacidad
        </h1>
        <p className="mb-6 text-[13px] text-[var(--lp-dim)]">
          Última actualización: {UPDATED}
        </p>

        <div
          role="note"
          className="mb-10 flex items-start gap-3 rounded-[14px] border border-[rgba(245,185,74,0.4)] bg-[rgba(245,185,74,0.08)] px-4 py-3.5 text-[14px] leading-[1.55] text-[var(--lp-warn)]"
        >
          <TriangleAlert size={18} className="mt-0.5 flex-shrink-0" aria-hidden />
          <p>
            <strong className="font-bold">Borrador pendiente de revisión legal.</strong>{' '}
            Este texto es provisional y puede cambiar antes de su publicación
            definitiva.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <Section n={1} title="Responsable del tratamiento">
            <p>
              Tumantenimiento (en adelante, «Tumantenimiento»), con domicilio
              en Guadalajara, Jalisco, México{' '}
              <span className="text-[var(--lp-warn)]">
                [razón social y domicilio fiscal por confirmar]
              </span>
              , es responsable del tratamiento de tus datos personales conforme
              a la Ley Federal de Protección de Datos Personales en Posesión de
              los Particulares (LFPDPPP).
            </p>
          </Section>

          <Section n={2} title="Datos personales que recabamos">
            <p>
              Cuando nos escribes desde el formulario de contacto recabamos:
            </p>
            <ul className={ul}>
              <li>Nombre.</li>
              <li>Correo electrónico.</li>
              <li>Teléfono.</li>
              <li>Tipo de contacto (cliente, empresa, técnico u otro).</li>
              <li>El contenido de tu mensaje.</li>
            </ul>
            <p>
              Por seguridad y para evitar abusos también guardamos de forma
              técnica la fecha de envío y una versión cifrada (hash) de tu
              dirección IP y el navegador utilizado. No recabamos datos
              personales sensibles a través de este formulario.
            </p>
          </Section>

          <Section n={3} title="Finalidades">
            <p>Usamos tus datos para:</p>
            <ul className={ul}>
              <li>Responder tu mensaje y darte seguimiento.</li>
              <li>
                Informarte sobre nuestros servicios cuando lo solicitaste.
              </li>
              <li>
                Prevenir fraude, spam y usos indebidos del formulario.
              </li>
              <li>Llevar estadísticas internas de atención.</li>
            </ul>
            <p>
              No vendemos tus datos ni los usamos para publicidad de terceros.
            </p>
          </Section>

          <Section n={4} title="Transferencias y encargados">
            <p>
              Tus datos pueden ser tratados por proveedores que nos prestan
              servicios de alojamiento y envío de correo, únicamente para las
              finalidades anteriores y bajo obligaciones de confidencialidad.
              No realizamos otras transferencias sin tu consentimiento, salvo
              las exigidas por la ley o por autoridad competente.
            </p>
          </Section>

          <Section n={5} title="Derechos ARCO y revocación">
            <p>
              Tienes derecho a Acceder a tus datos, Rectificarlos si son
              inexactos, Cancelarlos u Oponerte a su tratamiento, así como a
              revocar tu consentimiento. Para ejercerlos, envía una solicitud
              a{' '}
              {mail ? (
                <a
                  href={mail}
                  className="font-semibold text-[var(--lp-link)] hover:text-white"
                >
                  {CONTACT.email}
                </a>
              ) : (
                'nuestro correo de contacto'
              )}{' '}
              indicando tu nombre, el derecho que deseas ejercer y los datos
              con los que nos escribiste. Responderemos en un máximo de 20 días
              hábiles.
            </p>
          </Section>

          <Section n={6} title="Conservación">
            <p>
              Conservamos los mensajes de contacto el tiempo necesario para
              atenderlos y, después, por el plazo que exijan las obligaciones
              legales aplicables{' '}
              <span className="text-[var(--lp-warn)]">[plazo por confirmar]</span>.
            </p>
          </Section>

          <Section n={7} title="Contacto">
            <p>
              Para dudas sobre este aviso:{' '}
              {CONTACT.email && (
                <a
                  href={mail ?? undefined}
                  className="font-semibold text-[var(--lp-link)] hover:text-white"
                >
                  {CONTACT.email}
                </a>
              )}
              {CONTACT.phone && <> · {displayPhone(CONTACT.phone)}</>}.
            </p>
          </Section>

          <Section n={8} title="Cambios al aviso">
            <p>
              Podemos actualizar este aviso. Publicaremos la versión vigente en
              esta misma página, con su fecha de actualización.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}
