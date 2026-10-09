'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Toggle } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import {
  countCompanyTechs,
  loadExtras,
  setCompanyActive,
  useExtras,
  useTick,
  type TechnicianCompany,
} from '@/lib/data/store';
import { CompanyModal } from './CompanyModal';

/** Catálogo «Empresas de técnicos» (alta, edición, activar/desactivar). */
export function CompaniesSection() {
  useTick();
  const companies = useExtras(s => s.companies);
  const unavailable = useExtras(s => s.unavailable.companies);
  const canEdit = useAuth().can('usuarios');
  const [modal, setModal] = useState<{ open: boolean; company: TechnicianCompany | null }>({
    open: false,
    company: null,
  });
  useEffect(() => {
    void loadExtras();
  }, []);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-divider px-5 py-4">
        <div>
          <div className="font-display text-[16px] font-bold text-navy">Empresas de técnicos</div>
          <div className="font-sans text-[12px] text-muted">
            Para clasificar a los técnicos de tipo Tercero. Uso interno.
          </div>
        </div>
        <Button
          icon={Plus}
          disabled={!canEdit || unavailable}
          title={canEdit ? undefined : 'Tu rol no administra empresas'}
          onClick={() => setModal({ open: true, company: null })}
        >
          Nueva empresa
        </Button>
      </div>
      {unavailable ? (
        <p className="px-5 py-6 text-[13px] text-muted">
          El catálogo de empresas aún no está disponible en este entorno.
        </p>
      ) : companies.length === 0 ? (
        <EmptyState compact kind="first-use" title="Sin empresas todavía" />
      ) : (
        <ul className="divide-y divide-divider">
          {companies.map(c => {
            const n = countCompanyTechs(c.id);
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-sans text-[14px] font-semibold text-navy">{c.name}</span>
                    {!c.is_active && <Badge tone="neutral">Inactiva</Badge>}
                  </div>
                  <div className="font-sans text-[12px] text-muted">
                    {[c.rfc, c.contact_name, c.contact_phone].filter(Boolean).join(' · ') ||
                      'Sin datos de contacto'}
                  </div>
                </div>
                <Badge tone="info">
                  {n} técnico{n === 1 ? '' : 's'}
                </Badge>
                <Toggle
                  checked={c.is_active}
                  disabled={!canEdit}
                  onChange={v => void setCompanyActive(c.id, v)}
                  aria-label={`Activar ${c.name}`}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Pencil}
                  disabled={!canEdit}
                  onClick={() => setModal({ open: true, company: c })}
                >
                  Editar
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {modal.open && (
        <CompanyModal
          key={modal.company?.id ?? 'new'}
          open
          company={modal.company}
          onClose={() => setModal({ open: false, company: null })}
        />
      )}
    </Card>
  );
}
