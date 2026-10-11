import { describe, expect, it } from 'vitest';
import { AVATAR_KEYS, defaultAvatarFor, resolveAvatar } from './avatarArt';

describe('avatarArt (paridad con mobile)', () => {
  it('claves en el orden del contrato', () => {
    expect(AVATAR_KEYS).toEqual(['llave', 'casco', 'foco', 'gota', 'casa', 'martillo']);
  });
  it('hash: suma de char codes sin guiones mod 6', () => {
    expect(defaultAvatarFor('00')).toBe('llave');
    expect(defaultAvatarFor('0-1')).toBe('casco');
    expect(defaultAvatarFor('a')).toBe('casco');
    expect(defaultAvatarFor('')).toBe('llave');
    expect(defaultAvatarFor(null)).toBe('llave');
    expect(defaultAvatarFor('3f2b8c1e-9a4d-4e0b-8c7a-1d2e3f4a5b6c')).toBe('llave');
    expect(defaultAvatarFor('00000000-0000-0000-0000-000000000001')).toBe('casco');
    expect(defaultAvatarFor('ffffffff-ffff-ffff-ffff-ffffffffffff')).toBe('llave');
    expect(defaultAvatarFor('a1b2c3d4-e5f6-4789-abcd-ef0123456789')).toBe('casa');
  });
  it('resolveAvatar cae al default', () => {
    expect(resolveAvatar('gota', 'x')).toBe('gota');
    expect(resolveAvatar('perro', 'a')).toBe(defaultAvatarFor('a'));
  });
});
