import type { Metadata } from 'next';
import { CONTACT, displayPhone } from '@/lib/contact';
import {
  ContactEmail,
  LegalPage,
  Pending,
  Section,
  ul,
} from '../_landing/legal';

export const metadata: Metadata = {
  title: 'Aviso de privacidad · Tumantenimiento',
  description:
    'Cómo Tumantenimiento trata tus datos personales y cómo ejercer tus derechos ARCO.',
};

// Borrador: el texto legal definitivo lo revisa y aprueba el responsable.
const UPDATED = '26 de octubre de 2026';

export default function AvisoDePrivacidadPage() {
  return (
    <LegalPage title="Aviso de privacidad" updated={UPDATED}>
      <Section n={1} title="Responsable del tratamiento">
        <p>
          Tumantenimiento (en adelante, «Tumantenimiento»), con domicilio en
          Guadalajara, Jalisco, México{' '}
          <Pending>razón social y domicilio fiscal por confirmar</Pending>, es
          responsable del tratamiento de tus datos personales conforme a la Ley
          Federal de Protección de Datos Personales en Posesión de los
          Particulares (LFPDPPP).
        </p>
      </Section>

      <Section n={2} title="Datos personales que recabamos">
        <p>Al usar la app y el sitio de Tumantenimiento recabamos:</p>
        <ul className={ul}>
          <li>
            <strong>Cuenta:</strong> nombre, correo, teléfono, fecha de
            nacimiento y foto de perfil.
          </li>
          <li>
            <strong>Ubicación:</strong> la dirección del servicio y, con tu
            permiso y solo mientras usas la app, tu ubicación precisa. Si eres
            técnico, compartimos tu ubicación con el cliente mientras vas en
            camino a su domicilio.
          </li>
          <li>
            <strong>Servicios:</strong> solicitudes, cotizaciones, fotos de
            evidencia, mensajes del chat con el técnico o cliente,
            calificaciones y reseñas, y el registro de pagos en efectivo o
            comprobantes de transferencia.
          </li>
          <li>
            <strong>Documentos:</strong> identificación oficial, comprobante de
            domicilio y, para técnicos, constancia de antecedentes no penales y
            datos bancarios para liquidaciones.
          </li>
          <li>
            <strong>Verificación de identidad (técnicos):</strong> fotografía
            del rostro y prueba de vida, procesadas por nuestro proveedor de
            verificación. Son datos personales sensibles: solo los tratamos con
            tu consentimiento expreso, que otorgas en la app.
          </li>
          <li>
            <strong>Formulario de contacto del sitio:</strong> nombre, correo,
            teléfono, tipo de contacto y tu mensaje, más una versión cifrada
            (hash) de tu IP y navegador para evitar abusos.
          </li>
          <li>
            <strong>Técnicos de dispositivo:</strong> identificador para
            notificaciones y datos mínimos de diagnóstico de la app.
          </li>
        </ul>
        <p>
          No usamos tus datos para rastrearte en apps o sitios de terceros ni
          para publicidad.
        </p>
      </Section>

      <Section n={3} title="Finalidades">
        <p>Usamos tus datos para:</p>
        <ul className={ul}>
          <li>
            Crear tu cuenta, conectar clientes con técnicos y dar seguimiento a
            cada servicio.
          </li>
          <li>Verificar la identidad y los documentos de los técnicos.</li>
          <li>
            Registrar cobros y liquidaciones, y atender aclaraciones y disputas.
          </li>
          <li>
            Moderar reportes de contenido o conductas inapropiadas y prevenir
            fraude.
          </li>
          <li>Responder tus mensajes y enviarte avisos del servicio.</li>
        </ul>
        <p>No vendemos tus datos ni los usamos para publicidad de terceros.</p>
      </Section>

      <Section n={4} title="Transferencias y encargados">
        <p>
          Para operar compartimos datos con: el técnico o cliente de cada
          servicio (nombre, foto, dirección o ubicación y chat, solo lo
          necesario); nuestro proveedor de alojamiento y base de datos; el
          proveedor de verificación de identidad (Didit); el proveedor de mapas
          (Mapbox); y el proveedor de envío de correo. Todos actúan bajo
          obligaciones de confidencialidad. No realizamos otras transferencias
          sin tu consentimiento, salvo las exigidas por la ley o por autoridad
          competente.
        </p>
      </Section>

      <Section n={5} title="Derechos ARCO, revocación y eliminación de cuenta">
        <p>
          Tienes derecho a Acceder a tus datos, Rectificarlos si son inexactos,
          Cancelarlos u Oponerte a su tratamiento, así como a revocar tu
          consentimiento. Escríbenos a <ContactEmail /> con tu nombre, el
          derecho que deseas ejercer y el correo de tu cuenta. Responderemos en
          un máximo de 20 días hábiles.
        </p>
        <p>
          Puedes eliminar tu cuenta desde la app (Ajustes › Eliminar mi cuenta)
          o como se explica en{' '}
          <a
            href="/eliminar-cuenta"
            className="font-semibold text-[var(--lp-link)] hover:text-white"
          >
            tumtto.mx/eliminar-cuenta
          </a>
          .
        </p>
      </Section>

      <Section n={6} title="Conservación">
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Al eliminarla,
          la borramos o anonimizamos 30 días después de tu solicitud;
          conservamos solo los registros de servicios y pagos que exijan las
          obligaciones legales y fiscales aplicables{' '}
          <Pending>plazo por confirmar</Pending>.
        </p>
      </Section>

      <Section n={7} title="Contacto">
        <p>
          Para dudas sobre este aviso: {CONTACT.email && <ContactEmail />}
          {CONTACT.phone && <> · {displayPhone(CONTACT.phone)}</>}.
        </p>
      </Section>

      <Section n={8} title="Cambios al aviso">
        <p>
          Podemos actualizar este aviso. Publicaremos la versión vigente en esta
          misma página, con su fecha de actualización.
        </p>
      </Section>
    </LegalPage>
  );
}
