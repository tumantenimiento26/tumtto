'use client';

import { useEffect, useId, useRef, type CSSProperties } from 'react';
import {
  NO_BLINK,
  avatarMarkup,
  avatarName,
  resolveAvatarSource,
  type AvatarBg,
} from '@/lib/avatars';

const STATUS = {
  online: ['#18A66A', 'En línea'],
  busy: ['#F59E0B', 'En servicio'],
  offline: ['#9CA3AF', 'Desconectado'],
} as const;

export type AvatarStatus = keyof typeof STATUS;

/** Hash estable (SSR-safe) -> [0,1) para variar el parpadeo por instancia. */
function unit(s: string, salt: number) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Avatar ilustrado Tumtto (handoff de avatares). La foto gana sobre el id;
 * id desconocido -> silueta. Movimiento en globals.css (`.tmav`): entrada una
 * vez al hacerse visible, parpadeo con retraso/duración propios, inclinación
 * al hover/foco del control ancestro, anillo `online`. `motion="none"` o
 * prefers-reduced-motion lo dejan estático. Insignias fuera del recorte.
 */
export function Avatar({
  avatarId,
  photoUrl,
  size = 40,
  shape = 'circle',
  bg = 'tint',
  status,
  verified = false,
  edge = '#FFFFFF',
  motion = 'auto',
  label,
  decorative = false,
  className = '',
}: {
  avatarId?: string | null;
  photoUrl?: string | null;
  size?: number;
  shape?: 'circle' | 'squircle';
  bg?: AvatarBg;
  status?: AvatarStatus;
  verified?: boolean;
  /** Color de la superficie donde se apoyan las insignias. */
  edge?: string;
  motion?: 'auto' | 'none';
  label?: string;
  /** Con el nombre de la persona al lado: oculto a lectores de pantalla. */
  decorative?: boolean;
  className?: string;
}) {
  const uid = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const src = resolveAvatarSource(avatarId, photoUrl);
  const still = motion === 'none';

  useEffect(() => {
    const el = ref.current;
    if (!el || still) return;
    if (!('IntersectionObserver' in window)) {
      el.dataset.in = '';
      return;
    }
    const io = new IntersectionObserver(
      es => {
        if (es.some(e => e.isIntersecting)) {
          el.dataset.in = '';
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  const b = Math.max(9, Math.round(size * 0.27));
  const bw = Math.max(2, Math.round(size * 0.045));
  const inset =
    shape === 'circle' ? Math.round(size * 0.02) : -Math.round(b * 0.18);
  const st = status ? STATUS[status] : null;
  const name = src.kind === 'art' ? avatarName(src.id) : 'foto';
  const aria =
    (label ?? `Avatar ${name}`) +
    (st ? ` · ${st[1]}` : '') +
    (verified ? ' · verificado' : '');
  const blink = src.kind === 'art' && !NO_BLINK.has(src.id);

  const style = {
    width: size,
    height: size,
    '--av-r': shape === 'squircle' ? `${Math.round(size * 0.28)}px` : '50%',
    '--av-b': `${b}px`,
    '--av-bw': `${bw}px`,
    '--av-inset': `${inset}px`,
    '--av-edge': edge,
    '--av-st': st?.[0] ?? 'transparent',
    '--blink-dur': `${(4.2 + unit(uid, 1) * 2.6).toFixed(2)}s`,
    '--blink-delay': `${(unit(uid, 2) * 4).toFixed(2)}s`,
  } as CSSProperties;

  return (
    <span
      ref={ref}
      className={`tmav ${className}`}
      data-still={still ? '' : undefined}
      data-status={status}
      data-blink={blink ? '' : undefined}
      style={style}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': aria })}
    >
      <span className="tmav-wrap">
        <span className="tmav-clip">
          {src.kind === 'photo' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src.url}
              alt=""
              draggable={false}
              className="tmav-photo"
            />
          ) : (
            <svg
              viewBox="0 0 80 80"
              aria-hidden="true"
              dangerouslySetInnerHTML={{
                __html: avatarMarkup(src.id, bg, uid),
              }}
            />
          )}
        </span>
        {st && <span className="tmav-st" />}
        {verified && (
          <span className="tmav-vf">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth={3.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        )}
      </span>
    </span>
  );
}
