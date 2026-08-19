const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const file = path.join(__dirname, '../src/constants/mock-db.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Rewrite Products
const CATEGORIES = ['cat-1', 'cat-2', 'cat-3', 'cat-4', 'cat-5'];
const STATUSES = ['Active', 'Draft', 'Archived'];

let productsStr = 'const PRODUCTS: Product[] = [\n';
for (let i = 1; i <= 25; i++) {
  const isShoes = Math.random() > 0.5;
  const category = isShoes ? 'shoes' : 'clothes';
  
  productsStr += `  {
    id: 'prod-${i}',
    sku: '${faker.string.alphanumeric({ length: 8, casing: 'upper' })}',
    name: '${faker.commerce.productName()}',
    categoryId: '${CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]}',
    price: ${faker.commerce.price({ min: 10, max: 500, dec: 2 })},
    cost: ${faker.commerce.price({ min: 5, max: 100, dec: 2 })},
    currentStock: ${faker.number.int({ min: 0, max: 1000 })},
    minStock: ${faker.number.int({ min: 10, max: 50 })},
    description: '${faker.commerce.productDescription().replace(/'/g, "\\'")}',
    imageUrl: '${faker.image.urlPicsumPhotos({ width: 500, height: 500, blur: 0, grayscale: false })}',
    createdAt: '${faker.date.past({ years: 1 }).toISOString()}',
    status: '${STATUSES[Math.floor(Math.random() * STATUSES.length)]}'
  }${i === 25 ? '' : ','}\n`;
}
productsStr += '];';

content = content.replace(/const PRODUCTS: Product\[\] = \[[\s\S]*?\];/, productsStr);

// 2. Rewrite Orders
const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const PAYMENT_METHODS = ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];

let ordersStr = 'const ORDERS: Order[] = [\n';
let orderCount = 1;
// Generate for each month of 2026
for (let month = 0; month < 12; month++) {
  const numOrdersThisMonth = Math.floor(Math.random() * 10) + 15; // 15 to 24 orders per month
  for (let i = 0; i < numOrdersThisMonth; i++) {
    const day = Math.floor(Math.random() * 28) + 1; // 1 to 28
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    const date = new Date(Date.UTC(2026, month, day, hour, minute));
    
    // random items
    const numItems = Math.floor(Math.random() * 3) + 1;
    let itemsStr = '[\n';
    let totalAmt = 0;
    for (let j=0; j<numItems; j++) {
      const q = Math.floor(Math.random() * 3) + 1;
      const up = Math.floor(Math.random() * 100) + 10;
      const st = q * up;
      totalAmt += st;
      itemsStr += `      {
        id: 'ti-${faker.string.uuid()}',
        productId: 'prod-${Math.floor(Math.random() * 25) + 1}',
        quantity: ${q},
        unitPrice: ${up},
        subtotal: ${st}
      }${j === numItems - 1 ? '' : ','}\n`;
    }
    itemsStr += '    ]';

    ordersStr += `  {
    id: 'ord-${orderCount}',
    orderNumber: 'ORD-${String(orderCount).padStart(3, '0')}',
    customerId: 'cust-${Math.floor(Math.random() * 20) + 1}',
    customerName: '${faker.person.fullName().replace(/'/g, "\\'")}',
    customerPhone: '${faker.phone.number()}',
    customerAddress: '${faker.location.streetAddress().replace(/'/g, "\\'")}',
    customerAvatarUrl: '${faker.image.avatar()}',
    totalAmount: ${totalAmt},
    paymentMethod: '${PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)]}',
    paymentStatus: '${Math.random() > 0.2 ? 'PAID' : 'PENDING'}',
    status: '${ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)]}',
    trackingNumber: '${faker.string.alphanumeric({ length: 10, casing: 'upper' })}',
    items: ${itemsStr},
    createdAt: '${date.toISOString()}',
    updatedAt: '${new Date(date.getTime() + 86400000).toISOString()}'
  }${month === 11 && i === numOrdersThisMonth - 1 ? '' : ','}\n`;
    orderCount++;
  }
}

ordersStr += '];';

content = content.replace(/const ORDERS: Order\[\] = \[[\s\S]*?\];/, ordersStr);

fs.writeFileSync(file, content);
console.log('Successfully rewrote mock-db.ts');
