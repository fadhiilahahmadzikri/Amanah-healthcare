import type { OnboardingData } from '../api/types';
import type { ShippingLabelData } from './types';

const SENDER = {
  name: 'Manage Stock Fulfillment',
  phone: '+1 (555) 019-8820',
  address: 'Dock 4, 100 Market Street, San Francisco, CA'
};

const COURIERS = ['J&T Express', 'Shopee Xpress', 'JNE Express', 'GrabExpress'];

export function buildShippingLabelData(record: OnboardingData): ShippingLabelData {
  const numericId = Number.parseInt(record.id.replace(/\D/g, ''), 10) || record.id.length;
  const trackingNumber = createTrackingNumber(record, numericId);
  const price = parseCurrency(record.price);

  return {
    id: record.id,
    courier: {
      name: COURIERS[numericId % COURIERS.length],
      service: record.status === 'Shipping' ? 'REG' : 'STANDARD'
    },
    trackingNumber,
    routeCode: `JKT-${String((numericId % 88) + 10)}-${record.status.slice(0, 3).toUpperCase()}`,
    sender: SENDER,
    receiver: {
      name: record.customer,
      address: record.address
    },
    payment: {
      method: price > 250 ? 'COD' : 'PAID',
      codAmount: price > 250 ? price : 0,
      shippingFee: 8.45
    },
    package: {
      weightKg: Number((0.4 + (numericId % 7) * 0.2).toFixed(1)),
      pieces: 1,
      note: record.product
    },
    lineItems: [
      {
        id: record.orderId,
        name: record.product,
        quantity: 1,
        value: price
      }
    ],
    codes: {
      qrPayload: `manage-stock://shipping/${trackingNumber}`,
      barcodeValue: trackingNumber
    }
  };
}

function createTrackingNumber(record: OnboardingData, numericId: number) {
  return `MS${record.orderId.replace(/\D/g, '').slice(-8).padStart(8, '0')}${String(numericId).padStart(4, '0')}`;
}

function parseCurrency(value: string) {
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}
