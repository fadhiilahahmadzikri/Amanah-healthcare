'use client';

import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Icons } from '@/components/icons';
import { getQueryClient } from '@/lib/query-client';
import { cn } from '@/lib/utils';
import { deleteShippingMutation } from '../api/mutations';
import { onboardingQueryOptions, shippingKeys } from '../api/queries';
import { getRoutePath } from '../api/service';
import type { Coordinate, OnboardingData, ShippingFilters } from '../api/types';
import {
  SHIPPING_CONTEXT_LOCATIONS,
  SHIPPING_DEFAULT_CENTER,
  type ShippingTileLayerId
} from '../constants/map';
import { useLeafletMap } from '../hooks/use-leaflet-map';
import { ShippingLabelSheet } from '../labels/shipping-label-sheet';
import { ShippingMapLayerControl } from './shipping-map-layer-control';
import {
  createCitySpotIcon,
  createPointIcon,
  createPopupHtml,
  createPulseIcon,
  fitMapToCoordinates,
  formatCoordinate,
  formatRouteDistance,
  resetLayerGroup
} from '../utils/map';

const STATUS_FILTERS = ['Packed', 'Shipping', 'Completed'] as const;

type OnboardingStatus = OnboardingData['status'];
type PointTone = 'origin' | 'destination' | 'hub' | 'muted';
type PulseTone = 'origin' | 'destination' | 'hub' | 'peek' | 'selected';

type OnboardingStatusPresentation = {
  title: string;
  shortLabel: string;
  description: string;
  stageLabel: string;
  progress: number;
  routeColor: string;
  routeOpacity: number;
  routeDashArray?: string;
  originTone: PointTone;
  destinationTone: PointTone;
  markerLabel: string;
  markerTone: PulseTone;
  markerProgress: number;
  badgeClassName: string;
  panelClassName: string;
  iconClassName: string;
  progressClassName: string;
  icon: typeof Icons.package;
};

const ONBOARDING_STATUS_PRESENTATION: Record<OnboardingStatus, OnboardingStatusPresentation> = {
  Packed: {
    title: 'Packed at origin',
    shortLabel: 'Packed',
    description: 'The package is still staged at the merchant location before courier pickup.',
    stageLabel: 'Merchant hold',
    progress: 28,
    routeColor: 'var(--chart-4, #f59e0b)',
    routeOpacity: 0.56,
    routeDashArray: '2, 10',
    originTone: 'hub',
    destinationTone: 'muted',
    markerLabel: 'P',
    markerTone: 'peek',
    markerProgress: 0.02,
    badgeClassName: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    panelClassName: 'border-amber-500/25 bg-amber-500/10',
    iconClassName: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    progressClassName: 'bg-amber-500',
    icon: Icons.package
  },
  Shipping: {
    title: 'Courier in transit',
    shortLabel: 'Shipped',
    description: 'The courier has left the origin and is moving toward the receiver.',
    stageLabel: 'In transit',
    progress: 64,
    routeColor: 'var(--primary)',
    routeOpacity: 0.92,
    routeDashArray: '8, 10',
    originTone: 'origin',
    destinationTone: 'destination',
    markerLabel: 'T',
    markerTone: 'selected',
    markerProgress: 0.58,
    badgeClassName: 'border-primary/30 bg-primary/10 text-primary',
    panelClassName: 'border-primary/25 bg-primary/10',
    iconClassName: 'bg-primary/15 text-primary',
    progressClassName: 'bg-primary',
    icon: Icons.truck
  },
  Completed: {
    title: 'Delivery completed',
    shortLabel: 'Done',
    description: 'The package has reached the receiver and the route is closed.',
    stageLabel: 'Delivered',
    progress: 100,
    routeColor: 'var(--chart-2, #22c55e)',
    routeOpacity: 0.86,
    originTone: 'origin',
    destinationTone: 'hub',
    markerLabel: 'C',
    markerTone: 'origin',
    markerProgress: 1,
    badgeClassName:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    panelClassName: 'border-emerald-500/25 bg-emerald-500/10',
    iconClassName: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    progressClassName: 'bg-emerald-500',
    icon: Icons.circleCheck
  }
};

export function ShippingOnboarding({ initialFilters = {} }: { initialFilters?: ShippingFilters }) {
  const router = useRouter();
  const queryClient = getQueryClient();
  const routeLayerRef = useRef<Leaflet.LayerGroup | null>(null);

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(initialFilters.page ?? 1),
    limit: parseAsInteger.withDefault(initialFilters.limit ?? 10),
    search: parseAsString.withDefault(initialFilters.search ?? ''),
    status: parseAsString.withDefault(initialFilters.status ?? 'Shipping')
  });

  const filters = {
    page: params.page,
    limit: params.limit,
    ...(params.search && { search: params.search }),
    ...(params.status && { status: params.status })
  };

  const { data: response } = useSuspenseQuery(onboardingQueryOptions(filters));
  const deliveryData = response.data;
  const totalRecords = response.total_records;
  const totalPages = Math.ceil(totalRecords / params.limit);
  const [selectedOrder, setSelectedOrder] = useState<OnboardingData | null>(
    deliveryData[0] ?? null
  );
  const [labelRecord, setLabelRecord] = useState<OnboardingData | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [tileLayerId, setTileLayerId] = useState<ShippingTileLayerId>('daylight');

  const { containerRef, L, map, isReady } = useLeafletMap({
    center: selectedOrder?.startCoord ?? SHIPPING_DEFAULT_CENTER,
    zoom: 12,
    tileLayerId
  });

  const deleteMutation = useMutation({
    ...deleteShippingMutation,
    onSuccess: () => {
      toast.success('Shipping record deleted');
      queryClient.invalidateQueries({ queryKey: shippingKeys.all });
    },
    onError: () => {
      toast.error('Failed to delete shipping record');
    }
  });

  useEffect(() => {
    if (deliveryData.length === 0) {
      setSelectedOrder(null);
      return;
    }

    if (!selectedOrder || !deliveryData.some((order) => order.id === selectedOrder.id)) {
      setSelectedOrder(deliveryData[0]);
    }
  }, [deliveryData, selectedOrder]);

  useEffect(() => {
    if (
      !L ||
      !map ||
      !isReady ||
      !selectedOrder ||
      !map.getPane('markerPane') ||
      !map.getPane('overlayPane')
    ) {
      return;
    }

    const leaflet = L;
    const leafletMap = map;
    const currentOrder = selectedOrder;
    const presentation = getOnboardingStatusPresentation(currentOrder.status);
    const layerGroup = resetLayerGroup(leaflet, leafletMap, routeLayerRef);

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
      .marker(currentOrder.startCoord, {
        icon: createPointIcon(leaflet, { label: 'A', tone: presentation.originTone }),
        zIndexOffset: 420
      })
      .bindPopup(
        createPopupHtml([
          ['Origin', currentOrder.orderId],
          ['Point', formatCoordinate(currentOrder.startCoord)]
        ])
      )
      .addTo(layerGroup);

    const destinationMarker = leaflet
      .marker(currentOrder.endCoord, {
        icon: createPointIcon(leaflet, { label: 'B', tone: presentation.destinationTone }),
        zIndexOffset: 420
      })
      .bindPopup(
        createPopupHtml([
          ['Destination', currentOrder.customer],
          ['Point', formatCoordinate(currentOrder.endCoord)]
        ])
      )
      .addTo(layerGroup);

    let isCancelled = false;

    async function drawRoute() {
      const route = await getRoutePath({
        origin: currentOrder.startCoord,
        destination: currentOrder.endCoord,
        profile: 'driving'
      });

      if (isCancelled) {
        return;
      }

      if (route.coordinates.length > 0) {
        originMarker.setLatLng(route.coordinates[0]);
        destinationMarker.setLatLng(route.coordinates[route.coordinates.length - 1]);
      }

      leaflet
        .polyline(route.coordinates, {
          color: presentation.routeColor,
          weight: currentOrder.status === 'Packed' ? 3 : 4,
          opacity: presentation.routeOpacity,
          dashArray: presentation.routeDashArray,
          lineCap: 'round',
          lineJoin: 'round'
        })
        .addTo(layerGroup);

      const statusMarkerCoordinate = getRouteCoordinateAtProgress(
        route.coordinates,
        presentation.markerProgress
      );

      leaflet
        .marker(statusMarkerCoordinate, {
          icon: createPulseIcon(leaflet, presentation.markerLabel, presentation.markerTone),
          zIndexOffset: 900
        })
        .bindPopup(
          createPopupHtml([
            ['Stage', presentation.title],
            ['Order', currentOrder.orderId]
          ])
        )
        .addTo(layerGroup);

      fitMapToCoordinates(leaflet, leafletMap, route.coordinates, {
        padding: [56, 56],
        maxZoom: 14
      });
    }

    drawRoute();

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
  }, [L, isReady, map, selectedOrder]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return;
    }

    await deleteMutation.mutateAsync(id);

    if (selectedOrder?.id === id) {
      setSelectedOrder(null);
    }
  };

  const handleTabChange = (status: string) => {
    setParams({ status, page: 1, search: '' });
  };

  const activeStatus = normalizeOnboardingStatus(params.status);
  const activeStatusPresentation = getOnboardingStatusPresentation(activeStatus);
  const selectedOrderPresentation = selectedOrder
    ? getOnboardingStatusPresentation(selectedOrder.status)
    : null;

  return (
    <div className='flex min-h-0 w-full flex-1 flex-col text-foreground'>
      <ShippingLabelSheet open={isLabelOpen} onOpenChange={setIsLabelOpen} record={labelRecord} />
      <div className='mb-6 flex flex-col justify-end gap-4 md:flex-row md:items-center'>
        <div className='flex w-full flex-wrap items-center justify-end gap-3 md:w-auto'>
          <div className='relative min-w-[220px] flex-1 md:flex-none'>
            <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={params.search ?? ''}
              onChange={(event) => setParams({ search: event.target.value, page: 1 })}
              placeholder='Search orders'
              className='md:w-[260px] pl-9'
            />
          </div>

          <ToggleGroup
            type='single'
            value={params.status}
            onValueChange={(value) => {
              if (value) {
                handleTabChange(value);
              }
            }}
            variant='outline'
            className='grid w-full grid-cols-3 md:w-auto'
          >
            {STATUS_FILTERS.map((status) => (
              <ToggleGroupItem
                key={status}
                value={status}
                className='text-xs font-medium data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm'
              >
                {status}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <Button asChild>
            <Link href='/dashboard/shipping/onboarding/new'>
              <Icons.add />
              Add New
            </Link>
          </Button>
        </div>
      </div>

      <div className='grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12'>
        <div className='flex h-[calc(100vh-220px)] min-h-[520px] flex-col overflow-hidden rounded-lg border bg-card shadow-sm lg:col-span-4'>
          <div className='flex items-center justify-between border-b bg-muted/30 p-4'>
            <span className='text-sm font-medium'>Orders ({totalRecords})</span>
            <Badge
              variant='outline'
              className={cn('shrink-0', activeStatusPresentation.badgeClassName)}
            >
              {activeStatus}
            </Badge>
          </div>
          <ScrollArea className='min-h-0 flex-1'>
            <div className='grid gap-2 p-3'>
              {deliveryData.length > 0 ? (
                deliveryData.map((item) => (
                  <OrderCard
                    key={item.id}
                    item={item}
                    isActive={selectedOrder?.id === item.id}
                    onClick={() => setSelectedOrder(item)}
                    onDelete={handleDelete}
                    onEdit={(id) => router.push(`/dashboard/shipping/onboarding/${id}`)}
                  />
                ))
              ) : (
                <div className='flex min-h-[300px] flex-col items-center justify-center rounded-md border border-dashed text-muted-foreground'>
                  <Icons.packageX className='mb-3' />
                  <p className='text-sm'>No orders found for this status.</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {totalPages > 1 && (
            <div className='border-t bg-muted/30 p-3'>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setParams({ page: Math.max(1, params.page - 1) })}
                      className={cn(
                        params.page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      )}
                    />
                  </PaginationItem>
                  <span className='px-2 text-xs font-medium'>
                    Page {params.page} of {totalPages}
                  </span>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setParams({ page: Math.min(totalPages, params.page + 1) })}
                      className={cn(
                        params.page >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>

        <div className='flex min-h-[520px] flex-col gap-6 lg:h-[min(720px,calc(100vh-220px))] lg:col-span-8'>
          {selectedOrder && selectedOrderPresentation ? (
            <>
              <div className='shipping-map-shell relative min-h-[360px] flex-1 overflow-hidden rounded-lg border bg-muted/50 shadow-sm'>
                <div ref={containerRef} className='absolute inset-0 z-0' />
                <div className='absolute left-3 top-3 z-30 rounded-md border bg-card/90 px-3 py-2 text-xs shadow-sm backdrop-blur'>
                  <p className='font-semibold'>{selectedOrderPresentation.title}</p>
                  <p className='text-muted-foreground'>{selectedOrder.orderId} route preview</p>
                </div>
                <div className='absolute right-3 top-3 z-30 rounded-lg border bg-card/95 p-2 shadow-sm backdrop-blur'>
                  <ShippingMapLayerControl
                    tileLayerId={tileLayerId}
                    onTileLayerChange={setTileLayerId}
                  />
                </div>
              </div>

              <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
                <div className='mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-4'>
                  <div>
                    <h3 className='text-sm font-semibold'>Order Details</h3>
                    <p className='text-xs text-muted-foreground'>{selectedOrder.address}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className={cn('shrink-0', selectedOrderPresentation.badgeClassName)}
                    >
                      {selectedOrder.status}
                    </Badge>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setLabelRecord(selectedOrder);
                        setIsLabelOpen(true);
                      }}
                    >
                      <Icons.receipt />
                      Generate Resi
                    </Button>
                  </div>
                </div>

                <StatusPhaseCard presentation={selectedOrderPresentation} />

                <div className='grid grid-cols-2 gap-6 md:grid-cols-4'>
                  <DetailStat label='Order ID' value={selectedOrder.orderId} />
                  <DetailStat label='Customer' value={selectedOrder.customer} />
                  <DetailStat label='Product' value={selectedOrder.product} />
                  <DetailStat label='Price' value={selectedOrder.price} />
                  <DetailStat label='Origin' value={formatCoordinate(selectedOrder.startCoord)} />
                  <DetailStat
                    label='Destination'
                    value={formatCoordinate(selectedOrder.endCoord)}
                  />
                  <DetailStat
                    label='Direct distance'
                    value={formatRouteDistance(
                      map ? map.distance(selectedOrder.startCoord, selectedOrder.endCoord) : 0
                    )}
                  />
                  <DetailStat label='Status' value={selectedOrder.status} />
                </div>
              </div>
            </>
          ) : (
            <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground'>
              Select an order from the list to view routing details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPhaseCard({ presentation }: { presentation: OnboardingStatusPresentation }) {
  const StatusIcon = presentation.icon;

  return (
    <div className={cn('mb-6 rounded-lg border p-4', presentation.panelClassName)}>
      <div className='flex items-start gap-3'>
        <span
          className={cn(
            'grid size-10 shrink-0 place-items-center rounded-md',
            presentation.iconClassName
          )}
        >
          <StatusIcon className='size-5' />
        </span>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <p className='text-sm font-semibold'>{presentation.title}</p>
            <span className='text-xs font-medium text-muted-foreground'>
              {presentation.progress}%
            </span>
          </div>
          <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
            {presentation.description}
          </p>
          <div className='mt-3 h-2 overflow-hidden rounded-full bg-background/70'>
            <div
              className={cn('h-full rounded-full', presentation.progressClassName)}
              style={{ width: `${presentation.progress}%` }}
            />
          </div>
          <p className='mt-2 text-xs font-medium text-muted-foreground'>
            {presentation.stageLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  item,
  isActive,
  onClick,
  onEdit,
  onDelete
}: {
  item: OnboardingData;
  isActive: boolean;
  onClick: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const presentation = getOnboardingStatusPresentation(item.status);

  return (
    <div
      className={cn(
        'relative rounded-lg border transition-colors',
        isActive ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted'
      )}
    >
      <button
        type='button'
        className='flex w-full items-start gap-4 p-4 pr-12 text-left'
        onClick={onClick}
      >
        <Avatar className='size-12 border border-border'>
          <AvatarImage src={item.image} alt={item.customer} className='object-cover' />
          <AvatarFallback className='bg-muted text-sm font-semibold text-muted-foreground'>
            {createInitials(item.customer)}
          </AvatarFallback>
        </Avatar>
        <span className='min-w-0 flex-1'>
          <span className='mb-1 flex items-start justify-between gap-3'>
            <span className='truncate text-sm font-medium leading-none'>{item.customer}</span>
            <span className='shrink-0 text-xs font-semibold'>{item.price}</span>
          </span>
          <span className='block text-xs text-muted-foreground'>
            {item.orderId} · {item.product}
          </span>
          <span className='mt-1 block truncate text-xs text-muted-foreground'>{item.address}</span>
          <span className='mt-2 flex items-center gap-2'>
            <Badge
              variant='outline'
              className={cn('h-5 px-1.5 text-[10px]', presentation.badgeClassName)}
            >
              {presentation.shortLabel}
            </Badge>
            <span className='truncate text-[11px] text-muted-foreground'>
              {presentation.stageLabel}
            </span>
          </span>
        </span>
      </button>

      <div className='absolute right-2 top-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' aria-label='Order actions'>
              <Icons.moreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onEdit(item.id)}>
              <Icons.edit />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className='text-destructive' onClick={() => onDelete(item.id)}>
              <Icons.trash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function getOnboardingStatusPresentation(status: OnboardingStatus): OnboardingStatusPresentation {
  return ONBOARDING_STATUS_PRESENTATION[status];
}

function normalizeOnboardingStatus(status: string): OnboardingStatus {
  return STATUS_FILTERS.includes(status as OnboardingStatus)
    ? (status as OnboardingStatus)
    : 'Shipping';
}

function getRouteCoordinateAtProgress(coordinates: Coordinate[], progress: number): Coordinate {
  if (coordinates.length === 0) {
    return SHIPPING_DEFAULT_CENTER;
  }

  const boundedProgress = Math.min(Math.max(progress, 0), 1);
  const index = Math.round((coordinates.length - 1) * boundedProgress);

  return coordinates[index] ?? coordinates[coordinates.length - 1];
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0'>
      <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>{label}</p>
      <p className='truncate text-sm font-medium' title={value}>
        {value}
      </p>
    </div>
  );
}

function createInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
