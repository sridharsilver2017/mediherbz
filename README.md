# Mediherbz E-Commerce Platform Architecture & Deployment Guide

## 1. Overview
- **Brand**: Mediherbz
- **Tagline**: *For Young & Vibrant Look*
- **Frontend Architecture**: React 18, Vite, TypeScript, Tailwind CSS v4, Zustand, React Router v6, TanStack Query, React Hook Form, Zod.
- **Backend Architecture**: WordPress 6.x + WooCommerce + Custom Headless Plugin (`mediherbz-core`) + Razorpay.

---

## 2. Brand Visual Identity & Assets
- **Primary Green**: `#18833B`
- **Deep Green**: `#12632F`
- **Lime Accent**: `#A6C928`
- **Secondary Orange**: `#F28A13`
- **Cream Background**: `#FAF9F2`
- **Text Color**: `#26352A`

Brand asset outputs generated in `frontend/public/brand/`:
- `mediherbz-logo.png`: Transparent official logo
- `logo-header.png`: Header navigation variant
- `logo-footer.png`: Footer navigation variant
- `favicon.ico` & `favicon-32x32.png`: High-resolution favicons
- `pwa-512.png` & `/icons/icon-192x192.png`: PWA manifest icons
- `social-share.jpg`: 1200x630 OpenGraph social preview card

---

## 3. Frontend Architecture (`frontend/`)
### Build & Run
```bash
cd frontend
npm install
npm run dev     # Starts local preview on http://localhost:3000
npm run build   # Production bundle to /dist
```

### Storefront Routes
- `/`: Hero banner, categorized collections, signature formulations, testimonials, why Mediherbz, educational blog, newsletter.
- `/shop`: Filterable product catalogue with dynamic category switching, sorting, price filtering.
- `/product/:slug`: Interactive gallery, variation selector, full botanical breakdown, Kshir Pak process, directions, and AYUSH regulatory details.
- `/cart`: Slide-over cart drawer & full cart page with dynamic free shipping progress bar, promo coupons.
- `/checkout`: Address capture with Zod validation, order summary, and Razorpay gateway.
- `/track-order`: Real-time order status, waybill carrier integration, and milestone visualization.
- `/wishlist`: Persistent customer wishlist with instant move-to-cart capability.
- `/about`: Brand story, Kshir Pak heritage, and botanical purity pledges.
- `/blog`: Educational wellness journal on Ayurvedic lifestyle.
- `/contact`: Direct contact form and lab addresses.

---

## 4. WordPress Custom Plugin (`backend/wp-content/plugins/mediherbz-core/`)
### Directory Structure
```
mediherbz-core/
├── mediherbz-core.php
├── includes/
│   └── class-mediherbz-activator.php
├── admin/
│   └── class-mediherbz-admin-settings.php
├── product-fields/
│   └── class-mediherbz-product-fields.php
├── api/
│   └── class-mediherbz-rest-api.php
├── integrations/
│   └── razorpay/
│       └── class-mediherbz-razorpay.php
├── security/
│   └── class-mediherbz-security.php
└── uninstall.php
```

### Custom REST API Namespace: `/wp-json/mediherbz/v1/`
- `GET /health`: Health check and system verification.
- `GET /settings`: Brand settings, color tokens, and contact info.
- `GET /categories`: Dynamic WooCommerce herbal categories.
- `GET /products`: Paginated, filtered, and searched herbal products.
- `GET /products/slug/{slug}`: Single product data with herbal metadata.
- `POST /razorpay/create-order`: Server-side authenticated order generation.
- `POST /razorpay/verify-payment`: Cryptographic HMAC SHA256 signature verification and order creation.
- `GET /orders/track`: Secure waybill and order status lookup.

---

## 5. Cloudflare Pages Deployment (Frontend)
1. Push repository to GitHub/GitLab.
2. In Cloudflare Pages dashboard:
   - Framework preset: `Vite`
   - Build command: `cd frontend && npm run build`
   - Build output directory: `frontend/dist`
   - Environment variables:
     - `VITE_WP_API_URL`: `https://api.mediherbz.com/wp-json/mediherbz/v1`
     - `VITE_RAZORPAY_KEY_ID`: `[YOUR_LIVE_RAZORPAY_KEY]`
     - `VITE_SITE_URL`: `https://www.mediherbz.com`

