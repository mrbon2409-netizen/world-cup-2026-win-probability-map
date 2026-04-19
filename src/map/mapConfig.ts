import type { MapOptions, StyleSpecification } from "maplibre-gl";

export const MAP_STYLE_URL = (import.meta.env.VITE_WC2026_MAP_STYLE_URL ?? "").trim();
export const MAPBOX_ACCESS_TOKEN = (import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? "").trim();

export const WORLD_CUP_DEFAULT_VIEW = {
  center: [10, 22] as [number, number],
  zoom: 1.28,
};

export const WORLD_CUP_MAP_OPTIONS: Partial<MapOptions> = {
  attributionControl: false,
  boxZoom: false,
  maxZoom: 6,
  minZoom: 1,
  dragRotate: false,
};

export const WORLD_CUP_MAP_ATTRIBUTION =
  "Country boundaries: Natural Earth via world-atlas. Built with MapLibre GL JS.";

export function createWorldCupBasemapStyle(): string | StyleSpecification {
  // Keep the default path fully token-free and self-contained so map initialization
  // cannot fail because of missing remote style assets.
  return {
    version: 8,
    name: "World Cup Dark Minimal",
    sources: {},
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#07111d",
        },
      },
    ],
  };
}
