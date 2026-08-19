import type * as Leaflet from 'leaflet';
import type { MutableRefObject } from 'react';
import type { Coordinate, RouteProfile } from '../api/types';
import type { ShippingTileLayerId } from '../constants/map';
import { SHIPPING_TILE_LAYERS } from '../constants/map';

export type LeafletModule = typeof import('leaflet');

export function getTileLayerConfig(layerId: ShippingTileLayerId) {
  return SHIPPING_TILE_LAYERS[layerId] ?? SHIPPING_TILE_LAYERS.daylight;
}

export function resetLayerGroup(
  L: LeafletModule,
  map: Leaflet.Map,
  layerRef: MutableRefObject<Leaflet.LayerGroup | null>
): Leaflet.LayerGroup {
  if (layerRef.current) {
    layerRef.current.clearLayers();

    if (map.hasLayer(layerRef.current)) {
      map.removeLayer(layerRef.current);
    }
  }

  const layerGroup = L.layerGroup().addTo(map);
  layerRef.current = layerGroup;
  return layerGroup;
}

export function fitMapToCoordinates(
  L: LeafletModule,
  map: Leaflet.Map,
  coordinates: Coordinate[],
  options: { padding?: [number, number]; maxZoom?: number } = {}
) {
  if (coordinates.length === 0) {
    return;
  }

  if (coordinates.length === 1) {
    map.setView(coordinates[0], options.maxZoom ?? Math.max(map.getZoom(), 13));
    return;
  }

  map.fitBounds(L.latLngBounds(coordinates), {
    padding: options.padding ?? [44, 44],
    maxZoom: options.maxZoom ?? 14
  });
}

export function createPointIcon(
  L: LeafletModule,
  options: {
    label: string;
    tone: 'origin' | 'destination' | 'hub' | 'muted';
  }
): Leaflet.DivIcon {
  // Use Tailwind or CSS variables for tones to respect codebase style
  const toneColors = {
    origin: 'var(--chart-2, #2dd4bf)',
    destination: 'var(--destructive, #ef4444)',
    hub: 'var(--chart-1, #0ea5e9)',
    muted: 'var(--muted-foreground, #a1a1aa)'
  };
  const color = toneColors[options.tone];

  return L.divIcon({
    className: `shipping-map-div-icon shipping-map-pulse-icon shipping-map-point-${options.tone}`,
    html: `<div style="--pin-color: ${color}; position: absolute; inset: 0;"><span class="shipping-map-pin-beam"></span><div class="shipping-map-bounce-wrapper"><svg class="shipping-map-pin-svg" width="32" height="41" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.3 17 27 17 27s17-14.7 17-27C34 7.6 26.4 0 17 0Z" fill="${color}"/><circle cx="17" cy="17" r="8" fill="var(--background)"/><text x="17" y="22" text-anchor="middle" font-size="13" font-weight="800" fill="${color}">${escapeHtml(options.label)}</text></svg></div></div>`,
    iconSize: [32, 41],
    iconAnchor: [16, 41],
    popupAnchor: [0, -36]
  });
}

export function createPulseIcon(
  L: LeafletModule,
  label: string,
  tone?: 'origin' | 'destination' | 'hub' | 'peek' | 'selected'
): Leaflet.DivIcon {
  const toneColors = {
    origin: 'var(--chart-2, #2dd4bf)',
    destination: 'var(--destructive, #ef4444)',
    hub: 'var(--chart-1, #0ea5e9)',
    peek: '#f59e0b',
    selected: '#06b6d4'
  };
  const color = tone ? toneColors[tone] : 'var(--primary)';

  return L.divIcon({
    className: 'shipping-map-div-icon shipping-map-pulse-icon',
    html: `<div style="--pin-color: ${color}; position: absolute; inset: 0;"><span class="shipping-map-pin-beam"></span><div class="shipping-map-bounce-wrapper"><svg class="shipping-map-pin-svg" width="30" height="38" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 0C7.6 0 0 7.6 0 17c0 12.3 17 27 17 27s17-14.7 17-27C34 7.6 26.4 0 17 0Z" fill="${color}"/><circle cx="17" cy="17" r="8" fill="var(--background)"/><text x="17" y="22" text-anchor="middle" font-size="13" font-weight="800" fill="${color}">${escapeHtml(label)}</text></svg></div></div>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34]
  });
}

export function createCitySpotIcon(
  L: LeafletModule,
  options: { label: string; muted?: boolean }
): Leaflet.DivIcon {
  return L.divIcon({
    className: `shipping-map-div-icon shipping-map-city-spot${
      options.muted ? ' shipping-map-city-muted' : ''
    }`,
    html: `<span class="shipping-map-city-dot"></span><span class="shipping-map-city-label">${escapeHtml(options.label)}</span>`,
    iconSize: [120, 28],
    iconAnchor: [8, 14]
  });
}

export function createHubIcon(
  L: LeafletModule,
  options: { label: string; status: 'Stable' | 'Busy' | 'Watch' }
): Leaflet.DivIcon {
  return L.divIcon({
    className: `shipping-map-div-icon shipping-map-hub-icon shipping-map-hub-${options.status.toLowerCase()}`,
    html: `<span>${escapeHtml(options.label.slice(0, 2).toUpperCase())}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

export function createPopupHtml(rows: Array<[string, string]>): string {
  return `<div class="shipping-map-popup">${rows
    .map(
      ([label, value]) =>
        `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    )
    .join('')}</div>`;
}

export function formatCoordinate(coordinate: Coordinate): string {
  return `${coordinate[0].toFixed(4)}, ${coordinate[1].toFixed(4)}`;
}

export function formatRouteDistance(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

export function formatRouteDuration(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function getProfileLabel(profile: RouteProfile): string {
  const labels: Record<RouteProfile, string> = {
    driving: 'Driving',
    cycling: 'Cycling',
    walking: 'Walking'
  };

  return labels[profile];
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const escapedCharacters: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return escapedCharacters[character] ?? character;
  });
}
