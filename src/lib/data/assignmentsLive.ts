'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from '@/components/toast';
import { useAuth } from '@/lib/auth';
import { MOCK } from '@/lib/mock';
import { assignmentNotifHref } from '@/lib/assignments';
import { useTick } from './store';
import {
  loadAssignments,
  loadServerNotifs,
  subscribeAssignmentsLive,
} from './assignmentsStore';

/**
 * Carga Asignaciones y notificaciones del backend y las mantiene vivas
 * mientras la consola está abierta. Toast al llegar una solicitud nueva.
 */
export function useAssignmentsLive() {
  const { canView } = useAuth();
  const router = useRouter();
  const allowed = canView('servicios');
  const tick = useTick();

  useEffect(() => {
    if (!allowed) return;
    void loadAssignments(true);
    void loadServerNotifs();
    if (MOCK) return;
    return subscribeAssignmentsLive(n => {
      if (n.kind !== 'admin_request_created') return;
      toast.show({
        kind: 'info',
        title: n.title || 'Nueva solicitud para asignar',
        sub: n.body ?? undefined,
        action: {
          label: 'Ver',
          onClick: () => router.push(assignmentNotifHref(n.kind, n.entity_id)),
        },
      });
    });
  }, [allowed, router]);

  // Maqueta: el mundo demo cambia en memoria (asignar), no hay realtime.
  useEffect(() => {
    if (allowed && MOCK) void loadAssignments(true);
  }, [allowed, tick]);
}
