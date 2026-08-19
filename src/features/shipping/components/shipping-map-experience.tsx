'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type * as Leaflet from 'leaflet';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { geocodeLocation, getRoutePath } from '../api/service';
import type {
  BoundaryLocation,
  Coordinate,
  RouteProfile,
  ShippingPointOfInterest,
  ShippingRouteResult,
  TrackerData
} from '../api/types';
import {
  LOCATION_TREE,
  ROUTE_PROFILES,
  SHIPPING_HEAT_POINTS,
  SHIPPING_HUBS,
  SHIPPING_POIS,
  SHIPPING_TILE_LAYERS,
  type ShippingTileLayerId
} from '../constants/map';
import { useLeafletMap } from '../hooks/use-leaflet-map';
import {
  createHubIcon,
  createPointIcon,
  createPopupHtml,
  createPulseIcon,
  fitMapToCoordinates,
  formatCoordinate,
  formatRouteDistance,
  formatRouteDuration,
  getProfileLabel,
  resetLayerGroup
} from '../utils/map';

type ShippingMapExperienceProps = {
  shipments: TrackerData[];
};

type MapTab = 'explore' | 'routing';

type RoutePoint = {
  label: string;
  coordinate: Coordinate;
  source: 'shipment' | 'search' | 'map';
};

type RoutingSearchTarget = 'origin' | 'destination';

type MapLocation = BoundaryLocation | ShippingPointOfInterest;

const DEFAULT_COUNTRY_ID = LOCATION_TREE[0]?.id ?? '';
const DEFAULT_STATE_ID = LOCATION_TREE[0]?.states[0]?.id ?? '';
const DEFAULT_CITY_ID = LOCATION_TREE[0]?.states[0]?.cities[0]?.id ?? '';

export function ShippingMapExperience({ shipments }: ShippingMapExperienceProps) {
  const [activeTab, setActiveTab] = useState<MapTab>('explore');
  const [tileLayerId, setTileLayerId] = useState<ShippingTileLayerId>('midnight');
  const [showHubs, setShowHubs] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [countryId, setCountryId] = useState(DEFAULT_COUNTRY_ID);
  const [stateId, setStateId] = useState(DEFAULT_STATE_ID);
  const [cityId, setCityId] = useState(DEFAULT_CITY_ID);
  const [poiSearch, setPoiSearch] = useState('');
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    LOCATION_TREE[0]?.states[0]?.cities[0] ?? null
  );
  const [origin, setOrigin] = useState<RoutePoint | null>(null);
  const [destination, setDestination] = useState<RoutePoint | null>(null);
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [profile, setProfile] = useState<RouteProfile>('driving');
  const [pickTarget, setPickTarget] = useState<RoutingSearchTarget | null>(null);
  const [searchingTarget, setSearchingTarget] = useState<RoutingSearchTarget | null>(null);
  const [route, setRoute] = useState<ShippingRouteResult | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const overlayLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const routeLayerRef = useRef<Leaflet.LayerGroup | null>(null);

  const handleMapClick = useCallback(
    (coordinate: Coordinate) => {
      if (activeTab !== 'routing' || !pickTarget) {
        return;
      }

      const point: RoutePoint = {
        label: pickTarget === 'origin' ? 'Map origin' : 'Map destination',
        coordinate,
        source: 'map'
      };

      if (pickTarget === 'origin') {
        setOrigin(point);
        setOriginQuery(formatCoordinate(coordinate));
        setPickTarget('destination');
      } else {
        setDestination(point);
        setDestinationQuery(formatCoordinate(coordinate));
        setPickTarget(null);
      }

      setRoute(null);
    },
    [activeTab, pickTarget]
  );

  const { containerRef, L, map, isReady } = useLeafletMap({
    tileLayerId,
    onMapClick: handleMapClick
  });

  const activeCountry = useMemo(
    () => LOCATION_TREE.find((country) => country.id === countryId) ?? LOCATION_TREE[0],
    [countryId]
  );

  const activeState = useMemo(
    () => activeCountry?.states.find((state) => state.id === stateId) ?? activeCountry?.states[0],
    [activeCountry, stateId]
  );

  const activeCity = useMemo(
    () => activeState?.cities.find((city) => city.id === cityId) ?? activeState?.cities[0],
    [activeState, cityId]
  );

  const filteredPois = useMemo(() => {
    const normalizedSearch = poiSearch.trim().toLowerCase();

    return SHIPPING_POIS.filter((poi) => {
      const isInSelectedRegion =
        poi.countryId === countryId && (!stateId || poi.stateId === stateId);
      const matchesSearch =
        !normalizedSearch ||
        poi.label.toLowerCase().includes(normalizedSearch) ||
        poi.kind.toLowerCase().includes(normalizedSearch);

      return isInSelectedRegion && matchesSearch;
    });
  }, [countryId, poiSearch, stateId]);

  const shipmentContext = shipments[0];

  useEffect(() => {
    if (!activeCountry?.states.some((state) => state.id === stateId)) {
      setStateId(activeCountry?.states[0]?.id ?? '');
    }
  }, [activeCountry, stateId]);

  useEffect(() => {
    if (!activeState?.cities.some((city) => city.id === cityId)) {
      setCityId(activeState?.cities[0]?.id ?? '');
    }
  }, [activeState, cityId]);

  useEffect(() => {
    if (activeCity) {
      setSelectedLocation(activeCity);
    }
  }, [activeCity]);

  useEffect(() => {
    if (!shipmentContext || origin || destination) {
      return;
    }

    setOrigin({
      label: `${shipmentContext.id} origin`,
      coordinate: shipmentContext.koordinat.mulai,
      source: 'shipment'
    });
    setDestination({
      label: shipmentContext.pelanggan.nama,
      coordinate: shipmentContext.koordinat.akhir,
      source: 'shipment'
    });
    setOriginQuery(formatCoordinate(shipmentContext.koordinat.mulai));
    setDestinationQuery(shipmentContext.pelanggan.alamat);
  }, [destination, origin, shipmentContext]);

  useEffect(() => {
    if (!map || !L || !isReady) {
      return;
    }

    const layerGroup = resetLayerGroup(L, map, overlayLayerRef);

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
      }).addTo(layerGroup);
    }

    if (showBoundary && selectedLocation) {
      L.polygon(selectedLocation.boundary, {
        color: '#2563eb',
        weight: 2,
        opacity: 0.9,
        fillColor: '#2563eb',
        fillOpacity: 0.12
      }).addTo(layerGroup);
    }

    if (showBoundary && hoveredLocation && hoveredLocation.id !== selectedLocation?.id) {
      L.polygon(hoveredLocation.boundary, {
        color: '#f97316',
        weight: 2,
        opacity: 0.9,
        dashArray: '6, 8',
        fillColor: '#f97316',
        fillOpacity: 0.1
      }).addTo(layerGroup);
    }

    if (selectedLocation) {
      L.marker(selectedLocation.center, {
        icon: createPulseIcon(L, selectedLocation.label.slice(0, 1))
      })
        .bindPopup(
          createPopupHtml([
            ['Location', selectedLocation.label],
            ['Orders', selectedLocation.intelligence.dailyOrders.toLocaleString()],
            ['Transit', selectedLocation.intelligence.avgTransitTime]
          ])
        )
        .addTo(layerGroup);
    }

    if (showHubs) {
      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true
      });

      SHIPPING_HUBS.forEach((hub) => {
        L.marker(hub.coordinate, {
          icon: createHubIcon(L, { label: hub.name, status: hub.status })
        })
          .bindPopup(
            createPopupHtml([
              ['Hub', hub.name],
              ['Type', hub.type],
              ['Volume', hub.volume],
              ['SLA', hub.serviceLevel],
              ['Status', hub.status]
            ])
          )
          .addTo(clusterGroup);
      });

      layerGroup.addLayer(clusterGroup);
    }

    if (activeTab === 'explore' && selectedLocation) {
      fitMapToCoordinates(L, map, selectedLocation.boundary, {
        padding: [72, 72],
        maxZoom: 12
      });
    }
  }, [
    L,
    activeTab,
    hoveredLocation,
    isReady,
    map,
    selectedLocation,
    showBoundary,
    showHeatmap,
    showHubs
  ]);

  useEffect(() => {
    if (!map || !L || !isReady) {
      return;
    }

    const layerGroup = resetLayerGroup(L, map, routeLayerRef);

    if (activeTab !== 'routing') {
      return;
    }

    if (origin) {
      L.marker(origin.coordinate, {
        icon: createPointIcon(L, { label: 'A', tone: 'origin' }),
        zIndexOffset: 500
      })
        .bindPopup(
          createPopupHtml([
            ['Origin', origin.label],
            ['Point', formatCoordinate(origin.coordinate)]
          ])
        )
        .addTo(layerGroup);
    }

    if (destination) {
      L.marker(destination.coordinate, {
        icon: createPointIcon(L, { label: 'B', tone: 'destination' }),
        zIndexOffset: 500
      })
        .bindPopup(
          createPopupHtml([
            ['Destination', destination.label],
            ['Point', formatCoordinate(destination.coordinate)]
          ])
        )
        .addTo(layerGroup);
    }

    if (route) {
      L.polyline(route.coordinates, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.9,
        dashArray: '8, 10',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layerGroup);
      fitMapToCoordinates(L, map, route.coordinates, { padding: [76, 76], maxZoom: 14 });
      return;
    }

    if (origin && destination) {
      const previewCoordinates = [origin.coordinate, destination.coordinate];
      L.polyline(previewCoordinates, {
        color: '#64748b',
        weight: 2,
        opacity: 0.8,
        dashArray: '4, 8'
      }).addTo(layerGroup);
      fitMapToCoordinates(L, map, previewCoordinates, { padding: [76, 76], maxZoom: 13 });
    } else if (origin || destination) {
      fitMapToCoordinates(L, map, [origin?.coordinate ?? destination!.coordinate], {
        maxZoom: 13
      });
    }
  }, [L, activeTab, destination, isReady, map, origin, route]);

  useEffect(() => {
    if (map) {
      window.setTimeout(() => map.invalidateSize(), 0);
    }
  }, [activeTab, map]);

  const handleCountryChange = (value: string) => {
    const nextCountry = LOCATION_TREE.find((country) => country.id === value);
    setCountryId(value);
    setStateId(nextCountry?.states[0]?.id ?? '');
    setCityId(nextCountry?.states[0]?.cities[0]?.id ?? '');
  };

  const handleStateChange = (value: string) => {
    const nextState = activeCountry?.states.find((state) => state.id === value);
    setStateId(value);
    setCityId(nextState?.cities[0]?.id ?? '');
  };

  const handleSearch = async (target: RoutingSearchTarget) => {
    const query = target === 'origin' ? originQuery : destinationQuery;

    if (!query.trim()) {
      toast.error('Enter a location to search');
      return;
    }

    setSearchingTarget(target);

    try {
      const results = await geocodeLocation(query);
      const firstResult = results[0];

      if (!firstResult) {
        toast.error('Location not found');
        return;
      }

      const nextPoint: RoutePoint = {
        label: firstResult.name,
        coordinate: firstResult.coordinate,
        source: 'search'
      };

      if (target === 'origin') {
        setOrigin(nextPoint);
        setOriginQuery(firstResult.address);
      } else {
        setDestination(nextPoint);
        setDestinationQuery(firstResult.address);
      }

      setRoute(null);
      map?.setView(firstResult.coordinate, Math.max(map.getZoom(), 12));
    } catch {
      toast.error('Failed to search location');
    } finally {
      setSearchingTarget(null);
    }
  };

  const calculateRoute = async () => {
    if (!origin || !destination) {
      toast.error('Set origin and destination first');
      return;
    }

    setIsRouting(true);

    try {
      const nextRoute = await getRoutePath({
        origin: origin.coordinate,
        destination: destination.coordinate,
        profile
      });

      setRoute(nextRoute);

      if (nextRoute.source === 'fallback') {
        toast.message('OSRM unavailable, showing estimated route');
      }
    } catch {
      toast.error('Failed to calculate route');
    } finally {
      setIsRouting(false);
    }
  };

  const swapRoutePoints = () => {
    const nextOrigin = destination;
    const nextDestination = origin;
    setOrigin(nextOrigin);
    setDestination(nextDestination);
    setOriginQuery(nextOrigin?.label ?? '');
    setDestinationQuery(nextDestination?.label ?? '');
    setRoute(null);
  };

  return (
    <div className='shipping-map-shell relative min-h-[720px] overflow-hidden rounded-lg border bg-background'>
      <div ref={containerRef} className='absolute inset-0 z-0' />
      <div className='absolute inset-x-3 top-3 z-40 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2 rounded-lg border bg-card/95 px-3 py-2 shadow-sm backdrop-blur'>
          <Icons.radar className='text-muted-foreground' />
          <div className='min-w-0'>
            <p className='text-xs font-medium text-muted-foreground'>Active Shipments</p>
            <p className='truncate text-sm font-semibold'>
              {shipments.length} live tracker records
            </p>
          </div>
        </div>
        <LayerMenu
          tileLayerId={tileLayerId}
          showBoundary={showBoundary}
          showHeatmap={showHeatmap}
          showHubs={showHubs}
          onBoundaryChange={setShowBoundary}
          onHeatmapChange={setShowHeatmap}
          onHubsChange={setShowHubs}
          onTileLayerChange={setTileLayerId}
        />
      </div>

      <Card className='absolute bottom-3 left-3 top-20 z-30 flex w-[calc(100%-1.5rem)] max-w-[390px] flex-col overflow-hidden border bg-card/95 shadow-lg backdrop-blur md:bottom-3'>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as MapTab)}
          className='min-h-0 flex-1 gap-0'
        >
          <CardHeader className='gap-3 border-b px-4 py-3'>
            <div className='flex items-center justify-between gap-3'>
              <CardTitle className='text-base'>Shipping Map</CardTitle>
              <Badge variant='outline' className='shrink-0'>
                {isReady ? 'Live map' : 'Loading'}
              </Badge>
            </div>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='explore'>
                <Icons.mapSearch />
                Explore
              </TabsTrigger>
              <TabsTrigger value='routing'>
                <Icons.route />
                Routing
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className='min-h-0 flex-1 overflow-hidden p-0'>
            <TabsContent value='explore' className='m-0 h-full'>
              <ExplorePanel
                activeCountry={activeCountry}
                activeState={activeState}
                activeCity={activeCity}
                countryId={countryId}
                stateId={stateId}
                cityId={cityId}
                poiSearch={poiSearch}
                filteredPois={filteredPois}
                selectedLocation={selectedLocation}
                onCityChange={setCityId}
                onCountryChange={handleCountryChange}
                onHoverLocation={setHoveredLocation}
                onPoiSearchChange={setPoiSearch}
                onSelectLocation={setSelectedLocation}
                onStateChange={handleStateChange}
              />
            </TabsContent>
            <TabsContent value='routing' className='m-0 h-full'>
              <RoutingPanel
                destination={destination}
                destinationQuery={destinationQuery}
                isRouting={isRouting}
                origin={origin}
                originQuery={originQuery}
                pickTarget={pickTarget}
                profile={profile}
                route={route}
                searchingTarget={searchingTarget}
                onCalculateRoute={calculateRoute}
                onDestinationQueryChange={(value) => {
                  setDestinationQuery(value);
                  setRoute(null);
                }}
                onOriginQueryChange={(value) => {
                  setOriginQuery(value);
                  setRoute(null);
                }}
                onPickTargetChange={setPickTarget}
                onProfileChange={(value) => {
                  setProfile(value);
                  setRoute(null);
                }}
                onSearch={handleSearch}
                onSwap={swapRoutePoints}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

function LayerMenu({
  tileLayerId,
  showBoundary,
  showHeatmap,
  showHubs,
  onBoundaryChange,
  onHeatmapChange,
  onHubsChange,
  onTileLayerChange
}: {
  tileLayerId: ShippingTileLayerId;
  showBoundary: boolean;
  showHeatmap: boolean;
  showHubs: boolean;
  onBoundaryChange: (value: boolean) => void;
  onHeatmapChange: (value: boolean) => void;
  onHubsChange: (value: boolean) => void;
  onTileLayerChange: (value: ShippingTileLayerId) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='bg-card/95 shadow-sm backdrop-blur'>
          <Icons.layers />
          Layers
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80'>
        <div className='flex flex-col gap-4'>
          <div>
            <p className='text-sm font-semibold'>Base map</p>
            <p className='text-xs text-muted-foreground'>
              Switch context without leaving the tracker.
            </p>
          </div>
          <div className='grid grid-cols-2 gap-2'>
            {(Object.keys(SHIPPING_TILE_LAYERS) as ShippingTileLayerId[]).map((layerId) => {
              const layer = SHIPPING_TILE_LAYERS[layerId];

              return (
                <Button
                  key={layerId}
                  type='button'
                  variant={tileLayerId === layerId ? 'default' : 'outline'}
                  className='h-auto justify-start whitespace-normal px-3 py-2 text-left'
                  onClick={() => onTileLayerChange(layerId)}
                >
                  <span className='flex min-w-0 flex-col items-start gap-1'>
                    <span className='text-sm font-semibold'>{layer.label}</span>
                    <span className='text-xs opacity-80'>{layer.description}</span>
                  </span>
                </Button>
              );
            })}
          </div>
          <Separator />
          <LayerSwitch
            checked={showHubs}
            description='Cluster fulfillment, port, airport, and cross-dock nodes.'
            icon={<Icons.warehouse />}
            label='Logistics hubs'
            onCheckedChange={onHubsChange}
          />
          <LayerSwitch
            checked={showHeatmap}
            description='Demand pressure and parcel density.'
            icon={<Icons.flame />}
            label='Heatmap'
            onCheckedChange={onHeatmapChange}
          />
          <LayerSwitch
            checked={showBoundary}
            description='Selected and hovered service boundaries.'
            icon={<Icons.world />}
            label='Boundary overlay'
            onCheckedChange={onBoundaryChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function LayerSwitch({
  checked,
  description,
  icon,
  label,
  onCheckedChange
}: {
  checked: boolean;
  description: string;
  icon: ReactNode;
  label: string;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className='flex items-center justify-between gap-3'>
      <div className='flex min-w-0 items-start gap-3'>
        <div className='mt-0.5 text-muted-foreground'>{icon}</div>
        <div className='min-w-0'>
          <p className='text-sm font-medium'>{label}</p>
          <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function ExplorePanel({
  activeCountry,
  activeState,
  activeCity,
  countryId,
  stateId,
  cityId,
  poiSearch,
  filteredPois,
  selectedLocation,
  onCityChange,
  onCountryChange,
  onHoverLocation,
  onPoiSearchChange,
  onSelectLocation,
  onStateChange
}: {
  activeCountry?: (typeof LOCATION_TREE)[number];
  activeState?: (typeof LOCATION_TREE)[number]['states'][number];
  activeCity?: (typeof LOCATION_TREE)[number]['states'][number]['cities'][number];
  countryId: string;
  stateId: string;
  cityId: string;
  poiSearch: string;
  filteredPois: ShippingPointOfInterest[];
  selectedLocation: MapLocation | null;
  onCityChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onHoverLocation: (value: MapLocation | null) => void;
  onPoiSearchChange: (value: string) => void;
  onSelectLocation: (value: MapLocation) => void;
  onStateChange: (value: string) => void;
}) {
  return (
    <ScrollArea className='h-full'>
      <div className='flex flex-col gap-4 p-4'>
        <div className='grid grid-cols-1 gap-3'>
          <LocationSelect
            label='Country'
            value={countryId}
            options={LOCATION_TREE.map((country) => ({ label: country.label, value: country.id }))}
            onValueChange={onCountryChange}
          />
          <LocationSelect
            label='State'
            value={stateId}
            options={(activeCountry?.states ?? []).map((state) => ({
              label: state.label,
              value: state.id
            }))}
            onValueChange={onStateChange}
          />
          <LocationSelect
            label='City'
            value={cityId}
            options={(activeState?.cities ?? []).map((city) => ({
              label: city.label,
              value: city.id
            }))}
            onValueChange={onCityChange}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <label htmlFor='shipping-poi-search' className='text-sm font-medium'>
            POI search
          </label>
          <div className='relative'>
            <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
            <Input
              id='shipping-poi-search'
              value={poiSearch}
              onChange={(event) => onPoiSearchChange(event.target.value)}
              placeholder='Search ports, airports, warehouses'
              className='pl-9'
            />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between gap-3'>
            <p className='text-sm font-semibold'>Boundary preview</p>
            <Badge variant='secondary'>{filteredPois.length} POIs</Badge>
          </div>
          <div className='grid gap-2'>
            {[activeCountry, activeState, activeCity].filter(Boolean).map((location) => (
              <LocationButton
                key={location!.id}
                location={location!}
                selectedLocation={selectedLocation}
                onHoverLocation={onHoverLocation}
                onSelectLocation={onSelectLocation}
              />
            ))}
          </div>
        </div>

        <Separator />

        <div className='flex flex-col gap-2'>
          <p className='text-sm font-semibold'>Points of interest</p>
          <div className='grid gap-2'>
            {filteredPois.map((poi) => (
              <LocationButton
                key={poi.id}
                location={poi}
                selectedLocation={selectedLocation}
                onHoverLocation={onHoverLocation}
                onSelectLocation={onSelectLocation}
              />
            ))}
            {filteredPois.length === 0 && (
              <div className='rounded-md border border-dashed p-4 text-sm text-muted-foreground'>
                No POI matches this region and search.
              </div>
            )}
          </div>
        </div>

        {selectedLocation && (
          <div className='rounded-lg border bg-background/80 p-4'>
            <div className='mb-3 flex items-start justify-between gap-3'>
              <div>
                <p className='text-sm font-semibold'>{selectedLocation.label}</p>
                <p className='text-xs text-muted-foreground'>
                  {formatCoordinate(selectedLocation.center)}
                </p>
              </div>
              <Badge
                variant={
                  selectedLocation.intelligence.risk === 'Elevated' ? 'destructive' : 'outline'
                }
              >
                {selectedLocation.intelligence.risk}
              </Badge>
            </div>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <IntelligenceStat
                label='Daily orders'
                value={selectedLocation.intelligence.dailyOrders.toLocaleString()}
              />
              <IntelligenceStat label='SLA' value={selectedLocation.intelligence.serviceLevel} />
              <IntelligenceStat
                label='Avg transit'
                value={selectedLocation.intelligence.avgTransitTime}
              />
              <IntelligenceStat label='Coverage' value={selectedLocation.intelligence.coverage} />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function LocationSelect({
  label,
  value,
  options,
  onValueChange
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className='flex flex-col gap-2'>
      <label className='text-sm font-medium'>{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className='w-full'>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function LocationButton({
  location,
  selectedLocation,
  onHoverLocation,
  onSelectLocation
}: {
  location: MapLocation;
  selectedLocation: MapLocation | null;
  onHoverLocation: (value: MapLocation | null) => void;
  onSelectLocation: (value: MapLocation) => void;
}) {
  const isSelected = selectedLocation?.id === location.id;

  return (
    <button
      type='button'
      className={cn(
        'rounded-md border p-3 text-left transition-colors',
        isSelected ? 'border-primary bg-primary/10' : 'bg-background hover:bg-accent'
      )}
      onClick={() => onSelectLocation(location)}
      onMouseEnter={() => onHoverLocation(location)}
      onMouseLeave={() => onHoverLocation(null)}
      aria-label={`Preview ${location.label}`}
    >
      <span className='flex items-start justify-between gap-3'>
        <span className='min-w-0'>
          <span className='block truncate text-sm font-semibold'>{location.label}</span>
          <span className='block text-xs text-muted-foreground'>
            {location.intelligence.dailyOrders.toLocaleString()} orders/day
          </span>
        </span>
        <Badge variant='outline' className='shrink-0'>
          {location.intelligence.serviceLevel}
        </Badge>
      </span>
    </button>
  );
}

function IntelligenceStat({ label, value }: { label: string; value: string }) {
  return (
    <div className='min-w-0 rounded-md bg-muted/60 p-2'>
      <p className='text-[11px] font-medium text-muted-foreground'>{label}</p>
      <p className='truncate text-sm font-semibold'>{value}</p>
    </div>
  );
}

function RoutingPanel({
  destination,
  destinationQuery,
  isRouting,
  origin,
  originQuery,
  pickTarget,
  profile,
  route,
  searchingTarget,
  onCalculateRoute,
  onDestinationQueryChange,
  onOriginQueryChange,
  onPickTargetChange,
  onProfileChange,
  onSearch,
  onSwap
}: {
  destination: RoutePoint | null;
  destinationQuery: string;
  isRouting: boolean;
  origin: RoutePoint | null;
  originQuery: string;
  pickTarget: RoutingSearchTarget | null;
  profile: RouteProfile;
  route: ShippingRouteResult | null;
  searchingTarget: RoutingSearchTarget | null;
  onCalculateRoute: () => void;
  onDestinationQueryChange: (value: string) => void;
  onOriginQueryChange: (value: string) => void;
  onPickTargetChange: (value: RoutingSearchTarget | null) => void;
  onProfileChange: (value: RouteProfile) => void;
  onSearch: (target: RoutingSearchTarget) => void;
  onSwap: () => void;
}) {
  return (
    <ScrollArea className='h-full'>
      <div className='flex flex-col gap-4 p-4'>
        <RouteSearchControl
          label='Origin'
          point={origin}
          query={originQuery}
          marker='A'
          isSearching={searchingTarget === 'origin'}
          onPick={() => onPickTargetChange(pickTarget === 'origin' ? null : 'origin')}
          onQueryChange={onOriginQueryChange}
          onSearch={() => onSearch('origin')}
          isPicking={pickTarget === 'origin'}
        />
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={onSwap}
            aria-label='Swap route points'
          >
            <Icons.arrowsExchange />
          </Button>
        </div>
        <RouteSearchControl
          label='Destination'
          point={destination}
          query={destinationQuery}
          marker='B'
          isSearching={searchingTarget === 'destination'}
          onPick={() => onPickTargetChange(pickTarget === 'destination' ? null : 'destination')}
          onQueryChange={onDestinationQueryChange}
          onSearch={() => onSearch('destination')}
          isPicking={pickTarget === 'destination'}
        />

        <div className='flex flex-col gap-2'>
          <p className='text-sm font-medium'>Route profile</p>
          <ToggleGroup
            type='single'
            value={profile}
            onValueChange={(value) => {
              if (value) {
                onProfileChange(value as RouteProfile);
              }
            }}
            variant='outline'
            className='grid w-full grid-cols-3'
          >
            {ROUTE_PROFILES.map((routeProfile) => (
              <ToggleGroupItem
                key={routeProfile.value}
                value={routeProfile.value}
                className='h-auto flex-col gap-1 px-2 py-2'
              >
                {routeProfile.value === 'driving' && <Icons.car />}
                {routeProfile.value === 'cycling' && <Icons.bike />}
                {routeProfile.value === 'walking' && <Icons.walk />}
                <span className='text-xs font-semibold'>{routeProfile.label}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Button type='button' onClick={onCalculateRoute} isLoading={isRouting}>
          <Icons.route />
          Calculate route
        </Button>

        <div className='rounded-lg border bg-background/80 p-4'>
          <div className='mb-3 flex items-center justify-between gap-3'>
            <p className='text-sm font-semibold'>Route summary</p>
            <Badge variant={route?.source === 'fallback' ? 'outline' : 'secondary'}>
              {route ? route.source.toUpperCase() : 'Preview'}
            </Badge>
          </div>
          <div className='grid gap-3'>
            <RouteSummaryRow label='Origin' value={origin?.label ?? 'Not set'} />
            <RouteSummaryRow label='Destination' value={destination?.label ?? 'Not set'} />
            <RouteSummaryRow label='Profile' value={getProfileLabel(profile)} />
            <div className='grid grid-cols-2 gap-3'>
              <IntelligenceStat
                label='Distance'
                value={route ? formatRouteDistance(route.distanceMeters) : '--'}
              />
              <IntelligenceStat
                label='Duration'
                value={route ? formatRouteDuration(route.durationSeconds) : '--'}
              />
            </div>
          </div>
        </div>

        <div className='rounded-md border border-dashed p-3 text-xs text-muted-foreground'>
          {pickTarget
            ? `Click the map to set ${pickTarget}.`
            : 'Use search or map-pick controls, then calculate a route.'}
        </div>
      </div>
    </ScrollArea>
  );
}

function RouteSearchControl({
  label,
  marker,
  point,
  query,
  isPicking,
  isSearching,
  onPick,
  onQueryChange,
  onSearch
}: {
  label: string;
  marker: 'A' | 'B';
  point: RoutePoint | null;
  query: string;
  isPicking: boolean;
  isSearching: boolean;
  onPick: () => void;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between gap-3'>
        <label className='text-sm font-medium'>{label}</label>
        <Badge variant='outline'>{marker}</Badge>
      </div>
      <div className='flex gap-2'>
        <div className='relative min-w-0 flex-1'>
          <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onSearch();
              }
            }}
            placeholder={`Search ${label.toLowerCase()}`}
            className='pl-9'
          />
        </div>
        <Button
          type='button'
          variant='outline'
          size='icon'
          isLoading={isSearching}
          onClick={onSearch}
        >
          <Icons.search />
        </Button>
      </div>
      <div className='flex items-center justify-between gap-3'>
        <p className='truncate text-xs text-muted-foreground'>
          {point ? formatCoordinate(point.coordinate) : 'No point selected'}
        </p>
        <Button
          type='button'
          variant={isPicking ? 'default' : 'outline'}
          size='sm'
          onClick={onPick}
        >
          <Icons.target />
          Pick
        </Button>
      </div>
    </div>
  );
}

function RouteSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-3 text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='truncate font-medium'>{value}</span>
    </div>
  );
}
