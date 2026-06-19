import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import {
  CERTAINTY_OPACITY,
  EVENT_TYPE_COLORS,
  formatDateRange,
} from "../lib/labels";
import type { DailyRecord, EventRecord } from "../lib/types";

const RADIUS: Record<string, number> = {
  attested_precise: 7,
  attested_range: 6,
  inferred_from_event: 5,
  base_inferred: 5,
  uncertain: 4,
};

function Recenter({
  focus,
  trigger,
}: {
  focus: [number, number] | null;
  trigger: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo(focus, Math.max(map.getZoom(), 4), { duration: 0.6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

export function MapView({
  events,
  selectedId,
  onSelect,
  daily,
  focus,
  focusTrigger,
}: {
  events: EventRecord[];
  selectedId: string | null;
  onSelect: (e: EventRecord) => void;
  daily: DailyRecord | null;
  focus: [number, number] | null;
  focusTrigger: number;
}) {
  const hasDaily =
    daily && daily.basis !== "source_gap" && daily.lat != null && daily.lng != null;

  return (
    <MapContainer
      center={[38, 8]}
      zoom={3}
      minZoom={2}
      worldCopyJump
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemap.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {hasDaily && (
        <CircleMarker
          center={[daily!.lat!, daily!.lng!]}
          radius={13}
          pathOptions={{
            color: "#0f766e",
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0,
            dashArray: "3 4",
          }}
        />
      )}

      {events.map((e) => {
        const selected = e.id === selectedId;
        return (
          <CircleMarker
            key={e.id}
            center={[e.lat, e.lng]}
            radius={(RADIUS[e.certainty] ?? 5) + (selected ? 3 : 0)}
            pathOptions={{
              color: selected ? "#0c0a09" : "#ffffff",
              weight: selected ? 2 : 1,
              fillColor: EVENT_TYPE_COLORS[e.event_type],
              fillOpacity: CERTAINTY_OPACITY[e.certainty],
            }}
            eventHandlers={{ click: () => onSelect(e) }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              <span className="font-medium">{e.title}</span>
              <br />
              <span className="text-stone-500">
                {formatDateRange(e.date_start, e.date_end)}
              </span>
            </Tooltip>
          </CircleMarker>
        );
      })}

      <Recenter focus={focus} trigger={focusTrigger} />
    </MapContainer>
  );
}
