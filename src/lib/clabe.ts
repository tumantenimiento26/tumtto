// CLABE interbancaria: 18 dígitos; el último es dígito de control con pesos
// 3-7-1 (módulo 10). Una CLABE con un dígito mal capturado se rechaza aquí y
// no en el primer retiro.
const WEIGHTS = [3, 7, 1];

export function isValidClabe(clabe: string): boolean {
  if (!/^\d{18}$/.test(clabe)) return false;
  const sum = [...clabe.slice(0, 17)].reduce(
    (acc, d, i) => acc + ((Number(d) * WEIGHTS[i % 3]) % 10),
    0,
  );
  return (10 - (sum % 10)) % 10 === Number(clabe[17]);
}
