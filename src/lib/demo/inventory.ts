// ponytail: inventario de herramienta de la empresa SOLO para el modo maqueta
// (~25 herramientas en todos los estados, con asignaciones e historial).
import type { Database } from '@/types/supabase';
import type { CompanyTool, ToolAssignment, InventoryCondition, RetireReason } from '@/lib/inventory';

type AdminEventRow = Database['public']['Tables']['admin_events']['Row'];

const DAY = 864e5;
const ADMIN = 'mock-admin';

type Cat = string | null;
type Hist = [tech: string, assignedDaysAgo: number, returnedDaysAgo: number | null, from: InventoryCondition, back?: InventoryCondition, note?: string][];
type Spec = {
  name: string;
  brand: string | null;
  model: string | null;
  serial: string;
  cat: Cat;
  cost: number | null; // pesos
  acquiredDaysAgo: number | null;
  state: 'available' | 'in_repair' | 'retired' | 'auto';
  retire?: [RetireReason, string | null, number];
  hist?: Hist;
  /** Nombre en el catálogo del técnico (liga opcional). */
  catalog?: string;
};

const SPECS: Spec[] = [
  { name: 'Multímetro de gancho', brand: 'Fluke', model: '376 FC', serial: 'TM-EL-0001', cat: 'cat-electrical', cost: 9800, acquiredDaysAgo: 300, state: 'auto', catalog: 'Pinza amperimétrica', hist: [['u-ag', 120, null, 'new']] },
  { name: 'Probador de voltaje sin contacto', brand: 'Klein Tools', model: 'NCVT-3', serial: 'TM-EL-0002', cat: 'cat-electrical', cost: 1250, acquiredDaysAgo: 280, state: 'auto', hist: [['u-jose', 45, null, 'good']] },
  { name: 'Cámara termográfica', brand: 'FLIR', model: 'E4', serial: 'TM-EL-0003', cat: 'cat-electrical', cost: 24500, acquiredDaysAgo: 200, state: 'available', hist: [['u-jose', 150, 100, 'new', 'good']] },
  { name: 'Taladro percutor inalámbrico', brand: 'DeWalt', model: 'DCD996', serial: 'TM-GN-0004', cat: null, cost: 7400, acquiredDaysAgo: 400, state: 'auto', catalog: 'Taladro', hist: [['u-do', 20, null, 'good']] },
  { name: 'Taladro percutor inalámbrico', brand: 'Makita', model: 'XPH12', serial: 'TM-GN-0005', cat: null, cost: 6900, acquiredDaysAgo: 400, state: 'in_repair', hist: [['u-sc', 200, 12, 'new', 'damaged', 'Mandril trabado']] },
  { name: 'Detector de fugas de gas', brand: 'Bacharach', model: 'Leakator 10', serial: 'TM-GS-0006', cat: 'cat-gas', cost: 5200, acquiredDaysAgo: 350, state: 'auto', catalog: 'Detector de fugas de gas', hist: [['u-sc', 75, null, 'good']] },
  { name: 'Manómetro digital de gas', brand: 'Testo', model: '510i', serial: 'TM-GS-0007', cat: 'cat-gas', cost: 3100, acquiredDaysAgo: 350, state: 'available' },
  { name: 'Juego de llaves para gas', brand: 'Truper', model: 'JLG-12', serial: 'TM-GS-0008', cat: 'cat-gas', cost: 890, acquiredDaysAgo: 500, state: 'retired', retire: ['end_of_life', 'Mordazas desgastadas', 40], hist: [['u-sc', 300, 41, 'good', 'fair']] },
  { name: 'Bomba de vacío 5 CFM', brand: 'Yellow Jacket', model: 'SuperEvac', serial: 'TM-AC-0009', cat: 'cat-ac', cost: 11800, acquiredDaysAgo: 260, state: 'auto', catalog: 'Bomba de vacío', hist: [['u-ag', 14, null, 'good']] },
  { name: 'Manómetros de refrigerante', brand: 'Fieldpiece', model: 'SMAN4', serial: 'TM-AC-0010', cat: 'cat-ac', cost: 8600, acquiredDaysAgo: 260, state: 'auto', hist: [['u-lupita', 8, null, 'new']] },
  { name: 'Recuperadora de gas', brand: 'Robinair', model: 'RG6', serial: 'TM-AC-0011', cat: 'cat-ac', cost: 14900, acquiredDaysAgo: 180, state: 'available' },
  { name: 'Pistola de calor', brand: 'Bosch', model: 'GHG 20-63', serial: 'TM-AC-0012', cat: 'cat-ac', cost: 1650, acquiredDaysAgo: 220, state: 'in_repair', hist: [['u-lupita', 90, 5, 'good', 'damaged', 'Resistencia quemada']] },
  { name: 'Cortatubos de cobre', brand: 'Rigid', model: '35S', serial: 'TM-PL-0013', cat: 'cat-plumbing', cost: 980, acquiredDaysAgo: 450, state: 'auto', catalog: 'Cortatubos', hist: [['u-do', 30, null, 'good']] },
  { name: 'Escáner de tuberías (cámara)', brand: 'Ridgid', model: 'SeeSnake Micro', serial: 'TM-PL-0014', cat: 'cat-plumbing', cost: 31200, acquiredDaysAgo: 160, state: 'auto', hist: [['u-do', 62, null, 'new']] },
  { name: 'Hidrolavadora portátil', brand: 'Karcher', model: 'K5', serial: 'TM-PL-0015', cat: 'cat-plumbing', cost: 6300, acquiredDaysAgo: 190, state: 'available', hist: [['u-do', 110, 70, 'new', 'good']] },
  { name: 'Llave Stillson 14"', brand: 'Truper', model: 'STL-14', serial: 'TM-PL-0016', cat: 'cat-plumbing', cost: 420, acquiredDaysAgo: 520, state: 'retired', retire: ['loss', 'No devuelta al terminar la relación', 25], hist: [['u-luis', 240, 26, 'good', 'good', 'No devuelta: pérdida']] },
  { name: 'Soplete de butano', brand: 'Rothenberger', model: 'Super Fire 2', serial: 'TM-PL-0017', cat: 'cat-plumbing', cost: 1480, acquiredDaysAgo: 330, state: 'auto', catalog: 'Soplete', hist: [[ 'demo-tecnico', 38, null, 'good']] },
  { name: 'Juego de destornilladores de precisión', brand: 'iFixit', model: 'Pro Tech', serial: 'TM-AP-0018', cat: 'cat-appliances', cost: 1050, acquiredDaysAgo: 240, state: 'available' },
  { name: 'Multímetro para electrodomésticos', brand: 'Uni-T', model: 'UT61E+', serial: 'TM-AP-0019', cat: 'cat-appliances', cost: 2300, acquiredDaysAgo: 240, state: 'auto', hist: [['u-lupita', 33, null, 'good']] },
  { name: 'Juego de ganzúas profesional', brand: 'Sparrows', model: 'Specialist 15', serial: 'TM-LK-0020', cat: 'cat-locks', cost: 1900, acquiredDaysAgo: 310, state: 'auto', catalog: 'Juego de ganzúas', hist: [['u-jose', 95, null, 'good']] },
  { name: 'Extractor de llaves rotas', brand: 'Hook & Pick', model: 'EX-8', serial: 'TM-LK-0021', cat: 'cat-locks', cost: 340, acquiredDaysAgo: 310, state: 'retired', retire: ['theft', 'Robo en visita a domicilio (acta levantada)', 12], hist: [['u-jose', 100, 13, 'new', 'good', 'No devuelta: robo']] },
  { name: 'Escalera telescópica 3.8 m', brand: 'Werner', model: 'MT-13', serial: 'TM-GN-0022', cat: null, cost: 3600, acquiredDaysAgo: 420, state: 'auto', catalog: 'Escalera', hist: [['u-ag', 180, 150, 'good', 'good'], ['u-ag', 60, null, 'good', undefined, 'Para trabajos en altura']] },
  { name: 'Lámpara frontal recargable', brand: 'Petzl', model: 'Actik Core', serial: 'TM-GN-0023', cat: null, cost: 1350, acquiredDaysAgo: 150, state: 'available', hist: [['u-sc', 100, 60, 'new', 'good'], ['demo-tecnico', 55, 18, 'good', 'good']] },
  { name: 'Flexómetro láser', brand: 'Bosch', model: 'GLM 50-27', serial: 'TM-GN-0024', cat: null, cost: 2100, acquiredDaysAgo: 100, state: 'available' },
  { name: 'Caja de herramientas 120 piezas', brand: 'Stanley', model: 'STMT98109', serial: 'TM-GN-0025', cat: null, cost: null, acquiredDaysAgo: null, state: 'in_repair', hist: [['u-do', 250, 3, 'good', 'fair', 'Broches rotos']] },
];

export function demoInventory(
  now: number,
  techName: (id: string) => string | null,
  catalogId: (name: string) => string | null,
): {
  tools: CompanyTool[];
  assignments: ToolAssignment[];
  events: AdminEventRow[];
} {
  const iso = (daysAgo: number) => new Date(now - daysAgo * DAY).toISOString();
  const ymd = (daysAgo: number) => iso(daysAgo).slice(0, 10);
  const tools: CompanyTool[] = [];
  const assignments: ToolAssignment[] = [];
  const events: AdminEventRow[] = [];
  const ev = (entity: 'company_tool' | 'technician', id: string, type: string, payload: Record<string, unknown>, at: string) =>
    events.push({
      id: `mock-ae-inv-${events.length + 1}`,
      actor_id: ADMIN,
      entity_type: entity,
      entity_id: id,
      event_type: type,
      payload: payload as AdminEventRow['payload'],
      created_at: at,
      updated_at: at,
    });

  SPECS.forEach((s, i) => {
    const id = `mock-ct-${i + 1}`;
    const created = iso((s.acquiredDaysAgo ?? 30) - 1);
    const hist = s.hist ?? [];
    const open = hist.some(h => h[2] === null);
    const status = s.state === 'auto' ? (open ? 'assigned' : 'available') : s.state;
    const [rReason, rNote, rDays] = s.retire ?? [null, null, 0];
    tools.push({
      id,
      name: s.name,
      category_id: s.cat,
      catalog_id: s.catalog ? catalogId(s.catalog) : null,
      brand: s.brand,
      model: s.model,
      serial_or_code: s.serial,
      photo_path: i % 4 === 0 ? `${id}/foto.svg` : null,
      acquired_on: s.acquiredDaysAgo == null ? null : ymd(s.acquiredDaysAgo),
      acquisition_cost_cents: s.cost == null ? null : s.cost * 100,
      status,
      retired_reason: rReason,
      retired_note: rNote,
      retired_at: rReason ? iso(rDays) : null,
      retired_by: rReason ? ADMIN : null,
      created_at: created,
      updated_at: iso(Math.min(...hist.map(h => h[2] ?? h[1]), rDays || 999, 30)),
    });
    ev('company_tool', id, 'tool_created', { name: s.name, serial_or_code: s.serial, category_id: s.cat }, created);
    hist.forEach((h, j) => {
      const [tech, a, r, from, back, note] = h;
      const aid = `mock-cta-${assignments.length + 1}`;
      assignments.push({
        id: aid,
        tool_id: id,
        technician_id: tech,
        assigned_at: iso(a),
        assigned_condition: from,
        assigned_by: ADMIN,
        assign_note: j === 1 || (!r && note) ? (note ?? null) : null,
        returned_at: r === null ? null : iso(r),
        returned_condition: r === null ? null : (back ?? 'good'),
        returned_by: r === null ? null : ADMIN,
        return_note: r === null ? null : (note ?? null),
        created_at: iso(a),
        updated_at: iso(r ?? a),
      });
      ev('company_tool', id, 'tool_assigned', { assignment_id: aid, technician_id: tech, technician_name: techName(tech) ?? tech, condition: from, assigned_at: iso(a) }, iso(a));
      ev('technician', tech, 'company_tool_assigned', { assignment_id: aid, tool_id: id, tool_name: s.name, serial_or_code: s.serial, condition: from }, iso(a));
      if (r !== null) {
        const newStatus = status === 'in_repair' && j === hist.length - 1 ? 'in_repair' : 'available';
        ev('company_tool', id, 'tool_returned', { assignment_id: aid, technician_id: tech, condition: back ?? 'good', returned_at: iso(r), new_status: newStatus, note: note ?? null }, iso(r));
        ev('technician', tech, 'company_tool_returned', { assignment_id: aid, tool_id: id, tool_name: s.name, condition: back ?? 'good', new_status: newStatus }, iso(r));
      }
    });
    if (rReason) ev('company_tool', id, 'tool_retired', { reason: rReason, note: rNote }, iso(rDays));
  });
  return { tools, assignments, events };
}
