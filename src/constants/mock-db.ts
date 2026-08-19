export type Category = {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  brand?: string;
  price: number;
  comparePrice?: number;
  cost: number;
  currentStock: number;
  minStock: number;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'Active' | 'Draft' | 'Archived';
  featured?: boolean;
};

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'PURCHASE' | 'RETURN';

export type StockMovement = {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  notes: string;
  createdAt: string;
  createdBy: string;
};

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerAvatarUrl?: string;
  countryName?: string;
  countryCode?: string;
  countryFlag?: string;
  countryFlagUrl?: string;
  geographicOrigin?: {
    city: string;
    region: string;
    latitude: number;
    longitude: number;
  };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  status: OrderStatus;
  trackingNumber?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalSpend: number;
  ordersCount: number;
  createdAt: string;
  company?: string;
  avatarUrl?: string;
  orders?: number;
  totalSpent?: number;
  status?: 'Active' | 'Inactive';
  joinedAt?: string;
};

export type RevenueTrend = {
  month: string;
  revenue: number;
  target: number;
};

export type CustomerGrowth = {
  month: string;
  newCustomers: number;
  returningCustomers: number;
};

const MOCK_NOW = Date.UTC(2026, 5, 22, 0, 0, 0, 0);
const DAY_MS = 86400000;

const CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Industrial',
    description: 'Our bat-friendly Shoes ensures drab comfort for your pets',
    createdAt: '2025-12-20T05:11:40.396Z'
  },
  {
    id: 'cat-2',
    name: 'Electronics',
    description: 'Innovative Gloves featuring stained technology and Bamboo construction',
    createdAt: '2025-10-27T17:51:01.833Z'
  },
  {
    id: 'cat-3',
    name: 'Outdoors',
    description:
      'Featuring Mercury-enhanced technology, our Chicken offers unparalleled yearly performance',
    createdAt: '2025-08-06T01:27:41.673Z'
  },
  {
    id: 'cat-4',
    name: 'Jewelry',
    description: 'Experience the violet brilliance of our Sausages, perfect for gray environments',
    createdAt: '2025-10-23T22:35:55.317Z'
  },
  {
    id: 'cat-5',
    name: 'Games',
    description: 'The George Bike is the latest in a series of spanish products from Torp LLC',
    createdAt: '2026-04-01T19:47:46.722Z'
  },
  {
    id: 'cat-6',
    name: 'Clothing',
    description: 'Our golden-inspired Shirt brings a taste of luxury to your firsthand lifestyle',
    createdAt: '2026-05-23T14:22:11.848Z'
  },
  {
    id: 'cat-7',
    name: 'Kids',
    description: "Boyer - Abbott's most advanced Soap technology increases sudden capabilities",
    createdAt: '2026-01-27T10:04:18.799Z'
  },
  {
    id: 'cat-8',
    name: 'Garden',
    description:
      'The Muhammad Shirt is the latest in a series of sandy products from Raynor - Fisher',
    createdAt: '2025-08-28T23:56:43.837Z'
  },
  {
    id: 'cat-9',
    name: 'Industrial',
    description: 'Savor the sour essence in our Gloves, designed for better culinary adventures',
    createdAt: '2025-10-15T05:39:23.417Z'
  },
  {
    id: 'cat-10',
    name: 'Shoes',
    description: 'Our bear-friendly Pants ensures creamy comfort for your pets',
    createdAt: '2025-10-03T00:15:42.877Z'
  },
  {
    id: 'cat-11',
    name: 'Home',
    description:
      'Introducing the Uzbekistan-inspired Bike, blending educated style with local craftsmanship',
    createdAt: '2026-04-15T00:02:13.972Z'
  },
  {
    id: 'cat-12',
    name: 'Garden',
    description: 'New Sausages model with 4 GB RAM, 878 GB storage, and wiggly features',
    createdAt: '2026-06-16T13:26:22.795Z'
  },
  {
    id: 'cat-13',
    name: 'Computers',
    description: 'New Pizza model with 31 GB RAM, 520 GB storage, and chilly features',
    createdAt: '2026-04-30T08:40:51.108Z'
  },
  {
    id: 'cat-14',
    name: 'Beauty',
    description:
      'Introducing the Slovenia-inspired Chicken, blending unkempt style with local craftsmanship',
    createdAt: '2025-09-19T17:41:21.178Z'
  },
  {
    id: 'cat-15',
    name: 'Kids',
    description: 'Stylish Bike designed to make you stand out with confused looks',
    createdAt: '2026-03-05T13:37:14.856Z'
  },
  {
    id: 'cat-16',
    name: 'Home',
    description: 'The Liam Chair is the latest in a series of focused products from Hilpert Group',
    createdAt: '2025-10-10T16:30:54.474Z'
  },
  {
    id: 'cat-17',
    name: 'Clothing',
    description: 'Discover the well-worn new Soap with an exciting mix of Steel ingredients',
    createdAt: '2025-09-13T03:04:24.490Z'
  },
  {
    id: 'cat-18',
    name: 'Sports',
    description:
      'The turquoise Computer combines Falkland Islands (Malvinas) aesthetics with Hydrogen-based durability',
    createdAt: '2026-03-28T10:32:30.444Z'
  },
  {
    id: 'cat-19',
    name: 'Computers',
    description: 'Discover the smoggy new Computer with an exciting mix of Wooden ingredients',
    createdAt: '2026-01-05T20:03:22.355Z'
  },
  {
    id: 'cat-20',
    name: 'Home',
    description: 'Ergonomic Pizza made with Aluminum for all-day kaleidoscopic support',
    createdAt: '2025-06-27T19:31:19.439Z'
  }
];

const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'Z9U9GDPY',
    name: 'Refined Metal Gloves',
    categoryId: 'cat-2',
    price: 241.5,
    cost: 47.79,
    currentStock: 103,
    minStock: 19,
    description: 'Savor the sour essence in our Bacon, designed for cautious culinary adventures',
    imageUrl: 'https://picsum.photos/seed/3uAXm25m/500/500',
    createdAt: '2026-01-01T16:02:26.623Z',
    status: 'Archived'
  },
  {
    id: 'prod-2',
    sku: 'B905M2W0',
    name: 'Rustic Metal Pants',
    categoryId: 'cat-3',
    price: 360.82,
    cost: 56.25,
    currentStock: 975,
    minStock: 20,
    description:
      'Experience the mint green brilliance of our Cheese, perfect for radiant environments',
    imageUrl: 'https://picsum.photos/seed/8IroFWG/500/500',
    createdAt: '2025-12-17T18:40:24.135Z',
    status: 'Archived'
  },
  {
    id: 'prod-3',
    sku: 'RVRXIARE',
    name: 'Practical Bronze Pants',
    categoryId: 'cat-4',
    price: 438.0,
    cost: 38.09,
    currentStock: 67,
    minStock: 36,
    description: "Hartmann and Sons's most advanced Fish technology increases severe capabilities",
    imageUrl: 'https://picsum.photos/seed/cFMLdv/500/500',
    createdAt: '2025-12-16T08:59:25.692Z',
    status: 'Draft'
  },
  {
    id: 'prod-4',
    sku: 'R4W76U17',
    name: 'Licensed Steel Soap',
    categoryId: 'cat-3',
    price: 156.89,
    cost: 81.89,
    currentStock: 979,
    minStock: 26,
    description: "Thiel LLC's most advanced Table technology increases slow capabilities",
    imageUrl: 'https://picsum.photos/seed/13SzO/500/500',
    createdAt: '2025-12-02T10:29:07.699Z',
    status: 'Archived'
  },
  {
    id: 'prod-5',
    sku: 'WFMXNLNM',
    name: 'Recycled Bronze Pizza',
    categoryId: 'cat-4',
    price: 358.29,
    cost: 11.47,
    currentStock: 863,
    minStock: 42,
    description:
      'Featuring Cobalt-enhanced technology, our Chair offers unparalleled glass performance',
    imageUrl: 'https://picsum.photos/seed/xBvDP2Qt6T/500/500',
    createdAt: '2026-05-19T21:29:00.782Z',
    status: 'Active'
  },
  {
    id: 'prod-6',
    sku: '44XMZAL9',
    name: 'Generic Bronze Chips',
    categoryId: 'cat-2',
    price: 233.09,
    cost: 13.03,
    currentStock: 902,
    minStock: 43,
    description: 'Experience the green brilliance of our Hat, perfect for shadowy environments',
    imageUrl: 'https://picsum.photos/seed/ZgEjayf/500/500',
    createdAt: '2026-04-07T23:13:59.918Z',
    status: 'Archived'
  },
  {
    id: 'prod-7',
    sku: 'CHVQPL19',
    name: 'Generic Steel Computer',
    categoryId: 'cat-2',
    price: 456.6,
    cost: 92.29,
    currentStock: 285,
    minStock: 40,
    description: 'Handmade Chips designed with Concrete for burly performance',
    imageUrl: 'https://picsum.photos/seed/ZHl0uc95R/500/500',
    createdAt: '2026-04-04T04:09:53.208Z',
    status: 'Active'
  },
  {
    id: 'prod-8',
    sku: 'D55PZEFP',
    name: 'Luxurious Cotton Chicken',
    categoryId: 'cat-3',
    price: 211.95,
    cost: 95.33,
    currentStock: 987,
    minStock: 20,
    description: 'Our elephant-friendly Table ensures candid comfort for your pets',
    imageUrl: 'https://picsum.photos/seed/WC6dgnHv/500/500',
    createdAt: '2025-12-13T09:24:40.713Z',
    status: 'Archived'
  },
  {
    id: 'prod-9',
    sku: '08YWIGZ9',
    name: 'Unbranded Bronze Hat',
    categoryId: 'cat-5',
    price: 105.4,
    cost: 54.79,
    currentStock: 495,
    minStock: 30,
    description:
      "Simonis - Strosin's most advanced Gloves technology increases silver capabilities",
    imageUrl: 'https://picsum.photos/seed/TDxOxxT2/500/500',
    createdAt: '2025-12-19T01:40:15.757Z',
    status: 'Active'
  },
  {
    id: 'prod-10',
    sku: 'C3LJOSYN',
    name: 'Licensed Plastic Keyboard',
    categoryId: 'cat-4',
    price: 372.57,
    cost: 31.85,
    currentStock: 503,
    minStock: 44,
    description: 'Professional-grade Ball perfect for sophisticated training and recreational use',
    imageUrl: 'https://picsum.photos/seed/Gcm68A/500/500',
    createdAt: '2025-07-04T02:55:25.917Z',
    status: 'Archived'
  },
  {
    id: 'prod-11',
    sku: 'KE2F9RKX',
    name: 'Oriental Aluminum Sausages',
    categoryId: 'cat-5',
    price: 112.79,
    cost: 95.46,
    currentStock: 263,
    minStock: 50,
    description: 'Our bird-friendly Bacon ensures spotless comfort for your pets',
    imageUrl: 'https://picsum.photos/seed/RFFvMv/500/500',
    createdAt: '2025-07-20T16:03:48.492Z',
    status: 'Draft'
  },
  {
    id: 'prod-12',
    sku: 'KZ6VE1QQ',
    name: 'Licensed Cotton Hat',
    categoryId: 'cat-3',
    price: 188.3,
    cost: 97.75,
    currentStock: 780,
    minStock: 14,
    description: 'Stylish Mouse designed to make you stand out with strict looks',
    imageUrl: 'https://picsum.photos/seed/qjabcJV/500/500',
    createdAt: '2026-03-24T00:01:02.747Z',
    status: 'Archived'
  },
  {
    id: 'prod-13',
    sku: 'D8PLLOO7',
    name: 'Small Bamboo Bacon',
    categoryId: 'cat-3',
    price: 97.65,
    cost: 49.0,
    currentStock: 466,
    minStock: 19,
    description:
      'The Streamlined client-server matrix Ball offers reliable performance and glass design',
    imageUrl: 'https://picsum.photos/seed/6EBz0/500/500',
    createdAt: '2025-09-17T13:59:52.398Z',
    status: 'Active'
  },
  {
    id: 'prod-14',
    sku: 'WO3VU8ME',
    name: 'Frozen Metal Pizza',
    categoryId: 'cat-2',
    price: 425.8,
    cost: 37.19,
    currentStock: 481,
    minStock: 26,
    description:
      'The sleek and circular Salad comes with white LED lighting for smart functionality',
    imageUrl: 'https://picsum.photos/seed/II3QZFKc1S/500/500',
    createdAt: '2025-07-28T16:33:37.816Z',
    status: 'Active'
  },
  {
    id: 'prod-15',
    sku: 'BAQPL75K',
    name: 'Small Bronze Shirt',
    categoryId: 'cat-5',
    price: 190.29,
    cost: 47.69,
    currentStock: 708,
    minStock: 34,
    description: 'New black Shirt with ergonomic design for rosy comfort',
    imageUrl: 'https://picsum.photos/seed/CSCKCq4f/500/500',
    createdAt: '2025-12-14T18:26:07.049Z',
    status: 'Active'
  },
  {
    id: 'prod-16',
    sku: 'KO10WIWD',
    name: 'Modern Cotton Fish',
    categoryId: 'cat-5',
    price: 67.35,
    cost: 52.19,
    currentStock: 113,
    minStock: 44,
    description: 'Ergonomic Chips made with Plastic for all-day prestigious support',
    imageUrl: 'https://picsum.photos/seed/fs1ljNM065/500/500',
    createdAt: '2026-03-27T19:53:55.115Z',
    status: 'Archived'
  },
  {
    id: 'prod-17',
    sku: 'ZJFO1E9F',
    name: 'Incredible Marble Hat',
    categoryId: 'cat-1',
    price: 319.79,
    cost: 99.89,
    currentStock: 536,
    minStock: 18,
    description: 'Discover the whole new Shirt with an exciting mix of Plastic ingredients',
    imageUrl: 'https://picsum.photos/seed/vGduzqg/500/500',
    createdAt: '2025-07-24T00:32:39.680Z',
    status: 'Archived'
  },
  {
    id: 'prod-18',
    sku: 'BCOXQKKM',
    name: 'Frozen Ceramic Bacon',
    categoryId: 'cat-5',
    price: 22.55,
    cost: 90.49,
    currentStock: 389,
    minStock: 44,
    description: 'Soft Table designed with Plastic for sunny performance',
    imageUrl: 'https://picsum.photos/seed/h2sfl1HHj/500/500',
    createdAt: '2025-07-19T03:34:53.475Z',
    status: 'Active'
  },
  {
    id: 'prod-19',
    sku: 'SLYV68JO',
    name: 'Sleek Gold Table',
    categoryId: 'cat-4',
    price: 98.79,
    cost: 69.99,
    currentStock: 575,
    minStock: 45,
    description: 'Discover the snake-like agility of our Cheese, perfect for colorless users',
    imageUrl: 'https://picsum.photos/seed/Qej3h4uLK/500/500',
    createdAt: '2026-04-28T23:15:33.132Z',
    status: 'Draft'
  },
  {
    id: 'prod-20',
    sku: 'QSO78FE4',
    name: 'Luxurious Metal Chips',
    categoryId: 'cat-4',
    price: 337.75,
    cost: 82.55,
    currentStock: 238,
    minStock: 15,
    description:
      'Introducing the Palestine-inspired Gloves, blending intrepid style with local craftsmanship',
    imageUrl: 'https://picsum.photos/seed/MGookqj8z/500/500',
    createdAt: '2025-11-10T23:41:10.274Z',
    status: 'Active'
  },
  {
    id: 'prod-21',
    sku: 'J4SUTS3A',
    name: 'Modern Granite Bacon',
    categoryId: 'cat-3',
    price: 254.39,
    cost: 11.85,
    currentStock: 570,
    minStock: 47,
    description: 'Savor the tender essence in our Cheese, designed for gifted culinary adventures',
    imageUrl: 'https://picsum.photos/seed/BAb5TmqXq/500/500',
    createdAt: '2026-03-24T19:56:16.914Z',
    status: 'Draft'
  },
  {
    id: 'prod-22',
    sku: 'UEBIO4IF',
    name: 'Frozen Rubber Ball',
    categoryId: 'cat-1',
    price: 246.49,
    cost: 6.99,
    currentStock: 427,
    minStock: 44,
    description: 'The teal Salad combines Tokelau aesthetics with Phosphorus-based durability',
    imageUrl: 'https://picsum.photos/seed/Lsw3b/500/500',
    createdAt: '2025-11-22T03:13:48.339Z',
    status: 'Archived'
  },
  {
    id: 'prod-23',
    sku: '7O82OUFL',
    name: 'Frozen Bronze Keyboard',
    categoryId: 'cat-1',
    price: 130.39,
    cost: 84.28,
    currentStock: 847,
    minStock: 33,
    description: 'Introducing the Guam-inspired Car, blending that style with local craftsmanship',
    imageUrl: 'https://picsum.photos/seed/wtj2X/500/500',
    createdAt: '2025-09-07T22:09:40.746Z',
    status: 'Draft'
  },
  {
    id: 'prod-24',
    sku: 'LJS5UXHD',
    name: 'Small Steel Sausages',
    categoryId: 'cat-1',
    price: 170.8,
    cost: 80.55,
    currentStock: 438,
    minStock: 41,
    description: 'Intelligent Keyboard designed with Gold for husky performance',
    imageUrl: 'https://picsum.photos/seed/2GUegk/500/500',
    createdAt: '2026-04-06T22:46:14.411Z',
    status: 'Archived'
  },
  {
    id: 'prod-25',
    sku: 'X4RZORP2',
    name: 'Generic Ceramic Bacon',
    categoryId: 'cat-4',
    price: 466.45,
    cost: 9.49,
    currentStock: 119,
    minStock: 22,
    description: "Reichert LLC's most advanced Keyboard technology increases bulky capabilities",
    imageUrl: 'https://picsum.photos/seed/V13GzU/500/500',
    createdAt: '2026-03-31T22:48:24.415Z',
    status: 'Active'
  }
];

const STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-1',
    productId: 'prod-1',
    type: 'IN',
    quantity: 150,
    previousStock: 0,
    newStock: 150,
    notes: 'Initial stock',
    createdAt: new Date(MOCK_NOW - DAY_MS).toISOString(),
    createdBy: 'System'
  },
  {
    id: 'sm-2',
    productId: 'prod-2',
    type: 'IN',
    quantity: 5,
    previousStock: 0,
    newStock: 5,
    notes: 'Initial stock',
    createdAt: new Date(MOCK_NOW - DAY_MS).toISOString(),
    createdBy: 'System'
  }
];

const CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-0101',
    address: '123 Main St, Springfield',
    totalSpend: 150.0,
    ordersCount: 2,
    createdAt: new Date(MOCK_NOW - 30 * DAY_MS).toISOString()
  },
  {
    id: 'cust-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-0102',
    address: '456 Oak Ave, Shelbyville',
    totalSpend: 89.99,
    ordersCount: 1,
    createdAt: new Date(MOCK_NOW - 15 * DAY_MS).toISOString()
  },
  {
    id: 'cust-3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '555-0103',
    address: '789 Pine Rd, Capital City',
    totalSpend: 250.5,
    ordersCount: 3,
    createdAt: new Date(MOCK_NOW - 5 * DAY_MS).toISOString()
  },
  {
    id: 'cust-4',
    name: 'Bob Brown',
    email: 'bob@example.com',
    phone: '555-0104',
    address: '321 Elm Blvd, Riverside',
    totalSpend: 45.0,
    ordersCount: 1,
    createdAt: new Date(MOCK_NOW - 2 * DAY_MS).toISOString()
  },
  {
    id: 'cust-5',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    phone: '555-0105',
    address: '654 Maple Dr, Lakeside',
    totalSpend: 120.0,
    ordersCount: 2,
    createdAt: new Date(MOCK_NOW - DAY_MS).toISOString()
  }
];

const ORDERS: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-001',
    customerId: 'cust-4',
    customerName: 'Christy Schaden',
    customerPhone: '936-730-5512 x30400',
    customerAddress: '599 Kaci Camp',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/36735021',
    totalAmount: 19,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '3C35QCI96E',
    items: [
      {
        id: 'ti-ba6d96db-3a71-4443-8614-3e8bfcc473d2',
        productId: 'prod-11',
        quantity: 1,
        unitPrice: 19,
        subtotal: 19
      }
    ],
    createdAt: '2026-01-28T04:38:00.000Z',
    updatedAt: '2026-01-29T04:38:00.000Z'
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-002',
    customerId: 'cust-9',
    customerName: 'Conrad McGlynn',
    customerPhone: '429.228.7887 x7495',
    customerAddress: '783 N Lincoln Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/36813498',
    totalAmount: 418,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'SHIPPED',
    trackingNumber: 'SGF89A0GY2',
    items: [
      {
        id: 'ti-26ed8c83-c565-45a9-b88f-ccb81fe52846',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 36,
        subtotal: 72
      },
      {
        id: 'ti-e719a50f-3a2a-40a2-974b-7333e7a3718d',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 106,
        subtotal: 106
      },
      {
        id: 'ti-eec7c322-cab6-41ae-b2f5-cf02e149dbd5',
        productId: 'prod-3',
        quantity: 3,
        unitPrice: 80,
        subtotal: 240
      }
    ],
    createdAt: '2026-01-22T13:49:00.000Z',
    updatedAt: '2026-01-23T13:49:00.000Z'
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-003',
    customerId: 'cust-7',
    customerName: 'Jill Pouros',
    customerPhone: '(937) 219-0762 x601',
    customerAddress: '68019 Towne Crossroad',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/58.jpg',
    totalAmount: 64,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'TVDR8RYFVC',
    items: [
      {
        id: 'ti-513a6654-d378-4a17-958a-723de22e37e2',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 32,
        subtotal: 64
      }
    ],
    createdAt: '2026-01-22T07:46:00.000Z',
    updatedAt: '2026-01-23T07:46:00.000Z'
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-004',
    customerId: 'cust-3',
    customerName: 'Nellie Welch MD',
    customerPhone: '300.488.7720',
    customerAddress: '401 Evalyn Harbors',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/15.jpg',
    totalAmount: 348,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'NP990AJS65',
    items: [
      {
        id: 'ti-843b9616-2e4f-4c16-b9ed-048aa9d518f6',
        productId: 'prod-10',
        quantity: 1,
        unitPrice: 28,
        subtotal: 28
      },
      {
        id: 'ti-4e22bcb9-2611-42b1-b338-351c5359c47a',
        productId: 'prod-3',
        quantity: 3,
        unitPrice: 91,
        subtotal: 273
      },
      {
        id: 'ti-78547834-990d-4c1c-b69f-acbaa72ab8bb',
        productId: 'prod-16',
        quantity: 1,
        unitPrice: 47,
        subtotal: 47
      }
    ],
    createdAt: '2026-01-15T00:05:00.000Z',
    updatedAt: '2026-01-16T00:05:00.000Z'
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-005',
    customerId: 'cust-2',
    customerName: 'Yolanda Kunze',
    customerPhone: '1-372-423-3963 x9004',
    customerAddress: '226 Rosamond Rue',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/52.jpg',
    totalAmount: 485,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    trackingNumber: 'W14S3RLA2C',
    items: [
      {
        id: 'ti-d8f00744-a188-4359-9e67-4663c970daa6',
        productId: 'prod-24',
        quantity: 1,
        unitPrice: 86,
        subtotal: 86
      },
      {
        id: 'ti-dd57c923-3db8-4576-96a7-e3a20e38a3b8',
        productId: 'prod-17',
        quantity: 3,
        unitPrice: 56,
        subtotal: 168
      },
      {
        id: 'ti-bc679bc0-b2b9-445b-97ea-ba1b70f69ce7',
        productId: 'prod-5',
        quantity: 3,
        unitPrice: 77,
        subtotal: 231
      }
    ],
    createdAt: '2026-01-10T03:21:00.000Z',
    updatedAt: '2026-01-11T03:21:00.000Z'
  },
  {
    id: 'ord-6',
    orderNumber: 'ORD-006',
    customerId: 'cust-9',
    customerName: 'Gustavo Goldner',
    customerPhone: '518-372-5088 x85323',
    customerAddress: '56636 Ali Junction',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/61660316',
    totalAmount: 224,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    trackingNumber: 'PYAA7G3YXN',
    items: [
      {
        id: 'ti-d3749703-c0f5-4173-b51f-ed4a9dd79636',
        productId: 'prod-11',
        quantity: 2,
        unitPrice: 82,
        subtotal: 164
      },
      {
        id: 'ti-aa75cabe-12f1-4cec-967e-039732cb6e0c',
        productId: 'prod-18',
        quantity: 1,
        unitPrice: 50,
        subtotal: 50
      },
      {
        id: 'ti-cb9497bd-d731-4dfa-b87f-6fd04ab7fc2b',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 10,
        subtotal: 10
      }
    ],
    createdAt: '2026-01-04T01:02:00.000Z',
    updatedAt: '2026-01-05T01:02:00.000Z'
  },
  {
    id: 'ord-7',
    orderNumber: 'ORD-007',
    customerId: 'cust-16',
    customerName: 'Jaiden Roob',
    customerPhone: '852.398.0411 x995',
    customerAddress: '93162 Pollich-Kirlin Canyon',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/62612564',
    totalAmount: 154,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'IPHK0OVX3D',
    items: [
      {
        id: 'ti-3cd5f245-f699-4ede-8133-4dcfd33a9167',
        productId: 'prod-24',
        quantity: 2,
        unitPrice: 77,
        subtotal: 154
      }
    ],
    createdAt: '2026-01-08T21:41:00.000Z',
    updatedAt: '2026-01-09T21:41:00.000Z'
  },
  {
    id: 'ord-8',
    orderNumber: 'ORD-008',
    customerId: 'cust-1',
    customerName: 'Glen Dare',
    customerPhone: '(716) 293-1495 x836',
    customerAddress: '130 Mae Well',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/13326534',
    totalAmount: 464,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'GWR2J6AO1O',
    items: [
      {
        id: 'ti-b46819b2-5bc0-4caa-a1dd-3161d222e2b6',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 105,
        subtotal: 105
      },
      {
        id: 'ti-83425bef-916c-4746-bdb3-734c322d3721',
        productId: 'prod-19',
        quantity: 3,
        unitPrice: 96,
        subtotal: 288
      },
      {
        id: 'ti-0a9316fd-8fbe-4854-a0b5-c6e32c5cebf9',
        productId: 'prod-3',
        quantity: 1,
        unitPrice: 71,
        subtotal: 71
      }
    ],
    createdAt: '2026-01-16T03:39:00.000Z',
    updatedAt: '2026-01-17T03:39:00.000Z'
  },
  {
    id: 'ord-9',
    orderNumber: 'ORD-009',
    customerId: 'cust-20',
    customerName: 'Ms. Anais Reinger I',
    customerPhone: '966.512.0889',
    customerAddress: '5256 Ayana Alley',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/18.jpg',
    totalAmount: 128,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '82FL1KL8TT',
    items: [
      {
        id: 'ti-add5b311-41a3-438b-89de-57fc309ef1df',
        productId: 'prod-6',
        quantity: 2,
        unitPrice: 64,
        subtotal: 128
      }
    ],
    createdAt: '2026-01-10T15:12:00.000Z',
    updatedAt: '2026-01-11T15:12:00.000Z'
  },
  {
    id: 'ord-10',
    orderNumber: 'ORD-010',
    customerId: 'cust-7',
    customerName: 'Giuseppe Fay',
    customerPhone: '377.946.7449',
    customerAddress: '785 Vicki Mews',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/93.jpg',
    totalAmount: 79,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'NUEJHGBQNY',
    items: [
      {
        id: 'ti-955b05b9-e936-4524-a85c-079af53ee990',
        productId: 'prod-7',
        quantity: 1,
        unitPrice: 79,
        subtotal: 79
      }
    ],
    createdAt: '2026-01-13T10:07:00.000Z',
    updatedAt: '2026-01-14T10:07:00.000Z'
  },
  {
    id: 'ord-11',
    orderNumber: 'ORD-011',
    customerId: 'cust-12',
    customerName: 'Miss Milan Larson',
    customerPhone: '(487) 658-5493 x35233',
    customerAddress: '769 Ethel Mountains',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/8847112',
    totalAmount: 260,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'VHUIZP252O',
    items: [
      {
        id: 'ti-06651b87-79dd-41c1-aec8-2ba19463a0bf',
        productId: 'prod-11',
        quantity: 3,
        unitPrice: 30,
        subtotal: 90
      },
      {
        id: 'ti-d34022b1-4c82-4254-89bd-49fca708baae',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 12,
        subtotal: 36
      },
      {
        id: 'ti-2b88a00d-d976-4aed-8f5a-305d629d168c',
        productId: 'prod-18',
        quantity: 2,
        unitPrice: 67,
        subtotal: 134
      }
    ],
    createdAt: '2026-01-16T14:33:00.000Z',
    updatedAt: '2026-01-17T14:33:00.000Z'
  },
  {
    id: 'ord-12',
    orderNumber: 'ORD-012',
    customerId: 'cust-6',
    customerName: 'Lura Gutmann',
    customerPhone: '1-758-803-5998 x0466',
    customerAddress: '56310 Cliff Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/80.jpg',
    totalAmount: 103,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: '3WN7CAQEOO',
    items: [
      {
        id: 'ti-56ea3cbc-36a2-4fd1-a55b-27a8df04f6b3',
        productId: 'prod-17',
        quantity: 1,
        unitPrice: 103,
        subtotal: 103
      }
    ],
    createdAt: '2026-01-17T16:02:00.000Z',
    updatedAt: '2026-01-18T16:02:00.000Z'
  },
  {
    id: 'ord-13',
    orderNumber: 'ORD-013',
    customerId: 'cust-12',
    customerName: 'Dr. Willie Steuber',
    customerPhone: '571-816-8179 x659',
    customerAddress: '3303 Hilll Park',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/72.jpg',
    totalAmount: 164,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'JOR02RGK64',
    items: [
      {
        id: 'ti-292d3cc8-baae-44ea-8207-018b5e24b6b3',
        productId: 'prod-21',
        quantity: 2,
        unitPrice: 62,
        subtotal: 124
      },
      {
        id: 'ti-de73b165-f6a6-4ce6-bf57-0783a4d32c3a',
        productId: 'prod-20',
        quantity: 1,
        unitPrice: 40,
        subtotal: 40
      }
    ],
    createdAt: '2026-01-12T08:44:00.000Z',
    updatedAt: '2026-01-13T08:44:00.000Z'
  },
  {
    id: 'ord-14',
    orderNumber: 'ORD-014',
    customerId: 'cust-20',
    customerName: 'Jamey Hartmann',
    customerPhone: '1-845-640-1915 x83831',
    customerAddress: '137 Wellington Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/11.jpg',
    totalAmount: 136,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'LZ1WB220YZ',
    items: [
      {
        id: 'ti-e97f3e65-4856-4636-85a8-707c5565bf69',
        productId: 'prod-15',
        quantity: 2,
        unitPrice: 68,
        subtotal: 136
      }
    ],
    createdAt: '2026-01-08T13:56:00.000Z',
    updatedAt: '2026-01-09T13:56:00.000Z'
  },
  {
    id: 'ord-15',
    orderNumber: 'ORD-015',
    customerId: 'cust-5',
    customerName: 'Ally Wolff',
    customerPhone: '(540) 442-9159',
    customerAddress: '64638 Zachariah Spurs',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/97.jpg',
    totalAmount: 118,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'GJVC1PLZKS',
    items: [
      {
        id: 'ti-e332488b-bd39-49d4-b51b-3d0c7c713883',
        productId: 'prod-19',
        quantity: 2,
        unitPrice: 59,
        subtotal: 118
      }
    ],
    createdAt: '2026-01-28T23:10:00.000Z',
    updatedAt: '2026-01-29T23:10:00.000Z'
  },
  {
    id: 'ord-16',
    orderNumber: 'ORD-016',
    customerId: 'cust-17',
    customerName: 'Angel Von',
    customerPhone: '(427) 650-7798 x815',
    customerAddress: '289 Olivia Estate',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/26923688',
    totalAmount: 51,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'AUZPSIG910',
    items: [
      {
        id: 'ti-57cf4142-93f1-4c14-ad41-3b76cab037e3',
        productId: 'prod-21',
        quantity: 1,
        unitPrice: 51,
        subtotal: 51
      }
    ],
    createdAt: '2026-01-06T17:56:00.000Z',
    updatedAt: '2026-01-07T17:56:00.000Z'
  },
  {
    id: 'ord-17',
    orderNumber: 'ORD-017',
    customerId: 'cust-12',
    customerName: 'Chanel Upton',
    customerPhone: '364.856.5318',
    customerAddress: '5053 W Union Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/97389833',
    totalAmount: 309,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'GW9PGAK6HK',
    items: [
      {
        id: 'ti-63caffb2-2009-4831-b1e6-0126eec27a31',
        productId: 'prod-25',
        quantity: 3,
        unitPrice: 103,
        subtotal: 309
      }
    ],
    createdAt: '2026-01-26T18:39:00.000Z',
    updatedAt: '2026-01-27T18:39:00.000Z'
  },
  {
    id: 'ord-18',
    orderNumber: 'ORD-018',
    customerId: 'cust-11',
    customerName: 'Mr. Ron Kuhlman',
    customerPhone: '1-424-850-3215 x36256',
    customerAddress: '286 Rick Burg',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/63864566',
    totalAmount: 44,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'K8MP5JD58E',
    items: [
      {
        id: 'ti-125b60de-aa2e-41d8-9287-3993704dbeff',
        productId: 'prod-19',
        quantity: 1,
        unitPrice: 44,
        subtotal: 44
      }
    ],
    createdAt: '2026-01-12T05:37:00.000Z',
    updatedAt: '2026-01-13T05:37:00.000Z'
  },
  {
    id: 'ord-19',
    orderNumber: 'ORD-019',
    customerId: 'cust-8',
    customerName: 'Emilio Howe-Turcotte',
    customerPhone: '410.364.2440 x61865',
    customerAddress: '592 County Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/18.jpg',
    totalAmount: 100,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '3J5KNRCSD2',
    items: [
      {
        id: 'ti-2d465ecc-6004-42de-b767-0219ea99c4b5',
        productId: 'prod-20',
        quantity: 1,
        unitPrice: 100,
        subtotal: 100
      }
    ],
    createdAt: '2026-01-19T21:50:00.000Z',
    updatedAt: '2026-01-20T21:50:00.000Z'
  },
  {
    id: 'ord-20',
    orderNumber: 'ORD-020',
    customerId: 'cust-18',
    customerName: 'Tricia Kris',
    customerPhone: '(744) 425-1839 x06223',
    customerAddress: '403 Bradford Pine',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/1882865',
    totalAmount: 62,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'EFIPH45RLE',
    items: [
      {
        id: 'ti-38bb2c28-c5a7-45ec-b6a4-b9e447b83260',
        productId: 'prod-24',
        quantity: 2,
        unitPrice: 31,
        subtotal: 62
      }
    ],
    createdAt: '2026-02-04T23:36:00.000Z',
    updatedAt: '2026-02-05T23:36:00.000Z'
  },
  {
    id: 'ord-21',
    orderNumber: 'ORD-021',
    customerId: 'cust-12',
    customerName: 'Weldon Sanford',
    customerPhone: '(509) 205-3615 x26361',
    customerAddress: '250 Water Lane',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/8.jpg',
    totalAmount: 577,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: '6KL5WUB4KV',
    items: [
      {
        id: 'ti-c821ace3-f2a6-4dc6-a84f-6928759bb340',
        productId: 'prod-21',
        quantity: 3,
        unitPrice: 95,
        subtotal: 285
      },
      {
        id: 'ti-8f799747-ba63-4fc4-a60f-95cf6f90f47b',
        productId: 'prod-14',
        quantity: 2,
        unitPrice: 85,
        subtotal: 170
      },
      {
        id: 'ti-5b812cec-1a26-4a47-966d-01e9e39770fa',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 61,
        subtotal: 122
      }
    ],
    createdAt: '2026-02-11T00:32:00.000Z',
    updatedAt: '2026-02-12T00:32:00.000Z'
  },
  {
    id: 'ord-22',
    orderNumber: 'ORD-022',
    customerId: 'cust-17',
    customerName: 'Alana Barrows',
    customerPhone: '(298) 957-5490 x497',
    customerAddress: '7141 N Church Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/14990759',
    totalAmount: 188,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: '1ER3I75UXG',
    items: [
      {
        id: 'ti-8b4d442c-c8a3-4147-a22f-9ee795a94df4',
        productId: 'prod-23',
        quantity: 1,
        unitPrice: 86,
        subtotal: 86
      },
      {
        id: 'ti-8323b428-13b2-4fc6-b541-fc727c4ad24c',
        productId: 'prod-21',
        quantity: 1,
        unitPrice: 102,
        subtotal: 102
      }
    ],
    createdAt: '2026-02-22T08:49:00.000Z',
    updatedAt: '2026-02-23T08:49:00.000Z'
  },
  {
    id: 'ord-23',
    orderNumber: 'ORD-023',
    customerId: 'cust-11',
    customerName: 'Neil Johnston',
    customerPhone: '(807) 534-3055 x35944',
    customerAddress: '261 Nathan Lock',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/4.jpg',
    totalAmount: 116,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'PVDK50TXCW',
    items: [
      {
        id: 'ti-d17852c9-75f2-4135-a8db-0a563a1efbc1',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 12,
        subtotal: 24
      },
      {
        id: 'ti-d9bd40fd-3b98-48af-b9b8-41ae308eb9db',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 46,
        subtotal: 92
      }
    ],
    createdAt: '2026-02-11T18:01:00.000Z',
    updatedAt: '2026-02-12T18:01:00.000Z'
  },
  {
    id: 'ord-24',
    orderNumber: 'ORD-024',
    customerId: 'cust-6',
    customerName: 'Julio Kutch',
    customerPhone: '(893) 264-4865',
    customerAddress: '51766 Nina Roads',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/10.jpg',
    totalAmount: 146,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '69I18NS4OJ',
    items: [
      {
        id: 'ti-06ce761b-b08f-4c36-87e0-9dd701efb5f2',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 73,
        subtotal: 146
      }
    ],
    createdAt: '2026-02-13T22:00:00.000Z',
    updatedAt: '2026-02-14T22:00:00.000Z'
  },
  {
    id: 'ord-25',
    orderNumber: 'ORD-025',
    customerId: 'cust-4',
    customerName: 'Shirley Zulauf',
    customerPhone: '968.658.0581 x653',
    customerAddress: '130 Wilton Crossing',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/43540238',
    totalAmount: 436,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'NPQJTPCJ6S',
    items: [
      {
        id: 'ti-40d3a45c-dcb7-42c0-ad9e-b4d436a674fb',
        productId: 'prod-24',
        quantity: 3,
        unitPrice: 76,
        subtotal: 228
      },
      {
        id: 'ti-d2a6bf40-44dd-4cbe-b4e5-b3cbee982040',
        productId: 'prod-4',
        quantity: 1,
        unitPrice: 48,
        subtotal: 48
      },
      {
        id: 'ti-cd6239b4-a24d-444b-83dd-d7182980f5a6',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 80,
        subtotal: 160
      }
    ],
    createdAt: '2026-02-10T17:00:00.000Z',
    updatedAt: '2026-02-11T17:00:00.000Z'
  },
  {
    id: 'ord-26',
    orderNumber: 'ORD-026',
    customerId: 'cust-7',
    customerName: 'Mrs. Bobbie Gerhold II',
    customerPhone: '1-459-690-1908 x378',
    customerAddress: '1300 Union Avenue',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/8879116',
    totalAmount: 425,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'ITLBYX36O1',
    items: [
      {
        id: 'ti-e4dfaa59-e00b-441e-9d21-8e0498cad011',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 65,
        subtotal: 195
      },
      {
        id: 'ti-cf0a8750-fd6d-473d-8d9e-b928f37f2c60',
        productId: 'prod-13',
        quantity: 3,
        unitPrice: 57,
        subtotal: 171
      },
      {
        id: 'ti-f7a9f5af-ac12-4205-995d-94895fb05466',
        productId: 'prod-11',
        quantity: 1,
        unitPrice: 59,
        subtotal: 59
      }
    ],
    createdAt: '2026-02-07T05:12:00.000Z',
    updatedAt: '2026-02-08T05:12:00.000Z'
  },
  {
    id: 'ord-27',
    orderNumber: 'ORD-027',
    customerId: 'cust-3',
    customerName: 'Peter Koss',
    customerPhone: '1-276-672-3867 x7141',
    customerAddress: '31990 Smitham Gateway',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/35.jpg',
    totalAmount: 92,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'KDAU0ODV21',
    items: [
      {
        id: 'ti-67376c85-5d2d-40ed-b026-923e452305b6',
        productId: 'prod-24',
        quantity: 2,
        unitPrice: 46,
        subtotal: 92
      }
    ],
    createdAt: '2026-02-18T00:03:00.000Z',
    updatedAt: '2026-02-19T00:03:00.000Z'
  },
  {
    id: 'ord-28',
    orderNumber: 'ORD-028',
    customerId: 'cust-13',
    customerName: 'Amy Cassin',
    customerPhone: '750-307-7937 x02332',
    customerAddress: '7221 Mekhi Junction',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/61.jpg',
    totalAmount: 431,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'XKBKRMSGNL',
    items: [
      {
        id: 'ti-829d7c61-9e90-4487-9af0-79e9bb016b40',
        productId: 'prod-24',
        quantity: 1,
        unitPrice: 107,
        subtotal: 107
      },
      {
        id: 'ti-083d8b7c-b59f-4fd7-a4f8-b38419d61746',
        productId: 'prod-24',
        quantity: 3,
        unitPrice: 66,
        subtotal: 198
      },
      {
        id: 'ti-c0c9b8ae-d8bd-4f10-90bd-6f319bc9101e',
        productId: 'prod-21',
        quantity: 2,
        unitPrice: 63,
        subtotal: 126
      }
    ],
    createdAt: '2026-02-25T11:39:00.000Z',
    updatedAt: '2026-02-26T11:39:00.000Z'
  },
  {
    id: 'ord-29',
    orderNumber: 'ORD-029',
    customerId: 'cust-13',
    customerName: 'Katherine Crona-Brakus',
    customerPhone: '767.822.4192',
    customerAddress: '30232 London Garden',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/16503508',
    totalAmount: 51,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'RNAAFW8FIR',
    items: [
      {
        id: 'ti-77db1fc5-6f0e-4d03-a703-ac702b078d0e',
        productId: 'prod-11',
        quantity: 3,
        unitPrice: 17,
        subtotal: 51
      }
    ],
    createdAt: '2026-02-05T05:34:00.000Z',
    updatedAt: '2026-02-06T05:34:00.000Z'
  },
  {
    id: 'ord-30',
    orderNumber: 'ORD-030',
    customerId: 'cust-7',
    customerName: 'Elton Kerluke',
    customerPhone: '230-798-5038 x14734',
    customerAddress: '6535 Marks Motorway',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/68872334',
    totalAmount: 374,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'READY_TO_SHIP',
    trackingNumber: 'ZC2LHCSDJ3',
    items: [
      {
        id: 'ti-d426094e-9588-4cc8-ad31-3dc05f0493a7',
        productId: 'prod-5',
        quantity: 2,
        unitPrice: 93,
        subtotal: 186
      },
      {
        id: 'ti-c7b7377d-3caf-4d6d-8cfa-135fac2c61b4',
        productId: 'prod-20',
        quantity: 2,
        unitPrice: 94,
        subtotal: 188
      }
    ],
    createdAt: '2026-02-12T05:21:00.000Z',
    updatedAt: '2026-02-13T05:21:00.000Z'
  },
  {
    id: 'ord-31',
    orderNumber: 'ORD-031',
    customerId: 'cust-1',
    customerName: 'Todd Kemmer IV',
    customerPhone: '(505) 718-6872 x5688',
    customerAddress: '4703 Lloyd Dale',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/31474991',
    totalAmount: 90,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'C30HPR1PYM',
    items: [
      {
        id: 'ti-1c7a5393-91c0-4f3a-a590-533e4c4ba471',
        productId: 'prod-17',
        quantity: 3,
        unitPrice: 30,
        subtotal: 90
      }
    ],
    createdAt: '2026-02-06T10:59:00.000Z',
    updatedAt: '2026-02-07T10:59:00.000Z'
  },
  {
    id: 'ord-32',
    orderNumber: 'ORD-032',
    customerId: 'cust-12',
    customerName: 'Mr. Corine Huel PhD',
    customerPhone: '662-813-8035',
    customerAddress: '712 Irving Green',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/26.jpg',
    totalAmount: 24,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'RGREZXF8YD',
    items: [
      {
        id: 'ti-dea8d325-3de8-435e-8ba3-e8970128150a',
        productId: 'prod-22',
        quantity: 1,
        unitPrice: 24,
        subtotal: 24
      }
    ],
    createdAt: '2026-02-03T18:39:00.000Z',
    updatedAt: '2026-02-04T18:39:00.000Z'
  },
  {
    id: 'ord-33',
    orderNumber: 'ORD-033',
    customerId: 'cust-11',
    customerName: 'Miss Tracey Nicolas',
    customerPhone: '(553) 789-0530 x290',
    customerAddress: '856 Murazik Brook',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/67086850',
    totalAmount: 386,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    trackingNumber: 'LLVIYBBCN8',
    items: [
      {
        id: 'ti-ed3a86ff-10ae-4f83-8156-b8594a42e7b8',
        productId: 'prod-14',
        quantity: 1,
        unitPrice: 64,
        subtotal: 64
      },
      {
        id: 'ti-179a3fc7-75dd-47cd-a7f8-8565b27cc6a4',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 88,
        subtotal: 264
      },
      {
        id: 'ti-15910a1d-2cd0-45e6-b293-ff414b09ffc9',
        productId: 'prod-20',
        quantity: 2,
        unitPrice: 29,
        subtotal: 58
      }
    ],
    createdAt: '2026-02-03T22:48:00.000Z',
    updatedAt: '2026-02-04T22:48:00.000Z'
  },
  {
    id: 'ord-34',
    orderNumber: 'ORD-034',
    customerId: 'cust-13',
    customerName: 'Georgianna McGlynn',
    customerPhone: '1-866-668-1245 x484',
    customerAddress: '1495 Meadow Way',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/70.jpg',
    totalAmount: 155,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'IAEH4NT475',
    items: [
      {
        id: 'ti-91864f35-9a75-415f-a56b-5007f9c134ad',
        productId: 'prod-5',
        quantity: 1,
        unitPrice: 41,
        subtotal: 41
      },
      {
        id: 'ti-a643e880-dbe7-4010-bfa4-716616803bc6',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 38,
        subtotal: 114
      }
    ],
    createdAt: '2026-02-07T02:41:00.000Z',
    updatedAt: '2026-02-08T02:41:00.000Z'
  },
  {
    id: 'ord-35',
    orderNumber: 'ORD-035',
    customerId: 'cust-5',
    customerName: 'Eldon Larson',
    customerPhone: '722-650-1201 x86867',
    customerAddress: '401 Padberg Harbors',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/25974220',
    totalAmount: 328,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'AS4QCOOU0R',
    items: [
      {
        id: 'ti-c032e789-bd1d-4d30-b765-a137862fdcab',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 46,
        subtotal: 92
      },
      {
        id: 'ti-d6fe92d4-5dfb-4327-806b-3db83c3aea49',
        productId: 'prod-22',
        quantity: 3,
        unitPrice: 47,
        subtotal: 141
      },
      {
        id: 'ti-21d394be-75fc-46bc-a4f5-bd83cbc96ba9',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 95,
        subtotal: 95
      }
    ],
    createdAt: '2026-02-12T09:05:00.000Z',
    updatedAt: '2026-02-13T09:05:00.000Z'
  },
  {
    id: 'ord-36',
    orderNumber: 'ORD-036',
    customerId: 'cust-16',
    customerName: 'Sim Nader',
    customerPhone: '1-638-923-3744 x2269',
    customerAddress: '544 Belmont Road',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/56491992',
    totalAmount: 142,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'MTOY69PL19',
    items: [
      {
        id: 'ti-632e89f6-a4bf-46a7-a1d6-c3396248067c',
        productId: 'prod-12',
        quantity: 1,
        unitPrice: 85,
        subtotal: 85
      },
      {
        id: 'ti-4c4fded0-bd99-408f-ad35-c38d3847f47e',
        productId: 'prod-16',
        quantity: 3,
        unitPrice: 19,
        subtotal: 57
      }
    ],
    createdAt: '2026-03-02T06:24:00.000Z',
    updatedAt: '2026-03-03T06:24:00.000Z'
  },
  {
    id: 'ord-37',
    orderNumber: 'ORD-037',
    customerId: 'cust-3',
    customerName: 'Sylvester Yundt',
    customerPhone: '809-274-2193 x95812',
    customerAddress: '4920 Beverly Island',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/90241300',
    totalAmount: 368,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'CYAH7SPG6B',
    items: [
      {
        id: 'ti-e5b8ff64-5822-4222-81f7-3cd27b148bfd',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 31,
        subtotal: 62
      },
      {
        id: 'ti-06f87c1b-a4d0-4618-8c2b-427c95a8167e',
        productId: 'prod-9',
        quantity: 3,
        unitPrice: 22,
        subtotal: 66
      },
      {
        id: 'ti-1555b180-723f-4b1c-94c3-1a682ab78d29',
        productId: 'prod-24',
        quantity: 3,
        unitPrice: 80,
        subtotal: 240
      }
    ],
    createdAt: '2026-03-01T08:57:00.000Z',
    updatedAt: '2026-03-02T08:57:00.000Z'
  },
  {
    id: 'ord-38',
    orderNumber: 'ORD-038',
    customerId: 'cust-18',
    customerName: 'Chelsey Gusikowski I',
    customerPhone: '303-294-7268 x037',
    customerAddress: '636 Darian Ville',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/97966623',
    totalAmount: 46,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'VNJUWNMA9G',
    items: [
      {
        id: 'ti-ea03053a-26a9-465c-8c29-587981059bfc',
        productId: 'prod-22',
        quantity: 1,
        unitPrice: 46,
        subtotal: 46
      }
    ],
    createdAt: '2026-03-28T17:16:00.000Z',
    updatedAt: '2026-03-29T17:16:00.000Z'
  },
  {
    id: 'ord-39',
    orderNumber: 'ORD-039',
    customerId: 'cust-10',
    customerName: 'Juliana Paucek',
    customerPhone: '1-210-464-5162 x50520',
    customerAddress: '1023 Pearline Parkways',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/98.jpg',
    totalAmount: 308,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'LAKYWFUNIM',
    items: [
      {
        id: 'ti-f0a1dfa6-ee1b-4350-bf4d-a00c358d813a',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 66,
        subtotal: 132
      },
      {
        id: 'ti-4b5650d3-22f2-4bd7-bfae-41f44b0aa51c',
        productId: 'prod-21',
        quantity: 2,
        unitPrice: 88,
        subtotal: 176
      }
    ],
    createdAt: '2026-03-25T12:13:00.000Z',
    updatedAt: '2026-03-26T12:13:00.000Z'
  },
  {
    id: 'ord-40',
    orderNumber: 'ORD-040',
    customerId: 'cust-19',
    customerName: 'Marcelle Wehner I',
    customerPhone: '540-760-7703',
    customerAddress: '94685 The Croft',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/33209830',
    totalAmount: 341,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'DELIVERED',
    trackingNumber: 'SILISBIAX1',
    items: [
      {
        id: 'ti-97dab2c4-3b0e-469f-88bf-09da6ebf6e64',
        productId: 'prod-6',
        quantity: 2,
        unitPrice: 76,
        subtotal: 152
      },
      {
        id: 'ti-bb14274a-3024-4987-b126-884831204f65',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 33,
        subtotal: 99
      },
      {
        id: 'ti-f7c0483c-8bfb-4f85-a1db-c3e2c328c340',
        productId: 'prod-14',
        quantity: 1,
        unitPrice: 90,
        subtotal: 90
      }
    ],
    createdAt: '2026-03-11T11:20:00.000Z',
    updatedAt: '2026-03-12T11:20:00.000Z'
  },
  {
    id: 'ord-41',
    orderNumber: 'ORD-041',
    customerId: 'cust-17',
    customerName: 'Magdalena Hickle',
    customerPhone: '(421) 452-9135 x04177',
    customerAddress: '82360 The Maltings',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/93793852',
    totalAmount: 336,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'XMSG1WGSCP',
    items: [
      {
        id: 'ti-954c797c-ff9e-4845-b5a3-66cbbc501bc5',
        productId: 'prod-9',
        quantity: 1,
        unitPrice: 21,
        subtotal: 21
      },
      {
        id: 'ti-0e82fa5b-ab27-4ce6-893c-1ead594342c3',
        productId: 'prod-16',
        quantity: 3,
        unitPrice: 105,
        subtotal: 315
      }
    ],
    createdAt: '2026-03-13T02:20:00.000Z',
    updatedAt: '2026-03-14T02:20:00.000Z'
  },
  {
    id: 'ord-42',
    orderNumber: 'ORD-042',
    customerId: 'cust-19',
    customerName: 'Tiffany Zulauf',
    customerPhone: '437.555.4109 x129',
    customerAddress: '9038 Boyle Crest',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/50349438',
    totalAmount: 383,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'LX2HZ9RWV5',
    items: [
      {
        id: 'ti-9dc1cbb0-319d-40c2-8607-d1521901b331',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 85,
        subtotal: 170
      },
      {
        id: 'ti-30bb6ba4-adfe-4030-8703-09cfc3115c9c',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 71,
        subtotal: 213
      }
    ],
    createdAt: '2026-03-19T11:30:00.000Z',
    updatedAt: '2026-03-20T11:30:00.000Z'
  },
  {
    id: 'ord-43',
    orderNumber: 'ORD-043',
    customerId: 'cust-3',
    customerName: 'Bonnie Cummings',
    customerPhone: '(915) 457-4017 x47570',
    customerAddress: '4999 Mosciski Extension',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/2.jpg',
    totalAmount: 384,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'R20GVEEC4B',
    items: [
      {
        id: 'ti-19687428-2f13-4eba-ab08-2bdee0d08ba0',
        productId: 'prod-8',
        quantity: 1,
        unitPrice: 63,
        subtotal: 63
      },
      {
        id: 'ti-1f6e5afb-a4c7-488f-884a-7544925be011',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 60,
        subtotal: 180
      },
      {
        id: 'ti-492bbaa6-203b-4e40-a63c-2e94cb6437ca',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 47,
        subtotal: 141
      }
    ],
    createdAt: '2026-03-15T18:19:00.000Z',
    updatedAt: '2026-03-16T18:19:00.000Z'
  },
  {
    id: 'ord-44',
    orderNumber: 'ORD-044',
    customerId: 'cust-16',
    customerName: 'Everett Sporer',
    customerPhone: '744.774.7772 x787',
    customerAddress: '9375 Marianne Pine',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/76.jpg',
    totalAmount: 259,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'UMUI7RHP88',
    items: [
      {
        id: 'ti-8846bc0c-babc-4620-93a3-f42ace13decd',
        productId: 'prod-19',
        quantity: 2,
        unitPrice: 65,
        subtotal: 130
      },
      {
        id: 'ti-031a752e-dba6-40b9-825e-b0df4f87a2cc',
        productId: 'prod-13',
        quantity: 3,
        unitPrice: 43,
        subtotal: 129
      }
    ],
    createdAt: '2026-03-24T13:48:00.000Z',
    updatedAt: '2026-03-25T13:48:00.000Z'
  },
  {
    id: 'ord-45',
    orderNumber: 'ORD-045',
    customerId: 'cust-15',
    customerName: 'Ms. Mary Gerhold',
    customerPhone: '1-722-850-0057 x98522',
    customerAddress: '554 Lorine Estate',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/40.jpg',
    totalAmount: 132,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'I4DUL7TDND',
    items: [
      {
        id: 'ti-4ee3d37a-1375-465b-bb37-d06812b19be7',
        productId: 'prod-6',
        quantity: 2,
        unitPrice: 48,
        subtotal: 96
      },
      {
        id: 'ti-cdc6cf4f-eedb-4c12-95f5-73818c00b4d6',
        productId: 'prod-9',
        quantity: 1,
        unitPrice: 36,
        subtotal: 36
      }
    ],
    createdAt: '2026-03-02T16:59:00.000Z',
    updatedAt: '2026-03-03T16:59:00.000Z'
  },
  {
    id: 'ord-46',
    orderNumber: 'ORD-046',
    customerId: 'cust-3',
    customerName: 'Virginia Bergnaum',
    customerPhone: '(515) 867-7152 x1773',
    customerAddress: '6643 Trantow Overpass',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/15774559',
    totalAmount: 174,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'XOUR9CJTUT',
    items: [
      {
        id: 'ti-40b559ec-f73b-4358-a3e5-e45e247371cf',
        productId: 'prod-5',
        quantity: 3,
        unitPrice: 58,
        subtotal: 174
      }
    ],
    createdAt: '2026-03-03T07:44:00.000Z',
    updatedAt: '2026-03-04T07:44:00.000Z'
  },
  {
    id: 'ord-47',
    orderNumber: 'ORD-047',
    customerId: 'cust-12',
    customerName: 'Mrs. Gail Hickle',
    customerPhone: '1-433-898-4899 x8148',
    customerAddress: '38825 N Walnut Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/57708152',
    totalAmount: 67,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'SFV2TQ9EZX',
    items: [
      {
        id: 'ti-22ab7be8-1c7b-43f0-a33f-3e3388b9956d',
        productId: 'prod-12',
        quantity: 1,
        unitPrice: 67,
        subtotal: 67
      }
    ],
    createdAt: '2026-03-24T18:30:00.000Z',
    updatedAt: '2026-03-25T18:30:00.000Z'
  },
  {
    id: 'ord-48',
    orderNumber: 'ORD-048',
    customerId: 'cust-8',
    customerName: 'Kali Emmerich',
    customerPhone: '268.436.3244 x72736',
    customerAddress: '759 The Sidings',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/44.jpg',
    totalAmount: 141,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'IEU6HHXNA9',
    items: [
      {
        id: 'ti-829c52af-407f-4665-b8aa-388c200818d2',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 51,
        subtotal: 102
      },
      {
        id: 'ti-b4ee6303-f677-4741-95bd-6c6e7a076c38',
        productId: 'prod-12',
        quantity: 3,
        unitPrice: 13,
        subtotal: 39
      }
    ],
    createdAt: '2026-03-05T00:50:00.000Z',
    updatedAt: '2026-03-06T00:50:00.000Z'
  },
  {
    id: 'ord-49',
    orderNumber: 'ORD-049',
    customerId: 'cust-18',
    customerName: 'Stanley Langosh',
    customerPhone: '931-328-5633',
    customerAddress: '724 Barton Road',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/10736080',
    totalAmount: 141,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'Y9PBFQEY8V',
    items: [
      {
        id: 'ti-27af60b7-d0fa-4cff-9051-c4882890af63',
        productId: 'prod-16',
        quantity: 1,
        unitPrice: 60,
        subtotal: 60
      },
      {
        id: 'ti-238b61b2-70b7-4659-bcf6-7571f45799e4',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 27,
        subtotal: 81
      }
    ],
    createdAt: '2026-03-24T00:36:00.000Z',
    updatedAt: '2026-03-25T00:36:00.000Z'
  },
  {
    id: 'ord-50',
    orderNumber: 'ORD-050',
    customerId: 'cust-3',
    customerName: 'Rachel Cole',
    customerPhone: '1-530-403-2468 x3146',
    customerAddress: '346 North Lane',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/98715258',
    totalAmount: 249,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'B53RV6KS14',
    items: [
      {
        id: 'ti-570a3bb1-b511-4404-9a19-41c6c3f72935',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 71,
        subtotal: 213
      },
      {
        id: 'ti-c464336a-f09e-4c37-8822-6f9c50ee932b',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 18,
        subtotal: 36
      }
    ],
    createdAt: '2026-03-16T11:23:00.000Z',
    updatedAt: '2026-03-17T11:23:00.000Z'
  },
  {
    id: 'ord-51',
    orderNumber: 'ORD-051',
    customerId: 'cust-15',
    customerName: 'Ervin Schoen',
    customerPhone: '695-349-7563 x00105',
    customerAddress: '7118 Alvin Ridge',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/89662268',
    totalAmount: 124,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'W0TN3K3L82',
    items: [
      {
        id: 'ti-deb93602-8413-499d-97d2-04c71573cfa7',
        productId: 'prod-3',
        quantity: 2,
        unitPrice: 46,
        subtotal: 92
      },
      {
        id: 'ti-6d3512ae-d19e-4162-8d38-aade1843f040',
        productId: 'prod-12',
        quantity: 2,
        unitPrice: 16,
        subtotal: 32
      }
    ],
    createdAt: '2026-03-05T08:22:00.000Z',
    updatedAt: '2026-03-06T08:22:00.000Z'
  },
  {
    id: 'ord-52',
    orderNumber: 'ORD-052',
    customerId: 'cust-20',
    customerName: 'Fannie Gutkowski',
    customerPhone: '1-844-628-3257 x232',
    customerAddress: '7925 Western Avenue',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/86.jpg',
    totalAmount: 62,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'SJJB6VW63D',
    items: [
      {
        id: 'ti-b97c338a-e17a-4eb8-a24e-ceba00b3531e',
        productId: 'prod-13',
        quantity: 1,
        unitPrice: 34,
        subtotal: 34
      },
      {
        id: 'ti-18bcd415-bb20-43bc-b5a9-92e57f7c09f1',
        productId: 'prod-11',
        quantity: 2,
        unitPrice: 14,
        subtotal: 28
      }
    ],
    createdAt: '2026-04-26T04:05:00.000Z',
    updatedAt: '2026-04-27T04:05:00.000Z'
  },
  {
    id: 'ord-53',
    orderNumber: 'ORD-053',
    customerId: 'cust-16',
    customerName: 'Kip Crist',
    customerPhone: '1-760-639-0506 x0702',
    customerAddress: '747 Emilie Oval',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/40005013',
    totalAmount: 318,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: '5K6QL5OMHM',
    items: [
      {
        id: 'ti-1d00e770-6406-4fa1-91cf-561f7584ed88',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 106,
        subtotal: 318
      }
    ],
    createdAt: '2026-04-19T03:57:00.000Z',
    updatedAt: '2026-04-20T03:57:00.000Z'
  },
  {
    id: 'ord-54',
    orderNumber: 'ORD-054',
    customerId: 'cust-4',
    customerName: 'Peyton Howell',
    customerPhone: '(997) 319-9907 x24670',
    customerAddress: '340 Vallie Avenue',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/73796388',
    totalAmount: 384,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    trackingNumber: '6QI3NVA0DL',
    items: [
      {
        id: 'ti-ab3c1801-bfdb-46cc-8915-3749327b7e5b',
        productId: 'prod-22',
        quantity: 1,
        unitPrice: 59,
        subtotal: 59
      },
      {
        id: 'ti-67a16435-bda3-46d8-aa48-5fa337b6dfad',
        productId: 'prod-23',
        quantity: 2,
        unitPrice: 20,
        subtotal: 40
      },
      {
        id: 'ti-47a0ac2d-2d8b-49a7-aafd-1bdacd74e915',
        productId: 'prod-2',
        quantity: 3,
        unitPrice: 95,
        subtotal: 285
      }
    ],
    createdAt: '2026-04-03T19:46:00.000Z',
    updatedAt: '2026-04-04T19:46:00.000Z'
  },
  {
    id: 'ord-55',
    orderNumber: 'ORD-055',
    customerId: 'cust-9',
    customerName: 'Junius Jaskolski',
    customerPhone: '421-917-0357',
    customerAddress: '4856 Cherry Close',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/33326902',
    totalAmount: 111,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'MJ4FIQ1WGW',
    items: [
      {
        id: 'ti-7b154634-87dd-4c89-a87b-fb3d21edfe50',
        productId: 'prod-18',
        quantity: 3,
        unitPrice: 37,
        subtotal: 111
      }
    ],
    createdAt: '2026-04-08T16:31:00.000Z',
    updatedAt: '2026-04-09T16:31:00.000Z'
  },
  {
    id: 'ord-56',
    orderNumber: 'ORD-056',
    customerId: 'cust-10',
    customerName: 'Marco Klein',
    customerPhone: '345-954-6120 x53597',
    customerAddress: '5351 Lueilwitz Ports',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/80.jpg',
    totalAmount: 495,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: '88UHNXXE02',
    items: [
      {
        id: 'ti-a4e82490-db17-495d-9a0f-bd45b7d15348',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 103,
        subtotal: 206
      },
      {
        id: 'ti-c7183175-3d0c-4835-9aa2-496cb9e68b88',
        productId: 'prod-17',
        quantity: 2,
        unitPrice: 47,
        subtotal: 94
      },
      {
        id: 'ti-4e0d13ca-ffe4-4478-8d3c-899528a293ec',
        productId: 'prod-1',
        quantity: 3,
        unitPrice: 65,
        subtotal: 195
      }
    ],
    createdAt: '2026-04-02T17:08:00.000Z',
    updatedAt: '2026-04-03T17:08:00.000Z'
  },
  {
    id: 'ord-57',
    orderNumber: 'ORD-057',
    customerId: 'cust-5',
    customerName: 'Jordan Borer',
    customerPhone: '(497) 473-0915 x4031',
    customerAddress: '8241 Forest Road',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/10235074',
    totalAmount: 186,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: '8QCVOON0LG',
    items: [
      {
        id: 'ti-b7e335cd-6066-4da7-946e-37bdbbd62f15',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 93,
        subtotal: 186
      }
    ],
    createdAt: '2026-04-28T11:14:00.000Z',
    updatedAt: '2026-04-29T11:14:00.000Z'
  },
  {
    id: 'ord-58',
    orderNumber: 'ORD-058',
    customerId: 'cust-6',
    customerName: 'Johann Bahringer',
    customerPhone: '(285) 561-2333 x84347',
    customerAddress: '165 Gordon Rue',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/26.jpg',
    totalAmount: 265,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: '5EC249EB3B',
    items: [
      {
        id: 'ti-14c6628d-3f9c-462d-8ec6-940d9cbf332c',
        productId: 'prod-21',
        quantity: 2,
        unitPrice: 101,
        subtotal: 202
      },
      {
        id: 'ti-6fff634c-58a7-4d3b-9182-d866760f8976',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 63,
        subtotal: 63
      }
    ],
    createdAt: '2026-04-02T18:03:00.000Z',
    updatedAt: '2026-04-03T18:03:00.000Z'
  },
  {
    id: 'ord-59',
    orderNumber: 'ORD-059',
    customerId: 'cust-3',
    customerName: 'Marlen Schaefer',
    customerPhone: '(231) 897-4013 x832',
    customerAddress: '86860 Buckridge Walks',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/94900813',
    totalAmount: 214,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: '3N66N67AWP',
    items: [
      {
        id: 'ti-418ff4aa-18e3-4f4b-b757-468ed58ee313',
        productId: 'prod-23',
        quantity: 2,
        unitPrice: 107,
        subtotal: 214
      }
    ],
    createdAt: '2026-04-27T17:09:00.000Z',
    updatedAt: '2026-04-28T17:09:00.000Z'
  },
  {
    id: 'ord-60',
    orderNumber: 'ORD-060',
    customerId: 'cust-18',
    customerName: 'Miss Anna Crona',
    customerPhone: '1-688-218-6482 x948',
    customerAddress: '22672 Grange Avenue',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/2.jpg',
    totalAmount: 89,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'MLBTISJVG6',
    items: [
      {
        id: 'ti-0c872a12-6829-4e2f-8a48-8a39dae47ed3',
        productId: 'prod-10',
        quantity: 1,
        unitPrice: 89,
        subtotal: 89
      }
    ],
    createdAt: '2026-04-03T11:33:00.000Z',
    updatedAt: '2026-04-04T11:33:00.000Z'
  },
  {
    id: 'ord-61',
    orderNumber: 'ORD-061',
    customerId: 'cust-7',
    customerName: 'Andreane King',
    customerPhone: '(581) 298-6530 x9690',
    customerAddress: '329 State Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/40023323',
    totalAmount: 146,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'VJFYZRO0DK',
    items: [
      {
        id: 'ti-d3858928-7f48-49ee-90a6-d78a023be9d9',
        productId: 'prod-12',
        quantity: 3,
        unitPrice: 43,
        subtotal: 129
      },
      {
        id: 'ti-86174bbf-e10a-48b3-a243-428a6bafb326',
        productId: 'prod-7',
        quantity: 1,
        unitPrice: 17,
        subtotal: 17
      }
    ],
    createdAt: '2026-04-08T15:35:00.000Z',
    updatedAt: '2026-04-09T15:35:00.000Z'
  },
  {
    id: 'ord-62',
    orderNumber: 'ORD-062',
    customerId: 'cust-5',
    customerName: 'Justin Deckow',
    customerPhone: '(523) 250-7286',
    customerAddress: '9794 Hodkiewicz Dam',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/66505819',
    totalAmount: 108,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'READY_TO_SHIP',
    trackingNumber: 'H7A9AVFX45',
    items: [
      {
        id: 'ti-d35fc33e-705d-4bd6-abde-91c48f11595a',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 90,
        subtotal: 90
      },
      {
        id: 'ti-03ca2883-5ae5-4c16-b793-66e9f2c7dd2b',
        productId: 'prod-5',
        quantity: 1,
        unitPrice: 18,
        subtotal: 18
      }
    ],
    createdAt: '2026-04-10T07:56:00.000Z',
    updatedAt: '2026-04-11T07:56:00.000Z'
  },
  {
    id: 'ord-63',
    orderNumber: 'ORD-063',
    customerId: 'cust-6',
    customerName: 'Verona Abshire',
    customerPhone: '1-383-940-8307',
    customerAddress: '1516 Armani Plaza',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/66799330',
    totalAmount: 300,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'GR3U105E87',
    items: [
      {
        id: 'ti-115cf881-cc76-41d6-96c0-2d151b1be485',
        productId: 'prod-19',
        quantity: 2,
        unitPrice: 72,
        subtotal: 144
      },
      {
        id: 'ti-1c0f94a7-d4be-48cb-b6fa-63195e9ff268',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 52,
        subtotal: 156
      }
    ],
    createdAt: '2026-04-08T10:26:00.000Z',
    updatedAt: '2026-04-09T10:26:00.000Z'
  },
  {
    id: 'ord-64',
    orderNumber: 'ORD-064',
    customerId: 'cust-12',
    customerName: 'Drew Haley',
    customerPhone: '550.692.7690',
    customerAddress: '317 Roman Way',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/40120079',
    totalAmount: 78,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'CNWHKB59OS',
    items: [
      {
        id: 'ti-9ccdc52f-6c30-40b0-8f03-79e27ec1ed99',
        productId: 'prod-9',
        quantity: 3,
        unitPrice: 26,
        subtotal: 78
      }
    ],
    createdAt: '2026-04-28T03:28:00.000Z',
    updatedAt: '2026-04-29T03:28:00.000Z'
  },
  {
    id: 'ord-65',
    orderNumber: 'ORD-065',
    customerId: 'cust-1',
    customerName: 'Misty Thompson',
    customerPhone: '(554) 210-2721 x5801',
    customerAddress: '72971 Spencer Parkway',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/1.jpg',
    totalAmount: 51,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'YFGSU7C6VY',
    items: [
      {
        id: 'ti-aa14c5b2-c84b-4b87-8dec-efcfaf402c5c',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 51,
        subtotal: 51
      }
    ],
    createdAt: '2026-04-09T04:20:00.000Z',
    updatedAt: '2026-04-10T04:20:00.000Z'
  },
  {
    id: 'ord-66',
    orderNumber: 'ORD-066',
    customerId: 'cust-9',
    customerName: 'Hiram Rempel',
    customerPhone: '1-584-284-7663 x72661',
    customerAddress: '468 The Oval',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/57383238',
    totalAmount: 376,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'YSA2YBYLMK',
    items: [
      {
        id: 'ti-0a76c88c-c642-4732-b9f6-eeaf54c27ba3',
        productId: 'prod-12',
        quantity: 1,
        unitPrice: 105,
        subtotal: 105
      },
      {
        id: 'ti-2259c4b4-7283-423b-831c-7b0bf4e275de',
        productId: 'prod-21',
        quantity: 3,
        unitPrice: 78,
        subtotal: 234
      },
      {
        id: 'ti-3eaae255-364b-4ce1-ae8e-2ab8b4c4ded4',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 37,
        subtotal: 37
      }
    ],
    createdAt: '2026-04-02T01:55:00.000Z',
    updatedAt: '2026-04-03T01:55:00.000Z'
  },
  {
    id: 'ord-67',
    orderNumber: 'ORD-067',
    customerId: 'cust-7',
    customerName: 'Amanda Rippin-Williamson',
    customerPhone: '(928) 876-7258',
    customerAddress: '20109 3rd Avenue',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/38.jpg',
    totalAmount: 174,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'SHIPPED',
    trackingNumber: 'EXCUIIT6RA',
    items: [
      {
        id: 'ti-37ccdf39-3a89-4b26-b9be-ceecba651848',
        productId: 'prod-15',
        quantity: 2,
        unitPrice: 87,
        subtotal: 174
      }
    ],
    createdAt: '2026-04-03T18:43:00.000Z',
    updatedAt: '2026-04-04T18:43:00.000Z'
  },
  {
    id: 'ord-68',
    orderNumber: 'ORD-068',
    customerId: 'cust-8',
    customerName: 'Eleonore Auer',
    customerPhone: '(486) 363-4054 x8771',
    customerAddress: '46362 Johnson Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/37609707',
    totalAmount: 110,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'READY_TO_SHIP',
    trackingNumber: 'AERB72XPK0',
    items: [
      {
        id: 'ti-8cda4ac6-a0e0-403d-9444-3388f7027afa',
        productId: 'prod-25',
        quantity: 3,
        unitPrice: 28,
        subtotal: 84
      },
      {
        id: 'ti-7aab5c24-7b48-461b-92b8-4de95ba4db69',
        productId: 'prod-15',
        quantity: 2,
        unitPrice: 13,
        subtotal: 26
      }
    ],
    createdAt: '2026-04-24T18:59:00.000Z',
    updatedAt: '2026-04-25T18:59:00.000Z'
  },
  {
    id: 'ord-69',
    orderNumber: 'ORD-069',
    customerId: 'cust-18',
    customerName: 'Nichole Waters',
    customerPhone: '(658) 581-8681 x47113',
    customerAddress: '37178 Rose Parkways',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/65.jpg',
    totalAmount: 370,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '2ASOIQ8F06',
    items: [
      {
        id: 'ti-ef9c61d4-4202-4cbb-8b62-e5ed5ffc0ff3',
        productId: 'prod-2',
        quantity: 3,
        unitPrice: 100,
        subtotal: 300
      },
      {
        id: 'ti-9c217b84-802a-4b56-a55f-1766920bbba5',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 35,
        subtotal: 70
      }
    ],
    createdAt: '2026-04-28T03:52:00.000Z',
    updatedAt: '2026-04-29T03:52:00.000Z'
  },
  {
    id: 'ord-70',
    orderNumber: 'ORD-070',
    customerId: 'cust-10',
    customerName: 'Ms. Jenny Stark',
    customerPhone: '(621) 555-4030 x578',
    customerAddress: '457 Frami Glens',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/59249976',
    totalAmount: 74,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'READY_TO_SHIP',
    trackingNumber: '21E2DBUAD9',
    items: [
      {
        id: 'ti-a74280c0-491e-48e2-ab34-e646e829c543',
        productId: 'prod-11',
        quantity: 1,
        unitPrice: 74,
        subtotal: 74
      }
    ],
    createdAt: '2026-04-19T23:52:00.000Z',
    updatedAt: '2026-04-20T23:52:00.000Z'
  },
  {
    id: 'ord-71',
    orderNumber: 'ORD-071',
    customerId: 'cust-2',
    customerName: 'Whitney Balistreri III',
    customerPhone: '636.587.6748 x742',
    customerAddress: '4450 Willms Village',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/33568671',
    totalAmount: 200,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'XAL9V9XG03',
    items: [
      {
        id: 'ti-0a66c357-520c-486f-905f-27dfe1bd29ec',
        productId: 'prod-12',
        quantity: 1,
        unitPrice: 90,
        subtotal: 90
      },
      {
        id: 'ti-7f601e38-e4be-437b-b633-d5a4d73c50f2',
        productId: 'prod-11',
        quantity: 2,
        unitPrice: 55,
        subtotal: 110
      }
    ],
    createdAt: '2026-05-02T18:43:00.000Z',
    updatedAt: '2026-05-03T18:43:00.000Z'
  },
  {
    id: 'ord-72',
    orderNumber: 'ORD-072',
    customerId: 'cust-5',
    customerName: 'Triston McKenzie',
    customerPhone: '349.956.5379 x194',
    customerAddress: '48265 Ramon Rapid',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/66490253',
    totalAmount: 28,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '42B77KUET7',
    items: [
      {
        id: 'ti-243e7dd6-18fe-4fe5-b941-52508d4922d3',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 14,
        subtotal: 28
      }
    ],
    createdAt: '2026-05-27T22:27:00.000Z',
    updatedAt: '2026-05-28T22:27:00.000Z'
  },
  {
    id: 'ord-73',
    orderNumber: 'ORD-073',
    customerId: 'cust-1',
    customerName: 'Dino Wehner',
    customerPhone: '(846) 899-3607 x538',
    customerAddress: '678 N Oak Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/37116789',
    totalAmount: 491,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'U91I8S09C4',
    items: [
      {
        id: 'ti-85398540-81b0-4db9-bb0d-f96f917228e4',
        productId: 'prod-11',
        quantity: 1,
        unitPrice: 107,
        subtotal: 107
      },
      {
        id: 'ti-f6ec9c9f-c988-4a66-9b93-7baf0e2b3755',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 60,
        subtotal: 180
      },
      {
        id: 'ti-e11bfa1d-0176-4c51-8598-ebfe53a44dd8',
        productId: 'prod-9',
        quantity: 2,
        unitPrice: 102,
        subtotal: 204
      }
    ],
    createdAt: '2026-05-21T22:01:00.000Z',
    updatedAt: '2026-05-22T22:01:00.000Z'
  },
  {
    id: 'ord-74',
    orderNumber: 'ORD-074',
    customerId: 'cust-7',
    customerName: 'Vaughn Hamill',
    customerPhone: '276.395.8818 x556',
    customerAddress: '9243 Beer Plain',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/85145904',
    totalAmount: 205,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'ZN5MI268YX',
    items: [
      {
        id: 'ti-041c2877-e50c-41a9-8a2c-c2030de019c1',
        productId: 'prod-7',
        quantity: 2,
        unitPrice: 96,
        subtotal: 192
      },
      {
        id: 'ti-22cf4af4-7166-44c7-90b3-b9c020f85149',
        productId: 'prod-7',
        quantity: 1,
        unitPrice: 13,
        subtotal: 13
      }
    ],
    createdAt: '2026-05-07T22:42:00.000Z',
    updatedAt: '2026-05-08T22:42:00.000Z'
  },
  {
    id: 'ord-75',
    orderNumber: 'ORD-075',
    customerId: 'cust-7',
    customerName: 'Deanna Beahan',
    customerPhone: '(586) 327-7139 x6685',
    customerAddress: '1998 W Broadway Avenue',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/79670292',
    totalAmount: 244,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'TY98SPXRLJ',
    items: [
      {
        id: 'ti-9feb2fd6-1417-4153-8c7a-71e391ee47a5',
        productId: 'prod-20',
        quantity: 3,
        unitPrice: 45,
        subtotal: 135
      },
      {
        id: 'ti-c22a99b4-147f-4b41-a04b-923f1e1ed601',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 109,
        subtotal: 109
      }
    ],
    createdAt: '2026-05-02T16:31:00.000Z',
    updatedAt: '2026-05-03T16:31:00.000Z'
  },
  {
    id: 'ord-76',
    orderNumber: 'ORD-076',
    customerId: 'cust-18',
    customerName: 'Monty Keeling',
    customerPhone: '(746) 334-7485 x439',
    customerAddress: '313 Bernhard Ville',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/32761999',
    totalAmount: 399,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'Q6TG7L6GGC',
    items: [
      {
        id: 'ti-e56f4aae-0e93-45d5-96ea-e793b1f1700b',
        productId: 'prod-5',
        quantity: 3,
        unitPrice: 97,
        subtotal: 291
      },
      {
        id: 'ti-efeac736-b2f3-4dae-b239-d8a2de2efe93',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 42,
        subtotal: 42
      },
      {
        id: 'ti-99cc00e0-c7f2-45d8-b4e3-1861a16dfdad',
        productId: 'prod-6',
        quantity: 2,
        unitPrice: 33,
        subtotal: 66
      }
    ],
    createdAt: '2026-05-14T12:54:00.000Z',
    updatedAt: '2026-05-15T12:54:00.000Z'
  },
  {
    id: 'ord-77',
    orderNumber: 'ORD-077',
    customerId: 'cust-19',
    customerName: 'Leona Sanford',
    customerPhone: '906-541-9089 x7996',
    customerAddress: '4809 Howe Cliff',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/86318888',
    totalAmount: 43,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'FQQ22QMUFP',
    items: [
      {
        id: 'ti-a5b0f4d4-00f2-4412-9c0c-9b91e27cc80b',
        productId: 'prod-2',
        quantity: 1,
        unitPrice: 43,
        subtotal: 43
      }
    ],
    createdAt: '2026-05-05T03:12:00.000Z',
    updatedAt: '2026-05-06T03:12:00.000Z'
  },
  {
    id: 'ord-78',
    orderNumber: 'ORD-078',
    customerId: 'cust-7',
    customerName: 'Lorene Nader',
    customerPhone: '793-662-9303',
    customerAddress: '717 Meredith Orchard',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/66019584',
    totalAmount: 220,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '2WA20MCSFD',
    items: [
      {
        id: 'ti-6422976d-def2-4c35-93dd-b9999e85123f',
        productId: 'prod-5',
        quantity: 2,
        unitPrice: 94,
        subtotal: 188
      },
      {
        id: 'ti-f0bf44ed-857d-4881-90c2-7cd7abd69d32',
        productId: 'prod-24',
        quantity: 2,
        unitPrice: 16,
        subtotal: 32
      }
    ],
    createdAt: '2026-05-10T17:31:00.000Z',
    updatedAt: '2026-05-11T17:31:00.000Z'
  },
  {
    id: 'ord-79',
    orderNumber: 'ORD-079',
    customerId: 'cust-16',
    customerName: 'Mabel Bradtke',
    customerPhone: '(948) 212-4120 x8869',
    customerAddress: '26813 Bechtelar Way',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/61611185',
    totalAmount: 289,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'TV0PWON6DY',
    items: [
      {
        id: 'ti-82b8b1e3-ee4f-4780-b3ca-e9a85d03f7ab',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 16,
        subtotal: 48
      },
      {
        id: 'ti-552885cb-21f0-4931-898b-3406f99dfb40',
        productId: 'prod-13',
        quantity: 1,
        unitPrice: 59,
        subtotal: 59
      },
      {
        id: 'ti-f42ff9aa-bb57-4d70-bf82-ccb467e18459',
        productId: 'prod-16',
        quantity: 2,
        unitPrice: 91,
        subtotal: 182
      }
    ],
    createdAt: '2026-05-19T10:10:00.000Z',
    updatedAt: '2026-05-20T10:10:00.000Z'
  },
  {
    id: 'ord-80',
    orderNumber: 'ORD-080',
    customerId: 'cust-11',
    customerName: 'Skylar Larson Jr.',
    customerPhone: '(805) 215-9082',
    customerAddress: '82273 River Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/59389268',
    totalAmount: 298,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'L2NHW5C9CM',
    items: [
      {
        id: 'ti-3ff0bb6a-14df-464f-8b8e-723d44eb74ce',
        productId: 'prod-9',
        quantity: 1,
        unitPrice: 100,
        subtotal: 100
      },
      {
        id: 'ti-3189a3c9-6086-44fa-9066-56b2a0a619ac',
        productId: 'prod-18',
        quantity: 3,
        unitPrice: 66,
        subtotal: 198
      }
    ],
    createdAt: '2026-05-19T22:37:00.000Z',
    updatedAt: '2026-05-20T22:37:00.000Z'
  },
  {
    id: 'ord-81',
    orderNumber: 'ORD-081',
    customerId: 'cust-2',
    customerName: 'Ubaldo Casper',
    customerPhone: '444.607.7996 x112',
    customerAddress: '99625 Patti Burgs',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/47.jpg',
    totalAmount: 276,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    trackingNumber: 'SM8R39PW6G',
    items: [
      {
        id: 'ti-b751bec3-2a76-4495-9769-d160277d8c2c',
        productId: 'prod-11',
        quantity: 3,
        unitPrice: 92,
        subtotal: 276
      }
    ],
    createdAt: '2026-05-05T19:36:00.000Z',
    updatedAt: '2026-05-06T19:36:00.000Z'
  },
  {
    id: 'ord-82',
    orderNumber: 'ORD-082',
    customerId: 'cust-12',
    customerName: 'Dr. Margaretta Schaden',
    customerPhone: '(409) 371-5823',
    customerAddress: '603 Beech Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/31.jpg',
    totalAmount: 76,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '52SCMKYHFI',
    items: [
      {
        id: 'ti-a5e38900-1572-4a8d-9490-511b37719fee',
        productId: 'prod-18',
        quantity: 2,
        unitPrice: 38,
        subtotal: 76
      }
    ],
    createdAt: '2026-05-18T03:09:00.000Z',
    updatedAt: '2026-05-19T03:09:00.000Z'
  },
  {
    id: 'ord-83',
    orderNumber: 'ORD-083',
    customerId: 'cust-19',
    customerName: 'Ora Leuschke',
    customerPhone: '(589) 681-4023',
    customerAddress: '109 Sophie Drive',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/28286885',
    totalAmount: 352,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    trackingNumber: '51XX70NU7Q',
    items: [
      {
        id: 'ti-3d725b4c-4165-4e26-a8b0-2c66cd021a32',
        productId: 'prod-14',
        quantity: 2,
        unitPrice: 70,
        subtotal: 140
      },
      {
        id: 'ti-95a08332-b77e-440b-9976-87aabbd321a6',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 87,
        subtotal: 174
      },
      {
        id: 'ti-756567cf-d769-4894-9db5-46729270fb83',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 38,
        subtotal: 38
      }
    ],
    createdAt: '2026-05-13T10:49:00.000Z',
    updatedAt: '2026-05-14T10:49:00.000Z'
  },
  {
    id: 'ord-84',
    orderNumber: 'ORD-084',
    customerId: 'cust-4',
    customerName: 'Mr. Alberto Boyle',
    customerPhone: '533.303.2983 x329',
    customerAddress: '45113 Gislason Extension',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/78.jpg',
    totalAmount: 96,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'DELIVERED',
    trackingNumber: 'KIJDLBVNEO',
    items: [
      {
        id: 'ti-8350cdf8-f4ef-4302-9f1d-d7a20436bacc',
        productId: 'prod-4',
        quantity: 1,
        unitPrice: 96,
        subtotal: 96
      }
    ],
    createdAt: '2026-05-19T05:11:00.000Z',
    updatedAt: '2026-05-20T05:11:00.000Z'
  },
  {
    id: 'ord-85',
    orderNumber: 'ORD-085',
    customerId: 'cust-17',
    customerName: 'Mac Mertz',
    customerPhone: '(235) 770-7084 x989',
    customerAddress: '38521 Friesen-Rolfson Loaf',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/35.jpg',
    totalAmount: 377,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'LAAPH541JP',
    items: [
      {
        id: 'ti-aaf90c4e-9a56-43ca-aa00-15959d14167f',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 109,
        subtotal: 327
      },
      {
        id: 'ti-9a29a248-f0ef-4791-b289-958af9eee5de',
        productId: 'prod-9',
        quantity: 1,
        unitPrice: 50,
        subtotal: 50
      }
    ],
    createdAt: '2026-05-15T23:54:00.000Z',
    updatedAt: '2026-05-16T23:54:00.000Z'
  },
  {
    id: 'ord-86',
    orderNumber: 'ORD-086',
    customerId: 'cust-18',
    customerName: 'Simone Mann',
    customerPhone: '692.863.7364 x586',
    customerAddress: '618 Nienow Mews',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/32.jpg',
    totalAmount: 77,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: '4QP07I6V5O',
    items: [
      {
        id: 'ti-e79b6a25-823e-4a85-a10e-e3e999d5fc86',
        productId: 'prod-19',
        quantity: 1,
        unitPrice: 77,
        subtotal: 77
      }
    ],
    createdAt: '2026-05-14T02:19:00.000Z',
    updatedAt: '2026-05-15T02:19:00.000Z'
  },
  {
    id: 'ord-87',
    orderNumber: 'ORD-087',
    customerId: 'cust-12',
    customerName: 'Dolores Beer',
    customerPhone: '230-335-5426 x5138',
    customerAddress: '88350 Fredy Route',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/32097627',
    totalAmount: 444,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'DELIVERED',
    trackingNumber: '3KHMGIG97X',
    items: [
      {
        id: 'ti-c1242839-b625-4a2a-85fe-1f43f4270258',
        productId: 'prod-18',
        quantity: 3,
        unitPrice: 100,
        subtotal: 300
      },
      {
        id: 'ti-fa7e35e1-d271-449e-afde-518c6a23b649',
        productId: 'prod-16',
        quantity: 2,
        unitPrice: 72,
        subtotal: 144
      }
    ],
    createdAt: '2026-05-05T07:24:00.000Z',
    updatedAt: '2026-05-06T07:24:00.000Z'
  },
  {
    id: 'ord-88',
    orderNumber: 'ORD-088',
    customerId: 'cust-13',
    customerName: 'Lauren Crist',
    customerPhone: '566.405.3155',
    customerAddress: '9246 Luz Centers',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/47929930',
    totalAmount: 206,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'DY8RQ5LG8M',
    items: [
      {
        id: 'ti-81795416-3e9b-44c3-9fd0-a8f41c7e4250',
        productId: 'prod-2',
        quantity: 2,
        unitPrice: 25,
        subtotal: 50
      },
      {
        id: 'ti-2c6dab3b-8d37-403f-bd89-3e90b11e45f6',
        productId: 'prod-13',
        quantity: 3,
        unitPrice: 52,
        subtotal: 156
      }
    ],
    createdAt: '2026-05-21T11:14:00.000Z',
    updatedAt: '2026-05-22T11:14:00.000Z'
  },
  {
    id: 'ord-89',
    orderNumber: 'ORD-089',
    customerId: 'cust-1',
    customerName: 'Marian Will',
    customerPhone: '649.467.5038 x67238',
    customerAddress: '19365 Graham Ville',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/92657024',
    totalAmount: 443,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'G77O5FPI2N',
    items: [
      {
        id: 'ti-7ee99c4c-c229-46b1-bfbf-46c7f9cc3eef',
        productId: 'prod-14',
        quantity: 2,
        unitPrice: 85,
        subtotal: 170
      },
      {
        id: 'ti-7b53a51a-d3ca-40fc-8ac5-bde7087342bc',
        productId: 'prod-7',
        quantity: 1,
        unitPrice: 39,
        subtotal: 39
      },
      {
        id: 'ti-bce04bfa-2a1a-4b60-a86e-a919163174f8',
        productId: 'prod-12',
        quantity: 3,
        unitPrice: 78,
        subtotal: 234
      }
    ],
    createdAt: '2026-05-20T06:35:00.000Z',
    updatedAt: '2026-05-21T06:35:00.000Z'
  },
  {
    id: 'ord-90',
    orderNumber: 'ORD-090',
    customerId: 'cust-13',
    customerName: 'Mr. Kaia Okuneva',
    customerPhone: '872-419-4372',
    customerAddress: '530 Altenwerth Stravenue',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/79581459',
    totalAmount: 64,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'L6JBJM4VTD',
    items: [
      {
        id: 'ti-9b88e8c0-9d3d-4985-89f5-0a909d3d967d',
        productId: 'prod-19',
        quantity: 1,
        unitPrice: 64,
        subtotal: 64
      }
    ],
    createdAt: '2026-05-07T19:04:00.000Z',
    updatedAt: '2026-05-08T19:04:00.000Z'
  },
  {
    id: 'ord-91',
    orderNumber: 'ORD-091',
    customerId: 'cust-1',
    customerName: 'Agnes Ferry I',
    customerPhone: '778.521.3601',
    customerAddress: '129 Darrell Causeway',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/81.jpg',
    totalAmount: 135,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'DELIVERED',
    trackingNumber: 'S5E3101M41',
    items: [
      {
        id: 'ti-3b3f1074-2946-4d8a-8cd3-7eacd915fa7c',
        productId: 'prod-19',
        quantity: 1,
        unitPrice: 49,
        subtotal: 49
      },
      {
        id: 'ti-d2d2ab43-4749-4721-a69a-4006672f60f4',
        productId: 'prod-18',
        quantity: 1,
        unitPrice: 13,
        subtotal: 13
      },
      {
        id: 'ti-e07c2503-b4e0-4617-9239-94ea711f25fd',
        productId: 'prod-21',
        quantity: 1,
        unitPrice: 73,
        subtotal: 73
      }
    ],
    createdAt: '2026-06-02T02:25:00.000Z',
    updatedAt: '2026-06-03T02:25:00.000Z'
  },
  {
    id: 'ord-92',
    orderNumber: 'ORD-092',
    customerId: 'cust-16',
    customerName: 'Elyse Kemmer Sr.',
    customerPhone: '456-942-0314',
    customerAddress: '1815 Stamm Junction',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/94976115',
    totalAmount: 250,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'QYV4J6DKR7',
    items: [
      {
        id: 'ti-ff057dc7-dbb8-4159-9bf8-33bc099a4a41',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 40,
        subtotal: 120
      },
      {
        id: 'ti-69872f11-8b2b-45a8-ad52-ee489b989b2a',
        productId: 'prod-12',
        quantity: 2,
        unitPrice: 65,
        subtotal: 130
      }
    ],
    createdAt: '2026-06-10T17:53:00.000Z',
    updatedAt: '2026-06-11T17:53:00.000Z'
  },
  {
    id: 'ord-93',
    orderNumber: 'ORD-093',
    customerId: 'cust-19',
    customerName: 'Mr. Wiley Wuckert I',
    customerPhone: '1-973-567-1834 x466',
    customerAddress: '450 Winifred Unions',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/88820900',
    totalAmount: 421,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'AHJMHWTN26',
    items: [
      {
        id: 'ti-c47bc6bc-ac5c-4865-9042-a74197444a16',
        productId: 'prod-19',
        quantity: 2,
        unitPrice: 91,
        subtotal: 182
      },
      {
        id: 'ti-bffe2852-f5b3-4dfc-a10c-b368338ac481',
        productId: 'prod-9',
        quantity: 1,
        unitPrice: 95,
        subtotal: 95
      },
      {
        id: 'ti-7215ac39-420d-41bf-9d15-c687e1eac46a',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 72,
        subtotal: 144
      }
    ],
    createdAt: '2026-06-12T17:30:00.000Z',
    updatedAt: '2026-06-13T17:30:00.000Z'
  },
  {
    id: 'ord-94',
    orderNumber: 'ORD-094',
    customerId: 'cust-14',
    customerName: "Marlene D'Amore",
    customerPhone: '1-257-932-0829 x869',
    customerAddress: '501 Orchard Drive',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/52470411',
    totalAmount: 260,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'O5ADQ78300',
    items: [
      {
        id: 'ti-e7513fde-f20e-4367-b844-2a2a947e8c5a',
        productId: 'prod-13',
        quantity: 1,
        unitPrice: 38,
        subtotal: 38
      },
      {
        id: 'ti-94e29401-cbde-46f2-9ad5-c4eb4b3eab73',
        productId: 'prod-25',
        quantity: 3,
        unitPrice: 29,
        subtotal: 87
      },
      {
        id: 'ti-659bab62-8374-4d39-b796-e66721d04656',
        productId: 'prod-4',
        quantity: 3,
        unitPrice: 45,
        subtotal: 135
      }
    ],
    createdAt: '2026-06-04T05:48:00.000Z',
    updatedAt: '2026-06-05T05:48:00.000Z'
  },
  {
    id: 'ord-95',
    orderNumber: 'ORD-095',
    customerId: 'cust-4',
    customerName: 'Jerome Gulgowski',
    customerPhone: '936.863.4775 x27702',
    customerAddress: '4262 Jefferson Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/91087900',
    totalAmount: 313,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '9EIDZLCDES',
    items: [
      {
        id: 'ti-58d36276-53a9-43f7-b9c9-8dbc457e2882',
        productId: 'prod-19',
        quantity: 1,
        unitPrice: 98,
        subtotal: 98
      },
      {
        id: 'ti-1d46eee3-237c-44fb-b6ff-875f7ea2e785',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 93,
        subtotal: 186
      },
      {
        id: 'ti-c65123cd-07f2-4638-b699-8f13ef438086',
        productId: 'prod-3',
        quantity: 1,
        unitPrice: 29,
        subtotal: 29
      }
    ],
    createdAt: '2026-06-04T03:36:00.000Z',
    updatedAt: '2026-06-05T03:36:00.000Z'
  },
  {
    id: 'ord-96',
    orderNumber: 'ORD-096',
    customerId: 'cust-12',
    customerName: 'Jasper Spinka',
    customerPhone: '240-907-6189 x7624',
    customerAddress: '8093 Darnell Underpass',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/3.jpg',
    totalAmount: 281,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'READY_TO_SHIP',
    trackingNumber: '6QEISDO8VV',
    items: [
      {
        id: 'ti-a11ba23e-051d-4695-b0da-d86c2ea37102',
        productId: 'prod-18',
        quantity: 1,
        unitPrice: 83,
        subtotal: 83
      },
      {
        id: 'ti-88376064-ff9b-43a5-849c-83302f337496',
        productId: 'prod-20',
        quantity: 3,
        unitPrice: 56,
        subtotal: 168
      },
      {
        id: 'ti-a4a70e1e-d89f-435c-a35d-708ee5ca7450',
        productId: 'prod-2',
        quantity: 2,
        unitPrice: 15,
        subtotal: 30
      }
    ],
    createdAt: '2026-06-16T07:09:00.000Z',
    updatedAt: '2026-06-17T07:09:00.000Z'
  },
  {
    id: 'ord-97',
    orderNumber: 'ORD-097',
    customerId: 'cust-4',
    customerName: 'Luther Berge',
    customerPhone: '242.655.3043 x97612',
    customerAddress: '686 Green Row',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/10350361',
    totalAmount: 103,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'PE0RMWH8PY',
    items: [
      {
        id: 'ti-406cdce6-1607-4361-8374-7cf45cf1e33e',
        productId: 'prod-16',
        quantity: 1,
        unitPrice: 58,
        subtotal: 58
      },
      {
        id: 'ti-3280af6c-6b12-4071-a2bc-055a8cf6e0d4',
        productId: 'prod-5',
        quantity: 1,
        unitPrice: 45,
        subtotal: 45
      }
    ],
    createdAt: '2026-06-06T23:08:00.000Z',
    updatedAt: '2026-06-07T23:08:00.000Z'
  },
  {
    id: 'ord-98',
    orderNumber: 'ORD-098',
    customerId: 'cust-9',
    customerName: 'Davin Pouros',
    customerPhone: '(403) 676-4828 x4600',
    customerAddress: '8689 Gerard Bypass',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/73369352',
    totalAmount: 561,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    trackingNumber: '38ZA1YXM28',
    items: [
      {
        id: 'ti-9ec5e1f0-aa45-4ad5-82f8-f3683c673301',
        productId: 'prod-9',
        quantity: 2,
        unitPrice: 68,
        subtotal: 136
      },
      {
        id: 'ti-5dd7d52e-0f04-4ba5-b44a-e777f1b58b7d',
        productId: 'prod-18',
        quantity: 2,
        unitPrice: 52,
        subtotal: 104
      },
      {
        id: 'ti-fa14c1ab-1558-442f-bb70-bc28f8886f22',
        productId: 'prod-19',
        quantity: 3,
        unitPrice: 107,
        subtotal: 321
      }
    ],
    createdAt: '2026-06-09T22:17:00.000Z',
    updatedAt: '2026-06-10T22:17:00.000Z'
  },
  {
    id: 'ord-99',
    orderNumber: 'ORD-099',
    customerId: 'cust-12',
    customerName: 'Krista Kreiger',
    customerPhone: '811.863.3547 x0878',
    customerAddress: '927 Brook Road',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/75315648',
    totalAmount: 160,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'BH46JAEEPO',
    items: [
      {
        id: 'ti-9c7b2ebc-cf91-4833-a26a-227ad573cb7d',
        productId: 'prod-6',
        quantity: 2,
        unitPrice: 30,
        subtotal: 60
      },
      {
        id: 'ti-24208505-8a55-4217-9c8a-e5f116e6b038',
        productId: 'prod-21',
        quantity: 2,
        unitPrice: 50,
        subtotal: 100
      }
    ],
    createdAt: '2026-06-23T21:52:00.000Z',
    updatedAt: '2026-06-24T21:52:00.000Z'
  },
  {
    id: 'ord-100',
    orderNumber: 'ORD-100',
    customerId: 'cust-10',
    customerName: 'Tim Bednar',
    customerPhone: '410-832-0789 x1345',
    customerAddress: '488 Antonetta Dale',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/43460190',
    totalAmount: 285,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'C4CC0UGL7R',
    items: [
      {
        id: 'ti-1132616d-f149-4bcb-b5fb-1016e835867a',
        productId: 'prod-11',
        quantity: 3,
        unitPrice: 95,
        subtotal: 285
      }
    ],
    createdAt: '2026-06-04T13:19:00.000Z',
    updatedAt: '2026-06-05T13:19:00.000Z'
  },
  {
    id: 'ord-101',
    orderNumber: 'ORD-101',
    customerId: 'cust-13',
    customerName: 'Daryl McGlynn',
    customerPhone: '(308) 692-6390 x044',
    customerAddress: '7798 Bins Rest',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/87581721',
    totalAmount: 123,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'SHIPPED',
    trackingNumber: 'I9L9ZMFYI1',
    items: [
      {
        id: 'ti-6e50a913-b54b-4fc5-a8f4-81c8b474c10a',
        productId: 'prod-3',
        quantity: 3,
        unitPrice: 41,
        subtotal: 123
      }
    ],
    createdAt: '2026-06-19T10:26:00.000Z',
    updatedAt: '2026-06-20T10:26:00.000Z'
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-102',
    customerId: 'cust-6',
    customerName: 'Desiree Haag',
    customerPhone: '795-361-1464',
    customerAddress: '69335 Ullrich Cliffs',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/10260544',
    totalAmount: 348,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'DE3Y3SW8X1',
    items: [
      {
        id: 'ti-818aa2ed-20ac-48b8-bbde-c0949926964c',
        productId: 'prod-18',
        quantity: 2,
        unitPrice: 67,
        subtotal: 134
      },
      {
        id: 'ti-0a9508d3-1b70-4fe5-b108-1252218167f1',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 107,
        subtotal: 214
      }
    ],
    createdAt: '2026-06-23T18:40:00.000Z',
    updatedAt: '2026-06-24T18:40:00.000Z'
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-103',
    customerId: 'cust-14',
    customerName: 'Amos Will',
    customerPhone: '1-734-729-5276 x3039',
    customerAddress: '179 Woodside Road',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/21541702',
    totalAmount: 256,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: '822ZUPCO03',
    items: [
      {
        id: 'ti-8e715284-da72-4f68-8954-f265c48542a4',
        productId: 'prod-23',
        quantity: 2,
        unitPrice: 52,
        subtotal: 104
      },
      {
        id: 'ti-70f536be-f113-4779-a326-bc0ce782ccca',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 53,
        subtotal: 106
      },
      {
        id: 'ti-377ab16f-bdd9-4def-af69-82099bf4fadc',
        productId: 'prod-12',
        quantity: 1,
        unitPrice: 46,
        subtotal: 46
      }
    ],
    createdAt: '2026-06-22T13:12:00.000Z',
    updatedAt: '2026-06-23T13:12:00.000Z'
  },
  {
    id: 'ord-104',
    orderNumber: 'ORD-104',
    customerId: 'cust-4',
    customerName: 'Joyce Stanton',
    customerPhone: '784.713.3565 x982',
    customerAddress: '9739 Union Avenue',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/59559117',
    totalAmount: 150,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'READY_TO_SHIP',
    trackingNumber: 'OVG4K82K7Z',
    items: [
      {
        id: 'ti-d4743de9-8409-4236-a5ae-9fcd05b9600a',
        productId: 'prod-1',
        quantity: 3,
        unitPrice: 50,
        subtotal: 150
      }
    ],
    createdAt: '2026-06-28T07:12:00.000Z',
    updatedAt: '2026-06-29T07:12:00.000Z'
  },
  {
    id: 'ord-105',
    orderNumber: 'ORD-105',
    customerId: 'cust-5',
    customerName: 'Roland Bergstrom',
    customerPhone: '1-714-237-2804 x8811',
    customerAddress: '29132 Jadyn Corner',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/9787820',
    totalAmount: 42,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'Y6Y88M573C',
    items: [
      {
        id: 'ti-35e57fe1-5355-4cc6-b15b-a90fff698d9d',
        productId: 'prod-8',
        quantity: 1,
        unitPrice: 42,
        subtotal: 42
      }
    ],
    createdAt: '2026-06-18T12:44:00.000Z',
    updatedAt: '2026-06-19T12:44:00.000Z'
  },
  {
    id: 'ord-106',
    orderNumber: 'ORD-106',
    customerId: 'cust-11',
    customerName: 'Elfrieda Brakus',
    customerPhone: '(344) 201-2194 x3598',
    customerAddress: '2865 Chyna Coves',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/34320892',
    totalAmount: 402,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'SQKLOJECE3',
    items: [
      {
        id: 'ti-94589115-dd70-493d-86a0-d0cd23b8e1bc',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 50,
        subtotal: 150
      },
      {
        id: 'ti-9f799ff2-09cd-462c-8b78-a45d315f95de',
        productId: 'prod-16',
        quantity: 2,
        unitPrice: 72,
        subtotal: 144
      },
      {
        id: 'ti-04e0bc6f-5a93-42c6-94c6-a7e45ee7f234',
        productId: 'prod-23',
        quantity: 1,
        unitPrice: 108,
        subtotal: 108
      }
    ],
    createdAt: '2026-06-04T01:45:00.000Z',
    updatedAt: '2026-06-05T01:45:00.000Z'
  },
  {
    id: 'ord-107',
    orderNumber: 'ORD-107',
    customerId: 'cust-17',
    customerName: 'Troy Botsford',
    customerPhone: '480.838.2632 x1011',
    customerAddress: '3544 Hattie Motorway',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/41.jpg',
    totalAmount: 478,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    trackingNumber: '05J9GWLYVP',
    items: [
      {
        id: 'ti-cfbb87a1-d333-4a4a-93cd-3320462b40dd',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 54,
        subtotal: 162
      },
      {
        id: 'ti-a7a0db77-e6de-4deb-970e-ad0230184362',
        productId: 'prod-11',
        quantity: 3,
        unitPrice: 82,
        subtotal: 246
      },
      {
        id: 'ti-a25eb48f-00f4-4dbc-ba1d-d7b4be7bece5',
        productId: 'prod-4',
        quantity: 1,
        unitPrice: 70,
        subtotal: 70
      }
    ],
    createdAt: '2026-06-06T02:53:00.000Z',
    updatedAt: '2026-06-07T02:53:00.000Z'
  },
  {
    id: 'ord-108',
    orderNumber: 'ORD-108',
    customerId: 'cust-8',
    customerName: 'Luna Champlin IV',
    customerPhone: '503.235.3541',
    customerAddress: '2417 Orpha Park',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/46.jpg',
    totalAmount: 293,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'CIFFVWGS3D',
    items: [
      {
        id: 'ti-f374091e-b123-4580-be61-924284f9f0ca',
        productId: 'prod-10',
        quantity: 1,
        unitPrice: 14,
        subtotal: 14
      },
      {
        id: 'ti-b5571e94-ec99-49a2-a930-b7e2a27ca4ad',
        productId: 'prod-20',
        quantity: 3,
        unitPrice: 78,
        subtotal: 234
      },
      {
        id: 'ti-6ac364a8-bae4-4a3b-a390-0987cf61daa3',
        productId: 'prod-2',
        quantity: 3,
        unitPrice: 15,
        subtotal: 45
      }
    ],
    createdAt: '2026-06-14T18:14:00.000Z',
    updatedAt: '2026-06-15T18:14:00.000Z'
  },
  {
    id: 'ord-109',
    orderNumber: 'ORD-109',
    customerId: 'cust-4',
    customerName: 'Josefina Barton I',
    customerPhone: '1-210-813-6382 x11100',
    customerAddress: '737 Johnson Plaza',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/90.jpg',
    totalAmount: 264,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: '4IBGD3436E',
    items: [
      {
        id: 'ti-0bddafc0-b080-42dc-8c47-fcb41787060c',
        productId: 'prod-12',
        quantity: 3,
        unitPrice: 88,
        subtotal: 264
      }
    ],
    createdAt: '2026-06-16T01:54:00.000Z',
    updatedAt: '2026-06-17T01:54:00.000Z'
  },
  {
    id: 'ord-110',
    orderNumber: 'ORD-110',
    customerId: 'cust-17',
    customerName: 'Pietro Hickle',
    customerPhone: '361-548-7656',
    customerAddress: '8349 Ledner Forge',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/53920418',
    totalAmount: 46,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'READY_TO_SHIP',
    trackingNumber: 'NZVDMGCFTO',
    items: [
      {
        id: 'ti-2a958cea-679f-49c9-857c-50f02cfd4b56',
        productId: 'prod-11',
        quantity: 2,
        unitPrice: 23,
        subtotal: 46
      }
    ],
    createdAt: '2026-06-20T02:53:00.000Z',
    updatedAt: '2026-06-21T02:53:00.000Z'
  },
  {
    id: 'ord-111',
    orderNumber: 'ORD-111',
    customerId: 'cust-9',
    customerName: 'Cordelia Pfeffer',
    customerPhone: '830-990-4553 x46418',
    customerAddress: '22045 Streich Forest',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/94.jpg',
    totalAmount: 212,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: '9MMTOWTWMU',
    items: [
      {
        id: 'ti-2d1d59fa-9822-4126-acd7-69531f20e1cf',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 50,
        subtotal: 100
      },
      {
        id: 'ti-79ed097e-1ab6-449a-9137-b6e4311c295a',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 56,
        subtotal: 112
      }
    ],
    createdAt: '2026-06-26T16:20:00.000Z',
    updatedAt: '2026-06-27T16:20:00.000Z'
  },
  {
    id: 'ord-112',
    orderNumber: 'ORD-112',
    customerId: 'cust-10',
    customerName: 'Alize Donnelly',
    customerPhone: '(406) 269-3356 x763',
    customerAddress: '81306 Barn Close',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/98212182',
    totalAmount: 567,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'Y4UOOZ42EP',
    items: [
      {
        id: 'ti-1675b5ca-6c7d-4f69-9227-e0280943723e',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 64,
        subtotal: 192
      },
      {
        id: 'ti-e43591c7-9868-47b8-9e44-93404650f604',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 98,
        subtotal: 294
      },
      {
        id: 'ti-7d830408-21db-45fa-96d9-0b4b930d733b',
        productId: 'prod-17',
        quantity: 1,
        unitPrice: 81,
        subtotal: 81
      }
    ],
    createdAt: '2026-06-02T19:49:00.000Z',
    updatedAt: '2026-06-03T19:49:00.000Z'
  },
  {
    id: 'ord-113',
    orderNumber: 'ORD-113',
    customerId: 'cust-7',
    customerName: 'Savion Collier',
    customerPhone: '(329) 599-9599',
    customerAddress: '13644 E Elm Street',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/0.jpg',
    totalAmount: 56,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: '30EQ0ADKUS',
    items: [
      {
        id: 'ti-3a33988c-2b36-4471-aa9e-a4cce50848bb',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 28,
        subtotal: 56
      }
    ],
    createdAt: '2026-06-16T06:20:00.000Z',
    updatedAt: '2026-06-17T06:20:00.000Z'
  },
  {
    id: 'ord-114',
    orderNumber: 'ORD-114',
    customerId: 'cust-10',
    customerName: 'Rita Daugherty',
    customerPhone: '665-496-4829 x076',
    customerAddress: '2058 Laburnum Grove',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/54480856',
    totalAmount: 224,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: '3D3ZFVPS57',
    items: [
      {
        id: 'ti-5449e99f-e1ba-4fb6-89b3-6046adca9134',
        productId: 'prod-9',
        quantity: 1,
        unitPrice: 87,
        subtotal: 87
      },
      {
        id: 'ti-313fb481-ba5a-4d4d-8aae-2ec83a66effe',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 29,
        subtotal: 58
      },
      {
        id: 'ti-bac6cc76-5326-4fde-851d-615593b54726',
        productId: 'prod-19',
        quantity: 1,
        unitPrice: 79,
        subtotal: 79
      }
    ],
    createdAt: '2026-06-11T18:25:00.000Z',
    updatedAt: '2026-06-12T18:25:00.000Z'
  },
  {
    id: 'ord-115',
    orderNumber: 'ORD-115',
    customerId: 'cust-20',
    customerName: 'Stevie Fritsch',
    customerPhone: '418-918-5361 x8479',
    customerAddress: '17838 Ullrich Mills',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/4953303',
    totalAmount: 174,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    trackingNumber: '5XGJHPWY69',
    items: [
      {
        id: 'ti-580ce187-5e3d-4a1a-a3e8-905522016a54',
        productId: 'prod-5',
        quantity: 2,
        unitPrice: 75,
        subtotal: 150
      },
      {
        id: 'ti-72de2eff-a05a-4174-8f44-ccb932a7ec83',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 24,
        subtotal: 24
      }
    ],
    createdAt: '2026-07-09T07:31:00.000Z',
    updatedAt: '2026-07-10T07:31:00.000Z'
  },
  {
    id: 'ord-116',
    orderNumber: 'ORD-116',
    customerId: 'cust-5',
    customerName: 'Flora Koss',
    customerPhone: '(314) 842-9422',
    customerAddress: '4253 Olga Keys',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/8745708',
    totalAmount: 132,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'VC3MMOAOYV',
    items: [
      {
        id: 'ti-34fb52b9-f0d6-46da-bf0e-192b8f40e7ee',
        productId: 'prod-24',
        quantity: 2,
        unitPrice: 66,
        subtotal: 132
      }
    ],
    createdAt: '2026-07-09T16:31:00.000Z',
    updatedAt: '2026-07-10T16:31:00.000Z'
  },
  {
    id: 'ord-117',
    orderNumber: 'ORD-117',
    customerId: 'cust-11',
    customerName: 'Jason Ruecker-Gleichner',
    customerPhone: '324.952.7106 x06887',
    customerAddress: '130 Francisco Neck',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/54857209',
    totalAmount: 187,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    trackingNumber: '6HEHC3ICC4',
    items: [
      {
        id: 'ti-0e48a846-4ba0-4a00-92af-c07d9d922274',
        productId: 'prod-9',
        quantity: 2,
        unitPrice: 20,
        subtotal: 40
      },
      {
        id: 'ti-d3c728d1-deed-449c-aec8-79acbf67010f',
        productId: 'prod-10',
        quantity: 3,
        unitPrice: 49,
        subtotal: 147
      }
    ],
    createdAt: '2026-07-25T07:54:00.000Z',
    updatedAt: '2026-07-26T07:54:00.000Z'
  },
  {
    id: 'ord-118',
    orderNumber: 'ORD-118',
    customerId: 'cust-10',
    customerName: 'Ms. Rose Reinger',
    customerPhone: '1-955-387-1976 x73375',
    customerAddress: '328 Balistreri Camp',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/71364104',
    totalAmount: 92,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'XO9S84GL7W',
    items: [
      {
        id: 'ti-f59c8bce-7957-4892-b11b-919125c995c2',
        productId: 'prod-6',
        quantity: 2,
        unitPrice: 46,
        subtotal: 92
      }
    ],
    createdAt: '2026-07-24T00:03:00.000Z',
    updatedAt: '2026-07-25T00:03:00.000Z'
  },
  {
    id: 'ord-119',
    orderNumber: 'ORD-119',
    customerId: 'cust-2',
    customerName: 'Mozelle Emmerich',
    customerPhone: '1-915-591-0849 x7072',
    customerAddress: '910 Melba Lakes',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/50453898',
    totalAmount: 129,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '8UEZZL7HP0',
    items: [
      {
        id: 'ti-51bab9f7-e359-4ba5-b91b-7a435d866340',
        productId: 'prod-15',
        quantity: 3,
        unitPrice: 43,
        subtotal: 129
      }
    ],
    createdAt: '2026-07-26T09:48:00.000Z',
    updatedAt: '2026-07-27T09:48:00.000Z'
  },
  {
    id: 'ord-120',
    orderNumber: 'ORD-120',
    customerId: 'cust-5',
    customerName: 'Ana Koch DDS',
    customerPhone: '855.963.1890 x5927',
    customerAddress: '78071 Memorial Drive',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/39561423',
    totalAmount: 229,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'HDC9CASYIO',
    items: [
      {
        id: 'ti-84253b5c-4793-47e5-9da2-a40141e2da31',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 107,
        subtotal: 214
      },
      {
        id: 'ti-43c96228-d2c9-48b4-b53c-c9167b0e8d0b',
        productId: 'prod-23',
        quantity: 1,
        unitPrice: 15,
        subtotal: 15
      }
    ],
    createdAt: '2026-07-24T00:48:00.000Z',
    updatedAt: '2026-07-25T00:48:00.000Z'
  },
  {
    id: 'ord-121',
    orderNumber: 'ORD-121',
    customerId: 'cust-12',
    customerName: 'Marlee Willms',
    customerPhone: '1-733-384-3652 x376',
    customerAddress: '482 Wiegand Common',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/1.jpg',
    totalAmount: 77,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'H6X9FF7W4K',
    items: [
      {
        id: 'ti-3f8607f0-3dc3-4f75-96f1-7c029a048c23',
        productId: 'prod-12',
        quantity: 3,
        unitPrice: 15,
        subtotal: 45
      },
      {
        id: 'ti-1ea3d857-14ec-4e48-a570-030c45a06715',
        productId: 'prod-12',
        quantity: 2,
        unitPrice: 16,
        subtotal: 32
      }
    ],
    createdAt: '2026-07-11T16:25:00.000Z',
    updatedAt: '2026-07-12T16:25:00.000Z'
  },
  {
    id: 'ord-122',
    orderNumber: 'ORD-122',
    customerId: 'cust-18',
    customerName: 'Orlando Collier',
    customerPhone: '623.430.8473 x03757',
    customerAddress: '223 Lowe Parks',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/61.jpg',
    totalAmount: 56,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: '2X6J5ILKFY',
    items: [
      {
        id: 'ti-ff34065d-fd5a-4a7c-b046-66ef8546e9a4',
        productId: 'prod-2',
        quantity: 1,
        unitPrice: 56,
        subtotal: 56
      }
    ],
    createdAt: '2026-07-05T21:07:00.000Z',
    updatedAt: '2026-07-06T21:07:00.000Z'
  },
  {
    id: 'ord-123',
    orderNumber: 'ORD-123',
    customerId: 'cust-8',
    customerName: 'Julius Haley',
    customerPhone: '794.505.4196 x62185',
    customerAddress: '3189 Gisselle Route',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/88993410',
    totalAmount: 273,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: '1UZ3F6IUKI',
    items: [
      {
        id: 'ti-0effbc8f-152b-43cf-8a2f-385d9e03f8cc',
        productId: 'prod-3',
        quantity: 2,
        unitPrice: 51,
        subtotal: 102
      },
      {
        id: 'ti-bea0780a-c185-4426-aa9d-10a3c728d6e1',
        productId: 'prod-8',
        quantity: 1,
        unitPrice: 84,
        subtotal: 84
      },
      {
        id: 'ti-01ed8a82-2e51-4782-a133-34ebdc883627',
        productId: 'prod-22',
        quantity: 3,
        unitPrice: 29,
        subtotal: 87
      }
    ],
    createdAt: '2026-07-25T23:52:00.000Z',
    updatedAt: '2026-07-26T23:52:00.000Z'
  },
  {
    id: 'ord-124',
    orderNumber: 'ORD-124',
    customerId: 'cust-14',
    customerName: 'Emanuel Goldner',
    customerPhone: '464.813.4815 x973',
    customerAddress: '12924 Heathcote Locks',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/52210405',
    totalAmount: 317,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '0H94KAMH7Q',
    items: [
      {
        id: 'ti-d6dc1726-774a-4271-835a-857ad35e474e',
        productId: 'prod-4',
        quantity: 3,
        unitPrice: 66,
        subtotal: 198
      },
      {
        id: 'ti-4aa40fe1-495b-49ab-9777-f14e6ac449dc',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 36,
        subtotal: 108
      },
      {
        id: 'ti-d11d8fd5-fa2c-490b-8356-9839310feb47',
        productId: 'prod-21',
        quantity: 1,
        unitPrice: 11,
        subtotal: 11
      }
    ],
    createdAt: '2026-07-22T07:49:00.000Z',
    updatedAt: '2026-07-23T07:49:00.000Z'
  },
  {
    id: 'ord-125',
    orderNumber: 'ORD-125',
    customerId: 'cust-1',
    customerName: 'Miss Velma Stanton',
    customerPhone: '(201) 775-6851 x7180',
    customerAddress: '5641 Bath Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/36579510',
    totalAmount: 307,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'DENS0FT7ZR',
    items: [
      {
        id: 'ti-295c8e9d-8938-462c-9b76-dea1ffaf7d1f',
        productId: 'prod-11',
        quantity: 2,
        unitPrice: 11,
        subtotal: 22
      },
      {
        id: 'ti-9569f1b2-e253-4efc-80a8-72677ddb78d9',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 95,
        subtotal: 285
      }
    ],
    createdAt: '2026-07-13T08:06:00.000Z',
    updatedAt: '2026-07-14T08:06:00.000Z'
  },
  {
    id: 'ord-126',
    orderNumber: 'ORD-126',
    customerId: 'cust-4',
    customerName: 'Willis McLaughlin',
    customerPhone: '(347) 238-7526 x0314',
    customerAddress: '2688 School Road',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/66124169',
    totalAmount: 69,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'WGK9AJLQK3',
    items: [
      {
        id: 'ti-2c7f9283-5262-4729-a192-079a6681888f',
        productId: 'prod-13',
        quantity: 1,
        unitPrice: 69,
        subtotal: 69
      }
    ],
    createdAt: '2026-07-09T05:22:00.000Z',
    updatedAt: '2026-07-10T05:22:00.000Z'
  },
  {
    id: 'ord-127',
    orderNumber: 'ORD-127',
    customerId: 'cust-14',
    customerName: 'Myrtice Bogan I',
    customerPhone: '860.450.6312',
    customerAddress: '481 Rau Villages',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/63668290',
    totalAmount: 180,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: '1K3YVZ3MYX',
    items: [
      {
        id: 'ti-18eff43f-90e8-4a5b-9447-51a78adb16be',
        productId: 'prod-3',
        quantity: 1,
        unitPrice: 70,
        subtotal: 70
      },
      {
        id: 'ti-737e54bf-e170-438d-9ba0-f3edbc6b97e6',
        productId: 'prod-12',
        quantity: 2,
        unitPrice: 55,
        subtotal: 110
      }
    ],
    createdAt: '2026-07-25T10:47:00.000Z',
    updatedAt: '2026-07-26T10:47:00.000Z'
  },
  {
    id: 'ord-128',
    orderNumber: 'ORD-128',
    customerId: 'cust-15',
    customerName: 'Mr. Nathaniel Veum',
    customerPhone: '(609) 971-4067',
    customerAddress: '672 The Beeches',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/60667658',
    totalAmount: 287,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'F6OYEK8PC9',
    items: [
      {
        id: 'ti-83ef2d62-119f-4c01-9924-aba4dc9677ba',
        productId: 'prod-16',
        quantity: 2,
        unitPrice: 108,
        subtotal: 216
      },
      {
        id: 'ti-f1b70b0c-a485-441b-b67b-697420ff864e',
        productId: 'prod-5',
        quantity: 1,
        unitPrice: 17,
        subtotal: 17
      },
      {
        id: 'ti-45a6225c-c9b9-444b-baf1-c8ed05c8af41',
        productId: 'prod-13',
        quantity: 3,
        unitPrice: 18,
        subtotal: 54
      }
    ],
    createdAt: '2026-07-23T22:38:00.000Z',
    updatedAt: '2026-07-24T22:38:00.000Z'
  },
  {
    id: 'ord-129',
    orderNumber: 'ORD-129',
    customerId: 'cust-14',
    customerName: 'Thomas Shields',
    customerPhone: '593.500.0732',
    customerAddress: '76934 Central Avenue',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/97.jpg',
    totalAmount: 395,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'YH9GCDCJR5',
    items: [
      {
        id: 'ti-7b070ee5-170c-422f-930d-d19c5f952e87',
        productId: 'prod-17',
        quantity: 3,
        unitPrice: 51,
        subtotal: 153
      },
      {
        id: 'ti-7790e820-07b2-4ddd-aa96-a0449d75f465',
        productId: 'prod-10',
        quantity: 3,
        unitPrice: 30,
        subtotal: 90
      },
      {
        id: 'ti-9697047e-5c69-43d4-af28-58558b093a4a',
        productId: 'prod-11',
        quantity: 2,
        unitPrice: 76,
        subtotal: 152
      }
    ],
    createdAt: '2026-07-17T11:30:00.000Z',
    updatedAt: '2026-07-18T11:30:00.000Z'
  },
  {
    id: 'ord-130',
    orderNumber: 'ORD-130',
    customerId: 'cust-3',
    customerName: 'Elliot Gutmann DVM',
    customerPhone: '(936) 674-8271 x00740',
    customerAddress: "2023 O'Connell Well",
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/54.jpg',
    totalAmount: 626,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: '4UMCIULSGL',
    items: [
      {
        id: 'ti-4aacf03a-ba7f-40cf-9b9a-4200b07716b3',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 61,
        subtotal: 183
      },
      {
        id: 'ti-edb37b58-667d-4d6a-b6e9-97d21f94cd3f',
        productId: 'prod-17',
        quantity: 3,
        unitPrice: 75,
        subtotal: 225
      },
      {
        id: 'ti-697115f7-df2a-4d00-9d30-9edfd40f6a49',
        productId: 'prod-22',
        quantity: 2,
        unitPrice: 109,
        subtotal: 218
      }
    ],
    createdAt: '2026-07-06T23:09:00.000Z',
    updatedAt: '2026-07-07T23:09:00.000Z'
  },
  {
    id: 'ord-131',
    orderNumber: 'ORD-131',
    customerId: 'cust-11',
    customerName: 'Heaven Bayer',
    customerPhone: '1-340-408-0991 x8343',
    customerAddress: '9354 Jennyfer Mills',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/34202561',
    totalAmount: 650,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'DELIVERED',
    trackingNumber: 'LEU2P9I3P1',
    items: [
      {
        id: 'ti-281db755-8d7b-4800-808c-b8d3cafe2d30',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 93,
        subtotal: 279
      },
      {
        id: 'ti-7adf7c33-a2dc-4719-a816-f429bda6031c',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 55,
        subtotal: 110
      },
      {
        id: 'ti-374c1d14-8fb4-4d02-9f53-8f7ba27cd1d7',
        productId: 'prod-24',
        quantity: 3,
        unitPrice: 87,
        subtotal: 261
      }
    ],
    createdAt: '2026-07-22T15:40:00.000Z',
    updatedAt: '2026-07-23T15:40:00.000Z'
  },
  {
    id: 'ord-132',
    orderNumber: 'ORD-132',
    customerId: 'cust-16',
    customerName: 'Miranda Skiles',
    customerPhone: '(588) 981-4258',
    customerAddress: '6284 George Street',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/11.jpg',
    totalAmount: 30,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '67IC6A2E46',
    items: [
      {
        id: 'ti-4d65dc74-0864-428f-a5f0-ea848c274b13',
        productId: 'prod-10',
        quantity: 1,
        unitPrice: 30,
        subtotal: 30
      }
    ],
    createdAt: '2026-07-15T13:40:00.000Z',
    updatedAt: '2026-07-16T13:40:00.000Z'
  },
  {
    id: 'ord-133',
    orderNumber: 'ORD-133',
    customerId: 'cust-17',
    customerName: 'Gladyce Kessler',
    customerPhone: '636.636.8572 x6015',
    customerAddress: '63280 Jeannie Island',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/77326428',
    totalAmount: 28,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'KEYOF4OIIT',
    items: [
      {
        id: 'ti-c5ac8ce7-d838-466d-9674-8ef59d0037f4',
        productId: 'prod-2',
        quantity: 2,
        unitPrice: 14,
        subtotal: 28
      }
    ],
    createdAt: '2026-07-19T00:55:00.000Z',
    updatedAt: '2026-07-20T00:55:00.000Z'
  },
  {
    id: 'ord-134',
    orderNumber: 'ORD-134',
    customerId: 'cust-20',
    customerName: 'Tiana Carter',
    customerPhone: '743-804-8280 x75613',
    customerAddress: '289 Leffler Rest',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/2.jpg',
    totalAmount: 226,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '8AC5CJ639G',
    items: [
      {
        id: 'ti-2b747730-a74f-47c2-b46b-1ff177799520',
        productId: 'prod-18',
        quantity: 2,
        unitPrice: 27,
        subtotal: 54
      },
      {
        id: 'ti-0191587f-9017-4cf7-a190-8dd4b804f02d',
        productId: 'prod-22',
        quantity: 2,
        unitPrice: 86,
        subtotal: 172
      }
    ],
    createdAt: '2026-07-24T14:54:00.000Z',
    updatedAt: '2026-07-25T14:54:00.000Z'
  },
  {
    id: 'ord-135',
    orderNumber: 'ORD-135',
    customerId: 'cust-7',
    customerName: 'Columbus Kilback',
    customerPhone: '1-838-708-9209 x6111',
    customerAddress: '18652 Alexandra Road',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/94583387',
    totalAmount: 132,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'C0541QG1SI',
    items: [
      {
        id: 'ti-e10f2cd5-a9d1-4854-9eb1-37988ede54e0',
        productId: 'prod-20',
        quantity: 3,
        unitPrice: 44,
        subtotal: 132
      }
    ],
    createdAt: '2026-07-05T05:40:00.000Z',
    updatedAt: '2026-07-06T05:40:00.000Z'
  },
  {
    id: 'ord-136',
    orderNumber: 'ORD-136',
    customerId: 'cust-7',
    customerName: 'Daphnee Stehr-Haag',
    customerPhone: '664-530-8551 x598',
    customerAddress: '6740 New Lane',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/2.jpg',
    totalAmount: 60,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '2VLGZ6XAVW',
    items: [
      {
        id: 'ti-94702918-60fb-4b16-b4f4-1085736ca069',
        productId: 'prod-7',
        quantity: 2,
        unitPrice: 30,
        subtotal: 60
      }
    ],
    createdAt: '2026-07-02T23:24:00.000Z',
    updatedAt: '2026-07-03T23:24:00.000Z'
  },
  {
    id: 'ord-137',
    orderNumber: 'ORD-137',
    customerId: 'cust-8',
    customerName: 'Janet Kautzer',
    customerPhone: '1-954-553-0110',
    customerAddress: '8867 High Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/67.jpg',
    totalAmount: 227,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '890V52R8ZQ',
    items: [
      {
        id: 'ti-77c493fc-512c-4868-9486-be1d10c090c8',
        productId: 'prod-9',
        quantity: 2,
        unitPrice: 98,
        subtotal: 196
      },
      {
        id: 'ti-295d0afc-3975-4281-b64f-c9de09f1fdd2',
        productId: 'prod-17',
        quantity: 1,
        unitPrice: 31,
        subtotal: 31
      }
    ],
    createdAt: '2026-07-04T12:08:00.000Z',
    updatedAt: '2026-07-05T12:08:00.000Z'
  },
  {
    id: 'ord-138',
    orderNumber: 'ORD-138',
    customerId: 'cust-14',
    customerName: 'Anibal Dooley',
    customerPhone: '338.332.9477',
    customerAddress: '395 Jenkins Park',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/11573353',
    totalAmount: 186,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: '9UNMNEB5K1',
    items: [
      {
        id: 'ti-6924b7b8-8279-409d-acb1-745abeef16ce',
        productId: 'prod-16',
        quantity: 1,
        unitPrice: 106,
        subtotal: 106
      },
      {
        id: 'ti-d630f1a4-a810-4f81-9c39-a22f177df189',
        productId: 'prod-24',
        quantity: 1,
        unitPrice: 26,
        subtotal: 26
      },
      {
        id: 'ti-666a31fd-b533-4c44-8400-b241914e7ed9',
        productId: 'prod-11',
        quantity: 1,
        unitPrice: 54,
        subtotal: 54
      }
    ],
    createdAt: '2026-08-18T20:40:00.000Z',
    updatedAt: '2026-08-19T20:40:00.000Z'
  },
  {
    id: 'ord-139',
    orderNumber: 'ORD-139',
    customerId: 'cust-18',
    customerName: 'Dawn Lockman-Rolfson',
    customerPhone: '(662) 959-7073 x7459',
    customerAddress: '520 Roberto Curve',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/46905081',
    totalAmount: 30,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '4OXU3QZRA0',
    items: [
      {
        id: 'ti-2047fc1e-e1fc-40f2-9cd9-e2be438cd5d4',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 15,
        subtotal: 30
      }
    ],
    createdAt: '2026-08-18T18:02:00.000Z',
    updatedAt: '2026-08-19T18:02:00.000Z'
  },
  {
    id: 'ord-140',
    orderNumber: 'ORD-140',
    customerId: 'cust-17',
    customerName: 'Kayla Torp',
    customerPhone: '839.587.2331 x111',
    customerAddress: '1872 Torphy Spring',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/23.jpg',
    totalAmount: 410,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'DWX3UZ2788',
    items: [
      {
        id: 'ti-3bdb0de3-69b1-4683-ba2c-a7d097d1dcaf',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 60,
        subtotal: 180
      },
      {
        id: 'ti-4b6ad6a5-d32b-468d-9f6b-7686d77f96de',
        productId: 'prod-12',
        quantity: 2,
        unitPrice: 61,
        subtotal: 122
      },
      {
        id: 'ti-a939c5cf-f48f-4bc5-8007-a2d19721b3e1',
        productId: 'prod-23',
        quantity: 1,
        unitPrice: 108,
        subtotal: 108
      }
    ],
    createdAt: '2026-08-14T02:40:00.000Z',
    updatedAt: '2026-08-15T02:40:00.000Z'
  },
  {
    id: 'ord-141',
    orderNumber: 'ORD-141',
    customerId: 'cust-6',
    customerName: 'Casimer Reynolds-Berge II',
    customerPhone: '440.935.8881 x703',
    customerAddress: '132 Morissette Drives',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/47678442',
    totalAmount: 273,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '89Y54TTGAA',
    items: [
      {
        id: 'ti-ab3f09f3-5af8-4d01-8100-bb678fb501a0',
        productId: 'prod-17',
        quantity: 2,
        unitPrice: 57,
        subtotal: 114
      },
      {
        id: 'ti-3b438ddf-f564-4723-8b4e-7a858eea92ef',
        productId: 'prod-2',
        quantity: 2,
        unitPrice: 65,
        subtotal: 130
      },
      {
        id: 'ti-21a840e6-f8e6-487a-81bd-e6da439276c1',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 29,
        subtotal: 29
      }
    ],
    createdAt: '2026-08-03T23:06:00.000Z',
    updatedAt: '2026-08-04T23:06:00.000Z'
  },
  {
    id: 'ord-142',
    orderNumber: 'ORD-142',
    customerId: 'cust-3',
    customerName: 'Patricia Simonis',
    customerPhone: '739-726-2710',
    customerAddress: '3873 Marsh Lane',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/46.jpg',
    totalAmount: 160,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '7J64WCS1GV',
    items: [
      {
        id: 'ti-28f43003-be96-4b9b-ab38-2f7b849469ce',
        productId: 'prod-18',
        quantity: 2,
        unitPrice: 26,
        subtotal: 52
      },
      {
        id: 'ti-cfb9764f-2c3f-4b16-8da6-e065d5308571',
        productId: 'prod-4',
        quantity: 2,
        unitPrice: 54,
        subtotal: 108
      }
    ],
    createdAt: '2026-08-09T04:47:00.000Z',
    updatedAt: '2026-08-10T04:47:00.000Z'
  },
  {
    id: 'ord-143',
    orderNumber: 'ORD-143',
    customerId: 'cust-14',
    customerName: 'Beth Schinner',
    customerPhone: '662-208-4747 x32237',
    customerAddress: '8745 The Oaks',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/53.jpg',
    totalAmount: 347,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'VUJ76WO6HH',
    items: [
      {
        id: 'ti-15fbf850-ce0b-41f0-963c-8aff52210dec',
        productId: 'prod-20',
        quantity: 3,
        unitPrice: 103,
        subtotal: 309
      },
      {
        id: 'ti-604f6fae-6a36-4036-a1c8-ebbf64f8217b',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 38,
        subtotal: 38
      }
    ],
    createdAt: '2026-08-12T08:17:00.000Z',
    updatedAt: '2026-08-13T08:17:00.000Z'
  },
  {
    id: 'ord-144',
    orderNumber: 'ORD-144',
    customerId: 'cust-14',
    customerName: 'Andre Douglas',
    customerPhone: '612.718.1409',
    customerAddress: '4110 Silvia Brooks',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/99.jpg',
    totalAmount: 144,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    trackingNumber: 'HP8UTR6OZK',
    items: [
      {
        id: 'ti-a2be8705-9a41-482c-b829-aabf3a9ae90b',
        productId: 'prod-17',
        quantity: 1,
        unitPrice: 83,
        subtotal: 83
      },
      {
        id: 'ti-4c1633d4-4bbc-4df7-8542-a6f5d22ce381',
        productId: 'prod-11',
        quantity: 1,
        unitPrice: 35,
        subtotal: 35
      },
      {
        id: 'ti-3f2066ae-d974-460c-961f-c9e28da8795c',
        productId: 'prod-17',
        quantity: 1,
        unitPrice: 26,
        subtotal: 26
      }
    ],
    createdAt: '2026-08-01T09:18:00.000Z',
    updatedAt: '2026-08-02T09:18:00.000Z'
  },
  {
    id: 'ord-145',
    orderNumber: 'ORD-145',
    customerId: 'cust-14',
    customerName: 'Ed Kautzer Jr.',
    customerPhone: '(812) 728-9664 x94015',
    customerAddress: '9948 Vicarage Close',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/48.jpg',
    totalAmount: 357,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '5T1XJMM7DK',
    items: [
      {
        id: 'ti-0b4e0798-74d6-4f34-8837-e353fa20168d',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 83,
        subtotal: 249
      },
      {
        id: 'ti-dbfa710a-c9ea-4837-80a0-ace42d0aedea',
        productId: 'prod-18',
        quantity: 2,
        unitPrice: 54,
        subtotal: 108
      }
    ],
    createdAt: '2026-08-06T23:39:00.000Z',
    updatedAt: '2026-08-07T23:39:00.000Z'
  },
  {
    id: 'ord-146',
    orderNumber: 'ORD-146',
    customerId: 'cust-12',
    customerName: 'Kelsi Daugherty',
    customerPhone: '1-841-847-2125 x746',
    customerAddress: '11528 S College Street',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/95.jpg',
    totalAmount: 456,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'RJJM6Y9K2U',
    items: [
      {
        id: 'ti-d37516f6-6aa1-4134-b3b6-063034336b6d',
        productId: 'prod-16',
        quantity: 2,
        unitPrice: 78,
        subtotal: 156
      },
      {
        id: 'ti-9ce0b246-1b15-4bf1-8baf-370162b1a28a',
        productId: 'prod-17',
        quantity: 3,
        unitPrice: 100,
        subtotal: 300
      }
    ],
    createdAt: '2026-08-12T02:30:00.000Z',
    updatedAt: '2026-08-13T02:30:00.000Z'
  },
  {
    id: 'ord-147',
    orderNumber: 'ORD-147',
    customerId: 'cust-9',
    customerName: 'Ron Ullrich',
    customerPhone: '474.896.2329',
    customerAddress: '8190 Earnest Streets',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/23502926',
    totalAmount: 589,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    trackingNumber: 'N959B45PXA',
    items: [
      {
        id: 'ti-d44f75d8-f0fd-4ea8-909b-8010c922d312',
        productId: 'prod-10',
        quantity: 3,
        unitPrice: 53,
        subtotal: 159
      },
      {
        id: 'ti-57c6677a-d965-4b5f-8544-1d1c712d61ad',
        productId: 'prod-12',
        quantity: 2,
        unitPrice: 104,
        subtotal: 208
      },
      {
        id: 'ti-afbf5a32-0d6f-4b36-81e8-2a24347fa36b',
        productId: 'prod-10',
        quantity: 3,
        unitPrice: 74,
        subtotal: 222
      }
    ],
    createdAt: '2026-08-10T11:58:00.000Z',
    updatedAt: '2026-08-11T11:58:00.000Z'
  },
  {
    id: 'ord-148',
    orderNumber: 'ORD-148',
    customerId: 'cust-20',
    customerName: 'Leilani Kassulke',
    customerPhone: '1-989-637-8878 x36256',
    customerAddress: '58154 Crist Radial',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/62991369',
    totalAmount: 86,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'I5Q5QGNF3F',
    items: [
      {
        id: 'ti-10d8f054-eb85-473c-8c6d-67b685f51200',
        productId: 'prod-17',
        quantity: 1,
        unitPrice: 86,
        subtotal: 86
      }
    ],
    createdAt: '2026-08-12T14:14:00.000Z',
    updatedAt: '2026-08-13T14:14:00.000Z'
  },
  {
    id: 'ord-149',
    orderNumber: 'ORD-149',
    customerId: 'cust-5',
    customerName: 'London Halvorson',
    customerPhone: '(862) 735-1697 x53939',
    customerAddress: '1253 Oak Lane',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/63132766',
    totalAmount: 171,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'ZL1B3QJK3R',
    items: [
      {
        id: 'ti-aa147988-4d0b-4634-8b58-59e5e2180542',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 26,
        subtotal: 78
      },
      {
        id: 'ti-5a7c6b34-9179-4b14-96c2-594bdfe5cd1f',
        productId: 'prod-20',
        quantity: 1,
        unitPrice: 93,
        subtotal: 93
      }
    ],
    createdAt: '2026-08-06T18:59:00.000Z',
    updatedAt: '2026-08-07T18:59:00.000Z'
  },
  {
    id: 'ord-150',
    orderNumber: 'ORD-150',
    customerId: 'cust-18',
    customerName: 'Abdiel Renner',
    customerPhone: '212-803-2887 x5114',
    customerAddress: '80509 Lamont Meadows',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/7.jpg',
    totalAmount: 72,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '1HSWG5FCW2',
    items: [
      {
        id: 'ti-db29f372-1a3b-417f-bcf7-0930f66c9a05',
        productId: 'prod-6',
        quantity: 1,
        unitPrice: 72,
        subtotal: 72
      }
    ],
    createdAt: '2026-08-28T00:53:00.000Z',
    updatedAt: '2026-08-29T00:53:00.000Z'
  },
  {
    id: 'ord-151',
    orderNumber: 'ORD-151',
    customerId: 'cust-13',
    customerName: 'Mr. Crawford Hodkiewicz',
    customerPhone: '1-934-979-1231',
    customerAddress: '398 First Avenue',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/93483433',
    totalAmount: 210,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: '8C9LVU87EM',
    items: [
      {
        id: 'ti-6bd0545e-c87f-4ece-8cae-3690ab267248',
        productId: 'prod-10',
        quantity: 2,
        unitPrice: 105,
        subtotal: 210
      }
    ],
    createdAt: '2026-08-25T08:53:00.000Z',
    updatedAt: '2026-08-26T08:53:00.000Z'
  },
  {
    id: 'ord-152',
    orderNumber: 'ORD-152',
    customerId: 'cust-8',
    customerName: 'Claude Runolfsson',
    customerPhone: '1-660-261-4138 x78120',
    customerAddress: '53114 Columbia Avenue',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/11755921',
    totalAmount: 177,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    trackingNumber: '3GXWDLTTMP',
    items: [
      {
        id: 'ti-dc668630-7e40-418f-b924-19ff4fcbca0a',
        productId: 'prod-21',
        quantity: 3,
        unitPrice: 59,
        subtotal: 177
      }
    ],
    createdAt: '2026-08-10T10:06:00.000Z',
    updatedAt: '2026-08-11T10:06:00.000Z'
  },
  {
    id: 'ord-153',
    orderNumber: 'ORD-153',
    customerId: 'cust-20',
    customerName: 'Jaylin Harvey',
    customerPhone: '759-201-0424 x760',
    customerAddress: '1505 Axel Rapid',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/12202684',
    totalAmount: 587,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'SHIPPED',
    trackingNumber: 'O86PJTJGTR',
    items: [
      {
        id: 'ti-35aaf179-15a5-4959-8067-595cf98da89d',
        productId: 'prod-4',
        quantity: 2,
        unitPrice: 88,
        subtotal: 176
      },
      {
        id: 'ti-21839407-512c-49c8-a531-3d323d3331cb',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 55,
        subtotal: 165
      },
      {
        id: 'ti-664b503a-14f5-469d-a87e-06ae87976793',
        productId: 'prod-1',
        quantity: 3,
        unitPrice: 82,
        subtotal: 246
      }
    ],
    createdAt: '2026-08-05T14:48:00.000Z',
    updatedAt: '2026-08-06T14:48:00.000Z'
  },
  {
    id: 'ord-154',
    orderNumber: 'ORD-154',
    customerId: 'cust-14',
    customerName: 'Estefania Nolan',
    customerPhone: '1-767-314-8523 x78863',
    customerAddress: '68628 Donnie Parkway',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/14360715',
    totalAmount: 28,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '055VML2IFW',
    items: [
      {
        id: 'ti-6e04f0e5-8d67-4858-8abe-420b4d739e2e',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 14,
        subtotal: 28
      }
    ],
    createdAt: '2026-08-11T00:32:00.000Z',
    updatedAt: '2026-08-12T00:32:00.000Z'
  },
  {
    id: 'ord-155',
    orderNumber: 'ORD-155',
    customerId: 'cust-1',
    customerName: 'Nick Rolfson',
    customerPhone: '447.978.6984 x503',
    customerAddress: '88396 Bramble Close',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/93.jpg',
    totalAmount: 394,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: '0WI99YJ6BZ',
    items: [
      {
        id: 'ti-bd176f90-7c0e-4567-87a3-3b7aec1b6438',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 45,
        subtotal: 45
      },
      {
        id: 'ti-b4c93115-dbe1-4d2d-a0cb-55e1031daa06',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 95,
        subtotal: 190
      },
      {
        id: 'ti-4d4d7acc-debb-495a-a0c7-522dff970069',
        productId: 'prod-10',
        quantity: 3,
        unitPrice: 53,
        subtotal: 159
      }
    ],
    createdAt: '2026-08-11T07:31:00.000Z',
    updatedAt: '2026-08-12T07:31:00.000Z'
  },
  {
    id: 'ord-156',
    orderNumber: 'ORD-156',
    customerId: 'cust-5',
    customerName: 'Cory Altenwerth-Kohler DVM',
    customerPhone: '833-302-5389 x25152',
    customerAddress: '3696 E Oak Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/26685930',
    totalAmount: 224,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'IESKNJ3OMX',
    items: [
      {
        id: 'ti-eb3ca8c6-e46c-4fe1-b5fa-e2975464bd84',
        productId: 'prod-13',
        quantity: 3,
        unitPrice: 23,
        subtotal: 69
      },
      {
        id: 'ti-dc7bfd5d-15b2-4bce-a336-ef1c2c5e8e89',
        productId: 'prod-22',
        quantity: 1,
        unitPrice: 52,
        subtotal: 52
      },
      {
        id: 'ti-7096cfda-3f87-4803-92a9-cadfede3e5f5',
        productId: 'prod-4',
        quantity: 1,
        unitPrice: 103,
        subtotal: 103
      }
    ],
    createdAt: '2026-08-15T13:25:00.000Z',
    updatedAt: '2026-08-16T13:25:00.000Z'
  },
  {
    id: 'ord-157',
    orderNumber: 'ORD-157',
    customerId: 'cust-12',
    customerName: 'Tamia Hahn PhD',
    customerPhone: '1-789-394-3929 x4006',
    customerAddress: '14440 Giovanna Corners',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/8468297',
    totalAmount: 299,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: '3OYYNJB4Y9',
    items: [
      {
        id: 'ti-9b1d5e9b-e819-41bb-9600-b6f27fc635fe',
        productId: 'prod-18',
        quantity: 1,
        unitPrice: 43,
        subtotal: 43
      },
      {
        id: 'ti-bf6b94b9-76d9-4c9d-96db-2e6e54db4014',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 107,
        subtotal: 214
      },
      {
        id: 'ti-887fe06b-0d56-45b7-8afa-ab6fe523ae0a',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 21,
        subtotal: 42
      }
    ],
    createdAt: '2026-08-06T17:40:00.000Z',
    updatedAt: '2026-08-07T17:40:00.000Z'
  },
  {
    id: 'ord-158',
    orderNumber: 'ORD-158',
    customerId: 'cust-14',
    customerName: 'Fannie Mraz IV',
    customerPhone: '551-424-6599 x519',
    customerAddress: '80193 Hermiston Lake',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/61427605',
    totalAmount: 171,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: '3S63NPXH5H',
    items: [
      {
        id: 'ti-e0fedffd-1d20-4505-9bf7-0cbb9694f139',
        productId: 'prod-3',
        quantity: 3,
        unitPrice: 57,
        subtotal: 171
      }
    ],
    createdAt: '2026-09-18T12:19:00.000Z',
    updatedAt: '2026-09-19T12:19:00.000Z'
  },
  {
    id: 'ord-159',
    orderNumber: 'ORD-159',
    customerId: 'cust-14',
    customerName: 'Roman Larkin',
    customerPhone: '492.726.1065 x2177',
    customerAddress: '69718 Homenick Crescent',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/26.jpg',
    totalAmount: 360,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'UQJAP3VHWP',
    items: [
      {
        id: 'ti-6d8afac5-d0f4-48d5-ad14-652b81613792',
        productId: 'prod-22',
        quantity: 3,
        unitPrice: 109,
        subtotal: 327
      },
      {
        id: 'ti-d22023c8-335c-4727-ba30-11671edd6994',
        productId: 'prod-2',
        quantity: 3,
        unitPrice: 11,
        subtotal: 33
      }
    ],
    createdAt: '2026-09-16T13:04:00.000Z',
    updatedAt: '2026-09-17T13:04:00.000Z'
  },
  {
    id: 'ord-160',
    orderNumber: 'ORD-160',
    customerId: 'cust-10',
    customerName: 'Miss Kimberly Keebler',
    customerPhone: '370.608.9424 x12211',
    customerAddress: '480 Rhonda Extensions',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/38.jpg',
    totalAmount: 111,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'DELIVERED',
    trackingNumber: 'ZOL9CNFMLX',
    items: [
      {
        id: 'ti-f170f8dc-0ede-407f-8130-882d1665e674',
        productId: 'prod-1',
        quantity: 3,
        unitPrice: 37,
        subtotal: 111
      }
    ],
    createdAt: '2026-09-26T10:27:00.000Z',
    updatedAt: '2026-09-27T10:27:00.000Z'
  },
  {
    id: 'ord-161',
    orderNumber: 'ORD-161',
    customerId: 'cust-15',
    customerName: 'Terri Hansen',
    customerPhone: '(755) 719-4245 x81231',
    customerAddress: '4348 Rickey Fall',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/92763081',
    totalAmount: 338,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'GP5L6BQ37Z',
    items: [
      {
        id: 'ti-a6bdb15e-17fe-4ba2-a5e2-8771a350e322',
        productId: 'prod-19',
        quantity: 1,
        unitPrice: 102,
        subtotal: 102
      },
      {
        id: 'ti-e396d6c5-8fa3-4eb2-97c6-52c85a28481f',
        productId: 'prod-16',
        quantity: 2,
        unitPrice: 83,
        subtotal: 166
      },
      {
        id: 'ti-37fc4041-c445-491c-bdac-bdbba05a16e1',
        productId: 'prod-5',
        quantity: 2,
        unitPrice: 35,
        subtotal: 70
      }
    ],
    createdAt: '2026-09-09T18:09:00.000Z',
    updatedAt: '2026-09-10T18:09:00.000Z'
  },
  {
    id: 'ord-162',
    orderNumber: 'ORD-162',
    customerId: 'cust-20',
    customerName: 'Jeremy Schaden',
    customerPhone: '1-640-918-9160 x66304',
    customerAddress: '2036 Jon Estates',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/70433360',
    totalAmount: 237,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '86IEHDSIDU',
    items: [
      {
        id: 'ti-92b6af13-c535-443e-b66c-0d9cffdf0d60',
        productId: 'prod-16',
        quantity: 3,
        unitPrice: 79,
        subtotal: 237
      }
    ],
    createdAt: '2026-09-06T03:34:00.000Z',
    updatedAt: '2026-09-07T03:34:00.000Z'
  },
  {
    id: 'ord-163',
    orderNumber: 'ORD-163',
    customerId: 'cust-12',
    customerName: 'Diane Feil',
    customerPhone: '536.562.7912 x083',
    customerAddress: '247 Nelson Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/15.jpg',
    totalAmount: 471,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'L1NCCHXVXK',
    items: [
      {
        id: 'ti-7e3b3fdc-9e97-4723-bf0e-29ba88d0d63e',
        productId: 'prod-5',
        quantity: 3,
        unitPrice: 85,
        subtotal: 255
      },
      {
        id: 'ti-4bb1cc36-9d57-4ab5-b64e-d007d8e1f5b5',
        productId: 'prod-15',
        quantity: 3,
        unitPrice: 72,
        subtotal: 216
      }
    ],
    createdAt: '2026-09-14T22:33:00.000Z',
    updatedAt: '2026-09-15T22:33:00.000Z'
  },
  {
    id: 'ord-164',
    orderNumber: 'ORD-164',
    customerId: 'cust-1',
    customerName: 'Lindsey Marks',
    customerPhone: '(921) 923-2395',
    customerAddress: '6565 Shanahan Cliffs',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/97066810',
    totalAmount: 159,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'BUFRL8PPIO',
    items: [
      {
        id: 'ti-e8a5b99b-568f-423d-9d37-20ecad86764a',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 33,
        subtotal: 66
      },
      {
        id: 'ti-2e103795-29e7-43c9-bf3e-c685a359575e',
        productId: 'prod-10',
        quantity: 3,
        unitPrice: 31,
        subtotal: 93
      }
    ],
    createdAt: '2026-09-24T09:47:00.000Z',
    updatedAt: '2026-09-25T09:47:00.000Z'
  },
  {
    id: 'ord-165',
    orderNumber: 'ORD-165',
    customerId: 'cust-14',
    customerName: 'Dewey Rath',
    customerPhone: '1-828-968-0131 x317',
    customerAddress: '68332 Kuhic Lane',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/69.jpg',
    totalAmount: 96,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'BGHB9OPRXJ',
    items: [
      {
        id: 'ti-ead3a74e-9e31-421c-872b-b54b6da683f8',
        productId: 'prod-15',
        quantity: 3,
        unitPrice: 32,
        subtotal: 96
      }
    ],
    createdAt: '2026-09-19T12:09:00.000Z',
    updatedAt: '2026-09-20T12:09:00.000Z'
  },
  {
    id: 'ord-166',
    orderNumber: 'ORD-166',
    customerId: 'cust-11',
    customerName: 'Ladarius Parisian',
    customerPhone: '(480) 287-9739',
    customerAddress: '5841 Joey Extensions',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/80780694',
    totalAmount: 34,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: '5FAUYOWQT5',
    items: [
      {
        id: 'ti-645b25ff-eece-4f0e-be91-9e8f763a6504',
        productId: 'prod-10',
        quantity: 1,
        unitPrice: 34,
        subtotal: 34
      }
    ],
    createdAt: '2026-09-22T19:47:00.000Z',
    updatedAt: '2026-09-23T19:47:00.000Z'
  },
  {
    id: 'ord-167',
    orderNumber: 'ORD-167',
    customerId: 'cust-8',
    customerName: 'Enid Welch Sr.',
    customerPhone: '1-510-808-6645 x60243',
    customerAddress: '533 Hillside Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/31.jpg',
    totalAmount: 121,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'BGIW64S228',
    items: [
      {
        id: 'ti-ac759d7b-31a0-43b1-9c5d-e0c025e7815b',
        productId: 'prod-6',
        quantity: 1,
        unitPrice: 23,
        subtotal: 23
      },
      {
        id: 'ti-5c3ddd35-633e-4347-a39e-77f3e4f9c8c1',
        productId: 'prod-7',
        quantity: 2,
        unitPrice: 49,
        subtotal: 98
      }
    ],
    createdAt: '2026-09-07T10:27:00.000Z',
    updatedAt: '2026-09-08T10:27:00.000Z'
  },
  {
    id: 'ord-168',
    orderNumber: 'ORD-168',
    customerId: 'cust-10',
    customerName: 'Jermaine Altenwerth',
    customerPhone: '(907) 600-7863 x9139',
    customerAddress: '675 Luettgen Burgs',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/19.jpg',
    totalAmount: 69,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: '8LFB7TKUOP',
    items: [
      {
        id: 'ti-3b543422-5fd9-4c0b-b8e7-9797f7df7896',
        productId: 'prod-8',
        quantity: 3,
        unitPrice: 23,
        subtotal: 69
      }
    ],
    createdAt: '2026-09-09T13:17:00.000Z',
    updatedAt: '2026-09-10T13:17:00.000Z'
  },
  {
    id: 'ord-169',
    orderNumber: 'ORD-169',
    customerId: 'cust-17',
    customerName: 'Velma Romaguera',
    customerPhone: '680.274.5659 x2307',
    customerAddress: '295 Emily Meadow',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/11.jpg',
    totalAmount: 176,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'JC4TTZCVNA',
    items: [
      {
        id: 'ti-161d6075-ff67-4053-970e-4e87cd10e5eb',
        productId: 'prod-19',
        quantity: 2,
        unitPrice: 31,
        subtotal: 62
      },
      {
        id: 'ti-56914d4a-a8e6-4dcd-8475-8ad0c822cb49',
        productId: 'prod-3',
        quantity: 1,
        unitPrice: 18,
        subtotal: 18
      },
      {
        id: 'ti-ba12f1ad-c9fb-4442-867b-488ead86c0e5',
        productId: 'prod-1',
        quantity: 3,
        unitPrice: 32,
        subtotal: 96
      }
    ],
    createdAt: '2026-09-18T04:13:00.000Z',
    updatedAt: '2026-09-19T04:13:00.000Z'
  },
  {
    id: 'ord-170',
    orderNumber: 'ORD-170',
    customerId: 'cust-19',
    customerName: 'Irvin Shanahan',
    customerPhone: '240.733.8425 x9460',
    customerAddress: '370 Birch Grove',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/76631926',
    totalAmount: 479,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'REG1ZAQAB5',
    items: [
      {
        id: 'ti-3615b9b7-336f-417a-94a2-35fc90bf86d7',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 108,
        subtotal: 108
      },
      {
        id: 'ti-42a0c031-d6ed-44b9-8d28-4311fe0fc80b',
        productId: 'prod-22',
        quantity: 3,
        unitPrice: 92,
        subtotal: 276
      },
      {
        id: 'ti-620c01bc-217f-4c39-bd23-8cafd87e7e72',
        productId: 'prod-16',
        quantity: 1,
        unitPrice: 95,
        subtotal: 95
      }
    ],
    createdAt: '2026-09-12T11:22:00.000Z',
    updatedAt: '2026-09-13T11:22:00.000Z'
  },
  {
    id: 'ord-171',
    orderNumber: 'ORD-171',
    customerId: 'cust-3',
    customerName: 'Jarod Effertz',
    customerPhone: '852-354-2224 x90070',
    customerAddress: '61615 Harber Forges',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/93687622',
    totalAmount: 510,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: '1C9JU86VPV',
    items: [
      {
        id: 'ti-379ac7b1-321c-4772-9735-381d75d8d574',
        productId: 'prod-16',
        quantity: 2,
        unitPrice: 92,
        subtotal: 184
      },
      {
        id: 'ti-340b7987-7a76-47f1-8ffe-592fecce9cb7',
        productId: 'prod-22',
        quantity: 2,
        unitPrice: 108,
        subtotal: 216
      },
      {
        id: 'ti-202377c0-1a3d-4b14-bff2-d8b2c0479c48',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 55,
        subtotal: 110
      }
    ],
    createdAt: '2026-09-01T03:19:00.000Z',
    updatedAt: '2026-09-02T03:19:00.000Z'
  },
  {
    id: 'ord-172',
    orderNumber: 'ORD-172',
    customerId: 'cust-14',
    customerName: 'Gregg Stiedemann',
    customerPhone: '1-549-762-0855 x702',
    customerAddress: '15502 Spring Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/13777345',
    totalAmount: 137,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'YNC0US08A0',
    items: [
      {
        id: 'ti-11c102f6-dc7d-4656-a4ec-392d09f8495f',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 62,
        subtotal: 62
      },
      {
        id: 'ti-fc2682eb-d146-415d-9067-42f4eac02443',
        productId: 'prod-10',
        quantity: 1,
        unitPrice: 75,
        subtotal: 75
      }
    ],
    createdAt: '2026-09-28T19:42:00.000Z',
    updatedAt: '2026-09-29T19:42:00.000Z'
  },
  {
    id: 'ord-173',
    orderNumber: 'ORD-173',
    customerId: 'cust-17',
    customerName: 'Rickey Kunde',
    customerPhone: '(279) 742-0472 x413',
    customerAddress: '45040 Veum Garden',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/38504596',
    totalAmount: 193,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'D7P94SZ372',
    items: [
      {
        id: 'ti-1475db8b-1a6d-4458-999f-7e365fee92f4',
        productId: 'prod-2',
        quantity: 2,
        unitPrice: 31,
        subtotal: 62
      },
      {
        id: 'ti-60fbbaed-b5cf-4cc8-959a-3517f100b6bb',
        productId: 'prod-16',
        quantity: 1,
        unitPrice: 87,
        subtotal: 87
      },
      {
        id: 'ti-427530ca-edbb-4802-ae98-b2b466678873',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 22,
        subtotal: 44
      }
    ],
    createdAt: '2026-09-04T08:01:00.000Z',
    updatedAt: '2026-09-05T08:01:00.000Z'
  },
  {
    id: 'ord-174',
    orderNumber: 'ORD-174',
    customerId: 'cust-2',
    customerName: 'Myrtice Hackett',
    customerPhone: '1-460-795-3490 x2941',
    customerAddress: '115 Park Avenue',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/32.jpg',
    totalAmount: 291,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '1J65LFYSWI',
    items: [
      {
        id: 'ti-ee4c9015-e734-416b-8f94-40f6dd2bf85f',
        productId: 'prod-9',
        quantity: 3,
        unitPrice: 87,
        subtotal: 261
      },
      {
        id: 'ti-f91f3187-e244-457c-9131-41f140e8f3d5',
        productId: 'prod-18',
        quantity: 3,
        unitPrice: 10,
        subtotal: 30
      }
    ],
    createdAt: '2026-09-09T13:35:00.000Z',
    updatedAt: '2026-09-10T13:35:00.000Z'
  },
  {
    id: 'ord-175',
    orderNumber: 'ORD-175',
    customerId: 'cust-8',
    customerName: 'Angela Kshlerin',
    customerPhone: '637-910-7255 x380',
    customerAddress: '38873 Will Junction',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/38.jpg',
    totalAmount: 180,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'KJTIE404U1',
    items: [
      {
        id: 'ti-00c973b5-a50f-42c6-b028-c9d947888044',
        productId: 'prod-3',
        quantity: 3,
        unitPrice: 60,
        subtotal: 180
      }
    ],
    createdAt: '2026-10-02T13:00:00.000Z',
    updatedAt: '2026-10-03T13:00:00.000Z'
  },
  {
    id: 'ord-176',
    orderNumber: 'ORD-176',
    customerId: 'cust-9',
    customerName: 'Dr. Krista Wintheiser',
    customerPhone: '(335) 668-0785 x3224',
    customerAddress: '8304 Meadow Close',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/49867815',
    totalAmount: 393,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'A8B7J8MTCN',
    items: [
      {
        id: 'ti-9a26cb32-4d49-435e-8099-871271ccf535',
        productId: 'prod-2',
        quantity: 2,
        unitPrice: 50,
        subtotal: 100
      },
      {
        id: 'ti-135fdf62-153f-44a9-820e-431a791c80cd',
        productId: 'prod-5',
        quantity: 3,
        unitPrice: 75,
        subtotal: 225
      },
      {
        id: 'ti-89c3e015-fc58-49d9-a09b-f9b3a804ae09',
        productId: 'prod-19',
        quantity: 2,
        unitPrice: 34,
        subtotal: 68
      }
    ],
    createdAt: '2026-10-10T06:54:00.000Z',
    updatedAt: '2026-10-11T06:54:00.000Z'
  },
  {
    id: 'ord-177',
    orderNumber: 'ORD-177',
    customerId: 'cust-18',
    customerName: 'Grayson Gutkowski',
    customerPhone: '1-994-293-8883 x36025',
    customerAddress: '756 Robin Mews',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/3633227',
    totalAmount: 198,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'PNPOI79DSG',
    items: [
      {
        id: 'ti-4996f725-e9f0-4d53-9546-e38b102e821e',
        productId: 'prod-3',
        quantity: 3,
        unitPrice: 66,
        subtotal: 198
      }
    ],
    createdAt: '2026-10-13T10:52:00.000Z',
    updatedAt: '2026-10-14T10:52:00.000Z'
  },
  {
    id: 'ord-178',
    orderNumber: 'ORD-178',
    customerId: 'cust-19',
    customerName: 'Floyd Senger',
    customerPhone: '1-255-822-6471',
    customerAddress: '8528 Mann Mountain',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/93.jpg',
    totalAmount: 321,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'H01VBN5KIA',
    items: [
      {
        id: 'ti-4f0d8f53-6dcb-4088-9da2-bb502836410b',
        productId: 'prod-4',
        quantity: 3,
        unitPrice: 107,
        subtotal: 321
      }
    ],
    createdAt: '2026-10-07T14:43:00.000Z',
    updatedAt: '2026-10-08T14:43:00.000Z'
  },
  {
    id: 'ord-179',
    orderNumber: 'ORD-179',
    customerId: 'cust-14',
    customerName: 'Derick Schaden',
    customerPhone: '706-357-4605 x17777',
    customerAddress: '9307 Treutel Lane',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/92563130',
    totalAmount: 210,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '8V6Y03V9KT',
    items: [
      {
        id: 'ti-0f11da0f-7609-4dd3-8a86-b8cc7d762079',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 26,
        subtotal: 26
      },
      {
        id: 'ti-55b850c3-504f-4250-b7e9-d0fdc48fbb89',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 23,
        subtotal: 46
      },
      {
        id: 'ti-d642f1cc-ceee-4c06-afee-939034e44a90',
        productId: 'prod-22',
        quantity: 2,
        unitPrice: 69,
        subtotal: 138
      }
    ],
    createdAt: '2026-10-20T08:01:00.000Z',
    updatedAt: '2026-10-21T08:01:00.000Z'
  },
  {
    id: 'ord-180',
    orderNumber: 'ORD-180',
    customerId: 'cust-7',
    customerName: 'Fay Farrell',
    customerPhone: '(266) 933-3453 x11190',
    customerAddress: '980 Marta Rest',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/13245867',
    totalAmount: 454,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'B6TF8TSE9V',
    items: [
      {
        id: 'ti-5fb28808-0d8f-47fd-be5b-8b5358677aaa',
        productId: 'prod-18',
        quantity: 1,
        unitPrice: 58,
        subtotal: 58
      },
      {
        id: 'ti-21090860-d9ce-4c0c-8dbb-e4b09850922d',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 76,
        subtotal: 228
      },
      {
        id: 'ti-01280dec-d93b-4e8b-989e-ea198a89ffde',
        productId: 'prod-17',
        quantity: 3,
        unitPrice: 56,
        subtotal: 168
      }
    ],
    createdAt: '2026-10-16T15:46:00.000Z',
    updatedAt: '2026-10-17T15:46:00.000Z'
  },
  {
    id: 'ord-181',
    orderNumber: 'ORD-181',
    customerId: 'cust-4',
    customerName: 'Chelsie Gerhold',
    customerPhone: '(467) 635-6048 x4071',
    customerAddress: '6856 Caleigh Ridges',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/21.jpg',
    totalAmount: 87,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'FNCM5XCN28',
    items: [
      {
        id: 'ti-048d6e6a-288e-4cb7-8932-821d6b4e79cf',
        productId: 'prod-12',
        quantity: 1,
        unitPrice: 87,
        subtotal: 87
      }
    ],
    createdAt: '2026-10-14T03:57:00.000Z',
    updatedAt: '2026-10-15T03:57:00.000Z'
  },
  {
    id: 'ord-182',
    orderNumber: 'ORD-182',
    customerId: 'cust-4',
    customerName: 'Danial Schuster',
    customerPhone: '400.747.6296 x744',
    customerAddress: '519 Schmitt-Littel Course',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/93.jpg',
    totalAmount: 407,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'X4D4YON4F8',
    items: [
      {
        id: 'ti-5e062254-aac6-4e43-a79d-6bbd90663324',
        productId: 'prod-24',
        quantity: 1,
        unitPrice: 21,
        subtotal: 21
      },
      {
        id: 'ti-9da124dc-031d-40a7-81ba-ede1e4a74ab5',
        productId: 'prod-22',
        quantity: 2,
        unitPrice: 91,
        subtotal: 182
      },
      {
        id: 'ti-36f41bec-b00b-47f4-84c5-52869af0939b',
        productId: 'prod-5',
        quantity: 2,
        unitPrice: 102,
        subtotal: 204
      }
    ],
    createdAt: '2026-10-07T20:56:00.000Z',
    updatedAt: '2026-10-08T20:56:00.000Z'
  },
  {
    id: 'ord-183',
    orderNumber: 'ORD-183',
    customerId: 'cust-2',
    customerName: 'Lauren Mohr',
    customerPhone: '1-770-470-9016 x451',
    customerAddress: '74896 York Street',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/26210925',
    totalAmount: 578,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '9XV9S62JF0',
    items: [
      {
        id: 'ti-3b9c8888-63dd-4334-a6a6-cda9cf1cbfe7',
        productId: 'prod-24',
        quantity: 1,
        unitPrice: 55,
        subtotal: 55
      },
      {
        id: 'ti-a7423ffb-9e59-4be8-b54e-d1ff9e146e1a',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 109,
        subtotal: 327
      },
      {
        id: 'ti-dae2dbab-2618-404f-a8d9-c57dab044fe3',
        productId: 'prod-19',
        quantity: 2,
        unitPrice: 98,
        subtotal: 196
      }
    ],
    createdAt: '2026-10-17T00:12:00.000Z',
    updatedAt: '2026-10-18T00:12:00.000Z'
  },
  {
    id: 'ord-184',
    orderNumber: 'ORD-184',
    customerId: 'cust-7',
    customerName: 'Wallace Bartoletti',
    customerPhone: '(780) 346-8961 x84582',
    customerAddress: '9454 Bogan Place',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/45640268',
    totalAmount: 311,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '8MFL4CIT3K',
    items: [
      {
        id: 'ti-d9ca9602-806e-405f-9cbc-ba1f85f71d49',
        productId: 'prod-7',
        quantity: 2,
        unitPrice: 22,
        subtotal: 44
      },
      {
        id: 'ti-20438b16-0fea-4b0f-8ed1-dba571c7a593',
        productId: 'prod-21',
        quantity: 3,
        unitPrice: 11,
        subtotal: 33
      },
      {
        id: 'ti-ce7bce82-a5fd-4840-b0d9-3cd3e1e85685',
        productId: 'prod-14',
        quantity: 3,
        unitPrice: 78,
        subtotal: 234
      }
    ],
    createdAt: '2026-10-18T22:07:00.000Z',
    updatedAt: '2026-10-19T22:07:00.000Z'
  },
  {
    id: 'ord-185',
    orderNumber: 'ORD-185',
    customerId: 'cust-12',
    customerName: 'Mckayla Hauck',
    customerPhone: '1-413-473-3520 x32434',
    customerAddress: '7171 Lubowitz Meadows',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/15542873',
    totalAmount: 56,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: '0GSYBLBCS3',
    items: [
      {
        id: 'ti-ed622548-aae1-47b7-87ad-c8a494e833a5',
        productId: 'prod-19',
        quantity: 2,
        unitPrice: 28,
        subtotal: 56
      }
    ],
    createdAt: '2026-10-18T19:23:00.000Z',
    updatedAt: '2026-10-19T19:23:00.000Z'
  },
  {
    id: 'ord-186',
    orderNumber: 'ORD-186',
    customerId: 'cust-20',
    customerName: 'Miss Marsha Will',
    customerPhone: '1-970-649-1057 x34047',
    customerAddress: '607 Derek Gateway',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/1.jpg',
    totalAmount: 321,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: '88WDGO5YR7',
    items: [
      {
        id: 'ti-6bf00ac8-07c7-4171-b7f6-65a993f53353',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 45,
        subtotal: 45
      },
      {
        id: 'ti-9d2e3c7d-6d97-4a35-99fd-9cbca5fd569a',
        productId: 'prod-2',
        quantity: 3,
        unitPrice: 92,
        subtotal: 276
      }
    ],
    createdAt: '2026-10-04T04:49:00.000Z',
    updatedAt: '2026-10-05T04:49:00.000Z'
  },
  {
    id: 'ord-187',
    orderNumber: 'ORD-187',
    customerId: 'cust-17',
    customerName: 'Heidi Bradtke',
    customerPhone: '572.601.6674 x1875',
    customerAddress: '46754 Prospect Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/13.jpg',
    totalAmount: 362,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'UAS1EUMOTH',
    items: [
      {
        id: 'ti-29697af3-3855-470d-8a05-701af6c3451b',
        productId: 'prod-11',
        quantity: 3,
        unitPrice: 56,
        subtotal: 168
      },
      {
        id: 'ti-a72963d3-7668-4ef7-a051-f828490acf16',
        productId: 'prod-10',
        quantity: 3,
        unitPrice: 58,
        subtotal: 174
      },
      {
        id: 'ti-a034a944-8cba-4657-bd09-2a0a0bc1e1cd',
        productId: 'prod-3',
        quantity: 2,
        unitPrice: 10,
        subtotal: 20
      }
    ],
    createdAt: '2026-10-14T10:59:00.000Z',
    updatedAt: '2026-10-15T10:59:00.000Z'
  },
  {
    id: 'ord-188',
    orderNumber: 'ORD-188',
    customerId: 'cust-3',
    customerName: 'Skyla Cole',
    customerPhone: '(776) 334-5649 x843',
    customerAddress: '2803 Hyman Place',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/23.jpg',
    totalAmount: 90,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'THQQSH7J2L',
    items: [
      {
        id: 'ti-24c28cf1-8239-40a4-974e-2ca162d838a4',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 45,
        subtotal: 90
      }
    ],
    createdAt: '2026-10-14T05:44:00.000Z',
    updatedAt: '2026-10-15T05:44:00.000Z'
  },
  {
    id: 'ord-189',
    orderNumber: 'ORD-189',
    customerId: 'cust-13',
    customerName: 'Francesco Reichel Sr.',
    customerPhone: '(959) 995-9431',
    customerAddress: '975 Macejkovic Passage',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/79.jpg',
    totalAmount: 478,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'IUZFW09D3B',
    items: [
      {
        id: 'ti-0e96429d-9e7b-43e9-b8cc-7726acfb7ba5',
        productId: 'prod-25',
        quantity: 3,
        unitPrice: 95,
        subtotal: 285
      },
      {
        id: 'ti-7df744e3-1787-4272-8f06-c4d5fc146ad5',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 100,
        subtotal: 100
      },
      {
        id: 'ti-b9f2e4a9-461f-4c64-8726-17e199e5376a',
        productId: 'prod-11',
        quantity: 1,
        unitPrice: 93,
        subtotal: 93
      }
    ],
    createdAt: '2026-10-04T23:06:00.000Z',
    updatedAt: '2026-10-05T23:06:00.000Z'
  },
  {
    id: 'ord-190',
    orderNumber: 'ORD-190',
    customerId: 'cust-10',
    customerName: 'Sean Runte',
    customerPhone: '201-670-3179 x7674',
    customerAddress: '22468 Castle Road',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/30.jpg',
    totalAmount: 147,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'QTCMCYJB17',
    items: [
      {
        id: 'ti-a2c397ba-a687-4688-8b3f-4e5c7b887233',
        productId: 'prod-22',
        quantity: 3,
        unitPrice: 49,
        subtotal: 147
      }
    ],
    createdAt: '2026-10-12T09:05:00.000Z',
    updatedAt: '2026-10-13T09:05:00.000Z'
  },
  {
    id: 'ord-191',
    orderNumber: 'ORD-191',
    customerId: 'cust-18',
    customerName: 'Camille MacGyver DDS',
    customerPhone: '(464) 370-7804 x0481',
    customerAddress: '79156 Kaelyn Keys',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/98.jpg',
    totalAmount: 70,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'JHN8A5ZX2U',
    items: [
      {
        id: 'ti-29d09909-d16f-4154-928c-a31742f8c8da',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 35,
        subtotal: 70
      }
    ],
    createdAt: '2026-10-06T18:29:00.000Z',
    updatedAt: '2026-10-07T18:29:00.000Z'
  },
  {
    id: 'ord-192',
    orderNumber: 'ORD-192',
    customerId: 'cust-19',
    customerName: 'Darrion Leffler',
    customerPhone: '936-857-2901',
    customerAddress: '2899 School Close',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/75566857',
    totalAmount: 352,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'TDAVCZDNTW',
    items: [
      {
        id: 'ti-661ccede-a669-41ee-8cfd-311f99e89791',
        productId: 'prod-21',
        quantity: 2,
        unitPrice: 44,
        subtotal: 88
      },
      {
        id: 'ti-b1649610-8c28-452c-ac77-0fd2f96a375a',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 17,
        subtotal: 51
      },
      {
        id: 'ti-afb7f3f2-fd3d-449e-8b8b-c9b5b679e219',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 71,
        subtotal: 213
      }
    ],
    createdAt: '2026-10-23T19:42:00.000Z',
    updatedAt: '2026-10-24T19:42:00.000Z'
  },
  {
    id: 'ord-193',
    orderNumber: 'ORD-193',
    customerId: 'cust-12',
    customerName: 'Luke Streich',
    customerPhone: '613-604-3146 x167',
    customerAddress: '7872 Fay Crest',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/33.jpg',
    totalAmount: 180,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'X4I0NKB9BX',
    items: [
      {
        id: 'ti-63bef586-3c83-4906-aa55-4e33718da8fb',
        productId: 'prod-25',
        quantity: 3,
        unitPrice: 60,
        subtotal: 180
      }
    ],
    createdAt: '2026-11-07T16:03:00.000Z',
    updatedAt: '2026-11-08T16:03:00.000Z'
  },
  {
    id: 'ord-194',
    orderNumber: 'ORD-194',
    customerId: 'cust-8',
    customerName: 'Brianne Kemmer',
    customerPhone: '927.747.3250 x5850',
    customerAddress: '9476 N Main',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/30090332',
    totalAmount: 77,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'IHZK8NTYVR',
    items: [
      {
        id: 'ti-d9a62b30-f784-4a60-b8c7-0f278599f960',
        productId: 'prod-18',
        quantity: 1,
        unitPrice: 77,
        subtotal: 77
      }
    ],
    createdAt: '2026-11-11T04:27:00.000Z',
    updatedAt: '2026-11-12T04:27:00.000Z'
  },
  {
    id: 'ord-195',
    orderNumber: 'ORD-195',
    customerId: 'cust-8',
    customerName: 'Nayeli Fahey',
    customerPhone: '1-686-555-1098',
    customerAddress: "1477 O'Keefe Way",
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/97048143',
    totalAmount: 438,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'VIECOCSNTR',
    items: [
      {
        id: 'ti-d7d75cf8-0d3b-456b-b45b-07fba0e57348',
        productId: 'prod-13',
        quantity: 2,
        unitPrice: 82,
        subtotal: 164
      },
      {
        id: 'ti-f3a83fa7-f026-4cd8-9041-23d55e7b6a38',
        productId: 'prod-17',
        quantity: 2,
        unitPrice: 67,
        subtotal: 134
      },
      {
        id: 'ti-a911128a-ec9d-42fb-a859-2d9641b834ca',
        productId: 'prod-21',
        quantity: 2,
        unitPrice: 70,
        subtotal: 140
      }
    ],
    createdAt: '2026-11-02T18:26:00.000Z',
    updatedAt: '2026-11-03T18:26:00.000Z'
  },
  {
    id: 'ord-196',
    orderNumber: 'ORD-196',
    customerId: 'cust-5',
    customerName: 'Dr. Irma Sauer',
    customerPhone: '591-284-3979 x403',
    customerAddress: '5213 Greenway',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/88.jpg',
    totalAmount: 152,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    trackingNumber: '3ZP698CUS4',
    items: [
      {
        id: 'ti-f501286a-d049-4680-b1a5-69045f7b3f00',
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 76,
        subtotal: 152
      }
    ],
    createdAt: '2026-11-24T23:02:00.000Z',
    updatedAt: '2026-11-25T23:02:00.000Z'
  },
  {
    id: 'ord-197',
    orderNumber: 'ORD-197',
    customerId: 'cust-14',
    customerName: "Madelyn D'Amore",
    customerPhone: '731-641-9700 x4325',
    customerAddress: '41392 Pagac Street',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/22.jpg',
    totalAmount: 274,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: '9YZTOHF4K4',
    items: [
      {
        id: 'ti-eeb51780-73a8-47c5-ad6a-7347f2f91be5',
        productId: 'prod-16',
        quantity: 3,
        unitPrice: 35,
        subtotal: 105
      },
      {
        id: 'ti-14940296-df39-4d06-8713-139c0d04a2a0',
        productId: 'prod-17',
        quantity: 2,
        unitPrice: 70,
        subtotal: 140
      },
      {
        id: 'ti-9c94bd94-3494-467d-9fe5-da2288910a06',
        productId: 'prod-5',
        quantity: 1,
        unitPrice: 29,
        subtotal: 29
      }
    ],
    createdAt: '2026-11-25T09:17:00.000Z',
    updatedAt: '2026-11-26T09:17:00.000Z'
  },
  {
    id: 'ord-198',
    orderNumber: 'ORD-198',
    customerId: 'cust-9',
    customerName: 'Madeline Hills',
    customerPhone: '645-966-4847 x6987',
    customerAddress: '2734 Anderson Union',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/3939523',
    totalAmount: 272,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    trackingNumber: 'UHUM9A0IOE',
    items: [
      {
        id: 'ti-6d945f38-a306-4985-a481-d6a9435ea17d',
        productId: 'prod-7',
        quantity: 1,
        unitPrice: 71,
        subtotal: 71
      },
      {
        id: 'ti-43b457f6-8ff1-4ec1-93b9-e1e117473843',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 67,
        subtotal: 201
      }
    ],
    createdAt: '2026-11-04T08:19:00.000Z',
    updatedAt: '2026-11-05T08:19:00.000Z'
  },
  {
    id: 'ord-199',
    orderNumber: 'ORD-199',
    customerId: 'cust-20',
    customerName: 'Kristina Mann',
    customerPhone: '874.485.9560 x759',
    customerAddress: '95452 Hilpert Course',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/20.jpg',
    totalAmount: 325,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'MOKXV8CAOF',
    items: [
      {
        id: 'ti-a4e4a3d7-56d3-4d33-b71c-a9d504e2454f',
        productId: 'prod-9',
        quantity: 3,
        unitPrice: 73,
        subtotal: 219
      },
      {
        id: 'ti-adffdd6e-c0bf-4fb9-be5f-2d5a9947983f',
        productId: 'prod-12',
        quantity: 2,
        unitPrice: 53,
        subtotal: 106
      }
    ],
    createdAt: '2026-11-20T09:11:00.000Z',
    updatedAt: '2026-11-21T09:11:00.000Z'
  },
  {
    id: 'ord-200',
    orderNumber: 'ORD-200',
    customerId: 'cust-18',
    customerName: 'Phillip Raynor',
    customerPhone: '639.557.7648 x4080',
    customerAddress: '8985 Bergnaum Branch',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/59797406',
    totalAmount: 271,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'VBJUGDXOGU',
    items: [
      {
        id: 'ti-d41a5295-0d48-4b40-b640-8a09b1a9079d',
        productId: 'prod-21',
        quantity: 2,
        unitPrice: 46,
        subtotal: 92
      },
      {
        id: 'ti-ffbb1735-5212-4f16-9e57-7323e5af8091',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 79,
        subtotal: 79
      },
      {
        id: 'ti-d649d10a-6dc8-4a27-8fe0-f84227850c80',
        productId: 'prod-1',
        quantity: 1,
        unitPrice: 100,
        subtotal: 100
      }
    ],
    createdAt: '2026-11-05T03:31:00.000Z',
    updatedAt: '2026-11-06T03:31:00.000Z'
  },
  {
    id: 'ord-201',
    orderNumber: 'ORD-201',
    customerId: 'cust-1',
    customerName: 'Dr. Rahsaan Wiza',
    customerPhone: '1-655-874-7209 x7034',
    customerAddress: '2992 Kurt Wells',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/25929099',
    totalAmount: 396,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'ZKAO3JDR35',
    items: [
      {
        id: 'ti-9a3bc745-10cc-4cc0-9bd1-0d773e6c3ec6',
        productId: 'prod-20',
        quantity: 3,
        unitPrice: 84,
        subtotal: 252
      },
      {
        id: 'ti-a2db032f-9920-43e4-b816-3073e2b315c2',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 48,
        subtotal: 144
      }
    ],
    createdAt: '2026-11-23T14:33:00.000Z',
    updatedAt: '2026-11-24T14:33:00.000Z'
  },
  {
    id: 'ord-202',
    orderNumber: 'ORD-202',
    customerId: 'cust-9',
    customerName: 'Nikolas Morissette',
    customerPhone: '(489) 537-6110',
    customerAddress: '57149 Oliver Court',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/84.jpg',
    totalAmount: 272,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'QFARGEX6O2',
    items: [
      {
        id: 'ti-a757a9c5-efa0-43a7-906a-ffbd11c841a7',
        productId: 'prod-17',
        quantity: 1,
        unitPrice: 11,
        subtotal: 11
      },
      {
        id: 'ti-300f743b-1de5-4bc5-876b-b448536fd0b0',
        productId: 'prod-10',
        quantity: 3,
        unitPrice: 87,
        subtotal: 261
      }
    ],
    createdAt: '2026-11-09T14:20:00.000Z',
    updatedAt: '2026-11-10T14:20:00.000Z'
  },
  {
    id: 'ord-203',
    orderNumber: 'ORD-203',
    customerId: 'cust-20',
    customerName: 'Nickolas Robel',
    customerPhone: '315-715-0184 x2560',
    customerAddress: '47739 Paul Groves',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/50.jpg',
    totalAmount: 339,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: '8PVR0RRKK2',
    items: [
      {
        id: 'ti-1a042137-a87b-4d57-9f73-07b01c6d98f7',
        productId: 'prod-12',
        quantity: 3,
        unitPrice: 59,
        subtotal: 177
      },
      {
        id: 'ti-efa6fcc1-0f0c-42f9-a9a3-de336bef3644',
        productId: 'prod-15',
        quantity: 3,
        unitPrice: 38,
        subtotal: 114
      },
      {
        id: 'ti-c3c6093f-495d-4700-a7df-98a119492909',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 16,
        subtotal: 48
      }
    ],
    createdAt: '2026-11-21T15:14:00.000Z',
    updatedAt: '2026-11-22T15:14:00.000Z'
  },
  {
    id: 'ord-204',
    orderNumber: 'ORD-204',
    customerId: 'cust-5',
    customerName: 'Raheem Stamm',
    customerPhone: '978.534.7715 x79262',
    customerAddress: '9545 Clark Street',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/47.jpg',
    totalAmount: 240,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'O8UV46CDRT',
    items: [
      {
        id: 'ti-e650701a-43b2-4021-9bd8-2ee02cb8011b',
        productId: 'prod-4',
        quantity: 3,
        unitPrice: 80,
        subtotal: 240
      }
    ],
    createdAt: '2026-11-09T05:23:00.000Z',
    updatedAt: '2026-11-10T05:23:00.000Z'
  },
  {
    id: 'ord-205',
    orderNumber: 'ORD-205',
    customerId: 'cust-9',
    customerName: 'Alfred Spencer',
    customerPhone: '282-886-7342',
    customerAddress: '3839 Macejkovic Fort',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/8.jpg',
    totalAmount: 68,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'QUZFFSANVL',
    items: [
      {
        id: 'ti-38c8fa47-9bfc-42db-9aa4-6a76fa20c6e6',
        productId: 'prod-17',
        quantity: 2,
        unitPrice: 34,
        subtotal: 68
      }
    ],
    createdAt: '2026-11-08T06:42:00.000Z',
    updatedAt: '2026-11-09T06:42:00.000Z'
  },
  {
    id: 'ord-206',
    orderNumber: 'ORD-206',
    customerId: 'cust-15',
    customerName: 'Justine Gorczany',
    customerPhone: '(832) 202-0047 x590',
    customerAddress: '106 Letha Spurs',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/77.jpg',
    totalAmount: 512,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'MG8JU6GXAM',
    items: [
      {
        id: 'ti-150b32b1-a0a4-4f76-ba8d-fb8ad7990c86',
        productId: 'prod-22',
        quantity: 3,
        unitPrice: 86,
        subtotal: 258
      },
      {
        id: 'ti-41aac5a3-7416-4ed0-a859-2f86ffe57450',
        productId: 'prod-4',
        quantity: 3,
        unitPrice: 62,
        subtotal: 186
      },
      {
        id: 'ti-ddaa58b3-e367-4282-b944-6125395d3f21',
        productId: 'prod-11',
        quantity: 1,
        unitPrice: 68,
        subtotal: 68
      }
    ],
    createdAt: '2026-11-06T06:24:00.000Z',
    updatedAt: '2026-11-07T06:24:00.000Z'
  },
  {
    id: 'ord-207',
    orderNumber: 'ORD-207',
    customerId: 'cust-20',
    customerName: 'Gregory Champlin',
    customerPhone: '(245) 934-2837',
    customerAddress: '7385 Garett Canyon',
    customerAvatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/2.jpg',
    totalAmount: 71,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'DZVMB4MG5H',
    items: [
      {
        id: 'ti-ab57abb6-8937-4820-a441-a117e5cb490c',
        productId: 'prod-8',
        quantity: 1,
        unitPrice: 35,
        subtotal: 35
      },
      {
        id: 'ti-3ec5c2db-b991-4d1a-b08b-840d917f232e',
        productId: 'prod-10',
        quantity: 1,
        unitPrice: 24,
        subtotal: 24
      },
      {
        id: 'ti-71fc91bc-f574-45d3-a8ba-d0ab7334a5a9',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 12,
        subtotal: 12
      }
    ],
    createdAt: '2026-11-25T17:07:00.000Z',
    updatedAt: '2026-11-26T17:07:00.000Z'
  },
  {
    id: 'ord-208',
    orderNumber: 'ORD-208',
    customerId: 'cust-14',
    customerName: 'Julia Brakus',
    customerPhone: '(613) 980-3165',
    customerAddress: '93893 S Main Avenue',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/77.jpg',
    totalAmount: 186,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: '4LMGNDMDBQ',
    items: [
      {
        id: 'ti-2c4acfd9-1bac-45ec-bbc6-49914877265e',
        productId: 'prod-11',
        quantity: 3,
        unitPrice: 62,
        subtotal: 186
      }
    ],
    createdAt: '2026-11-15T07:15:00.000Z',
    updatedAt: '2026-11-16T07:15:00.000Z'
  },
  {
    id: 'ord-209',
    orderNumber: 'ORD-209',
    customerId: 'cust-18',
    customerName: 'Delbert Daugherty-Crist',
    customerPhone: '840-852-4808 x566',
    customerAddress: '894 Franecki Glens',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/88.jpg',
    totalAmount: 167,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'READY_TO_SHIP',
    trackingNumber: 'GX1ORLSXRR',
    items: [
      {
        id: 'ti-13454f04-ccea-4b83-9744-e77eb410c181',
        productId: 'prod-24',
        quantity: 3,
        unitPrice: 29,
        subtotal: 87
      },
      {
        id: 'ti-aa8aec35-62be-4e75-9f6d-165a95938ac7',
        productId: 'prod-2',
        quantity: 1,
        unitPrice: 80,
        subtotal: 80
      }
    ],
    createdAt: '2026-11-27T02:02:00.000Z',
    updatedAt: '2026-11-28T02:02:00.000Z'
  },
  {
    id: 'ord-210',
    orderNumber: 'ORD-210',
    customerId: 'cust-3',
    customerName: 'Gussie Lehner',
    customerPhone: '(874) 626-0330 x161',
    customerAddress: '5412 Arvilla Park',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/68383360',
    totalAmount: 339,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'RDH693E2IF',
    items: [
      {
        id: 'ti-66486b44-6f98-406c-a293-074a36793679',
        productId: 'prod-17',
        quantity: 3,
        unitPrice: 34,
        subtotal: 102
      },
      {
        id: 'ti-e8315fb1-916c-427b-a139-fae3a1970bbc',
        productId: 'prod-9',
        quantity: 1,
        unitPrice: 66,
        subtotal: 66
      },
      {
        id: 'ti-49f41fb5-2c02-49d8-b204-c6492780b20f',
        productId: 'prod-16',
        quantity: 3,
        unitPrice: 57,
        subtotal: 171
      }
    ],
    createdAt: '2026-11-27T06:29:00.000Z',
    updatedAt: '2026-11-28T06:29:00.000Z'
  },
  {
    id: 'ord-211',
    orderNumber: 'ORD-211',
    customerId: 'cust-2',
    customerName: 'Giovanni Schaden-Friesen',
    customerPhone: '506-589-3210',
    customerAddress: '72645 Angelina Fords',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/31022849',
    totalAmount: 228,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'COMPLETED',
    trackingNumber: 'F6VDU1BCBJ',
    items: [
      {
        id: 'ti-9dce431a-4286-43f8-9fa7-7d54b2299f36',
        productId: 'prod-23',
        quantity: 3,
        unitPrice: 32,
        subtotal: 96
      },
      {
        id: 'ti-480a9c2c-e525-41a3-aabc-6eb0145940b9',
        productId: 'prod-20',
        quantity: 3,
        unitPrice: 44,
        subtotal: 132
      }
    ],
    createdAt: '2026-12-03T23:55:00.000Z',
    updatedAt: '2026-12-04T23:55:00.000Z'
  },
  {
    id: 'ord-212',
    orderNumber: 'ORD-212',
    customerId: 'cust-5',
    customerName: 'Rusty Abshire',
    customerPhone: '(759) 638-9715 x2810',
    customerAddress: '916 Keon Heights',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/32188232',
    totalAmount: 189,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: 'ZQLS40PJSD',
    items: [
      {
        id: 'ti-1d72afe4-9e0e-4f1f-ba28-f7d6e185769f',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 63,
        subtotal: 189
      }
    ],
    createdAt: '2026-12-07T01:49:00.000Z',
    updatedAt: '2026-12-08T01:49:00.000Z'
  },
  {
    id: 'ord-213',
    orderNumber: 'ORD-213',
    customerId: 'cust-19',
    customerName: 'Miss Mamie Doyle',
    customerPhone: '609.900.1822 x555',
    customerAddress: '8116 Madeline Rapids',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/19709603',
    totalAmount: 52,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PENDING',
    trackingNumber: 'MPD756XCMM',
    items: [
      {
        id: 'ti-59eb8d1d-6bea-4edf-84b1-12825bfd4fe7',
        productId: 'prod-7',
        quantity: 2,
        unitPrice: 26,
        subtotal: 52
      }
    ],
    createdAt: '2026-12-12T09:06:00.000Z',
    updatedAt: '2026-12-13T09:06:00.000Z'
  },
  {
    id: 'ord-214',
    orderNumber: 'ORD-214',
    customerId: 'cust-19',
    customerName: 'Godfrey Kuphal',
    customerPhone: '796-290-5635 x5614',
    customerAddress: '1415 Adam Roads',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/38833497',
    totalAmount: 388,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'LXRYOI513U',
    items: [
      {
        id: 'ti-45ad9888-fb0b-46cf-80fc-0de93bcafd74',
        productId: 'prod-21',
        quantity: 1,
        unitPrice: 56,
        subtotal: 56
      },
      {
        id: 'ti-e89828b9-1408-4510-96a5-711f579c7b16',
        productId: 'prod-6',
        quantity: 3,
        unitPrice: 102,
        subtotal: 306
      },
      {
        id: 'ti-9cda0306-6efd-4bdc-816a-447e930e3845',
        productId: 'prod-23',
        quantity: 1,
        unitPrice: 26,
        subtotal: 26
      }
    ],
    createdAt: '2026-12-25T04:27:00.000Z',
    updatedAt: '2026-12-26T04:27:00.000Z'
  },
  {
    id: 'ord-215',
    orderNumber: 'ORD-215',
    customerId: 'cust-9',
    customerName: 'Gilbert Ondricka',
    customerPhone: '596-371-3157',
    customerAddress: '4783 Keeling Shoals',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/47.jpg',
    totalAmount: 292,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'PROCESSING',
    trackingNumber: '4P9NDFJX6G',
    items: [
      {
        id: 'ti-fa2b7ef3-92f5-45d6-9043-7f90f7150902',
        productId: 'prod-10',
        quantity: 1,
        unitPrice: 79,
        subtotal: 79
      },
      {
        id: 'ti-85c51b6c-7116-44db-80be-6350e7bfbe10',
        productId: 'prod-21',
        quantity: 3,
        unitPrice: 71,
        subtotal: 213
      }
    ],
    createdAt: '2026-12-26T18:50:00.000Z',
    updatedAt: '2026-12-27T18:50:00.000Z'
  },
  {
    id: 'ord-216',
    orderNumber: 'ORD-216',
    customerId: 'cust-2',
    customerName: 'Otilia Hansen',
    customerPhone: '760-897-5785 x535',
    customerAddress: '5233 The Coppice',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/99981694',
    totalAmount: 382,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'D4O6RREBI8',
    items: [
      {
        id: 'ti-447851f2-3bbb-4b92-a2e6-5f88c967bfe3',
        productId: 'prod-16',
        quantity: 3,
        unitPrice: 100,
        subtotal: 300
      },
      {
        id: 'ti-b0efb44a-4d49-4169-917e-dded4ff7053d',
        productId: 'prod-8',
        quantity: 1,
        unitPrice: 82,
        subtotal: 82
      }
    ],
    createdAt: '2026-12-14T18:07:00.000Z',
    updatedAt: '2026-12-15T18:07:00.000Z'
  },
  {
    id: 'ord-217',
    orderNumber: 'ORD-217',
    customerId: 'cust-17',
    customerName: 'Linnie Langworth',
    customerPhone: '(695) 480-8532 x205',
    customerAddress: '1606 Boyd Mews',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/66931290',
    totalAmount: 404,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'CANCELLED',
    trackingNumber: '1HE8CC2XND',
    items: [
      {
        id: 'ti-56b9ed88-7bdd-427c-9fa1-7cb9d40ebf52',
        productId: 'prod-25',
        quantity: 2,
        unitPrice: 70,
        subtotal: 140
      },
      {
        id: 'ti-310cd49a-8af4-4329-b75f-71487adf50d6',
        productId: 'prod-7',
        quantity: 3,
        unitPrice: 88,
        subtotal: 264
      }
    ],
    createdAt: '2026-12-17T14:39:00.000Z',
    updatedAt: '2026-12-18T14:39:00.000Z'
  },
  {
    id: 'ord-218',
    orderNumber: 'ORD-218',
    customerId: 'cust-14',
    customerName: 'Ronnie Franey',
    customerPhone: '922-539-5269',
    customerAddress: '8964 Jubilee Close',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/87.jpg',
    totalAmount: 438,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'VPDVIOWBRH',
    items: [
      {
        id: 'ti-a2bf410e-2edd-4d6a-9766-b28316e38875',
        productId: 'prod-15',
        quantity: 3,
        unitPrice: 55,
        subtotal: 165
      },
      {
        id: 'ti-1dae32d0-c62e-48e9-999d-6c54d7d00ff7',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 77,
        subtotal: 77
      },
      {
        id: 'ti-8d205c9d-9e48-496d-9347-6db8f611db7b',
        productId: 'prod-22',
        quantity: 2,
        unitPrice: 98,
        subtotal: 196
      }
    ],
    createdAt: '2026-12-02T01:50:00.000Z',
    updatedAt: '2026-12-03T01:50:00.000Z'
  },
  {
    id: 'ord-219',
    orderNumber: 'ORD-219',
    customerId: 'cust-16',
    customerName: 'Isobel McLaughlin',
    customerPhone: '1-239-576-0908',
    customerAddress: '309 Anita Station',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/51205270',
    totalAmount: 317,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'OHDXO6JP8O',
    items: [
      {
        id: 'ti-c98ec75c-c560-4483-b07c-c8f9332267a5',
        productId: 'prod-4',
        quantity: 3,
        unitPrice: 57,
        subtotal: 171
      },
      {
        id: 'ti-ebc996be-0853-4330-b08c-b32581a4a50d',
        productId: 'prod-24',
        quantity: 2,
        unitPrice: 73,
        subtotal: 146
      }
    ],
    createdAt: '2026-12-18T18:21:00.000Z',
    updatedAt: '2026-12-19T18:21:00.000Z'
  },
  {
    id: 'ord-220',
    orderNumber: 'ORD-220',
    customerId: 'cust-17',
    customerName: 'Mr. Timothy Rohan-Senger',
    customerPhone: '1-353-977-6773 x1996',
    customerAddress: '474 Matt Squares',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/78.jpg',
    totalAmount: 165,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: '5QDBAHV6O2',
    items: [
      {
        id: 'ti-84c80b9f-3a67-4466-ac53-91b52c9b7ad0',
        productId: 'prod-8',
        quantity: 3,
        unitPrice: 23,
        subtotal: 69
      },
      {
        id: 'ti-5125c9fb-87f3-44d0-8321-1dee9cbc2c00',
        productId: 'prod-15',
        quantity: 3,
        unitPrice: 18,
        subtotal: 54
      },
      {
        id: 'ti-ab465b8b-0719-4aab-8669-e1668ef14530',
        productId: 'prod-4',
        quantity: 3,
        unitPrice: 14,
        subtotal: 42
      }
    ],
    createdAt: '2026-12-14T05:52:00.000Z',
    updatedAt: '2026-12-15T05:52:00.000Z'
  },
  {
    id: 'ord-221',
    orderNumber: 'ORD-221',
    customerId: 'cust-15',
    customerName: 'Terrance Casper',
    customerPhone: '854.960.7672 x107',
    customerAddress: '1862 N 3rd Street',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/69.jpg',
    totalAmount: 60,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'NQ0J0H36ME',
    items: [
      {
        id: 'ti-8f5a54d6-7821-42bb-bbfb-e12b6e9260fc',
        productId: 'prod-16',
        quantity: 3,
        unitPrice: 20,
        subtotal: 60
      }
    ],
    createdAt: '2026-12-08T23:50:00.000Z',
    updatedAt: '2026-12-09T23:50:00.000Z'
  },
  {
    id: 'ord-222',
    orderNumber: 'ORD-222',
    customerId: 'cust-1',
    customerName: 'Tommie Abernathy',
    customerPhone: '777-483-9017 x89496',
    customerAddress: '6027 Claudie Garden',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/85.jpg',
    totalAmount: 255,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: '885NM7RFTX',
    items: [
      {
        id: 'ti-69a83d30-6a39-49d0-8d21-103e2e20f05c',
        productId: 'prod-22',
        quantity: 2,
        unitPrice: 105,
        subtotal: 210
      },
      {
        id: 'ti-65647a24-3894-43f9-9a4f-ce58275b2789',
        productId: 'prod-7',
        quantity: 1,
        unitPrice: 23,
        subtotal: 23
      },
      {
        id: 'ti-da4d5f4b-fb52-4890-b984-a16fb2741ffa',
        productId: 'prod-25',
        quantity: 1,
        unitPrice: 22,
        subtotal: 22
      }
    ],
    createdAt: '2026-12-26T16:08:00.000Z',
    updatedAt: '2026-12-27T16:08:00.000Z'
  },
  {
    id: 'ord-223',
    orderNumber: 'ORD-223',
    customerId: 'cust-6',
    customerName: 'Jennyfer Lowe',
    customerPhone: '(390) 874-7644',
    customerAddress: '16374 Elizabeth Pines',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/51.jpg',
    totalAmount: 321,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    trackingNumber: 'TUG34CY47S',
    items: [
      {
        id: 'ti-c52f77a7-88c1-47c5-80bd-61f0769f329c',
        productId: 'prod-11',
        quantity: 2,
        unitPrice: 45,
        subtotal: 90
      },
      {
        id: 'ti-95f7f2e4-2a9e-4333-bfda-b33872111712',
        productId: 'prod-15',
        quantity: 2,
        unitPrice: 84,
        subtotal: 168
      },
      {
        id: 'ti-6a59bc48-93bf-4780-9c0a-d3c932876fdb',
        productId: 'prod-13',
        quantity: 1,
        unitPrice: 63,
        subtotal: 63
      }
    ],
    createdAt: '2026-12-17T20:02:00.000Z',
    updatedAt: '2026-12-18T20:02:00.000Z'
  },
  {
    id: 'ord-224',
    orderNumber: 'ORD-224',
    customerId: 'cust-10',
    customerName: 'Brice Watsica',
    customerPhone: '481-739-6127 x0663',
    customerAddress: '37870 Garrison Valley',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/43461904',
    totalAmount: 414,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'FJ0MGSLH5M',
    items: [
      {
        id: 'ti-8b4554ef-a9d9-4322-bdb7-1144fd7eca46',
        productId: 'prod-11',
        quantity: 3,
        unitPrice: 43,
        subtotal: 129
      },
      {
        id: 'ti-de264599-cd65-410f-a0cf-ca3c4e9ef8e3',
        productId: 'prod-5',
        quantity: 3,
        unitPrice: 95,
        subtotal: 285
      }
    ],
    createdAt: '2026-12-27T15:35:00.000Z',
    updatedAt: '2026-12-28T15:35:00.000Z'
  },
  {
    id: 'ord-225',
    orderNumber: 'ORD-225',
    customerId: 'cust-11',
    customerName: 'Wilma Kertzmann',
    customerPhone: '832.456.5480',
    customerAddress: '9784 Wiegand View',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/70.jpg',
    totalAmount: 513,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PENDING',
    status: 'READY_TO_SHIP',
    trackingNumber: 'N2YVDVZR3P',
    items: [
      {
        id: 'ti-a7643db1-12d3-49a8-9062-a4bff4cb23de',
        productId: 'prod-20',
        quantity: 3,
        unitPrice: 86,
        subtotal: 258
      },
      {
        id: 'ti-e2e220f1-ade7-449e-9e81-39378a5f9321',
        productId: 'prod-18',
        quantity: 3,
        unitPrice: 85,
        subtotal: 255
      }
    ],
    createdAt: '2026-12-17T15:39:00.000Z',
    updatedAt: '2026-12-18T15:39:00.000Z'
  },
  {
    id: 'ord-226',
    orderNumber: 'ORD-226',
    customerId: 'cust-10',
    customerName: 'Blanche Huels',
    customerPhone: '823-470-9853',
    customerAddress: '2995 Herzog Village',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/30.jpg',
    totalAmount: 255,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: '7B39X4GRIJ',
    items: [
      {
        id: 'ti-a8e7bafe-18d7-402f-adf4-db490415a633',
        productId: 'prod-1',
        quantity: 3,
        unitPrice: 85,
        subtotal: 255
      }
    ],
    createdAt: '2026-12-18T03:47:00.000Z',
    updatedAt: '2026-12-19T03:47:00.000Z'
  },
  {
    id: 'ord-227',
    orderNumber: 'ORD-227',
    customerId: 'cust-6',
    customerName: 'Lizzie Gutkowski',
    customerPhone: '241.626.7146 x3678',
    customerAddress: '151 N Broad Street',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/55.jpg',
    totalAmount: 24,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'QJ0ACVNF2Z',
    items: [
      {
        id: 'ti-28fa5a96-ff2a-4291-94a0-b4cff865b196',
        productId: 'prod-8',
        quantity: 1,
        unitPrice: 11,
        subtotal: 11
      },
      {
        id: 'ti-558c2e2d-a0c0-4424-ad83-f3237fa5e379',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 13,
        subtotal: 13
      }
    ],
    createdAt: '2026-12-06T16:03:00.000Z',
    updatedAt: '2026-12-07T16:03:00.000Z'
  },
  {
    id: 'ord-228',
    orderNumber: 'ORD-228',
    customerId: 'cust-16',
    customerName: 'Dr. William Emard',
    customerPhone: '1-541-237-1199 x430',
    customerAddress: '244 W Union Street',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/52.jpg',
    totalAmount: 74,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    trackingNumber: 'TC1Y62K05F',
    items: [
      {
        id: 'ti-e2ab5151-f4fb-4e92-9225-b0123f87e1f7',
        productId: 'prod-19',
        quantity: 1,
        unitPrice: 74,
        subtotal: 74
      }
    ],
    createdAt: '2026-12-12T20:12:00.000Z',
    updatedAt: '2026-12-13T20:12:00.000Z'
  },
  {
    id: 'ord-229',
    orderNumber: 'ORD-229',
    customerId: 'cust-4',
    customerName: 'Luis Koss',
    customerPhone: '(712) 682-7753 x03682',
    customerAddress: '495 Immanuel Mills',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/12.jpg',
    totalAmount: 208,
    paymentMethod: 'CREDIT_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'XKD9KR3RZO',
    items: [
      {
        id: 'ti-2ed0900f-5bd5-495f-85bf-33dfc5be08e7',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 104,
        subtotal: 208
      }
    ],
    createdAt: '2026-12-13T14:26:00.000Z',
    updatedAt: '2026-12-14T14:26:00.000Z'
  },
  {
    id: 'ord-230',
    orderNumber: 'ORD-230',
    customerId: 'cust-4',
    customerName: 'Margarita Morar II',
    customerPhone: '1-753-383-6611 x49825',
    customerAddress: '326 Haag Meadows',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/85.jpg',
    totalAmount: 166,
    paymentMethod: 'BANK_TRANSFER',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    trackingNumber: 'CH7L5UZO5X',
    items: [
      {
        id: 'ti-89c717b3-a3c0-4756-b0d4-4fa5d753d527',
        productId: 'prod-8',
        quantity: 2,
        unitPrice: 83,
        subtotal: 166
      }
    ],
    createdAt: '2026-12-16T07:13:00.000Z',
    updatedAt: '2026-12-17T07:13:00.000Z'
  },
  {
    id: 'ord-231',
    orderNumber: 'ORD-231',
    customerId: 'cust-12',
    customerName: 'Elmer Bins',
    customerPhone: '(966) 292-6978 x809',
    customerAddress: '6663 Jesus Fork',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/88.jpg',
    totalAmount: 92,
    paymentMethod: 'PAYPAL',
    paymentStatus: 'PAID',
    status: 'SHIPPED',
    trackingNumber: 'AU5AVCNI2B',
    items: [
      {
        id: 'ti-e36e48c0-2195-471c-9f1a-30de815f4ba0',
        productId: 'prod-8',
        quantity: 1,
        unitPrice: 37,
        subtotal: 37
      },
      {
        id: 'ti-8a2db204-f117-41fb-acae-be21283a244f',
        productId: 'prod-16',
        quantity: 1,
        unitPrice: 40,
        subtotal: 40
      },
      {
        id: 'ti-2f5c76e1-84d5-4d37-bf0a-9050414166aa',
        productId: 'prod-15',
        quantity: 1,
        unitPrice: 15,
        subtotal: 15
      }
    ],
    createdAt: '2026-12-07T14:18:00.000Z',
    updatedAt: '2026-12-08T14:18:00.000Z'
  }
];

const REVENUE_TRENDS: RevenueTrend[] = [
  { month: 'Jan', revenue: 4000, target: 5000 },
  { month: 'Feb', revenue: 3000, target: 5200 },
  { month: 'Mar', revenue: 2000, target: 5500 },
  { month: 'Apr', revenue: 2780, target: 6000 },
  { month: 'May', revenue: 1890, target: 6200 },
  { month: 'Jun', revenue: 2390, target: 6500 },
  { month: 'Jul', revenue: 3490, target: 7000 }
];

const CUSTOMER_GROWTH: CustomerGrowth[] = [
  { month: 'Jan', newCustomers: 120, returningCustomers: 80 },
  { month: 'Feb', newCustomers: 150, returningCustomers: 90 },
  { month: 'Mar', newCustomers: 180, returningCustomers: 110 },
  { month: 'Apr', newCustomers: 130, returningCustomers: 120 },
  { month: 'May', newCustomers: 210, returningCustomers: 140 },
  { month: 'Jun', newCustomers: 250, returningCustomers: 160 },
  { month: 'Jul', newCustomers: 310, returningCustomers: 190 }
];

export const mockDb = {
  categories: CATEGORIES,
  products: PRODUCTS,
  stockMovements: STOCK_MOVEMENTS,
  customers: CUSTOMERS,
  orders: ORDERS,
  revenueTrends: REVENUE_TRENDS,
  customerGrowth: CUSTOMER_GROWTH
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
