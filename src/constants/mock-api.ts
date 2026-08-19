import { faker } from '@faker-js/faker';
import { matchSorter } from 'match-sorter';

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const MOCK_API_FAKER_SEED = 20260101;
const MOCK_API_REF_DATE = new Date('2026-06-22T00:00:00.000Z');

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

function generateRandomProductData(id: number): Product {
  const categories = [
    'Electronics',
    'Furniture',
    'Clothing',
    'Toys',
    'Groceries',
    'Books',
    'Jewelry',
    'Beauty Products'
  ];

  return {
    id,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    created_at: faker.date.between({ from: '2022-01-01', to: '2023-12-31' }).toISOString(),
    price: parseFloat(faker.commerce.price({ min: 5, max: 500, dec: 2 })),
    photo_url: `https://api.slingacademy.com/public/sample-products/${id}.png`,
    category: faker.helpers.arrayElement(categories),
    updated_at: faker.date.recent().toISOString()
  };
}

export const fakeProducts = {
  records: [] as Product[],

  initialize() {
    faker.seed(MOCK_API_FAKER_SEED);
    faker.setDefaultRefDate(MOCK_API_REF_DATE);

    const sampleProducts: Product[] = [];

    for (let i = 1; i <= 20; i++) {
      sampleProducts.push(generateRandomProductData(i));
    }

    this.records = sampleProducts;
  },

  async getAll({ categories = [], search }: { categories?: string[]; search?: string }) {
    let products = [...this.records];

    if (categories.length > 0) {
      products = products.filter((product) => categories.includes(product.category));
    }

    if (search) {
      products = matchSorter(products, search, {
        keys: ['name', 'description', 'category']
      });
    }

    return products;
  },

  async getProducts({
    page = 1,
    limit = 10,
    categories,
    search,
    sort
  }: {
    page?: number;
    limit?: number;
    categories?: string | string[];
    search?: string;
    sort?: string;
  }) {
    await delay(1000);
    const categoriesArray = categories
      ? Array.isArray(categories)
        ? categories
        : String(categories).split(/[.,]/)
      : [];
    const allProducts = await this.getAll({
      categories: categoriesArray,
      search
    });

    if (sort) {
      try {
        const sortItems = JSON.parse(sort) as {
          id: string;
          desc: boolean;
        }[];
        if (sortItems.length > 0) {
          const { id, desc } = sortItems[0];
          allProducts.sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[id];
            const bVal = (b as Record<string, unknown>)[id];
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return desc ? bVal - aVal : aVal - bVal;
            }
            const aStr = String(aVal ?? '').toLowerCase();
            const bStr = String(bVal ?? '').toLowerCase();
            return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          });
        }
      } catch {}
    }

    const totalProducts = allProducts.length;

    const offset = (page - 1) * limit;
    const paginatedProducts = allProducts.slice(offset, offset + limit);

    const currentTime = new Date().toISOString();

    return {
      success: true,
      time: currentTime,
      message: 'Sample data for testing and learning purposes',
      total_products: totalProducts,
      offset,
      limit,
      products: paginatedProducts
    };
  },

  async getProductById(id: number) {
    await delay(3000);

    const product = this.records.find((product) => product.id === id);

    if (!product) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }

    const currentTime = new Date().toISOString();

    return {
      success: true,
      time: currentTime,
      message: `Product with ID ${id} found`,
      product
    };
  },

  async createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'photo_url'>) {
    await delay(1000);

    const newProduct: Product = {
      ...data,
      id: this.records.length + 1,
      photo_url: `https://api.slingacademy.com/public/sample-products/${this.records.length + 1}.png`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.records.push(newProduct);

    return {
      success: true,
      message: 'Product created successfully',
      product: newProduct
    };
  },

  async updateProduct(
    id: number,
    data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'photo_url'>
  ) {
    await delay(1000);

    const index = this.records.findIndex((product) => product.id === id);

    if (index === -1) {
      return {
        success: false,
        message: `Product with ID ${id} not found`
      };
    }

    this.records[index] = {
      ...this.records[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    return {
      success: true,
      message: 'Product updated successfully',
      product: this.records[index]
    };
  },

  async deleteProduct(id: number) {
    await delay(1000);

    const index = this.records.findIndex((product) => product.id === id);

    if (index === -1) {
      return { success: false, message: `Product with ID ${id} not found` };
    }

    this.records.splice(index, 1);

    return {
      success: true,
      message: 'Product deleted successfully'
    };
  }
};

fakeProducts.initialize();
