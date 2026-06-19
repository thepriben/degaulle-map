import { useState } from "react";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "../lib/labels";
import type { EventType } from "../lib/types";

export function Legend({ usedTypes }: { usedTypes: Set<EventType> }) {
  const [open, setOpen] = useState(false);
  const types = (Object.keys(EVENT_TYPE_LABELS) as EventType[]).filter((t) =>
    usedTypes.has(t),
  );

  return (
    <div className="rounded-xl border border-stone-200 bg-white/95 p-3 text-sm shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between font-semibold text-stone-700"
      >
        <span>Légende</span>
        <span className="text-stone-400">{open ? "–" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">
              Type d'événement
            </p>
            <ul className="grid grid-cols-1 gap-1">
              {types.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: EVENT_TYPE_COLORS[t] }}
                  />
                  <span className="text-stone-600">{EVENT_TYPE_LABELS[t]}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
