# UX / UI Flows — Phsar Digital

Use this document as the reference when drawing wireframes or writing page-level specs.

---

## 2. Browse Listings (`/products`)

**Goal:** User discovers products without a specific intent.

```
[Navbar — search, cart, save, mode toggle]
  └─ [CategorySidebar — tree of parent/child categories]  |  [Sort dropdown (Newest / Price / Top Rated)]
                                                           |  [ProductGrid — 2–4 col responsive]
                                                               └─ [ProductCard: image, title, price, rating, discount badge, save button]
                                                           |  [Pagination]
```

**Flow:**
1. User lands on `/products` — sees full grid (no category filter).
2. Picks a category in the sidebar → URL becomes `/category/[slug]`, grid re-filters.
3. Changes sort → URL updates (`?sort=price_asc`), grid re-renders.
4. Clicks a card → goes to `/products/[slug]` (detail).
5. Clicks ❤️ → `SavedButton` toggles save (POST `/api/saved`).

---

## 4. Categories (`/category/[slug]`)

**Goal:** Browse all products in a specific category (or subcategory).

```
Same shell as Browse, but:
- CategorySidebar highlights the active category
- Page heading = category.name
- ProductGrid filtered by category_id
```

**Flow:**
1. User arrives from sidebar, navbar link, or home page category block.
2. Can drill into subcategories (child nodes in sidebar).
3. All sort/pagination/save interactions same as Browse.

---

## 5. Search Results

**Goal:** User entered a keyword — see matching products.

```
[Navbar — search input active / query shown]
  └─ [No sidebar OR sidebar visible, category filter optional]
     [Search heading: Results for "…" (N items)]
     [ProductGrid filtered by ?search=query]
     [Pagination]
```

**Flow:**
1. User types in the search bar in the Navbar → submits.
2. Router pushes `/products?search=keyword`.
3. `products/page.tsx` picks up `searchParams.search` → passes to `getListings({ search })`.
4. Empty state: "No results for 'keyword'" + suggest clearing filter.

**Wireframe notes:**
- Search bar opens as an overlay (full-width on mobile) or expands inline on desktop.
- Highlight matched keyword in product titles (optional enhancement).

---

## 7. Login (`/auth/login`)

**Goal:** Returning buyer authenticates.

```
[Centered card, max-w-sm]
  Logo
  "Welcome back"
  Email input
  Password input
  [Login button]
  "Forgot password?" link
  Divider
  "Don't have an account?" → /auth/register
```

**Flow:**
1. User submits form → POST `/api/auth/login`.
2. On success → redirect to `/home` (or the page they came from via `callbackUrl`).
3. On error → show inline error under form.

---

## 8. Register as Buyer (`/auth/register`)

**Goal:** New buyer creates an account.

```
[Centered card, max-w-sm]
  Logo
  "Create your account"
  Full name input
  Email input
  Password input  (show/hide toggle)
  Confirm password input
  [Register button]
  "Already have an account?" → /auth/login
```

**Flow:**
1. Client validates: passwords match, email format.
2. POST `/api/auth/register` with `{ name, email, password, role: "buyer" }`.
3. On success → auto-login and redirect to `/home`.
4. On error (e.g. email taken) → show field-level error.

---

## 10. About (`/about`)

**Goal:** Build trust — who is Phsar Digital, what do we sell, how does it work.

```
[Hero section — headline + sub-copy + optional image]
[Mission / values 3-column grid]
[How it works — 3 steps with icons: Browse → Add to Cart → Checkout]
[Team or seller spotlight (optional)]
[CTA → Browse Products]
```

**Flow:**
Static page — no data fetching. Keep copy short and scannable.

---

## Cross-cutting UX Notes

| Element | Behavior |
|---|---|
| Navbar | Always visible (sticky). Shows search, cart count badge, save count, mode toggle, login/register or user menu. |
| CartDrawer | Slide-in from right on cart icon click. Shows live item count badge. "Proceed to Checkout" button inside. |
| SavedButton | Heart icon on every ProductCard + detail page. Optimistic toggle. Requires auth — redirect to login if not signed in. |
| Empty states | Every list/grid has a meaningful empty state with a CTA. |
| Loading states | Skeleton loaders or spinner for client-fetched data. Server pages stream. |
| Mobile | Sidebar hidden on mobile — categories accessible via a Sheet/drawer triggered by a filter button. |
| Auth guard | Cart, Saved, Checkout redirect to `/auth/login?callbackUrl=…` if unauthenticated. |
