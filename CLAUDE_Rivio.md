# Rivio - Trade Credit Insurance Compliance Platform

## Project Overview

Rivio is a trade credit insurance compliance monitoring application designed to help businesses manage their accounts receivable, track credit limits, monitor overdue invoices, and maintain compliance with trade credit insurance policies.

## Technology Stack

- **Framework**: Next.js 16.0.1 (React 19.2.0)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.17
- **Charts**: Recharts 3.4.1
- **Icons**: Lucide React 0.553.0
- **Build Tool**: Next.js built-in tooling

## Project Structure

```
rivio-app/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard (main page)
│   ├── layout.tsx         # Root layout with navigation
│   ├── globals.css        # Global styles
│   ├── buyers/            # Buyer management page
│   ├── policies/          # Insurance policies page
│   ├── reports/           # Reports and analytics page
│   └── settings/          # Application settings page
├── components/            # Reusable React components
│   └── Navigation.tsx     # Main navigation bar
├── lib/                   # Utility functions and data
│   └── mockData.ts        # Mock data and helper functions
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── next.config.js         # Next.js configuration
└── postcss.config.js      # PostCSS configuration
```

## Core Features

### 1. Dashboard (`app/page.tsx`)
The main dashboard provides an at-a-glance view of:
- **Total Receivables**: Sum of all outstanding invoices
- **Overdue Amount**: Total value of overdue invoices
- **Average Credit Utilization**: Across all buyers
- **Insurance Coverage**: Percentage of receivables that are insured

Key visualizations:
- Pie chart: Insured vs Uninsured Exposure
- Bar chart: Credit Limit Utilization by Buyer
- Table: Recent Overdue Invoices

Critical alerts are displayed when invoices exceed the policy's overdue threshold.

### 2. Navigation (`components/Navigation.tsx`)
Main navigation includes:
- Dashboard: Overview and key metrics
- Buyers: Buyer management and credit limits
- Policies: Insurance policy management
- Reports: Compliance and financial reports
- Settings: Application configuration

### 3. Data Model (`lib/mockData.ts`)

**Buyer Interface**:
- ID, name, country
- Credit limit and current exposure
- Insurance status (insured/uninsured)
- Risk rating (Low/Medium/High)

**Invoice Interface**:
- ID, buyer reference
- Amount and due date
- Status (paid/pending/overdue)
- Days overdue
- Insurance coverage status

**Policy Interface**:
- Insurer details (name, policy number)
- Overdue threshold (90 days)
- Coverage percentage (90%)
- Effective and expiry dates

## Key Business Logic

### Compliance Monitoring
- Tracks invoices against policy overdue thresholds
- Alerts when invoices exceed threshold days (default: 90 days)
- Differentiates between insured and uninsured receivables

### Risk Assessment
- Monitors credit utilization per buyer (current exposure vs credit limit)
- Flags buyers exceeding their credit limits (shown in red on charts)
- Categorizes buyers by risk rating

### Financial Exposure Tracking
- Calculates total insured vs uninsured exposure
- Provides coverage percentage metrics
- Identifies uninsured risk areas

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Current Implementation Status

The application currently uses **mock data** for demonstration purposes. All data is defined in `lib/mockData.ts` and includes:
- 5 sample buyers (various countries and risk ratings)
- 8 sample invoices (mix of paid, pending, and overdue)
- 1 sample insurance policy (Allianz Trade)

## Design Patterns

- **Client Components**: Uses 'use client' directive for interactive components
- **Responsive Design**: Tailwind CSS with mobile-first approach
- **Type Safety**: Full TypeScript coverage with defined interfaces
- **Component Composition**: Modular, reusable components
- **Utility Functions**: Helper functions in mockData.ts for calculations

## Color Coding System

- **Blue**: Primary brand color, general metrics
- **Green**: Positive indicators (insured, low risk)
- **Yellow**: Warning indicators (moderate overdue)
- **Red**: Critical alerts (high risk, exceeds threshold, uninsured)
- **Purple**: Utilization metrics

## Key Metrics Calculations

- **Total Receivables**: Sum of all invoice amounts
- **Total Overdue**: Sum of overdue invoice amounts
- **Average Credit Utilization**: Average of (current exposure / credit limit) across buyers
- **Insurance Coverage %**: (Insured exposure / Total receivables) × 100
- **Critical Invoices**: Invoices with daysOverdue > policy.overdueThreshold

## Future Considerations

This appears to be a test/demo project ("RivioTest2") for experimenting with the Rivio platform. Production implementations would need:
- Real data persistence (database)
- API integration for real-time data
- User authentication and authorization
- Multi-tenant support
- Export functionality for reports
- Integration with accounting systems
- Automated notifications and alerts
- Historical data tracking and trends

## Notes for Development

- The app uses Next.js App Router (not Pages Router)
- All pages are currently client-side rendered ('use client')
- Mock data includes hardcoded dates (2025-11-xx format)
- The project uses Tailwind's custom `card` utility class (defined in globals.css)
- Recharts requires ResponsiveContainer for proper sizing
