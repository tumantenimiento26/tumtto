// Servicio de «Fotos y documentos» de herramienta (tabla tool_attachments + bucket privado tool-files).
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { MOCK } from '@/lib/mock';
import { getAllTechTools, getCompanyTools } from '@/lib/data/store';
import { toast } from '@/components/toast';
import {
  sortToolFiles,
  toolFilePath,
  validateToolFile,
  type ToolAttachment,
  type ToolAttachmentKind,
} from '@/lib/toolFiles';

const BUCKET = 'tool-files';

interface FilesState {
  files: ToolAttachment[];
  /** true si la tabla/bucket no está disponible en este entorno. */
  unavailable: boolean;
}
export const useToolFiles = create<FilesState>(() => ({ files: [], unavailable: false }));

export const getCompanyToolFiles = (toolId: string) =>
  sortToolFiles(useToolFiles.getState().files.filter(f => f.company_tool_id === toolId));
export const getTechToolFiles = (techToolIds: string[]) =>
  sortToolFiles(useToolFiles.getState().files.filter(f => f.technician_tool_id && techToolIds.includes(f.technician_tool_id)));

// --- Maqueta -----------------------------------------------------------------
let seededCompany = false;
let seededTech = false;
const mockSvg = (label: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="100%" height="100%" fill="#e8eefb"/><text x="50%" y="54%" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="700" fill="#2b4fb4">${label.replace(/[<&]/g, '')}</text></svg>`,
  );
const mockBlobs = new Map<string, string>();
const mockPdf = () =>
  URL.createObjectURL(
    new Blob(['%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 100]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF'], { type: 'application/pdf' }),
  );

function seedMock() {
  const companyToolIds = seededCompany ? [] : getCompanyTools().slice(0, 2).map(t => t.id);
  const techToolIds = seededTech ? [] : getAllTechTools().filter((_, i) => i % 3 === 0).slice(0, 25).map(t => t.id);
  if (companyToolIds.length) seededCompany = true;
  if (techToolIds.length) seededTech = true;
  const day = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const mk = (
    i: number,
    owner: Pick<ToolAttachment, 'company_tool_id' | 'technician_tool_id'>,
    kind: ToolAttachmentKind,
    name: string,
    mime: string,
    title: string | null,
    expires_on: string | null,
  ): ToolAttachment => ({
    id: `mock-tf-${i}`,
    ...owner,
    kind,
    file_path: `mock/${i}`,
    file_name: name,
    mime_type: mime,
    size_bytes: 180_000 + i * 1000,
    title,
    expires_on,
    uploaded_by: null,
    created_at: new Date(Date.now() - i * 864e5).toISOString(),
  });
  const rows: ToolAttachment[] = [];
  const [c1, c2] = companyToolIds;
  const none = { company_tool_id: null, technician_tool_id: null };
  if (c1) {
    const o = { ...none, company_tool_id: c1 };
    rows.push(
      mk(1, o, 'photo', 'frente.jpg', 'image/jpeg', 'Vista frontal', null),
      mk(2, o, 'warranty', 'garantia.pdf', 'application/pdf', 'Garantía 2 años', day(18)),
      mk(3, o, 'manual', 'manual.pdf', 'application/pdf', null, null),
    );
  }
  if (c2) {
    const o = { ...none, company_tool_id: c2 };
    rows.push(
      mk(4, o, 'warranty', 'garantia-vencida.pdf', 'application/pdf', 'Garantía de fábrica', day(-40)),
      mk(5, o, 'invoice', 'factura.pdf', 'application/pdf', null, null),
    );
  }
  techToolIds.forEach((id, n) => {
    const o = { ...none, technician_tool_id: id };
    rows.push(mk(10 + n, o, 'photo', `herramienta-${n + 1}.jpg`, 'image/jpeg', null, null));
    if (n === 0) rows.push(mk(20, o, 'warranty', 'garantia.pdf', 'application/pdf', 'Garantía Truper', day(200)));
  });
  useToolFiles.setState(s => ({ files: [...s.files, ...rows] }));
}

// --- Lectura -----------------------------------------------------------------
type Scope = { companyToolId: string } | { technicianToolIds: string[] };

/** Carga los archivos de una herramienta de empresa o de las herramientas de un técnico. */
export async function loadToolFiles(scope: Scope) {
  if (MOCK) {
    seedMock();
    return;
  }
  const ids = 'companyToolId' in scope ? [scope.companyToolId] : scope.technicianToolIds;
  if (ids.length === 0) return;
  const q = supabase.from('tool_attachments').select('*').order('created_at', { ascending: false });
  const { data, error } = await ('companyToolId' in scope
    ? q.eq('company_tool_id', scope.companyToolId)
    : q.in('technician_tool_id', ids));
  if (error) {
    console.warn('[data] tool_attachments no disponible', error);
    useToolFiles.setState({ unavailable: true });
    return;
  }
  useToolFiles.setState(s => ({
    unavailable: false,
    files: [
      ...s.files.filter(f => !ids.includes(f.company_tool_id ?? f.technician_tool_id ?? '')),
      ...data,
    ],
  }));
}

/** URL firmada (1 h) del archivo. */
export async function getToolFileUrl(a: ToolAttachment): Promise<string | null> {
  if (MOCK) {
    if (a.mime_type === 'application/pdf') {
      if (!mockBlobs.has(a.id)) mockBlobs.set(a.id, mockPdf());
      return mockBlobs.get(a.id)!;
    }
    return mockBlobs.get(a.id) ?? mockSvg(a.title ?? a.file_name);
  }
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(a.file_path, 3600);
  return error || !data?.signedUrl ? null : data.signedUrl;
}

// --- Escritura ---------------------------------------------------------------
export interface ToolFileInput {
  file: File;
  kind: ToolAttachmentKind;
  title: string;
  /** YYYY-MM-DD, solo para garantías. */
  expires_on: string | null;
}

/** Sube un archivo a una herramienta de la empresa; null si falla (ya avisó con toast). */
export async function addCompanyToolFile(companyToolId: string, input: ToolFileInput): Promise<ToolAttachment | null> {
  const err = validateToolFile(input.file, getCompanyToolFiles(companyToolId).length);
  if (err) {
    toast.error(err);
    return null;
  }
  const id = crypto.randomUUID();
  const path = toolFilePath({ companyToolId }, id, input.file.type);
  const base = {
    company_tool_id: companyToolId,
    technician_tool_id: null,
    kind: input.kind,
    file_path: path,
    file_name: input.file.name.slice(-120),
    mime_type: input.file.type,
    size_bytes: input.file.size,
    title: input.title.trim() || null,
    expires_on: input.kind === 'warranty' ? input.expires_on : null,
  };
  if (MOCK) {
    const row: ToolAttachment = { id, ...base, uploaded_by: null, created_at: new Date().toISOString() };
    mockBlobs.set(id, URL.createObjectURL(input.file));
    useToolFiles.setState(s => ({ files: [row, ...s.files] }));
    return row;
  }
  const up = await supabase.storage.from(BUCKET).upload(path, input.file, { contentType: input.file.type, upsert: false });
  if (up.error) {
    toast.error('No se pudo subir el archivo.');
    return null;
  }
  const { data, error } = await supabase.from('tool_attachments').insert({ id, ...base }).select('*').single();
  if (error || !data) {
    await supabase.storage.from(BUCKET).remove([path]);
    toast.error(
      error?.message === 'limite de archivos'
        ? 'Alcanzaste el máximo de archivos por herramienta.'
        : 'No se pudo guardar el archivo.',
    );
    return null;
  }
  useToolFiles.setState(s => ({ files: [data, ...s.files] }));
  return data;
}

/** Borra la fila y luego el objeto (un objeto ya inexistente no es error). */
export async function removeToolFile(a: ToolAttachment): Promise<true | null> {
  if (!MOCK) {
    const { error } = await supabase.from('tool_attachments').delete().eq('id', a.id);
    if (error) {
      toast.error('No se pudo eliminar el archivo.');
      return null;
    }
    await supabase.storage.from(BUCKET).remove([a.file_path]);
  }
  useToolFiles.setState(s => ({ files: s.files.filter(f => f.id !== a.id) }));
  return true;
}
