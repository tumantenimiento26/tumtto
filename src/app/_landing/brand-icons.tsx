import type { ReactNode } from 'react';
import type { SocialKey } from '@/lib/contact';

// Íconos de marca inline (sin dependencias): trazo de 2px en 24×24 como lucide
// (Facebook, Instagram, LinkedIn, YouTube, ISC) más WhatsApp, TikTok y X.
// Decorativos por sí solos (aria-hidden); el enlace que los contiene lleva el
// aria-label con el nombre de la red.

function Svg({ size, children }: { size: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

type P = { size?: number };

export const WhatsAppIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M3 21l1.65-4.85A9 9 0 1 1 8.1 19.4L3 21z" />
    <path d="M9.4 8.6c-.5.5-.4 1.6.5 3 .9 1.4 2.1 2.4 3.4 2.9 1 .4 1.7-.1 2-.7l-1.8-1.1-.8.6c-.9-.4-1.7-1.2-2.2-2.1l.6-.8-1.1-1.8z" />
  </Svg>
);
export const FacebookIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
);
export const InstagramIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </Svg>
);
export const TikTokIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M9 12a4 4 0 1 0 4 4V3a5 5 0 0 0 5 5" />
  </Svg>
);
export const LinkedInIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </Svg>
);
export const YouTubeIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </Svg>
);
export const XIcon = ({ size = 20 }: P) => (
  <Svg size={size}>
    <path d="M4 4l11.733 16H20L8.267 4z" />
    <path d="M4 20l6.768-6.768m2.46-2.46L20 4" />
  </Svg>
);

export const SOCIAL_ICON: Record<SocialKey, (p: P) => ReactNode> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TikTokIcon,
  linkedin: LinkedInIcon,
  youtube: YouTubeIcon,
  x: XIcon,
};
