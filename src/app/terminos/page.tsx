import type { Metadata } from 'next';
import {
  ContactEmail,
  LegalPage,
  Pending,
  Section,
  ul,
} from '../_landing/legal';

export const metadata: Metadata = {
  title: 'Términos y condiciones · Tumantenimiento',
  description: 'Condiciones de uso de la app y el sitio de Tumantenimiento.',
};

// Borrador: el texto legal definitivo lo revisa y aprueba el responsable.
const UPDATED = '31 de octubre de 2026';

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones" updated={UPDATED}>
      <Section n={1} title="Quiénes somos">
        <p>
          Tumantenimiento <Pending>razón social por confirmar</Pending> opera
          una plataforma que conecta a personas que necesitan servicios de
          mantenimiento en su hogar (clientes) con técnicos independientes
          verificados en la Zona Metropolitana de Guadalajara. Al crear una
          cuenta o usar la app aceptas estos términos y nuestro{' '}
          <a
            href="/aviso-de-privacidad"
            className="font-semibold text-[var(--lp-link)] hover:text-white"
          >
            aviso de privacidad
          </a>
          .
        </p>
      </Section>

      <Section n={2} title="Cuentas">
        <p>
          Debes ser mayor de 18 años y darnos información verdadera. Eres
          responsable de lo que ocurra con tu cuenta. Los técnicos deben
          completar la verificación de identidad y documentos antes de recibir
          servicios.
        </p>
        <p>
          La app puede enviarte notificaciones sobre tus servicios. Puedes
          desactivarlas en la configuración de la app o de tu teléfono, aunque
          podrías dejar de recibir avisos importantes.
        </p>
      </Section>

      <Section n={3} title="Servicios, cotizaciones y pagos">
        <ul className={ul}>
          <li>
            Cada servicio incluye una visita de diagnóstico. El técnico cotiza
            el trabajo en tu domicilio y solo se realiza si apruebas la
            cotización en la app.
          </li>
          <li>
            Los pagos se hacen en persona al técnico (efectivo) o por
            transferencia a la cuenta que indique Tumantenimiento; ambas partes
            confirman el pago en la app.
          </li>
          <li>
            Puedes cancelar una solicitud desde la app; los cargos por
            cancelación, si aplican, se muestran antes de confirmar.
          </li>
        </ul>
      </Section>

      <Section n={4} title="Conducta y contenido de los usuarios">
        <p>
          El chat, las fotos, las reseñas y demás contenido que publiques deben
          ser respetuosos y relacionados con el servicio.{' '}
          <strong>
            No toleramos contenido ofensivo, acoso, discriminación, amenazas,
            contenido sexual, spam ni fraude.
          </strong>
        </p>
        <ul className={ul}>
          <li>
            Puedes reportar un mensaje, una reseña o a un usuario, y bloquear a
            un usuario, desde la app.
          </li>
          <li>
            Revisamos los reportes en un plazo máximo de 24 horas, retiramos el
            contenido que incumpla estos términos y podemos suspender o cancelar
            la cuenta de quien lo publicó.
          </li>
        </ul>
      </Section>

      <Section n={5} title="Responsabilidad">
        <p>
          Los técnicos son prestadores independientes y responden por la calidad
          de su trabajo. Tumantenimiento verifica su identidad y documentos, da
          seguimiento a cada servicio y media en aclaraciones y disputas a
          través de soporte.
        </p>
      </Section>

      <Section n={6} title="Garantía de 30 días">
        <ul className={ul}>
          <li>
            Los trabajos pagados a través de Tumantenimiento tienen una garantía
            de mano de obra de 30 días naturales a partir de la fecha de pago.
          </li>
          <li>
            Si en ese plazo vuelve a presentarse la misma falla en el trabajo
            realizado, repórtala desde la app (Ajustes › Centro de ayuda) o a{' '}
            <ContactEmail /> y coordinaremos una visita sin costo del mismo
            técnico o de otro técnico verificado.
          </li>
          <li>
            No cubre refacciones o materiales (aplica la garantía de su
            fabricante), fallas distintas a las del trabajo realizado, daños por
            mal uso, accidentes o intervención de terceros, ni trabajos pagados
            fuera de la plataforma.
          </li>
          <li>
            Si la falla no puede corregirse, revisaremos tu caso y podremos
            reembolsar total o parcialmente la mano de obra. Esto no limita tus
            derechos conforme a la Ley Federal de Protección al Consumidor.
          </li>
        </ul>
      </Section>

      <Section n={7} title="Cancelación de la cuenta">
        <p>
          Puedes eliminar tu cuenta en cualquier momento desde la app o como se
          explica en{' '}
          <a
            href="/eliminar-cuenta"
            className="font-semibold text-[var(--lp-link)] hover:text-white"
          >
            tumtto.mx/eliminar-cuenta
          </a>
          . Podemos suspender cuentas que incumplan estos términos.
        </p>
      </Section>

      <Section n={8} title="Contacto y cambios">
        <p>
          Dudas: <ContactEmail />. Podemos actualizar estos términos; la versión
          vigente estará siempre en esta página con su fecha de actualización.
          Estos términos se rigen por las leyes federales de México. Para
          cualquier controversia, las partes se someten a los tribunales
          competentes de Guadalajara, Jalisco, sin perjuicio de tu derecho a
          acudir a la Procuraduría Federal del Consumidor (PROFECO).
        </p>
      </Section>
    </LegalPage>
  );
}
