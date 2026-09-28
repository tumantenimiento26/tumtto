import { ErrorPage } from '@/components/ds';

/** 404 global (rutas públicas y de consola). */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-12">
      <div className="w-full max-w-[760px]">
        <ErrorPage
          kind="404"
          primary={{ label: 'Ir al inicio', href: '/' }}
          secondary={{ label: 'Abrir la consola', href: '/dashboard' }}
        />
      </div>
    </main>
  );
}
