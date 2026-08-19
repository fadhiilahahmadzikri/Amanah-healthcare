import { create } from 'zustand';

export type CustomerStatus = 'Active' | 'Inactive';

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  streetAddress?: string;
  city?: string;
  country?: string;
  status: CustomerStatus;
  orders: number;
  totalSpent: number;
  joinedAt: string;
  avatarUrl?: string;
};

export type CustomerUpdateValues = Pick<
  Customer,
  'name' | 'email' | 'company' | 'phone' | 'status'
> &
  Partial<Pick<Customer, 'streetAddress' | 'city' | 'country'>>;

type CustomerAddress = Required<Pick<Customer, 'streetAddress' | 'city' | 'country'>>;

const fallbackAddresses: CustomerAddress[] = [
  {
    streetAddress: '33973 Johnson Loop Apt. 055',
    city: 'San Francisco',
    country: 'United States'
  },
  {
    streetAddress: '31537 Bailee Glen Apt. 531',
    city: 'London',
    country: 'United Kingdom'
  },
  {
    streetAddress: '8428 Harbor View Suite 12',
    city: 'Toronto',
    country: 'Canada'
  },
  {
    streetAddress: '1209 Market Street Floor 4',
    city: 'Sydney',
    country: 'Australia'
  }
];

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    name: 'Adrain Emard',
    email: 'Matt99@yahoo.com',
    company: "O'Kon - Cremin",
    phone: '207-465-0435 x998',
    status: 'Active',
    orders: 21,
    totalSpent: 44202.25,
    joinedAt: '2025-08-10T12:24:33.458Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/59681613'
  },
  {
    id: 'cust_2',
    name: 'Bonnie Hagenes',
    email: 'Henderson.Hills@hotmail.com',
    company: 'Jast, Nader and Rowe',
    phone: '1-871-375-4259 x1475',
    status: 'Inactive',
    orders: 24,
    totalSpent: 10297.9,
    joinedAt: '2025-10-01T17:49:54.898Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/71310252'
  },
  {
    id: 'cust_3',
    name: 'Piper Gottlieb',
    email: 'Nancy32@yahoo.com',
    company: 'Terry LLC',
    phone: '355.827.5540',
    status: 'Active',
    orders: 48,
    totalSpent: 46389.2,
    joinedAt: '2025-12-15T22:05:01.934Z',
    avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/22.jpg'
  },
  {
    id: 'cust_4',
    name: 'Bernice Effertz',
    email: 'Nicolas_Schiller@hotmail.com',
    company: 'Auer - Hansen',
    phone: '1-581-876-4177 x0895',
    status: 'Inactive',
    orders: 5,
    totalSpent: 4424.8,
    joinedAt: '2025-10-14T09:30:23.627Z',
    avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/23.jpg'
  },
  {
    id: 'cust_5',
    name: 'Trent Shanahan',
    email: 'Ruthie88@yahoo.com',
    company: 'Mann Group',
    phone: '313-801-1096',
    status: 'Active',
    orders: 26,
    totalSpent: 33141.39,
    joinedAt: '2025-07-10T04:06:55.797Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/90221116'
  },
  {
    id: 'cust_6',
    name: 'Brandi Howell',
    email: 'Abigayle_Osinski@hotmail.com',
    company: 'Kiehn, Dibbert and Hettinger',
    phone: '(466) 743-7883',
    status: 'Active',
    orders: 2,
    totalSpent: 19948.75,
    joinedAt: '2025-11-26T08:57:35.850Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/54653309'
  },
  {
    id: 'cust_7',
    name: 'Leonor Carroll',
    email: 'Vince60@gmail.com',
    company: 'Schimmel, Brakus and Hoeger',
    phone: '528.202.6641 x419',
    status: 'Inactive',
    orders: 46,
    totalSpent: 1314.99,
    joinedAt: '2025-10-31T22:15:41.211Z',
    avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/61.jpg'
  },
  {
    id: 'cust_8',
    name: 'Omer Smitham II',
    email: 'Osvaldo.Runte33@hotmail.com',
    company: 'Goyette, Senger and Rogahn',
    phone: '(987) 263-3890 x1936',
    status: 'Active',
    orders: 24,
    totalSpent: 44384.45,
    joinedAt: '2025-12-18T21:54:54.116Z',
    avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/4.jpg'
  },
  {
    id: 'cust_9',
    name: 'Roman Mills',
    email: 'Erik.Halvorson43@gmail.com',
    company: 'Mante and Sons',
    phone: '(920) 742-8999 x83022',
    status: 'Inactive',
    orders: 19,
    totalSpent: 9893.7,
    joinedAt: '2025-09-15T01:17:32.871Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/48806849'
  },
  {
    id: 'cust_10',
    name: 'Dr. Earnest Hilpert',
    email: 'Ashley.Prosacco@hotmail.com',
    company: 'DuBuque, Metz and Gibson',
    phone: '567-877-8890 x476',
    status: 'Active',
    orders: 31,
    totalSpent: 37189.61,
    joinedAt: '2025-07-10T08:59:30.803Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/74256497'
  },
  {
    id: 'cust_11',
    name: 'Mr. Max Shanahan',
    email: 'Leon10@yahoo.com',
    company: "D'Amore - Block",
    phone: '540-733-6712',
    status: 'Inactive',
    orders: 19,
    totalSpent: 31847.99,
    joinedAt: '2026-04-11T23:33:41.603Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/57160081'
  },
  {
    id: 'cust_12',
    name: 'Nicola Stamm',
    email: 'Tyler.Fahey52@yahoo.com',
    company: 'Gutkowski, Fadel and Tremblay',
    phone: '1-619-329-3167 x02254',
    status: 'Inactive',
    orders: 12,
    totalSpent: 48559.19,
    joinedAt: '2025-07-12T02:36:18.945Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/75435087'
  },
  {
    id: 'cust_13',
    name: 'Keith Carter Sr.',
    email: 'Doyle99@gmail.com',
    company: 'Williamson Group',
    phone: '1-648-368-2889',
    status: 'Active',
    orders: 19,
    totalSpent: 46000.3,
    joinedAt: '2026-05-02T10:24:23.227Z',
    avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/24.jpg'
  },
  {
    id: 'cust_14',
    name: 'Jeremiah Hirthe',
    email: 'Terrill37@yahoo.com',
    company: 'Jacobi Inc',
    phone: '1-402-431-8986 x71217',
    status: 'Active',
    orders: 29,
    totalSpent: 11235.49,
    joinedAt: '2025-12-02T12:13:11.629Z',
    avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/27.jpg'
  },
  {
    id: 'cust_15',
    name: 'Elisa Bernhard',
    email: 'Madison_Senger-Corwin56@gmail.com',
    company: 'Wiza - Frami',
    phone: '493-453-4407',
    status: 'Inactive',
    orders: 44,
    totalSpent: 32532.39,
    joinedAt: '2026-04-17T11:46:53.206Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/57031701'
  },
  {
    id: 'cust_16',
    name: 'Bryan Jones',
    email: 'Marquis_Sauer@hotmail.com',
    company: 'Abernathy - Turcotte',
    phone: '632-568-6376',
    status: 'Active',
    orders: 47,
    totalSpent: 23510.99,
    joinedAt: '2025-12-19T12:06:44.291Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/79530755'
  },
  {
    id: 'cust_17',
    name: 'Lydia Mraz',
    email: 'Anthony.Erdman@yahoo.com',
    company: 'Wintheiser - Roberts',
    phone: '509.571.8156 x7667',
    status: 'Inactive',
    orders: 22,
    totalSpent: 32633.09,
    joinedAt: '2026-02-17T23:59:58.415Z',
    avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/8.jpg'
  },
  {
    id: 'cust_18',
    name: 'Freddie Kuhic',
    email: 'Virginia.Welch32@gmail.com',
    company: 'Abbott Inc',
    phone: '1-437-808-9976 x34766',
    status: 'Inactive',
    orders: 26,
    totalSpent: 29315.75,
    joinedAt: '2025-09-12T10:42:53.233Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/66226379'
  },
  {
    id: 'cust_19',
    name: 'Dr. Karen Beier',
    email: 'Adrienne.Windler@gmail.com',
    company: 'Legros LLC',
    phone: '935.958.0489 x3214',
    status: 'Active',
    orders: 33,
    totalSpent: 36726.1,
    joinedAt: '2026-02-01T13:48:15.308Z',
    avatarUrl: 'https://avatars.githubusercontent.com/u/42753569'
  },
  {
    id: 'cust_20',
    name: 'Peggie Keebler V',
    email: 'Lance_Zemlak@yahoo.com',
    company: 'Balistreri, Hane and Goodwin',
    phone: '364.472.3832',
    status: 'Inactive',
    orders: 30,
    totalSpent: 3561.24,
    joinedAt: '2026-06-17T14:11:54.077Z',
    avatarUrl: 'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/60.jpg'
  }
];

export type CustomerCreateValues = Pick<
  Customer,
  'name' | 'email' | 'company' | 'phone' | 'status'
> &
  Partial<Pick<Customer, 'streetAddress' | 'city' | 'country'>>;

type CustomerStore = {
  customers: Customer[];
  createCustomer: (values: CustomerCreateValues) => void;
  updateCustomer: (id: string, values: CustomerUpdateValues) => void;
  deleteCustomer: (id: string) => void;
};

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: MOCK_CUSTOMERS,
  createCustomer: (values) =>
    set((state) => {
      const newId = `cust_${Math.max(...state.customers.map((c) => parseInt(c.id.replace('cust_', '')) || 0)) + 1}`;
      const newCustomer: Customer = {
        ...values,
        id: newId,
        orders: 0,
        totalSpent: 0,
        joinedAt: new Date().toISOString()
      };
      return { customers: [newCustomer, ...state.customers] };
    }),
  updateCustomer: (id, values) =>
    set((state) => ({
      customers: state.customers.map((customer) =>
        customer.id === id ? { ...customer, ...values } : customer
      )
    })),
  deleteCustomer: (id) =>
    set((state) => ({ customers: state.customers.filter((customer) => customer.id !== id) }))
}));

export function getCustomerAddress(customer: Customer): CustomerAddress {
  const fallback = fallbackAddresses[getStableAddressIndex(customer.id)];

  return {
    streetAddress: customer.streetAddress ?? fallback.streetAddress,
    city: customer.city ?? fallback.city,
    country: customer.country ?? fallback.country
  };
}

function getStableAddressIndex(value: string) {
  const hash = Array.from(value).reduce((total, character) => total + character.charCodeAt(0), 0);

  return hash % fallbackAddresses.length;
}
