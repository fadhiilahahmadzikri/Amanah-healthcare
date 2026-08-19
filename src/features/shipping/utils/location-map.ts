import type * as Leaflet from 'leaflet';
import type { GeoJsonObject } from 'geojson';
import type {
  Coordinate,
  CountryOption,
  GeocodeResult,
  LocationAddressDetails,
  ReverseGeocodeResult,
  ShippingPointOfInterest,
  StateOption,
  StructuredLocationResult
} from '../api/types';
import { LOCATION_TREE } from '../constants/map';

export type SelectionTarget = 'origin' | 'destination';
export type BoundarySource = 'country' | 'state' | 'city' | 'search' | 'poi' | 'map';

export type BoundaryPreview = {
  id: string;
  label: string;
  center: Coordinate;
  address?: string;
  addressDetails?: LocationAddressDetails;
  geojson?: GeoJsonObject;
  polygon?: Coordinate[];
  source: BoundarySource;
};

export const DEFAULT_COUNTRY = 'Indonesia';
export const DEFAULT_STATE = 'DKI Jakarta';
export const DEFAULT_CITY = 'Central Jakarta';
export const DEFAULT_COUNTRY_CODE = 'ID';

export const fallbackCountries: CountryOption[] = LOCATION_TREE.map((country) => {
  const code =
    country.id === 'indonesia' ? DEFAULT_COUNTRY_CODE : country.id.slice(0, 2).toUpperCase();

  return {
    name: country.label,
    code,
    coordinate: country.center,
    flagUrl: getFlagUrl(code)
  };
});

export function getFallbackStates(countryName: string): StateOption[] {
  const country = LOCATION_TREE.find(
    (item) => item.label.toLowerCase() === countryName.toLowerCase()
  );

  return (
    country?.states.map((state) => ({
      name: state.label,
      code: state.id
    })) ?? []
  );
}

export function getFallbackCities(countryName: string, stateName: string): string[] {
  const country = LOCATION_TREE.find(
    (item) => item.label.toLowerCase() === countryName.toLowerCase()
  );
  const state = country?.states.find(
    (item) => item.label.toLowerCase() === stateName.toLowerCase()
  );

  return state?.cities.map((city) => city.label) ?? [];
}

export function getFlagUrl(countryCode?: string): string | undefined {
  if (!countryCode) {
    return undefined;
  }

  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

export function createBoundaryFromStructured(
  result: StructuredLocationResult,
  source: BoundarySource
): BoundaryPreview {
  return {
    id: `${source}-${result.id}`,
    label: result.label,
    center: result.coordinate,
    address: result.address,
    addressDetails: result.addressDetails,
    geojson: result.geojson,
    source
  };
}

export function createBoundaryFromGeocode(result: GeocodeResult): BoundaryPreview {
  return {
    id: `search-${result.id}`,
    label: result.name,
    center: result.coordinate,
    address: result.address,
    addressDetails: result.addressDetails,
    geojson: result.geojson,
    source: 'search'
  };
}

export function createBoundaryFromReverseGeocode(result: ReverseGeocodeResult): BoundaryPreview {
  return {
    id: `map-${result.id}`,
    label: result.label,
    center: result.coordinate,
    address: result.address,
    addressDetails: result.addressDetails,
    geojson: result.geojson,
    source: 'map'
  };
}

export function createBoundaryFromPoi(poi: ShippingPointOfInterest): BoundaryPreview {
  return {
    id: `poi-${poi.id}`,
    label: poi.label,
    center: poi.center,
    address: poi.label,
    polygon: poi.boundary,
    source: 'poi'
  };
}

export function createHubClusterLayer(L: typeof import('leaflet')): Leaflet.LayerGroup {
  if (typeof L.markerClusterGroup === 'function') {
    return L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 44
    });
  }

  return L.layerGroup();
}

export function addBoundaryToGroup(
  L: typeof import('leaflet'),
  group: Leaflet.LayerGroup,
  boundary: BoundaryPreview,
  style: Leaflet.PathOptions
) {
  if (boundary.geojson) {
    L.geoJSON(boundary.geojson, { style }).addTo(group);
    return;
  }

  if (boundary.polygon?.length) {
    L.polygon(boundary.polygon, style).addTo(group);
  }
}

export function flyToBoundary(
  boundary: BoundaryPreview | null,
  L: typeof import('leaflet') | null,
  map: Leaflet.Map | null,
  options: { animate?: boolean; maxZoom?: number } = {}
) {
  if (!boundary || !L || !map) {
    return;
  }

  const duration = options.animate === false ? 0 : 0.9;
  const maxZoom = options.maxZoom ?? 11;

  if (boundary.geojson) {
    const layer = L.geoJSON(boundary.geojson);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [64, 64],
        maxZoom,
        duration
      });
      return;
    }
  }

  if (boundary.polygon?.length) {
    map.flyToBounds(L.latLngBounds(boundary.polygon), {
      padding: [64, 64],
      maxZoom: options.maxZoom ?? 12,
      duration
    });
    return;
  }

  map.flyTo(boundary.center, Math.max(map.getZoom(), 13), { duration });
}
