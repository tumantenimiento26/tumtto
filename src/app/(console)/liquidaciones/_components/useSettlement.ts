'use client';
import { useCallback, useEffect, useState } from 'react';
import { fetchSettlementSummary } from '@/lib/data/settlementsStore';
import type { SettlementSummary } from '@/lib/settlements';

/** Carga el resumen de liquidación de un técnico; `reload` tras cada acción. */
export function useSettlement(techId: string) {
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const reload = useCallback(async () => {
    const s = await fetchSettlementSummary(techId);
    setSummary(s);
    setState(s ? 'ready' : 'failed');
  }, [techId]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { summary, state, reload };
}
