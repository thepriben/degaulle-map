import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "../lib/labels";
import type { EventType } from "../lib/types";

export interface FilterState {
  activeTypes: Set<EventType>;
  hideUncertain: boolean;
}

export function Filters({
  availableTypes,
  state,
  onChange,
}: {
  availableTypes: EventType[];
  state: FilterState;
  onChange: (next: FilterState) => void;
}) {
  function toggleType(t: EventType) {
    const next = new Set(state.activeTypes);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    onChange({ ...state, activeTypes: next });
  }

  const allOn = availableTypes.every((t) => state.activeTypes.has(t));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          Filtres
        </h2>
        <button
          type="button"
          onClick={() =>
            onChange({
              ...state,
              activeTypes: allOn ? new Set() : new Set(availableTypes),
            })
          }
          className="text-xs font-medium text-teal-700 hover:underline"
        >
          {allOn ? "Tout masquer" : "Tout afficher"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {availableTypes.map((t) => {
          const active = state.activeTypes.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                active
                  ? "border-stone-300 bg-white text-stone-700 shadow-sm"
                  : "border-stone-200 bg-stone-100 text-stone-400"
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: EVENT_TYPE_COLORS[t],
                  opacity: active ? 1 : 0.35,
                }}
              />
              {EVENT_TYPE_LABELS[t]}
            </button>
          );
        })}
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
        <input
          type="checkbox"
          checked={state.hideUncertain}
          onChange={(e) =>
            onChange({ ...state, hideUncertain: e.target.checked })
          }
          className="h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600"
        />
        Masquer les entrées incertaines
      </label>
    </div>
  );
}
