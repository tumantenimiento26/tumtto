'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Ban,
  ChevronLeft,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Star,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorPage,
  Field,
  Input,
  Kicker,
  Modal,
  ScreenSkeleton,
  Tabs,
  Textarea,
  Toggle,
} from '@/components/ds';
import { useAction } from '@/components/use-action';
import {
  addNote,
  createTicket,
  deleteAddress,
  getAddresses,
  getAllDisputes,
  getCategories,
  getClientRequests,
  getNotes,
  getPayment,
  getProfile,
  loadExtras,
  loadWorld,
  reactivateUser,
  saveAddress,
  suspendUser,
  useExtras,
  useTick,
  useWorldFailed,
  useWorldReady,
} from '@/lib/data/store';
import type { Payment, ServiceRequest } from '@/lib/demo/world';
import { orderCode } from '@/lib/orderCode';
import { formatPhone } from '@/lib/phone';
import {
  Avatar,
  CategoryTile,
  METHOD_LABEL,
  STATUS,
  money,
  timeAgo,
} from '../../servicios/_components/shared';
import { ClientFormSheet } from '../_components/ClientFormSheet';
import { ClientDocCard } from '../_components/ClientDocCard';

type TabId = 'historial' | 'direcciones' | 'pagos' | 'disputas' | 'notas';
type AddressRow = ReturnType<typeof getAddresses>[number];

const since = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });

export default function ClientDetailPage() {
  useTick();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const ready = useWorldReady();
  const failed = useWorldFailed();
  const { busy, run } = useAction();
  const [tab, setTab] = useState<TabId>('historial');
  const [editOpen, setEditOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [addrModal, setAddrModal] = useState<{ open: boolean; addr: AddressRow | null }>({
    open: false,
    addr: null,
  });
  const [addrDelete, setAddrDelete] = useState<AddressRow | null>(null);
  const [note, setNote] = useState('');
  // order_ratings (calificaciones que da el cliente) viven en los extras.
  const orderRatings = useExtras(s => s.ratings);
  useEffect(() => {
    void loadExtras();
  }, []);

  if (failed)
    return (
      <ErrorPage
        kind="500"
        primary={{ label: 'Reintentar', onClick: () => void loadWorld(true) }}
      />
    );
  if (!ready) return <ScreenSkeleton kind="detail" />;
  const profile = getProfile(id);
  if (!profile)
    return (
      <ErrorPage kind="404" primary={{ label: 'Volver a clientes', href: '/clientes' }} />
    );

  const name = profile.full_name ?? 'Cliente';
  const suspended = profile.status === 'suspended';
  const requests = [...getClientRequests(id)].sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
  const addresses = getAddresses(id);
  const notes = getNotes(id);
  const cats = getCategories();
  const catOf = (cid: string) => cats.find(c => c.id === cid);
  const payments = requests
    .map(r => ({ req: r, pay: getPayment(r.id) }))
    .filter((x): x is { req: ServiceRequest; pay: Payment } => x.pay != null);
  const disputes = getAllDisputes().filter(
    d => d.opened_by === id || requests.some(r => r.id === d.service_order_id),
  );
  const spentCents = requests.reduce((s, r) => s + (r.quoted_total_cents ?? 0), 0);
  const ticketCents = requests.length ? Math.round(spentCents / requests.length) : null;
  const ratings = orderRatings.filter(r => r.reviewer_id === id);
  const avgRating = ratings.length
    ? ratings.reduce((s, r) => s + r.score, 0) / ratings.length
    : null;

  async function saveNote() {
    const text = note.trim();
    if (!text) return;
    const ok = await run('note', () => addNote('profiles', id, text), 'Nota agregada');
    if (ok) setNote('');
  }

  const tabs: { value: TabId; label: string; count?: number }[] = [
    { value: 'historial', label: 'Historial', count: requests.length },
    { value: 'direcciones', label: 'Direcciones', count: addresses.length },
    { value: 'pagos', label: 'Pagos', count: payments.length },
    { value: 'disputas', label: 'Disputas', count: disputes.length },
    { value: 'notas', label: 'Notas', count: notes.length },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/clientes"
        className="inline-flex w-fit items-center gap-1 font-display text-[14px] font-bold text-primary hover:underline"
      >
        <ChevronLeft size={16} /> Clientes
      </Link>

      <Card padded className="animate-up">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={name} size={58} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[24px] font-extrabold tracking-[-0.5px] text-navy">
                {name}
              </h1>
              {suspended ? (
                <Badge tone="danger" dot>
                  Suspendido
                </Badge>
              ) : (
                <Badge tone="success" dot>
                  Activo
                </Badge>
              )}
            </div>
            <p className="mt-1 text-[13.5px] text-muted">
              {formatPhone(profile.phone) || 'Sin celular'} · Cliente desde{' '}
              {since(profile.created_at)}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <Button variant="secondary" icon={Send} onClick={() => setMessageOpen(true)}>
            Enviar mensaje
          </Button>
          {suspended ? (
            <Button
              variant="approve"
              icon={RotateCcw}
              loading={busy === 'reactivate'}
              onClick={() =>
                void run('reactivate', () => reactivateUser(id), `Cuenta reactivada · ${name}`)
              }
            >
              Reactivar cuenta
            </Button>
          ) : (
            <Button variant="destructive" icon={Ban} onClick={() => setSuspendOpen(true)}>
              Suspender cuenta
            </Button>
          )}
        </div>
      </Card>

      <ClientDocCard clientId={id} name={name} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Servicios" value={String(requests.length)} />
        <Kpi label="Gasto total" value={money(spentCents)} />
        <Kpi label="Ticket medio" value={money(ticketCents)} />
        <Kpi
          label="Calificación que da"
          value={avgRating != null ? avgRating.toFixed(1) : '—'}
          star={avgRating != null}
        />
      </div>

      <Card className="overflow-hidden">
        <Tabs className="px-5" tabs={tabs} value={tab} onChange={setTab} />
        <div className="p-5">
          {tab === 'historial' &&
            (requests.length === 0 ? (
              <EmptyState compact kind="first-use" title="Sin servicios todavía" />
            ) : (
              <ul className="-my-1 divide-y divide-divider">
                {requests.map(r => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/servicios/${r.id}`)}
                      className="flex w-full items-center gap-3 rounded-btn px-2 py-3 text-left hover:bg-panel"
                    >
                      <CategoryTile slug={catOf(r.category_id)?.slug} size={32} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14px] text-navy">
                          <span className="font-display font-bold">
                            {catOf(r.category_id)?.name ?? 'Servicio'}
                          </span>
                          {r.technician_id && (
                            <span className="text-muted">
                              {' '}
                              · {getProfile(r.technician_id)?.full_name ?? 'Técnico'}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11.5px] text-muted">
                          {orderCode(r.id)} · {timeAgo(r.created_at)}
                        </div>
                      </div>
                      <Badge tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Badge>
                      <span className="w-[84px] text-right font-mono text-[13px] font-semibold text-navy tabular">
                        {money(r.quoted_total_cents)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}

          {tab === 'direcciones' && (
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => setAddrModal({ open: true, addr: null })}
                >
                  Agregar dirección
                </Button>
              </div>
              {addresses.length === 0 && (
                <EmptyState compact kind="first-use" title="Sin direcciones guardadas" />
              )}
              {addresses.map(a => (
                <div
                  key={a.id}
                  className={`flex items-start gap-3 rounded-box border p-3.5 ${a.is_default ? 'border-primary/40 bg-tint' : 'border-line'}`}
                >
                  <MapPin size={18} className={a.is_default ? 'text-primary' : 'text-muted'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[14px] font-bold text-navy">
                        {a.label ?? 'Dirección'}
                      </span>
                      {a.is_default && <Badge tone="info">Principal</Badge>}
                    </div>
                    <div className="text-[13px] text-body">{a.address_line}</div>
                    <div className="text-[12.5px] text-muted">
                      {[a.neighborhood, a.municipality, a.state, a.postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Pencil}
                    onClick={() => setAddrModal({ open: true, addr: a })}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => setAddrDelete(a)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
          )}

          {tab === 'pagos' &&
            (payments.length === 0 ? (
              <EmptyState compact kind="first-use" title="Sin pagos registrados" />
            ) : (
              <ul className="divide-y divide-divider">
                {payments.map(({ req, pay }) => (
                  <li key={pay.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[14px] font-bold text-navy">
                        {METHOD_LABEL[pay.method] ?? pay.method}
                      </div>
                      <div className="font-mono text-[11.5px] text-muted">
                        {orderCode(req.id)} · {timeAgo(pay.paid_at ?? pay.created_at)}
                      </div>
                    </div>
                    <Badge
                      tone={pay.status === 'paid' ? 'success' : pay.status === 'refunded' ? 'danger' : 'warning'}
                    >
                      {pay.status === 'paid'
                        ? 'Pagado'
                        : pay.status === 'refunded'
                          ? 'Reembolsado'
                          : pay.status === 'failed'
                            ? 'Fallido'
                            : 'Pendiente'}
                    </Badge>
                    <span className="w-[90px] text-right font-mono text-[13px] font-semibold text-navy tabular">
                      {money(pay.amount_cents)}
                    </span>
                  </li>
                ))}
              </ul>
            ))}

          {tab === 'disputas' &&
            (disputes.length === 0 ? (
              <EmptyState compact kind="all-clear" title="Sin disputas" />
            ) : (
              <ul className="divide-y divide-divider">
                {disputes.map(d => (
                  <li key={d.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[14px] font-bold text-navy">
                        {orderCode(d.service_order_id)}
                      </div>
                      <div className="truncate text-[12.5px] text-muted">{d.reason}</div>
                    </div>
                    <Badge tone={d.status === 'resolved' ? 'success' : 'warning'}>
                      {d.status === 'resolved' ? 'Resuelta' : d.status === 'rejected' ? 'Rechazada' : 'Abierta'}
                    </Badge>
                    <Link href="/soporte" className="text-[13px] font-semibold text-primary hover:underline">
                      Ver en soporte
                    </Link>
                  </li>
                ))}
              </ul>
            ))}

          {tab === 'notas' && (
            <div className="flex flex-col gap-3">
              <Textarea
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Agregar una nota interna sobre este cliente…"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={() => void saveNote()} loading={busy === 'note'} disabled={!note.trim()}>
                  Guardar nota
                </Button>
              </div>
              {notes.map(n => (
                <div key={n.id} className="rounded-box border border-line bg-panel p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-[13px] font-bold text-navy">{n.author}</span>
                    <span className="font-mono text-[11px] text-muted">{timeAgo(n.created_at)}</span>
                  </div>
                  <p className="mt-1 text-[13.5px] text-body">{n.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <ClientFormSheet open={editOpen} clientId={id} onClose={() => setEditOpen(false)} />

      <Modal
        open={suspendOpen}
        onClose={() => busy === null && setSuspendOpen(false)}
        dismissible={busy === null}
        title="Suspender cuenta"
        icon={Ban}
        tone="danger"
        description={`${name} no podrá solicitar servicios mientras la cuenta esté suspendida. Puedes reactivarla cuando quieras.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSuspendOpen(false)} disabled={busy !== null}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'suspend'}
              onClick={async () => {
                const ok = await run('suspend', () => suspendUser(id), `Cuenta suspendida · ${name}`);
                if (ok) setSuspendOpen(false);
              }}
            >
              Suspender cuenta
            </Button>
          </>
        }
      />

      <Modal
        open={addrDelete !== null}
        onClose={() => busy === null && setAddrDelete(null)}
        dismissible={busy === null}
        title="Eliminar dirección"
        icon={Trash2}
        tone="danger"
        description={addrDelete ? `${addrDelete.label ?? 'Dirección'} · ${addrDelete.address_line ?? ''}` : undefined}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddrDelete(null)} disabled={busy !== null}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'del-addr'}
              onClick={async () => {
                if (!addrDelete) return;
                const ok = await run('del-addr', () => deleteAddress(addrDelete.id), 'Dirección eliminada');
                if (ok) setAddrDelete(null);
              }}
            >
              Eliminar
            </Button>
          </>
        }
      />

      <AddressModal
        key={addrModal.addr?.id ?? 'new'}
        open={addrModal.open}
        onClose={() => setAddrModal({ open: false, addr: null })}
        clientId={id}
        addr={addrModal.addr}
      />

      <SendMessageModal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        clientId={id}
        clientName={name}
      />
    </div>
  );
}

function Kpi({ label, value, star }: { label: string; value: string; star?: boolean }) {
  return (
    <Card padded hover>
      <Kicker>{label}</Kicker>
      <div className="mt-2 flex items-center gap-1.5 font-display text-[26px] font-extrabold text-navy tabular">
        {value}
        {star && <Star size={20} className="text-navy" fill="currentColor" />}
      </div>
    </Card>
  );
}

function AddressModal({
  open,
  onClose,
  clientId,
  addr,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  addr: AddressRow | null;
}) {
  const [f, setF] = useState({
    label: addr?.label ?? 'Casa',
    address_line: addr?.address_line ?? '',
    neighborhood: addr?.neighborhood ?? '',
    municipality: addr?.municipality ?? 'Guadalajara',
    state: addr?.state ?? 'Jalisco',
    postal_code: addr?.postal_code ?? '',
    is_default: addr?.is_default ?? false,
  });
  const { busy, run } = useAction();
  const cpInvalid = !!f.postal_code && !/^\d{5}$/.test(f.postal_code.trim());
  const set =
    (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setF({ ...f, [k]: e.target.value });

  async function submit() {
    if (!f.address_line.trim() || cpInvalid) return;
    const ok = await run(
      'save',
      () =>
        saveAddress(
          clientId,
          {
            ...f,
            address_line: f.address_line.trim(),
            postal_code: f.postal_code?.trim() || null,
          },
          addr?.id,
        ),
      addr ? 'Dirección actualizada' : 'Dirección agregada',
    );
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => !busy && onClose()}
      dismissible={!busy}
      title={addr ? 'Editar dirección' : 'Agregar dirección'}
      icon={MapPin}
      width={520}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={!!busy}>
            Cancelar
          </Button>
          <Button
            loading={!!busy}
            disabled={!f.address_line.trim() || cpInvalid}
            onClick={() => void submit()}
          >
            {addr ? 'Guardar cambios' : 'Agregar dirección'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Etiqueta" value={f.label ?? ''} onChange={set('label')} placeholder="Casa, Oficina…" />
          <Input
            label="Código postal"
            value={f.postal_code ?? ''}
            onChange={set('postal_code')}
            placeholder="44100"
            inputMode="numeric"
            error={cpInvalid ? 'El código postal son 5 dígitos.' : null}
          />
        </div>
        <Input
          label="Calle y número"
          required
          value={f.address_line}
          onChange={set('address_line')}
          placeholder="Av. México 1234, int. 5"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Colonia" value={f.neighborhood ?? ''} onChange={set('neighborhood')} />
          <Input label="Municipio" value={f.municipality ?? ''} onChange={set('municipality')} />
          <Input label="Estado" value={f.state ?? ''} onChange={set('state')} />
        </div>
        <div className="flex items-center justify-between rounded-box border border-line bg-panel px-4 py-3">
          <div>
            <div className="font-display text-[14px] font-bold text-navy">Dirección principal</div>
            <div className="text-[12.5px] text-muted">Se usa por defecto al crear servicios.</div>
          </div>
          <Toggle
            checked={!!f.is_default}
            onChange={v => setF({ ...f, is_default: v })}
            aria-label="Dirección principal"
          />
        </div>
      </div>
    </Modal>
  );
}

function SendMessageModal({
  open,
  onClose,
  clientId,
  clientName,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const { busy, run } = useAction();

  async function submit() {
    if (!subject.trim() || !body.trim()) return;
    const ok = await run(
      'ticket',
      () => createTicket({ subject: subject.trim(), requester_id: clientId, content: body.trim() }),
      'Ticket de soporte creado',
    );
    if (!ok) return;
    setSubject('');
    setBody('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Enviar mensaje a ${clientName.split(' ')[0]}`}
      description="Se abre un ticket de soporte con este mensaje."
      icon={Send}
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void submit()} loading={!!busy} disabled={!subject.trim() || !body.trim()}>
            Enviar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Asunto"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Ej. Seguimiento a tu último servicio"
        />
        <Field label="Mensaje">
          <Textarea
            rows={4}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Escribe el mensaje para el cliente…"
          />
        </Field>
      </div>
    </Modal>
  );
}

