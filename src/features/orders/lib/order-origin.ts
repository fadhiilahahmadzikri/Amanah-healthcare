import type { Order } from '@/constants/mock-db';

type OrderOrigin = {
  countryName: string;
  countryCode: string;
  countryFlag: string;
  countryFlagUrl: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
};

const ORDER_ORIGINS: OrderOrigin[] = [
  {
    countryName: 'United States',
    countryCode: 'US',
    countryFlag: '🇺🇸',
    countryFlagUrl: 'https://flagcdn.com/us.svg',
    city: 'New York',
    region: 'New York',
    latitude: 40.7128,
    longitude: -74.006
  },
  {
    countryName: 'Germany',
    countryCode: 'DE',
    countryFlag: '🇩🇪',
    countryFlagUrl: 'https://flagcdn.com/de.svg',
    city: 'Berlin',
    region: 'Berlin',
    latitude: 52.52,
    longitude: 13.405
  },
  {
    countryName: 'Japan',
    countryCode: 'JP',
    countryFlag: '🇯🇵',
    countryFlagUrl: 'https://flagcdn.com/jp.svg',
    city: 'Tokyo',
    region: 'Kanto',
    latitude: 35.6762,
    longitude: 139.6503
  },
  {
    countryName: 'Indonesia',
    countryCode: 'ID',
    countryFlag: '🇮🇩',
    countryFlagUrl: 'https://flagcdn.com/id.svg',
    city: 'Jakarta',
    region: 'DKI Jakarta',
    latitude: -6.2088,
    longitude: 106.8456
  },
  {
    countryName: 'Singapore',
    countryCode: 'SG',
    countryFlag: '🇸🇬',
    countryFlagUrl: 'https://flagcdn.com/sg.svg',
    city: 'Singapore',
    region: 'Central Region',
    latitude: 1.3521,
    longitude: 103.8198
  },
  {
    countryName: 'Australia',
    countryCode: 'AU',
    countryFlag: '🇦🇺',
    countryFlagUrl: 'https://flagcdn.com/au.svg',
    city: 'Sydney',
    region: 'New South Wales',
    latitude: -33.8688,
    longitude: 151.2093
  },
  {
    countryName: 'United Kingdom',
    countryCode: 'GB',
    countryFlag: '🇬🇧',
    countryFlagUrl: 'https://flagcdn.com/gb.svg',
    city: 'London',
    region: 'England',
    latitude: 51.5072,
    longitude: -0.1276
  },
  {
    countryName: 'France',
    countryCode: 'FR',
    countryFlag: '🇫🇷',
    countryFlagUrl: 'https://flagcdn.com/fr.svg',
    city: 'Paris',
    region: 'Ile-de-France',
    latitude: 48.8566,
    longitude: 2.3522
  }
];

export function enrichOrderPresentationData(order: Order): Order {
  const origin = order.countryCode
    ? (ORDER_ORIGINS.find((item) => item.countryCode === order.countryCode) ??
      getOrderOrigin(order.id))
    : getOrderOrigin(order.id);

  return {
    ...order,
    customerAvatarUrl:
      order.customerAvatarUrl || buildCustomerAvatarUrl(order.customerId || order.id),
    countryName: order.countryName ?? origin.countryName,
    countryCode: order.countryCode ?? origin.countryCode,
    countryFlag: order.countryFlag ?? origin.countryFlag,
    countryFlagUrl: order.countryFlagUrl ?? origin.countryFlagUrl,
    geographicOrigin: order.geographicOrigin ?? {
      city: origin.city,
      region: origin.region,
      latitude: origin.latitude,
      longitude: origin.longitude
    }
  };
}

export function buildCustomerAvatarUrl(seed: string): string {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(seed)}`;
}

function getOrderOrigin(seed: string): OrderOrigin {
  return ORDER_ORIGINS[getStableIndex(seed, ORDER_ORIGINS.length)];
}

function getStableIndex(seed: string, length: number): number {
  const value = Array.from(seed).reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) % 100000;
  }, 7);

  return value % length;
}
