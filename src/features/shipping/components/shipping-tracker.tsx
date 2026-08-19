'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type * as Leaflet from 'leaflet';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { trackerQueryOptions } from '../api/queries';
import { getRoutePath } from '../api/service';
import type { Coordinate, TrackerData } from '../api/types';
import {
  SHIPPING_CONTEXT_LOCATIONS,
  SHIPPING_DEFAULT_CENTER,
  type ShippingTileLayerId
} from '../constants/map';
import { useLeafletMap } from '../hooks/use-leaflet-map';
import { ShippingMapLayerControl } from './shipping-map-layer-control';
import {
  createCitySpotIcon,
  createPointIcon,
  createPopupHtml,
  escapeHtml,
  fitMapToCoordinates,
  formatCoordinate,
  formatRouteDistance,
  resetLayerGroup
} from '../utils/map';

export function ShippingTracker() {
  const queryOptions = useMemo(() => trackerQueryOptions({}), []);
  const { data: response } = useSuspenseQuery(queryOptions);
  const shipments = response.data;
  const [activeShipmentId, setActiveShipmentId] = useState(shipments[0]?.id ?? '');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [routeDistance, setRouteDistance] = useState<string>('Calculating');
  const [progressTick, setProgressTick] = useState(0);
  const [tileLayerId, setTileLayerId] = useState<ShippingTileLayerId>('daylight');
  const routeLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const courierMarkerRef = useRef<Leaflet.Marker | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[] | null>(null);

  const activeShipment = useMemo(
    () => shipments.find((shipment) => shipment.id === activeShipmentId) ?? shipments[0],
    [activeShipmentId, shipments]
  );

  const { containerRef, L, map, isReady } = useLeafletMap({
    center: activeShipment?.koordinat.mulai ?? SHIPPING_DEFAULT_CENTER,
    zoom: 12,
    tileLayerId
  });

  useEffect(() => {
    if (!activeShipmentId && shipments[0]) {
      setActiveShipmentId(shipments[0].id);
    }
  }, [activeShipmentId, shipments]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgressTick((value) => (value + 1) % 1000);
    }, 2500);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (
      !L ||
      !map ||
      !isReady ||
      !activeShipment ||
      !map.getPane('markerPane') ||
      !map.getPane('overlayPane')
    ) {
      return;
    }

    const leaflet = L;
    const leafletMap = map;
    const currentShipment = activeShipment;
    const layerGroup = resetLayerGroup(leaflet, leafletMap, routeLayerRef);
    const start = currentShipment.koordinat.mulai;
    const end = currentShipment.koordinat.akhir;
    let isCancelled = false;

    SHIPPING_CONTEXT_LOCATIONS.forEach((location) => {
      leaflet
        .marker(location.coordinate, {
          icon: createCitySpotIcon(leaflet, { label: location.label, muted: true }),
          interactive: false,
          keyboard: false,
          zIndexOffset: -250
        })
        .addTo(layerGroup);
    });

    const originMarker = leaflet
      .marker(start, {
        icon: createPointIcon(leaflet, { label: 'A', tone: 'origin' }),
        zIndexOffset: 400
      })
      .bindPopup(
        createPopupHtml([
          ['Origin', currentShipment.layanan],
          ['Point', formatCoordinate(start)]
        ])
      )
      .addTo(layerGroup);

    const destinationMarker = leaflet
      .marker(end, {
        icon: createPointIcon(leaflet, { label: 'B', tone: 'destination' }),
        zIndexOffset: 400
      })
      .bindPopup(
        createPopupHtml([
          ['Destination', currentShipment.pelanggan.nama],
          ['Point', formatCoordinate(end)]
        ])
      )
      .addTo(layerGroup);

    async function drawTrackingRoute() {
      setRouteDistance('Calculating');
      const route = await getRoutePath({
        origin: start,
        destination: end,
        profile: 'driving'
      });

      if (isCancelled) {
        return;
      }

      setRouteDistance(formatRouteDistance(route.distanceMeters));

      if (route.coordinates.length > 0) {
        originMarker.setLatLng(route.coordinates[0]);
        destinationMarker.setLatLng(route.coordinates[route.coordinates.length - 1]);
      }

      leaflet
        .polyline(route.coordinates, {
          color: 'var(--primary)',
          weight: 4,
          opacity: 0.92,
          dashArray: '8, 10',
          lineCap: 'round',
          lineJoin: 'round'
        })
        .addTo(layerGroup);

      const courierCoordinate = getRoutePointAtProgress(
        route.coordinates,
        getShipmentProgress(currentShipment, 0)
      );

      courierMarkerRef.current = leaflet
        .marker(courierCoordinate, {
          icon: createCourierIcon(leaflet, currentShipment.kurir.perusahaan),
          zIndexOffset: 1000
        })
        .bindPopup(
          createPopupHtml([
            ['Courier', currentShipment.kurir.nama],
            ['Vehicle', currentShipment.kurir.plat],
            ['Company', currentShipment.kurir.perusahaan]
          ])
        )
        .addTo(layerGroup);

      setRouteCoordinates(route.coordinates);

      fitMapToCoordinates(leaflet, leafletMap, route.coordinates, {
        padding: [72, 72],
        maxZoom: 14
      });
    }

    drawTrackingRoute();

    return () => {
      isCancelled = true;

      if (routeLayerRef.current) {
        routeLayerRef.current.clearLayers();

        if (leafletMap.hasLayer(routeLayerRef.current)) {
          leafletMap.removeLayer(routeLayerRef.current);
        }

        routeLayerRef.current = null;
      }
    };
  }, [L, activeShipment, isReady, map]);

  useEffect(() => {
    if (!courierMarkerRef.current || !routeCoordinates || !activeShipment) {
      return;
    }

    const courierCoordinate = getRoutePointAtProgress(
      routeCoordinates,
      getShipmentProgress(activeShipment, progressTick)
    );

    courierMarkerRef.current.setLatLng(courierCoordinate);
  }, [progressTick, activeShipment, routeCoordinates]);

  if (!activeShipment) {
    return (
      <div className='flex min-h-[600px] items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground'>
        No shipment tracker data available.
      </div>
    );
  }

  const activeMilestone =
    activeShipment.milestone.find((milestone) => milestone.aktif) ??
    activeShipment.milestone.at(-1);

  return (
    <div className='shipping-map-shell relative z-0 min-h-[720px] overflow-hidden rounded-lg border bg-background'>
      <div ref={containerRef} className='absolute inset-0 z-0' />

      <div className='absolute left-3 right-3 top-3 z-40 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex min-w-0 flex-wrap items-center gap-2 rounded-lg border bg-card/95 px-3 py-2 shadow-sm backdrop-blur'>
          <TrackerMetric
            icon={<Icons.calendar />}
            label='Estimasi Tiba'
            value={activeShipment.estimasi}
          />
          <TrackerMetric icon={<Icons.truck />} label='Layanan' value={activeShipment.layanan} />
          <TrackerMetric icon={<Icons.road />} label='Jarak' value={routeDistance} />
        </div>

        <div className='flex items-center gap-2 rounded-lg border bg-card/95 p-2 shadow-sm backdrop-blur'>
          <ShippingMapLayerControl
            tileLayerId={tileLayerId}
            onTileLayerChange={setTileLayerId}
            showLabel={false}
          />
          <Select value={activeShipment.id} onValueChange={setActiveShipmentId}>
            <SelectTrigger className='w-[260px] bg-background/80'>
              <SelectValue placeholder='Select tracking ID' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {shipments.map((shipment) => (
                  <SelectItem key={shipment.id} value={shipment.id}>
                    {shipment.id} · {shipment.pelanggan.nama}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            type='button'
            variant='outline'
            size='icon'
            aria-label={isPanelOpen ? 'Hide tracker details' : 'Show tracker details'}
            onClick={() => setIsPanelOpen((value) => !value)}
          >
            {isPanelOpen ? <Icons.chevronLeft /> : <Icons.chevronRight />}
          </Button>
        </div>
      </div>

      {isPanelOpen && (
        <Card className='absolute bottom-3 left-3 top-20 z-30 flex w-[calc(100%-1.5rem)] max-w-[380px] flex-col overflow-hidden border bg-card/95 shadow-lg backdrop-blur'>
          <CardHeader className='border-b px-4 py-3'>
            <div className='flex items-center justify-between gap-3'>
              <div className='min-w-0'>
                <CardTitle className='truncate text-base'>Detail Pengiriman</CardTitle>
                <p className='text-xs text-muted-foreground'>{activeShipment.id}</p>
              </div>
              <Badge variant='secondary'>{activeMilestone?.status ?? 'Tracking'}</Badge>
            </div>
          </CardHeader>

          <CardContent className='min-h-0 flex-1 p-0'>
            <ScrollArea className='h-full'>
              <div className='flex flex-col gap-4 p-4'>
                <div className='flex items-center gap-3'>
                  <Avatar className='size-11 rounded-md border'>
                    <AvatarImage
                      src={activeShipment.pelanggan.foto}
                      alt={activeShipment.pelanggan.nama}
                      className='object-cover'
                    />
                    <AvatarFallback>{createInitials(activeShipment.pelanggan.nama)}</AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold'>
                      {activeShipment.pelanggan.nama}
                    </p>
                    <p className='text-xs text-muted-foreground'>{activeShipment.pelanggan.id}</p>
                  </div>
                </div>

                <div className='rounded-lg border bg-muted/40 p-3'>
                  <p className='mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                    Alamat Tujuan
                  </p>
                  <p className='text-sm font-medium leading-relaxed'>
                    {activeShipment.pelanggan.alamat}
                  </p>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <ShipmentStat label='Kurir' value={activeShipment.kurir.nama} />
                  <ShipmentStat label='Plat' value={activeShipment.kurir.plat} />
                  <ShipmentStat label='Perusahaan' value={activeShipment.kurir.perusahaan} />
                  <ShipmentStat
                    label='Progress'
                    value={`${Math.round(getShipmentProgress(activeShipment, progressTick) * 100)}%`}
                  />
                </div>

                <div className='rounded-lg border p-4'>
                  <div className='mb-4 flex items-center justify-between gap-3'>
                    <p className='text-sm font-semibold'>Riwayat Pelacakan</p>
                    <Badge variant='outline'>{activeShipment.milestone.length} step</Badge>
                  </div>
                  <div className='relative pl-2'>
                    <div className='absolute bottom-4 left-[13px] top-2 w-px bg-border' />
                    <div className='flex flex-col gap-5'>
                      {activeShipment.milestone.map((milestone) => (
                        <div key={milestone.id} className='relative pl-8'>
                          <div className='absolute left-0 top-0.5 bg-card'>
                            {milestone.aktif ? (
                              <span className='flex size-4 items-center justify-center rounded-full border-2 border-primary bg-card'>
                                <span className='size-1.5 rounded-full bg-primary' />
                              </span>
                            ) : milestone.selesai ? (
                              <Icons.circleCheck className='text-primary' />
                            ) : (
                              <Icons.circle className='text-muted-foreground' />
                            )}
                          </div>
                          <div className='min-w-0'>
                            <div className='flex items-start justify-between gap-3'>
                              <p
                                className={cn(
                                  'text-sm font-semibold',
                                  !milestone.aktif && 'text-muted-foreground'
                                )}
                              >
                                {milestone.status}
                              </p>
                              <span className='shrink-0 text-xs text-muted-foreground'>
                                {milestone.waktu.split(' ')[1] ?? milestone.waktu}
                              </span>
                            </div>
                            <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                              {milestone.deskripsi}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TrackerMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className='flex min-w-0 items-center gap-2 border-border pr-3 last:pr-0 md:border-r md:last:border-r-0'>
      <div className='text-muted-foreground'>{icon}</div>
      <div className='min-w-0'>
        <p className='text-[11px] font-medium text-muted-foreground'>{label}</p>
        <p className='truncate text-xs font-semibold'>{value}</p>
      </div>
    </div>
  );
}

function ShipmentStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0 rounded-md bg-muted/50 p-3'>
      <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
        {label}
      </p>
      <p className='truncate text-sm font-semibold' title={value}>
        {value}
      </p>
    </div>
  );
}

function createCourierIcon(L: typeof import('leaflet'), company: string): Leaflet.DivIcon {
  return L.divIcon({
    className: 'shipping-map-div-icon',
    html: `
      <div class="shipping-map-courier-marker">
        <span class="shipping-map-courier-badge">${escapeHtml(company)}</span>
        <span class="shipping-map-courier-dot">T</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

function getShipmentProgress(shipment: TrackerData, tick = 0): number {
  if (typeof shipment.progress === 'number') {
    return Math.min(Math.max(shipment.progress + (tick % 8) * 0.008, 0.12), 0.96);
  }

  const activeIndex = shipment.milestone.findIndex((milestone) => milestone.aktif);
  const completedCount = shipment.milestone.filter((milestone) => milestone.selesai).length;
  const rawProgress =
    activeIndex >= 0
      ? (activeIndex + 0.45) / shipment.milestone.length
      : completedCount / shipment.milestone.length;

  return Math.min(Math.max(rawProgress, 0.12), 0.96);
}

function getRoutePointAtProgress(coordinates: Coordinate[], progress: number): Coordinate {
  if (coordinates.length === 0) {
    return SHIPPING_DEFAULT_CENTER;
  }

  if (coordinates.length === 1) {
    return coordinates[0];
  }

  const segmentLengths = coordinates
    .slice(1)
    .map((coordinate, index) => calculateFlatDistance(coordinates[index], coordinate));
  const totalLength = segmentLengths.reduce((total, segmentLength) => total + segmentLength, 0);
  const targetDistance = totalLength * progress;
  let traversedDistance = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index];

    if (traversedDistance + segmentLength >= targetDistance) {
      const segmentProgress = (targetDistance - traversedDistance) / segmentLength;
      const start = coordinates[index];
      const end = coordinates[index + 1];

      return [
        start[0] + (end[0] - start[0]) * segmentProgress,
        start[1] + (end[1] - start[1]) * segmentProgress
      ];
    }

    traversedDistance += segmentLength;
  }

  return coordinates[coordinates.length - 1];
}

function calculateFlatDistance(start: Coordinate, end: Coordinate): number {
  const latitudeDelta = end[0] - start[0];
  const longitudeDelta = end[1] - start[1];

  return Math.sqrt(latitudeDelta * latitudeDelta + longitudeDelta * longitudeDelta);
}

function createInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
