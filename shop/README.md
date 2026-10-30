# Online Store API (`/api/shop`)

E-commerce module for the AAV Dairy customer website. Lives inside the existing server and reuses its
MongoDB connection, JWT secret and staff auth (`middlewares/auth.js`).

```
shop/
  models/        ShopProduct, Order, ShopSettings, ContactMessage   (customers are Users with role "customer")
  controllers/   product, customerAuth, order, payment (Razorpay), adminShop, contact
  middlewares/   customerAuth.js  (accepts the normal /api/auth JWT only when the user's role is "customer")
  utils/         helpers.js (errors, delivery calc), razorpay.js (create order + HMAC verify, no SDK)
  routes.js      mounted in index.js as app.use("/api/shop", ...)  — BEFORE masterDataRoutes
```

## Setup
1. Add to `.env` (see `.env.example`): `CLIENT_URL` must include the website URL; optional `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
2. `npm run seed:shop` — inserts the 9 starter products (re-run safely; `--force` resets them).
3. `npm run dev`.

## Endpoints

**Public**: `GET /config` · `GET /products` · `GET /products/:slug` · `POST /contact`

**Register / login (everyone)**: `POST /api/auth/register` · `POST /api/auth/login` — customer body:
`{ name, email, role: "customer", mobileNumber, password }`. Staff (Doctor/Caretaker/Administrator) are unchanged.
Customers are blocked (403) from all farm APIs; staff tokens are not accepted as customers.

**Customer** (Bearer token of a role "customer" user): `GET|PUT /auth/me` ·
`POST /auth/addresses` · `DELETE /auth/addresses/:id` · `GET /orders/my-orders` · `GET /orders/:id`

**Checkout** (guest or logged in): `POST /orders` · `GET /orders/track/:orderNumber?phone=` ·
`POST /payments/create-order` · `POST /payments/verify`

**Administrator** (staff token, role `Administrator`): `GET /admin/dashboard` · `GET|POST /admin/products` ·
`PUT|DELETE /admin/products/:id` · `GET /admin/orders` (filters: status, from, to, q, page) · `GET /admin/orders/:id` ·
`PATCH /admin/orders/:id/status` · `GET /admin/customers` · `GET|PUT /admin/settings` · `GET /admin/messages`

## Security rules built in
- Order totals are **always recalculated from DB prices**; prices sent by the browser are ignored.
- Stock is reserved atomically when an order is placed and returned if the order fails or is cancelled.
- Delivery PIN codes, slots and COD availability are validated on the server.
- Online orders are marked **paid only after Razorpay signature verification** — admins can’t set them paid by hand.
- Customer passwords are bcrypt-hashed; login/register/contact are rate-limited per IP.
