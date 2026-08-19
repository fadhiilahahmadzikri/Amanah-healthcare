'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import type { Coordinate } from '../api/types';
import type { ShippingTileLayerId } from '../constants/map';
import { SHIPPING_DEFAULT_CENTER, SHIPPING_DEFAULT_ZOOM } from '../constants/map';
import { getTileLayerConfig, type LeafletModule } from '../utils/map';

type UseLeafletMapOptions = {
  center?: Coordinate;
  zoom?: number;
  tileLayerId: ShippingTileLayerId;
  onMapClick?: (coordinate: Coordinate) => void;
};

type LeafletRuntime = {
  L: LeafletModule;
  map: Leaflet.Map;
};

export function useLeafletMap({
  center = SHIPPING_DEFAULT_CENTER,
  zoom = SHIPPING_DEFAULT_ZOOM,
  tileLayerId,
  onMapClick
}: UseLeafletMapOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const tileLayerRef = useRef<Leaflet.TileLayer | null>(null);
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);
  const initialTileLayerIdRef = useRef(tileLayerId);
  const [runtime, setRuntime] = useState<LeafletRuntime | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeMap() {
      const leafletModule = await import('leaflet');
      const L = leafletModule.default;
      await Promise.all([import('leaflet.markercluster'), import('leaflet.heat')]);

      // Fix Leaflet's default icon path issues with Next.js/bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });

      if (!isMounted || !containerRef.current || mapRef.current) {
        return;
      }

      const tileLayerConfig = getTileLayerConfig(initialTileLayerIdRef.current);
      const map = L.map(containerRef.current, {
        center: initialCenterRef.current,
        zoom: initialZoomRef.current,
        zoomControl: false,
        attributionControl: false
      });

      tileLayerRef.current = L.tileLayer(tileLayerConfig.url, {
        attribution: tileLayerConfig.attribution,
        maxZoom: tileLayerConfig.maxZoom
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapRef.current = map;
      setRuntime({ L, map });

      window.setTimeout(() => map.invalidateSize(), 0);
      window.setTimeout(() => map.invalidateSize({ pan: false }), 250);
    }

    initializeMap();

    return () => {
      isMounted = false;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      setRuntime(null);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const map = mapRef.current;

    if (!container || !map || typeof ResizeObserver === 'undefined') {
      return;
    }

    let frameId: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
      });
    });

    resizeObserver.observe(container);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
    };
  }, [runtime]);

  useEffect(() => {
    const tileLayer = tileLayerRef.current;

    if (!tileLayer) {
      return;
    }

    const tileLayerConfig = getTileLayerConfig(tileLayerId);
    tileLayer.setUrl(tileLayerConfig.url);
    tileLayer.options.attribution = tileLayerConfig.attribution;
    tileLayer.options.maxZoom = tileLayerConfig.maxZoom;
  }, [tileLayerId]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !onMapClick) {
      return;
    }

    const handleClick = (event: Leaflet.LeafletMouseEvent) => {
      onMapClick([event.latlng.lat, event.latlng.lng]);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [runtime, onMapClick]);

  return {
    containerRef,
    L: runtime?.L ?? null,
    map: runtime?.map ?? null,
    isReady: Boolean(
      runtime?.L &&
      runtime.map &&
      runtime.map.getContainer().isConnected &&
      runtime.map.getPane('markerPane') &&
      runtime.map.getPane('overlayPane')
    )
  };
}
