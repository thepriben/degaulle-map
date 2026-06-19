/**
 * Validation des CSV sources de degaulle-map.
 *
 * Vérifie : dates ISO, cohérence date_end >= date_start, bornes lat/lng,
 * énumérations event_type / certainty, présence d'une URL de source pour les
 * entrées publiées, intégrité référentielle (place_id, source_id), unicité des
 * identifiants. Produit aussi un rapport de continuité des périodes de base
 * (intervalles non couverts = source_gap) entre 1940-06-10 et 1945-12-31.
 *
 * Sortie : code 1 s'il existe au moins une erreur (utilisable en CI).
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readCsvObjects } from "./csv.ts";
import {
  isValidIsoDate,
  compareIso,
  dayNumber,
  isoFromDayNumber,
} from "./dates.ts";
import {
  EVENT_TYPES,
  CERTAINTY_LEVELS,
  RELIABILITY_LEVELS,
  BASE_EVENT_TYPES,
  type EventRow,
  type PlaceRow,
  type SourceRow,
  type EventType,
} from "./types.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(HERE, "..", "data");

const COVERAGE_START = "1940-06-10";
const COVERAGE_END = "1945-12-31";

const errors: string[] = [];
const warnings: string[] = [];

function err(msg: string): void {
  errors.push(msg);
}
function warn(msg: string): void {
  warnings.push(msg);
}

function isNumberInRange(value: string, min: number, max: number): boolean {
  if (value.trim() === "") return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

function main(): void {
  const sources = readCsvObjects<SourceRow>(resolve(DATA_DIR, "sources.csv"));
  const places = readCsvObjects<PlaceRow>(resolve(DATA_DIR, "places.csv"));
  const events = readCsvObjects<EventRow>(resolve(DATA_DIR, "events.csv"));

  // --- sources.csv ---
  const sourceIds = new Set<string>();
  for (const [i, s] of sources.entries()) {
    const line = i + 2;
    if (!s.source_id) err(`sources L${line}: source_id manquant`);
    else if (sourceIds.has(s.source_id))
      err(`sources L${line}: source_id dupliqué "${s.source_id}"`);
    else sourceIds.add(s.source_id);

    if (!s.title) err(`sources L${line} (${s.source_id}): title manquant`);
    if (s.reliability && !RELIABILITY_LEVELS.includes(s.reliability as never))
      warn(
        `sources L${line} (${s.source_id}): reliability inconnue "${s.reliability}" (attendu: ${RELIABILITY_LEVELS.join(", ")})`,
      );
  }

  // --- places.csv ---
  const placeIds = new Set<string>();
  for (const [i, p] of places.entries()) {
    const line = i + 2;
    if (!p.place_id) err(`places L${line}: place_id manquant`);
    else if (placeIds.has(p.place_id))
      err(`places L${line}: place_id dupliqué "${p.place_id}"`);
    else placeIds.add(p.place_id);

    if (!p.name) err(`places L${line} (${p.place_id}): name manquant`);
    if (!isNumberInRange(p.lat, -90, 90))
      err(`places L${line} (${p.place_id}): lat invalide "${p.lat}"`);
    if (!isNumberInRange(p.lng, -180, 180))
      err(`places L${line} (${p.place_id}): lng invalide "${p.lng}"`);
  }

  // --- events.csv ---
  const eventIds = new Set<string>();
  for (const [i, e] of events.entries()) {
    const line = i + 2;
    const tag = e.id || `L${line}`;

    if (!e.id) err(`events L${line}: id manquant`);
    else if (eventIds.has(e.id))
      err(`events L${line}: id dupliqué "${e.id}"`);
    else eventIds.add(e.id);

    if (!isValidIsoDate(e.date_start))
      err(`events ${tag}: date_start invalide "${e.date_start}"`);
    if (e.date_end) {
      if (!isValidIsoDate(e.date_end))
        err(`events ${tag}: date_end invalide "${e.date_end}"`);
      else if (
        isValidIsoDate(e.date_start) &&
        compareIso(e.date_end, e.date_start) < 0
      )
        err(
          `events ${tag}: date_end (${e.date_end}) < date_start (${e.date_start})`,
        );
    }

    if (!isNumberInRange(e.lat, -90, 90))
      err(`events ${tag}: lat invalide "${e.lat}"`);
    if (!isNumberInRange(e.lng, -180, 180))
      err(`events ${tag}: lng invalide "${e.lng}"`);

    if (!EVENT_TYPES.includes(e.event_type as EventType))
      err(`events ${tag}: event_type inconnu "${e.event_type}"`);
    if (!CERTAINTY_LEVELS.includes(e.certainty as never))
      err(`events ${tag}: certainty inconnue "${e.certainty}"`);

    if (!e.title) err(`events ${tag}: title manquant`);

    if (!e.place_id) err(`events ${tag}: place_id manquant`);
    else if (!placeIds.has(e.place_id))
      err(`events ${tag}: place_id "${e.place_id}" absent de places.csv`);

    if (!e.source_id) err(`events ${tag}: source_id manquant`);
    else if (!sourceIds.has(e.source_id))
      err(`events ${tag}: source_id "${e.source_id}" absent de sources.csv`);

    // URL de source pour les entrées publiées : l'URL peut venir de l'événement
    // ou de la source référencée.
    const sourceUrl =
      e.source_url ||
      sources.find((s) => s.source_id === e.source_id)?.url ||
      "";
    if (!sourceUrl && e.certainty !== "uncertain")
      warn(
        `events ${tag}: aucune source_url (ni sur l'événement ni sur la source)`,
      );

    if (!e.source_quote && e.certainty !== "uncertain")
      warn(`events ${tag}: source_quote vide`);
  }

  reportBaseContinuity(events);

  // --- Sortie ---
  console.log(
    `Lu : ${sources.length} sources, ${places.length} lieux, ${events.length} événements.`,
  );
  if (warnings.length) {
    console.log(`\n${warnings.length} avertissement(s) :`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
  if (errors.length) {
    console.error(`\n${errors.length} erreur(s) :`);
    for (const e of errors) console.error(`  x ${e}`);
    console.error("\nValidation ÉCHOUÉE.");
    process.exit(1);
  }
  console.log("\nValidation OK.");
}

/**
 * Rapport de continuité des périodes de base : trie les périodes
 * (government_base / military_assignment avec date_end) et liste les jours non
 * couverts dans [COVERAGE_START, COVERAGE_END] (source_gap potentiels), ainsi
 * que les chevauchements.
 */
function reportBaseContinuity(events: EventRow[]): void {
  const bases = events
    .filter(
      (e) =>
        BASE_EVENT_TYPES.includes(e.event_type as EventType) &&
        e.date_end &&
        isValidIsoDate(e.date_start) &&
        isValidIsoDate(e.date_end),
    )
    .map((e) => ({
      id: e.id,
      start: dayNumber(e.date_start),
      end: dayNumber(e.date_end),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  console.log(`\nPériodes de base : ${bases.length}.`);
  if (bases.length === 0) {
    warn("Aucune période de base : la couche quotidienne sera entièrement source_gap.");
    return;
  }

  const covStart = dayNumber(COVERAGE_START);
  const covEnd = dayNumber(COVERAGE_END);

  // Chevauchements.
  for (let i = 1; i < bases.length; i++) {
    const prev = bases[i - 1]!;
    const cur = bases[i]!;
    if (cur.start <= prev.end) {
      warn(
        `chevauchement de périodes de base : "${prev.id}" (jusqu'au ${isoFromDayNumber(prev.end)}) et "${cur.id}" (dès le ${isoFromDayNumber(cur.start)})`,
      );
    }
  }

  // Lacunes de couverture.
  const gaps: Array<{ from: number; to: number }> = [];
  let cursor = covStart;
  for (const b of bases) {
    if (b.end < covStart || b.start > covEnd) continue;
    if (b.start > cursor) {
      gaps.push({ from: cursor, to: Math.min(b.start - 1, covEnd) });
    }
    cursor = Math.max(cursor, b.end + 1);
    if (cursor > covEnd) break;
  }
  if (cursor <= covEnd) gaps.push({ from: cursor, to: covEnd });

  if (gaps.length === 0) {
    console.log(
      `Couverture des bases : complète de ${COVERAGE_START} à ${COVERAGE_END}.`,
    );
  } else {
    const totalDays = gaps.reduce((s, g) => s + (g.to - g.from + 1), 0);
    console.log(
      `Lacunes de base (source_gap) : ${gaps.length} intervalle(s), ${totalDays} jour(s) non couvert(s) :`,
    );
    for (const g of gaps) {
      const days = g.to - g.from + 1;
      console.log(
        `  . ${isoFromDayNumber(g.from)} -> ${isoFromDayNumber(g.to)} (${days} j)`,
      );
    }
  }
}

main();
