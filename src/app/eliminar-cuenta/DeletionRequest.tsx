'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, Loader2, LogOut, TriangleAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  EMAIL_RE,
  authMessage,
  failureMessage,
  lockSecondsLeft,
  registerFailure,
  type LockState,
} from '@/lib/authForms';
import {
  DELETE_WORD,
  cancelDeletion,
  deletionBlockedReason,
  formatDeletionDate,
  getPendingDeletion,
  isDeleteConfirmed,
  requestDeletion,
  type PendingDeletion,
} from '@/lib/accountDeletion';

// Solicitud de baja sin la app (Google Play exige que la URL de borrado
// permita pedirla). Inicia sesión con la cuenta de la app y llama la misma RPC.

type Stage = 'checking' | 'login' | 'confirm' | 'scheduled';

const INPUT =
  'h-12 w-full rounded-btn border border-lp-line bg-[#0A1830] px-3.5 text-[15px] text-lp-text placeholder:text-[var(--lp-dim)] transition-[border-color,box-shadow] duration-150 hover:border-[rgba(90,176,255,0.32)] focus:border-[var(--lp-cyan)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(24,193,255,0.18)]';
const LABEL = 'mb-1.5 block text-[13px] font-semibold text-[var(--lp-soft)]';
const PRIMARY =
  'inline-flex h-[52px] items-center justify-center gap-2 rounded-btn bg-[var(--lp-blue)] px-6 font-display text-[15px] font-bold text-white transition-colors hover:bg-[var(--lp-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60';
const DANGER =
  'inline-flex h-[52px] items-center justify-center gap-2 rounded-btn bg-[#d64545] px-6 font-display text-[15px] font-bold text-white transition-colors hover:bg-[#c03a3a] disabled:cursor-not-allowed disabled:opacity-60';
const GHOST =
  'inline-flex h-11 items-center justify-center gap-2 rounded-btn border border-white/[0.22] px-4 font-display text-[14px] font-bold text-white transition-colors hover:bg-white/[0.08] disabled:opacity-60';
const LINK =
  'font-semibold text-[var(--lp-link)] underline underline-offset-2 hover:text-white';

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-btn border border-[rgba(255,138,138,0.4)] bg-[rgba(255,138,138,0.08)] px-3.5 py-3 text-[13.5px] text-[#ffb4b4]"
    >
      <TriangleAlert size={16} className="mt-0.5 flex-shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-btn border border-lp-line bg-[#0A1830] px-3.5 py-3 text-[13.5px] text-[var(--lp-soft)]"
    >
      {children}
    </p>
  );
}

export function DeletionRequest() {
  const [stage, setStage] = useState<Stage>('checking');
  const [account, setAccount] = useState('');
  const [pending, setPending] = useState<PendingDeletion | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [word, setWord] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [lock, setLock] = useState<LockState>({ attempts: 0, lockUntil: 0 });

  /** Tras tener sesión: ¿ya hay una baja programada? */
  async function loadAccount(userEmail: string) {
    setAccount(userEmail);
    try {
      const row = await getPendingDeletion(supabase);
      setPending(row);
      setStage(row ? 'scheduled' : 'confirm');
    } catch {
      setPending(null);
      setStage('confirm');
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!alive) return;
        if (data.user) await loadAccount(data.user.email ?? '');
        else setStage('login');
      } catch {
        if (alive) setStage('login');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setNote(null);
    if (lockSecondsLeft(lock, Date.now()) > 0) {
      setError(failureMessage(lock, Date.now()));
      return;
    }
    if (!EMAIL_RE.test(email.trim()) || !password) {
      setError('Escribe el correo y la contraseña de tu cuenta.');
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (err || !data.user) {
      if (err && /invalid login credentials/i.test(err.message)) {
        const t = Date.now();
        const next = registerFailure(lock, t);
        setLock(next);
        setError(failureMessage(next, t));
      } else {
        setError(authMessage(err?.message ?? ''));
      }
      return;
    }
    setLock({ attempts: 0, lockUntil: 0 });
    setPassword('');
    await loadAccount(data.user.email ?? email.trim());
  }

  async function forgot() {
    setError(null);
    setNote(null);
    if (!EMAIL_RE.test(email.trim())) {
      setError('Escribe primero el correo de tu cuenta.');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/restablecer` },
    );
    setBusy(false);
    if (err) {
      setError(authMessage(err.message));
      return;
    }
    setNote(
      'Si el correo tiene una cuenta, te enviamos un enlace para crear una contraseña nueva. Después vuelve a esta página.',
    );
  }

  async function submitDeletion(e: React.FormEvent) {
    e.preventDefault();
    if (!isDeleteConfirmed(word)) return;
    setBusy(true);
    setError(null);
    try {
      const row = await requestDeletion(supabase);
      setPending(row);
      setWord('');
      setStage('scheduled');
    } catch (err) {
      setError(
        deletionBlockedReason(err) ??
          'No pudimos registrar tu solicitud. Inténtalo de nuevo en unos minutos.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    setBusy(true);
    setError(null);
    try {
      await cancelDeletion(supabase);
      setPending(null);
      setNote('Cancelamos tu solicitud. Tu cuenta sigue activa.');
      setStage('confirm');
    } catch {
      setError('No pudimos cancelar la solicitud. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    await supabase.auth.signOut().catch(() => {});
    setBusy(false);
    setAccount('');
    setPending(null);
    setWord('');
    setError(null);
    setNote(null);
    setStage('login');
  }

  const sessionBar = (
    <div className="flex flex-wrap items-center gap-3 text-[14px] text-[var(--lp-soft)]">
      <span>
        Sesión iniciada como{' '}
        <strong className="font-semibold text-lp-text">{account}</strong>
      </span>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="ml-auto inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--lp-link)] hover:text-white"
      >
        <LogOut size={14} aria-hidden /> Cerrar sesión
      </button>
    </div>
  );

  return (
    <div
      aria-live="polite"
      className="rounded-[18px] border border-lp-line bg-[rgba(10,24,48,0.55)] p-5 sm:p-6"
    >
      {stage === 'checking' && (
        <p className="flex items-center gap-2 text-[14px] text-[var(--lp-soft)]">
          <Loader2 size={16} className="animate-spin" aria-hidden /> Cargando…
        </p>
      )}

      {stage === 'login' && (
        <form onSubmit={signIn} noValidate className="flex flex-col gap-4">
          <p className="text-[14.5px] text-lp-body">
            Inicia sesión con el correo y la contraseña que usas en la app.
          </p>
          <div>
            <label htmlFor="del-email" className={LABEL}>
              Correo
            </label>
            <input
              id="del-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={INPUT}
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label htmlFor="del-pass" className={LABEL}>
              Contraseña
            </label>
            <input
              id="del-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={INPUT}
            />
          </div>
          {error && <Alert>{error}</Alert>}
          {note && <Note>{note}</Note>}
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={busy} className={PRIMARY}>
              {busy && <Loader2 size={17} className="animate-spin" aria-hidden />}
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={forgot}
              disabled={busy}
              className={`text-[14px] ${LINK}`}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      )}

      {stage === 'confirm' && (
        <form onSubmit={submitDeletion} noValidate className="flex flex-col gap-4">
          {sessionBar}
          {note && <Note>{note}</Note>}
          <p className="text-[14.5px] leading-[1.65] text-lp-body">
            Al confirmar, programamos la eliminación de tu cuenta para dentro
            de 30 días. Hasta entonces puedes cancelarla aquí o en la app.
          </p>
          <div>
            <label htmlFor="del-word" className={LABEL}>
              Escribe {DELETE_WORD} para confirmar
            </label>
            <input
              id="del-word"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={word}
              onChange={e => setWord(e.target.value)}
              className={INPUT}
              placeholder={DELETE_WORD}
            />
          </div>
          {error && <Alert>{error}</Alert>}
          <button
            type="submit"
            disabled={busy || !isDeleteConfirmed(word)}
            className={`${DANGER} self-start`}
          >
            {busy && <Loader2 size={17} className="animate-spin" aria-hidden />}
            Solicitar eliminación
          </button>
        </form>
      )}

      {stage === 'scheduled' && pending && (
        <div className="flex flex-col gap-4">
          {sessionBar}
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(245,185,74,0.12)] text-[var(--lp-warn)]">
              <CalendarClock size={22} aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-[19px] font-extrabold text-lp-text">
                Eliminación programada
              </h3>
              <p className="mt-1 text-[14.5px] leading-[1.65] text-lp-body">
                Tu cuenta se eliminará el{' '}
                <strong className="text-lp-text">
                  {formatDeletionDate(pending.execute_after)}
                </strong>
                . Si cambias de opinión, cancélala antes de esa fecha.
              </p>
            </div>
          </div>
          {error && <Alert>{error}</Alert>}
          <button
            type="button"
            onClick={undo}
            disabled={busy}
            className={`${GHOST} self-start`}
          >
            {busy && <Loader2 size={15} className="animate-spin" aria-hidden />}
            Cancelar solicitud
          </button>
        </div>
      )}
    </div>
  );
}
