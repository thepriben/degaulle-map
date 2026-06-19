/**
 * Construction des données de degaulle-map : lit les CSV, normalise, trie par
 * date et écrit les JSON consommables dans public/data/ :
 *   - events.json   (événements normalisés, triés)
 *   - places.json   (lieux normalisés)
 *   - sources.json  (sources normalisées)
 *   - daily.json    (localisation présumée jour par jour, dérivée)
 *   - manifest.json (métadonnées + statistiques de couverture)
 *
 * La couche quotidienne n'invente aucune source : un jour sans événement
 * attesté hérite de la période de base active (base_inferred), et l'absence de
 * toute information donne source_gap.
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { readCsvObjects } from "./csv.ts";
import {
  isValidIsoDate,
  dayNumber,
  isoFromDayNumber,
  compareIso,
} from "./dates.ts";
import {
  BASE_EVENT_TYPES,
  ATTESTED_CERTAINTIES,
  type EventRow,
  type PlaceRow,
  type SourceRow,
  type EventRecord,
  type PlaceRecord,
  type SourceRecord,
  type DailyRecord,
  type DailyBasis,
  type EventType,
  type Certainty,
} from "./types.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(HERE, "..", "data");
const OUT_DIR = resolve(HERE, "..", "public", "data");

const COVERAGE_START = "1940-06-10";
const COVERAGE_END = "1945-12-31";

const CERTAINTY_RANK: Record<Certainty, number> = {
  attested_precise: 0,
  attested_range: 1,
  inferred_from_event: 2,
  base_inferred: 3,
  uncertain: 4,
};

function nullable(value: string): string | null {
  return value.trim() === "" ? null : value.trim();
}

function normalizeEvents(rows: EventRow[]): EventRecord[] {
  return rows
    .map((e) => ({
      id: e.id,
      date_start: e.date_start,
      date_end: nullable(e.date_end),
      title: e.title,
      summary: e.summary,
      place_id: e.place_id,
      lat: Number(e.lat),
      lng: Number(e.lng),
      country_1940: e.country_1940,
      country_current: e.country_current,
      event_type: e.event_type as EventType,
      certainty: e.certainty as Certainty,
      source_id: e.source_id,
      source_url: nullable(e.source_url),
      source_quote: e.source_quote,
      notes: e.notes,
      tags: e.tags
        .split(";")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    }))
    .sort(
      (a, b) =>
        compareIso(a.date_start, b.date_start) || a.id.localeCompare(b.id),
    );
}

function normalizePlaces(rows: PlaceRow[]): PlaceRecord[] {
  return rows
    .map((p) => ({
      place_id: p.place_id,
      name: p.name,
      name_1940: nullable(p.name_1940),
      lat: Number(p.lat),
      lng: Number(p.lng),
      country_current: p.country_current,
      country_1940: p.country_1940,
      description: p.description,
      wikidata_id: nullable(p.wikidata_id),
      geonames_id: nullable(p.geonames_id),
    }))
    .sort((a, b) => a.place_id.localeCompare(b.place_id));
}

function normalizeSources(rows: SourceRow[]): SourceRecord[] {
  return rows
    .map((s) => ({
      source_id: s.source_id,
      title: s.title,
      author: nullable(s.author),
      publisher: nullable(s.publisher),
      date: nullable(s.date),
      url: nullable(s.url),
      source_type: s.source_type,
      reliability: s.reliability,
      notes: s.notes,
    }))
    .sort((a, b) => a.source_id.localeCompare(b.source_id));
}

/** Renvoie le numéro de jour de fin d'un événement (date_end ou date_start). */
function eventEndDay(e: EventRecord): number {
  return dayNumber(e.date_end ?? e.date_start);
}

/**
 * Dérive la couche quotidienne. Priorité : événement attesté du jour > période
 * de base active > source_gap.
 */
function deriveDaily(
  events: EventRecord[],
  places: Map<string, PlaceRecord>,
): DailyRecord[] {
  const start = dayNumber(COVERAGE_START);
  const end = dayNumber(COVERAGE_END);

  const bases = events.filter((e) =>
    BASE_EVENT_TYPES.includes(e.event_type) && e.date_end,
  );
  const attested = events.filter((e) =>
    ATTESTED_CERTAINTIES.includes(e.certainty),
  );

  const daily: DailyRecord[] = [];

  for (let day = start; day <= end; day++) {
    const date = isoFromDayNumber(day);

    const activeAll = events.filter(
      (e) => dayNumber(e.date_start) <= day && eventEndDay(e) >= day,
    );
    const eventIds = activeAll.map((e) => e.id);

    // 1. Événement attesté localisant De Gaulle ce jour-là.
    const activeAttested = attested
      .filter((e) => dayNumber(e.date_start) <= day && eventEndDay(e) >= day)
      .sort((a, b) => {
        const rank = CERTAINTY_RANK[a.certainty] - CERTAINTY_RANK[b.certainty];
        if (rank !== 0) return rank;
        // À certitude égale, préférer l'événement le plus court (plus précis).
        const spanA = eventEndDay(a) - dayNumber(a.date_start);
        const spanB = eventEndDay(b) - dayNumber(b.date_start);
        return spanA - spanB;
      });

    if (activeAttested.length > 0) {
      const chosen = activeAttested[0]!;
      const place = places.get(chosen.place_id);
      daily.push({
        date,
        place_id: chosen.place_id,
        lat: place?.lat ?? chosen.lat,
        lng: place?.lng ?? chosen.lng,
        basis: "attested",
        certainty: chosen.certainty,
        event_ids: eventIds,
        base_event_id: null,
        label: place?.name ?? chosen.title,
      });
      continue;
    }

    // 2. Période de base active (présence présumée).
    const activeBase = bases
      .filter((e) => dayNumber(e.date_start) <= day && eventEndDay(e) >= day)
      .sort(
        (a, b) =>
          eventEndDay(a) -
          dayNumber(a.date_start) -
          (eventEndDay(b) - dayNumber(b.date_start)),
      );

    if (activeBase.length > 0) {
      const base = activeBase[0]!;
      const place = places.get(base.place_id);
      daily.push({
        date,
        place_id: base.place_id,
        lat: place?.lat ?? base.lat,
        lng: place?.lng ?? base.lng,
        basis: "base_inferred",
        certainty: "base_inferred",
        event_ids: eventIds,
        base_event_id: base.id,
        label: place?.name ?? base.title,
      });
      continue;
    }

    // 3. Aucune information : lacune de source.
    daily.push({
      date,
      place_id: null,
      lat: null,
      lng: null,
      basis: "source_gap",
      certainty: null,
      event_ids: eventIds,
      base_event_id: null,
      label: null,
    });
  }

  return daily;
}

function countBy<T extends string>(items: T[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const it of items) out[it] = (out[it] ?? 0) + 1;
  return out;
}

function writeJson(name: string, data: unknown): void {
  writeFileSync(resolve(OUT_DIR, name), JSON.stringify(data, null, 2) + "\n");
  console.log(`  -> public/data/${name}`);
}

function main(): void {
  const sources = normalizeSources(
    readCsvObjects<SourceRow>(resolve(DATA_DIR, "sources.csv")),
  );
  const places = normalizePlaces(
    readCsvObjects<PlaceRow>(resolve(DATA_DIR, "places.csv")),
  );
  const events = normalizeEvents(
    readCsvObjects<EventRow>(resolve(DATA_DIR, "events.csv")),
  );

  // Garde-fou minimal : les dates doivent être valides pour dériver les jours.
  for (const e of events) {
    if (!isValidIsoDate(e.date_start)) {
      console.error(
        `build interrompu : date_start invalide pour "${e.id}". Lancez d'abord npm run validate:data.`,
      );
      process.exit(1);
    }
  }

  const placesById = new Map(places.map((p) => [p.place_id, p]));
  const daily = deriveDaily(events, placesById);

  const basisCounts = countBy(daily.map((d) => d.basis as DailyBasis));
  const manifest = {
    generated_at: new Date().toISOString(),
    coverage: { start: COVERAGE_START, end: COVERAGE_END, days: daily.length },
    counts: {
      events: events.length,
      places: places.length,
      sources: sources.length,
    },
    events_by_type: countBy(events.map((e) => e.event_type)),
    events_by_certainty: countBy(events.map((e) => e.certainty)),
    daily_by_basis: basisCounts,
    date_range: {
      first_event: events[0]?.date_start ?? null,
      last_event: events[events.length - 1]?.date_start ?? null,
    },
  };

  mkdirSync(OUT_DIR, { recursive: true });
  console.log("Écriture des JSON :");
  writeJson("events.json", events);
  writeJson("places.json", places);
  writeJson("sources.json", sources);
  writeJson("daily.json", daily);
  writeJson("manifest.json", manifest);

  console.log(
    `\nCouverture quotidienne : ${daily.length} jours — ` +
      `attested ${basisCounts.attested ?? 0}, ` +
      `base_inferred ${basisCounts.base_inferred ?? 0}, ` +
      `source_gap ${basisCounts.source_gap ?? 0}.`,
  );
  console.log("Build terminé.");
}

main();
