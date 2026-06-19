// Types miroir des JSON produits par le pipeline (public/data/*.json).

export type EventType =
  | "military_assignment"
  | "battle_or_operation"
  | "speech"
  | "radio_broadcast"
  | "political_meeting"
  | "diplomatic_visit"
  | "government_base"
  | "travel"
  | "ceremony"
  | "return_to_france"
  | "liberation_event"
  | "source_gap";

export type Certainty =
  | "attested_precise"
  | "attested_range"
  | "base_inferred"
  | "inferred_from_event"
  | "uncertain";

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

export interface SourceRecord {
  source_id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  date: string | null;
  url: string | null;
  source_type: string;
  reliability: "high" | "medium" | "low" | string;
  notes: string;
}

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

export interface Manifest {
  generated_at: string;
  coverage: { start: string; end: string; days: number };
  counts: { events: number; places: number; sources: number };
  events_by_type: Record<string, number>;
  events_by_certainty: Record<string, number>;
  daily_by_basis: Record<string, number>;
  date_range: { first_event: string | null; last_event: string | null };
}

export interface Dataset {
  events: EventRecord[];
  places: PlaceRecord[];
  sources: SourceRecord[];
  daily: DailyRecord[];
  manifest: Manifest;
  eventsById: Map<string, EventRecord>;
  placesById: Map<string, PlaceRecord>;
  sourcesById: Map<string, SourceRecord>;
}
