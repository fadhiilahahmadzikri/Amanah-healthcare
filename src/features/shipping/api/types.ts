import type { TrackerData, OnboardingData } from '@/constants/mock-shipping';
import type { GeoJsonObject } from 'geojson';

export type { TrackerData, OnboardingData };

export type Coordinate = [number, number];

export type ShippingFilters = {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
};

export type TrackerResponse = {
  success: boolean;
  time: string;
  message: string;
  data: TrackerData[];
};

export type OnboardingResponse = {
  success: boolean;
  time: string;
  message: string;
  total_records: number;
  offset: number;
  limit: number;
  data: OnboardingData[];
};

export type ShippingMutationPayload = Omit<
  OnboardingData,
  'id' | 'image' | 'startCoord' | 'endCoord'
> &
  Partial<Pick<OnboardingData, 'startCoord' | 'endCoord'>>;

export type RouteProfile = 'driving' | 'cycling' | 'walking';

export type ShippingRouteRequest = {
  origin: Coordinate;
  destination: Coordinate;
  profile: RouteProfile;
};

export type ShippingRouteResult = {
  coordinates: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
  profile: RouteProfile;
  source: 'osrm' | 'fallback';
};

export type GeocodeResult = {
  id: string;
  name: string;
  address: string;
  coordinate: Coordinate;
  category: string;
  country?: string;
  addressDetails?: LocationAddressDetails;
  geojson?: GeoJsonObject;
  boundingBox?: [number, number, number, number];
};

export type CountryOption = {
  name: string;
  code: string;
  coordinate: Coordinate;
  flagUrl?: string;
};

export type StateOption = {
  name: string;
  code?: string;
};

export type StructuredLocationRequest = {
  country?: string;
  state?: string;
  city?: string;
  query?: string;
  countryCode?: string;
};

export type StructuredLocationResult = {
  id: string;
  label: string;
  address: string;
  coordinate: Coordinate;
  addressDetails?: LocationAddressDetails;
  geojson?: GeoJsonObject;
  boundingBox?: [number, number, number, number];
};

export type LocationAddressDetails = {
  country?: string;
  countryCode?: string;
  state?: string;
  city?: string;
  county?: string;
  suburb?: string;
  postcode?: string;
  road?: string;
};

export type ReverseGeocodeResult = {
  id: string;
  label: string;
  address: string;
  coordinate: Coordinate;
  addressDetails: LocationAddressDetails;
  geojson?: GeoJsonObject;
  boundingBox?: [number, number, number, number];
};

export type LocationIntelligence = {
  dailyOrders: number;
  serviceLevel: string;
  avgTransitTime: string;
  risk: 'Low' | 'Moderate' | 'Elevated';
  coverage: string;
};

export type BoundaryLocation = {
  id: string;
  label: string;
  center: Coordinate;
  boundary: Coordinate[];
  intelligence: LocationIntelligence;
};

export type CityLocation = BoundaryLocation & {
  stateId: string;
};

export type StateLocation = BoundaryLocation & {
  countryId: string;
  cities: CityLocation[];
};

export type CountryLocation = BoundaryLocation & {
  states: StateLocation[];
};

export type ShippingPointOfInterest = BoundaryLocation & {
  countryId: string;
  stateId: string;
  cityId: string;
  kind: 'port' | 'warehouse' | 'airport' | 'market' | 'pickup';
};

export type ShippingHub = {
  id: string;
  name: string;
  type: 'Port' | 'Airport' | 'Fulfillment' | 'Cross-dock';
  coordinate: Coordinate;
  volume: string;
  serviceLevel: string;
  status: 'Stable' | 'Busy' | 'Watch';
};

export type HeatPoint = [number, number, number];
