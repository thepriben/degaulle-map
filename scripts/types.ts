/**
 * Types stricts partagés par le pipeline de données.
 * Source de vérité du schéma décrit dans le plan et le README.
 */

export const EVENT_TYPES = [
  "military_assignment",
  "battle_or_operation",
  "speech",
  "radio_broadcast",
  "political_meeting",
  "diplomatic_visit",
  "government_base",
  "travel",
  "ceremony",
  "return_to_france",
  "liberation_event",
  "source_gap",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const CERTAINTY_LEVELS = [
  "attested_precise",
  "attested_range",
  "base_inferred",
  "inferred_from_event",
  "uncertain",
] as const;
export type Certainty = (typeof CERTAINTY_LEVELS)[number];

/** Types d'événements considérés comme une « période de base » pour la couche quotidienne. */
export const BASE_EVENT_TYPES: readonly EventType[] = [
  "government_base",
  "military_assignment",
];

/** Niveaux de certitude considérés comme « attestés » (priorité sur la base inférée). */
export const ATTESTED_CERTAINTIES: readonly Certainty[] = [
  "attested_precise",
  "attested_range",
  "inferred_from_event",
];

/** Une ligne brute d'`events.csv` (toutes les valeurs sont des chaînes). */
export interface EventRow {
  id: string;
  date_start: string;
  date_end: string;
  title: string;
  summary: string;
  place_id: string;
  lat: string;
  lng: string;
  country_1940: string;
  country_current: string;
  event_type: string;
  certainty: string;
  source_id: string;
  source_url: string;
  source_quote: string;
  notes: string;
  tags: string;
}

/** Un événement normalisé, tel qu'exporté dans `events.json`. */
export interface EventRecord {
  id: string;
  date_start: string;
  date_end: string | null;
  title: string;
  summary: string;
  place_id: string;
  lat: number;
  lng: number;
  country_1940: string;
  country_current: string;
  event_type: EventType;
  certainty: Certainty;
  source_id: string;
  source_url: string | null;
  source_quote: string;
  notes: string;
  tags: string[];
}

export interface PlaceRow {
  place_id: string;
  name: string;
  name_1940: string;
  lat: string;
  lng: string;
  country_current: string;
  country_1940: string;
  description: string;
  wikidata_id: string;
  geonames_id: string;
}

export interface PlaceRecord {
  place_id: string;
  name: string;
  name_1940: string | null;
  lat: number;
  lng: number;
  country_current: string;
  country_1940: string;
  description: string;
  wikidata_id: string | null;
  geonames_id: string | null;
}

export const RELIABILITY_LEVELS = ["high", "medium", "low"] as const;
export type Reliability = (typeof RELIABILITY_LEVELS)[number];

export interface SourceRow {
  source_id: string;
  title: string;
  author: string;
  publisher: string;
  date: string;
  url: string;
  source_type: string;
  reliability: string;
  notes: string;
}

export interface SourceRecord {
  source_id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  date: string | null;
  url: string | null;
  source_type: string;
  reliability: string;
  notes: string;
}

/** Une journée de la couche quotidienne dérivée (`daily.json`). */
export type DailyBasis = "attested" | "base_inferred" | "source_gap";

export interface DailyRecord {
  date: string;
  place_id: string | null;
  lat: number | null;
  lng: number | null;
  basis: DailyBasis;
  certainty: Certainty | null;
  event_ids: string[];
  base_event_id: string | null;
  label: string | null;
}
