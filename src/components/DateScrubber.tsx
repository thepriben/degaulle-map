import { BASIS_COLORS, BASIS_LABELS, formatFrenchDate } from "../lib/labels";
import type { DailyRecord } from "../lib/types";

export function DateScrubber({
  daily,
  index,
  onIndex,
}: {
  daily: DailyRecord[];
  index: number;
  onIndex: (i: number) => void;
}) {
  const current = daily[index];
  if (!current) return null;

  const basisColor = BASIS_COLORS[current.basis];

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            Où était-il le
          </p>
          <p className="font-serif text-xl text-stone-900">
            {formatFrenchDate(current.date)}
          </p>
        </div>
        <div className="text-right">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: `${basisColor}1a`, color: basisColor }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: basisColor }}
            />
            {BASIS_LABELS[current.basis]}
          </span>
          <p className="mt-1 text-sm font-medium text-stone-700">
            {current.label ?? "Localisation non documentée"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Jour précédent"
          onClick={() => onIndex(Math.max(0, index - 1))}
          className="rounded-md border border-stone-200 px-2 py-1 text-sm text-stone-600 hover:bg-stone-50"
        >
          ‹
        </button>
        <input
          type="range"
          min={0}
          max={daily.length - 1}
          value={index}
          onChange={(e) => onIndex(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-stone-200 accent-teal-700"
          aria-label="Curseur de date"
        />
        <button
          type="button"
          aria-label="Jour suivant"
          onClick={() => onIndex(Math.min(daily.length - 1, index + 1))}
          className="rounded-md border border-stone-200 px-2 py-1 text-sm text-stone-600 hover:bg-stone-50"
        >
          ›
        </button>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-stone-400">
        <span>{formatFrenchDate(daily[0]!.date)}</span>
        <span>{formatFrenchDate(daily[daily.length - 1]!.date)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-stone-100 pt-2.5 text-[11px] text-stone-500">
        {(["attested", "base_inferred", "source_gap"] as const).map((b) => (
          <span key={b} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: BASIS_COLORS[b] }}
            />
            {BASIS_LABELS[b]}
          </span>
        ))}
      </div>
    </div>
  );
}
