import { expect, test } from 'vitest';
import { appPath, authLinkError, intentUrl, schemeUrl } from './appLinks';

test('el fragmento viaja como query', () => {
  expect(appPath('/invitacion/ABC', '?rol=tecnico')).toBe(
    'invitacion/ABC?rol=tecnico',
  );
  expect(appPath('/auth/callback', '', '#access_token=a&refresh_token=r')).toBe(
    'auth/callback?access_token=a&refresh_token=r',
  );
  expect(appPath('/invitacion/ABC')).toBe('invitacion/ABC');
});

test('intent:// con paquete y respaldo codificado', () => {
  expect(schemeUrl('invitacion/ABC')).toBe('tumtto://invitacion/ABC');
  expect(intentUrl('invitacion/ABC', 'https://tumtto.mx/x?a=1')).toBe(
    'intent://invitacion/ABC#Intent;scheme=tumtto;package=com.tumttomobile;' +
      'S.browser_fallback_url=https%3A%2F%2Ftumtto.mx%2Fx%3Fa%3D1;end',
  );
});

test('detecta enlaces de correo vencidos', () => {
  expect(
    authLinkError('', '#error=access_denied&error_code=otp_expired'),
  ).toEqual({ code: 'otp_expired', expired: true });
  expect(authLinkError('?error=server_error', '')).toEqual({
    code: 'server_error',
    expired: false,
  });
  expect(authLinkError('?code=abc', '')).toBeNull();
});
