import type { Metadata } from 'next';
import { ContactEmail, LegalPage, Section, ul } from '../_landing/legal';
import { DeletionRequest } from './DeletionRequest';

// Google Play exige una URL pública que permita solicitar la eliminación de la
// cuenta y sus datos sin tener la app instalada.
export const metadata: Metadata = {
  title: 'Eliminar mi cuenta · Tumantenimiento',
  description:
    'Solicita la eliminación de tu cuenta de Tumantenimiento desde la app o desde esta página, y consulta qué datos se borran.',
};

export default function EliminarCuentaPage() {
  return (
    <LegalPage
      title="Eliminar mi cuenta"
      updated="3 de noviembre de 2026"
      draft={false}
    >
      <p className="text-[15.5px] leading-[1.7] text-lp-body">
        Esta página es para eliminar tu cuenta de la app Tumantenimiento
        (clientes y técnicos) y los datos asociados. Puedes hacerlo desde la app
        o aquí mismo, aunque ya no tengas la app instalada.
      </p>

      <Section n={1} title="Desde la app">
        <ul className={ul}>
          <li>Abre la app Tumantenimiento e inicia sesión.</li>
          <li>Ve a Perfil › Ajustes › Eliminar mi cuenta y confirma.</li>
        </ul>
      </Section>

      <Section n={2} title="Desde esta página">
        <p>
          Inicia sesión con tu cuenta, escribe ELIMINAR y confirma. Tu solicitud
          queda registrada igual que si la hicieras en la app.
        </p>
        <DeletionRequest />
        <p>
          Antes debes terminar o cancelar tus servicios en curso y no tener
          disputas, retiros ni saldos pendientes; si los hay, te diremos cuál.
        </p>
        <p>
          Si no puedes iniciar sesión, escríbenos a <ContactEmail /> desde el
          correo de tu cuenta con el asunto «Eliminar mi cuenta». Confirmaremos
          tu identidad y registraremos tu solicitud en un máximo de 5 días
          hábiles; desde ahí aplican los mismos plazos.
        </p>
      </Section>

      <Section n={3} title="Qué se borra y qué se conserva">
        <ul className={ul}>
          <li>
            Tu cuenta se elimina 30 días después de la solicitud. Durante ese
            plazo puedes cancelarla en esta página o desde Ajustes en la app.
          </li>
          <li>
            Pasados los 30 días cerramos tus sesiones y borramos o anonimizamos
            tus datos de perfil (nombre, correo, teléfono), ubicación, fotos,
            documentos, datos bancarios, mensajes y datos de verificación.
          </li>
          <li>
            Conservamos bloqueados, durante 5 años, solo los registros de
            servicios y pagos que la ley fiscal nos obliga a guardar, y después
            los eliminamos.
          </li>
        </ul>
      </Section>
    </LegalPage>
  );
}
