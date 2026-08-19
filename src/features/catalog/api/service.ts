import { delay, mockDb } from '@/constants/mock-db';
import type {
  CatalogFilters,
  CatalogProduct,
  CatalogProductResponse,
  CatalogProductsResponse
} from './types';

export const CATALOG_PAGE_SIZE = 10;
export const CATALOG_MAX_PAGES = 4;

let catalogProductsCache: CatalogProduct[] | null = null;

export async function getCatalogProducts(
  filters: CatalogFilters
): Promise<CatalogProductsResponse> {
  await delay(300);

  const page = clampPage(filters.page ?? 1);
  const search = filters.search?.trim().toLowerCase();
  let products = getStorefrontProducts().filter((product) => product.status !== 'Archived');

  if (search) {
    products = products.filter((product) =>
      [product.name, product.sku, product.description, product.categoryName].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }

  const totalProducts = Math.min(products.length, CATALOG_PAGE_SIZE * CATALOG_MAX_PAGES);
  const cappedProducts = products.slice(0, totalProducts);
  const offset = (page - 1) * CATALOG_PAGE_SIZE;

  return {
    products: cappedProducts.slice(offset, offset + CATALOG_PAGE_SIZE),
    total_products: totalProducts,
    page,
    page_size: CATALOG_PAGE_SIZE,
    max_pages: CATALOG_MAX_PAGES
  };
}

export async function getCatalogProductById(id: string): Promise<CatalogProductResponse> {
  await delay(300);

  const product = getStorefrontProducts().find((item) => item.id === id);

  if (!product) {
    throw new Error('Product not found');
  }

  return { product };
}

function clampPage(page: number) {
  return Math.min(Math.max(page, 1), CATALOG_MAX_PAGES);
}

function getStorefrontProducts(): CatalogProduct[] {
  catalogProductsCache ??= createCatalogProducts();
  return catalogProductsCache;
}

function createCatalogProducts(): CatalogProduct[] {
  return STOREFRONT_PRODUCT_SEED.map((product, index) => {
    const baseProduct = mockDb.products[index % mockDb.products.length];

    return {
      ...baseProduct,
      ...product,
      id: baseProduct.id,
      imageUrl: baseProduct.imageUrl,
      createdAt: baseProduct.createdAt,
      updatedAt: baseProduct.updatedAt ?? baseProduct.createdAt
    };
  });
}

const STOREFRONT_PRODUCT_SEED: Array<Omit<CatalogProduct, 'id' | 'createdAt' | 'updatedAt'>> = [
  {
    sku: 'APP-LIN-OVR',
    name: 'Everyday Linen Overshirt',
    categoryId: 'cat-6',
    categoryName: 'Apparel',
    brand: 'Northline Studio',
    price: 74,
    comparePrice: 96,
    cost: 31,
    currentStock: 84,
    minStock: 18,
    description: 'Breathable linen blend overshirt with a relaxed cut for daily layering.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/1.png',
    status: 'Active',
    featured: true
  },
  {
    sku: 'APP-DNM-JKT',
    name: 'Washed Denim Utility Jacket',
    categoryId: 'cat-6',
    categoryName: 'Apparel',
    brand: 'Harbor Goods',
    price: 118,
    comparePrice: 148,
    cost: 54,
    currentStock: 42,
    minStock: 12,
    description: 'Midweight denim jacket with reinforced pockets and a soft vintage wash.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/2.png',
    status: 'Active',
    featured: true
  },
  {
    sku: 'APP-WDE-TRS',
    name: 'Wide-Leg Tailored Trouser',
    categoryId: 'cat-6',
    categoryName: 'Apparel',
    brand: 'Aster Row',
    price: 89,
    comparePrice: 112,
    cost: 39,
    currentStock: 67,
    minStock: 14,
    description: 'Structured wide-leg trouser with a clean front and comfortable stretch waist.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/3.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'APP-RIB-TNK',
    name: 'Ribbed Cotton Tank Set',
    categoryId: 'cat-6',
    categoryName: 'Apparel',
    brand: 'Mika Basics',
    price: 38,
    comparePrice: 48,
    cost: 14,
    currentStock: 126,
    minStock: 24,
    description: 'Two-pack ribbed cotton tanks designed for warm weather and easy layering.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/4.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'SHO-LEA-SNK',
    name: 'Minimal Leather Sneaker',
    categoryId: 'cat-10',
    categoryName: 'Shoes',
    brand: 'Common Mile',
    price: 132,
    comparePrice: 165,
    cost: 63,
    currentStock: 58,
    minStock: 16,
    description: 'Low-profile leather sneaker with cushioned footbed and tonal stitching.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/5.png',
    status: 'Active',
    featured: true
  },
  {
    sku: 'SHO-ANK-BOT',
    name: 'Suede Ankle Boot',
    categoryId: 'cat-10',
    categoryName: 'Shoes',
    brand: 'Vale & Co.',
    price: 156,
    comparePrice: 188,
    cost: 72,
    currentStock: 35,
    minStock: 10,
    description: 'Soft suede ankle boot with stacked heel and weather-treated finish.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/6.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'ACC-CNV-TOT',
    name: 'Canvas Weekender Tote',
    categoryId: 'cat-6',
    categoryName: 'Accessories',
    brand: 'Portside Supply',
    price: 64,
    comparePrice: 82,
    cost: 26,
    currentStock: 91,
    minStock: 20,
    description: 'Durable canvas tote with interior laptop sleeve and zip-top closure.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/7.png',
    status: 'Active',
    featured: true
  },
  {
    sku: 'ACC-CRS-BDY',
    name: 'Compact Crossbody Bag',
    categoryId: 'cat-6',
    categoryName: 'Accessories',
    brand: 'Sora Atelier',
    price: 79,
    comparePrice: 98,
    cost: 34,
    currentStock: 73,
    minStock: 14,
    description: 'Structured crossbody bag with adjustable strap and secure magnetic flap.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/8.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'ACC-ACE-CAP',
    name: 'Washed Cotton Baseball Cap',
    categoryId: 'cat-6',
    categoryName: 'Accessories',
    brand: 'Field Notes',
    price: 29,
    comparePrice: 36,
    cost: 9,
    currentStock: 148,
    minStock: 30,
    description: 'Six-panel cotton cap with curved brim, brass buckle, and soft garment wash.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/9.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'JWL-HOP-GLD',
    name: 'Gold-Plated Hoop Earrings',
    categoryId: 'cat-4',
    categoryName: 'Jewelry',
    brand: 'Luma Fine',
    price: 46,
    comparePrice: 58,
    cost: 17,
    currentStock: 112,
    minStock: 22,
    description: 'Lightweight gold-plated hoops with hypoallergenic posts for everyday wear.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/10.png',
    status: 'Active',
    featured: true
  },
  {
    sku: 'JWL-CHR-NCK',
    name: 'Layered Charm Necklace',
    categoryId: 'cat-4',
    categoryName: 'Jewelry',
    brand: 'Luma Fine',
    price: 54,
    comparePrice: 68,
    cost: 21,
    currentStock: 65,
    minStock: 12,
    description: 'Two-strand charm necklace with adjustable clasp and polished pendant detail.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/11.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'BEA-SKN-SET',
    name: 'Daily Skincare Travel Set',
    categoryId: 'cat-14',
    categoryName: 'Beauty',
    brand: 'Nara Skin',
    price: 42,
    comparePrice: 55,
    cost: 16,
    currentStock: 88,
    minStock: 18,
    description: 'Travel-ready cleanser, serum, and moisturizer set for balanced daily care.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/12.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'BEA-MTE-LIP',
    name: 'Soft Matte Lip Trio',
    categoryId: 'cat-14',
    categoryName: 'Beauty',
    brand: 'Rose District',
    price: 36,
    comparePrice: 45,
    cost: 12,
    currentStock: 119,
    minStock: 26,
    description: 'Three wearable matte lip shades with a comfortable non-drying finish.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/13.png',
    status: 'Active',
    featured: true
  },
  {
    sku: 'HOM-CER-MUG',
    name: 'Hand-Glazed Ceramic Mug',
    categoryId: 'cat-11',
    categoryName: 'Home Goods',
    brand: 'Clayroom',
    price: 24,
    comparePrice: 32,
    cost: 8,
    currentStock: 96,
    minStock: 18,
    description: 'Stoneware mug with hand-glazed finish and comfortable oversized handle.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/14.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'HOM-LIN-THR',
    name: 'Textured Linen Throw',
    categoryId: 'cat-11',
    categoryName: 'Home Goods',
    brand: 'Casa Vale',
    price: 72,
    comparePrice: 90,
    cost: 29,
    currentStock: 44,
    minStock: 10,
    description: 'Soft linen-cotton throw blanket with textured weave and tasseled edges.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/15.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'ELC-TRV-STM',
    name: 'Portable Garment Steamer',
    categoryId: 'cat-2',
    categoryName: 'Consumer Goods',
    brand: 'Steamly',
    price: 59,
    comparePrice: 76,
    cost: 24,
    currentStock: 52,
    minStock: 14,
    description: 'Compact travel steamer for refreshing shirts, dresses, and outerwear fast.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/16.png',
    status: 'Active',
    featured: true
  },
  {
    sku: 'FIT-YGA-MAT',
    name: 'Non-Slip Yoga Mat',
    categoryId: 'cat-18',
    categoryName: 'Fitness',
    brand: 'Forma Active',
    price: 48,
    comparePrice: 60,
    cost: 19,
    currentStock: 77,
    minStock: 16,
    description: 'Cushioned yoga mat with grippy top layer and lightweight carry strap.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/17.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'KID-RAIN-SET',
    name: 'Kids Raincoat Set',
    categoryId: 'cat-7',
    categoryName: 'Kids',
    brand: 'Little Harbor',
    price: 68,
    comparePrice: 84,
    cost: 28,
    currentStock: 39,
    minStock: 10,
    description: 'Water-resistant hooded raincoat and matching pouch for school days.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/18.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'ACC-SIL-SCR',
    name: 'Silk Hair Scrunchie Pack',
    categoryId: 'cat-6',
    categoryName: 'Accessories',
    brand: 'Sora Atelier',
    price: 22,
    comparePrice: 28,
    cost: 7,
    currentStock: 156,
    minStock: 32,
    description: 'Five-piece silk scrunchie pack designed to reduce hair creasing and breakage.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/19.png',
    status: 'Active',
    featured: false
  },
  {
    sku: 'APP-MER-CAR',
    name: 'Merino Blend Cardigan',
    categoryId: 'cat-6',
    categoryName: 'Apparel',
    brand: 'Aster Row',
    price: 98,
    comparePrice: 124,
    cost: 43,
    currentStock: 61,
    minStock: 14,
    description: 'Soft merino blend cardigan with corozo buttons and a refined regular fit.',
    imageUrl: 'https://api.slingacademy.com/public/sample-products/20.png',
    status: 'Active',
    featured: true
  }
];
