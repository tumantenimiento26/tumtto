'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Smartphone } from 'lucide-react';
import { BrandMark } from '@/components/ui';
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
    <div className="flex min-h-screen items-center justify-center bg-[#081A33] p-4">
      <div className="w-full max-w-[420px] rounded-[20px] bg-surface p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <BrandMark size={44} className="mx-auto mb-5 rounded-xl" />
        <h1 className="mb-2 font-display text-2xl font-semibold text-navy">
          {title}
        </h1>
        <p className="mb-7 text-sm text-muted">{body}</p>
        <div className="flex flex-col gap-3">
          {appHref && (
            <a
              href={appHref}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-all hover:bg-primary-2"
            >
              <Smartphone size={17} />
              Abrir en la app
            </a>
          )}
          <Link
            href={fallbackUrl}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-surface-2"
          >
            {fallbackLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
