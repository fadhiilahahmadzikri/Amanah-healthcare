# Product Requirements Document (PRD)

# Private Commerce Operations Platform

## Executive Summary

Following discussions with the client and a reassessment of the business requirements, the product direction has evolved significantly from its original concept.

The application should no longer be viewed primarily as an inventory management system or a traditional point-of-sale platform.

Instead, the product should function as a Private Commerce Operations Platform, conceptually similar to Shopee Seller Center, Tokopedia Seller Dashboard, or Shopify Admin, but designed for a single business operating through its own storefront.

The primary goal is to provide business owners with a centralized environment for managing products, incoming orders, fulfillment workflows, customer activity, financial performance, and operational metrics.

Inventory remains important, but it becomes a supporting subsystem rather than the primary focus.

---

# Product Vision

Enable small and medium-sized businesses to operate a complete commerce workflow from a single dashboard.

The platform should provide a realistic end-to-end order lifecycle:

Customer Order
→ Order Processing
→ Shipping Preparation
→ Shipping Label Generation
→ Invoice Generation
→ Inventory Synchronization
→ Financial Updates
→ Business Analytics

The entire workflow should feel production-ready even though the current implementation is frontend-driven and operates without a backend.

---

# Core Product Modules

## 1. Dashboard Overview

The dashboard becomes the operational command center.

### Key Metrics

* Current Balance
* Total Revenue
* Total Assets
* Inventory Value
* Monthly Revenue
* Monthly Orders
* Pending Orders
* Completed Orders
* Cancelled Orders
* Customer Growth
* Average Order Value
* Fulfillment Rate
* Top Selling Products

### Dashboard Widgets

* Revenue Trends
* Order Activity Timeline
* Recent Orders
* Customer Activity Feed
* Inventory Health
* Product Performance
* Fulfillment Status

The existing dashboard layout should be preserved while updating its content to align with the new business model.

---

## 2. Product Management

### CRUD Operations

Full client-side CRUD support:

* Create Product
* Edit Product
* Delete Product
* Duplicate Product
* Archive Product

### Product Properties

* Product Name
* SKU
* Category
* Cost Price
* Selling Price
* Stock Quantity
* Product Images
* Product Description
* Status

### Inventory Synchronization

Inventory updates automatically when:

* Orders are completed
* Orders are cancelled
* Inventory adjustments occur

Inventory should be treated as a background operational system.

---

## 3. Order Management

This becomes the core feature of the platform.

### Order Lifecycle

New Order
→ Pending
→ Processing
→ Ready To Ship
→ Shipped
→ Delivered
→ Completed

Optional:

→ Cancelled
→ Refunded

### Order Information

* Order Number
* Customer Information
* Product Information
* Quantity
* Order Total
* Shipping Information
* Payment Status
* Fulfillment Status

All calculations should be performed automatically.

---

## 4. Customer Management

### Customer Profiles

* Customer Name
* Phone Number
* Address
* Order History
* Total Spend
* Customer Status

### Customer Analytics

* New Customers
* Returning Customers
* Top Customers
* Lifetime Value

---

## 5. Artificial Customer Simulation

Since no backend currently exists, realistic customer activity should be generated automatically.

### Simulation Engine

Powered by:

* Faker

Simulation events include:

* New Customers
* New Orders
* Repeat Purchases
* Order Cancellations
* Shipping Events

### Configurable Settings

* Event Frequency
* Orders Per Interval
* Customer Growth Rate
* Product Popularity Distribution
* Revenue Targets

Example:

Every 5 minutes:

* Generate 1–5 new customers
* Generate 1–10 new orders
* Generate random purchasing activity

The system should appear operational at all times.

---

## 6. Notification Center

Real-time operational notifications.

Examples:

* New Order Received
* Order Processing Started
* Invoice Generated
* Shipment Prepared
* Payment Confirmed
* Low Inventory Warning

### Notification Sound Effects

Events should trigger subtle sounds similar to operational dashboards used in e-commerce systems.

Suggested Library:

* Howler.js

---

## 7. Shipping & Fulfillment Module

Inspired by modern e-commerce workflows.

### Fulfillment Process

Order Received
→ Pick & Pack
→ Generate Shipping Label
→ Print Label
→ Ship Order

### Shipping Label Generation

The system should generate printable shipping stickers similar to:

* Shopee Labels
* Tokopedia Labels
* Shopify Fulfillment Labels

Label Contents:

* Store Information
* Customer Information
* Shipping Address
* Order Number
* Tracking Number
* QR Code
* Courier Information

### QR-Based Tracking

Every order receives a unique QR code.

Scanning the QR code should reveal:

* Order Information
* Customer Information
* Fulfillment Status
* Tracking Information

Recommended Library:

* qrcode

Alternative:

* react-qr-code

---

## 8. Invoice Generation

Every completed order can generate a printable invoice.

### Invoice Contents

* Invoice Number
* Order Number
* Customer Information
* Product List
* Quantity
* Pricing
* Tax
* Total

### Export Formats

* PDF Download
* Print Invoice

Recommended Library:

* pdf-lib

---

## 9. Financial Module

Automatic financial calculations.

### Metrics

* Balance
* Revenue
* Expenses
* Profit
* Inventory Value
* Cash Flow

Financial data updates automatically when:

* Orders complete
* Refunds occur
* Inventory changes

---

## 10. Reporting Module

Business reporting and analytics.

### Reports

* Sales Report
* Revenue Report
* Product Performance Report
* Inventory Report
* Customer Report
* Fulfillment Report

### Export

* PDF
* CSV

Libraries:

* pdf-lib
* papaparse
