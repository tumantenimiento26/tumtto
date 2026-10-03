import { getProfile } from '@/lib/data/store';
import {
  AVATAR_ART,
  AVATAR_LABEL,
  OUTLINE,
  STROKE,
  resolveAvatar,
} from '@/lib/avatarArt';

/**
 * Ícono de perfil (6 personajes de mantenimiento, viewBox 48×48). Solo lectura
 * en el panel. Port del render de tumtto-mobile (`avatarIcons.tsx`).
 */
export function ProfileIcon({
  icon,
  userId,
  size = 40,
  className,
}: {
  icon?: string | null;
  userId?: string | null;
  size?: number;
  className?: string;
}) {
  const key = resolveAvatar(icon, userId);
  const art = AVATAR_ART[key];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={`Ícono de perfil ${AVATAR_LABEL[key]}`}
      className={`shrink-0 ${className ?? ''}`}
    >
      <circle cx={24} cy={24} r={24} fill={art.tint} />
      {art.shapes.map((s, i) => {
        if (s.k === 'circle')
          return (
            <circle
              key={i}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={s.fill}
              stroke={s.stroke ? OUTLINE : undefined}
              strokeWidth={s.stroke ? 1.4 : undefined}
            />
          );
        if (s.k === 'line')
          return (
            <path
              key={i}
              d={s.d}
              fill="none"
              stroke={s.color ?? OUTLINE}
              strokeWidth={s.sw ?? STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        return (
          <path
            key={i}
            d={s.d}
            fill={s.fill}
            stroke={OUTLINE}
            strokeWidth={STROKE}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** ProfileIcon de un usuario por id: toma `avatar_icon` del perfil cargado. */
export const UserIcon = ({ userId, size }: { userId: string; size?: number }) => (
  <ProfileIcon icon={getProfile(userId)?.avatar_icon} userId={userId} size={size} />
);
