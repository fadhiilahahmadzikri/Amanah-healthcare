'use client';

import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  geocodeLocation,
  geocodeStructuredLocation,
  reverseGeocodeCoordinate
} from '../api/service';
import type {
  Coordinate,
  CountryOption,
  GeocodeResult,
  RouteProfile,
  ShippingRouteResult,
  StateOption,
  StructuredLocationRequest
} from '../api/types';
import {
  ROUTE_PROFILES,
  SHIPPING_DEFAULT_CENTER,
  SHIPPING_TILE_LAYERS,
  type ShippingTileLayerId
} from '../constants/map';
import { useBoundaryPreview } from '../hooks/use-boundary-preview';
import { useLeafletMap } from '../hooks/use-leaflet-map';
import { useShippingLocationMapLayers } from '../hooks/use-shipping-location-map-layers';
import { useShippingRegionTargeting } from '../hooks/use-shipping-region-targeting';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { ShippingLayerPreview } from './shipping-map-layer-control';
import {
  formatCoordinate,
  formatRouteDistance,
  formatRouteDuration,
  getProfileLabel
} from '../utils/map';
import {
  createBoundaryFromGeocode,
  createBoundaryFromReverseGeocode,
  createBoundaryFromStructured,
  flyToBoundary,
  type BoundaryPreview,
  type BoundarySource,
  type SelectionTarget
} from '../utils/location-map';

type ShippingLocationMapProps = {
  title: string;
  description?: string;
  origin: Coordinate | null;
  destination: Coordinate | null;
  onOriginChange: (coordinate: Coordinate | null) => void;
  onDestinationChange: (coordinate: Coordinate | null) => void;
  onAddressChange?: (address: string) => void;
  customerContent: ReactNode;
  footerContent: ReactNode;
  className?: string;
};

export function ShippingLocationMap({
  title,
  description,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onAddressChange,
  customerContent,
  footerContent,
  className
}: ShippingLocationMapProps) {
  const [tileLayerId, setTileLayerId] = useState<ShippingTileLayerId>('daylight');
  const [showHubs, setShowHubs] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [selectionTarget, setSelectionTarget] = useState<SelectionTarget>('destination');
  const profile: RouteProfile = 'driving';
  const [originLabel, setOriginLabel] = useState(origin ? formatCoordinate(origin) : '');
  const [destinationLabel, setDestinationLabel] = useState(
    destination ? formatCoordinate(destination) : ''
  );
  const [route, setRoute] = useState<ShippingRouteResult | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const {
    countries,
    states,
    cities,
    countryName,
    stateName,
    cityName,
    activeCountry,
    isLoadingRegions,
    setCountryName,
    setStateName,
    setCityName,
    syncFromLocation
  } = useShippingRegionTargeting();

  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<GeocodeResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [originQuery, setOriginQuery] = useState(origin ? formatCoordinate(origin) : '');
  const [destinationQuery, setDestinationQuery] = useState(
    destination ? formatCoordinate(destination) : ''
  );
  const [originResults, setOriginResults] = useState<GeocodeResult[]>([]);
  const [destinationResults, setDestinationResults] = useState<GeocodeResult[]>([]);
  const [searchingPoint, setSearchingPoint] = useState<SelectionTarget | null>(null);

  const [selectedBoundary, setSelectedBoundary] = useState<BoundaryPreview | null>(null);

  const handleMapClick = useCallback(
    async (coordinate: Coordinate) => {
      const coordinateLabel = formatCoordinate(coordinate);
      const target = selectionTarget;

      if (target === 'origin') {
        onOriginChange(coordinate);
        setOriginLabel(coordinateLabel);
        setOriginQuery(coordinateLabel);
      } else {
        onDestinationChange(coordinate);
        setDestinationLabel(coordinateLabel);
        setDestinationQuery(coordinateLabel);
      }
      setRoute(null);

      try {
        const result = await reverseGeocodeCoordinate(coordinate);

        if (!result) {
          return;
        }

        setSelectedBoundary(createBoundaryFromReverseGeocode(result));
        if (target === 'origin') {
          setOriginLabel(result.label);
          setOriginQuery(result.address);
        } else {
          setDestinationLabel(result.label);
          setDestinationQuery(result.address);
          onAddressChange?.(result.address);
        }
        syncFromLocation({
          addressDetails: result.addressDetails,
          coordinate
        });
      } catch {
        toast.error('Failed to resolve map location');
      }
    },
    [onAddressChange, onDestinationChange, onOriginChange, selectionTarget, syncFromLocation]
  );

  const { containerRef, L, map, isReady } = useLeafletMap({
    center: destination ?? origin ?? SHIPPING_DEFAULT_CENTER,
    zoom: 12,
    tileLayerId,
    onMapClick: handleMapClick
  });

  const { peekBoundary, setPeekBoundary, previewStructuredLocation, previewBoundary } =
    useBoundaryPreview({
      onFocusBoundary: useCallback(
        (boundary) => {
          flyToBoundary(boundary, L, map);
        },
        [L, map]
      )
    });

  useShippingLocationMapLayers({
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
    onRouteChange: setRoute,
    onRoutingChange: setIsRouting
  });

  const selectStructuredLocation = async (
    request: StructuredLocationRequest,
    source: BoundarySource
  ) => {
    const result = await geocodeStructuredLocation(request);

    if (!result) {
      toast.error('Location boundary not found');
      return;
    }

    const boundary = createBoundaryFromStructured(result, source);
    setSelectedBoundary(boundary);
    setPeekBoundary(null);
    setDestinationFromBoundary(boundary);
  };

  const searchLocation = async () => {
    if (!locationQuery.trim()) {
      setLocationResults([]);
      return;
    }

    setIsSearchingLocation(true);

    try {
      const results = await geocodeLocation(locationQuery, {
        countryCode: activeCountry?.code,
        limit: 8
      });

      setLocationResults(results);

      if (results.length === 0) {
        toast.error('Location not found');
      }
    } catch {
      toast.error('Failed to search location');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const searchRoutePoint = async (target: SelectionTarget) => {
    const query = target === 'origin' ? originQuery : destinationQuery;

    if (!query.trim()) {
      return;
    }

    setSearchingPoint(target);

    try {
      const results = await geocodeLocation(query, {
        countryCode: activeCountry?.code,
        limit: 5
      });

      if (target === 'origin') {
        setOriginResults(results);
      } else {
        setDestinationResults(results);
      }

      if (results.length === 0) {
        toast.error('Route point not found');
      }
    } catch {
      toast.error('Failed to search route point');
    } finally {
      setSearchingPoint(null);
    }
  };

  const selectSearchResult = (result: GeocodeResult) => {
    const boundary = createBoundaryFromGeocode(result);
    setSelectedBoundary(boundary);
    setPeekBoundary(null);
    setDestinationFromBoundary(boundary);
  };

  const setRoutePointFromSearch = (target: SelectionTarget, result: GeocodeResult) => {
    if (target === 'origin') {
      onOriginChange(result.coordinate);
      setOriginLabel(result.name);
      setOriginQuery(result.address);
      setOriginResults([]);
    } else {
      onDestinationChange(result.coordinate);
      setDestinationLabel(result.name);
      setDestinationQuery(result.address);
      setDestinationResults([]);
      onAddressChange?.(result.address);
      setSelectedBoundary(createBoundaryFromGeocode(result));
      setPeekBoundary(null);

      if (result.addressDetails) {
        syncFromLocation({
          addressDetails: result.addressDetails,
          coordinate: result.coordinate
        });
      }
    }

    setRoute(null);
  };

  const setDestinationFromBoundary = (boundary: BoundaryPreview) => {
    onDestinationChange(boundary.center);
    setDestinationLabel(boundary.label);
    setDestinationQuery(boundary.address ?? boundary.label);
    onAddressChange?.(boundary.address ?? boundary.label);
    setRoute(null);

    if (boundary.addressDetails) {
      syncFromLocation({
        addressDetails: boundary.addressDetails,
        coordinate: boundary.center
      });
    }

    flyToBoundary(boundary, L, map);
  };

  const resetRoutePoints = () => {
    onOriginChange(null);
    onDestinationChange(null);
    setOriginLabel('');
    setDestinationLabel('');
    setOriginQuery('');
    setDestinationQuery('');
    setOriginResults([]);
    setDestinationResults([]);
    setRoute(null);
  };

  const swapRoutePoints = () => {
    const nextOrigin = destination;
    const nextDestination = origin;
    const nextOriginLabel = destinationLabel;
    const nextDestinationLabel = originLabel;
    const nextOriginQuery = destinationQuery;
    const nextDestinationQuery = originQuery;

    onOriginChange(nextOrigin);
    onDestinationChange(nextDestination);
    setOriginLabel(nextOriginLabel);
    setDestinationLabel(nextDestinationLabel);
    setOriginQuery(nextOriginQuery);
    setDestinationQuery(nextDestinationQuery);
    setRoute(null);
  };

  const selectedLayer = SHIPPING_TILE_LAYERS[tileLayerId];

  return (
    <div
      className={cn(
        'shipping-map-shell relative min-h-[820px] overflow-hidden rounded-lg border bg-background',
        className
      )}
    >
      <div ref={containerRef} className='absolute inset-0 z-0' />

      <div className='absolute inset-x-3 top-3 z-30 max-h-[72%] lg:bottom-3 lg:left-3 lg:right-auto lg:max-h-none lg:w-[430px]'>
        <Card className='flex h-full overflow-hidden border-border/80 bg-card/95 shadow-xl backdrop-blur'>
          <CardHeader className='shrink-0 gap-1 border-b py-4'>
            <div className='flex items-start justify-between gap-3'>
              <div className='min-w-0'>
                <CardTitle className='text-base font-semibold'>{title}</CardTitle>
                {description ? (
                  <p className='mt-1 text-xs leading-5 text-muted-foreground'>{description}</p>
                ) : null}
              </div>
              <Badge variant='outline' className='shrink-0'>
                Map create
              </Badge>
            </div>
          </CardHeader>

          <CardContent className='min-h-0 flex-1 p-0'>
            <Tabs defaultValue='customer' className='flex h-full flex-col'>
              <div className='shrink-0 border-b px-4 py-3'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='customer'>
                    <Icons.user className='size-4' />
                    Customer
                  </TabsTrigger>
                  <TabsTrigger value='location'>
                    <Icons.mapSearch className='size-4' />
                    Lokasi
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value='customer' className='m-0 min-h-0 flex-1'>
                <ScrollArea className='h-full'>
                  <div className='space-y-5 p-4'>{customerContent}</div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value='location' className='m-0 min-h-0 flex-1'>
                <ScrollArea className='h-full'>
                  <div className='space-y-5 p-4'>
                    <LocationTargetControls
                      selectionTarget={selectionTarget}
                      onSelectionTargetChange={setSelectionTarget}
                      onReset={resetRoutePoints}
                    />

                    <StructuredTargeting
                      activeCountry={activeCountry}
                      countries={countries}
                      states={states}
                      cities={cities}
                      countryName={countryName}
                      stateName={stateName}
                      cityName={cityName}
                      isLoading={isLoadingRegions}
                      onCountryChange={(value) => {
                        setCountryName(value);
                        setStateName('');
                        setCityName('');
                        setPeekBoundary(null);
                      }}
                      onStateChange={(value) => {
                        setStateName(value);
                        setCityName('');
                        setPeekBoundary(null);
                      }}
                      onCityChange={(value) => {
                        setCityName(value);
                        setPeekBoundary(null);
                      }}
                      onPreview={previewStructuredLocation}
                      onSelect={selectStructuredLocation}
                    />

                    <Separator />

                    <LocationSearch
                      query={locationQuery}
                      results={locationResults}
                      isSearching={isSearchingLocation}
                      onQueryChange={setLocationQuery}
                      onSearch={searchLocation}
                      onResultHover={(result) => previewBoundary(createBoundaryFromGeocode(result))}
                      onResultSelect={selectSearchResult}
                    />

                    <Separator />

                    <RoutePlanner
                      origin={origin}
                      destination={destination}
                      originQuery={originQuery}
                      destinationQuery={destinationQuery}
                      originResults={originResults}
                      destinationResults={destinationResults}
                      searchingPoint={searchingPoint}
                      isRouting={isRouting}
                      onOriginQueryChange={setOriginQuery}
                      onDestinationQueryChange={setDestinationQuery}
                      onSearchPoint={searchRoutePoint}
                      onSelectPoint={setRoutePointFromSearch}
                      onSwap={swapRoutePoints}
                    />

                    <CoordinateSummary origin={origin} destination={destination} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>

          <div className='shrink-0 border-t bg-card/95 p-4'>{footerContent}</div>
        </Card>
      </div>

      <LayerMenu
        tileLayerId={tileLayerId}
        selectedLayerLabel={selectedLayer.label}
        showHubs={showHubs}
        showHeatmap={showHeatmap}
        showBoundary={showBoundary}
        onTileLayerChange={setTileLayerId}
        onShowHubsChange={setShowHubs}
        onShowHeatmapChange={setShowHeatmap}
        onShowBoundaryChange={setShowBoundary}
      />

      <RouteSummary route={route} isRouting={isRouting} origin={origin} destination={destination} />
    </div>
  );
}

function LocationTargetControls({
  selectionTarget,
  onSelectionTargetChange,
  onReset
}: {
  selectionTarget: SelectionTarget;
  onSelectionTargetChange: (target: SelectionTarget) => void;
  onReset: () => void;
}) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-medium'>Map click target</p>
          <p className='text-xs text-muted-foreground'>Klik map akan mengisi titik yang aktif.</p>
        </div>
        <Button type='button' variant='outline' size='sm' onClick={onReset}>
          <Icons.currentLocation className='size-4' />
          Reset
        </Button>
      </div>
      <ToggleGroup
        type='single'
        value={selectionTarget}
        onValueChange={(value) => {
          if (value) {
            onSelectionTargetChange(value as SelectionTarget);
          }
        }}
        variant='outline'
        className='grid grid-cols-2'
      >
        <ToggleGroupItem value='origin'>
          <Icons.target className='size-4' />
          Origin
        </ToggleGroupItem>
        <ToggleGroupItem value='destination'>
          <Icons.mapPin className='size-4' />
          Destination
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

function StructuredTargeting({
  activeCountry,
  countries,
  states,
  cities,
  countryName,
  stateName,
  cityName,
  isLoading,
  onCountryChange,
  onStateChange,
  onCityChange,
  onPreview,
  onSelect
}: {
  activeCountry?: CountryOption;
  countries: CountryOption[];
  states: StateOption[];
  cities: string[];
  countryName: string;
  stateName: string;
  cityName: string;
  isLoading: boolean;
  onCountryChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPreview: (request: StructuredLocationRequest, source: BoundarySource, label: string) => void;
  onSelect: (request: StructuredLocationRequest, source: BoundarySource) => void;
}) {
  const countryCode = activeCountry?.code;
  const selectedCountryCode =
    countries.find((country) => country.name === countryName)?.code ?? countryCode;
  const shouldShowStateSelect = Boolean(countryName && states.length > 0);
  const shouldShowCitySelect = Boolean(countryName && stateName && cities.length > 0);

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-medium'>Target wilayah</p>
          <p className='text-xs text-muted-foreground'>
            Hover opsi untuk preview outline, pilih untuk mengunci lokasi.
          </p>
        </div>
        {isLoading ? (
          <Badge variant='secondary'>
            <Icons.spinner className='size-3 animate-spin' />
            Sync
          </Badge>
        ) : null}
      </div>

      <div className='grid gap-3'>
        <RegionSelect
          label='Country'
          value={countryName}
          placeholder='Select country'
          items={countries.map((country) => ({
            value: country.name,
            label: country.name,
            flagUrl: country.flagUrl,
            countryCode: country.code
          }))}
          onChange={(val) => {
            onCountryChange(val);
            const code = countries.find((c) => c.name === val)?.code ?? countryCode;
            onSelect({ country: val, countryCode: code }, 'country');
          }}
          onHover={(option) =>
            onPreview(
              { country: option.value, countryCode: option.countryCode },
              'country',
              option.value
            )
          }
          onConfirm={() =>
            onSelect({ country: countryName, countryCode: selectedCountryCode }, 'country')
          }
          disabled={!countryName && countries.length === 0}
        />
        {shouldShowStateSelect ? (
          <RegionSelect
            label='State'
            value={stateName}
            placeholder='Select state'
            items={states.map((state) => ({ value: state.name, label: state.name }))}
            onChange={(val) => {
              onStateChange(val);
              onSelect({ country: countryName, state: val, countryCode }, 'state');
            }}
            onHover={(option) =>
              onPreview(
                { country: countryName, state: option.value, countryCode },
                'state',
                option.value
              )
            }
            onConfirm={() =>
              onSelect({ country: countryName, state: stateName, countryCode }, 'state')
            }
            disabled={!stateName && states.length === 0}
          />
        ) : null}
        {shouldShowCitySelect ? (
          <RegionSelect
            label='City'
            value={cityName}
            placeholder='Select city'
            items={cities.map((city) => ({ value: city, label: city }))}
            onChange={(val) => {
              onCityChange(val);
              onSelect({ country: countryName, state: stateName, city: val, countryCode }, 'city');
            }}
            onHover={(option) =>
              onPreview(
                { country: countryName, state: stateName, city: option.value, countryCode },
                'city',
                option.value
              )
            }
            onConfirm={() =>
              onSelect(
                { country: countryName, state: stateName, city: cityName, countryCode },
                'city'
              )
            }
            disabled={!cityName && cities.length === 0}
          />
        ) : null}
      </div>
    </div>
  );
}

type RegionSelectOption = {
  value: string;
  label: string;
  flagUrl?: string;
  countryCode?: string;
};

function RegionSelect({
  label,
  value,
  placeholder,
  items,
  onChange,
  onHover,
  onConfirm,
  disabled = false
}: {
  label: string;
  value: string;
  placeholder: string;
  items: RegionSelectOption[];
  onChange: (value: string) => void;
  onHover: (option: RegionSelectOption) => void;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <div className='grid gap-2'>
      <Label className='text-xs'>{label}</Label>
      <div className='flex gap-2'>
        <Select value={value} onValueChange={onChange} disabled={items.length === 0}>
          <SelectTrigger className='min-w-0 flex-1'>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map((item) => (
                <SelectItem
                  key={item.value}
                  value={item.value}
                  onPointerEnter={() => onHover(item)}
                >
                  <span className='flex min-w-0 items-center gap-2'>
                    {item.flagUrl ? (
                      <span
                        className='size-5 shrink-0 rounded-sm border bg-cover bg-center'
                        style={{ backgroundImage: `url(${item.flagUrl})` }}
                      />
                    ) : null}
                    <span className='truncate'>{item.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={onConfirm}
          disabled={disabled || !value}
        >
          <Icons.target className='size-4' />
        </Button>
      </div>
    </div>
  );
}

function LocationSearch({
  query,
  results,
  isSearching,
  onQueryChange,
  onSearch,
  onResultHover,
  onResultSelect
}: {
  query: string;
  results: GeocodeResult[];
  isSearching: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onResultHover: (result: GeocodeResult) => void;
  onResultSelect: (result: GeocodeResult) => void;
}) {
  const debouncedSearch = useDebouncedCallback(onSearch, 500);

  return (
    <div className='space-y-3'>
      <div className='relative'>
        <Icons.search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            debouncedSearch();
          }}
          placeholder='Search destination or POI'
          className='pl-9 pr-10'
        />
        {isSearching && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            <Icons.spinner className='size-4 animate-spin text-muted-foreground' />
          </div>
        )}
      </div>

      {results.length > 0 ? (
        <div className='grid gap-1'>
          {results.slice(0, 4).map((result) => (
            <Button
              key={result.id}
              type='button'
              variant='ghost'
              className='h-auto justify-start px-2 py-2 text-left'
              onPointerEnter={() => onResultHover(result)}
              onClick={() => onResultSelect(result)}
            >
              <span className='min-w-0'>
                <span className='block truncate text-xs font-medium'>{result.name}</span>
                <span className='block truncate text-xs text-muted-foreground'>
                  {result.address}
                </span>
              </span>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RoutePlanner({
  origin,
  destination,
  originQuery,
  destinationQuery,
  originResults,
  destinationResults,
  searchingPoint,
  isRouting,
  onOriginQueryChange,
  onDestinationQueryChange,
  onSearchPoint,
  onSelectPoint,
  onSwap
}: {
  origin: Coordinate | null;
  destination: Coordinate | null;
  originQuery: string;
  destinationQuery: string;
  originResults: GeocodeResult[];
  destinationResults: GeocodeResult[];
  searchingPoint: SelectionTarget | null;
  isRouting: boolean;
  onOriginQueryChange: (value: string) => void;
  onDestinationQueryChange: (value: string) => void;
  onSearchPoint: (target: SelectionTarget) => void;
  onSelectPoint: (target: SelectionTarget, result: GeocodeResult) => void;
  onSwap: () => void;
}) {
  const debouncedSearchOrigin = useDebouncedCallback(() => onSearchPoint('origin'), 500);
  const debouncedSearchDestination = useDebouncedCallback(() => onSearchPoint('destination'), 500);

  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-medium'>Routing</p>
          <p className='text-xs text-muted-foreground'>Search A/B, swap, atau klik map.</p>
        </div>
        <Button type='button' variant='outline' size='icon' onClick={onSwap}>
          <Icons.arrowsExchange className='size-4' />
        </Button>
      </div>

      <RoutePointInput
        label='Origin'
        icon={<Icons.target className='size-4' />}
        value={originQuery}
        results={originResults}
        isSearching={searchingPoint === 'origin'}
        onChange={(val) => {
          onOriginQueryChange(val);
          debouncedSearchOrigin();
        }}
        onSelect={(result) => onSelectPoint('origin', result)}
      />
      <RoutePointInput
        label='Destination'
        icon={<Icons.mapPin className='size-4' />}
        value={destinationQuery}
        results={destinationResults}
        isSearching={searchingPoint === 'destination'}
        onChange={(val) => {
          onDestinationQueryChange(val);
          debouncedSearchDestination();
        }}
        onSelect={(result) => onSelectPoint('destination', result)}
      />

      <div className='grid grid-cols-2 gap-2 text-xs'>
        <RouteStatusCard label='Origin' coordinate={origin} />
        <RouteStatusCard label='Destination' coordinate={destination} />
      </div>

      {isRouting ? (
        <Badge variant='secondary'>
          <Icons.spinner className='size-3 animate-spin' />
          Calculating route
        </Badge>
      ) : null}
    </div>
  );
}

function RoutePointInput({
  label,
  icon,
  value,
  results,
  isSearching,
  onChange,
  onSelect
}: {
  label: string;
  icon: ReactNode;
  value: string;
  results: GeocodeResult[];
  isSearching: boolean;
  onChange: (value: string) => void;
  onSelect: (result: GeocodeResult) => void;
}) {
  return (
    <div className='space-y-2'>
      <Label className='text-xs'>{label}</Label>
      <div className='relative'>
        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
          {icon}
        </span>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={`${label} search`}
          className='pl-9 pr-10'
        />
        {isSearching && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            <Icons.spinner className='size-4 animate-spin text-muted-foreground' />
          </div>
        )}
      </div>
      {results.length > 0 ? (
        <div className='grid gap-1 rounded-md border bg-muted/20 p-1'>
          {results.slice(0, 3).map((result) => (
            <Button
              key={result.id}
              type='button'
              variant='ghost'
              className='h-auto justify-start px-2 py-2 text-left'
              onClick={() => onSelect(result)}
            >
              <span className='min-w-0'>
                <span className='block truncate text-xs font-medium'>{result.name}</span>
                <span className='block truncate text-xs text-muted-foreground'>
                  {result.address}
                </span>
              </span>
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RouteStatusCard({ label, coordinate }: { label: string; coordinate: Coordinate | null }) {
  return (
    <div className='rounded-md border bg-card/70 p-2'>
      <p className='font-medium text-muted-foreground'>{label}</p>
      <p className={cn('mt-1 truncate font-semibold', !coordinate && 'text-muted-foreground')}>
        {coordinate ? formatCoordinate(coordinate) : 'Not set'}
      </p>
    </div>
  );
}

function CoordinateSummary({
  origin,
  destination
}: {
  origin: Coordinate | null;
  destination: Coordinate | null;
}) {
  return (
    <div className='rounded-md border bg-muted/20 p-3 text-xs'>
      <div className='flex items-center justify-between gap-3'>
        <span className='text-muted-foreground'>Origin</span>
        <span className='font-semibold'>{origin ? formatCoordinate(origin) : 'Not set'}</span>
      </div>
      <div className='mt-2 flex items-center justify-between gap-3'>
        <span className='text-muted-foreground'>Destination</span>
        <span className='font-semibold'>
          {destination ? formatCoordinate(destination) : 'Not set'}
        </span>
      </div>
    </div>
  );
}

function LayerMenu({
  tileLayerId,
  selectedLayerLabel,
  showHubs,
  showHeatmap,
  showBoundary,
  onTileLayerChange,
  onShowHubsChange,
  onShowHeatmapChange,
  onShowBoundaryChange
}: {
  tileLayerId: ShippingTileLayerId;
  selectedLayerLabel: string;
  showHubs: boolean;
  showHeatmap: boolean;
  showBoundary: boolean;
  onTileLayerChange: (layerId: ShippingTileLayerId) => void;
  onShowHubsChange: (value: boolean) => void;
  onShowHeatmapChange: (value: boolean) => void;
  onShowBoundaryChange: (value: boolean) => void;
}) {
  return (
    <div className='absolute right-3 top-3 z-40 flex items-center gap-2 rounded-lg border bg-card/95 p-2 shadow-sm backdrop-blur'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type='button' variant='outline' size='sm'>
            <ShippingLayerPreview layerId={tileLayerId} className='size-5' />
            {selectedLayerLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-72'>
          <DropdownMenuLabel>Base layer</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={tileLayerId}
            onValueChange={(value) => onTileLayerChange(value as ShippingTileLayerId)}
          >
            {(
              Object.entries(SHIPPING_TILE_LAYERS) as Array<
                [ShippingTileLayerId, (typeof SHIPPING_TILE_LAYERS)[ShippingTileLayerId]]
              >
            ).map(([layerId, layer]) => (
              <DropdownMenuRadioItem key={layerId} value={layerId}>
                <span className='flex min-w-0 items-center gap-3'>
                  <ShippingLayerPreview layerId={layerId} className='size-10 shrink-0' />
                  <span className='grid min-w-0 gap-0.5'>
                    <span className='truncate'>{layer.label}</span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {layer.description}
                    </span>
                  </span>
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Overlays</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={showHubs} onCheckedChange={onShowHubsChange}>
            <Icons.warehouse className='size-4' />
            Logistics hubs
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showHeatmap} onCheckedChange={onShowHeatmapChange}>
            <Icons.flame className='size-4' />
            Heatmap
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={showBoundary} onCheckedChange={onShowBoundaryChange}>
            <Icons.radar className='size-4' />
            Boundary overlay
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className='hidden items-center gap-2 rounded-md border px-2 py-1.5 md:flex'>
        <Switch checked={showBoundary} onCheckedChange={onShowBoundaryChange} />
        <span className='text-xs font-medium'>Outline</span>
      </div>
    </div>
  );
}

function RouteSummary({
  route,
  isRouting,
  origin,
  destination
}: {
  route: ShippingRouteResult | null;
  isRouting: boolean;
  origin: Coordinate | null;
  destination: Coordinate | null;
}) {
  return (
    <div className='absolute bottom-3 right-3 z-30 max-w-[calc(100%-1.5rem)] rounded-lg border bg-card/95 p-3 shadow-sm backdrop-blur md:max-w-sm'>
      <div className='flex items-center gap-2'>
        <Icons.route className='size-4 text-muted-foreground' />
        <span className='text-sm font-semibold'>Route summary</span>
        {route ? <Badge variant='outline'>{getProfileLabel(route.profile)}</Badge> : null}
      </div>
      <div className='mt-3 grid grid-cols-3 gap-2 text-xs'>
        <SummaryMetric
          label='Distance'
          value={
            route ? formatRouteDistance(route.distanceMeters) : origin && destination ? '...' : '-'
          }
        />
        <SummaryMetric
          label='Duration'
          value={route ? formatRouteDuration(route.durationSeconds) : isRouting ? '...' : '-'}
        />
        <SummaryMetric label='Source' value={route ? route.source.toUpperCase() : '-'} />
      </div>
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-md border bg-background/60 px-2 py-1.5'>
      <p className='text-muted-foreground'>{label}</p>
      <p className='mt-0.5 truncate font-semibold'>{value}</p>
    </div>
  );
}
