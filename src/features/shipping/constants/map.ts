import type {
  Coordinate,
  CountryLocation,
  HeatPoint,
  RouteProfile,
  ShippingHub,
  ShippingPointOfInterest
} from '../api/types';

export const SHIPPING_DEFAULT_CENTER: Coordinate = [-6.2088, 106.8456];
export const SHIPPING_DEFAULT_ZOOM = 11;

export const SHIPPING_CONTEXT_LOCATIONS: Array<{
  id: string;
  label: string;
  coordinate: Coordinate;
}> = [
  { id: 'ciputat', label: 'Ciputat', coordinate: [-6.3079, 106.717] },
  { id: 'jatiwarna', label: 'Jatiwarna', coordinate: [-6.3316, 106.9254] },
  { id: 'kebayoran', label: 'Kebayoran', coordinate: [-6.2447, 106.7992] },
  { id: 'cakung', label: 'Cakung', coordinate: [-6.1852, 106.939] },
  { id: 'tangerang', label: 'Tangerang', coordinate: [-6.1783, 106.6319] },
  { id: 'depok', label: 'Depok', coordinate: [-6.4025, 106.7942] }
];

export const SHIPPING_TILE_LAYERS = {
  midnight: {
    label: 'Midnight',
    description: 'High contrast operations view',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
  },
  daylight: {
    label: 'Daylight',
    description: 'Clean street and city context',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
  },
  satellite: {
    label: 'Satellite',
    description: 'Imagery for facility checks',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
  },
  terrain: {
    label: 'Terrain',
    description: 'Relief and regional movement',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap &copy; OpenStreetMap',
    maxZoom: 17
  }
} as const;

export type ShippingTileLayerId = keyof typeof SHIPPING_TILE_LAYERS;

export const ROUTE_PROFILES: Array<{
  value: RouteProfile;
  label: string;
  description: string;
}> = [
  { value: 'driving', label: 'Drive', description: 'Van and truck dispatch' },
  { value: 'cycling', label: 'Cycle', description: 'Dense urban courier' },
  { value: 'walking', label: 'Walk', description: 'Final handoff' }
];

export const LOCATION_TREE: CountryLocation[] = [
  {
    id: 'indonesia',
    label: 'Indonesia',
    center: [-2.5489, 118.0149],
    boundary: [
      [-11.0, 95.0],
      [6.1, 95.0],
      [6.1, 141.0],
      [-11.0, 141.0]
    ],
    intelligence: {
      dailyOrders: 18420,
      serviceLevel: '96.4%',
      avgTransitTime: '1.9 days',
      risk: 'Moderate',
      coverage: 'National line-haul, port, and first-mile network'
    },
    states: [
      {
        id: 'jakarta',
        countryId: 'indonesia',
        label: 'DKI Jakarta',
        center: [-6.2088, 106.8456],
        boundary: [
          [-6.36, 106.66],
          [-6.06, 106.66],
          [-6.06, 107.02],
          [-6.36, 107.02]
        ],
        intelligence: {
          dailyOrders: 6840,
          serviceLevel: '98.1%',
          avgTransitTime: '5.4 hours',
          risk: 'Low',
          coverage: 'Same-day core city and next-day outer ring'
        },
        cities: [
          {
            id: 'central-jakarta',
            stateId: 'jakarta',
            label: 'Central Jakarta',
            center: [-6.1805, 106.8284],
            boundary: [
              [-6.23, 106.78],
              [-6.14, 106.78],
              [-6.14, 106.88],
              [-6.23, 106.88]
            ],
            intelligence: {
              dailyOrders: 2210,
              serviceLevel: '99.0%',
              avgTransitTime: '3.1 hours',
              risk: 'Low',
              coverage: 'Courier dense zone with two micro-fulfillment nodes'
            }
          },
          {
            id: 'north-jakarta',
            stateId: 'jakarta',
            label: 'North Jakarta',
            center: [-6.1384, 106.8639],
            boundary: [
              [-6.2, 106.78],
              [-6.08, 106.78],
              [-6.08, 106.96],
              [-6.2, 106.96]
            ],
            intelligence: {
              dailyOrders: 1870,
              serviceLevel: '96.8%',
              avgTransitTime: '4.7 hours',
              risk: 'Moderate',
              coverage: 'Port-adjacent freight and parcel mix'
            }
          }
        ]
      },
      {
        id: 'west-java',
        countryId: 'indonesia',
        label: 'West Java',
        center: [-6.9175, 107.6191],
        boundary: [
          [-7.95, 106.25],
          [-5.9, 106.25],
          [-5.9, 108.9],
          [-7.95, 108.9]
        ],
        intelligence: {
          dailyOrders: 5140,
          serviceLevel: '95.7%',
          avgTransitTime: '1.2 days',
          risk: 'Moderate',
          coverage: 'Bandung, Bekasi, Bogor, and Cirebon corridors'
        },
        cities: [
          {
            id: 'bandung',
            stateId: 'west-java',
            label: 'Bandung',
            center: [-6.9175, 107.6191],
            boundary: [
              [-7.02, 107.52],
              [-6.82, 107.52],
              [-6.82, 107.72],
              [-7.02, 107.72]
            ],
            intelligence: {
              dailyOrders: 1680,
              serviceLevel: '96.2%',
              avgTransitTime: '7.8 hours',
              risk: 'Moderate',
              coverage: 'Urban parcels with hill-route exceptions'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'singapore',
    label: 'Singapore',
    center: [1.3521, 103.8198],
    boundary: [
      [1.18, 103.6],
      [1.48, 103.6],
      [1.48, 104.05],
      [1.18, 104.05]
    ],
    intelligence: {
      dailyOrders: 4920,
      serviceLevel: '99.2%',
      avgTransitTime: '2.7 hours',
      risk: 'Low',
      coverage: 'Islandwide same-day and airport bonded routing'
    },
    states: [
      {
        id: 'central-region',
        countryId: 'singapore',
        label: 'Central Region',
        center: [1.3048, 103.8318],
        boundary: [
          [1.25, 103.77],
          [1.36, 103.77],
          [1.36, 103.9],
          [1.25, 103.9]
        ],
        intelligence: {
          dailyOrders: 2210,
          serviceLevel: '99.5%',
          avgTransitTime: '1.9 hours',
          risk: 'Low',
          coverage: 'High-frequency commercial district deliveries'
        },
        cities: [
          {
            id: 'orchard',
            stateId: 'central-region',
            label: 'Orchard',
            center: [1.3048, 103.8318],
            boundary: [
              [1.288, 103.815],
              [1.322, 103.815],
              [1.322, 103.85],
              [1.288, 103.85]
            ],
            intelligence: {
              dailyOrders: 780,
              serviceLevel: '99.6%',
              avgTransitTime: '1.4 hours',
              risk: 'Low',
              coverage: 'Retail priority zone'
            }
          }
        ]
      }
    ]
  }
];

export const SHIPPING_POIS: ShippingPointOfInterest[] = [
  {
    id: 'tanjung-priok',
    countryId: 'indonesia',
    stateId: 'jakarta',
    cityId: 'north-jakarta',
    label: 'Tanjung Priok Port',
    kind: 'port',
    center: [-6.1044, 106.8806],
    boundary: [
      [-6.13, 106.84],
      [-6.08, 106.84],
      [-6.08, 106.92],
      [-6.13, 106.92]
    ],
    intelligence: {
      dailyOrders: 3120,
      serviceLevel: '95.9%',
      avgTransitTime: '6.2 hours',
      risk: 'Moderate',
      coverage: 'Container handoff, customs queue, and outbound parcel sorting'
    }
  },
  {
    id: 'soekarno-hatta-cargo',
    countryId: 'indonesia',
    stateId: 'jakarta',
    cityId: 'central-jakarta',
    label: 'Soekarno-Hatta Cargo',
    kind: 'airport',
    center: [-6.1275, 106.6537],
    boundary: [
      [-6.17, 106.61],
      [-6.09, 106.61],
      [-6.09, 106.7],
      [-6.17, 106.7]
    ],
    intelligence: {
      dailyOrders: 1920,
      serviceLevel: '97.8%',
      avgTransitTime: '4.6 hours',
      risk: 'Low',
      coverage: 'Air cargo induction and express outbound lane'
    }
  },
  {
    id: 'jakarta-mega-fc',
    countryId: 'indonesia',
    stateId: 'jakarta',
    cityId: 'central-jakarta',
    label: 'Jakarta Mega Fulfillment',
    kind: 'warehouse',
    center: [-6.2146, 106.8451],
    boundary: [
      [-6.235, 106.815],
      [-6.195, 106.815],
      [-6.195, 106.875],
      [-6.235, 106.875]
    ],
    intelligence: {
      dailyOrders: 4180,
      serviceLevel: '98.9%',
      avgTransitTime: '2.8 hours',
      risk: 'Low',
      coverage: 'Urban fulfillment and rider staging'
    }
  },
  {
    id: 'bandung-sortation',
    countryId: 'indonesia',
    stateId: 'west-java',
    cityId: 'bandung',
    label: 'Bandung Sortation',
    kind: 'warehouse',
    center: [-6.9462, 107.6424],
    boundary: [
      [-6.972, 107.61],
      [-6.92, 107.61],
      [-6.92, 107.675],
      [-6.972, 107.675]
    ],
    intelligence: {
      dailyOrders: 1440,
      serviceLevel: '95.6%',
      avgTransitTime: '7.2 hours',
      risk: 'Moderate',
      coverage: 'Regional sortation and Bandung city dispatch'
    }
  },
  {
    id: 'changi-cargo',
    countryId: 'singapore',
    stateId: 'central-region',
    cityId: 'orchard',
    label: 'Changi Air Cargo',
    kind: 'airport',
    center: [1.3644, 103.9915],
    boundary: [
      [1.335, 103.955],
      [1.392, 103.955],
      [1.392, 104.025],
      [1.335, 104.025]
    ],
    intelligence: {
      dailyOrders: 2380,
      serviceLevel: '99.1%',
      avgTransitTime: '2.4 hours',
      risk: 'Low',
      coverage: 'Bonded air freight and premium parcel network'
    }
  }
];

export const SHIPPING_HUBS: ShippingHub[] = [
  {
    id: 'hub-jkt-fc',
    name: 'Jakarta Mega Fulfillment',
    type: 'Fulfillment',
    coordinate: [-6.2146, 106.8451],
    volume: '4.1k/day',
    serviceLevel: '98.9%',
    status: 'Stable'
  },
  {
    id: 'hub-priok',
    name: 'Tanjung Priok Port',
    type: 'Port',
    coordinate: [-6.1044, 106.8806],
    volume: '3.1k/day',
    serviceLevel: '95.9%',
    status: 'Busy'
  },
  {
    id: 'hub-cgk',
    name: 'Soekarno-Hatta Cargo',
    type: 'Airport',
    coordinate: [-6.1275, 106.6537],
    volume: '1.9k/day',
    serviceLevel: '97.8%',
    status: 'Stable'
  },
  {
    id: 'hub-bdg',
    name: 'Bandung Sortation',
    type: 'Cross-dock',
    coordinate: [-6.9462, 107.6424],
    volume: '1.4k/day',
    serviceLevel: '95.6%',
    status: 'Watch'
  },
  {
    id: 'hub-sin',
    name: 'Changi Air Cargo',
    type: 'Airport',
    coordinate: [1.3644, 103.9915],
    volume: '2.3k/day',
    serviceLevel: '99.1%',
    status: 'Stable'
  }
];

export const SHIPPING_HEAT_POINTS: HeatPoint[] = [
  [-6.2146, 106.8451, 0.9],
  [-6.18, 106.8284, 0.75],
  [-6.1384, 106.8639, 0.72],
  [-6.1275, 106.6537, 0.58],
  [-6.9462, 107.6424, 0.52],
  [1.3048, 103.8318, 0.62],
  [1.3644, 103.9915, 0.7]
];
