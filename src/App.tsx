import { useEffect, useMemo, useRef, useState } from "react";
import { loadDataset } from "./lib/data";
import type { Dataset, EventRecord, EventType } from "./lib/types";
import { DateScrubber } from "./components/DateScrubber";
import { Filters, type FilterState } from "./components/Filters";
import { EventList } from "./components/EventList";
import { EventPanel } from "./components/EventPanel";
import { MapView } from "./components/MapView";
import { Legend } from "./components/Legend";

const REPO_URL = "https://github.com/thepriben/degaulle-map";

export default function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    activeTypes: new Set(),
    hideUncertain: false,
  });
  const [focus, setFocus] = useState<[number, number] | null>(null);
  const focusTrigger = useRef(0);

  useEffect(() => {
    loadDataset()
      .then((d) => {
        setDataset(d);
        const allTypes = new Set(d.events.map((e) => e.event_type));
        setFilters({ activeTypes: allTypes, hideUncertain: false });
        const start = d.daily.findIndex((x) => x.date === "1940-06-18");
        setDayIndex(start >= 0 ? start : 0);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const availableTypes = useMemo<EventType[]>(() => {
    if (!dataset) return [];
    const order: EventType[] = [
      "radio_broadcast",
      "speech",
      "political_meeting",
      "diplomatic_visit",
      "ceremony",
      "battle_or_operation",
      "return_to_france",
      "government_base",
      "travel",
      "military_assignment",
      "liberation_event",
      "source_gap",
    ];
    const present = new Set(dataset.events.map((e) => e.event_type));
    return order.filter((t) => present.has(t));
  }, [dataset]);

  const filteredEvents = useMemo(() => {
    if (!dataset) return [];
    return dataset.events
      .filter((e) => filters.activeTypes.has(e.event_type))
      .filter((e) => !(filters.hideUncertain && e.certainty === "uncertain"))
      .slice()
      .sort((a, b) => a.date_start.localeCompare(b.date_start));
  }, [dataset, filters]);

  function recenter(lat: number, lng: number) {
    focusTrigger.current += 1;
    setFocus([lat, lng]);
  }

  function selectEvent(e: EventRecord) {
    setSelectedId(e.id);
    if (dataset) {
      const i = dataset.daily.findIndex((d) => d.date === e.date_start);
      if (i >= 0) setDayIndex(i);
    }
    recenter(e.lat, e.lng);
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <p className="max-w-md text-sm text-rose-700">
          Erreur de chargement des données : {error}
        </p>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="animate-pulse text-sm text-stone-400">
          Chargement des données…
        </p>
      </div>
    );
  }

  const selectedEvent = selectedId
    ? (dataset.eventsById.get(selectedId) ?? null)
    : null;
  const currentDaily = dataset.daily[dayIndex] ?? null;

  return (
    <div className="flex h-screen flex-col bg-stone-100">
      <header className="z-10 shrink-0 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-lg leading-tight text-stone-900 sm:text-xl">
              Charles de Gaulle, 1940-1945
            </h1>
            <p className="text-xs text-stone-500">
              Où était-il jour après jour&nbsp;?
            </p>
          </div>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 sm:inline-block"
          >
            Code & données ↗
          </a>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <aside className="thin-scroll order-2 flex w-full shrink-0 flex-col gap-3 overflow-y-auto bg-stone-50 p-3 lg:order-1 lg:w-[22rem] lg:border-r lg:border-stone-200">
          <DateScrubber
            daily={dataset.daily}
            index={dayIndex}
            onIndex={setDayIndex}
          />
          <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
            <Filters
              availableTypes={availableTypes}
              state={filters}
              onChange={setFilters}
            />
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Événements
              </h2>
              <span className="text-xs text-stone-400">
                {filteredEvents.length}
              </span>
            </div>
            <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={filters.hideUncertain}
                onChange={(e) =>
                  setFilters({ ...filters, hideUncertain: e.target.checked })
                }
                className="h-4 w-4 rounded border-stone-300 text-teal-700 focus:ring-teal-600"
              />
              Masquer les entrées incertaines
            </label>
            <EventList
              events={filteredEvents}
              selectedId={selectedId}
              onSelect={selectEvent}
            />
          </div>
        </aside>

        <section className="relative order-1 min-h-[45vh] flex-1 lg:order-2 lg:min-h-0">
          <MapView
            events={filteredEvents}
            selectedId={selectedId}
            onSelect={selectEvent}
            daily={currentDaily}
            focus={focus}
            focusTrigger={focusTrigger.current}
            panelOpen={!!selectedEvent}
          />
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex items-end justify-between gap-3">
            <div className="pointer-events-auto max-w-[15rem]">
              <Legend usedTypes={new Set(availableTypes)} />
            </div>
            {currentDaily?.lat != null && currentDaily?.lng != null && (
              <button
                type="button"
                onClick={() => recenter(currentDaily.lat!, currentDaily.lng!)}
                className="pointer-events-auto rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-xs font-medium text-stone-600 shadow-sm backdrop-blur hover:bg-white"
              >
                Recentrer sur le jour
              </button>
            )}
          </div>
        </section>

        {selectedEvent && (
          <aside className="order-3 flex max-h-[50vh] w-full shrink-0 flex-col overflow-hidden border-t border-stone-200 bg-white lg:max-h-none lg:w-80 lg:border-l lg:border-t-0">
            <EventPanel
              event={selectedEvent}
              dataset={dataset}
              onClose={() => setSelectedId(null)}
            />
          </aside>
        )}
      </main>

      <footer className="shrink-0 border-t border-stone-200 bg-white px-4 py-2 text-[11px] text-stone-400 sm:px-6">
        {dataset.manifest.counts.events} événements ·{" "}
        {dataset.manifest.counts.sources} sources · couverture{" "}
        {dataset.manifest.coverage.days} jours (
        {dataset.manifest.daily_by_basis.attested ?? 0} attestés,{" "}
        {dataset.manifest.daily_by_basis.base_inferred ?? 0} base inférée,{" "}
        {dataset.manifest.daily_by_basis.source_gap ?? 0} lacunes).
      </footer>
    </div>
  );
}
