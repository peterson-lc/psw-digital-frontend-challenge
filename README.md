[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=peterson-lc_psw-digital-frontend-challenge&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=peterson-lc_psw-digital-frontend-challenge)

# PSW Digital Frontend Challenge

A Next.js frontend application built as part of a coding challenge. It features user authentication, a holidays management page with search, filtering, and sorting powered by a backend API, and placeholder tab pages for future content.

## Tech Stack / Libraries

| Library / Tool | Version | Purpose |
| --- | --- | --- |
| [Next.js](https://nextjs.org) | 16.1.6 | React framework (App Router) |
| [React](https://react.dev) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org) | ^5 | Static typing |
| [Tailwind CSS](https://tailwindcss.com) | ^4 | Utility-first CSS styling |
| [react-datepicker](https://reactdatepicker.com) | ^9.1.0 | Date picker component |
| [ESLint](https://eslint.org) | ^9 | Code linting |

## Prerequisites

- **Node.js** — version 18.18 or later (required by Next.js 16)
- **npm** — comes bundled with Node.js

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/peterson-lc/psw-digital-frontend-challenge.git
cd psw-digital-frontend-challenge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
```

### 5. Start the production server

```bash
npm start
```

### 6. Lint the code

```bash
npm run lint
```

## Project Structure

```
├── app/                        # Next.js App Router pages and API routes
│   ├── api/
│   │   ├── auth/login/         # POST /api/auth/login — authentication proxy
│   │   └── holidays/[year]/    # GET  /api/holidays/{year} — holidays proxy (forwards query params)
│   ├── feriados/               # /feriados — holidays management page
│   ├── login/                  # /login — authentication page
│   ├── tela-a/                 # /tela-a — placeholder tab page
│   ├── tela-b/                 # /tela-b — placeholder tab page
│   ├── tela-c/                 # /tela-c — placeholder tab page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (redirects to /feriados)
│   └── globals.css             # Global styles (Tailwind)
├── components/                 # Reusable React components
│   ├── dashboard-shell.tsx     # Authenticated layout shell with header
│   ├── dashboard-tabs.tsx      # Tab navigation between pages
│   ├── holidays-page.tsx       # Holidays list with search, filters, and sorting
│   ├── placeholder-tab-page.tsx# Generic placeholder for tab pages
│   └── protected-view.tsx      # Auth guard wrapper (checks session in localStorage)
├── lib/                        # Shared utilities and API helpers
│   ├── api.ts                  # Client-side API functions with request deduplication
│   ├── auth.ts                 # Session storage helpers (localStorage)
│   ├── holidays.ts             # Holiday formatting and type utilities
│   └── server-api.ts           # Server-side API helpers for Route Handlers
├── public/                     # Static assets
├── swagger.json                # Backend API contract reference
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```
