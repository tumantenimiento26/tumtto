'use client';

import { useEffect, useState } from 'react';
import { Car, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Badge, Button, Card, Field, Input, Modal, Sheet } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import {
  deleteVehicle,
  getTechVehicles,
  loadExtras,
  saveVehicle,
  setPrimaryVehicle,
  useExtras,
  type TechVehicle,
} from '@/lib/data/store';
import { formatPlate, isValidPlate, normalizePlate } from '@/lib/vehicles';
import { CardHead } from './detail-parts';

/** Bloque «Vehículos» del perfil del técnico (principal marcado; editar/eliminar con permiso usuarios). */
export function VehiclesCard({ techId }: { techId: string }) {
  useExtras(s => s.vehicles);
  const missing = useExtras(s => s.unavailable.vehicles);
  const canEdit = useAuth().can('usuarios');
  const { busy, run } = useAction();
  const [editing, setEditing] = useState<TechVehicle | 'new' | null>(null);
  const [removing, setRemoving] = useState<TechVehicle | null>(null);
  useEffect(() => {
    void loadExtras();
  }, []);
  const list = getTechVehicles(techId);
  const lock = canEdit ? undefined : 'Tu rol no edita vehículos';

  return (
    <Card padded className="animate-up">
      <CardHead
        title="Vehículos"
        action={
          !missing && (
            <Button size="sm" variant="secondary" icon={Plus} disabled={!canEdit} title={lock} onClick={() => setEditing('new')}>
              Agregar
            </Button>
          )
        }
      />
      {missing ? (
        <p className="font-sans text-[13px] text-muted">
          Los vehículos aún no están disponibles en este entorno.
        </p>
      ) : list.length === 0 ? (
        <p className="font-sans text-[13px] text-muted">El técnico no ha registrado vehículos.</p>
      ) : (
        <div className="flex flex-col">
          {list.map(v => (
            <div
              key={v.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-divider py-3 first:border-t-0 first:pt-0"
            >
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-info-soft text-primary">
                <Car size={17} />
              </span>
              <div className="min-w-0 flex-1 basis-40">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-sans text-[13.5px] font-semibold text-navy">
                    {v.make} {v.model} {v.year}
                  </span>
                  {v.is_primary && <Badge tone="success">Principal</Badge>}
                </div>
                <div className="font-sans text-[12.5px] text-muted">
                  {v.color} · <span className="font-mono text-[12px] text-body">{formatPlate(v.plate)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {!v.is_primary && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Star}
                    disabled={!canEdit || !!busy}
                    title={lock}
                    onClick={() => void run(`pri-${v.id}`, () => setPrimaryVehicle(v.id), 'Vehículo principal actualizado')}
                  >
                    Principal
                  </Button>
                )}
                <Button size="sm" variant="secondary" icon={Pencil} disabled={!canEdit} title={lock} aria-label={`Editar ${v.make} ${v.model}`} onClick={() => setEditing(v)}>
                  Editar
                </Button>
                <Button size="sm" variant="ghost" icon={Trash2} disabled={!canEdit} title={lock} aria-label={`Eliminar ${v.make} ${v.model}`} onClick={() => setRemoving(v)}>
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <VehicleSheet
          key={editing === 'new' ? 'new' : editing.id}
          techId={techId}
          vehicle={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      <Modal
        open={!!removing}
        onClose={() => !busy && setRemoving(null)}
        dismissible={!busy}
        tone="danger"
        icon={Trash2}
        title="¿Eliminar este vehículo?"
        description={
          removing
            ? `${removing.make} ${removing.model} · ${formatPlate(removing.plate)}. Queda en la bitácora del técnico.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" disabled={!!busy} onClick={() => setRemoving(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              loading={busy === 'del'}
              onClick={async () => {
                if (!removing) return;
                const ok = await run('del', () => deleteVehicle(removing.id), 'Vehículo eliminado');
                if (ok) setRemoving(null);
              }}
            >
              Eliminar
            </Button>
          </>
        }
      />
    </Card>
  );
}

function VehicleSheet({
  techId,
  vehicle,
  onClose,
}: {
  techId: string;
  vehicle: TechVehicle | null;
  onClose: () => void;
}) {
  const [make, setMake] = useState(vehicle?.make ?? '');
  const [model, setModel] = useState(vehicle?.model ?? '');
  const [year, setYear] = useState(vehicle ? String(vehicle.year) : '');
  const [color, setColor] = useState(vehicle?.color ?? '');
  const [plate, setPlate] = useState(vehicle ? formatPlate(vehicle.plate) : '');
  const [touched, setTouched] = useState(false);
  const { busy, run } = useAction();
  const y = Number(year);
  const maxYear = new Date().getFullYear() + 1;
  const errs = {
    make: !make.trim() ? 'Obligatorio' : null,
    model: !model.trim() ? 'Obligatorio' : null,
    year: !Number.isInteger(y) || y < 1980 || y > maxYear ? `Entre 1980 y ${maxYear}` : null,
    color: !color.trim() ? 'Obligatorio' : null,
    plate: !isValidPlate(normalizePlate(plate)) ? '5 a 8 letras o números' : null,
  };
  const invalid = Object.values(errs).some(Boolean);
  const show = (k: keyof typeof errs) => (touched ? errs[k] : null);

  async function save() {
    setTouched(true);
    if (invalid) return;
    const ok = await run(
      'veh',
      () => saveVehicle(techId, { make, model, year: y, color, plate }, vehicle?.id),
      vehicle ? 'Vehículo actualizado' : 'Vehículo agregado',
    );
    if (ok) onClose();
  }

  return (
    <Sheet
      open
      onClose={() => !busy && onClose()}
      title={vehicle ? 'Editar vehículo' : 'Agregar vehículo'}
      kicker="Técnico"
      width={480}
      footer={
        <div className="flex w-full gap-2">
          <Button variant="secondary" full disabled={!!busy} onClick={onClose}>
            Cancelar
          </Button>
          <Button full loading={!!busy} onClick={() => void save()}>
            Guardar
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Marca" error={show('make')} required>
            <Input value={make} onChange={e => setMake(e.target.value)} error={show('make')} aria-label="Marca" />
          </Field>
          <Field label="Modelo" error={show('model')} required>
            <Input value={model} onChange={e => setModel(e.target.value)} error={show('model')} aria-label="Modelo" />
          </Field>
          <Field label="Año" error={show('year')} required>
            <Input inputMode="numeric" value={year} onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} error={show('year')} aria-label="Año" />
          </Field>
          <Field label="Color" error={show('color')} required>
            <Input value={color} onChange={e => setColor(e.target.value)} error={show('color')} aria-label="Color" />
          </Field>
        </div>
        <Field label="Placas" error={show('plate')} hint="Se guardan en mayúsculas, sin espacios ni guiones." required>
          <Input
            value={plate}
            onChange={e => setPlate(e.target.value.toUpperCase())}
            error={show('plate')}
            className="font-mono"
            autoCapitalize="characters"
            aria-label="Placas"
          />
        </Field>
      </div>
    </Sheet>
  );
}
