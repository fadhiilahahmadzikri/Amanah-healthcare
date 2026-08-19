# Technical Specification
## Stock Management System — v1.0

---

## 1. Tech Stack

| Layer            | Technology                                      |
|------------------|-------------------------------------------------|
| Framework        | Next.js (App Router)                            |
| UI Components    | shadcn/ui + Tailwind CSS                        |
| Form Handling    | react-hook-form + zod                           |
| Charts           | recharts                                        |
| State Management | React Server Components + minimal client state  |
| ORM              | Prisma                                          |
| Database         | PostgreSQL                                      |
| Validation       | Zod (shared between client and server)          |

---

## 2. Database Schema

### 2.1 Entity Relationship Overview

```
categories ──┐
             │ (1:N)
           products ──┐
                      │ (1:N)
              stock_movements
                      │
              transaction_items ──── transactions
```

### 2.2 Table: `categories`

Organizes products into logical groups (business-agnostic).

```sql
CREATE TABLE categories (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100)  NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

| Column        | Type         | Constraints          | Notes                    |
|---------------|--------------|----------------------|--------------------------|
| `id`          | UUID         | PK, default          | Auto-generated UUID      |
| `name`        | VARCHAR(100) | NOT NULL, UNIQUE     | e.g., "Electronics", "Spare Parts" |
| `description` | TEXT         | nullable             | Optional explanation     |
| `created_at`  | TIMESTAMPTZ  | NOT NULL             |                          |
| `updated_at`  | TIMESTAMPTZ  | NOT NULL             | Trigger on update        |

---

### 2.3 Table: `products`

Core catalog. One row per unique item/SKU.

```sql
CREATE TABLE products (
  id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  sku           VARCHAR(100)   NOT NULL UNIQUE,
  name          VARCHAR(255)   NOT NULL,
  description   TEXT,
  category_id   UUID           REFERENCES categories(id) ON DELETE SET NULL,
  unit          VARCHAR(50)    NOT NULL DEFAULT 'pcs',
  buy_price     DECIMAL(15,2)  NOT NULL DEFAULT 0,
  sell_price    DECIMAL(15,2)  NOT NULL DEFAULT 0,
  current_stock INTEGER        NOT NULL DEFAULT 0,
  min_stock     INTEGER        NOT NULL DEFAULT 0,
  is_active     BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_sku      ON products(sku);
CREATE INDEX idx_products_name     ON products(name);
```

| Column          | Type          | Constraints             | Notes                                    |
|-----------------|---------------|-------------------------|------------------------------------------|
| `id`            | UUID          | PK                      |                                          |
| `sku`           | VARCHAR(100)  | NOT NULL, UNIQUE        | Stock Keeping Unit; user-defined or auto |
| `name`          | VARCHAR(255)  | NOT NULL                |                                          |
| `description`   | TEXT          | nullable                |                                          |
| `category_id`   | UUID          | FK → categories         | SET NULL on category delete              |
| `unit`          | VARCHAR(50)   | NOT NULL                | pcs, kg, liter, box, pair, etc.          |
| `buy_price`     | DECIMAL(15,2) | NOT NULL, ≥ 0           | Cost price per unit                      |
| `sell_price`    | DECIMAL(15,2) | NOT NULL, ≥ 0           | Sale price per unit                      |
| `current_stock` | INTEGER       | NOT NULL, ≥ 0           | Live stock count; updated by trigger     |
| `min_stock`     | INTEGER       | NOT NULL, ≥ 0           | Threshold for low-stock alert            |
| `is_active`     | BOOLEAN       | NOT NULL, DEFAULT TRUE  | Soft delete flag                         |

> **Note:** `current_stock` is the authoritative live count. It is **updated directly** by each stock movement operation inside a DB transaction to ensure atomicity.

---

### 2.4 Table: `stock_movements`

Immutable audit log of every change to a product's stock quantity.

```sql
CREATE TABLE stock_movements (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type             VARCHAR(30)  NOT NULL,
  quantity         INTEGER      NOT NULL,
  stock_before     INTEGER      NOT NULL,
  stock_after      INTEGER      NOT NULL,
  reference_type   VARCHAR(30),
  reference_id     UUID,
  note             TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_product    ON stock_movements(product_id);
CREATE INDEX idx_movements_type       ON stock_movements(type);
CREATE INDEX idx_movements_created    ON stock_movements(created_at DESC);
CREATE INDEX idx_movements_ref        ON stock_movements(reference_id) WHERE reference_id IS NOT NULL;
```

| Column           | Type         | Notes                                                               |
|------------------|--------------|---------------------------------------------------------------------|
| `id`             | UUID         | PK                                                                  |
| `product_id`     | UUID         | FK → products                                                       |
| `type`           | VARCHAR(30)  | See enum values above                                               |
| `quantity`       | INTEGER      | **Positive** = stock added; **Negative** = stock removed           |
| `stock_before`   | INTEGER      | `current_stock` before this movement                               |
| `stock_after`    | INTEGER      | `current_stock` after this movement                                |
| `reference_type` | VARCHAR(30)  | `'transaction'` or `'manual'` (nullable for manual ops)            |
| `reference_id`   | UUID         | FK to `transactions.id` when applicable                            |
| `note`           | TEXT         | Free text; required for adjustments and manual out                 |

---

### 2.5 Table: `transactions`

Header record for each sale or purchase session.

```sql
CREATE TABLE transactions (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number  VARCHAR(50)    NOT NULL UNIQUE,
  type                VARCHAR(20)    NOT NULL CHECK (type IN ('sale', 'purchase')),
  status              VARCHAR(20)    NOT NULL DEFAULT 'completed'
                                     CHECK (status IN ('completed', 'cancelled')),
  total_amount        DECIMAL(15,2)  NOT NULL DEFAULT 0,
  cash_tendered       DECIMAL(15,2),
  change_amount       DECIMAL(15,2),
  note                TEXT,
  transaction_date    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_number ON transactions(transaction_number);
CREATE INDEX idx_transactions_type   ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date   ON transactions(transaction_date DESC);
```

| Column               | Type          | Notes                                        |
|----------------------|---------------|----------------------------------------------|
| `id`                 | UUID          | PK                                           |
| `transaction_number` | VARCHAR(50)   | Auto-generated: `TXN-YYYYMMDD-NNNN`         |
| `type`               | VARCHAR(20)   | `'sale'` or `'purchase'`                    |
| `status`             | VARCHAR(20)   | `'completed'` or `'cancelled'`              |
| `total_amount`       | DECIMAL(15,2) | Sum of all line item subtotals               |
| `cash_tendered`      | DECIMAL(15,2) | For sales only; how much customer paid       |
| `change_amount`      | DECIMAL(15,2) | `cash_tendered - total_amount` (sales only)  |
| `note`               | TEXT          | Optional transaction note                   |
| `transaction_date`   | TIMESTAMPTZ   | Effective date (can be overridden)           |

---

### 2.6 Table: `transaction_items`

Line items within a transaction. Immutable once created.

```sql
CREATE TABLE transaction_items (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID           NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id     UUID           NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity       INTEGER        NOT NULL CHECK (quantity > 0),
  unit_price     DECIMAL(15,2)  NOT NULL,
  subtotal       DECIMAL(15,2)  NOT NULL,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_items_product     ON transaction_items(product_id);
```

| Column           | Type          | Notes                                           |
|------------------|---------------|-------------------------------------------------|
| `id`             | UUID          | PK                                              |
| `transaction_id` | UUID          | FK → transactions                               |
| `product_id`     | UUID          | FK → products (RESTRICT: cannot delete product if it has transaction history) |
| `quantity`       | INTEGER       | Must be > 0                                     |
| `unit_price`     | DECIMAL(15,2) | Price snapshotted at time of transaction        |
| `subtotal`       | DECIMAL(15,2) | `quantity × unit_price`; stored for integrity   |

---

### 2.7 Prisma Schema (Complete)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Category {
  id          String    @id @default(uuid())
  name        String    @unique @db.VarChar(100)
  description String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  products    Product[]

  @@map("categories")
}

model Product {
  id             String           @id @default(uuid())
  sku            String           @unique @db.VarChar(100)
  name           String           @db.VarChar(255)
  description    String?
  category       Category?        @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  categoryId     String?          @map("category_id")
  unit           String           @default("pcs") @db.VarChar(50)
  buyPrice       Decimal          @default(0) @map("buy_price") @db.Decimal(15, 2)
  sellPrice      Decimal          @default(0) @map("sell_price") @db.Decimal(15, 2)
  currentStock   Int              @default(0) @map("current_stock")
  minStock       Int              @default(0) @map("min_stock")
  isActive       Boolean          @default(true) @map("is_active")
  createdAt      DateTime         @default(now()) @map("created_at")
  updatedAt      DateTime         @updatedAt @map("updated_at")
  stockMovements StockMovement[]
  transactionItems TransactionItem[]

  @@index([categoryId])
  @@index([sku])
  @@map("products")
}

model StockMovement {
  id             String   @id @default(uuid())
  product        Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId      String   @map("product_id")
  type           String   @db.VarChar(30)
  quantity       Int
  stockBefore    Int      @map("stock_before")
  stockAfter     Int      @map("stock_after")
  referenceType  String?  @map("reference_type") @db.VarChar(30)
  referenceId    String?  @map("reference_id")
  note           String?
  createdAt      DateTime @default(now()) @map("created_at")

  @@index([productId])
  @@index([createdAt(sort: Desc)])
  @@map("stock_movements")
}

model Transaction {
  id                String            @id @default(uuid())
  transactionNumber String            @unique @map("transaction_number") @db.VarChar(50)
  type              String            @db.VarChar(20)
  status            String            @default("completed") @db.VarChar(20)
  totalAmount       Decimal           @default(0) @map("total_amount") @db.Decimal(15, 2)
  cashTendered      Decimal?          @map("cash_tendered") @db.Decimal(15, 2)
  changeAmount      Decimal?          @map("change_amount") @db.Decimal(15, 2)
  note              String?
  transactionDate   DateTime          @default(now()) @map("transaction_date")
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")
  items             TransactionItem[]

  @@index([transactionDate(sort: Desc)])
  @@map("transactions")
}

model TransactionItem {
  id            String      @id @default(uuid())
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  transactionId String      @map("transaction_id")
  product       Product     @relation(fields: [productId], references: [id], onDelete: Restrict)
  productId     String      @map("product_id")
  quantity      Int
  unitPrice     Decimal     @map("unit_price") @db.Decimal(15, 2)
  subtotal      Decimal     @db.Decimal(15, 2)
  createdAt     DateTime    @default(now()) @map("created_at")

  @@index([transactionId])
  @@index([productId])
  @@map("transaction_items")
}
```

---

## 3. API Route Map

All routes live under `app/api/`. Responses follow a consistent envelope:

```ts

{ success: true, data: T }

{ success: false, error: string, code?: string }
```

### 3.1 Products

| Method | Route                        | Description                                      |
|--------|------------------------------|--------------------------------------------------|
| GET    | `/api/products`              | List products (paginated, searchable, filterable)|
| POST   | `/api/products`              | Create new product                               |
| GET    | `/api/products/:id`          | Get single product detail                        |
| PATCH  | `/api/products/:id`          | Update product fields                            |
| DELETE | `/api/products/:id`          | Soft-delete product (`is_active = false`)        |
| GET    | `/api/products/:id/movements`| Get stock movement history for a product         |

**GET `/api/products` Query Params:**

| Param        | Type    | Description                                   |
|--------------|---------|-----------------------------------------------|
| `search`     | string  | Filter by name or SKU (ILIKE)                 |
| `categoryId` | UUID    | Filter by category                            |
| `status`     | string  | `ok` / `low` / `out`                         |
| `page`       | number  | Page number (default: 1)                      |
| `limit`      | number  | Items per page (default: 20, max: 100)        |
| `sortBy`     | string  | `name` / `currentStock` / `createdAt`         |
| `sortDir`    | string  | `asc` / `desc`                               |

---

### 3.2 Categories

| Method | Route                 | Description               |
|--------|-----------------------|---------------------------|
| GET    | `/api/categories`     | List all categories       |
| POST   | `/api/categories`     | Create category           |
| PATCH  | `/api/categories/:id` | Rename / update           |
| DELETE | `/api/categories/:id` | Delete (guard if products)|

---

### 3.3 Stock Operations

| Method | Route                    | Description                                  |
|--------|--------------------------|----------------------------------------------|
| POST   | `/api/stock/in`          | Record stock in for one or more products     |
| POST   | `/api/stock/out`         | Record manual stock out                      |
| POST   | `/api/stock/adjustment`  | Record physical count adjustment             |
| GET    | `/api/stock/movements`   | List all movements (filterable)              |

**POST `/api/stock/in` Request Body:**

```json
{
  "entries": [
    {
      "productId": "uuid",
      "quantity": 50,
      "note": "Delivery from supplier"
    }
  ],
  "date": "2024-06-01T00:00:00Z"
}
```

**POST `/api/stock/adjustment` Request Body:**

```json
{
  "productId": "uuid",
  "physicalCount": 43,
  "note": "Physical stock count — June 2024"
}
```

---

### 3.4 Transactions

| Method | Route                          | Description                                  |
|--------|--------------------------------|----------------------------------------------|
| GET    | `/api/transactions`            | List transactions (filterable, paginated)    |
| POST   | `/api/transactions`            | Create new transaction (sale or purchase)    |
| GET    | `/api/transactions/:id`        | Get full transaction detail with items       |
| PATCH  | `/api/transactions/:id/cancel` | Cancel transaction + reverse stock           |

**GET `/api/transactions` Query Params:**

| Param      | Type    | Description                                   |
|------------|---------|-----------------------------------------------|
| `type`     | string  | `sale` / `purchase`                          |
| `status`   | string  | `completed` / `cancelled`                    |
| `from`     | date    | Start of date range (transaction_date)        |
| `to`       | date    | End of date range                             |
| `search`   | string  | Search by transaction number                  |
| `page`     | number  | Default: 1                                    |
| `limit`    | number  | Default: 20                                   |

**POST `/api/transactions` Request Body:**

```json
{
  "type": "sale",
  "items": [
    { "productId": "uuid", "quantity": 3, "unitPrice": 15000 },
    { "productId": "uuid", "quantity": 1, "unitPrice": 85000 }
  ],
  "cashTendered": 150000,
  "note": "Walk-in customer",
  "transactionDate": "2024-06-01T10:30:00Z"
}
```

---

### 3.5 Reports

| Method | Route                    | Description                                  |
|--------|--------------------------|----------------------------------------------|
| GET    | `/api/reports/summary`   | Dashboard stats (products, sales, low stock) |
| GET    | `/api/reports/sales`     | Sales report (grouped by day/week/month)     |
| GET    | `/api/reports/stock`     | Stock value and movement summary             |
| GET    | `/api/reports/top-products` | Top products by qty sold / revenue        |

**GET `/api/reports/summary` Response:**

```json
{
  "totalProducts": 142,
  "lowStockCount": 7,
  "outOfStockCount": 2,
  "todaySalesTotal": 875000,
  "todaySalesCount": 12,
  "monthSalesTotal": 18350000,
  "recentTransactions": [...],
  "lowStockProducts": [...]
}
```

---

## 4. Business Logic Rules

### 4.1 Stock Constraints

```
Rule 1: current_stock MUST NEVER go below 0.
  → API must check: (current_stock - requested_qty) >= 0 before any stock-out or sale.
  → If violated: return HTTP 422 with error code "INSUFFICIENT_STOCK".

Rule 2: quantity in any operation must be > 0.
  → Enforced by Zod schema at API layer.

Rule 3: All stock changes MUST be wrapped in a DB transaction (Prisma.$transaction).
  → This ensures product.current_stock and stock_movements are always in sync.
```

### 4.2 Transaction Number Generation

Auto-generated in format: `TXN-YYYYMMDD-NNNN`

```ts
async function generateTransactionNumber(date: Date): Promise<string> {
  const datePart = format(date, 'yyyyMMdd');
  const prefix = `TXN-${datePart}-`;

  const last = await prisma.transaction.findFirst({
    where: { transactionNumber: { startsWith: prefix } },
    orderBy: { transactionNumber: 'desc' },
  });

  const seq = last
    ? parseInt(last.transactionNumber.split('-')[2]) + 1
    : 1;

  return `${prefix}${String(seq).padStart(4, '0')}`;
}

```

### 4.3 Create Sale Transaction (Atomic Flow)

```
Input: { type: 'sale', items: [...], cashTendered, note, transactionDate }

1. Validate all items (productId exists, quantity > 0, sell_price matches)
2. Check stock availability for each item:
   → product.current_stock >= item.quantity (for each item)
   → If any fails: abort with INSUFFICIENT_STOCK error
3. Start DB transaction (prisma.$transaction):
   a. Generate transaction number
   b. INSERT into transactions (status='completed')
   c. For each item:
      - INSERT into transaction_items
      - READ current product.current_stock (for snapshot)
      - UPDATE products SET current_stock = current_stock - quantity
      - INSERT into stock_movements:
          type='sale', quantity=-item.quantity,
          stock_before, stock_after, reference_type='transaction',
          reference_id=transaction.id
4. Commit. Return created transaction with items.
```

### 4.4 Cancel Transaction (Atomic Reversal)

```
Input: transactionId

1. Load transaction; ensure status = 'completed'
2. Start DB transaction:
   a. For each transaction_item:
      - READ current product.current_stock
      - UPDATE products SET current_stock = current_stock + qty  (for sale)
                         OR current_stock = current_stock - qty  (for purchase)
      - INSERT into stock_movements:
          type='reversal', quantity=+item.qty (sale) or -item.qty (purchase),
          stock_before, stock_after, reference_type='transaction',
          reference_id=transaction.id, note='Reversal of TXN-...'
   b. UPDATE transactions SET status = 'cancelled'
3. Commit. Return updated transaction.
```

### 4.5 Stock Adjustment Logic

```
Input: { productId, physicalCount, note }

1. Load product.current_stock
2. difference = physicalCount - current_stock
   → If difference == 0: no-op (return success, no movement created)
3. Start DB transaction:
   a. UPDATE products SET current_stock = physicalCount
   b. INSERT into stock_movements:
       type='adjustment',
       quantity=difference,      ← positive or negative
       stock_before=current_stock,
       stock_after=physicalCount,
       note=note
4. Commit.
```

### 4.6 SKU Auto-Generation (Optional)

If user leaves SKU blank, generate one:

```ts
function generateSku(productName: string): string {
  const prefix = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4)
    .padEnd(4, 'X');

  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${suffix}`;
}

```

### 4.7 Low Stock Detection

A product is considered low stock when:

```
product.current_stock > 0 AND product.current_stock <= product.min_stock
```

A product is out of stock when:

```
product.current_stock === 0
```

These are computed at query time — no separate flag stored.

---

## 5. Zod Validation Schemas

```ts

export const createProductSchema = z.object({
  sku: z.string().max(100).optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  unit: z.string().min(1).max(50),
  buyPrice: z.number().min(0),
  sellPrice: z.number().min(0),
  initialStock: z.number().int().min(0),
  minStock: z.number().int().min(0).default(0),
});

export const stockInSchema = z.object({
  entries: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    note: z.string().optional(),
  })).min(1),
  date: z.string().datetime().optional(),
});

export const adjustmentSchema = z.object({
  productId: z.string().uuid(),
  physicalCount: z.number().int().min(0),
  note: z.string().min(3, "Adjustment reason is required"),
});

export const createTransactionSchema = z.object({
  type: z.enum(['sale', 'purchase']),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().min(0),
  })).min(1),
  cashTendered: z.number().min(0).optional(),
  note: z.string().optional(),
  transactionDate: z.string().datetime().optional(),
});
```

---

## 6. Error Codes Reference

| HTTP Status | Code                   | Meaning                                    |
|-------------|------------------------|--------------------------------------------|
| 400         | `VALIDATION_ERROR`     | Zod schema failed                          |
| 404         | `NOT_FOUND`            | Resource ID does not exist                 |
| 409         | `DUPLICATE_SKU`        | SKU already exists                         |
| 409         | `CATEGORY_HAS_PRODUCTS`| Cannot delete category with products       |
| 422         | `INSUFFICIENT_STOCK`   | Stock-out would result in negative stock   |
| 422         | `ALREADY_CANCELLED`    | Transaction already cancelled              |
| 500         | `INTERNAL_ERROR`       | Unexpected server error                    |

---

## 7. Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stockdb"

# App
NEXT_PUBLIC_APP_NAME="StockSense"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: timezone for transaction number date part
TZ="Asia/Jakarta"
```

---

## 8. Folder Structure (Next.js App Router)

```
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   ├── products/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── edit/page.tsx
│   ├── categories/page.tsx
│   ├── stock/
│   │   ├── page.tsx
│   │   ├── in/page.tsx
│   │   ├── out/page.tsx
│   │   └── adjustment/page.tsx
│   ├── transactions/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── reports/page.tsx
│   └── api/
│       ├── products/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── movements/route.ts
│       ├── categories/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── stock/
│       │   ├── in/route.ts
│       │   ├── out/route.ts
│       │   ├── adjustment/route.ts
│       │   └── movements/route.ts
│       ├── transactions/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── cancel/route.ts
│       └── reports/
│           ├── summary/route.ts
│           ├── sales/route.ts
│           ├── stock/route.ts
│           └── top-products/route.ts
├── components/
│   ├── ui/                          ← shadcn generated components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── nav-items.ts
│   ├── products/
│   │   ├── product-table.tsx
│   │   ├── product-form.tsx
│   │   └── product-detail.tsx
│   ├── stock/
│   │   ├── stock-in-form.tsx
│   │   ├── stock-out-form.tsx
│   │   ├── adjustment-form.tsx
│   │   └── movement-table.tsx
│   ├── transactions/
│   │   ├── transaction-table.tsx
│   │   ├── pos-form.tsx
│   │   └── invoice-view.tsx
│   └── dashboard/
│       ├── stats-cards.tsx
│       ├── low-stock-list.tsx
│       └── recent-transactions.tsx
├── lib/
│   ├── prisma.ts                    ← singleton Prisma client
│   ├── validations/                 ← Zod schemas
│   ├── utils.ts                     ← shadcn cn() + helpers
│   └── transaction-number.ts        ← generateTransactionNumber()
├── hooks/
│   ├── use-products.ts
│   ├── use-transactions.ts
│   └── use-stock.ts
└── types/
    └── index.ts                     ← shared TypeScript types
```
