import type { Certainty, DailyBasis, EventType } from "./types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  military_assignment: "Affectation militaire",
  battle_or_operation: "Bataille / opération",
  speech: "Discours",
  radio_broadcast: "Allocution radiodiffusée",
  political_meeting: "Réunion politique",
  diplomatic_visit: "Visite diplomatique",
  government_base: "Base / résidence",
  travel: "Déplacement",
  ceremony: "Cérémonie",
  return_to_france: "Retour en France",
  liberation_event: "Libération",
  source_gap: "Lacune de source",
};

export const CERTAINTY_LABELS: Record<Certainty, string> = {
  attested_precise: "Attesté (date et lieu précis)",
  attested_range: "Attesté (plage de dates)",
  base_inferred: "Base inférée",
  inferred_from_event: "Inféré d'un événement",
  uncertain: "Incertain",
};

export const CERTAINTY_SHORT: Record<Certainty, string> = {
  attested_precise: "Attesté",
  attested_range: "Attesté (période)",
  base_inferred: "Base inférée",
  inferred_from_event: "Inféré",
  uncertain: "À vérifier",
};

export const BASIS_LABELS: Record<DailyBasis, string> = {
  attested: "Présence attestée",
  base_inferred: "Base présumée",
  source_gap: "Lacune de source",
};

// Couleurs par type d'événement (palette sobre et lisible).
export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  military_assignment: "#6d28d9",
  battle_or_operation: "#b91c1c",
  speech: "#b45309",
  radio_broadcast: "#a16207",
  political_meeting: "#1d4ed8",
  diplomatic_visit: "#0369a1",
  government_base: "#0f766e",
  travel: "#4b5563",
  ceremony: "#9d174d",
  return_to_france: "#15803d",
  liberation_event: "#15803d",
  source_gap: "#94a3b8",
};

export const BASIS_COLORS: Record<DailyBasis, string> = {
  attested: "#0f766e",
  base_inferred: "#b45309",
  source_gap: "#94a3b8",
};

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

/** Formate une date ISO `YYYY-MM-DD` en français lisible. */
export function formatFrenchDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const day = d === 1 ? "1er" : String(d);
  return `${day} ${MONTHS[m - 1]} ${y}`;
}

/** Formate la plage de dates d'un événement. */
export function formatDateRange(start: string, end: string | null): string {
  if (!end || end === start) return formatFrenchDate(start);
  return `${formatFrenchDate(start)} – ${formatFrenchDate(end)}`;
}
