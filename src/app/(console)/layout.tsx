import { AdminShell } from '@/components/admin-shell';
import { AdminGate } from '@/components/admin-gate';
import { Toasts } from '@/components/toast';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
      {/* Fuera del main animado para que position:fixed no herede el transform. */}
      <Toasts />
    </AdminGate>
  );
}
