import { AdminShell } from '@/components/admin-shell';
import { Toasts } from '@/components/toast';

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminShell>{children}</AdminShell>
      {/* Fuera del main animado para que position:fixed no herede el transform. */}
      <Toasts />
    </>
  );
}
