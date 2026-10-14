import { describe, expect, it } from 'vitest';
import {
  AVATAR_IDS,
  avatarMarkup,
  resolveAvatarId,
  resolveAvatarSource,
} from '.';
import { AVATAR_ART } from './art';

describe('avatars', () => {
  it('16 ids, incluye los del contrato', () => {
    expect(AVATAR_IDS).toHaveLength(16);
    for (const id of ['silueta', 'casita', 'casco', 'soldador', 'clasica'])
      expect(AVATAR_IDS).toContain(id);
  });
  it('id desconocido / vacío -> silueta', () => {
    expect(resolveAvatarId('llave')).toBe('silueta');
    expect(resolveAvatarId('toString')).toBe('silueta');
    expect(resolveAvatarId(null)).toBe('silueta');
    expect(resolveAvatarId(undefined)).toBe('silueta');
    expect(resolveAvatarId('')).toBe('silueta');
    expect(resolveAvatarId('casita')).toBe('casita');
  });
  it('la foto siempre gana', () => {
    expect(resolveAvatarSource('casco', 'https://x/y.jpg')).toEqual({
      kind: 'photo',
      url: 'https://x/y.jpg',
    });
    expect(resolveAvatarSource('casco', '  ')).toEqual({
      kind: 'art',
      id: 'casco',
    });
    expect(resolveAvatarSource('nope', null)).toEqual({
      kind: 'art',
      id: 'silueta',
    });
  });
  it('arte limpio: clases de animación y sin metadata', () => {
    for (const id of AVATAR_IDS)
      for (const m of ['tint', 'bold'] as const) {
        const s = AVATAR_ART[id][m];
        expect(s).toContain('class="char"');
        expect(s).toContain('class="halo"');
        expect(s.toLowerCase()).not.toMatch(/c2pa|<metadata|<script|<svg/);
      }
  });
  it('ids de gradiente únicos por instancia', () => {
    const a = avatarMarkup('casco', 'tint', 'A');
    const b = avatarMarkup('casco', 'tint', 'B');
    expect(a).not.toBe(b);
    expect(a).toMatch(/id="gx\d+-A"/);
    expect(a).toMatch(/url\(#gx\d+-A\)/);
    expect(a).not.toMatch(/id="gx\d+"/);
  });
});
