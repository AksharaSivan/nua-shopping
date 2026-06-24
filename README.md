# NuaShop - Mini E-Commerce Web App

A production-ready, highly polished mini e-commerce web application built with **React 19**, **Vite**, **TypeScript**, and **Sass/SCSS Modules**. The application connects to the [Fake Store API](https://fakestoreapi.com) and persists shop items and navigation state locally.

## Features & Implementation

1. **Product Listing Page (`/`)**:
   - Fetches products from Fake Store API.
   - Elegant category tab selection (All, Clothing, Electronics, Jewelery) and real-time client-side search.
   - Shimmer skeleton loading grids during initial page fetch to eliminate visual layout shifts.
   - Localized "Quick Add to Cart" spinner buttons directly on cards that query and verify variant stock levels.

2. **Product Detail Page (`/product/:id`)**:
   - Deep-linked variant selectors (Color & Size) synchronized in real-time with URL parameters (e.g. `?color=Matte%20Black&size=Standard`).
   - Interactive zoom/crop image gallery matching the active variant color-tint using hardware-accelerated CSS filter rules.
   - Out-of-stock and low-stock indicators for variant combinations.
   - Dynamic quantity selector capped by stock levels, automatically disabling when a variant is fully sold out.

3. **Cart Drawer**:
   - Frosted-glass panel drawer sliding smoothly from the right.
   - Itemized list displaying quantities, color swatches, sizes, prices, and trash controls.
   - Bill summary calculation featuring a free-shipping promo progress tracker (free shipping on orders over \$100).
   - Local storage persistence to survive browser refreshes.

4. **Testing Suite**:
   - Detailed unit tests in Vitest and React Testing Library covering variant stock selection, quantity boundaries, and CTA disabled states under mock API conditions.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:
```bash
npm run dev
```

### Running Tests

Run the Vitest test suite:
```bash
npm run test
```

### Building for Production

Compile TypeScript and build the production bundle:
```bash
npm run build
```

The output will be generated in the `dist/` directory.

---

## Design Decisions & Trade-Offs

For a detailed review of all architectural choices, state management justifications, and URL synchronization rules, please refer to the [DECISIONS.md](./DECISIONS.md) file in the root of this project.
