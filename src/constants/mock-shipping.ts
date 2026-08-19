import { faker } from '@faker-js/faker';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const JAKARTA_CENTER: [number, number] = [-6.2088, 106.8456];
const SHIPPING_FAKER_SEED = 20260622;
const SHIPPING_REF_DATE = new Date('2026-06-22T00:00:00.000Z');

function createJakartaCoordinate(): [number, number] {
  return [
    JAKARTA_CENTER[0] + faker.number.float({ min: -0.08, max: 0.08 }),
    JAKARTA_CENTER[1] + faker.number.float({ min: -0.08, max: 0.08 })
  ];
}

function createCustomerAvatarUrl(seed: string): string {
  return `https://i.pravatar.cc/160?u=${encodeURIComponent(`shipping-${seed}`)}`;
}

export type ShippingMilestone = {
  id: string;
  waktu: string;
  status: string;
  deskripsi: string;
  selesai: boolean;
  aktif: boolean;
};

export type TrackerData = {
  id: string;
  layanan: string;
  estimasi: string;
  progress?: number;
  pelanggan: {
    nama: string;
    id: string;
    alamat: string;
    foto: string;
  };
  kurir: {
    nama: string;
    plat: string;
    perusahaan: string;
  };
  koordinat: {
    mulai: [number, number];
    akhir: [number, number];
  };
  milestone: ShippingMilestone[];
};

export type OnboardingData = {
  id: string;
  customer: string;
  product: string;
  orderId: string;
  address: string;
  price: string;
  status: 'Packed' | 'Shipping' | 'Completed';
  image: string;
  startCoord: [number, number];
  endCoord: [number, number];
};

export type OnboardingMutationData = Omit<
  OnboardingData,
  'id' | 'image' | 'startCoord' | 'endCoord'
> &
  Partial<Pick<OnboardingData, 'startCoord' | 'endCoord'>>;

export const fakeShipping = {
  trackerRecords: [] as TrackerData[],
  onboardingRecords: [] as OnboardingData[],

  initialize() {
    if (this.trackerRecords.length > 0 || this.onboardingRecords.length > 0) {
      return;
    }

    faker.seed(SHIPPING_FAKER_SEED);
    faker.setDefaultRefDate(SHIPPING_REF_DATE);

    for (let i = 1; i <= 10; i++) {
      const isDelivered = faker.datatype.boolean();
      this.trackerRecords.push({
        id: `TRK-${faker.string.numeric(5)}`,
        layanan: faker.helpers.arrayElement(['Reguler Next Day', 'Same Day Delivery', 'Economy']),
        estimasi: `${faker.date.future().toLocaleDateString('id-ID')}, 14:00 WIB`,
        progress: isDelivered ? 0.92 : faker.number.float({ min: 0.16, max: 0.58 }),
        pelanggan: {
          nama: faker.person.fullName(),
          id: `CUST-${faker.string.numeric(5)}`,
          alamat: faker.location.streetAddress() + ', ' + faker.location.city(),
          foto: createCustomerAvatarUrl(`tracker-${i}`)
        },
        kurir: {
          nama: faker.person.fullName(),
          plat: `B ${faker.string.numeric(4)} CD`,
          perusahaan: faker.helpers.arrayElement(['JNE Express', 'GoSend', 'GrabExpress'])
        },
        koordinat: {
          mulai: [
            -6.2 + faker.number.float({ min: -0.05, max: 0.05 }),
            106.816666 + faker.number.float({ min: -0.05, max: 0.05 })
          ],
          akhir: [
            -6.2 + faker.number.float({ min: -0.05, max: 0.05 }),
            106.816666 + faker.number.float({ min: -0.05, max: 0.05 })
          ]
        },
        milestone: [
          {
            id: faker.string.uuid(),
            waktu: faker.date.recent().toLocaleString(),
            status: 'Pesanan Dibuat',
            deskripsi: 'Pesanan telah dibuat',
            selesai: true,
            aktif: false
          },
          {
            id: faker.string.uuid(),
            waktu: faker.date.recent().toLocaleString(),
            status: 'Kurir Ditugaskan',
            deskripsi: 'Sistem menemukan kurir',
            selesai: isDelivered,
            aktif: !isDelivered
          },
          ...(isDelivered
            ? [
                {
                  id: faker.string.uuid(),
                  waktu: faker.date.recent().toLocaleString(),
                  status: 'Terkirim',
                  deskripsi: 'Paket sampai tujuan',
                  selesai: true,
                  aktif: true
                }
              ]
            : [])
        ]
      });
    }

    for (let i = 1; i <= 30; i++) {
      const status = faker.helpers.arrayElement(['Packed', 'Shipping', 'Completed']) as
        | 'Packed'
        | 'Shipping'
        | 'Completed';
      this.onboardingRecords.push({
        id: String(i),
        customer: faker.person.fullName(),
        product: faker.commerce.productName(),
        orderId: `#0123${faker.string.numeric(5)}`,
        address: faker.location.streetAddress() + ', ' + faker.location.city(),
        price: `$${faker.commerce.price({ min: 10, max: 500 })}`,
        status: status,
        image: createCustomerAvatarUrl(`onboarding-${i}`),
        startCoord: createJakartaCoordinate(),
        endCoord: createJakartaCoordinate()
      });
    }
  },

  async getTrackerData() {
    await delay(500);
    return [...this.trackerRecords];
  },

  async getOnboardingData() {
    await delay(500);
    return [...this.onboardingRecords];
  },

  async getOnboardingById(id: string) {
    await delay(300);
    return this.onboardingRecords.find((record) => record.id === id) ?? null;
  },

  async createOnboardingData(data: OnboardingMutationData) {
    await delay(500);
    const newRecord: OnboardingData = {
      ...data,
      id: String(this.onboardingRecords.length + 1),
      image: createCustomerAvatarUrl(`onboarding-${this.onboardingRecords.length + 1}`),
      startCoord: data.startCoord ?? createJakartaCoordinate(),
      endCoord: data.endCoord ?? createJakartaCoordinate()
    };
    this.onboardingRecords.unshift(newRecord);
    return newRecord;
  },

  async updateOnboardingData(id: string, data: Partial<OnboardingData>) {
    await delay(500);
    const index = this.onboardingRecords.findIndex((record) => record.id === id);
    if (index > -1) {
      this.onboardingRecords[index] = { ...this.onboardingRecords[index], ...data };
      return this.onboardingRecords[index];
    }
    throw new Error('Not found');
  },

  async deleteOnboardingData(id: string) {
    await delay(500);
    this.onboardingRecords = this.onboardingRecords.filter((record) => record.id !== id);
    return { success: true };
  },

  advanceTrackingProgress(id?: string) {
    const targets = id
      ? this.trackerRecords.filter((record) => record.id === id)
      : this.trackerRecords.slice(0, 3);

    targets.forEach((record) => {
      record.progress = Math.min(0.98, (record.progress ?? 0.18) + 0.08);
    });

    return targets[0]?.progress ?? 0;
  }
};

fakeShipping.initialize();
