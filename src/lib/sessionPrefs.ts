// "Mantener sesión iniciada". Supabase guarda la sesión en localStorage, así
// que sin marca propia siempre persistiría. Si la persona lo desmarca,
// dejamos una bandera y una marca de pestaña (sessionStorage, muere al cerrar
// el navegador); al volver sin la marca se cierra la sesión.
import { supabase } from '@/lib/supabase';

const EPHEMERAL = 'tumtto-ephemeral';
const TAB_ALIVE = 'tumtto-tab-alive';

export function setRememberSession(remember: boolean) {
  try {
    if (remember) {
      localStorage.removeItem(EPHEMERAL);
      sessionStorage.removeItem(TAB_ALIVE);
    } else {
      localStorage.setItem(EPHEMERAL, '1');
      sessionStorage.setItem(TAB_ALIVE, '1');
    }
  } catch {
    /* modo privado sin storage: se comporta como "mantener sesión" */
  }
}

/**
 * Llamar al arrancar (login y, idealmente, AuthProvider/consola): si la
 * sesión era de "no mantener" y el navegador se cerró, la termina.
 */
export async function enforceEphemeralSession(): Promise<boolean> {
  try {
    if (localStorage.getItem(EPHEMERAL) && !sessionStorage.getItem(TAB_ALIVE)) {
      localStorage.removeItem(EPHEMERAL);
      await supabase.auth.signOut();
      return true;
    }
  } catch {
    /* sin storage: nada que hacer */
  }
  return false;
}
