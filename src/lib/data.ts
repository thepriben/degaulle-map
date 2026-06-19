import type {
  Dataset,
  DailyRecord,
  EventRecord,
  Manifest,
  PlaceRecord,
  SourceRecord,
} from "./types";

// `BASE_URL` est injecté par Vite ("/degaulle-map/" en production).
const base = import.meta.env.BASE_URL;

async function getJson<T>(name: string): Promise<T> {
  const res = await fetch(`${base}data/${name}`);
  if (!res.ok) throw new Error(`Échec du chargement de ${name} (${res.status})`);
  return (await res.json()) as T;
}

export async function loadDataset(): Promise<Dataset> {
  const [events, places, sources, daily, manifest] = await Promise.all([
    getJson<EventRecord[]>("events.json"),
    getJson<PlaceRecord[]>("places.json"),
    getJson<SourceRecord[]>("sources.json"),
    getJson<DailyRecord[]>("daily.json"),
    getJson<Manifest>("manifest.json"),
  ]);

  return {
    events,
    places,
    sources,
    daily,
    manifest,
    eventsById: new Map(events.map((e) => [e.id, e])),
    placesById: new Map(places.map((p) => [p.place_id, p])),
    sourcesById: new Map(sources.map((s) => [s.source_id, s])),
  };
}

/** Numéro de jour (UTC) depuis l'epoch pour une date ISO. */
export function dayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y!, m! - 1, d!) / 86_400_000);
}

/** Vrai si l'événement est actif (couvre) la date donnée. */
export function isEventActiveOn(e: EventRecord, iso: string): boolean {
  const day = dayNumber(iso);
  const start = dayNumber(e.date_start);
  const end = dayNumber(e.date_end ?? e.date_start);
  return start <= day && day <= end;
}
