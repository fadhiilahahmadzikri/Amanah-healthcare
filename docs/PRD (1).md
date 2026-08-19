# Product Requirements Document
## Stock Management System — v1.0

---

## 1. Product Overview

### 1.1 Vision

A lightweight, **business-agnostic** inventory management system that any merchant can use regardless of what they sell — automotive spare parts, groceries, books, electronics, clothing, or anything else. The system focuses exclusively on **stock management and transaction recording**, with no user management or multi-tenant complexity.

### 1.2 Problem Statement

Small and medium business owners often track inventory manually using spreadsheets or paper notes. This leads to:

- Unknown or inaccurate stock counts
- No visibility into stock movement history
- Unable to trace when stock was added or sold
- No simple cashier/sales recording
- Missing income vs. expense tracking per product

### 1.3 Product Scope

**In Scope:**
- Product catalog management (CRUD)
- Category management (CRUD)
- Stock tracking (in, out, manual adjustment)
- Sales transaction recording (cashier mode)
- Purchase/restock transaction recording
- Stock movement history per product
- Invoice/receipt per transaction
- Dashboard with key metrics
- Low-stock alerts
- Basic reports (sales, stock, movements)

**Out of Scope:**
- User authentication / multi-user / roles
- Multi-warehouse / multi-location
- Supplier management
- Customer CRM
- Accounting / bookkeeping integration
- E-commerce / online storefront

---

## 2. User Persona

Since there is no user management, the system operates as a **single-user local tool**.

| Attribute     | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| **Name**      | The Store Owner / Operator                                                  |
| **Role**      | Anyone running a stock-based business                                       |
| **Goal**      | Know exactly what's in stock, record sales, track restock, see history      |
| **Pain Point**| Loses track of stock, forgets to reorder, can't trace shrinkage             |
| **Tech Level**| Non-technical; expects clean UI with minimal learning curve                 |

---

## 3. User Stories

### 3.1 Product Management

| ID   | User Story                                                                                                                   | Priority |
|------|------------------------------------------------------------------------------------------------------------------------------|----------|
| P-01 | As a store owner, I want to **add a new product** with name, SKU, category, price, unit, and starting stock so I can track it. | High     |
| P-02 | As a store owner, I want to **view all my products** in a searchable, filterable list so I can quickly find what I need.      | High     |
| P-03 | As a store owner, I want to **edit product details** (price, name, min stock threshold) so I can keep information accurate.  | High     |
| P-04 | As a store owner, I want to **delete a product** that I no longer sell, with a safeguard to prevent accidental deletion.     | Medium   |
| P-05 | As a store owner, I want to **view a product's detail page** including current stock, movement history, and price info.      | High     |
| P-06 | As a store owner, I want to **set a minimum stock threshold** per product so I can receive low-stock alerts.                 | Medium   |

### 3.2 Category Management

| ID   | User Story                                                                                                                   | Priority |
|------|------------------------------------------------------------------------------------------------------------------------------|----------|
| C-01 | As a store owner, I want to **create product categories** so I can organize my product catalog.                              | Medium   |
| C-02 | As a store owner, I want to **view all categories** and see how many products are in each.                                   | Medium   |
| C-03 | As a store owner, I want to **rename or delete categories** as my catalog evolves.                                           | Low      |

### 3.3 Stock Management

| ID   | User Story                                                                                                                   | Priority |
|------|------------------------------------------------------------------------------------------------------------------------------|----------|
| S-01 | As a store owner, I want to **record incoming stock** (restock/purchase) for one or more products so my stock count updates. | High     |
| S-02 | As a store owner, I want to **record outgoing stock** (manual stock-out) for a product without making a sales transaction.  | High     |
| S-03 | As a store owner, I want to **manually adjust stock** (e.g., after a physical count) and provide a reason for the change.   | High     |
| S-04 | As a store owner, I want to **view the full movement history** of a product (all ins, outs, and adjustments) with timestamps.| High     |
| S-05 | As a store owner, I want to see a **stock overview page** with current stock levels for all products, sortable by quantity.  | High     |
| S-06 | As a store owner, I want to **see which products are low on stock** (below minimum threshold) highlighted or grouped.        | Medium   |

### 3.4 Transactions (Sales & Purchases)

| ID   | User Story                                                                                                                   | Priority |
|------|------------------------------------------------------------------------------------------------------------------------------|----------|
| T-01 | As a store owner, I want to **create a sales transaction** by adding products to a cart, entering quantities, and confirming. | High     |
| T-02 | As a store owner, I want to **create a purchase transaction** (restocking via supplier) so the stock increases automatically.| High     |
| T-03 | As a store owner, I want to **view a list of all transactions** (sales & purchases) with date, type, and total amount.       | High     |
| T-04 | As a store owner, I want to **view a transaction detail/invoice** showing all items, quantities, prices, and totals.         | High     |
| T-05 | As a store owner, I want to **cancel a transaction** (that was entered by mistake) and have stock automatically reversed.    | Medium   |
| T-06 | As a store owner, I want to **print or export an invoice** for a completed sales transaction.                                | Medium   |
| T-07 | As a store owner, I want transactions to be **auto-numbered** (e.g., TXN-20240601-001) for easy reference.                  | Medium   |

### 3.5 Dashboard & Reporting

| ID   | User Story                                                                                                                   | Priority |
|------|------------------------------------------------------------------------------------------------------------------------------|----------|
| D-01 | As a store owner, I want a **dashboard home page** showing total products, today's sales, low-stock alerts, and recent activity. | High  |
| D-02 | As a store owner, I want to see a **sales summary** (daily, weekly, monthly) so I understand my income trend.                | Medium   |
| D-03 | As a store owner, I want to see a **stock movement report** filterable by product, date range, and movement type.             | Medium   |
| D-04 | As a store owner, I want to see **top-selling products** by quantity and revenue so I know which items move fastest.          | Low      |

---

## 4. Feature Map (CRUD Level)

| Feature Module        | Create | Read | Update | Delete | Notes                                                     |
|-----------------------|--------|------|--------|--------|-----------------------------------------------------------|
| **Product**           | ✅     | ✅   | ✅     | ✅     | Soft-delete or guard when stock movement exists           |
| **Category**          | ✅     | ✅   | ✅     | ✅     | Guard delete if products exist under category             |
| **Stock Movement**    | ✅     | ✅   | ❌     | ❌     | Immutable audit log; auto-created by stock actions        |
| **Stock In**          | ✅     | ✅   | ❌     | ❌     | Creates movement + optionally creates purchase transaction|
| **Stock Out**         | ✅     | ✅   | ❌     | ❌     | Creates movement record; manual (no transaction)          |
| **Stock Adjustment**  | ✅     | ✅   | ❌     | ❌     | Creates movement with before/after values + reason        |
| **Transaction**       | ✅     | ✅   | ⚠️    | ❌     | Update = cancel only; triggers stock reversal             |
| **Transaction Item**  | ✅     | ✅   | ❌     | ❌     | Immutable once transaction is created                     |
| **Invoice**           | —      | ✅   | ❌     | ❌     | Read-only derived view of a completed transaction         |

---

## 5. Page & Route Map

All pages are built with **Next.js App Router** (`/app` directory).

### 5.1 Route Structure

```
app/
├── page.tsx                           → Dashboard
├── products/
│   ├── page.tsx                       → Product List
│   ├── new/
│   │   └── page.tsx                   → Add New Product
│   └── [id]/
│       ├── page.tsx                   → Product Detail
│       └── edit/
│           └── page.tsx               → Edit Product
├── categories/
│   └── page.tsx                       → Category List (manage inline via modal)
├── stock/
│   ├── page.tsx                       → Stock Overview (all products + levels)
│   ├── in/
│   │   └── page.tsx                   → Record Stock In
│   ├── out/
│   │   └── page.tsx                   → Record Stock Out (manual)
│   └── adjustment/
│       └── page.tsx                   → Manual Stock Adjustment
├── transactions/
│   ├── page.tsx                       → Transaction List (sales + purchases)
│   ├── new/
│   │   └── page.tsx                   → New Transaction (POS / cashier view)
│   └── [id]/
│       └── page.tsx                   → Transaction Detail + Invoice View
└── reports/
    └── page.tsx                       → Reports & Analytics
```

---

## 6. Page Specifications

### 6.1 Dashboard (`/`)

**Purpose:** High-level overview of business health.

**Content:**
- Summary cards: Total Products, Low Stock Items, Today's Sales, Total Transactions This Month
- Recent Transactions table (last 10)
- Low Stock Alert list (products below min threshold)
- Stock Movement sparkline (last 7 days in vs. out)

**shadcn Components:**
| Element                | shadcn Component        |
|------------------------|-------------------------|
| Summary stat cards     | `Card`, `CardContent`   |
| Low stock badges       | `Badge` (destructive)   |
| Recent transactions    | `Table`                 |
| Movement chart         | recharts via `Card`     |
| Alert section          | `Alert`, `AlertTitle`   |

---

### 6.2 Product List (`/products`)

**Purpose:** Browse, search, and manage all products.

**Content:**
- Search input (filter by name or SKU)
- Filter by category (`Select`)
- Filter by stock status (all / low stock / out of stock)
- Paginated data table (Name, SKU, Category, Unit, Sell Price, Current Stock, Status, Actions)
- Action buttons per row: View, Edit, Delete
- Floating "Add Product" button

**shadcn Components:**
| Element                | shadcn Component                  |
|------------------------|-----------------------------------|
| Search input           | `Input`                           |
| Category filter        | `Select`                          |
| Stock status filter    | `ToggleGroup` or `Select`         |
| Product table          | `Table`, `TableRow`, `TableCell`  |
| Status badge           | `Badge`                           |
| Delete confirmation    | `AlertDialog`                     |
| Add button             | `Button`                          |
| Pagination             | `Pagination`                      |

---

### 6.3 Add New Product (`/products/new`)

**Purpose:** Form to register a new product in the system.

**Content:**
- Form fields: Name, SKU (auto-suggested or manual), Category (with inline add), Unit, Buy Price, Sell Price, Initial Stock, Min Stock (threshold), Description (optional)
- Submit and Cancel buttons

**shadcn Components:**
| Element                | shadcn Component              |
|------------------------|-------------------------------|
| Form wrapper           | `Form` (react-hook-form)      |
| Text fields            | `Input`, `FormField`          |
| Category dropdown      | `Select` + `Combobox`         |
| Price inputs           | `Input` (type number)         |
| Description            | `Textarea`                    |
| Validation messages    | `FormMessage`                 |
| Action buttons         | `Button`                      |

---

### 6.4 Product Detail (`/products/[id]`)

**Purpose:** View all information and history for a specific product.

**Content:**
- Product info section (name, SKU, category, unit, prices, current stock, min threshold)
- Current stock counter (prominent display)
- Stock status badge (OK / Low / Out)
- Quick action buttons: Edit, Stock In, Stock Out, Adjust
- Stock Movement History table (date, type, qty, before, after, note, reference)
- Filter movement history by date range and type

**shadcn Components:**
| Element                | shadcn Component                       |
|------------------------|----------------------------------------|
| Product info card      | `Card`                                 |
| Stock counter display  | `Card` with large typography           |
| Status badge           | `Badge`                                |
| Quick actions          | `Button`, `DropdownMenu`               |
| Movement history table | `Table`                                |
| Date range filter      | `DatePickerWithRange`                  |
| Movement type filter   | `Select`                               |

---

### 6.5 Edit Product (`/products/[id]/edit`)

**Purpose:** Modify an existing product's attributes.

**Content:** Same as Add Product form, pre-filled with existing values. SKU is read-only after creation.

---

### 6.6 Category Management (`/categories`)

**Purpose:** View and manage product categories.

**Content:**
- Category list table (Name, Product Count, Created At, Actions)
- Inline add/edit via Dialog modal
- Delete with guard if products exist

**shadcn Components:**
| Element                | shadcn Component           |
|------------------------|----------------------------|
| Category table         | `Table`                    |
| Add/edit modal         | `Dialog`, `DialogContent`  |
| Form fields            | `Input`, `Textarea`        |
| Delete guard           | `AlertDialog`              |

---

### 6.7 Stock Overview (`/stock`)

**Purpose:** See the current inventory level for all products at a glance.

**Content:**
- Summary: Total SKUs, Total Stock Value (buy price × qty), Low Stock Count
- Full table: Product, Category, Unit, Current Stock, Min Threshold, Status, Last Movement
- Filter: Category, Status (OK / Low / Out)
- Sort: by stock level (ascending for low-first prioritization)

**shadcn Components:**
| Element                | shadcn Component          |
|------------------------|---------------------------|
| Summary cards          | `Card`                    |
| Stock table            | `Table`                   |
| Status badges          | `Badge`                   |
| Filters                | `Select`, `ToggleGroup`   |

---

### 6.8 Stock In (`/stock/in`)

**Purpose:** Record incoming stock for one or more products in one session.

**Content:**
- Multi-product entry table (select product, enter quantity, note)
- Add row button
- Date override (defaults to today)
- Reference note (e.g., delivery note number)
- Confirm/Submit

**shadcn Components:**
| Element                | shadcn Component              |
|------------------------|-------------------------------|
| Product selector       | `Combobox` (searchable)       |
| Quantity input         | `Input` (type number)         |
| Add row                | `Button`                      |
| Date override          | `DatePicker`                  |
| Reference note         | `Input`                       |
| Submit                 | `Button`                      |

---

### 6.9 Stock Out (`/stock/out`)

**Purpose:** Record manual stock removal (e.g., damaged goods, internal use).

**Content:** Same form structure as Stock In, with a reason field (dropdown: Damaged, Internal Use, Expired, Other).

**shadcn Components:** Same as Stock In, plus `Select` for reason.

---

### 6.10 Stock Adjustment (`/stock/adjustment`)

**Purpose:** Correct stock level after a physical stocktake.

**Content:**
- Select product
- Current stock (read-only, shown from DB)
- Physical count (enter actual count)
- System calculates difference automatically (e.g., +3 or -2)
- Required reason/note
- Confirm

**shadcn Components:**
| Element                | shadcn Component            |
|------------------------|-----------------------------|
| Product selector       | `Combobox`                  |
| Current stock display  | Read-only `Input` or text   |
| Physical count input   | `Input`                     |
| Difference display     | Computed text with `Badge`  |
| Reason note            | `Textarea`                  |
| Confirm button         | `Button`                    |

---

### 6.11 Transaction List (`/transactions`)

**Purpose:** View all recorded sales and purchase transactions.

**Content:**
- Tabs: All / Sales / Purchases
- Table: Transaction #, Date, Type, Items, Total Amount, Status
- Date range filter
- Search by transaction number

**shadcn Components:**
| Element                | shadcn Component           |
|------------------------|----------------------------|
| Type tabs              | `Tabs`, `TabsList`         |
| Transaction table      | `Table`                    |
| Date filter            | `DatePickerWithRange`      |
| Search                 | `Input`                    |
| Status badge           | `Badge`                    |
| Pagination             | `Pagination`               |

---

### 6.12 New Transaction / POS (`/transactions/new`)

**Purpose:** Create a sales or purchase transaction (cashier-like interface).

**Content:**
- Transaction type toggle: Sale / Purchase
- Product search & add to cart
- Cart table: Product, Unit Price, Quantity, Subtotal, Remove
- Order summary: Subtotal, Total
- Cash tendered input + Change display (for sales)
- Note field
- Confirm Transaction button

**shadcn Components:**
| Element                | shadcn Component                        |
|------------------------|-----------------------------------------|
| Type toggle            | `ToggleGroup`                           |
| Product search         | `Combobox` (live search)                |
| Cart table             | `Table`                                 |
| Quantity input in cart | `Input` (inline editable)               |
| Remove item button     | `Button` (destructive, icon)            |
| Order summary card     | `Card`, `Separator`                     |
| Cash tendered          | `Input` (type number)                   |
| Change display         | Computed label                          |
| Note                   | `Textarea`                              |
| Confirm button         | `Button` (full width, prominent)        |
| Cancel                 | `Button` (outline)                      |

---

### 6.13 Transaction Detail / Invoice (`/transactions/[id]`)

**Purpose:** View the complete details of a transaction.

**Content:**
- Header: Transaction #, Date, Type, Status
- Items table: Product Name, SKU, Qty, Unit Price, Subtotal
- Footer: Total, Cash Tendered (if sale), Change
- Note
- Action: Cancel Transaction (if status = completed) with confirmation
- Print/Export Invoice button

**shadcn Components:**
| Element                | shadcn Component              |
|------------------------|-------------------------------|
| Transaction header     | `Card`                        |
| Items table            | `Table`                       |
| Totals section         | `Separator`, typography       |
| Status badge           | `Badge`                       |
| Cancel action          | `AlertDialog`                 |
| Print/Export           | `Button`                      |

---

### 6.14 Reports (`/reports`)

**Purpose:** Basic analytics and exportable reports.

**Content:**
- Date range picker (global filter for all sections)
- Sales Summary section: total revenue, total transactions, average per transaction
- Top Selling Products table (qty sold, revenue)
- Stock Movement Summary (total in vs. out)
- Purchase Summary (total restocking cost)

**shadcn Components:**
| Element                | shadcn Component            |
|------------------------|-----------------------------|
| Date range             | `DatePickerWithRange`       |
| Metric cards           | `Card`                      |
| Top products table     | `Table`                     |
| Bar chart              | recharts `BarChart` in Card |
| Line chart             | recharts `LineChart`        |
| Export button          | `Button`                    |

---

## 7. Non-Functional Requirements

| Requirement           | Specification                                                         |
|-----------------------|-----------------------------------------------------------------------|
| **Performance**       | Page load < 2s; table renders < 500ms for up to 5,000 products       |
| **Responsiveness**    | Works on desktop and tablet (minimum 768px width)                    |
| **Data Integrity**    | Stock values must never go below 0 (guard at API level)              |
| **Audit Trail**       | All stock changes must produce an immutable movement log record      |
| **Error Handling**    | All forms show inline validation; all API errors show toast messages |
| **Offline**           | Not required in v1.0                                                 |
| **Accessibility**     | Basic ARIA labels; keyboard-navigable forms                          |

---

## 8. Acceptance Criteria (Key)

| Story ID | Criteria                                                                                    |
|----------|---------------------------------------------------------------------------------------------|
| P-01     | Product is saved; `current_stock` equals entered initial stock; movement log entry created  |
| S-01     | Stock In form saves; product `current_stock` increases; `stock_movements` row inserted      |
| S-03     | Adjustment saves; movement row shows type=`adjustment`, before/after values, and reason     |
| T-01     | Sale transaction creates: one `transactions` row + N `transaction_items` + N `stock_movements` (type=`sale`); product stock decremented |
| T-05     | Cancel transaction reverses all stock changes; movement log shows type=`reversal`           |
| D-01     | Dashboard loads and shows accurate real-time counts from DB                                 |
