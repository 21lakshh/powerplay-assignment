# Invoice Management Application

A full-stack invoice management dashboard built with React, NestJS, and MongoDB.

## Quick Start

```bash
docker compose up
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api
- **MongoDB:** localhost:27017

On first startup, the backend automatically seeds 61 customers and 2,000 invoices from `seed-data.json`. Subsequent restarts skip seeding.

## Tech Stack

| Layer    | Technology                                              |
| -------- | ------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Recharts |
| Backend  | NestJS 11, TypeScript, Mongoose                         |
| Database | MongoDB 7                                               |
| Infra    | Docker Compose                                          |

## Features

- **Invoice CRUD** — create, edit, and view invoices with auto-computed tax and totals
- **Sortable columns** — click Amount, Total, Issue Date, or Due Date headers to sort ascending/descending
- **Inline status update** — click any status badge in the table to change it directly without opening the edit modal
- **Search and filters** — search by invoice ID or customer name, filter by status, tax rate, and date ranges
- **Customer profiles** — click a customer name to see their billing summary, status breakdown, and invoice history
- **Summary dashboard** — stat cards, status breakdown donut chart, monthly revenue trend chart, and top customers by value
- **Dark mode** — toggle between light and dark themes (persisted in localStorage, respects system preference on first visit)
- **Responsive** — adapts to mobile, tablet, and desktop viewports
- **Skeleton loading** — every page shows a skeleton placeholder while data is loading

## Data Modeling

### Two-collection normalized design

**Why not a single embedded collection?**

Each customer is associated with exactly one company (1:1 mapping, 61 unique customers across 2,000 invoices). Embedding customer/company data on every invoice would:

1. Duplicate the same customer name and company across 22–44 invoice documents each
2. Create inconsistency risk if only some invoices get updated
3. Still require aggregation for customer profile metrics

**Customers collection:**

| Field     | Type   | Notes          |
| --------- | ------ | -------------- |
| `name`    | String | Unique, indexed |
| `company` | String | Required       |

**Invoices collection:**

| Field        | Type     | Notes                                  |
| ------------ | -------- | -------------------------------------- |
| `invoiceId`  | String   | Unique, indexed (e.g. `INV-6598015`)  |
| `customerId` | ObjectId | References Customer, indexed           |
| `amount`     | Number   | Pre-tax base amount                    |
| `taxRate`    | Number   | Enum: 0, 3, 5, 18, 28                 |
| `tax`        | Number   | Computed: amount × taxRate / 100       |
| `total`      | Number   | Computed: amount + tax                 |
| `status`     | String   | Enum: Paid, Unpaid, Overdue, Draft, Sent, Void |
| `issueDate`  | Date     | Indexed                                |
| `dueDate`    | Date     | Indexed                                |

**Indexes:** `invoiceId` (unique), `customerId`, `issueDate`, `dueDate`, compound `{customerId, status}` for customer profile queries.

## API Endpoints

| Method | Endpoint             | Description                          |
| ------ | -------------------- | ------------------------------------ |
| GET    | `/api/invoices`      | Paginated list with sort and filter  |
| POST   | `/api/invoices`      | Create invoice                       |
| PATCH  | `/api/invoices/:id`  | Update invoice                       |
| GET    | `/api/customers`     | List all customers                   |
| GET    | `/api/customers/:id` | Customer profile with metrics        |
| GET    | `/api/summary`       | Dashboard summary with charts data   |

### Invoice list query parameters

| Param           | Type   | Description                     |
| --------------- | ------ | ------------------------------- |
| `page`          | number | Page number (default: 1)        |
| `limit`         | number | Page size (default: 20, max: 100) |
| `sortBy`        | string | `amount`, `dueDate`, `issueDate`, `total` |
| `sortOrder`     | string | `asc` or `desc`                 |
| `status`        | string | Filter by status                |
| `search`        | string | Search invoice ID or customer   |
| `taxRate`       | number | Filter by tax rate              |
| `issueDateFrom` | string | ISO date range start            |
| `issueDateTo`   | string | ISO date range end              |
| `dueDateFrom`   | string | ISO date range start            |
| `dueDateTo`     | string | ISO date range end              |

### Summary endpoint response

`GET /api/summary` returns:

- `stats` — totalBilled, totalTax, invoiceCount, customerCount
- `topCustomers` — top 5 by revenue (name, company, revenue)
- `statusBreakdown` — count and total per invoice status
- `monthlyRevenue` — revenue and invoice count grouped by month

## Development Without Docker

### Prerequisites

- Node.js 22+
- pnpm
- MongoDB running locally on port 27017

### Backend

```bash
cd backend
pnpm install
pnpm start:dev
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Run Tests

```bash
cd backend
pnpm test
```

## Docker

### Services

The `docker-compose.yml` defines three services:

- **mongo** — MongoDB 7 with a named volume (`mongo-data`) for persistence
- **backend** — NestJS dev server with bind-mounted `src/` for hot reload and `seed-data.json` mounted read-only
- **frontend** — Vite dev server with bind-mounted `src/` for HMR

### Adding new packages

The Docker containers install dependencies at build time. Source code is bind-mounted for hot reload, but `node_modules` lives inside the container. After adding a new package, rebuild the relevant service:

```bash
# After adding a frontend package
docker compose up --build frontend

# After adding a backend package
docker compose up --build backend
```

Without `--build`, Docker reuses the cached image with the old dependencies.

## Assumptions

1. Customer-to-company mapping is strictly 1:1 and immutable
2. Invoice IDs follow `INV-XXXXXXX` format (7-digit random)
3. Tax rates are fixed at 0%, 3%, 5%, 18%, 28%
4. The six statuses (Paid, Unpaid, Overdue, Draft, Sent, Void) are fixed enums
5. Tax and total are computed server-side from amount and taxRate on create/update
6. "Outstanding" is defined as the sum of invoices with status Unpaid, Overdue, or Sent
