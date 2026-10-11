'use client';

import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { Badge } from '@/components/ds';
import { getToolPhotoUrl } from '@/lib/data/store';
import { CONDITION_LABEL, STATUS_META, type InventoryCondition, type InventoryStatus } from '@/lib/inventory';

export const StatusBadge = ({ status }: { status: InventoryStatus }) => (
  <Badge tone={STATUS_META[status].tone} dot>
    {STATUS_META[status].label}
  </Badge>
);

export const conditionLabel = (c: InventoryCondition | null | undefined) => (c ? CONDITION_LABEL[c] : '—');

/** Miniatura de la herramienta (foto en bucket privado vía URL firmada; ícono si no hay). */
export function ToolThumb({ path, size = 40 }: { path: string | null; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setUrl(null);
    if (path) void getToolPhotoUrl(path).then(u => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [path]);
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[9px] border border-line object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-[9px] bg-info-soft text-primary"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Wrench size={Math.round(size * 0.45)} />
    </span>
  );
}

export const NO_PERMISSION = 'Tu rol no opera el inventario';
