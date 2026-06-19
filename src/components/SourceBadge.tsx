import type { SourceRecord } from "../lib/types";

const RELIABILITY_STYLE: Record<string, string> = {
  high: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const RELIABILITY_LABEL: Record<string, string> = {
  high: "fiabilité élevée",
  medium: "fiabilité moyenne",
  low: "à recouper",
};

export function SourceBadge({
  source,
  url,
}: {
  source: SourceRecord | undefined;
  url: string | null;
}) {
  if (!source) return null;
  const href = url ?? source.url;
  const style =
    RELIABILITY_STYLE[source.reliability] ??
    "bg-slate-100 text-slate-600 ring-slate-500/20";

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50/70 p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          Source
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${style}`}
        >
          {RELIABILITY_LABEL[source.reliability] ?? source.reliability}
        </span>
      </div>
      <p className="text-sm font-medium text-stone-800">{source.title}</p>
      {(source.author || source.publisher) && (
        <p className="text-xs text-stone-500">
          {[source.author, source.publisher].filter(Boolean).join(" · ")}
        </p>
      )}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm font-medium text-teal-700 underline decoration-teal-700/30 underline-offset-2 hover:decoration-teal-700"
        >
          Consulter la source ↗
        </a>
      )}
    </div>
  );
}
