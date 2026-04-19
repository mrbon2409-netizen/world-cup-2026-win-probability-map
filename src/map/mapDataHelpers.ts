import worldAtlas from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon, Position } from "geojson";
import type { MetricMode, TeamSnapshot } from "../types/worldCup";

const ISO3_TO_NUMERIC: Record<string, string> = {
  ARG: "032",
  AUS: "036",
  AUT: "040",
  BEL: "056",
  BIH: "070",
  BRA: "076",
  CAN: "124",
  CHE: "756",
  CIV: "384",
  COD: "180",
  COL: "170",
  CPV: "132",
  CZE: "203",
  CUW: "531",
  DEU: "276",
  DZA: "012",
  ECU: "218",
  EGY: "818",
  ESP: "724",
  FRA: "250",
  GHA: "288",
  HRV: "191",
  HTI: "332",
  IRN: "364",
  IRQ: "368",
  JOR: "400",
  JPN: "392",
  KOR: "410",
  MAR: "504",
  MEX: "484",
  NLD: "528",
  NOR: "578",
  NZL: "554",
  PAN: "591",
  PRT: "620",
  PRY: "600",
  QAT: "634",
  SAU: "682",
  SEN: "686",
  SWE: "752",
  TUN: "788",
  TUR: "792",
  URY: "858",
  USA: "840",
  UZB: "860",
  ZAF: "710",
};

const SPECIAL_MARKERS: Record<string, [number, number]> = {
  CUW: [-68.99, 12.17],
  ENG: [-1.4, 52.7],
  SCT: [-4.2, 56.7],
};

const SUPPLEMENTAL_POLYGONS: Record<string, Feature<Geometry>> = {
  CUW: {
    type: "Feature",
    id: "SUP-CUW",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-69.28, 12.03],
        [-69.18, 12.25],
        [-68.98, 12.33],
        [-68.74, 12.27],
        [-68.63, 12.14],
        [-68.79, 12.01],
        [-69.05, 11.98],
        [-69.28, 12.03],
      ]],
    },
    properties: {},
  },
  ENG: {
    type: "Feature",
    id: "SUP-ENG",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-5.95, 50.02],
        [-5.45, 50.35],
        [-4.9, 50.55],
        [-4.2, 50.45],
        [-3.35, 50.32],
        [-2.15, 50.08],
        [-1.05, 50.16],
        [0.3, 50.38],
        [1.52, 51.04],
        [1.72, 52.0],
        [1.58, 53.1],
        [0.92, 53.72],
        [0.3, 53.94],
        [-0.22, 54.18],
        [-1.05, 54.66],
        [-1.88, 55.15],
        [-2.58, 55.28],
        [-3.22, 55.22],
        [-3.5, 54.92],
        [-3.18, 54.44],
        [-2.68, 53.98],
        [-3.05, 53.16],
        [-3.55, 52.55],
        [-4.4, 52.18],
        [-5.28, 51.48],
        [-5.62, 50.84],
        [-5.95, 50.02],
      ]],
    },
    properties: {},
  },
  SCT: {
    type: "Feature",
    id: "SUP-SCT",
    geometry: {
      type: "MultiPolygon",
      coordinates: [
        [[
          [-7.7, 54.84],
          [-6.9, 55.22],
          [-5.95, 55.5],
          [-5.1, 55.82],
          [-4.35, 56.18],
          [-3.48, 56.72],
          [-2.58, 57.18],
          [-2.1, 57.58],
          [-1.78, 57.95],
          [-2.22, 58.42],
          [-3.02, 58.64],
          [-4.12, 58.68],
          [-5.25, 58.34],
          [-5.92, 57.92],
          [-6.18, 57.22],
          [-6.02, 56.48],
          [-5.28, 55.88],
          [-4.58, 55.42],
          [-4.88, 55.02],
          [-5.7, 54.8],
          [-6.62, 54.72],
          [-7.7, 54.84],
        ]],
        [[
          [-7.62, 57.32],
          [-7.02, 57.42],
          [-6.66, 57.72],
          [-7.08, 57.98],
          [-7.62, 57.88],
          [-7.82, 57.58],
          [-7.62, 57.32],
        ]],
        [[
          [-6.58, 58.06],
          [-5.98, 58.2],
          [-5.62, 58.48],
          [-6.12, 58.72],
          [-6.62, 58.58],
          [-6.84, 58.24],
          [-6.58, 58.06],
        ]],
      ],
    },
    properties: {},
  },
};

export interface ParticipantFeatureProperties {
  confederation?: string;
  fifaRank?: number | null;
  fillColor: string;
  group?: string;
  impliedProbability?: number;
  isParticipant: boolean;
  iso3: string | null;
  labelDx?: number;
  labelDy?: number;
  markerLabel?: string;
  markerRadius?: number;
  normalizedProbability?: number;
  oddsAmerican?: number;
  team?: string;
}

const SPECIAL_MARKER_LAYOUTS: Record<
  string,
  {
    labelDx: number;
    labelDy: number;
    markerLabel: string;
    markerRadius: number;
  }
> = {
  CUW: {
    labelDx: 0,
    labelDy: 1.5,
    markerLabel: "Curacao",
    markerRadius: 10,
  },
  ENG: {
    labelDx: 1.2,
    labelDy: -0.12,
    markerLabel: "England",
    markerRadius: 10,
  },
  SCT: {
    labelDx: 1.2,
    labelDy: -0.12,
    markerLabel: "Scotland",
    markerRadius: 10,
  },
};

function getProbabilityFill(team: TeamSnapshot): string {
  const intensity = Math.min(team.normalizedProbability / 0.11, 1);
  const lightness = 64 - intensity * 24;
  return `hsl(172, 72%, ${lightness}%)`;
}

function getRankingFill(team: TeamSnapshot): string {
  if (team.fifaRank === null) {
    return "#2a3548";
  }

  const strength = Math.max(0, 1 - (team.fifaRank - 1) / 80);
  const lightness = 60 - strength * 22;
  return `hsl(214, 78%, ${lightness}%)`;
}

function getActiveFill(team: TeamSnapshot, mode: MetricMode): string {
  return mode === "normalizedProbability"
    ? getProbabilityFill(team)
    : getRankingFill(team);
}

function stripFrenchGuiana(featureToClean: Feature): Feature {
  if (featureToClean.id !== "250" || featureToClean.geometry?.type !== "MultiPolygon") {
    return featureToClean;
  }

  const geometry = featureToClean.geometry as MultiPolygon;
  const cleanedCoordinates = geometry.coordinates.filter((polygon) => {
    const [longitude, latitude] = getPolygonCentroid(polygon);
    const isFrenchGuiana =
      longitude > -60 &&
      longitude < -49 &&
      latitude > 1 &&
      latitude < 8.5;

    return !isFrenchGuiana;
  });

  return {
    ...featureToClean,
    geometry: {
      ...geometry,
      coordinates: cleanedCoordinates,
    },
  };
}

function getPolygonCentroid(polygon: Position[][]): [number, number] {
  const ring = polygon[0] ?? [];
  const total = ring.reduce(
    (accumulator, coordinate) => {
      return [accumulator[0] + coordinate[0], accumulator[1] + coordinate[1]];
    },
    [0, 0],
  );

  return ring.length > 0
    ? [total[0] / ring.length, total[1] / ring.length]
    : [0, 0];
}

function buildCountryPropertyMap(teams: TeamSnapshot[], mode: MetricMode) {
  const map = new Map<string, TeamSnapshot>();

  teams.forEach((team) => {
    const numericId = ISO3_TO_NUMERIC[team.iso3];
    if (numericId) {
      map.set(numericId, team);
    }
  });

  return map;
}

function buildParticipantProperties(team: TeamSnapshot, mode: MetricMode): ParticipantFeatureProperties {
  return {
    confederation: team.confederation,
    fifaRank: team.fifaRank,
    fillColor: getActiveFill(team, mode),
    group: team.group,
    impliedProbability: team.impliedProbability,
    isParticipant: true,
    iso3: team.iso3,
    normalizedProbability: team.normalizedProbability,
    oddsAmerican: team.oddsAmerican,
    team: team.team,
  };
}

function createCountryFeatureCollection(
  teams: TeamSnapshot[],
  mode: MetricMode,
): FeatureCollection<Geometry, ParticipantFeatureProperties> {
  const topology = worldAtlas as any;
  const rawObject = topology?.objects?.countries;
  const countries = rawObject
    ? (feature(topology, rawObject) as unknown as FeatureCollection)
    : ({ type: "FeatureCollection", features: [] } as FeatureCollection);
  const teamByNumericId = buildCountryPropertyMap(teams, mode);
  const supplementalFeatures = teams
    .filter((team) => team.iso3 in SUPPLEMENTAL_POLYGONS)
    .map((team) => ({
      ...SUPPLEMENTAL_POLYGONS[team.iso3],
      properties: buildParticipantProperties(team, mode),
    } satisfies Feature<Geometry, ParticipantFeatureProperties>));

  return {
    type: "FeatureCollection",
    features: [
      ...(countries.features ?? []).map((rawFeature) => {
        const normalizedId = String(rawFeature.id ?? "").padStart(3, "0");
        const matchingTeam = teamByNumericId.get(normalizedId);
        const cleanedFeature = stripFrenchGuiana({
          ...rawFeature,
          id: normalizedId,
        });

        return {
          ...cleanedFeature,
          properties: matchingTeam
            ? buildParticipantProperties(matchingTeam, mode)
            : {
                fillColor: "#162232",
                isParticipant: false,
                iso3: null,
              },
        } satisfies Feature<Geometry, ParticipantFeatureProperties>;
      }),
      ...supplementalFeatures,
    ],
  };
}

function createMarkerFeatureCollection(
  teams: TeamSnapshot[],
  mode: MetricMode,
): FeatureCollection<Geometry, ParticipantFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: teams
      .filter((team) => team.iso3 in SPECIAL_MARKERS && !(team.iso3 in SUPPLEMENTAL_POLYGONS))
      .map((team) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: SPECIAL_MARKERS[team.iso3],
        },
        properties: {
          confederation: team.confederation,
          fifaRank: team.fifaRank,
          fillColor: getActiveFill(team, mode),
          group: team.group,
          impliedProbability: team.impliedProbability,
          isParticipant: true,
          iso3: team.iso3,
          labelDx: SPECIAL_MARKER_LAYOUTS[team.iso3]?.labelDx ?? 1,
          labelDy: SPECIAL_MARKER_LAYOUTS[team.iso3]?.labelDy ?? 0,
          markerLabel: SPECIAL_MARKER_LAYOUTS[team.iso3]?.markerLabel ?? team.team,
          markerRadius: SPECIAL_MARKER_LAYOUTS[team.iso3]?.markerRadius ?? 9,
          normalizedProbability: team.normalizedProbability,
          oddsAmerican: team.oddsAmerican,
          team: team.team,
        },
      })),
  };
}

export function buildWorldCupMapSources(teams: TeamSnapshot[], mode: MetricMode) {
  return {
    countries: createCountryFeatureCollection(teams, mode),
    markers: createMarkerFeatureCollection(teams, mode),
  };
}
