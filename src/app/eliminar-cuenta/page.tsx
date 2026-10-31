import type { Metadata } from 'next';
import { ContactEmail, LegalPage, Section, ul } from '../_landing/legal';

// Google Play exige una URL pública para solicitar la eliminación de la cuenta.
export const metadata: Metadata = {
  title: 'Eliminar mi cuenta · Tumantenimiento',
  description:
    'Cómo eliminar tu cuenta de Tumantenimiento y qué datos se borran.',
};

export default function EliminarCuentaPage() {
  return (
    <LegalPage
      title="Eliminar mi cuenta"
      updated="26 de octubre de 2026"
      draft={false}
    >
      <Section n={1} title="Desde la app">
        <ul className={ul}>
          <li>Abre la app de Tumantenimiento e inicia sesión.</li>
          <li>Ve a Perfil › Ajustes › Eliminar mi cuenta y confirma.</li>
          <li>
            Antes debes terminar o cancelar tus servicios en curso y no tener
            disputas ni saldos pendientes.
          </li>
        </ul>
      </Section>

      <Section n={2} title="Sin la app">
        <p>
          Escríbenos a <ContactEmail /> desde el correo de tu cuenta con el
          asunto «Eliminar mi cuenta». Confirmaremos tu identidad y
          registraremos tu solicitud en un máximo de 5 días hábiles; desde ahí
          aplican los mismos plazos que en la app.
        </p>
      </Section>

      <Section n={3} title="Qué se borra y qué se conserva">
        <ul className={ul}>
          <li>
            Tu cuenta se elimina 30 días después de la solicitud. Durante ese
            plazo puedes cancelarla desde Ajustes en la app.
          </li>
          <li>
            Pasados los 30 días borramos o anonimizamos tus datos de perfil,
            ubicación, fotos, documentos y datos de verificación.
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
