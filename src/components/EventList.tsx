import {
  CERTAINTY_SHORT,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  formatDateRange,
} from "../lib/labels";
import type { EventRecord } from "../lib/types";

export function EventList({
  events,
  selectedId,
  onSelect,
}: {
  events: EventRecord[];
  selectedId: string | null;
  onSelect: (e: EventRecord) => void;
}) {
  if (events.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-stone-400">
        Aucun événement ne correspond aux filtres.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {events.map((e) => {
        const selected = e.id === selectedId;
        return (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onSelect(e)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                selected
                  ? "border-teal-600/40 bg-teal-50/60 ring-1 ring-teal-600/20"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: EVENT_TYPE_COLORS[e.event_type] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800">
                    {e.title}
                  </p>
                  <p className="text-xs text-stone-500">
                    {formatDateRange(e.date_start, e.date_end)}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wide text-stone-400">
                    {EVENT_TYPE_LABELS[e.event_type]} ·{" "}
                    {CERTAINTY_SHORT[e.certainty]}
                  </p>
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
