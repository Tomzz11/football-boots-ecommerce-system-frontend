# Football Boots Store Frontend

Frontend for an e-commerce football boots store portfolio project. This app focuses on a clean shopping flow, role-aware UI for users and admins, and integration with a separate Express + MongoDB backend.

## Overview

This frontend was built to support a backend-focused portfolio project while still providing a realistic user experience. It includes product browsing, filtering, product detail pages, cart and checkout flow, account features, order tracking, and admin pages for product, order, and inventory management.

## Tech Stack

- React
- Vite
- React Router
- Zustand
- TanStack Query
- Axios
- Tailwind CSS
- Framer Motion
- Lucide React
- React Hot Toast

## Main Features

### Storefront

- Product listing page
- Search, sort, and filtering
- Featured products
- New arrivals
- Related products
- Product detail page with size selection and stock-aware quantity controls
- Cart drawer and cart page
- Checkout flow

### User Features

- Register / login / logout
- Profile management
- Saved addresses
- Default address auto-fill in checkout
- Order history
- Order detail page with timeline, payment status, and tracking number
- Cancel order when allowed by business rules

### Admin Features

- Admin dashboard views
- Product management
- Inventory management
- Low stock and out-of-stock views
- Order management
- Role-aware product detail behavior for admin view

## Business Flow Notes

### Product detail page

- Normal users can select size, adjust quantity, and add items to cart.
- Admin users do not use cart actions on the product detail page.
- Admin view shows stock information instead of cart controls.

### Cart behavior

- Cart is separated by account.
- When a different user logs in, cart ownership is synced and the previous cart is cleared.

### Checkout behavior

- If the logged-in user has a default address, it can be used to auto-fill the shipping form.

## Project Structure

football-boots-ecommerce-system-frontend/
├── public/
│ └── favicon.svg # static public asset
├── src/
│ ├── components/
│ │ ├── auth/
│ │ │ └── ProtectedRoute.jsx # route guard for authenticated / role-based pages
│ │ ├── cart/
│ │ │ └── CartDrawer.jsx # cart sidebar / drawer UI
│ │ ├── layout/
│ │ │ ├── Footer.jsx # footer component
│ │ │ ├── Header.jsx # top navigation / header
│ │ │ └── ScrollToTop.jsx # scroll reset on route change
│ │ ├── product/
│ │ │ ├── GradeBadge.jsx # badge for product grade display
│ │ │ └── ProductCard.jsx # reusable product card component
│ │ └── ui/
│ │ ├── Button.jsx # reusable button component
│ │ ├── Input.jsx # reusable input component
│ │ └── Loading.jsx # loading / spinner UI
│ │
│ ├── hooks/
│ │ ├── useOrders.js # custom hook for order-related logic / fetching
│ │ └── useProducts.js # custom hook for product-related logic / fetching
│ │
│ ├── layouts/
│ │ └── Layout.jsx # main app layout wrapper
│ │
│ ├── lib/
│ │ ├── axios.js # Axios instance / API configuration
│ │ ├── constants.js # shared constants
│ │ └── utils.js # helper / utility functions
│ │
│ ├── pages/
│ │ ├── admin/
│ │ │ ├── AdminDashboard.jsx # admin dashboard page
│ │ │ ├── AdminInventory.jsx # admin inventory management page
│ │ │ ├── AdminLayout.jsx # admin layout / admin route wrapper
│ │ │ ├── AdminOrderDetail.jsx # admin single order detail page
│ │ │ ├── AdminOrders.jsx # admin order management page
│ │ │ ├── AdminProductForm.jsx # create / edit product form page
│ │ │ └── AdminProducts.jsx # admin product management page
│ │ ├── auth/
│ │ │ ├── LoginPage.jsx # login page
│ │ │ └── RegisterPage.jsx # register page
│ │ ├── CheckoutPage.jsx # checkout page
│ │ ├── GradeShowcasePage.jsx # product grade showcase page
│ │ ├── HomePage.jsx # landing / homepage
│ │ ├── OrdersPage.jsx # user order history page
│ │ ├── ProductDetailPage.jsx # single product detail page
│ │ ├── ProductsPage.jsx # product listing page
│ │ ├── ProfilePage.jsx # user profile page
│ │ └── StaticPages.jsx # static informational pages
│ │
│ ├── stores/
│ │ ├── authStore.js # Zustand store for authentication state
│ │ └── cartStore.js # Zustand store for cart state
│ │
│ ├── App.jsx # app routes and top-level app composition
│ ├── index.css # global styles
│ └── main.jsx # application entry point
│
├── .env # local environment variables
├── .env.example # example environment variables
├── .gitignore
├── eslint.config.js # ESLint configuration
├── index.html # Vite HTML entry
├── package-lock.json
├── package.json
├── README.md
├── tailwind.config.js # Tailwind CSS configuration
├── vercel.json # Vercel deployment configuration
└── vite.config.js # Vite configuration

## Important Pages

### Public / user pages

- `/`
- `/products`
- `/products/:id`
- `/cart`
- `/checkout`
- `/orders`
- `/orders/:id`
- `/profile`

### Admin pages

- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`
- `/admin/orders`
- `/admin/orders/:id`
- `/admin/inventory`

## Environment Variables

Create a `.env` file in the frontend repo.

```env
VITE_API_URL=/api
```

If deployed, replace it with your backend API URL, for example:

```env
VITE_API_URL=https://football-boots-ecommerce-system-backend.onrender.com/api
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```

## Backend Connection

This frontend expects a running backend with these main route groups:

- `/api/auth`
- `/api/products`
- `/api/orders`
- `/api/inventory`

Make sure CORS on the backend allows the frontend origin.

## Deployment

Recommended frontend deployment: **Vercel**

### Vercel settings

- Framework: Vite
- Root directory: frontend repo root
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
- `VITE_API_URL=https://football-boots-ecommerce-system-backend.onrender.com/api`

### SPA routing

If needed, add a `vercel.json` file:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

## Demo

- Frontend URL: `https://football-boots-ecommerce-system-fro.vercel.app/`
- Backend API URL: `https://football-boots-ecommerce-system-backend.onrender.com/api`

## Notes for Reviewers

This frontend is part of a portfolio project designed to support a backend developer application. The UI is intentionally practical and centered around real application flow rather than purely visual design.

## Future Improvements

- Enable full frontend review flow for products
- Add richer dashboard charts
- Add better analytics and reporting views
- Add end-to-end tests
