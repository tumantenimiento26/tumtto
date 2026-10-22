'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ds';
import { money } from '@/lib/settlements';
import { NetValue } from './parts';
import { useSettlement } from './useSettlement';

/** Tarjeta «Liquidación» del perfil del técnico: las 3 cifras + enlace al detalle. */
export function SettlementCard({ techId }: { techId: string }) {
  const { summary } = useSettlement(techId);
  if (!summary) return null;
  const cell = (label: string, node: React.ReactNode) => (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-muted">{label}</div>
      <div className="mt-1 font-display text-[18px] font-extrabold text-navy tabular">{node}</div>
    </div>
  );
  return (
    <Card padded className="animate-up">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-[15px] font-bold text-navy">Liquidación</h3>
        <Link href={`/liquidaciones/${techId}`} className="inline-flex items-center gap-0.5 font-sans text-[12.5px] font-semibold text-primary hover:underline">
          Ver detalle <ChevronRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cell('Le debemos', <span className="text-primary">{money(summary.owed_to_technician_cents)}</span>)}
        {cell('Debe entregar', <span className="text-warning-ink">{money(summary.owed_to_admin_cents)}</span>)}
        {cell('Neto', <NetValue cents={summary.net_cents} />)}
      </div>
    </Card>
  );
}
