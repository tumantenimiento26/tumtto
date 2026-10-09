'use client';

import { useState } from 'react';
import {
  FileText,
  ExternalLink,
  Landmark,
  Pencil,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CircleDashed,
  IdCard,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  Kicker,
  Modal,
  Sheet,
  Textarea,
} from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import { isValidClabe } from '@/lib/clabe';
import { fmtDate } from '@/lib/dates';
import {
  addNote,
  getDocumentUrl,
  getNotes,
  getTechnician,
  reviewDocument,
  updateTechnicianBank,
  updateTechnicianProfile,
  upsertTechRate,
  type TechDocument,
} from '@/lib/data/store';
import { DOC_LABEL, RATE_MAX, RATE_MIN, docValidity, rateError } from '@/lib/techConsole';

type Tech = NonNullable<ReturnType<typeof getTechnician>>;

export const fecha = (iso: string | null | undefined) =>
  iso ? fmtDate(iso, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const fmtClabe = (c?: string | null) =>
  c ? `${c.slice(0, 3)} ${c.slice(3, 6)} •••• •••• ${c.slice(-4)}` : '—';

/** Encabezado de tarjeta (kicker mono) con acción opcional. */
export function CardHead({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <Kicker>{title}</Kicker>
      {action}
    </div>
  );
}

export function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-divider py-2.5 first:border-t-0">
      <span className="font-sans text-[13px] text-muted">{label}</span>
      <span
        className={`text-right text-[13.5px] font-semibold text-navy ${mono ? 'font-mono' : 'font-sans'}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Documentos KYC ─────────────────────────────────────────────────────── */

const REVIEW_TONE = {
  pending: { label: 'Por revisar', tone: 'warning' },
  approved: { label: 'Aprobado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'danger' },
} as const;

/**
 * Tile de documento: previsualización (abre URL firmada), vigencia de los
 * antecedentes (3 meses) y, con permiso `kyc`, aprobar/rechazar por documento
 * (technician_documents.review_*). Rechazar pide el motivo.
 */
export function DocTile({ doc, canReview }: { doc: TechDocument; canReview: boolean }) {
  const [opening, setOpening] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [notes, setNotes] = useState('');
  const { busy, run } = useAction();
  const meta = REVIEW_TONE[doc.review_status] ?? REVIEW_TONE.pending;
  const validity = docValidity(doc);
  async function open() {
    setOpening(true);
    const url = await getDocumentUrl(doc);
    setOpening(false);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }
  const review = async (status: 'approved' | 'rejected') => {
    const ok = await run(
      status,
      () => reviewDocument(doc.id, status, status === 'rejected' ? notes : undefined),
      status === 'approved' ? 'Documento aprobado' : 'Documento rechazado',
    );
    if (ok) {
      setRejecting(false);
      setNotes('');
    }
  };
  return (
    <div className="flex flex-col overflow-hidden rounded-box border border-line bg-card">
      <button
        type="button"
        onClick={() => void open()}
        className="group grid h-36 place-items-center border-b border-line text-left focus-visible:shadow-focus focus-visible:outline-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, var(--color-panel) 0 10px, var(--color-card) 10px 20px)',
        }}
      >
        <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-primary">
          <FileText size={14} /> {opening ? 'Abriendo…' : 'Ver documento'}
          <ExternalLink size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </button>
      <div className="flex items-center justify-between gap-2 px-3.5 py-3">
        <div className="min-w-0">
          <div className="truncate font-sans text-[13px] font-semibold text-navy">
            {DOC_LABEL[doc.kind] ?? doc.kind}
          </div>
          <div className="font-mono text-[11px] text-muted">
            {doc.issued_on ? `Expedido ${fecha(doc.issued_on)}` : `Subido ${fecha(doc.created_at)}`}
          </div>
          {validity && (
            <div className={`font-mono text-[11px] ${validity.expired ? 'text-error' : validity.daysLeft <= 14 ? 'text-warning-ink' : 'text-muted'}`}>
              {validity.expired
                ? `Vencida el ${fecha(validity.expiresAt.toISOString())}`
                : `Vigente hasta ${fecha(validity.expiresAt.toISOString())}`}
            </div>
          )}
          {doc.review_notes && doc.review_status === 'rejected' && (
            <div className="mt-0.5 font-sans text-[11.5px] text-error">{doc.review_notes}</div>
          )}
        </div>
        <Badge tone={validity?.expired && doc.review_status !== 'rejected' ? 'danger' : meta.tone}>
          {validity?.expired && doc.review_status !== 'rejected' ? 'Vencido' : meta.label}
        </Badge>
      </div>
      {canReview && doc.review_status === 'pending' && (
        <div className="flex flex-col gap-2 border-t border-divider px-3.5 py-2.5">
          {rejecting && (
            <Input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Motivo del rechazo (lo verá el técnico)"
              aria-label="Motivo del rechazo"
            />
          )}
          <div className="flex justify-end gap-2">
            {rejecting ? (
              <>
                <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => setRejecting(false)}>
                  Cancelar
                </Button>
                <Button size="sm" variant="destructive" loading={busy === 'rejected'} disabled={!notes.trim()} onClick={() => void review('rejected')}>
                  Confirmar rechazo
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" disabled={!!busy} onClick={() => setRejecting(true)}>
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  variant="approve"
                  loading={busy === 'approved'}
                  disabled={!!busy || !!validity?.expired}
                  title={validity?.expired ? 'La carta está vencida: pide una nueva' : undefined}
                  onClick={() => void review('approved')}
                >
                  Aprobar
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Tile de INE: la captura vive en Didit (no hay archivo en nuestro storage). */
export function IneTile({ status }: { status: string | null }) {
  const approved = status === 'approved';
  return (
    <div className="flex flex-col overflow-hidden rounded-box border border-line bg-card">
      <div
        className="grid h-36 place-items-center border-b border-line"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, var(--color-panel) 0 10px, var(--color-card) 10px 20px)',
        }}
      >
        <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-muted">
          <IdCard size={14} /> INE anverso · reverso
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 px-3.5 py-3">
        <div>
          <div className="font-sans text-[13px] font-semibold text-navy">
            Identificación oficial
          </div>
          <div className="font-mono text-[11px] text-muted">Capturada en Didit</div>
        </div>
        <Badge tone={approved ? 'success' : status ? 'warning' : 'neutral'}>
          {approved ? 'Verificada' : status ? 'En verificación' : 'Sin iniciar'}
        </Badge>
      </div>
    </div>
  );
}

export function CheckRow({ label, ok }: { label: string; ok: boolean | null }) {
  const Icon = ok === true ? CheckCircle2 : ok === false ? XCircle : CircleDashed;
  return (
    <div className="flex items-center justify-between border-t border-divider py-2.5 first:border-t-0">
      <span className="font-sans text-[13px] text-body">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 font-sans text-[12.5px] font-semibold ${
          ok === true ? 'text-success' : ok === false ? 'text-error' : 'text-muted'
        }`}
      >
        <Icon size={15} />
        {ok === true ? 'Aprobada' : ok === false ? 'Rechazada' : 'Pendiente'}
      </span>
    </div>
  );
}

/* ── Rechazo con motivo ─────────────────────────────────────────────────── */

export const REJECT_REASONS = [
  'Documentos ilegibles',
  'Información inconsistente',
  'Documento expirado',
  'Antecedentes con más de 3 meses',
  'Otro',
];

export function RejectModal({
  open,
  onClose,
  onConfirm,
  techName,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, comment: string) => void;
  techName: string;
  busy?: boolean;
}) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [comment, setComment] = useState('');
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      width={520}
      tone="danger"
      icon={XCircle}
      title="Rechazar verificación"
      description={`${techName.split(' ')[0]} recibirá el motivo para corregir y reenviar sus documentos.`}
      footer={
        <>
          <Button variant="secondary" disabled={busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            loading={busy}
            onClick={() => onConfirm(reason, comment.trim())}
          >
            Rechazar técnico
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Kicker className="mb-2">Motivo</Kicker>
          <div className="flex flex-wrap gap-2">
            {REJECT_REASONS.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-full border px-3 py-1.5 font-sans text-[12.5px] font-semibold transition-colors ${
                  reason === r
                    ? 'border-error-line bg-error-soft text-error'
                    : 'border-line bg-card text-muted hover:bg-panel'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <Field label="Mensaje al técnico (opcional)">
          <Textarea
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Qué debe corregir para retomar su solicitud…"
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ── Tarifas con edición en línea ───────────────────────────────────────── */

type RateRow = {
  category_id: string;
  cat: string;
  visita_cents: number;
  hora_cents: number;
  minimo_cents: number;
};
type Draft = Record<string, { visita: string; hora: string; minimo: string }>;
const pesos = (c: number) => String(Math.round(c / 100));
const money = (c: number) => `$${Math.round(c / 100).toLocaleString('es-MX')}`;

export function RatesCard({ techId, rates }: { techId: string; rates: RateRow[] }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>({});
  const [shake, setShake] = useState(false);
  const { busy, run } = useAction();

  const start = () => {
    setDraft(
      Object.fromEntries(
        rates.map(r => [
          r.category_id,
          { visita: pesos(r.visita_cents), hora: pesos(r.hora_cents), minimo: pesos(r.minimo_cents) },
        ]),
      ),
    );
    setEditing(true);
  };
  const errors = Object.fromEntries(
    Object.entries(draft).map(([k, v]) => [
      k,
      { visita: rateError(v.visita), hora: rateError(v.hora), minimo: rateError(v.minimo) },
    ]),
  );
  const hasErrors = Object.values(errors).some(e => e.visita || e.hora || e.minimo);

  async function save() {
    if (hasErrors) {
      setShake(true);
      setTimeout(() => setShake(false), 420);
      return;
    }
    const changed = rates.filter(r => {
      const d = draft[r.category_id];
      return (
        d &&
        (d.visita !== pesos(r.visita_cents) ||
          d.hora !== pesos(r.hora_cents) ||
          d.minimo !== pesos(r.minimo_cents))
      );
    });
    if (!changed.length) return setEditing(false);
    const ok = await run(
      'rates',
      async () => {
        for (const r of changed) {
          const d = draft[r.category_id];
          const res = await upsertTechRate(techId, r.category_id, {
            visita_cents: Number(d.visita) * 100,
            hora_cents: Number(d.hora) * 100,
            minimo_cents: Number(d.minimo) * 100,
          });
          // Se detiene al primer fallo (el store ya avisó con toast).
          if (res === null) throw new Error('rate');
        }
      },
      `Tarifas actualizadas · ${changed.length}`,
    );
    if (ok) setEditing(false);
  }

  const cell = (catId: string, key: 'visita' | 'hora' | 'minimo') => (
    <Input
      prefix="$"
      inputMode="numeric"
      value={draft[catId]?.[key] ?? ''}
      onChange={e =>
        setDraft(d => ({
          ...d,
          [catId]: { ...d[catId], [key]: e.target.value.replace(/[^\d]/g, '') },
        }))
      }
      error={errors[catId]?.[key]}
      aria-label={key}
      wrapperClassName="w-28"
      className="text-right tabular"
    />
  );

  return (
    <Card padded>
      <CardHead
        title="Servicios y tarifas"
        action={
          editing ? (
            <div className={`flex gap-2 ${shake ? 'animate-shake' : ''}`}>
              <Button size="sm" variant="secondary" disabled={!!busy} onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button size="sm" loading={!!busy} onClick={() => void save()}>
                Guardar
              </Button>
            </div>
          ) : rates.length ? (
            <Button size="sm" variant="ghost" icon={Pencil} onClick={start}>
              Editar tarifas
            </Button>
          ) : null
        }
      />
      {rates.length === 0 ? (
        <p className="font-sans text-[13px] text-muted">
          El técnico aún no captura categorías ni tarifas.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">
                  <th className="pb-2 text-left font-medium">Categoría</th>
                  <th className="pb-2 text-right font-medium">Visita</th>
                  <th className="pb-2 text-right font-medium">Hora</th>
                  <th className="pb-2 text-right font-medium">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {rates.map(r => (
                  <tr key={r.category_id} className="border-t border-divider">
                    <td className="py-2.5 font-sans text-[13.5px] font-semibold text-navy">{r.cat}</td>
                    {(['visita', 'hora', 'minimo'] as const).map(k => (
                      <td key={k} className="py-2 text-right">
                        {editing ? (
                          <div className="flex justify-end">{cell(r.category_id, k)}</div>
                        ) : (
                          <span className="font-mono text-[13px] text-navy tabular">
                            {money(r[`${k}_cents` as const])}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-sans text-[12px] text-muted">
            Rango permitido por tarifa: ${RATE_MIN} – ${RATE_MAX.toLocaleString('es-MX')} MXN. Los
            cambios aplican a cotizaciones nuevas.
          </p>
        </>
      )}
    </Card>
  );
}

/* ── Datos bancarios (CLABE con dígito verificador) ─────────────────────── */

export function BankCard({ tech }: { tech: Tech }) {
  // La CLABE es el destino de los retiros: solo finanzas la cambia (onboarding la ve).
  const canEdit = useAuth().can('finanzas');
  const [editing, setEditing] = useState(false);
  const [clabe, setClabe] = useState(tech.clabe ?? '');
  const [bank, setBank] = useState(tech.bank_name ?? '');
  const { busy, run } = useAction();
  const clabeErr = clabe && !isValidClabe(clabe) ? 'CLABE inválida (18 dígitos con verificador)' : null;

  async function save() {
    if (clabeErr) return;
    const ok = await run(
      'bank',
      () => updateTechnicianBank(tech.id, bank.trim() || null, clabe || null),
      'Datos bancarios guardados',
    );
    if (ok) setEditing(false);
  }

  return (
    <Card padded>
      <CardHead
        title="Cobro"
        action={
          editing ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={!!busy}
                onClick={() => {
                  setClabe(tech.clabe ?? '');
                  setBank(tech.bank_name ?? '');
                  setEditing(false);
                }}
              >
                Cancelar
              </Button>
              <Button size="sm" loading={!!busy} disabled={!!clabeErr} onClick={() => void save()}>
                Guardar
              </Button>
            </div>
          ) : canEdit ? (
            <Button size="sm" variant="ghost" icon={Landmark} onClick={() => setEditing(true)}>
              Editar
            </Button>
          ) : null
        }
      />
      {editing ? (
        <div className="flex flex-col gap-3">
          <Input
            label="CLABE interbancaria"
            value={clabe}
            onChange={e => setClabe(e.target.value.replace(/\D/g, '').slice(0, 18))}
            error={clabeErr}
            placeholder="18 dígitos"
            className="font-mono"
          />
          <Input label="Banco" value={bank} onChange={e => setBank(e.target.value)} placeholder="Nombre del banco" />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-info-soft text-primary">
            <Landmark size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-sans text-[13.5px] font-semibold text-navy">
              {tech.bank_name ?? 'Banco sin capturar'}
            </div>
            <div className="font-mono text-[12px] text-muted">CLABE {fmtClabe(tech.clabe)}</div>
          </div>
          {tech.clabe ? (
            isValidClabe(tech.clabe) ? (
              <Badge tone="success" dot>
                CLABE válida
              </Badge>
            ) : (
              <Badge tone="danger" dot>
                CLABE inválida
              </Badge>
            )
          ) : (
            <Badge tone="warning">Sin CLABE</Badge>
          )}
        </div>
      )}
    </Card>
  );
}

/* ── Notas internas y bitácora (admin_events vía add_admin_note) ────────── */

export function NotesCard({ techId }: { techId: string }) {
  const [text, setText] = useState('');
  const { busy, run } = useAction();
  const notes = getNotes(techId);
  async function add() {
    if (!text.trim() || busy) return;
    const ok = await run('note', () => addNote('technicians', techId, text.trim()), 'Nota agregada');
    if (ok) setText('');
  }
  return (
    <Card padded>
      <CardHead title="Notas internas" />
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && void add()}
          placeholder="Solo visible para el equipo"
          wrapperClassName="flex-1"
          aria-label="Nueva nota"
        />
        <Button variant="secondary" icon={Send} onClick={() => void add()} loading={!!busy} disabled={!text.trim()}>
          Agregar
        </Button>
      </div>
      {notes.length > 0 && (
        <div className="mt-3 flex flex-col">
          {notes.map(n => (
            <div key={n.id} className="border-t border-divider py-2.5 first:border-t-0">
              <p className="font-sans text-[13px] text-body">{n.text}</p>
              <p className="mt-0.5 font-mono text-[11px] text-faint">
                {n.author} · {fecha(n.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ── Editar perfil (sheet) ──────────────────────────────────────────────── */

export function EditProfileSheet({
  open,
  onClose,
  tech,
  fullName,
}: {
  open: boolean;
  onClose: () => void;
  tech: Tech;
  fullName: string;
}) {
  const [name, setName] = useState(fullName);
  const [display, setDisplay] = useState(tech.display_name ?? fullName);
  const [bio, setBio] = useState(tech.bio ?? '');
  const [shake, setShake] = useState(false);
  const [touched, setTouched] = useState(false);
  const { busy, run } = useAction();
  const nameErr = touched && name.trim().length < 3 ? 'Escribe el nombre completo' : null;
  const displayErr = touched && !display.trim() ? 'Requerido' : null;

  async function save() {
    setTouched(true);
    if (name.trim().length < 3 || !display.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 420);
      return;
    }
    const ok = await run(
      'profile',
      () =>
        updateTechnicianProfile(tech.id, {
          full_name: name.trim(),
          display_name: display.trim(),
          bio: bio.trim() || null,
        }),
      'Perfil actualizado',
    );
    if (ok) onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={() => !busy && onClose()}
      title="Editar perfil"
      kicker="Técnico"
      width={480}
      footerClassName={shake ? 'animate-shake' : ''}
      footer={
        <div className="flex w-full gap-2">
          <Button variant="secondary" full disabled={!!busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button full loading={!!busy} onClick={() => void save()}>
            Guardar cambios
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Kicker>Identidad</Kicker>
        <Input label="Nombre completo" value={name} onChange={e => setName(e.target.value)} error={nameErr} required />
        <Input
          label="Nombre visible para clientes"
          value={display}
          onChange={e => setDisplay(e.target.value)}
          error={displayErr}
          hint="Así aparece en su tarjeta pública."
          required
        />
        <Kicker>Perfil profesional</Kicker>
        <Field label="Biografía" hint={`${bio.length}/400`}>
          <Textarea rows={5} value={bio} maxLength={400} onChange={e => setBio(e.target.value)} />
        </Field>
        <div className="flex items-start gap-2 rounded-box bg-info-soft px-3.5 py-3 font-sans text-[12.5px] text-primary">
          <ShieldCheck size={15} className="mt-0.5 flex-shrink-0" />
          CURP, RFC y teléfono vienen de la verificación; no se editan aquí.
        </div>
      </div>
    </Sheet>
  );
}
