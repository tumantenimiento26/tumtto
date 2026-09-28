'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '@/components/ds';
import { AuthShell } from '@/components/auth-shell';
import { appPath, intentUrl, schemeUrl } from '@/lib/appLinks';

/**
 * Respaldo web de un deep link. En Android salta a la app con `intent://`
 * (Chrome cae en `fallbackUrl` si no está instalada); en el resto ofrece el
 * botón con el esquema `tumtto://` y la alternativa web.
 */
export function OpenInApp({
  title,
  body,
  fallbackUrl,
  fallbackLabel,
}: {
  title: string;
  body: string;
  /** Destino si la app no está instalada (tienda o registro web). */
  fallbackUrl: string;
  fallbackLabel: string;
}) {
  const [appHref, setAppHref] = useState<string | null>(null);

  useEffect(() => {
    const { pathname, search, hash, origin } = window.location;
    const path = appPath(pathname, search, hash);
    const fallback = new URL(fallbackUrl, origin).toString();
    if (/Android/i.test(navigator.userAgent)) {
      const href = intentUrl(path, fallback);
      setAppHref(href);
      window.location.replace(href);
    } else {
      setAppHref(schemeUrl(path));
    }
  }, [fallbackUrl]);

  return (
    <AuthShell aside={APP_ASIDE}>
      <div className="animate-up text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-box bg-info-soft text-primary">
          <Smartphone size={28} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-[27px] font-extrabold tracking-[-0.6px] text-navy">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-[360px] text-[14.5px] leading-relaxed text-muted">
          {body}
        </p>
        <div className="mt-7 flex flex-col gap-3">
          {appHref && (
            <Button size="lg" full icon={Smartphone} href={appHref}>
              Abrir en la app
            </Button>
          )}
          <Button size="lg" full variant="secondary" href={fallbackUrl}>
            {fallbackLabel}
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

const APP_ASIDE = {
  kicker: 'Servicios a domicilio · ZMG',
  title: 'Tu casa en buenas manos.',
  lead: 'Solicita, sigue y paga tus servicios desde la app. Técnicos verificados en toda la ZMG.',
  bullets: [
    'Técnicos verificados uno por uno',
    'Pago protegido al terminar',
    'Garantía de 30 días por escrito',
  ],
};
