import {
  CERTAINTY_LABELS,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  formatDateRange,
} from "../lib/labels";
import type { Dataset, EventRecord } from "../lib/types";
import { SourceBadge } from "./SourceBadge";

const CERTAINTY_BADGE: Record<string, string> = {
  attested_precise: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  attested_range: "bg-teal-50 text-teal-700 ring-teal-600/20",
  inferred_from_event: "bg-sky-50 text-sky-700 ring-sky-600/20",
  base_inferred: "bg-amber-50 text-amber-700 ring-amber-600/20",
  uncertain: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

export function EventPanel({
  event,
  dataset,
  onClose,
}: {
  event: EventRecord | null;
  dataset: Dataset;
  onClose: () => void;
}) {
  if (!event) return null;

  const place = dataset.placesById.get(event.place_id);
  const source = dataset.sourcesById.get(event.source_id);
  const placeName = place?.name ?? event.place_id;
  const historicalName =
    place?.name_1940 && place.name_1940 !== place.name
      ? ` (${place.name_1940} en 1940)`
      : "";

  return (
    <div className="relative flex h-full flex-col">
      <div
        className="h-1.5 w-full shrink-0"
        style={{ backgroundColor: EVENT_TYPE_COLORS[event.event_type] }}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer la fiche"
        className="absolute right-3 top-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-stone-500 shadow-sm ring-1 ring-stone-200 backdrop-blur hover:text-stone-800"
      >
        ✕
      </button>
      <div className="thin-scroll flex-1 overflow-y-auto p-5 pr-12">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
            {EVENT_TYPE_LABELS[event.event_type]}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
              CERTAINTY_BADGE[event.certainty] ?? "bg-stone-100 text-stone-600"
            }`}
          >
            {CERTAINTY_LABELS[event.certainty]}
          </span>
        </div>

        <h2 className="font-serif text-2xl leading-tight text-stone-900">
          {event.title}
        </h2>
        <p className="mt-1 text-sm font-medium text-stone-500">
          {formatDateRange(event.date_start, event.date_end)}
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Lieu
            </dt>
            <dd className="text-stone-700">
              {placeName}
              {historicalName}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Pays
            </dt>
            <dd className="text-stone-700">
              {event.country_1940}
              {event.country_current !== event.country_1940 && (
                <span className="text-stone-400">
                  {" "}
                  · aujourd'hui {event.country_current}
                </span>
              )}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-relaxed text-stone-700">
          {event.summary}
        </p>

        {event.source_quote && (
          <blockquote className="mt-4 border-l-2 border-stone-300 pl-3 text-sm italic text-stone-600">
            « {event.source_quote} »
          </blockquote>
        )}

        <div className="mt-4">
          <SourceBadge source={source} url={event.source_url} />
        </div>

        {event.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
