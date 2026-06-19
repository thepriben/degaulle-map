/**
 * Lecteur CSV minimal mais correct (RFC 4180) : gère les champs entre
 * guillemets, les virgules et sauts de ligne échappés, et les guillemets
 * doublés. Suffisant pour des fichiers édités à la main, sans dépendance.
 */

import { readFileSync } from "node:fs";

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;
  // Normalise les fins de ligne Windows et retire un éventuel BOM.
  const src = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  while (i < src.length) {
    const char = src[i];

    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += char;
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (char === "\n") {
      row.push(field);
      rows.push(row);
      field = "";
      row = [];
      i += 1;
      continue;
    }
    field += char;
    i += 1;
  }

  // Dernier champ / dernière ligne s'il n'y a pas de saut final.
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

/**
 * Lit un CSV avec en-tête et renvoie une liste d'objets typés par les noms
 * de colonnes. Ignore les lignes entièrement vides.
 */
export function readCsvObjects<T>(path: string): T[] {
  const rows = parseCsv(readFileSync(path, "utf8"));
  if (rows.length === 0) return [];

  const header = rows[0]!.map((h) => h.trim());
  const out: T[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]!;
    const isEmpty = cells.every((c) => c.trim() === "");
    if (isEmpty) continue;

    const obj: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      obj[header[c]!] = (cells[c] ?? "").trim();
    }
    out.push(obj as T);
  }

  return out;
}
