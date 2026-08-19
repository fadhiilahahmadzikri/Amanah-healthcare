'use client';

import { useEffect, useRef } from 'react';
import type * as Leaflet from 'leaflet';
import { getRoutePath } from '../api/service';
import type { Coordinate, RouteProfile, ShippingRouteResult } from '../api/types';
import { SHIPPING_HEAT_POINTS, SHIPPING_HUBS } from '../constants/map';
import {
  createHubIcon,
  createPointIcon,
  createPopupHtml,
  createPulseIcon,
  fitMapToCoordinates,
  formatCoordinate,
  resetLayerGroup
} from '../utils/map';
import {
  addBoundaryToGroup,
  createHubClusterLayer,
  type BoundaryPreview
} from '../utils/location-map';

type UseShippingLocationMapLayersOptions = {
  L: typeof import('leaflet') | null;
  map: Leaflet.Map | null;
  isReady: boolean;
  showHeatmap: boolean;
  showHubs: boolean;
  showBoundary: boolean;
  selectedBoundary: BoundaryPreview | null;
  peekBoundary: BoundaryPreview | null;
  origin: Coordinate | null;
  destination: Coordinate | null;
  originLabel: string;
  destinationLabel: string;
  profile: RouteProfile;
  onRouteChange: (route: ShippingRouteResult | null) => void;
  onRoutingChange: (isRouting: boolean) => void;
};

export function useShippingLocationMapLayers({
  L,
  map,
  isReady,
  showHeatmap,
  showHubs,
  showBoundary,
  selectedBoundary,
  peekBoundary,
  origin,
  destination,
  originLabel,
  destinationLabel,
  profile,
  onRouteChange,
  onRoutingChange
}: UseShippingLocationMapLayersOptions) {
  const overlayLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const routeLayerRef = useRef<Leaflet.LayerGroup | null>(null);

  useEffect(() => {
    if (!L || !map || !isReady || !(map as any)._panes) {
      return;
    }

    const group = resetLayerGroup(L, map, overlayLayerRef);

    if (showHeatmap && typeof L.heatLayer === 'function') {
      L.heatLayer(SHIPPING_HEAT_POINTS, {
        radius: 34,
        blur: 24,
        minOpacity: 0.18,
        gradient: {
          0.25: '#22c55e',
          0.55: '#eab308',
          0.85: '#f97316',
          1: '#ef4444'
        }
      }).addTo(group);
    }

    if (showHubs) {
      const cluster = createHubClusterLayer(L);

      SHIPPING_HUBS.forEach((hub) => {
        L.marker(hub.coordinate, {
          icon: createHubIcon(L, { label: hub.name, status: hub.status }),
          zIndexOffset: 260
        })
          .bindPopup(
            createPopupHtml([
              ['Hub', hub.name],
              ['Type', hub.type],
              ['Volume', hub.volume],
              ['Service', hub.serviceLevel]
            ])
          )
          .addTo(cluster);
      });

      cluster.addTo(group);
    }

    if (showBoundary && selectedBoundary) {
      addBoundaryToGroup(L, group, selectedBoundary, {
        color: '#06b6d4',
        weight: 2,
        opacity: 0.92,
        fillColor: '#06b6d4',
        fillOpacity: 0.12,
        className: 'shipping-map-geojson-hoverable'
      });
    }

    if (showBoundary && peekBoundary && peekBoundary.id !== selectedBoundary?.id) {
      addBoundaryToGroup(L, group, peekBoundary, {
        color: '#f59e0b',
        weight: 3,
        opacity: 0.95,
        fillColor: '#f59e0b',
        fillOpacity: 0.16,
        dashArray: '6, 8',
        className: 'shipping-map-geojson-hoverable shipping-map-geojson-peek'
      });

      L.marker(peekBoundary.center, {
        icon: createPulseIcon(L, peekBoundary.label.slice(0, 1).toUpperCase(), 'peek'),
        zIndexOffset: 490
      }).addTo(group);
    }

    if (selectedBoundary) {
      L.marker(selectedBoundary.center, {
        icon: createPulseIcon(L, selectedBoundary.label.slice(0, 1).toUpperCase(), 'selected'),
        zIndexOffset: 500
      })
        .bindPopup(
          createPopupHtml([
            ['Location', selectedBoundary.label],
            ['Source', selectedBoundary.source],
            ['Point', formatCoordinate(selectedBoundary.center)]
          ])
        )
        .addTo(group);
    }
  }, [L, isReady, map, peekBoundary, selectedBoundary, showBoundary, showHeatmap, showHubs]);

  useEffect(() => {
    if (!L || !map || !isReady || !(map as any)._panes) {
      return;
    }

    const group = resetLayerGroup(L, map, routeLayerRef);

    let originMarker: Leaflet.Marker | null = null;
    if (origin) {
      originMarker = L.marker(origin, {
        icon: createPointIcon(L, { label: 'A', tone: 'origin' }),
        zIndexOffset: 700
      })
        .bindPopup(
          createPopupHtml([
            ['Origin', originLabel || 'Origin'],
            ['Point', formatCoordinate(origin)]
          ])
        )
        .addTo(group);
    }

    let destinationMarker: Leaflet.Marker | null = null;
    if (destination) {
      destinationMarker = L.marker(destination, {
        icon: createPointIcon(L, { label: 'B', tone: 'destination' }),
        zIndexOffset: 700
      })
        .bindPopup(
          createPopupHtml([
            ['Destination', destinationLabel || 'Destination'],
            ['Point', formatCoordinate(destination)]
          ])
        )
        .addTo(group);
    }

    if (!origin && !destination) {
      onRouteChange(null);
      onRoutingChange(false);
      return;
    }

    if (!origin || !destination) {
      onRouteChange(null);
      onRoutingChange(false);
      fitMapToCoordinates(L, map, [origin ?? destination!], { maxZoom: 13 });
      return;
    }

    const leaflet = L;
    const leafletMap = map;
    const routeOrigin = origin;
    const routeDestination = destination;
    let isCancelled = false;
    onRoutingChange(true);

    async function drawRoute() {
      const nextRoute = await getRoutePath({
        origin: routeOrigin,
        destination: routeDestination,
        profile
      });

      if (isCancelled) {
        return;
      }

      onRouteChange(nextRoute);
      onRoutingChange(false);

      if (nextRoute.coordinates.length > 0) {
        originMarker?.setLatLng(nextRoute.coordinates[0]);
        destinationMarker?.setLatLng(nextRoute.coordinates[nextRoute.coordinates.length - 1]);
      }

      leaflet
        .polyline(nextRoute.coordinates, {
          color: '#06b6d4',
          weight: 4,
          opacity: 0.94,
          dashArray: '8, 10',
          lineCap: 'round',
          lineJoin: 'round'
        })
        .addTo(group);

      fitMapToCoordinates(leaflet, leafletMap, nextRoute.coordinates, {
        padding: [72, 72],
        maxZoom: 14
      });
    }

    drawRoute();

    return () => {
      isCancelled = true;
    };
  }, [
    L,
    destination,
    destinationLabel,
    isReady,
    map,
    onRouteChange,
    onRoutingChange,
    origin,
    originLabel,
    profile
  ]);
}
