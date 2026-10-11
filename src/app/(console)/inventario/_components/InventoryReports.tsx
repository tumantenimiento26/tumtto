'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Download } from 'lucide-react';
import { Badge, Button, Chip, DataTable, EmptyState, toast, type DataColumn } from '@/components/ds';
import { downloadCsv } from '../../servicios/_components/shared';
import {
  fetchToolsByTechnician,
  fetchToolsOutstanding,
  useExtras,
  type ByTechnicianRow,
  type OutstandingRow,
} from '@/lib/data/store';
import {
  AGE_FILTERS,
  CONDITION_LABEL,
  ageTone,
  formatMxn,
  heldLabel,
  inventoryCsv,
  shortDate,
} from '@/lib/inventory';

function useReport<T>(load: () => Promise<T[]>, deps: unknown[]) {
  const assignments = useExtras(s => s.toolAssignments);
  const tools = useExtras(s => s.companyTools);
  const [rows, setRows] = useState<T[] | null>(null);
  useEffect(() => {
    let alive = true;
    void load().then(r => alive && setRows(r));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignments, tools, ...deps]);
  return rows;
}

function ReportBar({ count, label, onExport, children }: { count: number; label: string; onExport: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-4">
      {children}
      <span className="font-mono text-[12px] text-muted">
        {count} {label}
      </span>
      <Button className="ml-auto" variant="secondary" icon={Download} disabled={!count} onClick={onExport}>
        Exportar CSV
      </Button>
    </div>
  );
}

/** «Asignada por técnico»: qué tiene cada técnico y su valor. */
export function ByTechnicianReport() {
  const rows = useReport(fetchToolsByTechnician, []);
  const list = rows ?? [];
  const columns: DataColumn<ByTechnicianRow>[] = [
    {
      key: 'tecnico',
      header: 'Técnico',
      sortValue: r => r.technician_name,
      render: r => (
        <Link href={`/tecnicos/${r.technician_id}`} onClick={e => e.stopPropagation()} className="font-display text-[13.5px] font-bold text-navy hover:text-primary">
          {r.technician_name}
        </Link>
      ),
    },
    {
      key: 'n',
      header: 'Herramientas',
      align: 'right',
      sortValue: r => r.tools_count,
      render: r => <span className="font-mono text-[13px] font-semibold tabular text-navy">{r.tools_count}</span>,
    },
    {
      key: 'items',
      header: 'Detalle',
      render: r => <span className="text-[13px] text-body">{r.tools.map(t => t.name).join(' · ')}</span>,
    },
    {
      key: 'valor',
      header: 'Valor total',
      align: 'right',
      sortValue: r => r.total_value_cents,
      render: r => <span className="font-mono text-[13px] font-semibold tabular text-navy">{formatMxn(r.total_value_cents)}</span>,
    },
  ];
  function exportCsv() {
    downloadCsv(
      'inventario-por-tecnico.csv',
      inventoryCsv(
        list.flatMap(r =>
          r.tools.map(t => ({
            Técnico: r.technician_name,
            Herramienta: t.name,
            'Serie/código': t.serial_or_code,
            'Asignada desde': t.assigned_at.slice(0, 10),
            'Herramientas del técnico': r.tools_count,
            'Valor total del técnico (MXN)': r.total_value_cents / 100,
          })),
        ),
      ),
    );
    toast.success('CSV exportado', `${list.length} técnicos`);
  }
  return (
    <>
      <ReportBar count={list.length} label={`técnico${list.length === 1 ? '' : 's'} con herramienta`} onExport={exportCsv} />
      <DataTable
        rows={list}
        loading={rows === null}
        columns={columns}
        rowKey={r => r.technician_id}
        initialSort={{ key: 'n', dir: 'desc' }}
        minWidth={640}
        empty={<EmptyState kind="first-use" title="Sin herramienta asignada" description="Cuando asignes herramienta a un técnico aparecerá aquí." />}
      />
    </>
  );
}

/** «Pendiente de devolución»: asignaciones abiertas con filtro de antigüedad. */
export function OutstandingReport() {
  const [age, setAge] = useState<number>(0);
  const rows = useReport(() => fetchToolsOutstanding(age), [age]);
  const list = rows ?? [];
  const columns: DataColumn<OutstandingRow>[] = [
    {
      key: 'tool',
      header: 'Herramienta',
      sortValue: r => r.tool_name,
      render: r => (
        <div className="min-w-0">
          <Link href={`/inventario/${r.tool_id}`} onClick={e => e.stopPropagation()} className="font-display text-[13.5px] font-bold text-navy hover:text-primary">
            {r.tool_name}
          </Link>
          <div className="font-mono text-[12px] text-muted">{r.serial_or_code}</div>
        </div>
      ),
    },
    {
      key: 'tecnico',
      header: 'Técnico',
      sortValue: r => r.technician_name,
      render: r => (
        <Link href={`/tecnicos/${r.technician_id}`} onClick={e => e.stopPropagation()} className="text-[13.5px] text-body hover:text-primary">
          {r.technician_name}
        </Link>
      ),
    },
    { key: 'desde', header: 'Entregada', sortValue: r => r.assigned_at, render: r => <span className="text-[13px] text-muted">{shortDate(r.assigned_at)}</span> },
    {
      key: 'cond',
      header: 'Condición',
      hideOnMobile: true,
      render: r => <span className="text-[13px] text-muted">{CONDITION_LABEL[r.assigned_condition]}</span>,
    },
    {
      key: 'dias',
      header: 'En posesión',
      align: 'right',
      sortValue: r => r.days_held,
      render: r => (
        <Badge tone={ageTone(r.days_held)}>
          <Clock size={12} /> {heldLabel(r.days_held)}
        </Badge>
      ),
    },
  ];
  function exportCsv() {
    downloadCsv(
      'inventario-pendiente-devolucion.csv',
      inventoryCsv(
        list.map(r => ({
          Herramienta: r.tool_name,
          'Serie/código': r.serial_or_code,
          Técnico: r.technician_name,
          Entregada: r.assigned_at.slice(0, 10),
          'Condición al entregar': CONDITION_LABEL[r.assigned_condition],
          'Días en posesión': r.days_held,
          'Valor (MXN)': r.acquisition_cost_cents == null ? '' : r.acquisition_cost_cents / 100,
        })),
      ),
    );
    toast.success('CSV exportado', `${list.length} herramientas`);
  }
  return (
    <>
      <ReportBar count={list.length} label={`pendiente${list.length === 1 ? '' : 's'} de devolución`} onExport={exportCsv}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Antigüedad">
          {AGE_FILTERS.map(a => (
            <Chip key={a.value} active={age === a.value} onClick={() => setAge(a.value)}>
              {a.label}
            </Chip>
          ))}
        </div>
      </ReportBar>
      <DataTable
        rows={list}
        loading={rows === null}
        columns={columns}
        rowKey={r => r.assignment_id}
        initialSort={{ key: 'dias', dir: 'desc' }}
        minWidth={720}
        empty={<EmptyState kind="no-results" title="Nada pendiente" description="Ninguna herramienta supera esa antigüedad." />}
      />
    </>
  );
}
