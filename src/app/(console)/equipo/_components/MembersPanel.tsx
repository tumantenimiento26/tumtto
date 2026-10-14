'use client';

import { useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';

import { Badge, Button, Card, Select, toast } from '@/components/ds';
import { useAction } from '@/components/use-action';
import { useAuth } from '@/lib/auth';
import { changeStaffRole, useStaff } from '@/lib/data/staff';
import { AddMemberSheet } from './AddMemberSheet';
import { InviteModal } from './InviteModal';

const initials = (name: string | null, email: string) =>
  (name?.trim() || email)
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

export function MembersPanel({ openAdd = false }: { openAdd?: boolean }) {
  const { staff, roles } = useStaff();
  const { session } = useAuth();
  const me = session?.user.id;
  const { busy, run } = useAction();
  const [addOpen, setAddOpen] = useState(openAdd);
  const [inviteOpen, setInviteOpen] = useState(false);

  const options = roles.map(r => ({
    value: r.slug,
    label: r.name,
    hint: r.description ?? undefined,
  }));
  const roleName = (slug: string) =>
    roles.find(r => r.slug === slug)?.name ?? slug;

  async function change(userId: string, slug: string) {
    await run(
      userId,
      async () => {
        const r = await changeStaffRole(userId, slug);
        if (!r.ok) {
          toast.error('No se pudo cambiar el rol', r.message);
          return null;
        }
        return true;
      },
      `Rol actualizado · ${roleName(slug)}`,
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-divider px-5 py-4">
          <div>
            <div className="font-display text-[16px] font-bold text-navy">
              Miembros del equipo
            </div>
            <p className="mt-0.5 font-sans text-[12.5px] text-muted">
              {staff.length} con acceso a la consola.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Mail}
              onClick={() => setInviteOpen(true)}
            >
              Invitar por correo
            </Button>
            <Button icon={UserPlus} onClick={() => setAddOpen(true)}>
              Agregar miembro
            </Button>
          </div>
        </div>
        <ul className="divide-y divide-divider">
          {staff.map(a => {
            const mine = a.user_id === me;
            return (
              <li
                key={a.user_id}
                className="flex flex-wrap items-center gap-3 px-5 py-3.5"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-action font-display text-[12px] font-bold text-white">
                  {initials(a.full_name, a.email)}
                </span>
                <div className="min-w-0 flex-1 basis-48">
                  <div className="truncate font-sans text-[14px] font-semibold text-navy">
                    {a.full_name ?? 'Admin'}
                    {mine && <span className="ml-1.5 text-muted">(tú)</span>}
                  </div>
                  <div className="truncate font-sans text-[12px] text-muted">
                    {a.email}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.must_change_password && (
                    <Badge tone="warning" dot>
                      Contraseña temporal pendiente
                    </Badge>
                  )}
                  <Badge
                    tone={a.status === 'active' ? 'success' : 'danger'}
                    dot
                  >
                    {a.status === 'active' ? 'Activo' : 'Suspendido'}
                  </Badge>
                </div>
                {mine ? (
                  <div className="flex w-48 justify-end">
                    <Badge tone="navy">{roleName(a.admin_role)}</Badge>
                  </div>
                ) : (
                  <div className="w-48">
                    <Select
                      options={options}
                      value={a.admin_role}
                      placeholder="Asignar rol…"
                      disabled={busy === a.user_id}
                      aria-label={`Rol de ${a.full_name ?? a.email}`}
                      onChange={slug => void change(a.user_id, slug)}
                    />
                  </div>
                )}
              </li>
            );
          })}
          {staff.length === 0 && (
            <li className="px-5 py-8 text-center text-[13.5px] text-muted">
              Aún no hay miembros. Agrega el primero.
            </li>
          )}
        </ul>
      </Card>

      <AddMemberSheet open={addOpen} onClose={() => setAddOpen(false)} />
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
