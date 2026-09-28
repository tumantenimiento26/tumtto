'use client';

import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  FileText,
  Landmark,
  LifeBuoy,
  MapPin,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Scale,
  Search,
  Star,
  Users,
  WifiOff,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  ErrorIllustration,
  ErrorPage,
  IndeterminateBar,
  Kicker,
  Modal,
  PageHeader,
  ScreenSkeleton,
  Skeleton,
  Tabs,
  snackbar,
  toast,
  type EmptyKind,
  type ErrorKind,
} from '@/components/ds';

/* ── Páginas de error ─────────────────────────────────────────────────── */

const ERRORS: {
  kind: ErrorKind;
  code: string;
  title: string;
  description: string;
}[] = [
  {
    kind: '404',
    code: '404',
    title: 'No encontramos esta página',
    description:
      'La dirección no existe o el registro fue eliminado. Revisa el ID o búscalo con ⌘K.',
  },
  {
    kind: '500',
    code: '500',
    title: 'Algo salió mal de nuestro lado',
    description:
      'El servidor no respondió. Ya avisamos al equipo técnico; intenta de nuevo en unos segundos.',
  },
  {
    kind: 'offline',
    code: 'SIN RED',
    title: 'Sin conexión',
    description:
      'No pudimos comunicarnos con el servidor. Los datos que ves pueden estar desactualizados.',
  },
  {
    kind: '403',
    code: '403',
    title: 'No tienes acceso a esta sección',
    description:
      'Tu rol no incluye este permiso. Pide acceso a un administrador.',
  },
  {
    kind: 'maintenance',
    code: 'MANTENIMIENTO',
    title: 'Estamos en mantenimiento',
    description:
      'Volvemos en unos minutos. Las solicitudes en curso no se pierden.',
  },
  {
    kind: 'session',
    code: 'SESIÓN',
    title: 'Tu sesión expiró',
    description:
      'Por seguridad cerramos tu sesión tras un tiempo sin actividad.',
  },
];

const ERROR_ACTIONS: Record<
  ErrorKind,
  {
    primary: { label: string; href?: string };
    secondary?: { label: string; href?: string };
  }
> = {
  '404': {
    primary: { label: 'Ir al dashboard', href: '/dashboard' },
    secondary: { label: 'Ver servicios', href: '/servicios' },
  },
  '500': {
    primary: { label: 'Reintentar' },
    secondary: { label: 'Ir al dashboard', href: '/dashboard' },
  },
  offline: { primary: { label: 'Reintentar' } },
  '403': { primary: { label: 'Volver al dashboard', href: '/dashboard' } },
  maintenance: { primary: { label: 'Actualizar' } },
  session: { primary: { label: 'Iniciar sesión', href: '/login' } },
};

/* ── Estados vacíos ───────────────────────────────────────────────────── */

type EmptyGroup =
  'Primer uso' | 'Sin resultados' | 'Todo al día' | 'Requiere acción';

const GROUPS: { group: EmptyGroup; kind: EmptyKind; sub: string }[] = [
  {
    group: 'Primer uso',
    kind: 'first-use',
    sub: 'Cuando un módulo todavía no tiene datos',
  },
  {
    group: 'Sin resultados',
    kind: 'no-results',
    sub: 'Cuando la búsqueda o el filtro no encuentra nada',
  },
  {
    group: 'Todo al día',
    kind: 'all-clear',
    sub: 'Cuando no queda nada pendiente',
  },
  {
    group: 'Requiere acción',
    kind: 'action',
    sub: 'Cuando el vacío es un problema a resolver',
  },
];

const EMPTIES: {
  group: EmptyGroup;
  module: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}[] = [
  {
    group: 'Primer uso',
    module: 'Servicios',
    icon: Wrench,
    title: 'Aún no hay servicios',
    description: 'Las solicitudes aparecen aquí en tiempo real.',
    cta: { label: 'Ver servicios', href: '/servicios' },
  },
  {
    group: 'Primer uso',
    module: 'Clientes',
    icon: Users,
    title: 'Aún no hay clientes',
    description: 'Los registros de la app aparecen aquí.',
    cta: { label: 'Ver clientes', href: '/clientes' },
  },
  {
    group: 'Primer uso',
    module: 'Técnico',
    icon: Star,
    title: 'Sin reseñas todavía',
    description: 'Aparecen después del primer servicio pagado.',
  },
  {
    group: 'Primer uso',
    module: 'Servicio',
    icon: FileText,
    title: 'Sin notas internas',
    description: 'Agrega contexto para el resto del equipo.',
  },
  {
    group: 'Sin resultados',
    module: 'Búsqueda',
    icon: Search,
    title: 'Sin resultados',
    description: 'Prueba con otro nombre, ID o quita los filtros.',
    cta: { label: 'Limpiar filtros', href: '/servicios' },
  },
  {
    group: 'Sin resultados',
    module: 'Reportes',
    icon: BarChart3,
    title: 'Sin datos en este periodo',
    description: 'Cambia el rango de fechas.',
    cta: { label: 'Ver reportes', href: '/reportes' },
  },
  {
    group: 'Todo al día',
    module: 'Técnicos',
    icon: CheckCircle2,
    title: 'Cola KYC al día',
    description: 'No hay técnicos esperando verificación.',
  },
  {
    group: 'Todo al día',
    module: 'Soporte',
    icon: Scale,
    title: 'Sin disputas abiertas',
    description: 'Todas las disputas están resueltas.',
  },
  {
    group: 'Todo al día',
    module: 'Soporte',
    icon: MessageSquare,
    title: 'Sin tickets pendientes',
    description: 'Cuando alguien escriba a soporte lo verás aquí.',
    cta: { label: 'Ir a soporte', href: '/soporte' },
  },
  {
    group: 'Todo al día',
    module: 'Notificaciones',
    icon: Bell,
    title: 'Sin notificaciones',
    description: 'Te avisamos de KYC, disputas y retiros.',
    cta: { label: 'Configurar', href: '/config?tab=notificaciones' },
  },
  {
    group: 'Todo al día',
    module: 'Finanzas',
    icon: Landmark,
    title: 'Sin retiros pendientes',
    description: 'El próximo lote se procesa en el siguiente corte.',
  },
  {
    group: 'Requiere acción',
    module: 'Regiones',
    icon: MapPin,
    title: 'Zona sin técnicos',
    description: 'Invita técnicos cercanos para cubrirla.',
    cta: { label: 'Ver regiones', href: '/regiones' },
  },
];

type Tab = 'errores' | 'vacios' | 'avisos' | 'carga';

/* ── Pestañas ─────────────────────────────────────────────────────────── */

function ErrorsTab() {
  const [open, setOpen] = useState<ErrorKind | null>(null);
  const cur = ERRORS.find(e => e.kind === open);
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {ERRORS.map((e, i) => (
          <Card key={e.kind} className="animate-up overflow-hidden">
            {/* La ilustración trae su marco y su chip de código; aquí solo se
                fija la altura (su aspecto 4:3 es para la página completa). */}
            <div
              className="p-3 pb-0 [&>div]:aspect-auto [&>div]:h-[220px]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ErrorIllustration kind={e.kind} />
            </div>
            <div className="p-5">
              <h3 className="font-display text-[17px] font-bold text-navy">
                {e.title}
              </h3>
              <p className="mt-1 text-[13.5px] text-muted">{e.description}</p>
              <Button
                className="mt-4"
                size="sm"
                variant="secondary"
                onClick={() => setOpen(e.kind)}
              >
                Ver página completa
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={!!cur}
        onClose={() => setOpen(null)}
        title={cur ? `Página ${cur.code}` : ''}
        width={760}
      >
        {cur && (
          <ErrorPage
            kind={cur.kind}
            primary={{
              ...ERROR_ACTIONS[cur.kind].primary,
              onClick: ERROR_ACTIONS[cur.kind].primary.href
                ? undefined
                : () => setOpen(null),
            }}
            secondary={ERROR_ACTIONS[cur.kind].secondary}
          />
        )}
      </Modal>
    </>
  );
}

function EmptiesTab() {
  return (
    <div className="flex flex-col gap-7">
      {GROUPS.map(g => (
        <section key={g.group}>
          <div className="mb-3">
            <h2 className="font-display text-[16px] font-bold text-navy">
              {g.group}
            </h2>
            <p className="text-[13px] text-muted">{g.sub}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {EMPTIES.filter(e => e.group === g.group).map((e, i) => (
              <Card key={e.title + e.module} className="animate-up">
                <div
                  className="px-4 pt-3"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <Kicker>{e.module}</Kicker>
                </div>
                <EmptyState
                  compact
                  kind={g.kind}
                  icon={e.icon}
                  title={e.title}
                  description={e.description}
                  action={
                    e.cta && (
                      <Button size="sm" variant="secondary" href={e.cta.href}>
                        {e.cta.label}
                      </Button>
                    )
                  }
                />
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function NoticesTab() {
  const demos: { label: string; run: () => void }[] = [
    {
      label: 'Éxito',
      run: () =>
        toast.success('Técnico aprobado', 'Ya puede recibir solicitudes'),
    },
    {
      label: 'Error con acción',
      run: () =>
        toast.error(
          'No se pudo guardar',
          'Revisa tu conexión e inténtalo de nuevo',
          {
            label: 'Reintentar',
            onClick: () => toast.info('Reintentando…'),
          },
        ),
    },
    {
      label: 'Advertencia',
      run: () =>
        toast.warning('KYC por vencer', 'Quedan 2 h para el SLA de revisión'),
    },
    {
      label: 'Información',
      run: () =>
        toast.info('Nueva versión disponible', 'Recarga para ver los cambios'),
    },
    { label: 'Sin conexión', run: () => toast.offline() },
    {
      label: 'Snackbar con Deshacer',
      run: () =>
        snackbar.show('Servicio cancelado', {
          undo: () => toast.success('Cancelación deshecha'),
        }),
    },
  ];
  return (
    <div className="flex flex-col gap-6">
      <Card padded>
        <h2 className="font-display text-[16px] font-bold text-navy">
          Toasts y snackbar
        </h2>
        <p className="mb-4 mt-1 text-[13px] text-muted">
          Los toasts aparecen arriba a la derecha (máx. 4, se pausan con el
          cursor); el snackbar abajo al centro con Deshacer.
        </p>
        <div className="flex flex-wrap gap-2">
          {demos.map(d => (
            <Button key={d.label} variant="secondary" size="sm" onClick={d.run}>
              {d.label}
            </Button>
          ))}
        </div>
      </Card>
      <Card padded>
        <h2 className="mb-4 font-display text-[16px] font-bold text-navy">
          Banners
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 rounded-box border border-warning-ring bg-warning-soft px-4 py-3 text-[13.5px] text-warning-ink">
            <WifiOff size={17} />
            <span className="flex-1 font-semibold">
              Sin conexión · No pudimos actualizar los datos
            </span>
            <Button size="sm" variant="secondary" icon={RefreshCw}>
              Reintentar
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-box border border-info-ring bg-info-soft px-4 py-3 text-[13.5px] text-primary">
            <LifeBuoy size={17} />
            <span className="flex-1">
              Mantenimiento programado el domingo de 02:00 a 03:00.
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-box border border-error-line bg-error-soft px-4 py-3 text-[13.5px] text-error">
            <Scale size={17} />
            <span className="flex-1 font-semibold">
              3 disputas llevan más de 24 h sin resolver.
            </span>
            <Button size="sm" variant="secondary" href="/soporte">
              Ir a soporte
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function LoadingTab() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-6">
      <Card padded>
        <h2 className="font-display text-[16px] font-bold text-navy">
          Botón y barra
        </h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            loading={busy}
            onClick={() => {
              setBusy(true);
              setTimeout(() => setBusy(false), 1600);
            }}
          >
            {busy ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          <div className="w-60">
            <IndeterminateBar />
          </div>
        </div>
      </Card>
      <Card padded>
        <h2 className="mb-4 font-display text-[16px] font-bold text-navy">
          Skeletons
        </h2>
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </Card>
      {(['dashboard', 'list', 'detail'] as const).map(k => (
        <Card key={k} padded>
          <Kicker className="mb-3">
            Skeleton de{' '}
            {k === 'dashboard'
              ? 'dashboard'
              : k === 'list'
                ? 'lista'
                : 'detalle'}
          </Kicker>
          <div className="pointer-events-none max-h-[320px] overflow-hidden">
            <ScreenSkeleton kind={k} />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function EstadosPage() {
  const [tab, setTab] = useState<Tab>('errores');
  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <PageHeader
        title="Estados y errores"
        description="Catálogo de lo que ve el equipo cuando algo falla, está vacío, cargando o necesita un aviso."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'errores', label: 'Páginas de error', count: ERRORS.length },
          { value: 'vacios', label: 'Estados vacíos', count: EMPTIES.length },
          { value: 'avisos', label: 'Avisos y mensajes' },
          { value: 'carga', label: 'Carga' },
        ]}
      />
      {tab === 'errores' && <ErrorsTab />}
      {tab === 'vacios' && <EmptiesTab />}
      {tab === 'avisos' && <NoticesTab />}
      {tab === 'carga' && <LoadingTab />}
    </div>
  );
}
