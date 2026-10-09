/**
 * El generador de tipos de Supabase marca TODAS las columnas de un
 * `RETURNS TABLE` como no nulas, aunque la consulta pueda devolver NULL
 * (LEFT JOIN, columnas opcionales). Este helper declara las que sí lo son.
 */
export type NullableCols<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};
