import { CONTACT, activeSocials } from '@/lib/contact';
import { SOCIAL_ICON } from './brand-icons';

/** Redes configuradas (nueva pestaña, noopener). Sin ninguna → no renderiza. */
export function SocialLinks({
  className = '',
  size = 18,
}: {
  className?: string;
  size?: number;
}) {
  const items = activeSocials(CONTACT);
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Redes sociales">
      {items.map(({ key, label, href }) => {
        const Icon = SOCIAL_ICON[key];
        return (
          <li key={key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (se abre en una pestaña nueva)`}
              title={label}
              className="flex h-11 w-11 items-center justify-center rounded-btn border border-lp-line bg-white/[0.04] text-[var(--lp-soft)] transition-[transform,background,color,border-color] duration-150 hover:-translate-y-0.5 hover:border-[var(--lp-cyan)] hover:bg-white/[0.08] hover:text-white"
            >
              <Icon size={size} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
