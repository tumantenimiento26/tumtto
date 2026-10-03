// Única fuente de verdad de los canales de contacto públicos (landing, footer,
// aviso de privacidad, botón flotante). Cada canal viene de NEXT_PUBLIC_CONTACT_*;
// `null` = no confirmado → el canal no se renderiza en ningún lado.
//
// TODO(confirmar con Tu Mantenimiento): número de WhatsApp, teléfono, correo
// de soporte y URLs de redes. Hasta entonces solo el correo (con valor por
// defecto) aparece en producción.

export type SocialKey =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'linkedin'
  | 'youtube'
  | 'x';

export const SOCIAL_LABEL: Record<SocialKey, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  x: 'X',
};

export const SOCIAL_KEYS = Object.keys(SOCIAL_LABEL) as SocialKey[];

export type ContactConfig = {
  /** Solo dígitos con lada de país ("523312345678"), formato wa.me. */
  whatsapp: string | null;
  whatsappMessage: string;
  /** Solo dígitos con lada de país ("523312345678"). */
  phone: string | null;
  email: string | null;
  socials: Record<SocialKey, string | null>;
};

export const DEFAULT_EMAIL = 'soporte@tumantenimiento.mx';
export const DEFAULT_WHATSAPP_MESSAGE =
  'Hola, me gustaría información sobre Tumantenimiento.';

/**
 * Teléfono (con o sin +52, espacios, guiones, "1" móvil histórico) → solo
 * dígitos con lada de país. null si no parece un número mexicano de 10 dígitos.
 */
export function normalizeMxPhone(raw: string | null | undefined): string | null {
  const national = nationalMx(raw);
  return national ? `52${national}` : null;
}

/** Los 10 dígitos nacionales de un teléfono MX, o null. */
export function nationalMx(raw: string | null | undefined): string | null {
  let d = (raw ?? '').replace(/\D/g, '');
  if (d.length === 13 && d.startsWith('521')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('52')) d = d.slice(2);
  return d.length === 10 ? d : null;
}

/** Solo http(s); cualquier otra cosa (javascript:, vacío) se descarta. */
export function safeUrl(raw: string | null | undefined): string | null {
  const v = raw?.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

const clean = (v: string | undefined) => v?.trim() || null;

export function buildContact(env: Record<string, string | undefined>): ContactConfig {
  const email = clean(env.NEXT_PUBLIC_CONTACT_EMAIL) ?? DEFAULT_EMAIL;
  return {
    whatsapp: normalizeMxPhone(env.NEXT_PUBLIC_CONTACT_WHATSAPP),
    whatsappMessage:
      clean(env.NEXT_PUBLIC_CONTACT_WHATSAPP_MESSAGE) ?? DEFAULT_WHATSAPP_MESSAGE,
    phone: normalizeMxPhone(env.NEXT_PUBLIC_CONTACT_PHONE),
    email: /^\S+@\S+\.\S+$/.test(email) ? email : DEFAULT_EMAIL,
    socials: {
      facebook: safeUrl(env.NEXT_PUBLIC_CONTACT_FACEBOOK),
      instagram: safeUrl(env.NEXT_PUBLIC_CONTACT_INSTAGRAM),
      tiktok: safeUrl(env.NEXT_PUBLIC_CONTACT_TIKTOK),
      linkedin: safeUrl(env.NEXT_PUBLIC_CONTACT_LINKEDIN),
      youtube: safeUrl(env.NEXT_PUBLIC_CONTACT_YOUTUBE),
      x: safeUrl(env.NEXT_PUBLIC_CONTACT_X),
    },
  };
}

// Next solo inlinea `process.env.NEXT_PUBLIC_*` con acceso estático.
export const CONTACT: ContactConfig = buildContact({
  NEXT_PUBLIC_CONTACT_WHATSAPP: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP,
  NEXT_PUBLIC_CONTACT_WHATSAPP_MESSAGE:
    process.env.NEXT_PUBLIC_CONTACT_WHATSAPP_MESSAGE,
  NEXT_PUBLIC_CONTACT_PHONE: process.env.NEXT_PUBLIC_CONTACT_PHONE,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_CONTACT_FACEBOOK: process.env.NEXT_PUBLIC_CONTACT_FACEBOOK,
  NEXT_PUBLIC_CONTACT_INSTAGRAM: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM,
  NEXT_PUBLIC_CONTACT_TIKTOK: process.env.NEXT_PUBLIC_CONTACT_TIKTOK,
  NEXT_PUBLIC_CONTACT_LINKEDIN: process.env.NEXT_PUBLIC_CONTACT_LINKEDIN,
  NEXT_PUBLIC_CONTACT_YOUTUBE: process.env.NEXT_PUBLIC_CONTACT_YOUTUBE,
  NEXT_PUBLIC_CONTACT_X: process.env.NEXT_PUBLIC_CONTACT_X,
});

/** https://wa.me/<número>?text=<mensaje>. Sin número → null. */
export function waLink(
  number: string | null = CONTACT.whatsapp,
  message: string | null = CONTACT.whatsappMessage,
): string | null {
  const n = normalizeMxPhone(number);
  if (!n) return null;
  return message
    ? `https://wa.me/${n}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${n}`;
}

/** tel:+52…. Sin número → null. */
export function telLink(number: string | null = CONTACT.phone): string | null {
  const n = normalizeMxPhone(number);
  return n ? `tel:+${n}` : null;
}

/** mailto:… con asunto opcional. */
export function mailLink(
  email: string | null = CONTACT.email,
  subject?: string,
): string | null {
  if (!email) return null;
  return subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
}

/** "+52 33 1234 5678" para mostrar. */
export function displayPhone(n: string | null): string {
  const national = nationalMx(n);
  return national
    ? `+52 ${national.slice(0, 2)} ${national.slice(2, 6)} ${national.slice(6)}`
    : '';
}

/** Redes configuradas, en orden estable. */
export function activeSocials(
  c: ContactConfig = CONTACT,
): { key: SocialKey; label: string; href: string }[] {
  return SOCIAL_KEYS.flatMap(key =>
    c.socials[key] ? [{ key, label: SOCIAL_LABEL[key], href: c.socials[key]! }] : [],
  );
}
