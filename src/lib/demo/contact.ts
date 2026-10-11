// Mensajes de contacto de la maqueta (Soporte › Contacto).
import type { ContactMessage } from '@/lib/contactAdmin';

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

const base = {
  consent_at: ago(0),
  source: 'landing',
  ip_hash: null,
  user_agent: null,
  handled_by: null,
  handled_at: null,
  admin_note: null,
  updated_at: ago(0),
} as const;

export function demoContactMessages(): ContactMessage[] {
  return [
    {
      ...base,
      id: 'mock-cm-1',
      name: 'Mariana Ochoa',
      email: 'mariana.ochoa@correo.mx',
      phone: '3312345678',
      contact_type: 'client',
      message:
        'Hola, tengo una fuga en el baño de mi departamento en Zapopan y quisiera saber si pueden mandar a alguien hoy. También me gustaría conocer el costo aproximado.',
      email_status: 'sent',
      status: 'new',
      created_at: ago(18),
    },
    {
      ...base,
      id: 'mock-cm-2',
      name: 'Inmobiliaria Verde SA de CV',
      email: 'operaciones@inmoverde.mx',
      phone: '3398765432',
      contact_type: 'company',
      message:
        'Administramos 40 departamentos en Guadalajara y buscamos un proveedor de mantenimiento recurrente. ¿Tienen planes para empresas o facturación mensual?',
      email_status: 'sent',
      status: 'new',
      created_at: ago(190),
    },
    {
      ...base,
      id: 'mock-cm-3',
      name: 'Luis Alberto Ramírez',
      email: 'luis.ramirez@correo.mx',
      phone: '3311223344',
      contact_type: 'technician',
      message:
        'Soy electricista con 8 años de experiencia y cuento con herramienta propia. Quiero registrarme pero no me llega el correo de confirmación.',
      email_status: 'skipped',
      status: 'new',
      created_at: ago(60 * 26),
    },
    {
      ...base,
      id: 'mock-cm-4',
      name: 'Daniela Fuentes',
      email: 'dani.fuentes@correo.mx',
      phone: '3355667788',
      contact_type: 'other',
      message: 'Les escribo para una colaboración con mi canal de remodelación del hogar.',
      email_status: 'failed',
      status: 'handled',
      handled_by: 'mock-admin',
      handled_at: ago(60 * 30),
      admin_note: 'Se respondió por correo; quedó en enviar media kit.',
      created_at: ago(60 * 52),
    },
    {
      ...base,
      id: 'mock-cm-5',
      name: 'Pedro Gallegos',
      email: 'pedro.g@correo.mx',
      phone: '3344556677',
      contact_type: 'client',
      message: 'Prueba del formulario, favor de ignorar este mensaje.',
      email_status: 'sent',
      status: 'archived',
      handled_by: 'mock-admin',
      handled_at: ago(60 * 70),
      admin_note: 'Prueba interna.',
      created_at: ago(60 * 96),
    },
  ];
}
