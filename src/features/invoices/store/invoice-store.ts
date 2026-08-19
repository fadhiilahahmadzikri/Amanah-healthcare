import { create } from 'zustand';

export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';

export type InvoiceItem = {
  id: string;
  description: string;
  unitPrice: number;
  qty: number;
  total: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerAvatarUrl?: string;
  company: string;
  address: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  notes?: string;
};

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-00001',
    customerName: 'Wilford Christiansen-Goodwin',
    customerEmail: 'Kylee25@gmail.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/88.jpg',
    company: 'Pollich - Dickens-Mills',
    address: '9808 Grand Avenue',
    status: 'OVERDUE',
    issuedAt: '2026-06-20T01:22:27.717Z',
    dueDate: '2027-03-16T11:27:46.211Z',
    paidAt: '2026-06-19T14:38:30.292Z',
    subtotal: 2804.99,
    tax: 224.39919999999998,
    totalAmount: 3029.3891999999996,
    items: [
      {
        id: 'item_76248aee-b7f1-4b14-8693-e90a6a77697e',
        description: 'Fantastic Metal Car',
        unitPrice: 2804.99,
        qty: 1,
        total: 2804.99
      }
    ]
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-00002',
    customerName: 'Mr. Dwayne Kuphal',
    customerEmail: 'Emmanuelle.Rohan9@gmail.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/81.jpg',
    company: 'Lind, Rau and Hauck',
    address: '85085 Crystal Pike',
    status: 'OVERDUE',
    issuedAt: '2026-06-19T08:29:12.276Z',
    dueDate: '2027-01-02T04:17:53.608Z',
    subtotal: 2234.89,
    tax: 178.7912,
    totalAmount: 2413.6812,
    items: [
      {
        id: 'item_3fd31937-30e6-46e5-9b6a-e2a30324c150',
        description: 'Rustic Gold Ball',
        unitPrice: 2234.89,
        qty: 1,
        total: 2234.89
      }
    ]
  },
  {
    id: 'inv_3',
    invoiceNumber: 'INV-00003',
    customerName: 'Devante Schuster',
    customerEmail: 'Raul30@hotmail.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/35.jpg',
    company: 'Abshire - Dibbert',
    address: '270 The Beeches',
    status: 'CANCELLED',
    issuedAt: '2026-06-19T07:57:12.167Z',
    dueDate: '2027-05-21T02:54:46.683Z',
    paidAt: '2026-06-19T11:34:02.499Z',
    subtotal: 4547.99,
    tax: 363.8392,
    totalAmount: 4911.8292,
    items: [
      {
        id: 'item_bcb1dce9-0af5-4f05-9fb2-67d8273ac2cf',
        description: 'Handcrafted Wooden Fish',
        unitPrice: 4547.99,
        qty: 1,
        total: 4547.99
      }
    ]
  },
  {
    id: 'inv_4',
    invoiceNumber: 'INV-00004',
    customerName: 'Mr. Newton Gibson',
    customerEmail: 'Andres_Bins@yahoo.com',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/6615723',
    company: 'Breitenberg - Fisher',
    address: '209 School Lane',
    status: 'PAID',
    issuedAt: '2026-06-19T16:04:21.873Z',
    dueDate: '2026-07-28T08:19:16.187Z',
    subtotal: 419.99,
    tax: 33.5992,
    totalAmount: 453.5892,
    items: [
      {
        id: 'item_6d0a2325-3010-4c3d-afed-d66fa5e60c07',
        description: 'Practical Steel Keyboard',
        unitPrice: 419.99,
        qty: 1,
        total: 419.99
      }
    ]
  },
  {
    id: 'inv_5',
    invoiceNumber: 'INV-00005',
    customerName: 'Larue Toy',
    customerEmail: 'Nicolas_Schimmel22@yahoo.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/80.jpg',
    company: 'Glover, Sporer and Moen',
    address: '736 Hermiston Trafficway',
    status: 'PAID',
    issuedAt: '2026-06-19T15:01:31.536Z',
    dueDate: '2027-01-30T16:19:08.487Z',
    subtotal: 1056.89,
    tax: 84.55120000000001,
    totalAmount: 1141.4412000000002,
    items: [
      {
        id: 'item_2c460c4d-9410-4669-95ce-5c700217b01c',
        description: 'Modern Plastic Ball',
        unitPrice: 1056.89,
        qty: 1,
        total: 1056.89
      }
    ]
  },
  {
    id: 'inv_6',
    invoiceNumber: 'INV-00006',
    customerName: 'Loretta King',
    customerEmail: 'Joyce81@gmail.com',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/31624153',
    company: 'Paucek - Cruickshank',
    address: '6672 Max Ford',
    status: 'PENDING',
    issuedAt: '2026-06-19T23:22:06.988Z',
    dueDate: '2026-07-22T20:47:26.400Z',
    subtotal: 3497.25,
    tax: 279.78000000000003,
    totalAmount: 3777.03,
    items: [
      {
        id: 'item_8980894a-ce88-4dcc-a832-7a1b9429c7c4',
        description: 'Intelligent Plastic Table',
        unitPrice: 3497.25,
        qty: 1,
        total: 3497.25
      }
    ]
  },
  {
    id: 'inv_7',
    invoiceNumber: 'INV-00007',
    customerName: 'Laura Hane',
    customerEmail: 'Lana88@yahoo.com',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/47257403',
    company: 'Effertz-Baumbach and Sons',
    address: '8868 Milton Road',
    status: 'PAID',
    issuedAt: '2026-06-19T09:30:54.238Z',
    dueDate: '2027-04-02T04:30:43.672Z',
    paidAt: '2026-06-19T17:22:49.483Z',
    subtotal: 1031.05,
    tax: 82.484,
    totalAmount: 1113.5339999999999,
    items: [
      {
        id: 'item_705d7f21-474a-4a47-8ccf-ab1bc09b243b',
        description: 'Sleek Metal Pizza',
        unitPrice: 1031.05,
        qty: 1,
        total: 1031.05
      }
    ]
  },
  {
    id: 'inv_8',
    invoiceNumber: 'INV-00008',
    customerName: 'Melissa Boyer',
    customerEmail: 'Janis70@yahoo.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/43.jpg',
    company: 'Spencer, Hand and Dickinson',
    address: '6324 Dibbert-Streich Summit',
    status: 'OVERDUE',
    issuedAt: '2026-06-20T00:11:55.278Z',
    dueDate: '2027-05-05T03:57:31.771Z',
    subtotal: 4438.59,
    tax: 355.0872,
    totalAmount: 4793.6772,
    items: [
      {
        id: 'item_e4945a93-9cca-48d5-93d0-092a179208ed',
        description: 'Small Gold Soap',
        unitPrice: 4438.59,
        qty: 1,
        total: 4438.59
      }
    ]
  },
  {
    id: 'inv_9',
    invoiceNumber: 'INV-00009',
    customerName: 'Jannie Bogan',
    customerEmail: 'Dewitt67@yahoo.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/33.jpg',
    company: 'Franecki LLC',
    address: '518 Kayli Way',
    status: 'CANCELLED',
    issuedAt: '2026-06-19T17:05:25.849Z',
    dueDate: '2027-01-03T07:02:28.184Z',
    subtotal: 450.15,
    tax: 36.012,
    totalAmount: 486.162,
    items: [
      {
        id: 'item_ae229343-5ba7-4935-9277-ebef515e7df5',
        description: 'Rustic Aluminum Soap',
        unitPrice: 450.15,
        qty: 1,
        total: 450.15
      }
    ]
  },
  {
    id: 'inv_10',
    invoiceNumber: 'INV-00010',
    customerName: 'Noe Hansen',
    customerEmail: 'Emie88@hotmail.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/32.jpg',
    company: 'Mann - Walker',
    address: '57767 Kling Turnpike',
    status: 'OVERDUE',
    issuedAt: '2026-06-19T16:29:48.917Z',
    dueDate: '2026-12-23T06:54:52.226Z',
    paidAt: '2026-06-19T09:51:24.423Z',
    subtotal: 1565.19,
    tax: 125.21520000000001,
    totalAmount: 1690.4052000000001,
    items: [
      {
        id: 'item_08482281-442e-4d93-b745-7895b8d11bbb',
        description: 'Generic Marble Bike',
        unitPrice: 1565.19,
        qty: 1,
        total: 1565.19
      }
    ]
  },
  {
    id: 'inv_11',
    invoiceNumber: 'INV-00011',
    customerName: 'Marie Fay',
    customerEmail: 'Jake28@gmail.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/47.jpg',
    company: 'Marquardt and Sons',
    address: '6207 Considine Glens',
    status: 'CANCELLED',
    issuedAt: '2026-06-19T06:25:01.710Z',
    dueDate: '2026-09-18T04:53:20.356Z',
    subtotal: 597.6,
    tax: 47.808,
    totalAmount: 645.408,
    items: [
      {
        id: 'item_51a538fc-f6ae-4118-809d-d4d8c7d277d5',
        description: 'Refined Bronze Chair',
        unitPrice: 597.6,
        qty: 1,
        total: 597.6
      }
    ]
  },
  {
    id: 'inv_12',
    invoiceNumber: 'INV-00012',
    customerName: 'Santino Toy',
    customerEmail: 'Carmen12@hotmail.com',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/10828570',
    company: 'Berge and Sons',
    address: '36884 W Park Street',
    status: 'PENDING',
    issuedAt: '2026-06-19T23:16:25.848Z',
    dueDate: '2026-10-09T00:16:28.991Z',
    subtotal: 2294.15,
    tax: 183.532,
    totalAmount: 2477.6820000000002,
    items: [
      {
        id: 'item_f5d27cbf-05f0-47dd-a527-52b117457557',
        description: 'Intelligent Plastic Hat',
        unitPrice: 2294.15,
        qty: 1,
        total: 2294.15
      }
    ]
  },
  {
    id: 'inv_13',
    invoiceNumber: 'INV-00013',
    customerName: 'Uriel Flatley',
    customerEmail: 'Marlon_Jakubowski54@yahoo.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/77.jpg',
    company: 'Ryan - Wolf',
    address: '857 Nitzsche Brook',
    status: 'OVERDUE',
    issuedAt: '2026-06-19T23:42:54.442Z',
    dueDate: '2026-11-24T07:02:12.749Z',
    subtotal: 713.45,
    tax: 57.07600000000001,
    totalAmount: 770.5260000000001,
    items: [
      {
        id: 'item_9db6c8e7-008c-4002-9aa8-44b20b975c74',
        description: 'Practical Wooden Shoes',
        unitPrice: 713.45,
        qty: 1,
        total: 713.45
      }
    ]
  },
  {
    id: 'inv_14',
    invoiceNumber: 'INV-00014',
    customerName: 'Shawna Hodkiewicz',
    customerEmail: 'Brennon.Mitchell@yahoo.com',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/61620730',
    company: 'Johns LLC',
    address: '92460 The Chase',
    status: 'PENDING',
    issuedAt: '2026-06-19T12:47:55.605Z',
    dueDate: '2026-07-20T11:03:14.119Z',
    paidAt: '2026-06-20T04:47:39.026Z',
    subtotal: 3031.19,
    tax: 242.4952,
    totalAmount: 3273.6852,
    items: [
      {
        id: 'item_0c874db9-0878-4361-9ee0-a5c76b57125b',
        description: 'Licensed Bamboo Salad',
        unitPrice: 3031.19,
        qty: 1,
        total: 3031.19
      }
    ]
  },
  {
    id: 'inv_15',
    invoiceNumber: 'INV-00015',
    customerName: 'Kayla Connelly DDS',
    customerEmail: 'Dwayne_Brakus9@hotmail.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/45.jpg',
    company: 'Davis-Thompson, Flatley and Pacocha',
    address: '768 Kunde Flat',
    status: 'PAID',
    issuedAt: '2026-06-19T14:43:30.050Z',
    dueDate: '2027-06-11T20:45:04.106Z',
    subtotal: 2656.69,
    tax: 212.5352,
    totalAmount: 2869.2252,
    items: [
      {
        id: 'item_fba8e0dc-32a7-4fb9-814e-5d5709e15121',
        description: 'Fresh Gold Pants',
        unitPrice: 2656.69,
        qty: 1,
        total: 2656.69
      }
    ]
  },
  {
    id: 'inv_16',
    invoiceNumber: 'INV-00016',
    customerName: "Maximillia D'Amore",
    customerEmail: 'Rosie.Skiles@yahoo.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/32.jpg',
    company: 'Lowe Group',
    address: '337 York Street',
    status: 'PENDING',
    issuedAt: '2026-06-19T23:00:22.916Z',
    dueDate: '2027-01-17T13:51:51.221Z',
    subtotal: 4799.39,
    tax: 383.95120000000003,
    totalAmount: 5183.341200000001,
    items: [
      {
        id: 'item_a5881277-1e65-446e-98b2-119f0eeb1512',
        description: 'Intelligent Cotton Bacon',
        unitPrice: 4799.39,
        qty: 1,
        total: 4799.39
      }
    ]
  },
  {
    id: 'inv_17',
    invoiceNumber: 'INV-00017',
    customerName: 'Euna Borer',
    customerEmail: 'Elza53@hotmail.com',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/40959307',
    company: 'Streich - Yost',
    address: '439 Cumberland Street',
    status: 'PENDING',
    issuedAt: '2026-06-19T14:03:07.046Z',
    dueDate: '2027-03-01T19:34:42.303Z',
    subtotal: 2571.89,
    tax: 205.75119999999998,
    totalAmount: 2777.6412,
    items: [
      {
        id: 'item_ba2dc7ee-0852-44a3-95ec-5397830430ea',
        description: 'Electronic Bamboo Table',
        unitPrice: 2571.89,
        qty: 1,
        total: 2571.89
      }
    ]
  },
  {
    id: 'inv_18',
    invoiceNumber: 'INV-00018',
    customerName: 'Danielle King',
    customerEmail: 'Columbus48@gmail.com',
    customerAvatarUrl: 'https://avatars.githubusercontent.com/u/72656161',
    company: 'Harris - Kihn',
    address: '69968 Boehm Skyway',
    status: 'PAID',
    issuedAt: '2026-06-19T07:52:04.411Z',
    dueDate: '2027-03-09T16:41:50.914Z',
    paidAt: '2026-06-20T02:43:38.184Z',
    subtotal: 3762.15,
    tax: 300.97200000000004,
    totalAmount: 4063.1220000000003,
    items: [
      {
        id: 'item_bbe38bf4-7fd4-4e8c-b39e-63259e193376',
        description: 'Intelligent Bronze Chips',
        unitPrice: 3762.15,
        qty: 1,
        total: 3762.15
      }
    ]
  },
  {
    id: 'inv_19',
    invoiceNumber: 'INV-00019',
    customerName: 'Esteban Kreiger',
    customerEmail: 'Kari7@gmail.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/35.jpg',
    company: 'Dicki, Bauch and Wintheiser',
    address: '8618 Torey Expressway',
    status: 'PAID',
    issuedAt: '2026-06-19T07:21:02.549Z',
    dueDate: '2026-10-24T04:43:24.027Z',
    paidAt: '2026-06-19T23:06:54.316Z',
    subtotal: 3166.25,
    tax: 253.3,
    totalAmount: 3419.55,
    items: [
      {
        id: 'item_f20c8277-f0b1-4550-b150-8d3edf17b6ef',
        description: 'Luxurious Cotton Table',
        unitPrice: 3166.25,
        qty: 1,
        total: 3166.25
      }
    ]
  },
  {
    id: 'inv_20',
    invoiceNumber: 'INV-00020',
    customerName: 'Andrea Wiza',
    customerEmail: 'Doris.Wilkinson3@gmail.com',
    customerAvatarUrl:
      'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/74.jpg',
    company: 'Fay - Tromp',
    address: '868 Bennie Forest',
    status: 'OVERDUE',
    issuedAt: '2026-06-19T22:08:56.581Z',
    dueDate: '2026-07-06T10:45:32.348Z',
    subtotal: 683.79,
    tax: 54.703199999999995,
    totalAmount: 738.4932,
    items: [
      {
        id: 'item_e790bc56-6b59-4b31-be48-74214fe8d053',
        description: 'Soft Wooden Bike',
        unitPrice: 683.79,
        qty: 1,
        total: 683.79
      }
    ]
  },
  {
    id: 'inv-ex-1',
    invoiceNumber: 'INV-EX-1001',
    customerName: 'Extra Customer 1',
    customerEmail: 'extra1@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-06T12:00:00Z',
    dueDate: '2026-02-06T12:00:00Z',
    items: [{ id: 'item-1', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-2',
    invoiceNumber: 'INV-EX-1002',
    customerName: 'Extra Customer 2',
    customerEmail: 'extra2@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-06T12:00:00Z',
    dueDate: '2026-01-06T12:00:00Z',
    items: [{ id: 'item-2', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-3',
    invoiceNumber: 'INV-EX-1003',
    customerName: 'Extra Customer 3',
    customerEmail: 'extra3@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-11T12:00:00Z',
    dueDate: '2026-01-11T12:00:00Z',
    items: [{ id: 'item-3', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-4',
    invoiceNumber: 'INV-EX-1004',
    customerName: 'Extra Customer 4',
    customerEmail: 'extra4@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-27T12:00:00Z',
    dueDate: '2026-02-27T12:00:00Z',
    items: [{ id: 'item-4', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-5',
    invoiceNumber: 'INV-EX-1005',
    customerName: 'Extra Customer 5',
    customerEmail: 'extra5@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-15T12:00:00Z',
    dueDate: '2026-02-15T12:00:00Z',
    items: [{ id: 'item-5', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-6',
    invoiceNumber: 'INV-EX-1006',
    customerName: 'Extra Customer 6',
    customerEmail: 'extra6@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-02T12:00:00Z',
    dueDate: '2026-02-02T12:00:00Z',
    items: [{ id: 'item-6', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-7',
    invoiceNumber: 'INV-EX-1007',
    customerName: 'Extra Customer 7',
    customerEmail: 'extra7@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-26T12:00:00Z',
    dueDate: '2026-01-26T12:00:00Z',
    items: [{ id: 'item-7', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-8',
    invoiceNumber: 'INV-EX-1008',
    customerName: 'Extra Customer 8',
    customerEmail: 'extra8@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-14T12:00:00Z',
    dueDate: '2026-01-14T12:00:00Z',
    items: [{ id: 'item-8', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-9',
    invoiceNumber: 'INV-EX-1009',
    customerName: 'Extra Customer 9',
    customerEmail: 'extra9@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-21T12:00:00Z',
    dueDate: '2026-02-21T12:00:00Z',
    items: [{ id: 'item-9', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-10',
    invoiceNumber: 'INV-EX-1010',
    customerName: 'Extra Customer 10',
    customerEmail: 'extra10@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-14T12:00:00Z',
    dueDate: '2026-01-14T12:00:00Z',
    items: [{ id: 'item-10', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-11',
    invoiceNumber: 'INV-EX-1011',
    customerName: 'Extra Customer 11',
    customerEmail: 'extra11@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-13T12:00:00Z',
    dueDate: '2026-02-13T12:00:00Z',
    items: [{ id: 'item-11', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-12',
    invoiceNumber: 'INV-EX-1012',
    customerName: 'Extra Customer 12',
    customerEmail: 'extra12@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-22T12:00:00Z',
    dueDate: '2026-02-22T12:00:00Z',
    items: [{ id: 'item-12', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-13',
    invoiceNumber: 'INV-EX-1013',
    customerName: 'Extra Customer 13',
    customerEmail: 'extra13@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-15T12:00:00Z',
    dueDate: '2026-01-15T12:00:00Z',
    items: [{ id: 'item-13', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-14',
    invoiceNumber: 'INV-EX-1014',
    customerName: 'Extra Customer 14',
    customerEmail: 'extra14@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-01T12:00:00Z',
    dueDate: '2026-01-01T12:00:00Z',
    items: [{ id: 'item-14', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-15',
    invoiceNumber: 'INV-EX-1015',
    customerName: 'Extra Customer 15',
    customerEmail: 'extra15@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-05T12:00:00Z',
    dueDate: '2026-01-05T12:00:00Z',
    items: [{ id: 'item-15', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-16',
    invoiceNumber: 'INV-EX-1016',
    customerName: 'Extra Customer 16',
    customerEmail: 'extra16@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-24T12:00:00Z',
    dueDate: '2026-01-24T12:00:00Z',
    items: [{ id: 'item-16', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-17',
    invoiceNumber: 'INV-EX-1017',
    customerName: 'Extra Customer 17',
    customerEmail: 'extra17@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-06T12:00:00Z',
    dueDate: '2026-02-06T12:00:00Z',
    items: [{ id: 'item-17', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-18',
    invoiceNumber: 'INV-EX-1018',
    customerName: 'Extra Customer 18',
    customerEmail: 'extra18@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-08T12:00:00Z',
    dueDate: '2026-01-08T12:00:00Z',
    items: [{ id: 'item-18', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-19',
    invoiceNumber: 'INV-EX-1019',
    customerName: 'Extra Customer 19',
    customerEmail: 'extra19@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-07T12:00:00Z',
    dueDate: '2026-01-07T12:00:00Z',
    items: [{ id: 'item-19', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-20',
    invoiceNumber: 'INV-EX-1020',
    customerName: 'Extra Customer 20',
    customerEmail: 'extra20@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-27T12:00:00Z',
    dueDate: '2026-01-27T12:00:00Z',
    items: [{ id: 'item-20', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-21',
    invoiceNumber: 'INV-EX-1021',
    customerName: 'Extra Customer 21',
    customerEmail: 'extra21@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-17T12:00:00Z',
    dueDate: '2026-01-17T12:00:00Z',
    items: [{ id: 'item-21', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-22',
    invoiceNumber: 'INV-EX-1022',
    customerName: 'Extra Customer 22',
    customerEmail: 'extra22@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-18T12:00:00Z',
    dueDate: '2026-02-18T12:00:00Z',
    items: [{ id: 'item-22', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-23',
    invoiceNumber: 'INV-EX-1023',
    customerName: 'Extra Customer 23',
    customerEmail: 'extra23@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-09T12:00:00Z',
    dueDate: '2026-01-09T12:00:00Z',
    items: [{ id: 'item-23', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-24',
    invoiceNumber: 'INV-EX-1024',
    customerName: 'Extra Customer 24',
    customerEmail: 'extra24@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-13T12:00:00Z',
    dueDate: '2026-02-13T12:00:00Z',
    items: [{ id: 'item-24', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-25',
    invoiceNumber: 'INV-EX-1025',
    customerName: 'Extra Customer 25',
    customerEmail: 'extra25@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-13T12:00:00Z',
    dueDate: '2026-02-13T12:00:00Z',
    items: [{ id: 'item-25', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-26',
    invoiceNumber: 'INV-EX-1026',
    customerName: 'Extra Customer 26',
    customerEmail: 'extra26@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-22T12:00:00Z',
    dueDate: '2026-01-22T12:00:00Z',
    items: [{ id: 'item-26', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-27',
    invoiceNumber: 'INV-EX-1027',
    customerName: 'Extra Customer 27',
    customerEmail: 'extra27@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-02T12:00:00Z',
    dueDate: '2026-02-02T12:00:00Z',
    items: [{ id: 'item-27', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-28',
    invoiceNumber: 'INV-EX-1028',
    customerName: 'Extra Customer 28',
    customerEmail: 'extra28@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-28T12:00:00Z',
    dueDate: '2026-01-28T12:00:00Z',
    items: [{ id: 'item-28', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-29',
    invoiceNumber: 'INV-EX-1029',
    customerName: 'Extra Customer 29',
    customerEmail: 'extra29@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-07T12:00:00Z',
    dueDate: '2026-02-07T12:00:00Z',
    items: [{ id: 'item-29', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-30',
    invoiceNumber: 'INV-EX-1030',
    customerName: 'Extra Customer 30',
    customerEmail: 'extra30@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-06T12:00:00Z',
    dueDate: '2026-02-06T12:00:00Z',
    items: [{ id: 'item-30', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-31',
    invoiceNumber: 'INV-EX-1031',
    customerName: 'Extra Customer 31',
    customerEmail: 'extra31@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-22T12:00:00Z',
    dueDate: '2026-01-22T12:00:00Z',
    items: [{ id: 'item-31', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-32',
    invoiceNumber: 'INV-EX-1032',
    customerName: 'Extra Customer 32',
    customerEmail: 'extra32@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-01T12:00:00Z',
    dueDate: '2026-02-01T12:00:00Z',
    items: [{ id: 'item-32', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-33',
    invoiceNumber: 'INV-EX-1033',
    customerName: 'Extra Customer 33',
    customerEmail: 'extra33@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-24T12:00:00Z',
    dueDate: '2026-02-24T12:00:00Z',
    items: [{ id: 'item-33', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-34',
    invoiceNumber: 'INV-EX-1034',
    customerName: 'Extra Customer 34',
    customerEmail: 'extra34@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-11T12:00:00Z',
    dueDate: '2026-02-11T12:00:00Z',
    items: [{ id: 'item-34', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-35',
    invoiceNumber: 'INV-EX-1035',
    customerName: 'Extra Customer 35',
    customerEmail: 'extra35@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-12T12:00:00Z',
    dueDate: '2026-01-12T12:00:00Z',
    items: [{ id: 'item-35', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-36',
    invoiceNumber: 'INV-EX-1036',
    customerName: 'Extra Customer 36',
    customerEmail: 'extra36@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-01T12:00:00Z',
    dueDate: '2026-01-01T12:00:00Z',
    items: [{ id: 'item-36', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-37',
    invoiceNumber: 'INV-EX-1037',
    customerName: 'Extra Customer 37',
    customerEmail: 'extra37@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-23T12:00:00Z',
    dueDate: '2026-02-23T12:00:00Z',
    items: [{ id: 'item-37', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-38',
    invoiceNumber: 'INV-EX-1038',
    customerName: 'Extra Customer 38',
    customerEmail: 'extra38@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-02-21T12:00:00Z',
    dueDate: '2026-02-21T12:00:00Z',
    items: [{ id: 'item-38', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-39',
    invoiceNumber: 'INV-EX-1039',
    customerName: 'Extra Customer 39',
    customerEmail: 'extra39@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-26T12:00:00Z',
    dueDate: '2026-01-26T12:00:00Z',
    items: [{ id: 'item-39', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  },
  {
    id: 'inv-ex-40',
    invoiceNumber: 'INV-EX-1040',
    customerName: 'Extra Customer 40',
    customerEmail: 'extra40@example.com',
    company: 'Acme Corp',
    address: '123 Fake St',
    subtotal: 50,
    tax: 0,
    totalAmount: 50,
    status: 'PAID',
    issuedAt: '2026-01-19T12:00:00Z',
    dueDate: '2026-01-19T12:00:00Z',
    items: [{ id: 'item-40', description: 'Services', qty: 1, unitPrice: 50, total: 50 }]
  }
];

type InvoiceStore = {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, values: Invoice) => void;
  deleteInvoice: (id: string) => void;
};

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: MOCK_INVOICES,
  addInvoice: (invoice) =>
    set((state) => {
      if (state.invoices.some((item) => item.id === invoice.id)) {
        return state;
      }

      return { invoices: [invoice, ...state.invoices] };
    }),
  updateInvoice: (id, values) =>
    set((state) => ({
      invoices: state.invoices.map((invoice) => (invoice.id === id ? values : invoice))
    })),
  deleteInvoice: (id) => set((state) => ({ invoices: state.invoices.filter((i) => i.id !== id) }))
}));
