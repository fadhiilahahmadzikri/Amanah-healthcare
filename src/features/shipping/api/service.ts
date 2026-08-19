import { fakeShipping } from '@/constants/mock-shipping';
import type {
  Coordinate,
  CountryOption,
  GeocodeResult,
  LocationAddressDetails,
  OnboardingData,
  OnboardingResponse,
  ReverseGeocodeResult,
  RouteProfile,
  ShippingFilters,
  ShippingMutationPayload,
  ShippingRouteRequest,
  ShippingRouteResult,
  StateOption,
  StructuredLocationRequest,
  StructuredLocationResult,
  TrackerResponse
} from './types';

const NOMINATIM_SEARCH_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_ENDPOINT = 'https://nominatim.openstreetmap.org/reverse';

const OSRM_PROFILE: Record<RouteProfile, string> = {
  driving: 'driving',
  cycling: 'bike',
  walking: 'foot'
};

const PROFILE_SPEED_KPH: Record<RouteProfile, number> = {
  driving: 38,
  cycling: 16,
  walking: 5
};

type NominatimSearchItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
  geojson?: GeocodeResult['geojson'];
  type?: string;
  class?: string;
  address?: LocationAddressDetails & {
    country_code?: string;
    town?: string;
    village?: string;
    municipality?: string;
  };
};

type NominatimReverseItem = {
  place_id?: number;
  osm_id?: number;
  display_name: string;
  lat?: string;
  lon?: string;
  boundingbox?: [string, string, string, string];
  geojson?: GeocodeResult['geojson'];
  address?: NominatimSearchItem['address'];
};

type CountriesNowPositionItem = {
  name: string;
  iso2?: string;
  iso3?: string;
  lat?: number;
  long?: number;
  latitude?: number;
  longitude?: number;
};

type CountriesNowPositionsResponse = {
  data?: CountriesNowPositionItem[];
};

type CountriesNowStatesResponse = {
  data?: {
    states?: Array<{
      name: string;
      state_code?: string;
    }>;
  };
};

type CountriesNowCitiesResponse = {
  data?: string[];
};

type OsrmRouteResponse = {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
};

let countryCache: CountryOption[] | null = null;
const stateCache = new Map<string, StateOption[]>();
const cityCache = new Map<string, string[]>();
const structuredGeocodeCache = new Map<string, StructuredLocationResult | null>();
const reverseGeocodeCache = new Map<string, ReverseGeocodeResult | null>();

export async function getTrackerData(filters: ShippingFilters): Promise<TrackerResponse> {
  let result = await fakeShipping.getTrackerData();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.pelanggan.nama.toLowerCase().includes(q) ||
        p.kurir.perusahaan.toLowerCase().includes(q)
    );
  }

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Tracker data fetched',
    data: result
  };
}

export async function getOnboardingData(filters: ShippingFilters): Promise<OnboardingResponse> {
  let result = await fakeShipping.getOnboardingData();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.customer.toLowerCase().includes(q) ||
        p.product.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q)
    );
  }

  if (filters.status) {
    result = result.filter((p) => p.status === filters.status);
  }

  const total_records = result.length;
  const limit = filters.limit || 10;
  const page = filters.page || 1;
  const offset = (page - 1) * limit;

  result = result.slice(offset, offset + limit);

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Onboarding data fetched',
    total_records,
    offset,
    limit,
    data: result
  };
}

export async function getOnboardingById(id: string): Promise<OnboardingData | null> {
  return fakeShipping.getOnboardingById(id);
}

export async function createOnboardingData(data: ShippingMutationPayload): Promise<OnboardingData> {
  return fakeShipping.createOnboardingData(data);
}

export async function updateOnboardingData(
  id: string,
  data: Partial<ShippingMutationPayload>
): Promise<OnboardingData> {
  return fakeShipping.updateOnboardingData(id, data);
}

export async function deleteOnboardingData(id: string): Promise<{ success: boolean }> {
  return fakeShipping.deleteOnboardingData(id);
}

export async function getCountryOptions(): Promise<CountryOption[]> {
  if (countryCache) {
    return countryCache;
  }

  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/positions');

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as CountriesNowPositionsResponse;
    countryCache = (payload.data ?? [])
      .map((country) => {
        const latitude = country.lat ?? country.latitude;
        const longitude = country.long ?? country.longitude;

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        const option: CountryOption = {
          name: country.name,
          code: country.iso2 ?? country.iso3 ?? country.name,
          coordinate: [latitude as number, longitude as number] satisfies Coordinate,
          flagUrl: createFlagUrl(country.iso2)
        };

        return option;
      })
      .filter((country): country is CountryOption => country !== null)
      .toSorted((first, second) => first.name.localeCompare(second.name));

    return countryCache;
  } catch {
    return [];
  }
}

export async function getStateOptions(countryName: string): Promise<StateOption[]> {
  const cacheKey = countryName.trim().toLowerCase();

  if (!cacheKey) {
    return [];
  }

  const cachedStates = stateCache.get(cacheKey);

  if (cachedStates) {
    return cachedStates;
  }

  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ country: countryName })
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as CountriesNowStatesResponse;
    const states = (payload.data?.states ?? [])
      .map((state) => ({ name: state.name, code: state.state_code }))
      .toSorted((first, second) => first.name.localeCompare(second.name));

    stateCache.set(cacheKey, states);
    return states;
  } catch {
    return [];
  }
}

export async function getCityOptions(countryName: string, stateName: string): Promise<string[]> {
  const cacheKey = `${countryName.trim().toLowerCase()}::${stateName.trim().toLowerCase()}`;

  if (!countryName.trim() || !stateName.trim()) {
    return [];
  }

  const cachedCities = cityCache.get(cacheKey);

  if (cachedCities) {
    return cachedCities;
  }

  try {
    const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ country: countryName, state: stateName })
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as CountriesNowCitiesResponse;
    const cities = (payload.data ?? []).toSorted((first, second) => first.localeCompare(second));

    cityCache.set(cacheKey, cities);
    return cities;
  } catch {
    return [];
  }
}

export async function geocodeLocation(
  query: string,
  options: { limit?: number; countryCode?: string; signal?: AbortSignal } = {}
): Promise<GeocodeResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const searchParams = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    polygon_geojson: '1',
    limit: String(options.limit ?? 8),
    q: trimmedQuery
  });

  if (options.countryCode) {
    searchParams.set('countrycodes', options.countryCode.toLowerCase());
  }

  const response = await fetch(`${NOMINATIM_SEARCH_ENDPOINT}?${searchParams}`, {
    headers: { Accept: 'application/json' },
    signal: options.signal
  });

  if (!response.ok) {
    return [];
  }

  const results = (await response.json()) as NominatimSearchItem[];

  return results.map((result) => ({
    id: String(result.place_id),
    name: createGeocodeName(result),
    address: result.display_name,
    coordinate: [Number.parseFloat(result.lat), Number.parseFloat(result.lon)],
    category: result.type ?? result.class ?? 'place',
    country: result.address?.country,
    addressDetails: normalizeAddressDetails(result.address),
    geojson: result.geojson,
    boundingBox: parseBoundingBox(result.boundingbox)
  }));
}

export async function geocodeStructuredLocation(
  request: StructuredLocationRequest,
  options: { signal?: AbortSignal } = {}
): Promise<StructuredLocationResult | null> {
  const query = createStructuredQuery(request);

  if (!query) {
    return null;
  }

  const cacheKey = createStructuredGeocodeCacheKey(request);
  const cachedResult = structuredGeocodeCache.get(cacheKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const searchParams = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    polygon_geojson: '1',
    polygon_threshold: '0.0',
    limit: '1',
    q: query
  });

  if (request.countryCode) {
    searchParams.set('countrycodes', request.countryCode.toLowerCase());
  }

  try {
    const response = await fetch(`${NOMINATIM_SEARCH_ENDPOINT}?${searchParams}`, {
      headers: { Accept: 'application/json' },
      signal: options.signal
    });

    if (!response.ok) {
      return null;
    }

    const results = (await response.json()) as NominatimSearchItem[];
    const result = results[0];

    if (!result) {
      structuredGeocodeCache.set(cacheKey, null);
      return null;
    }

    const structuredResult: StructuredLocationResult = {
      id: String(result.place_id),
      label: createGeocodeName(result),
      address: result.display_name,
      coordinate: [Number.parseFloat(result.lat), Number.parseFloat(result.lon)],
      addressDetails: normalizeAddressDetails(result.address),
      geojson: result.geojson,
      boundingBox: parseBoundingBox(result.boundingbox)
    };

    structuredGeocodeCache.set(cacheKey, structuredResult);
    return structuredResult;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return null;
  }
}

export async function reverseGeocodeCoordinate(
  coordinate: Coordinate,
  options: { signal?: AbortSignal } = {}
): Promise<ReverseGeocodeResult | null> {
  const cacheKey = `${coordinate[0].toFixed(5)},${coordinate[1].toFixed(5)}`;
  const cachedResult = reverseGeocodeCache.get(cacheKey);

  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const searchParams = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    polygon_geojson: '1',
    zoom: '18',
    lat: String(coordinate[0]),
    lon: String(coordinate[1])
  });

  try {
    const response = await fetch(`${NOMINATIM_REVERSE_ENDPOINT}?${searchParams}`, {
      headers: { Accept: 'application/json' },
      signal: options.signal
    });

    if (!response.ok) {
      return null;
    }

    const result = (await response.json()) as NominatimReverseItem;

    if (!result?.display_name) {
      reverseGeocodeCache.set(cacheKey, null);
      return null;
    }

    const reverseResult = {
      id: String(result.place_id ?? result.osm_id ?? cacheKey),
      label: createReverseGeocodeName(result),
      address: result.display_name,
      coordinate,
      addressDetails: normalizeAddressDetails(result.address),
      geojson: result.geojson,
      boundingBox: parseBoundingBox(result.boundingbox)
    };

    reverseGeocodeCache.set(cacheKey, reverseResult);
    return reverseResult;
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    return null;
  }
}

export async function getRoutePath(request: ShippingRouteRequest): Promise<ShippingRouteResult> {
  const profile = OSRM_PROFILE[request.profile];
  const url = `https://router.project-osrm.org/route/v1/${profile}/${request.origin[1]},${request.origin[0]};${request.destination[1]},${request.destination[0]}?overview=full&geometries=geojson&steps=true`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return createFallbackRoute(request);
    }

    const data = (await response.json()) as OsrmRouteResponse;
    const route = data.routes?.[0];

    if (!route?.geometry.coordinates.length) {
      return createFallbackRoute(request);
    }

    return {
      coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      profile: request.profile,
      source: 'osrm'
    };
  } catch {
    return createFallbackRoute(request);
  }
}

function createGeocodeName(result: NominatimSearchItem): string {
  return (
    result.address?.city ??
    result.address?.municipality ??
    result.address?.town ??
    result.address?.village ??
    result.address?.county ??
    result.address?.suburb ??
    result.address?.state ??
    result.display_name.split(',')[0] ??
    result.display_name
  );
}

function createReverseGeocodeName(result: NominatimReverseItem): string {
  return (
    result.address?.road ??
    result.address?.city ??
    result.address?.municipality ??
    result.address?.town ??
    result.address?.village ??
    result.address?.county ??
    result.address?.suburb ??
    result.display_name.split(',')[0] ??
    result.display_name
  );
}

function createStructuredQuery(request: StructuredLocationRequest): string {
  return [request.query, request.city, request.state, request.country]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ');
}

function createStructuredGeocodeCacheKey(request: StructuredLocationRequest): string {
  return [request.query, request.city, request.state, request.country, request.countryCode]
    .map((part) => part?.trim().toLowerCase() ?? '')
    .join('|');
}

function normalizeAddressDetails(address: NominatimSearchItem['address']): LocationAddressDetails {
  return {
    country: address?.country,
    countryCode: address?.countryCode ?? address?.country_code?.toUpperCase(),
    state: address?.state,
    city: address?.city ?? address?.municipality ?? address?.town ?? address?.village,
    county: address?.county,
    suburb: address?.suburb,
    postcode: address?.postcode,
    road: address?.road
  };
}

function createFlagUrl(countryCode?: string): string | undefined {
  if (!countryCode) {
    return undefined;
  }

  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function parseBoundingBox(
  boundingBox: NominatimSearchItem['boundingbox']
): [number, number, number, number] | undefined {
  if (!boundingBox) {
    return undefined;
  }

  const parsed = boundingBox.map((value) => Number.parseFloat(value));

  if (parsed.some((value) => !Number.isFinite(value))) {
    return undefined;
  }

  return [parsed[0], parsed[1], parsed[2], parsed[3]];
}

function createFallbackRoute(request: ShippingRouteRequest): ShippingRouteResult {
  const distanceMeters = calculateDistanceMeters(request.origin, request.destination);
  const speedMetersPerSecond = (PROFILE_SPEED_KPH[request.profile] * 1000) / 3600;

  return {
    coordinates: [request.origin, request.destination],
    distanceMeters,
    durationSeconds: distanceMeters / speedMetersPerSecond,
    profile: request.profile,
    source: 'fallback'
  };
}

function calculateDistanceMeters(start: Coordinate, end: Coordinate): number {
  const earthRadiusMeters = 6371000;
  const startLatRadians = toRadians(start[0]);
  const endLatRadians = toRadians(end[0]);
  const deltaLatRadians = toRadians(end[0] - start[0]);
  const deltaLngRadians = toRadians(end[1] - start[1]);
  const haversine =
    Math.sin(deltaLatRadians / 2) ** 2 +
    Math.cos(startLatRadians) * Math.cos(endLatRadians) * Math.sin(deltaLngRadians / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}
