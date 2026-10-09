// Reglas del formulario de contacto. Iguales a las de la Edge Function
// `contact-submit` (backend: contact.ts); cámbialas en los dos lados.
import { nationalMx } from './contact';

export const CONTACT_TYPES = [
  { value: 'client', label: 'Cliente' },
  { value: 'company', label: 'Empresa' },
  { value: 'technician', label: 'Técnico' },
  { value: 'other', label: 'Otro' },
] as const;
export type ContactType = (typeof CONTACT_TYPES)[number]['value'];

export const CONTACT_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  messageMin: 10,
  messageMax: 2000,
  emailMax: 254,
} as const;

/** Tiempo mínimo de llenado (ms) que exige el servidor; menos = bot. */
export const MIN_FILL_MS = 3000;

export type ContactInput = {
  name: string;
  email: string;
  phone: string;
  contact_type: ContactType | '';
  message: string;
  consent: boolean;
};

export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Error de un solo campo (validación en vivo) o null. */
export function fieldError(field: ContactField, v: ContactInput): string | null {
  switch (field) {
    case 'name': {
      const n = v.name.trim().length;
      if (n < CONTACT_LIMITS.nameMin) return 'Escribe tu nombre (mínimo 2 caracteres).';
      if (n > CONTACT_LIMITS.nameMax) return 'El nombre es demasiado largo.';
      return null;
    }
    case 'email': {
      const e = v.email.trim();
      if (!e) return 'Escribe tu correo.';
      if (e.length > CONTACT_LIMITS.emailMax || !EMAIL_RE.test(e))
        return 'Escribe un correo válido.';
      return null;
    }
    case 'phone':
      return nationalMx(v.phone) ? null : 'Escribe un teléfono de 10 dígitos.';
    case 'contact_type':
      return v.contact_type ? null : 'Elige quién eres.';
    case 'message': {
      const n = v.message.trim().length;
      if (n < CONTACT_LIMITS.messageMin)
        return 'Cuéntanos un poco más (mínimo 10 caracteres).';
      if (n > CONTACT_LIMITS.messageMax) return 'El mensaje es demasiado largo (máx. 2000).';
      return null;
    }
    case 'consent':
      return v.consent ? null : 'Debes aceptar el Aviso de privacidad.';
  }
}

export const CONTACT_FIELDS: ContactField[] = [
  'name',
  'email',
  'phone',
  'contact_type',
  'message',
  'consent',
];

export function validateContact(v: ContactInput): ContactErrors {
  const out: ContactErrors = {};
  for (const f of CONTACT_FIELDS) {
    const e = fieldError(f, v);
    if (e) out[f] = e;
  }
  return out;
}

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  contact_type: ContactType;
  message: string;
  consent: true;
  /** Honeypot: siempre vacío para personas. */
  website: string;
  /** Epoch ms en que se mostró el formulario. */
  started_at: number;
};

/** Cuerpo para la Edge Function. Asume `validateContact(v)` vacío. */
export function buildPayload(
  v: ContactInput,
  startedAt: number,
  website = '',
): ContactPayload {
  return {
    name: v.name.trim(),
    email: v.email.trim(),
    phone: nationalMx(v.phone) ?? v.phone.trim(),
    contact_type: v.contact_type as ContactType,
    message: v.message.trim(),
    consent: true,
    website,
    started_at: startedAt,
  };
}
