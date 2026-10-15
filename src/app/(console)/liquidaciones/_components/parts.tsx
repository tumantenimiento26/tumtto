'use client';
import { Card } from '@/components/ds';
import { netTone, money } from '@/lib/settlements';

export const TONE_CLASS = {
  'owes-tech': 'text-primary',
  'owes-admin': 'text-warning-ink',
  even: 'text-muted',
} as const;

/** Neto con color y explicación corta. */
export function NetValue({ cents, long }: { cents: number; long?: boolean }) {
  const tone = netTone(cents);
  const label =
    tone === 'owes-tech' ? 'Le debemos' : tone === 'owes-admin' ? 'Nos debe' : 'Al corriente';
  return (
    <span className={`${TONE_CLASS[tone]} whitespace-nowrap tabular`}>
      <span className="font-mono text-[13px] font-semibold">{money(Math.abs(cents))}</span>
      <span className="ml-1.5 font-sans text-[11.5px] font-medium">
        {long ? label : tone === 'even' ? '' : label}
      </span>
    </span>
  );
}

/** Tile de cifra con título corto y una línea de ayuda. */
export function Tile({
  label,
  value,
  help,
  valueClass = 'text-navy',
}: {
  label: string;
  value: string;
  help: string;
  valueClass?: string;
}) {
  return (
    <Card padded className="animate-up">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className={`mt-2 font-display text-[27px] font-extrabold tracking-[-0.5px] tabular ${valueClass}`}>
        {value}
      </div>
      <div className="mt-1 font-sans text-[12px] text-muted">{help}</div>
    </Card>
  );
}
