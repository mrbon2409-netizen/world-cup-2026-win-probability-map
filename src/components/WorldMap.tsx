import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, {
  AttributionControl,
  type GeoJSONSource,
  type Map,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { formatAmericanOdds, formatPercent } from "../lib/probability";
import {
  createWorldCupBasemapStyle,
  WORLD_CUP_DEFAULT_VIEW,
  WORLD_CUP_MAP_ATTRIBUTION,
  WORLD_CUP_MAP_OPTIONS,
} from "../map/mapConfig";
import { buildWorldCupMapSources, type ParticipantFeatureProperties } from "../map/mapDataHelpers";
import { HOVER_COUNTRY_STYLE, SELECTED_COUNTRY_STYLE } from "../map/selectedCountryStyle";
import type { MetricMode, TeamSnapshot } from "../types/worldCup";

interface WorldMapProps {
  teams: TeamSnapshot[];
  mode: MetricMode;
  snapshotDate: string;
  selectedTeamIso: string | null;
  onSelectTeam: (iso3: string | null) => void;
}

interface TooltipState {
  team: TeamSnapshot;
  x: number;
  y: number;
}

const COUNTRY_SOURCE_ID = "world-countries";
const MARKER_SOURCE_ID = "participant-markers";
const COUNTRY_FILL_LAYER_ID = "participant-country-fill";
const COUNTRY_LINE_LAYER_ID = "country-boundaries";
const PARTICIPANT_OUTLINE_LAYER_ID = "participant-country-outline";
const SELECTED_GLOW_LAYER_ID = "selected-country-glow";
const SELECTED_LINE_LAYER_ID = "selected-country-line";
const HOVER_LINE_LAYER_ID = "hover-country-line";
const MARKER_HIT_LAYER_ID = "participant-marker-hit";
const MARKER_HALO_LAYER_ID = "participant-marker-halo";
const MARKER_LAYER_ID = "participant-marker";
const MARKER_LABEL_LAYER_ID = "participant-marker-label";
const MARKER_SELECTED_LAYER_ID = "participant-marker-selected";

function isParticipantFeature(feature?: MapGeoJSONFeature | null): feature is MapGeoJSONFeature {
  return Boolean(feature?.properties?.isParticipant);
}

function findTeamByIso(teams: TeamSnapshot[], iso3: string | null): TeamSnapshot | null {
  if (!iso3) {
    return null;
  }

  return teams.find((team) => team.iso3 === iso3) ?? null;
}

function updateSelectionFilters(map: Map, selectedIso3: string | null, hoveredIso3: string | null) {
  const selectedFilter = ["==", ["get", "iso3"], selectedIso3 ?? ""] as any;
  const hoveredFilter = ["==", ["get", "iso3"], hoveredIso3 ?? ""] as any;

  if (map.getLayer(SELECTED_GLOW_LAYER_ID)) {
    map.setFilter(SELECTED_GLOW_LAYER_ID, selectedFilter);
  }
  if (map.getLayer(SELECTED_LINE_LAYER_ID)) {
    map.setFilter(SELECTED_LINE_LAYER_ID, selectedFilter);
  }
  if (map.getLayer(MARKER_SELECTED_LAYER_ID)) {
    map.setFilter(MARKER_SELECTED_LAYER_ID, selectedFilter);
  }
  if (map.getLayer(HOVER_LINE_LAYER_ID)) {
    map.setFilter(HOVER_LINE_LAYER_ID, hoveredFilter);
  }
}

function createMapInstance(container: HTMLDivElement): Map {
  const baseStyle = createWorldCupBasemapStyle() as StyleSpecification;
  const attempts = [
    {
      attributionControl: false as const,
      center: WORLD_CUP_DEFAULT_VIEW.center,
      container,
      dragRotate: false,
      maxZoom: WORLD_CUP_MAP_OPTIONS.maxZoom ?? 6,
      minZoom: WORLD_CUP_MAP_OPTIONS.minZoom ?? 1,
      style: baseStyle,
      zoom: WORLD_CUP_DEFAULT_VIEW.zoom,
    },
    {
      attributionControl: false as const,
      center: [0, 20] as [number, number],
      container,
      dragRotate: false,
      maxZoom: 6,
      minZoom: 1,
      style: baseStyle,
      zoom: 1.1,
    },
  ];

  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      const map = new maplibregl.Map(attempt);
      if (WORLD_CUP_MAP_OPTIONS.boxZoom === false) {
        map.boxZoom.disable();
      }
      map.doubleClickZoom.disable();
      return map;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unknown map initialization error.");
}

function addWorldCupLayers(map: Map) {
  // Map initialization: add local GeoJSON sources so only our own country data drives
  // interaction, styling, and attribution-safe geometry.
  if (!map.getSource(COUNTRY_SOURCE_ID)) {
    map.addSource(COUNTRY_SOURCE_ID, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
  }

  if (!map.getSource(MARKER_SOURCE_ID)) {
    map.addSource(MARKER_SOURCE_ID, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
  }

  // Basemap land styling: every country is present, but non-participants stay dark and quiet.
  if (!map.getLayer(COUNTRY_FILL_LAYER_ID)) {
    map.addLayer({
      id: COUNTRY_FILL_LAYER_ID,
      type: "fill",
      source: COUNTRY_SOURCE_ID,
      paint: {
        "fill-color": ["coalesce", ["get", "fillColor"], "#162232"],
        "fill-opacity": [
          "case",
          ["boolean", ["get", "isParticipant"], false],
          0.86,
          0.42,
        ],
      },
    });
  }

  if (!map.getLayer(COUNTRY_LINE_LAYER_ID)) {
    map.addLayer({
      id: COUNTRY_LINE_LAYER_ID,
      type: "line",
      source: COUNTRY_SOURCE_ID,
      paint: {
        "line-color": "rgba(220, 231, 245, 0.22)",
        "line-width": 0.7,
      },
    });
  }

  if (!map.getLayer(PARTICIPANT_OUTLINE_LAYER_ID)) {
    map.addLayer({
      id: PARTICIPANT_OUTLINE_LAYER_ID,
      type: "line",
      source: COUNTRY_SOURCE_ID,
      filter: ["==", ["get", "isParticipant"], true],
      paint: {
        "line-color": "rgba(255,255,255,0.24)",
        "line-width": 0.85,
      },
    });
  }

  // Hover state: only participant countries get a visible hover outline.
  if (!map.getLayer(HOVER_LINE_LAYER_ID)) {
    map.addLayer({
      id: HOVER_LINE_LAYER_ID,
      type: "line",
      source: COUNTRY_SOURCE_ID,
      filter: ["==", ["get", "iso3"], ""],
      paint: {
        "line-color": HOVER_COUNTRY_STYLE.lineColor,
        "line-width": HOVER_COUNTRY_STYLE.lineWidth,
      },
    });
  }

  // Selected state: a soft glow plus crisp border makes the active country pop.
  if (!map.getLayer(SELECTED_GLOW_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_GLOW_LAYER_ID,
      type: "line",
      source: COUNTRY_SOURCE_ID,
      filter: ["==", ["get", "iso3"], ""],
      paint: {
        "line-blur": SELECTED_COUNTRY_STYLE.glowBlur,
        "line-color": SELECTED_COUNTRY_STYLE.glowColor,
        "line-width": SELECTED_COUNTRY_STYLE.glowWidth,
      },
    });
  }

  if (!map.getLayer(SELECTED_LINE_LAYER_ID)) {
    map.addLayer({
      id: SELECTED_LINE_LAYER_ID,
      type: "line",
      source: COUNTRY_SOURCE_ID,
      filter: ["==", ["get", "iso3"], ""],
      paint: {
        "line-color": SELECTED_COUNTRY_STYLE.lineColor,
        "line-width": SELECTED_COUNTRY_STYLE.lineWidth,
      },
    });
  }

  if (!map.getLayer(MARKER_HIT_LAYER_ID)) {
    map.addLayer({
      id: MARKER_HIT_LAYER_ID,
      type: "circle",
      source: MARKER_SOURCE_ID,
      paint: {
        "circle-color": "rgba(255,255,255,0)",
        "circle-radius": ["coalesce", ["get", "markerRadius"], 10],
      },
    });
  }

  if (!map.getLayer(MARKER_HALO_LAYER_ID)) {
    map.addLayer({
      id: MARKER_HALO_LAYER_ID,
      type: "circle",
      source: MARKER_SOURCE_ID,
      paint: {
        "circle-blur": 0.3,
        "circle-color": "rgba(255,255,255,0.14)",
        "circle-radius": ["+", ["coalesce", ["get", "markerRadius"], 10], 5],
        "circle-stroke-color": "rgba(255,255,255,0.14)",
        "circle-stroke-width": 1,
      },
    });
  }

  if (!map.getLayer(MARKER_LAYER_ID)) {
    map.addLayer({
      id: MARKER_LAYER_ID,
      type: "circle",
      source: MARKER_SOURCE_ID,
      paint: {
        "circle-color": ["coalesce", ["get", "fillColor"], "#2dd4bf"],
        "circle-radius": ["coalesce", ["get", "markerRadius"], SELECTED_COUNTRY_STYLE.markerRadius],
        "circle-stroke-color": SELECTED_COUNTRY_STYLE.markerStrokeColor,
        "circle-stroke-width": SELECTED_COUNTRY_STYLE.markerStrokeWidth,
      },
    });
  }

  if (!map.getLayer(MARKER_LABEL_LAYER_ID)) {
    map.addLayer({
      id: MARKER_LABEL_LAYER_ID,
      type: "symbol",
      source: MARKER_SOURCE_ID,
      layout: {
        "text-field": ["coalesce", ["get", "markerLabel"], ""],
        "text-font": ["Open Sans SemiBold"],
        "text-offset": [1.05, 0],
        "text-size": 13,
        "text-variable-anchor": ["top", "bottom", "left", "right"],
        "text-radial-offset": 1.1,
        "text-justify": "auto",
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
      paint: {
        "text-color": "#eef6ff",
        "text-halo-color": "rgba(7, 17, 29, 0.96)",
        "text-halo-width": 2,
        "text-halo-blur": 0.8,
      },
    });
  }

  if (!map.getLayer(MARKER_SELECTED_LAYER_ID)) {
    map.addLayer({
      id: MARKER_SELECTED_LAYER_ID,
      type: "circle",
      source: MARKER_SOURCE_ID,
      filter: ["==", ["get", "iso3"], ""],
      paint: {
        "circle-color": "rgba(245, 158, 11, 0.15)",
        "circle-radius": ["+", ["coalesce", ["get", "markerRadius"], 10], 7],
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2.5,
      },
    });
  }
}

function ensureWorldCupLayers(map: Map) {
  if (!map.getSource(COUNTRY_SOURCE_ID) || !map.getSource(MARKER_SOURCE_ID)) {
    addWorldCupLayers(map);
    return;
  }

  const requiredLayerIds = [
    COUNTRY_FILL_LAYER_ID,
    COUNTRY_LINE_LAYER_ID,
    PARTICIPANT_OUTLINE_LAYER_ID,
    HOVER_LINE_LAYER_ID,
    SELECTED_GLOW_LAYER_ID,
    SELECTED_LINE_LAYER_ID,
    MARKER_HIT_LAYER_ID,
    MARKER_HALO_LAYER_ID,
    MARKER_LAYER_ID,
    MARKER_LABEL_LAYER_ID,
    MARKER_SELECTED_LAYER_ID,
  ];

  const missingLayer = requiredLayerIds.some((layerId) => !map.getLayer(layerId));
  if (missingLayer) {
    addWorldCupLayers(map);
  }
}

function refreshWorldCupMapData(
  map: Map,
  activeSources: ReturnType<typeof buildWorldCupMapSources>,
  onSuccess: () => void,
  onError: (message: string) => void,
) {
  const applyRefresh = () => {
    try {
      if (!map.isStyleLoaded()) {
        map.once("idle", applyRefresh);
        return;
      }

      ensureWorldCupLayers(map);

      const countriesSource = map.getSource(COUNTRY_SOURCE_ID) as GeoJSONSource | undefined;
      const markersSource = map.getSource(MARKER_SOURCE_ID) as GeoJSONSource | undefined;

      if (!countriesSource || !markersSource) {
        map.once("idle", applyRefresh);
        return;
      }

      countriesSource.setData(activeSources.countries as any);
      markersSource.setData(activeSources.markers as any);
      map.resize();
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown map refresh error.";
      onError(message);
    }
  };

  applyRefresh();
}

export function WorldMap({
  teams,
  mode,
  snapshotDate,
  selectedTeamIso,
  onSelectTeam,
}: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredIso3, setHoveredIso3] = useState<string | null>(null);

  const activeSources = useMemo(
    () => buildWorldCupMapSources(teams, mode),
    [mode, teams],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    let map: Map;
    try {
      map = createMapInstance(containerRef.current);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown map initialization error.";
      setMapError(`The map could not be initialized: ${message}`);
      return;
    }

    map.addControl(
      new AttributionControl({
        compact: true,
        customAttribution: WORLD_CUP_MAP_ATTRIBUTION,
      }),
      "bottom-right",
    );

    map.on("error", (event) => {
      const message =
        event?.error instanceof Error
          ? event.error.message
          : "Unknown map rendering error.";
      setMapError(`The map encountered a rendering error: ${message}`);
    });

    map.on("load", () => {
      try {
        ensureWorldCupLayers(map);
        setMapReady(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown layer rendering error.";
        setMapError(`The map layers could not be rendered: ${message}`);
      }
    });

    map.on("dblclick", (event) => {
      const participantHits = map.queryRenderedFeatures(event.point, {
        layers: [COUNTRY_FILL_LAYER_ID, MARKER_HIT_LAYER_ID, MARKER_LABEL_LAYER_ID],
      });

      const clickedParticipant = participantHits.find((feature) =>
        isParticipantFeature(feature),
      );

      if (!clickedParticipant) {
        onSelectTeam(null);
        map.easeTo({
          ...WORLD_CUP_DEFAULT_VIEW,
          duration: 700,
        });
      }
    });

    map.on("click", (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: [COUNTRY_FILL_LAYER_ID, MARKER_HIT_LAYER_ID, MARKER_LABEL_LAYER_ID],
      });

      const interactiveFeature = features.find((feature) =>
        isParticipantFeature(feature),
      );

      if (!interactiveFeature) {
        onSelectTeam(null);
        setTooltip(null);
        return;
      }

      onSelectTeam(String(interactiveFeature.properties?.iso3 ?? ""));
    });

    const handleParticipantMove = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!isParticipantFeature(feature)) {
        setHoveredIso3(null);
        setTooltip(null);
        map.getCanvas().style.cursor = "";
        return;
      }

      const iso3 = String(feature.properties?.iso3 ?? "");
      const team = findTeamByIso(teams, iso3);

      if (!team) {
        return;
      }

      setHoveredIso3(iso3);
      setTooltip({
        team,
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY,
      });
      map.getCanvas().style.cursor = "pointer";
    };

    const clearHover = () => {
      setHoveredIso3(null);
      setTooltip(null);
      map.getCanvas().style.cursor = "";
    };

    map.on("mousemove", COUNTRY_FILL_LAYER_ID, handleParticipantMove);
    map.on("mouseleave", COUNTRY_FILL_LAYER_ID, clearHover);
    map.on("mousemove", MARKER_HIT_LAYER_ID, handleParticipantMove);
    map.on("mouseleave", MARKER_HIT_LAYER_ID, clearHover);
    map.on("mousemove", MARKER_LABEL_LAYER_ID, handleParticipantMove);
    map.on("mouseleave", MARKER_LABEL_LAYER_ID, clearHover);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onSelectTeam, teams]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    refreshWorldCupMapData(
      mapRef.current,
      activeSources,
      () => setMapError(null),
      (message) => setMapError(`The map could not refresh correctly: ${message}`),
    );
  }, [activeSources, mapReady, snapshotDate]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) {
      return;
    }

    updateSelectionFilters(mapRef.current, selectedTeamIso, hoveredIso3);
  }, [hoveredIso3, mapReady, selectedTeamIso]);

  return (
    <section className="card relative overflow-visible p-6">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="chip inline-flex">Interactive Map</p>
          <h2 className="mt-4 text-2xl font-semibold text-ink">
            World Cup 2026 Probability Map
          </h2>
        </div>
        <p className="max-w-md text-sm text-slate-500">
          Scroll to zoom, drag to pan, and double-click the empty map to reset the global view.
        </p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-100 bg-[#07111d]">
        <div ref={containerRef} className="h-[680px] w-full" />
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">
        Map shapes are shown for illustrative purposes only and do not represent an official or
        current statement on borders, sovereignty, or territorial status.
      </p>

      {mapError ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {mapError}
        </div>
      ) : null}

      {tooltip ? (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-2xl border border-slate-700/70 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-soft"
          style={{ left: tooltip.x + 16, top: tooltip.y + 16 }}
        >
          <p className="font-semibold text-white">{tooltip.team.team}</p>
          <p className="mt-1 text-slate-400">Group {tooltip.team.group}</p>
          <div className="mt-3 space-y-1 text-slate-200">
            <p>Bookmaker odds: {formatAmericanOdds(tooltip.team.oddsAmerican)}</p>
            <p>Implied probability: {formatPercent(tooltip.team.impliedProbability)}</p>
            <p>Normalized probability: {formatPercent(tooltip.team.normalizedProbability)}</p>
            <p>FIFA ranking: {tooltip.team.fifaRank ?? "N/A"}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
