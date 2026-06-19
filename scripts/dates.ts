/** Utilitaires de dates ISO (UTC), sans dépendance. */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Vrai si `value` est une date calendaire valide au format `YYYY-MM-DD`. */
export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [y, m, d] = value.split("-").map((p) => Number(p));
  if (m! < 1 || m! > 12 || d! < 1 || d! > 31) return false;
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m! - 1 &&
    dt.getUTCDate() === d
  );
}

/** Convertit `YYYY-MM-DD` en nombre de jours depuis l'epoch (UTC). */
export function dayNumber(value: string): number {
  const [y, m, d] = value.split("-").map((p) => Number(p));
  return Math.floor(Date.UTC(y!, m! - 1, d!) / 86_400_000);
}

/** Convertit un numéro de jour (UTC) en `YYYY-MM-DD`. */
export function isoFromDayNumber(n: number): string {
  const dt = new Date(n * 86_400_000);
  const y = dt.getUTCFullYear().toString().padStart(4, "0");
  const m = (dt.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = dt.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Compare deux dates ISO : -1, 0 ou 1. */
export function compareIso(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
